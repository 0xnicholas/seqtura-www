// scratch screenshot helper for prototype/type-specimen (#30)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const dir = '/Users/nicholasl/Documents/build-whatever/seqtura-www/prototype/type-specimen';
const out = `${dir}/shots`;
mkdirSync(out, { recursive: true });

const url = `file://${dir}/index.html?capture=1`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

// 环境探测结果打到 stdout，随截图一起留档
console.log(await page.evaluate(() => ({
  instrumentSans: document.fonts.check("400 16px 'Instrument Sans'"),
  autospace: CSS.supports('text-autospace', 'normal'),
  autospaceOff: CSS.supports('text-autospace', 'no-autospace') || CSS.supports('text-autospace', 'none'),
  trim: CSS.supports('text-spacing-trim', 'normal'),
  ua: navigator.userAgent,
})));

for (const id of ['hero', 'matrix', 'weights', 'autospace', 'trim', 'numbers', 'metrics']) {
  await page.locator('#' + id).screenshot({ path: `${out}/${id}.png` });
  console.log('shot', id);
}
// 方案 a（中文标题 400）对照一帧
await page.goto(`file://${dir}/index.html?capture=1&cjk=a`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.locator('#hero').screenshot({ path: `${out}/hero-scheme-a.png` });
console.log('shot hero-scheme-a');
await page.screenshot({ path: `${out}/full.png`, fullPage: true });
console.log('shot full');
await browser.close();
