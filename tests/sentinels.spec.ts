import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const script = 'scripts/check-sentinels.mjs';

function runSentinelCheck(root: string) {
  return spawnSync(process.execPath, [script, '--root', root], {
    encoding: 'utf8',
  });
}

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'seqtura-sentinel-'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

const fixtures: string[] = [];

test.afterAll(() => {
  for (const root of fixtures) rmSync(root, { recursive: true, force: true });
});

test('clean production-like output passes the sentinel scan', () => {
  const root = fixture({
    'index.html': '<p>企业 AI Agent 的工程化交付</p>',
    'assets/site.js': 'document.documentElement.dataset.ready = "true";',
    'assets/site.css': '.btn { color: #c42602; }',
  });
  fixtures.push(root);

  const result = runSentinelCheck(root);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('Sentinel check passed');
});

for (const sentinel of ['【', '待补', '占位', 'example']) {
  test(`the scan fails on ${sentinel}`, () => {
    const root = fixture({
      'index.html': '<p>clean</p>',
      'assets/app.js': `const message = "标记：${sentinel}";`,
    });
    fixtures.push(root);

    const result = runSentinelCheck(root);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Sentinel check failed');
    expect(result.stderr).toContain('assets/app.js');
  });
}

test('only html, js and css files are scanned', () => {
  const root = fixture({
    'index.html': '<p>clean</p>',
    'note.md': 'example 和【待补】不在扫描范围',
  });
  fixtures.push(root);

  const result = runSentinelCheck(root);
  expect(result.status, result.stderr).toBe(0);
});

test('the production client build is free of sentinels', () => {
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });

  expect(result.status, result.stderr).toBe(0);
});
