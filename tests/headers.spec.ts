import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface HeaderRule {
  readonly pattern: string;
  readonly headers: Record<string, string>;
}

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

const builtHeaders = readFileSync('dist/client/_headers', 'utf8');
const rules = parseHeaders(builtHeaders);
const globalRule = rules.find((rule) => rule.pattern === '/*');
const astroRule = rules.find((rule) => rule.pattern === '/_astro/*');

test('the built output ships the security and cache header contract', () => {
  expect(globalRule, 'missing /* rule').toBeTruthy();
  expect(globalRule?.headers['Strict-Transport-Security']).toBe(
    'max-age=31536000; includeSubDomains; preload',
  );
  expect(globalRule?.headers['X-Content-Type-Options']).toBe('nosniff');
  expect(globalRule?.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  expect(globalRule?.headers['Permissions-Policy']).toBe(
    'camera=(), microphone=(), geolocation=()',
  );
  expect(globalRule?.headers['Content-Security-Policy']).toBe(
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  expect(globalRule?.headers['Cache-Control']).toBe('public, max-age=0, must-revalidate');
});

test('immutable hashed assets and short-lived discovery files keep their own cache rules', () => {
  expect(astroRule?.headers['Cache-Control']).toBe('public, max-age=31536000, immutable');

  for (const pattern of ['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt']) {
    const rule = rules.find((candidate) => candidate.pattern === pattern);
    expect(rule, `missing ${pattern} rule`).toBeTruthy();
    expect(rule?.headers['Cache-Control']).toBe('public, max-age=3600');
  }
});

test('the contact endpoint responses carry no-store and nosniff themselves', async ({
  request,
}) => {
  const origin = `http://127.0.0.1:${Number(process.env.PORT ?? 4321)}`;
  const response = await request.post('/api/contact', {
    data: { broken: true },
    headers: { origin, 'content-type': 'application/json' },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['cache-control']).toContain('no-store');
});
