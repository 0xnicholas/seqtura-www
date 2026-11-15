import { execFile, spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const execFileAsync = promisify(execFile);

const privacySections = [
  '适用范围',
  '我们收集的信息',
  '处理目的与法律依据',
  '存储地点与期限',
  '委托处理与第三方',
  '跨境传输',
  'Cookie 与统计',
  '你的权利',
  '信息安全',
  '未成年人保护',
  '本政策的更新',
  '联系我们',
];

const termsSections = [
  '适用范围',
  '站点内容与信息性质',
  '知识产权',
  '使用规则',
  '第三方链接',
  '免责与责任限制',
  '条款变更',
  '适用法律与争议解决',
  '联系我们',
];

function lineHeightInPx(value: string): number {
  return Number.parseFloat(value);
}

test('privacy policy carries the twelve canonical sections and disclosures', async ({ page }) => {
  const response = await page.goto('/legal/privacy');

  expect(response?.status()).toBe(200);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('隐私政策');
  await expect(main.locator('h2')).toHaveText(
    privacySections.map((section, index) => `${index + 1}. ${section}`),
  );

  for (const disclosure of [
    '姓名、公司名称、邮箱、需求描述',
    '同意勾选状态、提交时间与所同意的隐私政策版本',
    'IP 地址、访问时间、请求页面',
    '不使用 Cookie、像素标签、第三方统计或广告脚本',
    '自最后一次联系之日起 12 个月内删除',
    '15 个工作日内答复',
    'privacy@seqtura.ai',
    '中华人民共和国境内',
  ]) {
    await expect(main.getByText(disclosure).first(), disclosure).toBeVisible();
  }
});

test('terms of service carries the nine canonical sections and disclosures', async ({ page }) => {
  const response = await page.goto('/legal/terms');

  expect(response?.status()).toBe(200);
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('服务条款');
  await expect(main.locator('h2')).toHaveText(
    termsSections.map((section, index) => `${index + 1}. ${section}`),
  );

  for (const disclosure of [
    '不构成任何形式的报价、要约、承诺、保证或专业建议',
    '未经我们书面许可',
    '按「现状」和「现有」基础提供',
    '适用中华人民共和国法律',
    '运营主体所在地',
  ]) {
    await expect(main.getByText(disclosure).first(), disclosure).toBeVisible();
  }
});

test('both legal pages show the version metadata and no preview placeholder', async ({ page }) => {
  for (const [route, heading] of [
    ['/legal/privacy', '隐私政策'],
    ['/legal/terms', '服务条款'],
  ] as const) {
    await page.goto(route);
    const meta = page.locator('[data-legal-meta]');

    await expect(meta.getByText('生效日期')).toBeVisible();
    await expect(meta.getByText('最后更新')).toBeVisible();
    await expect(meta.getByText('版本')).toBeVisible();
    await expect(meta.locator('dd')).toHaveText(['2026年11月15日', '2026年11月15日', '1.0']);
    expect(
      await meta
        .locator('time')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute('datetime'))),
    ).toEqual(['2026-11-15', '2026-11-15']);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page.locator('[data-placeholder-note]')).toHaveCount(0);
  }
});

test('privacy policy has a non-sticky two-column table of contents with resolving anchors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/legal/privacy');

  const toc = page.locator('[data-legal-toc]');
  await expect(toc).toBeVisible();
  await expect(toc).toHaveCSS('position', 'static');

  const links = toc.getByRole('link');
  await expect(links).toHaveCount(12);
  for (const [index, link] of (await links.all()).entries()) {
    const href = await link.getAttribute('href');
    expect(href, `link ${index}`).toMatch(/^#/);
    const id = decodeURIComponent(href!.slice(1));
    await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1);
  }

  await expect(links.first()).toContainText('01');
  await expect(links.first()).toContainText('适用范围');

  const tops = await links.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().top)),
  );
  expect(tops[0]).toBe(tops[1]);
  expect(tops[1]).toBeLessThan(tops[2]);
});

