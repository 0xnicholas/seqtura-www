import { createServer, type ServerResponse } from 'node:http';

export interface FeishuRequest {
  readonly path: string;
  readonly body: Record<string, unknown>;
  readonly raw: string;
}

export interface FeishuStub {
  readonly url: string;
  readonly requests: FeishuRequest[];
  reset(): void;
  close(): Promise<void>;
}

export async function startFeishuStub(): Promise<FeishuStub> {
  const requests: FeishuRequest[] = [];
  const hanging = new Set<ServerResponse>();

  const server = createServer(async (request, response) => {
    const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const raw = Buffer.concat(chunks).toString('utf8');

    let body: Record<string, unknown> = {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      // Keep the empty body; the test asserts on what the provider sent.
    }

    requests.push({ path, body, raw });

    if (path === '/webhook/hang') {
      hanging.add(response);
      return;
    }

    if (path === '/webhook/fail') {
      response.writeHead(500, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ code: 500, msg: 'delivery failed' }));
      return;
    }

    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ code: 0, msg: 'success' }));
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Feishu stub did not bind a port');

  return {
    url: `http://127.0.0.1:${address.port}`,
    requests,
    reset: () => {
      requests.length = 0;
    },
    close: async () => {
      for (const response of hanging) response.destroy();
      hanging.clear();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
