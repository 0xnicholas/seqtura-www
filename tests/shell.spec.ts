import { expect, test } from '@playwright/test';

test('header carries the four-section navigation and a persistent booking action', async ({
  page,
}) => {
  await page.goto('/');

  const header = page.getByRole('banner');
  const nav = header.getByRole('navigation', { name: '主导航' });

  await expect(nav.getByRole('link')).toHaveText([
    '工作方法论',
    '技术架构',
    '合作流程',
    '联系我们',
  ]);
  await expect(header.getByRole('link', { name: '预约沟通' })).toHaveAttribute(
    'href',
    '/contact#book',
  );

  const headerBox = await header.boundingBox();
  expect(Math.round(headerBox?.height ?? 0)).toBe(64);
  await expect(header).toHaveCSS('position', 'sticky');
});

test('current page is highlighted in the header', async ({ page }) => {
  await page.goto('/architecture');

  const nav = page.getByRole('banner').getByRole('navigation', { name: '主导航' });

  await expect(nav.getByRole('link', { name: '技术架构' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: '工作方法论' })).not.toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('footer provides site, delivery and contact columns plus legal links', async ({ page }) => {
  await page.goto('/');

  const footer = page.getByRole('contentinfo');

  await expect(footer.getByRole('heading', { name: '站点' })).toBeVisible();
  await expect(footer.getByRole('heading', { name: '交付' })).toBeVisible();
  await expect(footer.getByRole('heading', { name: '联系' })).toBeVisible();
  await expect(footer.getByRole('link', { name: '8 阶段交付' })).toHaveAttribute(
    'href',
    '/methodology#stages',
  );
  await expect(footer.getByRole('link', { name: '关于我们' })).toHaveAttribute(
    'href',
    '/contact#about',
  );
  await expect(footer.getByRole('link', { name: '参考架构' })).toHaveAttribute(
    'href',
    '/architecture#overview',
  );
  await expect(footer.getByRole('link', { name: '隐私政策' })).toHaveAttribute(
    'href',
    '/legal/privacy',
  );
  await expect(footer.getByRole('link', { name: '服务条款' })).toHaveAttribute(
    'href',
    '/legal/terms',
  );

  const wordmark = footer.locator('.footer-mark');
  await expect(wordmark).toHaveAttribute('aria-hidden', 'true');
  await expect(wordmark).toContainText('Seqtura');

  await expect(footer.getByRole('link', { name: /ICP/ })).toHaveCount(0);
});

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: '跳到主要内容' });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps the compact booking action and opens the navigation menu', async ({ page }) => {
    await page.goto('/');

    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: '预约' })).toBeVisible();
    await expect(header.getByRole('navigation', { name: '主导航' })).toBeHidden();

    const toggle = header.locator('[data-menu-toggle]');
    const menu = page.locator('#mobile-menu');

    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', '关闭菜单');
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole('navigation', { name: '移动端主导航' }).getByRole('link'),
    ).toHaveText(['工作方法论', '技术架构', '合作流程', '联系我们']);

    await menu.getByRole('link', { name: '工作方法论' }).click();
    await expect(page).toHaveURL('/methodology');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
    await page.goto('/');

    const header = page.getByRole('banner');
    const toggle = header.getByRole('button', { name: '打开菜单' });

    await toggle.click();
    await expect(page.locator('#mobile-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`no page-level horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });

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
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('focus is visible for keyboard users', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  const outline = await page
    .getByRole('banner')
    .getByRole('link', { name: 'Seqtura AI 首页' })
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });

  expect(outline.style).toBe('solid');
  expect(Number.parseFloat(outline.width)).toBeGreaterThan(0);
});

test('reduced motion turns off the hero entrance animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const animation = await page
    .locator('.hero-copy > *')
    .first()
    .evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe('none');
});
