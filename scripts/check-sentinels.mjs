import { readdir, readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const sentinelPattern = /【|待补|占位|example/gi;
const extensions = new Set(['.html', '.js', '.css']);

function parseRoot(args) {
  const flag = args.indexOf('--root');
  if (flag === -1) return 'dist/client';
  const value = args[flag + 1];
  if (!value) {
    console.error('Usage: node scripts/check-sentinels.mjs [--root <directory>]');
    process.exit(2);
  }
  return value;
}

const root = resolve(parseRoot(process.argv.slice(2)));

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile() && extensions.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      files.push(path);
    }
  }
  return files;
}

function findMatches(source) {
  const matches = [];
  const lines = source.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const match of line.matchAll(sentinelPattern)) {
      matches.push({ line: index + 1, column: (match.index ?? 0) + 1, sentinel: match[0] });
    }
  }
  return matches;
}

try {
  const info = await stat(root);
  if (!info.isDirectory()) throw new Error('not a directory');
} catch {
  console.error(`Sentinel check failed: ${root} is not a directory. Run pnpm build first.`);
  process.exit(1);
}

const files = await collectFiles(root);
if (files.length === 0) {
  console.error(`Sentinel check failed: no html, js or css files found under ${root}.`);
  process.exit(1);
}

let failureCount = 0;
for (const file of files.sort()) {
  const matches = findMatches(await readFile(file, 'utf8'));
  for (const match of matches) {
    failureCount += 1;
    console.error(
      `${relative(process.cwd(), file)}:${match.line}:${match.column} sentinel "${match.sentinel}"`,
    );
  }
}

if (failureCount > 0) {
  console.error(`Sentinel check failed: ${failureCount} match(es) in ${root}.`);
  process.exit(1);
}

console.log(`Sentinel check passed: ${files.length} files scanned under ${root}.`);
