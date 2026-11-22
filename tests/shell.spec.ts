import { expect, test } from '@playwright/test';

test('header groups the delivery material under 相关资料 and keeps a persistent booking action', async ({
  page,
}) => {
  await page.goto('/');

  const header = page.getByRole('banner');
  const nav = header.getByRole('navigation', { name: '主导航' });

  await expect(nav.getByRole('link')).toHaveText(['合作流程', '联系我们']);
  await expect(nav.getByRole('button', { name: '相关资料' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(nav.getByRole('link', { name: '工作方法' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: '技术架构' })).toHaveCount(0);
  await expect(header.getByRole('link', { name: '预约沟通' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );

  const headerBox = await header.boundingBox();
  expect(Math.round(headerBox?.height ?? 0)).toBe(64);

  await page.evaluate(() => window.scrollTo(0, 1600));
  await expect.poll(async () => Math.round((await header.boundingBox())?.y ?? -1)).toBe(0);
  await expect(header).toBeVisible();
});

test('相关资料 discloses the material by click, hover and Escape', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('banner').getByRole('navigation', { name: '主导航' });
  const trigger = nav.getByRole('button', { name: '相关资料' });

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: '工作方法' })).toHaveAttribute('href', '/methodology');
  await expect(nav.getByRole('link', { name: '技术架构' })).toHaveAttribute(
    'href',
    '/architecture',
  );

  await page.mouse.click(8, 400);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.hover();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await nav.getByRole('link', { name: '工作方法' }).hover();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await nav.getByRole('link', { name: '工作方法' }).click();
  await expect(page).toHaveURL('/methodology');

  await page.goto('/');
  await trigger.hover();
  await page.mouse.move(8, 400);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('body enables CJK autospace and punctuation trim', async ({ page }) => {
  await page.goto('/');

  const spacing = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return {
      textAutospace: style.getPropertyValue('text-autospace'),
      textSpacingTrim: style.getPropertyValue('text-spacing-trim'),
    };
  });
  expect(spacing).toEqual({ textAutospace: 'normal', textSpacingTrim: 'normal' });
});

test('current page is highlighted on the section and inside its menu', async ({ page }) => {
  await page.goto('/architecture');

  const nav = page.getByRole('banner').getByRole('navigation', { name: '主导航' });

  await expect(nav.getByRole('button', { name: '相关资料' })).toHaveClass(/is-active/);
  await expect(nav.locator('a[href="/architecture"]')).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('a[href="/methodology"]')).not.toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: '合作流程' })).not.toHaveAttribute(
    'aria-current',
    'page',
  );

  // #60：当前页子项常驻 14% 填充块，其余为透明（展开态才看得到）。
  await nav.getByRole('button', { name: '相关资料' }).click();
  await expect(nav.locator('a[href="/architecture"]')).toHaveCSS(
    'background-color',
    'rgb(255, 226, 221)',
  );
  await expect(nav.locator('a[href="/methodology"]')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
});

test('selection renders as a red tint pill and the caret is the laravel chevron', async ({
  page,
}) => {
  await page.goto('/architecture');

  const nav = page.getByRole('banner').getByRole('navigation', { name: '主导航' });
  const trigger = nav.getByRole('button', { name: '相关资料' });
  const plain = nav.getByRole('link', { name: '合作流程' });

  // 红下划线已删除（#60）。
  expect(await plain.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('none');

  // 填充块几何照 laravel.com：36px 高、8px 圆角。
  await expect(plain).toHaveCSS('height', '36px');
  await expect(plain).toHaveCSS('border-radius', '8px');

  // 当前页 = 常驻 14% 填充块；静止的非当前页 = 透明。
  await expect(trigger).toHaveCSS('background-color', 'rgb(255, 226, 221)');
  await expect(plain).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

  // hover = 5% 填充块，与 --color-red-tint 同值。
  const tint = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--color-red-tint)';
    document.body.append(probe);
    const value = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return value;
  });
  await plain.hover();
  await expect(plain).toHaveCSS('background-color', tint);

  // 箭头 = laravel.com 的红色 20px chevron。
  const caret = trigger.locator('.nav-caret');
  await expect(caret).toHaveCSS('color', 'rgb(255, 45, 32)');
  const caretBox = await caret.boundingBox();
  expect(Math.round(caretBox?.width ?? 0)).toBe(20);
  expect(Math.round(caretBox?.height ?? 0)).toBe(20);

  // 展开后 ∨ 收成 ∧：<g> 上提 5.25px、两臂各绕 (10px,13px) 旋转 ∓90°。
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect
    .poll(() => caret.evaluate((el) => getComputedStyle(el.querySelector('g') ?? el).transform))
    .toBe('matrix(1, 0, 0, 1, 0, -5.25)');
  await expect
    .poll(() =>
      caret.evaluate((el) => {
        const arms = [...el.querySelectorAll('path')];
        return arms.map((arm) => getComputedStyle(arm).transform).join(' | ');
      }),
    )
    .toBe('matrix(0, -1, 1, 0, 0, 0) | matrix(0, 1, -1, 0, 0, 0)');

  // 首个标签仍与品牌字标保持 40px 节奏（填充块内边距不吃掉间距）。
  const offset = await page.evaluate(() => {
    const brand = document.querySelector('header .brand');
    const label = document.querySelector('.desktop-nav > a');
    if (!brand || !label) return -1;
    const range = document.createRange();
    range.selectNodeContents(label);
    return range.getBoundingClientRect().left - brand.getBoundingClientRect().right;
  });
  expect(Math.round(offset)).toBe(40);
});

