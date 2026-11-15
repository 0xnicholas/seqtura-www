import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const port = process.env.LINK_CHECK_PORT ?? '4322';
const baseUrl = process.env.LINK_CHECK_BASE_URL ?? `http://127.0.0.1:${port}`;
const base = new URL(baseUrl);
const startRoutes = [
  '/',
  '/methodology',
  '/architecture',
  '/process',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
];
const requiredAssets = ['/favicon.svg', '/og-default.png', '/robots.txt', '/sitemap-index.xml'];
const assetExtensions = /\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|avif|ico|xml|txt|webmanifest)$/;
const skipProtocols = /^(?:mailto:|tel:|javascript:|data:)/i;

const failures = [];
const pages = new Map();
const queue = [...startRoutes];
const visited = new Set();
let server;

function fail(url, reason) {
  failures.push(`${url} → ${reason}`);
}

function isAsset(pathname) {
  return pathname.startsWith('/_astro/') || assetExtensions.test(pathname);
}

function extractLinks(html) {
  const links = [];
  for (const match of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    links.push(match[1]);
  }
  return links;
}

function hasFragment(html, fragment) {
  const id = decodeURIComponent(fragment).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:id|name)=["']${id}["']`).test(html);
}

async function request(url, { html = false } = {}) {
  const response = await fetch(url, { redirect: 'follow' });
  const body = html && response.ok ? await response.text() : undefined;
  return { status: response.status, url: response.url, body };
}

async function loadPage(url) {
  if (pages.has(url)) return pages.get(url);
  const result = await request(url, { html: true });
  pages.set(url, result);
  return result;
}

async function checkPageUrl(pageUrl) {
  const result = await loadPage(pageUrl);
  if (result.status >= 400) {
    fail(pageUrl, `HTTP ${result.status}`);
    return;
  }
  for (const raw of extractLinks(result.body ?? '')) {
    if (!raw || skipProtocols.test(raw)) continue;

    let target;
    try {
      target = new URL(raw, pageUrl);
    } catch {
      fail(pageUrl, `invalid URL: ${raw}`);
      continue;
    }

    if (target.origin !== base.origin) continue;

    if (isAsset(target.pathname)) {
      const asset = await request(target);
      if (asset.status >= 400) fail(target.pathname, `HTTP ${asset.status}`);
      continue;
    }

    const targetRoute = target.pathname + target.search;
    if (!visited.has(targetRoute)) queue.push(targetRoute);

    const page = await loadPage(target.origin + targetRoute);
    if (page.status >= 400) {
      fail(target.pathname, `HTTP ${page.status} (linked from ${pageUrl})`);
      continue;
    }

    if (target.hash && page.body && !hasFragment(page.body, target.hash.slice(1))) {
      fail(`${target.pathname}${target.hash}`, `missing anchor (linked from ${pageUrl})`);
    }
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server not up yet.
    }
    await sleep(500);
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
}

if (!process.env.LINK_CHECK_BASE_URL) {
  server = spawn(process.execPath, ['server.mjs'], {
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: port,
      FORM_MODE: 'test',
    },
    stdio: 'ignore',
  });
}

try {
  await waitForServer();

  for (const asset of requiredAssets) {
    const result = await request(new URL(asset, base));
    if (result.status >= 400) fail(asset, `HTTP ${result.status}`);
  }

  while (queue.length > 0) {
    const route = queue.shift();
    if (visited.has(route)) continue;
    visited.add(route);
    await checkPageUrl(new URL(route, base).toString());
  }

  const notFound = await request(new URL('/this-page-does-not-exist', base));
  if (notFound.status !== 404)
    fail('/this-page-does-not-exist', `expected 404, got ${notFound.status}`);

  if (failures.length > 0) {
    console.error(`Link check failed with ${failures.length} problem(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Link check passed: ${visited.size} pages, ${pages.size} documents, all internal links resolve.`,
    );
  }
} finally {
  server?.kill('SIGTERM');
}
