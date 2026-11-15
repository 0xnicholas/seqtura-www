import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const origin = `http://127.0.0.1:${Number(process.env.PORT ?? 4321)}`;

const validPayload = (overrides: Record<string, unknown> = {}) => ({
  name: '张明',
  company: '序构测试制造有限公司',
  email: 'zhangming@example.com',
  need: '我们有一条客服工单流程，希望评估 Agent 是否适合接入，并给出第一步建议。',
  wechatPhone: '微信：zhangming-work',
  consent: true,
  consentAt: '2026-11-16T08:00:00.000Z',
  privacyVersion: '1.0',
  website: '',
  startedAt: Date.now() - 10_000,
  ...overrides,
});

async function postContact(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return request.post('/api/contact', {
    data: validPayload(overrides),
    headers: { origin, 'content-type': 'application/json', ...headers },
  });
}

test.describe('contact page structure', () => {
  test('has the hero, booking form, channels and about sections', async ({ page }) => {
    const response = await page.goto('/contact');

    expect(response?.status()).toBe(200);
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('先聊一个具体场景。');
    await expect(main).toContainText(
      '30 分钟，围绕一个具体业务场景，给出值不值得做、下一步是什么的判断。',
    );
    await expect(main).toContainText('提交后，我们会通过你留下的邮箱或微信联系你。');

    await expect(page.locator('#book')).toHaveCount(1);
    await expect(page.locator('#channels')).toHaveCount(1);
    await expect(page.locator('#about')).toHaveCount(1);
    await expect(page.locator('#book form')).toHaveCount(1);
    await expect(page.locator('#book').getByRole('heading', { level: 2 })).toContainText(
      '预约 30 分钟沟通',
    );
  });

  test('asks for the agreed fields and no time preference or contact-method choice', async ({
    page,
  }) => {
    await page.goto('/contact');

    const form = page.locator('#book form');
    await expect(form.getByLabel('姓名', { exact: true })).toBeVisible();
    await expect(form.getByLabel('公司', { exact: true })).toBeVisible();
    await expect(form.getByLabel('邮箱', { exact: true })).toBeVisible();
    await expect(form.getByLabel('需求描述', { exact: true })).toBeVisible();
    await expect(form.getByLabel('微信 / 电话（选填）', { exact: true })).toBeVisible();
    await expect(form.getByRole('checkbox')).toHaveCount(1);
    await expect(form.getByRole('button', { name: '提交预约' })).toBeVisible();

    const text = await form.innerText();
    expect(text).not.toContain('方便沟通的时间');
    expect(text).not.toContain('二选一');
    expect(text).not.toContain('联系方式（微信或邮箱）');
  });

  test('lists the three contact channels and the company facts', async ({ page }) => {
    await page.goto('/contact');

    const channels = page.locator('#channels');
    await expect(channels.getByRole('heading', { level: 2 })).toHaveText('其他通道');
    await expect(channels.getByRole('heading', { level: 3 })).toHaveText(['微信', '飞书', '邮箱']);
    await expect(channels.getByRole('link', { name: 'hello@seqtura.ai' }).first()).toHaveAttribute(
      'href',
      'mailto:hello@seqtura.ai',
    );

    const about = page.locator('#about');
    await expect(about.getByRole('heading', { level: 2 })).toHaveText('关于我们');
    await expect(about).toContainText(
      'Seqtura AI（序构 AI）为企业定制 AI Agent，把业务场景从评估做到生产上线。',
    );
    await expect(about).toContainText('我们相信：先把验收标准定下来，再开始构建。');
  });

  test('production copy carries no preview sentinels', async ({ page }) => {
    await page.goto('/contact');

    const bodyText = await page.locator('body').innerText();
    for (const sentinel of ['【', '待补', '占位', 'example']) {
      expect(bodyText, sentinel).not.toContain(sentinel);
    }
  });

  test('ships external scripts so the strict CSP can keep script-src self', async ({ page }) => {
    await page.goto('/contact');

    const inlineExecutable = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script'))
        .filter((script) => !script.src)
        .filter((script) => (script.type || 'text/javascript') === 'text/javascript')
        .map((script) => script.textContent?.slice(0, 80) ?? ''),
    );
    expect(inlineExecutable).toEqual([]);
  });
});

