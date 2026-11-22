import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
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

const seriousOrCritical = new Set(['serious', 'critical']);

for (const route of pages) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      seriousOrCritical.has(violation.impact ?? ''),
    );

    const details = blocking.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      helpUrl: violation.helpUrl,
      targets: violation.nodes.flatMap((node) => node.target),
    }));
    expect(details, JSON.stringify(details, null, 2)).toEqual([]);
  });
}

test('every page exposes one main landmark, one H1 and labelled navigation', async ({ page }) => {
  for (const route of pages) {
    await page.goto(route);

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole('banner').getByRole('navigation', { name: '主导航' }),
    ).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  }
});

test('decorative elements stay hidden and no aria-hidden element traps focus', async ({ page }) => {
  for (const route of pages) {
    await page.goto(route);

    const focusableInsideHidden = await page
      .locator('[aria-hidden="true"]')
      .evaluateAll((elements) =>
        elements.flatMap((element) =>
          Array.from(
            element.querySelectorAll(
              'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).map((focusable) => focusable.outerHTML.slice(0, 120)),
        ),
      );
    expect(focusableInsideHidden, `${route} hides focusable content`).toEqual([]);

    const imagesWithoutAlt = await page
      .locator('img')
      .evaluateAll((images) => images.filter((image) => !image.hasAttribute('alt')).length);
    expect(imagesWithoutAlt, `${route} has images without alt`).toBe(0);
  }
});

test('architecture diagrams have accessible names and the skip link works', async ({ page }) => {
  await page.goto('/architecture');

  await expect(page.getByRole('img', { name: /交付参考架构/ }).first()).toBeVisible();
  await expect(page.locator('figure[aria-labelledby]')).not.toHaveCount(0);

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: '跳到主要内容' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});
