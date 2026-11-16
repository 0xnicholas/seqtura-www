import { expect, test } from '@playwright/test';

const routes = [
  '/methodology',
  '/architecture',
  '/process',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
];

const anchors = {
  '/methodology': ['stages', 'discover', 'validate', 'deploy'],
  '/architecture': ['overview', 'lifecycle', 'layers', 'controls', 'scenarios'],
  '/process': ['stages', 'pricing', 'support'],
  '/contact': ['channels', 'about'],
};

for (const route of routes) {
  test(`${route} is reachable and uses the global shell`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
}

for (const [route, ids] of Object.entries(anchors)) {
  test(`${route} preserves its future anchors`, async ({ page }) => {
    await page.goto(route);

    for (const id of ids) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
}

for (const [route, heading] of [
  ['/legal/privacy', '隐私政策'],
  ['/legal/terms', '服务条款'],
] as const) {
  test(`${route} headings stay legal and leave the top navigation alone`, async ({ page }) => {
    await page.goto(route);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page.getByRole('navigation', { name: '主导航' }).getByRole('link')).toHaveCount(4);
    await expect(page.getByRole('link', { name: '工作方法论' })).toHaveCount(2);
  });
}

test('unknown routes return 404 with a noindex page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');

  expect(response?.status()).toBe(404);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('页面不存在');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(main.getByRole('link', { name: '返回首页' })).toHaveAttribute('href', '/');
  await expect(main.getByRole('link', { name: '预约沟通' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );
});