test('privacy policy table of contents collapses to one column on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/legal/privacy');

  const links = page.locator('[data-legal-toc]').getByRole('link');
  await expect(links).toHaveCount(12);
  const tops = await links.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().top)),
  );
  expect(tops[0]).toBeLessThan(tops[1]);
  expect(tops[1]).toBeLessThan(tops[2]);

  const main = page.getByRole('main');
  const h1Type = await main.getByRole('heading', { level: 1 }).evaluate((element) => {
    const style = getComputedStyle(element);
    return { size: style.fontSize, line: style.lineHeight, weight: style.fontWeight };
  });
  expect(h1Type).toEqual({ size: '40px', line: '48px', weight: '400' });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('terms of service has no table of contents', async ({ page }) => {
  await page.goto('/legal/terms');

  await expect(page.locator('[data-legal-toc]')).toHaveCount(0);
});

test('legal article uses the 720px measure and legal type scale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/legal/privacy');

  const main = page.getByRole('main');
  const prose = page.locator('[data-legal-prose]');
  const proseBox = await prose.boundingBox();
  expect(Math.round(proseBox?.width ?? 0)).toBe(720);

  const proseType = await prose.evaluate((element) => {
    const style = getComputedStyle(element);
    return { size: style.fontSize, line: style.lineHeight };
  });
  expect(proseType.size).toBe('16px');
  expect(lineHeightInPx(proseType.line)).toBeCloseTo(28, 1);

  const h1Type = await main.getByRole('heading', { level: 1 }).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      size: style.fontSize,
      line: style.lineHeight,
      weight: style.fontWeight,
    };
  });
  expect(h1Type.size).toBe('40px');
  expect(lineHeightInPx(h1Type.line)).toBeCloseTo(48, 1);
  expect(h1Type.weight).toBe('400');

  const h2Type = await main
    .locator('h2')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { size: style.fontSize, line: style.lineHeight, weight: style.fontWeight };
    });
  expect(h2Type.size).toBe('24px');
  expect(lineHeightInPx(h2Type.line)).toBeCloseTo(33.6, 1);
  expect(h2Type.weight).toBe('500');

  const h3Type = await main
    .locator('h3')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { size: style.fontSize, line: style.lineHeight, weight: style.fontWeight };
    });
  expect(h3Type.size).toBe('18px');
  expect(lineHeightInPx(h3Type.line)).toBeCloseTo(27, 1);
  expect(h3Type.weight).toBe('500');

  await expect(main.locator('[data-primary-cta]')).toHaveCount(0);
  await expect(main.locator('img, svg')).toHaveCount(0);

  const link = main.getByRole('link', { name: 'privacy@seqtura.ai' }).first();
  await link.focus();
  const focusRing = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusRing.style).toBe('solid');
  expect(Number.parseFloat(focusRing.width)).toBeGreaterThan(0);
});

test('a long contact address wraps at 320px without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/legal/privacy');

  const link = page.getByRole('main').getByRole('link', { name: 'privacy@seqtura.ai' }).first();
  await link.evaluate((element) => {
    element.textContent = 'privacy-and-data-protection-requests@a-very-long-subdomain.seqtura.ai';
  });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('legal pages are indexable with a self canonical and the default social image', async ({
  page,
}) => {
  for (const route of ['/legal/privacy', '/legal/terms']) {
    await page.goto(route);

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://seqtura.ai${route}`,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://seqtura.ai/og-default.png',
    );
  }
});

