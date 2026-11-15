import { expect, test } from '@playwright/test';

const indexablePages = [
  '/',
  '/methodology',
  '/architecture',
  '/process',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
];

test('home page declares its language, title, description, canonical and social image', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page).toHaveTitle('Seqtura AI（序构 AI）｜企业 AI Agent 的工程化交付');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /把 AI Agent 从演示做到上线/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://seqtura.ai/',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://seqtura.ai/og-default.png',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
});

for (const route of indexablePages) {
  test(`${route} has its own title, description and canonical`, async ({ page }) => {
    await page.goto(route);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length).toBeGreaterThan(0);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(`https://seqtura.ai${route === '/' ? '/' : route}`);
  });
}

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Allow: /');
  expect(body).toContain('Sitemap: https://seqtura.ai/sitemap-index.xml');
});

test('sitemap lists the seven indexable pages and omits 404', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);

  const indexBody = await index.text();
  const sitemapPath = indexBody.match(/https:\/\/seqtura\.ai\/sitemap-[^<]+\.xml/)?.[0];
  expect(sitemapPath).toBeTruthy();

  const sitemap = await request.get(new URL(sitemapPath!).pathname);
  const body = await sitemap.text();

  expect(sitemap.status()).toBe(200);
  for (const route of indexablePages) {
    expect(body).toContain(`<loc>https://seqtura.ai${route}</loc>`);
  }
  expect(body).not.toContain('404');
});
