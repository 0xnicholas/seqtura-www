import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';

export interface TestServer {
  readonly baseURL: string;
  readonly child: ChildProcess;
  output(): string;
  stop(): Promise<void>;
}

async function waitForServer(baseURL: string, child: ChildProcess): Promise<void> {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Test server exited with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Test server did not start at ${baseURL}`);
}

export async function startTestServer(
  port: number,
  env: Record<string, string | undefined> = {},
): Promise<TestServer> {
  if (!existsSync('dist/server/entry.mjs')) {
    throw new Error('Run pnpm build before starting a test server');
  }

  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
  };
  for (const [key, value] of Object.entries(env)) {
    // Deleting the key lets a test verify behavior when the variable is unset.
    if (value === undefined) delete childEnv[key];
    else childEnv[key] = value;
  }

  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: process.cwd(),
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  const baseURL = `http://127.0.0.1:${port}`;
  await waitForServer(baseURL, child);

  return {
    baseURL,
    child,
    output: () => output,
    stop: async () => {
      if (child.exitCode === null) {
        child.kill('SIGTERM');
        await once(child, 'exit');
      }
    },
  };
}