test('footer keeps the legal links and hides unconfigured filing numbers', async ({ page }) => {
  await page.goto('/legal/privacy');

  const footer = page.getByRole('contentinfo');
  const legalNav = footer.getByRole('navigation', { name: '法务与备案' });

  await expect(legalNav.getByRole('link', { name: '隐私政策' })).toHaveAttribute(
    'href',
    '/legal/privacy',
  );
  await expect(legalNav.getByRole('link', { name: '服务条款' })).toHaveAttribute(
    'href',
    '/legal/terms',
  );
  await expect(legalNav.getByRole('link', { name: '隐私政策' })).not.toHaveAttribute('target');
  await expect(legalNav.getByRole('link', { name: '服务条款' })).not.toHaveAttribute('target');
  await expect(legalNav.locator('[data-filing]')).toHaveCount(0);
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Seqtura AI`);

  const bodyText = await page.locator('body').innerText();
  for (const sentinel of ['【', '待补', '占位', 'example']) {
    expect(bodyText, sentinel).not.toContain(sentinel);
  }
});

test.describe('configured filing and operator values', () => {
  test.describe.configure({ mode: 'serial' });

  const port = 4461;
  const baseURL = `http://127.0.0.1:${port}`;
  let server: ReturnType<typeof spawn> | undefined;
  let outputDir = '';

  test.beforeAll(async () => {
    test.setTimeout(180_000);
    outputDir = await mkdtemp(join(tmpdir(), 'seqtura-legal-filing-'));
    await execFileAsync('pnpm', ['exec', 'astro', 'build', '--outDir', outputDir], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SITE_URL: 'https://seqtura.ai',
        PUBLIC_SHOW_PLACEHOLDERS: 'false',
        PUBLIC_ICP_NUMBER: '京ICP备12345678号-1',
        PUBLIC_PSB_NUMBER: '京公网安备 11010502030143号',
        PUBLIC_OPERATOR_NAME: '北京序构科技有限公司',
        PUBLIC_REGISTERED_ADDRESS: '北京市朝阳区测试路 1 号',
        PUBLIC_SITE_DOMAIN: 'seqtura.ai',
        PUBLIC_LAUNCH_DATE: '2026-12-01',
        PUBLIC_EMAIL_PROVIDER: '邮件服务（测试）',
        PUBLIC_HOSTING_PROVIDER: '境内托管服务（测试）',
        PUBLIC_HOSTING_LOCATION: '北京',
        PUBLIC_OPERATOR_LOCATION: '北京市',
        PUBLIC_PRIVACY_VERSION: '1.1',
      },
    });

    server = spawn(process.execPath, ['tests/support/serve-static.mjs', outputDir, String(port)], {
      stdio: 'ignore',
    });

    for (let attempt = 0; attempt < 80; attempt += 1) {
      try {
        const response = await fetch(baseURL);
        if (response.ok) return;
      } catch {
        // Static server not up yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Static server did not start at ${baseURL}`);
  });

  test.afterAll(async () => {
    if (server && server.exitCode === null) {
      await new Promise<void>((resolve) => {
        server!.once('exit', () => resolve());
        server!.kill('SIGTERM');
      });
    }
    if (outputDir) await rm(outputDir, { recursive: true, force: true });
  });

  test('shows filings, operator details, dates and version from configuration', async ({
    page,
  }) => {
    await page.goto(baseURL);

    const footer = page.getByRole('contentinfo');
    const icp = footer.locator('[data-filing="icp"]');
    const psb = footer.locator('[data-filing="psb"]');
    await expect(icp).toHaveText('京ICP备12345678号-1');
    await expect(icp).toHaveAttribute('href', 'https://beian.miit.gov.cn/');
    await expect(psb).toHaveText('京公网安备 11010502030143号');
    await expect(psb).toHaveAttribute(
      'href',
      'https://beian.mps.gov.cn/#/query/webSearch?code=11010502030143',
    );

    await page.goto(`${baseURL}/legal/privacy`);
    const main = page.getByRole('main');
    await expect(main).toContainText('北京序构科技有限公司');
    await expect(main).toContainText('北京市朝阳区测试路 1 号');
    await expect(main).toContainText('邮件服务（测试）（境内）');
    await expect(main).toContainText('境内托管服务（测试）（北京）');
    await expect(main).toContainText('seqtura.ai');
    await expect(page.locator('[data-legal-meta] dd')).toHaveText([
      '2026年12月1日',
      '2026年12月1日',
      '1.1',
    ]);
    expect(
      await page
        .locator('[data-legal-meta] time')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute('datetime'))),
    ).toEqual(['2026-12-01', '2026-12-01']);

    await page.goto(`${baseURL}/legal/terms`);
    await expect(page.getByRole('main')).toContainText('北京序构科技有限公司');
    await expect(page.getByRole('main')).toContainText('向北京市有管辖权');

    const bodyText = await page.locator('body').innerText();
    for (const sentinel of ['【', '待补', '占位', 'example']) {
      expect(bodyText, sentinel).not.toContain(sentinel);
    }
  });
});
