// PROTOTYPE graphic-language (#29): screenshot helper, not part of the suite.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = 'http://localhost:4321';
const out = 'prototype/graphic-language/shots';
mkdirSync(out, { recursive: true });

const shots = [
  ['meth-base', '/methodology'],
  ['meth-iso', '/methodology?variant=iso'],
  ['meth-bp', '/methodology?variant=bp'],
  ['meth-mix', '/methodology?variant=mix'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
for (const [name, url] of shots) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(base + url, { waitUntil: 'networkidle' });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
      await page.waitForTimeout(800);
    }
  }
  await page.waitForTimeout(1300);
  await page.locator('#stages').screenshot({ path: `${out}/${name}.png` });
  console.log('shot', name);
}
await browser.close();
