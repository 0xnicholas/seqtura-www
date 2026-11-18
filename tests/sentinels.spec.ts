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

// ---------------------------------------------------------------------------
// §6.3 整页一致性检查（docs/visual-polish-spec.md）
// The rules live in scripts/check-consistency.mjs so CI can run them without a
// browser; these fixtures keep every rule honest.
// ---------------------------------------------------------------------------

const consistencyScript = 'scripts/check-consistency.mjs';

function runConsistencyCheck(...args: string[]) {
  return spawnSync(process.execPath, [consistencyScript, ...args], { encoding: 'utf8' });
}

const miniStackSvg = `<svg class="mini-stack" viewBox="0 0 72 56" aria-hidden="true">
    <g stroke="#171717" stroke-opacity=".18">
      <polygon points="36,8 62,18 36,28 10,18" fill="#171717" fill-opacity=".1" />
      <polygon points="10,18 36,28 36,32 10,22" fill="#171717" fill-opacity=".06" />
      <polygon points="36,28 62,18 62,22 36,32" fill="#171717" fill-opacity=".08" />
      <polygon class="mini-stack-red" points="36,20 62,30 36,40 10,30" fill-opacity=".85" />
      <polygon class="mini-stack-red" points="10,30 36,40 36,44 10,34" fill-opacity=".5" />
      <polygon class="mini-stack-red" points="36,40 62,30 62,34 36,44" fill-opacity=".65" />
      <polygon points="36,32 62,42 36,52 10,42" fill="#171717" fill-opacity=".1" />
      <polygon points="10,42 36,52 36,56 10,46" fill="#171717" fill-opacity=".06" />
      <polygon points="36,52 62,42 62,46 36,56" fill="#171717" fill-opacity=".08" />
    </g>
  </svg>`;

const consistencyBaseline: Record<string, string> = {
  'src/styles/global.css': `@theme {
  --ease-site: cubic-bezier(0.22, 0.61, 0.36, 1);
  --duration-micro: 150ms;
  --duration-enter: 600ms;
  --duration-hero: 1000ms;
  --duration-ambient: 24s;
}

@layer base {
  body {
    text-autospace: normal;
    text-spacing-trim: normal;
  }
}

@layer components {
  .type-h1:lang(zh),
  .type-h2:lang(zh) {
    font-weight: 500;
  }

  .btn {
    transition: color var(--duration-micro) var(--ease-site);
  }
}
`,
  'src/layouts/LegalPage.astro': `<h1 class="legal-title">隐私政策</h1>
<style>
  .legal-title:lang(zh) {
    font-weight: 500;
  }
</style>
`,
  'src/components/SectionHeading.astro': `<header class="section-heading reveal">
  ${miniStackSvg}
  <h2 class="section-title">{title}</h2>
</header>
<style>
  .mini-stack {
    display: block;
    height: 120px;
    margin: 0 auto 18px;
  }

  .mini-stack-red {
    fill: var(--color-red);
  }
</style>
`,
  'src/components/HomeHero.astro': `<style>
  .hero-copy > * {
    animation: blur-up var(--duration-hero) var(--ease-site) both;
  }

  .hero-copy > *:nth-child(2) {
    animation-delay: 200ms;
  }

  .hero-art {
    animation: blur-up var(--duration-hero) var(--ease-site) 1000ms both;
  }
</style>
`,
  'src/components/Anchors.astro': `<a data-primary-cta href="/">预约沟通</a>
<button data-menu-toggle>菜单</button>
<nav data-mobile-menu></nav>
<span data-footer-mark></span>
<span data-filing="icp"></span>
<article data-fit-situation></article>
`,
};

for (const hero of ['ArchitectureHero', 'MethodologyHero', 'ContactHero', 'ProcessHero']) {
  consistencyBaseline[`src/components/${hero}.astro`] = `<style>
  .hero-copy > * {
    animation: hero-in var(--duration-enter) var(--ease-site) both;
  }
</style>
`;
}

consistencyBaseline['src/pages/home.astro'] = Array.from(
  { length: 18 },
  (_, index) => `<SectionHeading id="s${index}" kicker="k" title="t" />`,
).join('\n');

function consistencyFixture(overrides: Record<string, string> = {}) {
  const root = fixture({ ...consistencyBaseline, ...overrides });
  fixtures.push(root);
  return root;
}

test('a compliant source tree passes every §6.3 rule', () => {
  const result = runConsistencyCheck('--root', consistencyFixture());

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('Consistency check passed');
});

test('legacy brand reds fail the consistency check', () => {
  const root = consistencyFixture({
    'src/components/Old.astro':
      '<style>.glow { box-shadow: 0 0 40px rgb(245 48 3 / 12%); color: #F53003; }</style>',
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('legacy-red');
  expect(result.stderr).toContain('src/components/Old.astro');
});

test('bare durations in interaction declarations fail the consistency check', () => {
  const root = consistencyFixture({
    'src/styles/global.css': `${consistencyBaseline['src/styles/global.css']}
.legacy-btn {
  transition: color 150ms ease-out;
}
`,
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('duration-tokens');
  expect(result.stderr).toContain('150ms');
});

test('the inner-page hero entrance must use the duration token', () => {
  const root = consistencyFixture({
    'src/components/ArchitectureHero.astro': `<style>
  .hero-copy > * {
    animation: hero-in 600ms var(--ease-site) both;
  }
</style>
`,
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('hero-entrance');
});

test('body-level autospace and punctuation trim are required', () => {
  const root = consistencyFixture({
    'src/styles/global.css': consistencyBaseline['src/styles/global.css'].replace(
      '    text-autospace: normal;\n',
      '',
    ),
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('autospace');
  expect(result.stderr).toContain('text-autospace');
});

test('Chinese heading weights need scoped :lang(zh) rules', () => {
  const root = consistencyFixture({
    'src/styles/global.css': consistencyBaseline['src/styles/global.css'].replace(
      '    font-weight: 500;\n  }\n\n  .btn',
      '    font-weight: 400;\n  }\n\n  .btn',
    ),
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('zh-weights');
});

test('the mini stack must stay a single-point implementation', () => {
  const root = consistencyFixture({
    'src/components/Stray.astro': '<svg class="mini-stack" viewBox="0 0 72 56"></svg>',
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('mini-stack');
  expect(result.stderr).toContain('src/components/Stray.astro');
});

test('the mini stack must render at all 18 section headings', () => {
  const root = consistencyFixture({
    'src/pages/home.astro': Array.from(
      { length: 17 },
      (_, index) => `<SectionHeading id="s${index}" kicker="k" title="t" />`,
    ).join('\n'),
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('18');
});

test('the six test anchors must survive and the dead ones stay gone', () => {
  const root = consistencyFixture({
    'src/components/Anchors.astro': `<a data-primary-cta href="/">预约沟通</a>
<button data-menu-toggle>菜单</button>
<nav data-mobile-menu></nav>
<span data-footer-mark></span>
<span data-filing="icp"></span>
<article data-fit-situation data-proof-intro></article>
`,
  });

  const result = runConsistencyCheck('--root', root);

  expect(result.status).toBe(1);
  expect(result.stderr).toContain('anchors');
});

test('the repository itself satisfies the visual-polish consistency rules', () => {
  const result = runConsistencyCheck();

  expect(result.status, result.stderr).toBe(0);
});
