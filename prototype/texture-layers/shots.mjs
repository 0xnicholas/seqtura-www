// PROTOTYPE texture-layers (#31): screenshot helper, not part of the suite.
// Captures 加/不加 pairs per section plus full-page states. Needs the dev
// server on :4321.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = 'http://localhost:4321';
const out = 'prototype/texture-layers/shots';
mkdirSync(out, { recursive: true });

const ALL = [
  'grid-hero',
  'glow-hero',
  'grid-methodology',
  'glow-methodology',
  'glow-arch',
  'grid-cta',
  'glow-cta',
  'grain',
];

const without = (...keys) => '/?capture=1&tex=' + ALL.filter((k) => !keys.includes(k)).join(',');

// [name, url, selector | null (full page)]
const shots = [
  ['full-on', '/?capture=1', null],
  ['full-bare', '/?capture=1&tex=none', null],
  ['hero-on', '/?capture=1', '.hero'],
  ['hero-off', without('grid-hero', 'glow-hero'), '.hero'],
  ['method-on', '/?capture=1', '#methodology'],
  ['method-off', without('grid-methodology', 'glow-methodology'), '#methodology'],
  ['arch-on', '/?capture=1', '#architecture'],
  ['arch-off', without('glow-arch'), '#architecture'],
  ['cta-on', '/?capture=1', '#next-step'],
  ['cta-off', without('grid-cta', 'glow-cta'), '#next-step'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

for (const [name, url, selector] of shots) {
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
  if (selector) {
    await page.locator(selector).screenshot({ path: `${out}/${name}.png` });
  } else {
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  }
  console.log('shot', name);
}

// Grain close-ups at 2x: bare vs grain-only, cropped to the hero copy zone.
const ctx2 = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const page2 = await ctx2.newPage();
for (const [name, url] of [
  ['grain-off', '/?capture=1&tex=none'],
  ['grain-on', '/?capture=1&tex=grain'],
]) {
  await page2.goto(base + url, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1300);
  await page2.screenshot({
    path: `${out}/${name}.png`,
    clip: { x: 80, y: 120, width: 620, height: 420 },
  });
  console.log('shot', name);
}

// Panel itself (visible, perf legend open) for the README.
const page3 = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page3.goto(base + '/', { waitUntil: 'networkidle' });
await page3.waitForTimeout(1300);
await page3.locator('.tex-bar').screenshot({ path: `${out}/panel.png` });
console.log('shot panel');
await page3.locator('[data-tex-perf-toggle]').click();
await page3.locator('.tex-bar').screenshot({ path: `${out}/panel-perf.png` });
console.log('shot panel-perf');

await browser.close();
