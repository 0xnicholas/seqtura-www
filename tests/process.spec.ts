import { expect, test } from '@playwright/test';

test('process hero frames the six-stage cooperation path and routes both actions', async ({
  page,
}) => {
  const response = await page.goto('/process');

  expect(response?.status()).toBe(200);
  const main = page.getByRole('main');
  await expect(main.locator('h1')).toHaveCount(1);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('从第一次沟通，到上线之后');
  await expect(main.getByText('合作流程', { exact: true })).toBeVisible();
  await expect(
    main.getByText('六个合作阶段：每段做什么、需要你投入什么、到哪里为止。'),
  ).toBeVisible();
  await expect(main.getByRole('link', { name: '开始第一次沟通' })).toHaveAttribute(
    'href',
    '/contact#book',
  );
  await expect(main.getByRole('link', { name: '看技术架构' })).toHaveAttribute(
    'href',
    '/architecture',
  );
  await expect(page.locator('.preview-note')).toHaveCount(0);
});
