// scratch screenshot helper for prototype/color-tuning (#28)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = '/Users/nicholasl/Documents/build-whatever/seqtura-www/prototype/color-tuning/shots';
mkdirSync(out, { recursive: true });

const url = 'file:///Users/nicholasl/Documents/build-whatever/seqtura-www/prototype/color-tuning/index.html?capture=1';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(400);

for (const id of ['overview', 'calib', 'cand-a', 'cand-b', 'cand-c']) {
  await page.locator('#' + id).screenshot({ path: `${out}/${id}.png` });
  console.log('shot', id);
}
await page.screenshot({ path: `${out}/full.png`, fullPage: true });
console.log('shot full');
await browser.close();
