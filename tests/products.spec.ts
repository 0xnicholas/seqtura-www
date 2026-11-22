import { expect, test } from '@playwright/test';
import { products } from '../src/data/products';

const routes = [
  { route: '/products/oribos', name: 'Oribos' },
  { route: '/products/fdesforce', name: 'Fdesforce' },
  { route: '/products/heirloom', name: 'Heirloom' },
];

for (const { route, name } of routes) {
  test(`${route} presents one product and points back to the reference architecture`, async ({
    page,
  }) => {
    await page.goto(route);

    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText(name);
    await expect(main.getByRole('heading', { level: 2 })).toHaveCount(2);

    // 产品页只讲产品：无出站链接、无 CTA 按钮（ADR-0002）。
    await expect(main.locator('a[href^="http"], a[target="_blank"]')).toHaveCount(0);
    await expect(main.getByRole('button')).toHaveCount(0);
    await expect(main.locator('a.btn')).toHaveCount(0);

    // 唯一的出口是回指 /architecture。
    await expect(main.getByRole('link', { name: '看技术架构' })).toHaveAttribute(
      'href',
      '/architecture',
    );

    // 同一条产品线：三页互链，当前页带 aria-current。
    const line = main.getByRole('navigation', { name: '产品线' });
    await expect(line.getByRole('link')).toHaveCount(3);
    await expect(line.locator('[aria-current="page"]')).toHaveAttribute('href', route);
  });
}

test('产品页的能力栈位置与数据源一致', async ({ page }) => {
  for (const { route } of routes) {
    await page.goto(route);

    const product = Object.values(products).find((item) => item.href === route);
    expect(product, route).toBeDefined();
    if (!product) continue;

    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 2 }).first()).toHaveText(product.what.title);
    await expect(main.getByRole('heading', { level: 2 }).last()).toHaveText(product.place.title);
    await expect(main.locator(`[data-product-link="${product.id}"]`)).toHaveAttribute(
      'aria-current',
      'page',
    );
  }
});
