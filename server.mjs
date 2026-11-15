import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler } from './dist/server/entry.mjs';

const clientDir = fileURLToPath(new URL('./dist/client', import.meta.url));
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4321);

const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

const htmlCache = 'public, max-age=0, must-revalidate';
const assetCache = 'public, max-age=31536000, immutable';
const shortCache = 'public, max-age=600';
const discoveryPaths = new Set(['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt']);

const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function cacheControlFor(pathname) {
  if (pathname.startsWith('/_astro/')) return assetCache;
  if (discoveryPaths.has(pathname)) return shortCache;
  if (pathname === '/' || pathname.endsWith('.html') || !extname(pathname)) return htmlCache;
  return shortCache;
}

function applyHeaders(response, cacheControl) {
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.setHeader(name, value);
  }
  response.setHeader('Cache-Control', cacheControl);
}

async function resolveStaticFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  if (decoded.includes('\0')) return undefined;

  const candidates =
    decoded === '/' || decoded.endsWith('/')
      ? [join(decoded, 'index.html')]
      : extname(decoded)
        ? [decoded]
        : [decoded, join(decoded, 'index.html')];

  for (const candidate of candidates) {
    const filePath = normalize(join(clientDir, candidate));
    if (filePath !== clientDir && !filePath.startsWith(clientDir + sep)) continue;
    try {
      const info = await stat(filePath);
      if (info.isFile()) return { filePath, size: info.size };
    } catch {
      // Try the next candidate.
    }
  }
  return undefined;
}

async function serveStatic(request, response, pathname) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const staticFile = await resolveStaticFile(pathname);
  if (!staticFile) return false;

  const { filePath, size } = staticFile;
  applyHeaders(response, cacheControlFor(pathname));
  response.writeHead(200, {
    'Content-Type': contentTypes.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream',
    'Content-Length': String(size),
  });
  if (request.method === 'HEAD') {
    response.end();
  } else {
    createReadStream(filePath).pipe(response);
  }
  return true;
}

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  try {
    if (await serveStatic(request, response, pathname)) return;
  } catch {
    if (!response.headersSent) {
      response.writeHead(500);
      response.end('Internal Server Error');
    }
    return;
  }

  applyHeaders(response, pathname.startsWith('/api/') ? 'no-store' : htmlCache);
  await handler(request, response);
}).listen(port, host, () => {
  console.log(`Seqtura server listening on http://${host}:${port}`);
});
