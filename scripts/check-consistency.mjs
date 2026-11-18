// §6.3 整页一致性检查（docs/visual-polish-spec.md）— static acceptance rules.
//
// This is the grep half of the visual-polish acceptance list: it reads the
// source tree instead of the rendered pages, so it can run in CI before, and
// independently of, the browser suites. The rendered-copy assertions
// (hand-written CJK-Latin spaces, reveal behaviour, diagram density) live in
// tests/*.spec.ts, where visibility and computed styles are observable.
//
// Usage: node scripts/check-consistency.mjs [--root <directory>]

import { readdir, readFile, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const SOURCE_ROOT = 'src';
const ASSET_ROOT = 'public';
const sourceExtensions = new Set([
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.mdx',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
]);
const skippedDirectories = new Set(['.git', 'node_modules']);

const heroComponents = ['ArchitectureHero', 'MethodologyHero', 'ContactHero', 'ProcessHero'];
const heroEntrance = 'var(--duration-enter) var(--ease-site) both';
// §4 区块 1: the hero entrance ladder is a deliberate one-off, not tokenised.
const heroLadderDelays = new Set(['0ms', '200ms', '400ms', '600ms', '800ms', '1000ms']);
const reducedMotionDuration = '0.01ms';
const miniStackRedFaces = [
  '36,20 62,30 36,40 10,30',
  '10,30 36,40 36,44 10,34',
  '36,40 62,30 62,34 36,44',
];
const sectionHeadingCount = 18; // spec §6.3: home 4 + inner pages 14
const requiredAnchors = [
  'data-fit-situation',
  'data-primary-cta',
  'data-menu-toggle',
  'data-mobile-menu',
  'data-footer-mark',
  'data-filing',
];
const removedAnchors = ['data-proof-intro', 'data-proof-fact'];

function parseRoot(args) {
  const flag = args.indexOf('--root');
  if (flag === -1) return '.';
  const value = args[flag + 1];
  if (!value) {
    console.error('Usage: node scripts/check-consistency.mjs [--root <directory>]');
    process.exit(2);
  }
  return value;
}

function position(source, index) {
  const before = source.slice(0, index);
  const line = before.split('\n').length;
  const column = index - before.lastIndexOf('\n');
  return { line, column };
}

async function collectFiles(directory, prefix) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    if (skippedDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path, relativePath)));
    } else if (entry.isFile()) {
      const extension = entry.name.slice(entry.name.lastIndexOf('.'));
      if (!sourceExtensions.has(extension)) continue;
      files.push({ path: relativePath, text: await readFile(path, 'utf8') });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

// Prefer a block's selector text so `.type-h1:lang(zh)` can be located.
function ruleBlocks(text) {
  const blocks = [];
  for (const match of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1]
      .replace(/^[\s;]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    blocks.push({ selector, body: match[2], index: match.index + match[0].indexOf(match[1]) });
  }
  return blocks;
}

function hasDeclarations(body, declarations) {
  return declarations.every(([property, value]) =>
    new RegExp(`${property}\\s*:\\s*${value}(?![\\w-])`).test(body),
  );
}

function checkLegacyRed(context, report) {
  const patterns = [
    { pattern: /rgb\(\s*245\s+48\s+3\b/gi, label: 'rgb(245 48 3 …)' },
    { pattern: /#f53003/gi, label: '#f53003' },
    { pattern: /#c42602/gi, label: '#c42602' },
    { pattern: /#a11d00/gi, label: '#a11d00' },
  ];
  for (const file of context.files) {
    for (const { pattern, label } of patterns) {
      for (const match of file.text.matchAll(pattern)) {
        report(file, match.index, `legacy brand red ${label} — use the §3.1 token values`);
      }
    }
  }
}

function durationIsAllowed(file, property, value, literal) {
  if (literal === reducedMotionDuration) return true;
  if (file.path !== 'src/components/HomeHero.astro') return false;
  if (property === 'animation-delay') return heroLadderDelays.has(literal);
  return property === 'animation' && literal === '1000ms' && value.includes('var(--duration-hero)');
}

function checkDurationTokens(context, report) {
  const declarationPattern = /(?:^|[\s;{}])((?:transition|animation)(?:-[a-z]+)?)\s*:\s*([^;{}]*)/g;
  const timePattern = /\b\d+(?:\.\d+)?m?s\b/g;
  for (const file of context.sourceFiles) {
    if (!/\.(?:astro|css|js|ts)$/.test(file.path)) continue;
    for (const declaration of file.text.matchAll(declarationPattern)) {
      const property = declaration[1];
      const value = declaration[2];
      const valueIndex = declaration.index + declaration[0].length - value.length;
      for (const time of value.matchAll(timePattern)) {
        if (durationIsAllowed(file, property, value, time[0])) continue;
        report(
          file,
          valueIndex + time.index,
          `bare duration ${time[0]} in a ${property} declaration — use a var(--duration-*) token`,
        );
      }
    }
  }
}

function checkHeroEntrance(context, report) {
  for (const hero of heroComponents) {
    const path = `src/components/${hero}.astro`;
    const file = context.byPath.get(path);
    if (!file) {
      report(path, 0, `missing inner-page hero — expected animation: hero-in ${heroEntrance}`);
      continue;
    }
    const declarations = [...file.text.matchAll(/animation\s*:\s*hero-in([^;{}]*)/g)];
    if (declarations.length === 0) {
      report(file, 0, `expected animation: hero-in ${heroEntrance}`);
      continue;
    }
    for (const declaration of declarations) {
      const value = declaration[1].replace(/\s+/g, ' ').trim();
      if (value !== heroEntrance) {
        report(
          file,
          declaration.index,
          `hero-in must use ${heroEntrance}; found "hero-in ${value}"`,
        );
      }
    }
  }
  for (const file of context.sourceFiles) {
    if (heroComponents.some((hero) => file.path === `src/components/${hero}.astro`)) continue;
    for (const match of file.text.matchAll(/animation\s*:\s*hero-in/g)) {
      report(file, match.index, 'hero-in is reserved for the four inner-page heroes');
    }
  }
}

function checkAutospace(context, report) {
  const file = context.byPath.get('src/styles/global.css');
  if (!file) {
    report('src/styles/global.css', 0, 'missing global stylesheet');
    return;
  }
  const bodyBlocks = [...file.text.matchAll(/(?:^|[\s,}])body\s*\{([^{}]*)\}/g)].map(
    (match) => match[1],
  );
  for (const [property, value] of [
    ['text-autospace', 'normal'],
    ['text-spacing-trim', 'normal'],
  ]) {
    if (!bodyBlocks.some((block) => hasDeclarations(block, [[property, value]]))) {
      report(file, 0, `body must declare ${property}: ${value} (§3.2)`);
    }
  }
}

function checkZhWeights(context, report) {
  const globalCss = context.byPath.get('src/styles/global.css');
  const legalPage = context.byPath.get('src/layouts/LegalPage.astro');
  const expectations = [
    { file: globalCss, path: 'src/styles/global.css', selector: '.type-h1:lang(zh)' },
    { file: globalCss, path: 'src/styles/global.css', selector: '.type-h2:lang(zh)' },
    { file: legalPage, path: 'src/layouts/LegalPage.astro', selector: '.legal-title:lang(zh)' },
  ];
  for (const { file, path, selector } of expectations) {
    if (!file) {
      report(path, 0, `missing stylesheet for ${selector}`);
      continue;
    }
    const block = ruleBlocks(file.text).find((candidate) => candidate.selector.includes(selector));
    if (!block) {
      report(file, 0, `missing ${selector} rule (§3.2 scheme c)`);
    } else if (!/font-weight\s*:\s*500\b/.test(block.body)) {
      report(file, block.index, `${selector} must set font-weight: 500`);
    }
  }
}

function checkMiniStack(context, report) {
  const path = 'src/components/SectionHeading.astro';
  const file = context.byPath.get(path);
  if (!file) {
    report(path, 0, 'missing SectionHeading — the mini stack is rendered there');
    return;
  }

  const svgTags = [...file.text.matchAll(/<svg\b[^>]*class="mini-stack"[^>]*>/g)];
  if (svgTags.length !== 1) {
    report(file, 0, `expected exactly one ${'<svg class="mini-stack">'}; found ${svgTags.length}`);
  } else {
    const tag = svgTags[0][0];
    if (!tag.includes('viewBox="0 0 72 56"')) {
      report(file, svgTags[0].index, 'the mini stack must keep viewBox="0 0 72 56"');
    }
    if (!tag.includes('aria-hidden="true"')) {
      report(file, svgTags[0].index, 'the mini stack is decorative and must stay aria-hidden');
    }
  }

  const redFaces = [...file.text.matchAll(/<polygon\b[^>]*class="mini-stack-red"[^>]*>/g)];
  const redPoints = redFaces.map((face) => /points="([^"]*)"/.exec(face[0])?.[1].trim());
  if (redFaces.length !== miniStackRedFaces.length) {
    report(
      file,
      redFaces[0]?.index ?? 0,
      `expected ${miniStackRedFaces.length} red slab faces; found ${redFaces.length}`,
    );
  } else if (!miniStackRedFaces.every((points) => redPoints.includes(points))) {
    report(file, redFaces[0]?.index ?? 0, 'the red slab must stay the middle layer (§4 区块 3)');
  }

  const blocks = ruleBlocks(file.text);
  const stackBlock = blocks.find(
    (block) =>
      /(?:^|[\s,])\.mini-stack(?:[\s,{]|$)/.test(block.selector) &&
      !block.selector.includes('-red'),
  );
  if (!stackBlock) {
    report(file, 0, 'missing .mini-stack sizing rule');
  } else if (!hasDeclarations(stackBlock.body, [['height', '120px']])) {
    report(file, stackBlock.index, '.mini-stack must render at height: 120px');
  }
  const redBlock = blocks.find((block) => block.selector.includes('.mini-stack-red'));
  if (!redBlock) {
    report(file, 0, 'missing .mini-stack-red fill rule');
  } else if (!hasDeclarations(redBlock.body, [['fill', 'var\\(--color-red\\)']])) {
    report(file, redBlock.index, '.mini-stack-red must fill with var(--color-red)');
  }

  for (const other of context.sourceFiles) {
    if (other.path === path) continue;
    for (const match of other.text.matchAll(/mini-stack(?:-red)?\b/g)) {
      report(
        other,
        match.index,
        'the mini stack is a single-point implementation — only SectionHeading may reference it',
      );
    }
  }

  const usages = context.sourceFiles.reduce(
    (total, candidate) => total + [...candidate.text.matchAll(/<SectionHeading\b/g)].length,
    0,
  );
  if (usages !== sectionHeadingCount) {
    report(
      'src',
      0,
      `expected ${sectionHeadingCount} <SectionHeading> usages (home 4 + inner pages 14); found ${usages}`,
    );
  }
}

function checkAnchors(context, report) {
  for (const anchor of requiredAnchors) {
    const file = context.sourceFiles.find((candidate) => candidate.text.includes(anchor));
    if (!file) report('src', 0, `required test anchor ${anchor} is missing (§6.3)`);
  }
  for (const anchor of removedAnchors) {
    for (const file of context.sourceFiles) {
      for (const match of file.text.matchAll(new RegExp(anchor, 'g'))) {
        report(file, match.index, `dead attribute ${anchor} should stay removed`);
      }
    }
  }
}

const rules = [
  { id: 'legacy-red', check: checkLegacyRed },
  { id: 'duration-tokens', check: checkDurationTokens },
  { id: 'hero-entrance', check: checkHeroEntrance },
  { id: 'autospace', check: checkAutospace },
  { id: 'zh-weights', check: checkZhWeights },
  { id: 'mini-stack', check: checkMiniStack },
  { id: 'anchors', check: checkAnchors },
];

const root = resolve(parseRoot(process.argv.slice(2)));

try {
  const info = await stat(root);
  if (!info.isDirectory()) throw new Error('not a directory');
} catch {
  console.error(`Consistency check failed: ${root} is not a directory.`);
  process.exit(1);
}

const sourceFiles = await collectFiles(resolve(root, SOURCE_ROOT), SOURCE_ROOT);
if (sourceFiles.length === 0) {
  console.error(
    `Consistency check failed: no source files found under ${resolve(root, SOURCE_ROOT)}.`,
  );
  process.exit(1);
}
const assetFiles = await collectFiles(resolve(root, ASSET_ROOT), ASSET_ROOT);

const context = {
  sourceFiles,
  files: [...sourceFiles, ...assetFiles],
  byPath: new Map(sourceFiles.map((file) => [file.path, file])),
};

const violations = [];
for (const rule of rules) {
  rule.check(context, (file, index, message) => {
    const path = typeof file === 'string' ? file : file.path;
    const source = typeof file === 'string' ? '' : file.text;
    const { line, column } = source ? position(source, index) : { line: 0, column: 0 };
    violations.push({ rule: rule.id, path, line, column, message });
  });
}

violations.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.column - b.column);

for (const violation of violations) {
  const location = violation.line > 0 ? `:${violation.line}:${violation.column}` : '';
  console.error(
    `${relative(process.cwd(), resolve(root, violation.path))}${location} ${violation.rule}: ${violation.message}`,
  );
}

if (violations.length > 0) {
  console.error(`Consistency check failed: ${violations.length} violation(s) in ${root}.`);
  process.exit(1);
}

console.log(
  `Consistency check passed: ${rules.length} rules over ${sourceFiles.length} source files.`,
);
