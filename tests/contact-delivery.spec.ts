import { createHmac } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { postContact } from './support/contact';
import { startFeishuStub, type FeishuStub } from './support/feishu-stub';
import { startTestServer, type TestServer } from './support/server';
import { startSmtpSink, type SmtpSink } from './support/smtp-sink';

const contactToEmail = 'leads@seqtura.test';
const contactFromEmail = 'Seqtura AI <no-reply@seqtura.test>';
const feishuSecret = 'test-feishu-secret';
const needText = '我们有一条客服工单流程，希望评估 Agent 是否适合接入，并给出第一步建议。';

function headerValue(raw: string, name: string): string | undefined {
  const match = raw.match(new RegExp(`^${name}:\\s*(.+)$`, 'im'));
  return match?.[1]?.trim();
}

function decodeQuotedPrintable(value: string): string {
  const unfolded = value.replace(/=\r?\n/g, '');
  const bytes: number[] = [];
  for (let index = 0; index < unfolded.length; index += 1) {
    const hex = unfolded.slice(index + 1, index + 3);
    if (unfolded[index] === '=' && /^[0-9a-f]{2}$/i.test(hex)) {
      bytes.push(Number.parseInt(hex, 16));
      index += 2;
    } else {
      bytes.push(unfolded.charCodeAt(index));
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

function messageBody(raw: string): string {
  const separator = raw.search(/\r?\n\r?\n/);
  return decodeQuotedPrintable(separator === -1 ? raw : raw.slice(separator).trimStart());
}

test.describe.configure({ mode: 'serial' });

test.describe('lead delivery providers', () => {
  test.setTimeout(180_000);

  let feishu: FeishuStub;
  let smtp: SmtpSink;
  let feishuOk: TestServer;
  let emailOk: TestServer;
  let bothFail: TestServer;
  let testMode: TestServer;
  let rateLimit: TestServer;
  let timeout: TestServer;

  test.beforeAll(async () => {
    feishu = await startFeishuStub();
    smtp = await startSmtpSink();

    const emailEnv = {
      EMAIL_PROVIDER: 'smtp',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(smtp.port),
      SMTP_SECURE: 'false',
      CONTACT_TO_EMAIL: contactToEmail,
      CONTACT_FROM_EMAIL: contactFromEmail,
    };

    feishuOk = await startTestServer(4470, {
      FORM_MODE: 'live',
      FEISHU_WEBHOOK_URL: `${feishu.url}/webhook/ok`,
      FEISHU_WEBHOOK_SECRET: feishuSecret,
      ...emailEnv,
      SMTP_PORT: '1',
    });

    emailOk = await startTestServer(4471, {
      FORM_MODE: 'live',
      FEISHU_WEBHOOK_URL: `${feishu.url}/webhook/fail`,
      ...emailEnv,
    });

    bothFail = await startTestServer(4472, {
      FORM_MODE: 'live',
      FEISHU_WEBHOOK_URL: `${feishu.url}/webhook/fail`,
      ...emailEnv,
      SMTP_PORT: '1',
    });

    testMode = await startTestServer(4473, {
      FORM_MODE: 'test',
      FEISHU_WEBHOOK_URL: `${feishu.url}/webhook/ok`,
      ...emailEnv,
    });

    rateLimit = await startTestServer(4474, {
      FORM_MODE: 'live',
      FEISHU_WEBHOOK_URL: `${feishu.url}/webhook/ok`,
      ...emailEnv,
      SMTP_PORT: '1',
    });

    timeout = await startTestServer(4475, {
      FORM_MODE: 'live',
      FEISHU_WEBHOOK_URL: `${feishu.url}/webhook/hang`,
      ...emailEnv,
      SMTP_PORT: '1',
    });
  });

  test.afterAll(async () => {
    await Promise.all([
      feishuOk?.stop(),
      emailOk?.stop(),
      bothFail?.stop(),
      testMode?.stop(),
      rateLimit?.stop(),
      timeout?.stop(),
    ]);
    await smtp?.close();
    await feishu?.close();
  });

  test.beforeEach(() => {
    feishu.reset();
    smtp.reset();
  });

  test('delivers a signed interactive Feishu card when email fails', async ({ request }) => {
    const response = await postContact(request, { baseURL: feishuOk.baseURL });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    expect(feishu.requests).toHaveLength(1);
    const sent = feishu.requests[0];
    expect(sent.path).toBe('/webhook/ok');
    expect(sent.body.msg_type).toBe('interactive');

    const timestamp = Number(sent.body.timestamp);
    const nowSeconds = Math.floor(Date.now() / 1000);
    expect(Number.isInteger(timestamp)).toBe(true);
    expect(Math.abs(timestamp - nowSeconds)).toBeLessThan(60);

    const expectedSign = createHmac('sha256', `${timestamp}\n${feishuSecret}`)
      .update('')
      .digest('base64');
    expect(sent.body.sign).toBe(expectedSign);

    const serialized = JSON.stringify(sent.body);
    for (const value of [
      '张明',
      '序构测试制造有限公司',
      'zhangming@example.com',
      needText,
      '微信：zhangming-work',
      'consent',
      'consentAt',
      '2026-11-16T08:00:00.000Z',
      'privacyVersion',
      '1.0',
    ]) {
      expect(serialized, value).toContain(value);
    }
    expect(serialized).toContain('consent: true');
  });

  test('delivers email with the submitter as reply-to when Feishu fails', async ({ request }) => {
    const response = await postContact(request, { baseURL: emailOk.baseURL });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    await expect.poll(() => smtp.messages.length).toBe(1);
    const message = smtp.messages[0];
    expect(message.from).toBe('no-reply@seqtura.test');
    expect(message.to).toEqual([contactToEmail]);

    const replyTo = headerValue(message.raw, 'Reply-To');
    expect(replyTo).toContain('zhangming@example.com');
    expect(headerValue(message.raw, 'To')).toContain(contactToEmail);
    expect(headerValue(message.raw, 'From')).toContain('no-reply@seqtura.test');

    const body = messageBody(message.raw);
    for (const value of [
      '张明',
      '序构测试制造有限公司',
      needText,
      '2026-11-16T08:00:00.000Z',
      '1.0',
      'consent',
    ]) {
      expect(body, value).toContain(value);
    }
  });

  test('returns 502 and logs no PII when both channels fail', async ({ request }) => {
    const response = await postContact(request, { baseURL: bothFail.baseURL });

    expect(response.status()).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: 'delivery_failed' });

    await expect.poll(() => bothFail.output()).toContain('contact.delivery_failed');
    const output = bothFail.output();
    expect(output).toContain('requestId');
    expect(output).toContain('"status":502');
    for (const pii of [
      '张明',
      'zhangming@example.com',
      '序构测试制造有限公司',
      needText,
      'zhangming-work',
    ]) {
      expect(output, pii).not.toContain(pii);
    }
  });

  test('FORM_MODE=test returns 200 without calling either provider', async ({ request }) => {
    const response = await postContact(request, { baseURL: testMode.baseURL });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(feishu.requests).toHaveLength(0);
    expect(smtp.messages).toHaveLength(0);
  });

  test('returns 429 with Retry-After after five requests in the default live window', async ({
    request,
  }) => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const accepted = await postContact(request, { baseURL: rateLimit.baseURL });
      expect(accepted.status(), `attempt ${attempt + 1}`).toBe(200);
    }

    const limited = await postContact(request, { baseURL: rateLimit.baseURL });
    expect(limited.status()).toBe(429);
    expect(await limited.json()).toEqual({ ok: false, error: 'rate_limited' });
    expect(Number(limited.headers()['retry-after'])).toBeGreaterThan(0);
    expect(Number(limited.headers()['retry-after'])).toBeLessThanOrEqual(3600);
  });

  test('times out a hanging channel at five seconds and still answers', async ({ request }) => {
    const started = Date.now();
    const response = await postContact(request, { baseURL: timeout.baseURL });
    const elapsed = Date.now() - started;

    expect(response.status()).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: 'delivery_failed' });
    expect(elapsed).toBeGreaterThanOrEqual(4_800);
    expect(elapsed).toBeLessThan(9_000);

    await expect.poll(() => timeout.output()).toContain('"reason":"timeout"');
  });
});
