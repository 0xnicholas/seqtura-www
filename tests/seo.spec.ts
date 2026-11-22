import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const indexablePages = [
  '/',
  '/methodology',
  '/architecture',
  '/process',
  '/contact',
  '/products/oribos',
  '/products/fdesforce',
  '/products/heirloom',
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
  test(`${route} has its own title, description, canonical and social metadata`, async ({
    page,
  }) => {
    await page.goto(route);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length).toBeGreaterThan(0);

    const canonical = `https://seqtura.ai${route === '/' ? '/' : route}`;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      description ?? '',
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://seqtura.ai/og-default.png',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://seqtura.ai/og-default.png',
    );
  });

  test(`${route} publishes Organization and WebSite JSON-LD`, async ({ page }) => {
    await page.goto(route);

    const raw = await page.locator('script[type="application/ld+json"]').innerText();
    const jsonLd = JSON.parse(raw) as {
      '@context': string;
      '@graph': { '@type': string; inLanguage?: string; publisher?: unknown }[];
    };

    expect(jsonLd['@context']).toBe('https://schema.org');
    const types = jsonLd['@graph'].map((node) => node['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');

    const website = jsonLd['@graph'].find((node) => node['@type'] === 'WebSite');
    expect(website?.inLanguage).toBe('zh-CN');
    expect(website?.publisher).toBeTruthy();
  });
}

test('the social preview image is a real 1200x630 PNG', async ({ request }) => {
  const png = readFileSync('public/og-default.png');

  expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);

  const response = await request.get('/og-default.png');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
});

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Allow: /');
  expect(body).toContain('Sitemap: https://seqtura.ai/sitemap-index.xml');
});

test('sitemap lists exactly the seven indexable pages and omits 404', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);

  const indexBody = await index.text();
  const sitemapPath = indexBody.match(/https:\/\/seqtura\.ai\/sitemap-[^<]+\.xml/)?.[0];
  expect(sitemapPath).toBeTruthy();

  const sitemap = await request.get(new URL(sitemapPath!).pathname);
  const body = await sitemap.text();

  expect(sitemap.status()).toBe(200);
  const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
  expect(locations).toEqual(indexablePages.map((route) => `https://seqtura.ai${route}`).sort());
  expect(body).not.toContain('404');
});