test.describe('POST /api/contact contract', () => {
  test('accepts a valid lead in test mode without delivering', async ({ request }) => {
    const response = await postContact(request);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers()['cache-control']).toContain('no-store');
  });

  test('returns field errors for invalid values', async ({ request }) => {
    const response = await postContact(request, {
      name: '',
      company: 'x'.repeat(81),
      email: 'not-an-email',
      need: '太短',
      wechatPhone: 'x'.repeat(41),
      consent: false,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('validation');
    expect(Object.keys(body.fields)).toEqual(
      expect.arrayContaining(['name', 'company', 'email', 'need', 'wechatPhone', 'consent']),
    );
  });

  test('returns 200 without validation when the honeypot is filled', async ({ request }) => {
    const response = await postContact(request, {
      website: 'https://spam.example',
      name: '',
      email: '',
      consent: false,
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test('rejects a submission faster than three seconds with a generic error', async ({
    request,
  }) => {
    const response = await postContact(request, { startedAt: Date.now() });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('validation');
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain('3 秒');
    expect(serialized).not.toContain('三秒');
    expect(serialized).not.toContain('太快');
  });

  test('rejects bodies over 16 KB with 413', async ({ request }) => {
    const response = await postContact(request, { need: 'x'.repeat(17_000) });

    expect(response.status()).toBe(413);
    expect(await response.json()).toEqual({ ok: false, error: 'payload_too_large' });
  });

  test('rejects a foreign origin with 403', async ({ request }) => {
    const response = await postContact(request, {}, { origin: 'https://evil.example' });

    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: 'origin' });
  });

  test('accepts a request without an origin header', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: validPayload(),
      headers: { 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(200);
  });

  test('rejects malformed JSON as a validation error', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: '{"name":',
      headers: { origin, 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('validation');
  });

  test('requires consentAt, privacyVersion and startedAt', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: '张明',
        company: '序构测试制造有限公司',
        email: 'zhangming@example.com',
        need: '我们有一条客服工单流程，希望评估 Agent 是否适合接入。',
        consent: true,
        website: '',
      },
      headers: { origin, 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.fields).toEqual(
      expect.objectContaining({
        consentAt: expect.any(String),
        privacyVersion: expect.any(String),
        startedAt: expect.any(String),
      }),
    );
  });
});

const needText = '我们有一条客服工单流程，希望评估 Agent 是否适合接入，并给出第一步建议。';

async function setStartedAt(page: Page, millisecondsAgo = 10_000): Promise<void> {
  await page.evaluate((ago: number) => {
    const input = document.querySelector<HTMLInputElement>('input[name="startedAt"]');
    if (input) input.value = String(Date.now() - ago);
  }, millisecondsAgo);
}

async function fillValidForm(page: Page, { consent = true } = {}): Promise<void> {
  const form = page.locator('[data-contact-form]');
  await form.getByLabel('姓名', { exact: true }).fill('张明');
  await form.getByLabel('公司', { exact: true }).fill('序构测试制造有限公司');
  await form.getByLabel('邮箱', { exact: true }).fill('zhangming@example.com');
  await form.getByLabel('需求描述', { exact: true }).fill(needText);
  if (consent) await form.getByRole('checkbox').check();
  await setStartedAt(page);
}

test.describe('contact form validation and consent', () => {
  test('renders the exact consent copy with a new-tab privacy link, unchecked by default', async ({
    page,
  }) => {
    await page.goto('/contact');

    const form = page.locator('[data-contact-form]');
    const checkbox = form.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();

    const note = form.locator('#contact-consent-note');
    await expect(note).toHaveText('你的信息仅用于回复咨询，不会用于营销推送。');

    const label = form.locator('.consent-label');
    await expect(label).toContainText(
      '我已阅读并同意《隐私政策》，同意 Seqtura 为回复我的咨询处理上述信息。',
    );

    const link = label.getByRole('link', { name: '《隐私政策》' });
    await expect(link).toHaveAttribute('href', '/legal/privacy');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener');

    const notePrecedesLabel = await note.evaluate((element) => {
      const next = element.nextElementSibling;
      return next?.classList.contains('consent-label') ?? false;
    });
    expect(notePrecedesLabel).toBe(true);
  });

  test('blocks an empty submission, shows a summary and focuses the first invalid field', async ({
    page,
  }) => {
    await page.goto('/contact');
    let requests = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/contact')) requests += 1;
    });

    await page.locator('[data-contact-submit]').click();

    const summary = page.locator('[data-form-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('请检查以下内容：');

    const name = page.getByLabel('姓名', { exact: true });
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-describedby', 'contact-name-error');
    await expect(page.locator('#contact-name-error')).toHaveText('请输入姓名。');
    await expect(page.locator('#contact-company-error')).toHaveText('请输入公司名称。');
    await expect(page.locator('#contact-email-error')).toHaveText('请输入邮箱。');
    await expect(page.locator('#contact-need-error')).toHaveText('需求描述至少 10 个字符。');
    await expect(page.locator('#contact-consent-error')).toHaveText('请阅读并同意隐私政策。');
    await expect(page.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');

    await expect(summary.getByRole('link')).toHaveCount(5);
    await expect(summary).toContainText('姓名：请输入姓名。');
    expect(requests).toBe(0);
    expect(page.url()).toMatch(/\/contact$/);
  });

  test('validates email format, need length and field maximums inline', async ({ page }) => {
    await page.goto('/contact');

    const form = page.locator('[data-contact-form]');
    await expect(form.getByLabel('姓名', { exact: true })).toHaveAttribute('maxlength', '40');
    await expect(form.getByLabel('公司', { exact: true })).toHaveAttribute('maxlength', '80');
    await expect(form.getByLabel('邮箱', { exact: true })).toHaveAttribute('maxlength', '254');
    await expect(form.getByLabel('微信 / 电话（选填）', { exact: true })).toHaveAttribute(
      'maxlength',
      '40',
    );

    await form.getByLabel('姓名', { exact: true }).fill('张明');
    await form.getByLabel('公司', { exact: true }).fill('序构测试制造有限公司');
    await form.getByLabel('邮箱', { exact: true }).fill('not-an-email');
    await form.getByLabel('需求描述', { exact: true }).fill('太短');
    await form.getByRole('checkbox').check();
    await setStartedAt(page);

    await page.locator('[data-contact-submit]').click();

    await expect(form.getByLabel('邮箱', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-email-error')).toHaveText('请输入有效的邮箱地址。');
    await expect(page.locator('#contact-need-error')).toHaveText('需求描述至少 10 个字符。');
    await expect(form.getByLabel('邮箱', { exact: true })).toBeFocused();

    await form.getByLabel('邮箱', { exact: true }).fill('zhangming@example.com');
    await form
      .getByLabel('需求描述', { exact: true })
      .evaluate((element) => element.removeAttribute('maxlength'));
    await form.getByLabel('需求描述', { exact: true }).fill('x'.repeat(2001));
    await page.locator('[data-contact-submit]').click();
    await expect(page.locator('#contact-need-error')).toHaveText('需求描述不超过 2000 个字符。');
  });

  test('blocks submission until consent is checked and keeps the error inline', async ({
    page,
  }) => {
    await page.goto('/contact');
    await fillValidForm(page, { consent: false });

    await page.locator('[data-contact-submit]').click();

    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    await expect(checkbox).toHaveAttribute(
      'aria-describedby',
      'contact-consent-note contact-consent-error',
    );
    await expect(page.locator('#contact-consent-error')).toHaveText('请阅读并同意隐私政策。');
    await expect(page.locator('[data-contact-success]')).toBeHidden();
    expect(page.url()).toMatch(/\/contact$/);
  });

  test('submits with the keyboard and replaces the form with the success state', async ({
    page,
  }) => {
    await page.goto('/contact');
    await setStartedAt(page);

    await page.getByLabel('姓名', { exact: true }).focus();
    await page.keyboard.type('张明');
    await page.keyboard.press('Tab');
    await page.keyboard.type('序构测试制造有限公司');
    await page.keyboard.press('Tab');
    await page.keyboard.type('zhangming@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('微信：zhangming-work');
    await page.keyboard.press('Tab');
    await page.keyboard.type(needText);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox')).toBeFocused();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: '《隐私政策》' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-contact-submit]')).toBeFocused();
    await page.keyboard.press('Enter');

    const success = page.locator('[data-contact-success]');
    await expect(success).toBeVisible();
    await expect(success.locator('.success-title')).toHaveText(
      '已收到。我们会通过你留下的邮箱或微信联系你。',
    );
    await expect(success).toBeFocused();
    await expect(page.locator('[data-contact-form]')).toBeHidden();
    expect(page.url()).toMatch(/\/contact$/);
  });

  test('fills the form and submits successfully without navigation', async ({ page }) => {
    await page.goto('/contact');
    await fillValidForm(page);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/contact') && response.request().method() === 'POST',
    );
    await page.locator('[data-contact-submit]').click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await expect(page.locator('[data-contact-success] .success-title')).toHaveText(
      '已收到。我们会通过你留下的邮箱或微信联系你。',
    );
    await expect(page.locator('[data-contact-form]')).toBeHidden();
    expect(page.url()).toMatch(/\/contact$/);
  });
});

test.describe('contact form submission states', () => {
  test('disables the button and shows progress while the request is pending', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/contact');
    await fillValidForm(page);

    const submit = page.locator('[data-contact-submit]');
    await submit.click();

    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(submit).toContainText('提交中…');
    await expect(page.locator('[data-contact-success]')).toBeVisible();
    await expect(submit).toBeEnabled();
  });

  test('keeps the form in place and shows the email fallback when delivery fails', async ({
    page,
  }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'delivery_failed' }),
      }),
    );

    await page.goto('/contact');
    await fillValidForm(page);
    await page.locator('[data-contact-submit]').click();

    const failure = page.locator('[data-form-failure]');
    await expect(failure).toBeVisible();
    await expect(failure).toBeFocused();
    await expect(failure.locator('p')).toHaveText(
      '提交失败。请重试，或直接发邮件至 hello@seqtura.ai。',
    );
    await expect(failure.getByRole('link', { name: 'hello@seqtura.ai' })).toHaveAttribute(
      'href',
      'mailto:hello@seqtura.ai',
    );
    await expect(page.locator('[data-contact-form]')).toBeVisible();
    await expect(page.locator('[data-contact-submit]')).toBeEnabled();
    expect(page.url()).toMatch(/\/contact$/);
  });

  test('renders field errors returned by the server with the summary and focus', async ({
    page,
  }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: 'validation',
          fields: { email: '服务端校验：请使用公司邮箱。' },
        }),
      }),
    );

    await page.goto('/contact');
    await fillValidForm(page);
    await page.locator('[data-contact-submit]').click();

    await expect(page.locator('[data-form-summary]')).toBeVisible();
    await expect(page.locator('[data-form-summary]')).toContainText(
      '邮箱：服务端校验：请使用公司邮箱。',
    );
    await expect(page.getByLabel('邮箱', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-email-error')).toHaveText('服务端校验：请使用公司邮箱。');
    await expect(page.getByLabel('邮箱', { exact: true })).toBeFocused();
  });
});

