import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const [root = 'dist', portArg = '4321'] = process.argv.slice(2);
const port = Number(portArg);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  const filePath = pathname.endsWith('/')
    ? join(root, pathname, 'index.html')
    : extname(pathname)
      ? join(root, pathname)
      : join(root, pathname, 'index.html');

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    response.end(body);
  } catch {
    try {
      const body = await readFile(join(root, '404.html'));
      response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  }
}).listen(port, '127.0.0.1');
