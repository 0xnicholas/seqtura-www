import { readFileSync } from 'node:fs';
import { expect, test, type APIResponse } from '@playwright/test';

interface HeaderRule {
  readonly pattern: string;
  readonly headers: Record<string, string>;
}

const securityHeaders = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
} as const;

function parseHeaders(source: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  let current: HeaderRule | undefined;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (!rawLine.startsWith(' ') && !rawLine.startsWith('\t')) {
      current = { pattern: line, headers: {} };
      rules.push(current);
      continue;
    }

    if (!current || line.startsWith('!')) continue;
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    current.headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return rules;
}

function expectSecurityHeaders(response: APIResponse): void {
  const headers = response.headers();
  for (const [name, value] of Object.entries(securityHeaders)) {
    expect(headers[name], name).toBe(value);
  }
}

test('live HTML responses carry the security headers and revalidate on every load', async ({
  request,
}) => {
  const response = await request.get('/');

  expect(response.status()).toBe(200);
  expectSecurityHeaders(response);
  expect(response.headers()['cache-control']).toBe('public, max-age=0, must-revalidate');
});

test('live hashed assets are immutable and keep the same security headers', async ({ request }) => {
  const page = await request.get('/');
  const asset = (await page.text()).match(/\/_astro\/[^"'\s]+\.(?:css|js)/)?.[0];

  expect(asset, 'page references a hashed asset').toBeTruthy();
  const response = await request.get(asset!);

  expect(response.status()).toBe(200);
  expectSecurityHeaders(response);
  expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
});

test('live sitemap and robots use a short cache', async ({ request }) => {
  for (const route of ['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt']) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(response.headers()['cache-control'], route).toBe('public, max-age=600');
  }
});

test('the live contact page answers with the security headers and revalidates', async ({
  request,
}) => {
  const response = await request.get('/contact');

  expect(response.status()).toBe(200);
  expectSecurityHeaders(response);
  expect(response.headers()['cache-control']).toBe('public, max-age=0, must-revalidate');
});

test('public/_headers still documents the static-host contract', () => {
  const rules = parseHeaders(readFileSync('dist/client/_headers', 'utf8'));
  const globalRule = rules.find((rule) => rule.pattern === '/*');
  const astroRule = rules.find((rule) => rule.pattern === '/_astro/*');

  expect(globalRule?.headers['Strict-Transport-Security']).toBe(
    'max-age=31536000; includeSubDomains; preload',
  );
  expect(globalRule?.headers['Content-Security-Policy']).toBe(
    securityHeaders['content-security-policy'],
  );
  expect(globalRule?.headers['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  expect(astroRule?.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');
});