test.describe('contact page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the email fallback instead of leaving the form as the only path', async ({
    page,
  }) => {
    await page.goto('/contact');

    const fallback = page.locator('[data-noscript]');
    await expect(fallback).toBeVisible();
    await expect(fallback.locator('p')).toHaveText(
      'JavaScript 未启用，表单无法提交。请直接发邮件至 hello@seqtura.ai。',
    );
    await expect(fallback.getByRole('link', { name: 'hello@seqtura.ai' })).toHaveAttribute(
      'href',
      'mailto:hello@seqtura.ai',
    );
  });
});

test.describe('contact form mobile layout', () => {
  for (const width of [320, 390]) {
    test(`uses full-width controls at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/contact');

      const form = page.locator('[data-contact-form]');
      const name = form.getByLabel('姓名', { exact: true });
      const submit = page.locator('[data-contact-submit]');
      const formBox = await form.boundingBox();
      const nameBox = await name.boundingBox();
      const submitBox = await submit.boundingBox();

      expect(formBox).not.toBeNull();
      expect(nameBox).not.toBeNull();
      expect(submitBox).not.toBeNull();
      expect(nameBox!.width).toBeGreaterThanOrEqual(formBox!.width - 46);
      expect(submitBox!.width).toBeGreaterThanOrEqual(formBox!.width - 46);
      expect(Math.abs(nameBox!.width - submitBox!.width)).toBeLessThanOrEqual(1);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

interface ContactTestServer {
  readonly baseURL: string;
  readonly child: ChildProcess;
  output(): string;
  stop(): Promise<void>;
}

async function waitForContactServer(baseURL: string, child: ChildProcess): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Contact server exited with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Contact server did not start at ${baseURL}`);
}

async function startContactServer(
  port: number,
  env: Record<string, string>,
): Promise<ContactTestServer> {
  if (!existsSync('dist/server/entry.mjs')) {
    throw new Error('Run pnpm build before starting a contact test server');
  }

  const child = spawn(process.execPath, ['dist/server/entry.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  const baseURL = `http://127.0.0.1:${port}`;
  await waitForContactServer(baseURL, child);

  return {
    baseURL,
    child,
    output: () => output,
    stop: async () => {
      if (child.exitCode === null) {
        child.kill('SIGTERM');
        await once(child, 'exit');
      }
    },
  };
}

test.describe('FORM_MODE=off', () => {
  test.describe.configure({ mode: 'serial' });

  let server: ContactTestServer;

  test.beforeAll(async () => {
    test.setTimeout(120_000);
    server = await startContactServer(4462, {
      FORM_MODE: 'off',
      PUBLIC_CONTACT_ENDPOINT: 'https://forms.example',
    });
  });

  test.afterAll(async () => {
    await server?.stop();
  });

  test('returns 503 with the form_off contract', async ({ request }) => {
    const response = await request.post(`${server.baseURL}/api/contact`, {
      data: validPayload(),
      headers: { origin: server.baseURL, 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: 'form_off' });
  });

  test('allows the configured public endpoint origin and answers its preflight', async ({
    request,
  }) => {
    const response = await request.post(`${server.baseURL}/api/contact`, {
      data: validPayload(),
      headers: { origin: 'https://forms.example', 'content-type': 'application/json' },
    });
    expect(response.status()).toBe(503);
    expect(response.headers()['access-control-allow-origin']).toBe('https://forms.example');

    const preflight = await request.fetch(`${server.baseURL}/api/contact`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://forms.example',
        'access-control-request-method': 'POST',
      },
    });
    expect(preflight.status()).toBe(204);
    expect(preflight.headers()['access-control-allow-origin']).toBe('https://forms.example');
    expect(preflight.headers()['access-control-allow-methods']).toContain('POST');
  });

  test('shows the email fallback in the browser when the form is off', async ({ page }) => {
    await page.goto(`${server.baseURL}/contact`);
    await fillValidForm(page);
    await page.locator('[data-contact-submit]').click();

    const failure = page.locator('[data-form-failure]');
    await expect(failure).toBeVisible();
    await expect(failure.locator('p')).toHaveText(
      '提交失败。请重试，或直接发邮件至 hello@seqtura.ai。',
    );
    await expect(failure.getByRole('link', { name: 'hello@seqtura.ai' })).toHaveAttribute(
      'href',
      'mailto:hello@seqtura.ai',
    );
    expect(page.url()).toMatch(/\/contact$/);
  });
});

test.describe('FORM_MODE=live without providers', () => {
  test.describe.configure({ mode: 'serial' });

  let server: ContactTestServer;

  test.beforeAll(async () => {
    test.setTimeout(120_000);
    server = await startContactServer(4463, {
      FORM_MODE: 'live',
      CONTACT_RATE_LIMIT_MAX: '2',
      CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
    });
  });

  test.afterAll(async () => {
    await server?.stop();
  });

  test('returns 502 and logs only non-PII failure metadata', async ({ request }) => {
    const response = await request.post(`${server.baseURL}/api/contact`, {
      data: validPayload(),
      headers: { origin: server.baseURL, 'content-type': 'application/json' },
    });

    expect(response.status()).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: 'delivery_failed' });

    await expect.poll(() => server.output()).toContain('contact.delivery_failed');
    const output = server.output();
    expect(output).toContain('requestId');
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

  test('returns 429 after the configured per-IP limit', async ({ request }) => {
    const next = await request.post(`${server.baseURL}/api/contact`, {
      data: validPayload(),
      headers: { origin: server.baseURL, 'content-type': 'application/json' },
    });
    expect(next.status()).toBe(502);

    const limited = await request.post(`${server.baseURL}/api/contact`, {
      data: validPayload(),
      headers: { origin: server.baseURL, 'content-type': 'application/json' },
    });

    expect(limited.status()).toBe(429);
    expect(await limited.json()).toEqual({ ok: false, error: 'rate_limited' });
    expect(Number(limited.headers()['retry-after'])).toBeGreaterThan(0);
  });
});
