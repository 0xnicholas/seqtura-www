import { expect, test } from '@playwright/test';

test('home states the promise and routes both hero actions', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('把 AI Agent 从演示做到上线。');
  await expect(page.getByRole('link', { name: '预约 30 分钟沟通' }).first()).toHaveAttribute(
    'href',
    '/contact#book',
  );
  await expect(page.getByRole('link', { name: '看工作方法论' }).first()).toHaveAttribute(
    'href',
    '/methodology',
  );
});

test('home shows the four delivery facts in the proof strip', async ({ page }) => {
  await page.goto('/');

  const facts = page.locator('[data-proof-fact]');
  await expect(facts).toHaveCount(4);
  await expect(facts).toContainText(['8 个交付阶段', '5 层能力栈', '3 条控制面', '1 个主转化']);
});
