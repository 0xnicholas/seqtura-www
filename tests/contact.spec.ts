import { expect, test } from '@playwright/test';

test.describe('contact page structure', () => {
  test('has the hero, direct channels and about sections', async ({ page }) => {
    const response = await page.goto('/contact');

    expect(response?.status()).toBe(200);
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText('先聊一个具体场景。');
    await expect(main).toContainText('围绕一个具体业务场景，给出值不值得做、下一步是什么的判断。');
    await expect(main).toContainText('扫码添加企业微信、打开飞书，或直接写邮件。');

    await expect(page.locator('#book')).toHaveCount(0);
    await expect(page.locator('#channels')).toHaveCount(1);
    await expect(page.locator('#about')).toHaveCount(1);
    await expect(page.locator('#channels form')).toHaveCount(0);
    await expect(main.getByRole('link', { name: '预约沟通' })).toHaveAttribute('href', '#channels');
  });

  test('lists the three direct channels and the company facts', async ({ page }) => {
    await page.goto('/contact');

    const channels = page.locator('#channels');
    await expect(channels.getByRole('heading', { level: 2 })).toHaveText('直接联系');
    await expect(channels.getByRole('heading', { level: 3 })).toHaveText([
      '企业微信',
      '飞书',
      '邮箱',
    ]);
    await expect(channels.getByRole('link', { name: 'hello@seqtura.ai' }).first()).toHaveAttribute(
      'href',
      'mailto:hello@seqtura.ai',
    );
    await expect(channels.locator('img')).toHaveCount(0);
    const channelText = await channels.innerText();
    expect(channelText).not.toContain('获取微信二维码');
    expect(channelText).not.toContain('获取飞书入口');
    expect(channelText.match(/暂未公开，请先通过邮箱联系/g)).toHaveLength(2);

    const about = page.locator('#about');
    await expect(about.getByRole('heading', { level: 2 })).toHaveText('关于我们');
    await expect(about).toContainText(
      'Seqtura AI（序构AI）为企业定制AI Agent，把业务场景从评估做到生产上线。',
    );
    await expect(about).toContainText('我们相信：先把验收标准定下来，再开始构建。');
    await expect(about.getByText('运营主体', { exact: true })).toBeVisible();
    await expect(about.getByText('所在地', { exact: true })).toHaveCount(0);
    await expect(about.locator('img')).toHaveCount(0);
    const aboutText = await about.innerText();
    expect(aboutText).not.toContain('团队规模');
    expect(aboutText).not.toContain('创始人');
  });

  test('carries no booking form and no 30-minute promise', async ({ page }) => {
    await page.goto('/contact');

    const text = await page.locator('body').innerText();
    for (const banned of ['预约表单', '提交预约', '填写预约', '30 分钟']) {
      expect(text, banned).not.toContain(banned);
    }
    expect(await page.locator('form').count()).toBe(0);
    expect(await page.locator('input, textarea, select').count()).toBe(0);
  });

  test('production copy carries no preview sentinels', async ({ page }) => {
    await page.goto('/contact');

    const bodyText = await page.locator('body').innerText();
    for (const sentinel of ['【', '待补', '占位', 'example']) {
      expect(bodyText, sentinel).not.toContain(sentinel);
    }
  });

  test('ships scripts and styles without preview sentinels', async ({ page, request }) => {
    await page.goto('/contact');

    const assets = await page
      .locator('script[src], link[rel="stylesheet"]')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute('src') ?? element.getAttribute('href'))
          .filter((value): value is string => Boolean(value)),
      );

    expect(assets.length).toBeGreaterThan(0);
    for (const asset of assets) {
      const response = await request.get(asset);
      expect(response.ok(), asset).toBe(true);
      const body = await response.text();
      for (const sentinel of ['【', '待补', '占位', 'example']) {
        expect(body, `${asset} contains ${sentinel}`).not.toContain(sentinel);
      }
    }
  });

  test('ships external scripts so the strict CSP can keep script-src self', async ({ page }) => {
    for (const route of [
      '/',
      '/methodology',
      '/architecture',
      '/process',
      '/contact',
      '/legal/privacy',
      '/legal/terms',
    ]) {
      await page.goto(route);

      const inlineExecutable = await page.evaluate(() =>
        Array.from(document.querySelectorAll('script'))
          .filter((script) => !script.src)
          .filter((script) => script.type !== 'application/ld+json')
          .map((script) => script.textContent?.slice(0, 80) ?? ''),
      );
      expect(inlineExecutable, route).toEqual([]);
    }
  });
});

test.describe('contact page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps every contact channel available', async ({ page }) => {
    await page.goto('/contact');

    const channels = page.locator('#channels');
    await expect(channels.getByRole('heading', { level: 2 })).toHaveText('直接联系');
    await expect(channels.getByRole('heading', { level: 3 })).toHaveText([
      '企业微信',
      '飞书',
      '邮箱',
    ]);
    await expect(channels.getByRole('link', { name: 'hello@seqtura.ai' }).first()).toHaveAttribute(
      'href',
      'mailto:hello@seqtura.ai',
    );
    await expect(page.locator('[data-noscript]')).toHaveCount(0);
  });
});

test.describe('contact channels mobile layout', () => {
  for (const width of [320, 390]) {
    test(`uses full-width channel cards at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/contact');

      const grid = page.locator('.channel-grid');
      const cards = page.locator('.channel-card');
      await expect(cards).toHaveCount(3);

      const gridBox = await grid.boundingBox();
      expect(gridBox).not.toBeNull();
      for (const card of await cards.all()) {
        const cardBox = await card.boundingBox();
        expect(cardBox).not.toBeNull();
        expect(cardBox!.width).toBeGreaterThanOrEqual(gridBox!.width - 2);
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
