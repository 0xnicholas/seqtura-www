import { expect, test, type APIRequestContext } from '@playwright/test';

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
    await expect(main).toContainText('30 分钟，围绕一个具体业务场景，给出值不值得做、下一步是什么的判断。');
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
    await expect(channels.getByRole('heading', { level: 3 })).toHaveText([
      '微信',
      '飞书',
      '邮箱',
    ]);
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

  test('rejects a submission faster than three seconds with a generic error', async ({ request }) => {
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