test('footer provides site, delivery and contact columns plus legal links', async ({ page }) => {
  await page.goto('/');

  const footer = page.getByRole('contentinfo');

  await expect(footer.getByRole('heading', { name: '站点' })).toBeVisible();
  await expect(footer.getByRole('heading', { name: '交付' })).toBeVisible();
  await expect(footer.getByRole('heading', { name: '联系' })).toBeVisible();
  await expect(footer.getByRole('link', { name: '工作方法' })).toHaveAttribute(
    'href',
    '/methodology',
  );
  await expect(footer.getByRole('link', { name: '技术架构' })).toHaveAttribute(
    'href',
    '/architecture',
  );
  await expect(footer.getByRole('link', { name: '8阶段交付' })).toHaveAttribute(
    'href',
    '/methodology#stages',
  );
  await expect(footer.getByRole('link', { name: '关于我们' })).toHaveAttribute(
    'href',
    '/contact#about',
  );
  await expect(footer.getByRole('link', { name: '预约沟通' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );
  await expect(footer.getByRole('link', { name: '飞书 / 微信' })).toHaveCount(0);
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

  const wordmark = footer.locator('[data-footer-mark]');
  await expect(wordmark).toHaveAttribute('aria-hidden', 'true');
  await expect(wordmark).toContainText('Seqtura');

  await expect(footer.getByRole('link', { name: /ICP/ })).toHaveCount(0);
});

test('keeps the wordmark and footer mark at their locked weights on Instrument Sans', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const brandName = page.getByRole('banner').locator('.brand-name');
  const brandType = await brandName.evaluate((element) => {
    const style = getComputedStyle(element);
    return { weight: style.fontWeight, family: style.fontFamily };
  });
  expect(brandType.weight).toBe('600');
  expect(brandType.family).toContain('Instrument Sans');

  await expect(page.locator('[data-footer-mark]')).toHaveCSS('font-weight', '500');
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
    ).toHaveText(['合作流程', '联系我们']);

    const material = menu.getByRole('button', { name: '相关资料' });
    await expect(material).toHaveAttribute('aria-expanded', 'false');
    await expect(menu.getByRole('link', { name: '工作方法' })).toHaveCount(0);

    await material.click();
    await expect(material).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: '工作方法' })).toBeVisible();
    await expect(menu.getByRole('link', { name: '技术架构' })).toBeVisible();

    await menu.getByRole('link', { name: '工作方法' }).click();
    await expect(page).toHaveURL('/methodology');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('marks the current row as a tint pill without hairlines', async ({ page }) => {
    await page.goto('/architecture');
    await page.locator('[data-menu-toggle]').click();

    const menu = page.locator('#mobile-menu');
    const section = menu.getByRole('button', { name: '相关资料' });
    const plain = menu.getByRole('link', { name: '合作流程' });

    await expect(section).toHaveCSS('background-color', 'rgb(255, 226, 221)');
    await expect(plain).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(section).toHaveCSS('border-bottom-width', '0px');
    await expect(plain).toHaveCSS('border-bottom-width', '0px');

    // 箭头随 laravel.com 的 <lg 档降到 16px。
    const caret = menu.locator('[data-mobile-section-trigger] .nav-caret');
    const box = await caret.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(16);
    expect(Math.round(box?.height ?? 0)).toBe(16);
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

    await toggle.click();
    await expect(page.getByRole('button', { name: '相关资料' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
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
    .getByRole('link', { name: /Seqtura.*首页/ })
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });

  expect(outline.style).toBe('solid');
  expect(Number.parseFloat(outline.width)).toBeGreaterThan(0);
});

test('reduced motion leaves the hero copy fully visible without entrance effects', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const hero = page.locator('.hero-copy > *').first();
  await expect(hero).toBeVisible();
  const state = await hero.evaluate((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, filter: style.filter, transform: style.transform };
  });
  expect(state.opacity).toBe('1');
  expect(state.filter).toBe('none');
  expect(state.transform).toBe('none');
});

test('200% zoom approximation stays usable without page-level overflow', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });

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
    expect(overflow, `${route} overflows at 200% zoom`).toBeLessThanOrEqual(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  }

  await page.goto('/contact');
  await expect(page.locator('#channels').getByRole('heading', { level: 2 })).toHaveText('直接联系');
  const cta = page.getByRole('main').getByRole('link', { name: '预约沟通' });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});

// §6.3: every hand-written CJK-Latin space is gone, so autospace is the only
// thing widening the gap. `.visually-hidden` copy is addressed to assistive
// tech (autospace cannot double it up) and stays as written.
const renderedRoutes = [
  '/',
  '/methodology',
  '/architecture',
  '/process',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
  '/this-page-does-not-exist',
];

for (const route of renderedRoutes) {
  test(`${route} renders no hand-written CJK-Latin spaces`, async ({ page }) => {
    await page.goto(route);

    const leftovers = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll('.visually-hidden')];
      const previous = hidden.map((element) => element.getAttribute('style'));
      for (const element of hidden) element.setAttribute('style', 'display: none !important');
      const text = document.body.innerText;
      hidden.forEach((element, index) => {
        const style = previous[index];
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      });

      const spacing =
        /(?<=[\p{Script=Han}]) (?=[A-Za-z0-9])|(?<=[A-Za-z0-9]) (?=[\p{Script=Han}])/gu;
      return [...text.matchAll(spacing)].map((match) => {
        const start = Math.max(0, (match.index ?? 0) - 20);
        return text.slice(start, start + 40).replace(/\n/g, ' / ');
      });
    });

    expect(leftovers, `${route} hand-writes spaces that autospace widens again`).toEqual([]);
  });
}
