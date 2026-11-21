import { expect, test } from '@playwright/test';

test('process hero frames the six-stage cooperation path and routes both actions', async ({
  page,
}) => {
  const response = await page.goto('/process');

  expect(response?.status()).toBe(200);
  const main = page.getByRole('main');
  await expect(main.locator('h1')).toHaveCount(1);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText('从第一次沟通，到上线之后');
  await expect(main.getByText('合作流程', { exact: true })).toBeVisible();
  await expect(
    main.getByText('六个合作阶段：每段做什么、需要你投入什么、到哪里为止。'),
  ).toBeVisible();
  await expect(main.getByRole('link', { name: '开始第一次沟通' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );
  await expect(main.getByRole('link', { name: '看技术架构' })).toHaveAttribute(
    'href',
    '/architecture',
  );
  await expect(page.locator('.preview-note')).toHaveCount(0);
});

test('process flow shows six nodes with typical durations, client roles and three dashed branches', async ({
  page,
}) => {
  await page.goto('/process');

  const section = page.locator('section#stages');
  await expect(section).toHaveCount(1);

  const flow = section.locator('[data-process-flow]');
  const nodes = flow.locator('[data-flow-node]');
  await expect(nodes).toHaveCount(6);

  const names = [
    '初次沟通',
    '需求与可行性评估',
    '方案与报价',
    '合同与启动',
    '交付与验收',
    '上线后支持',
  ];
  const durations = ['1次', '1–2周', '3–5个工作日', '1–2周', '4–12周', '按合同'];
  const roles = [
    '业务发起人',
    '业务专家 + IT + sponsor',
    'sponsor',
    '采购 + 对接人',
    '业务专家 + IT + 验收人',
    '运维 + 业务负责人',
  ];

  for (let index = 0; index < names.length; index += 1) {
    const node = nodes.nth(index);
    await expect(node.locator('[data-flow-name]')).toHaveText(names[index]);
    await expect(node.locator('[data-flow-duration]')).toHaveText(durations[index]);
    await expect(node.locator('[data-flow-role]')).toHaveText(roles[index]);
  }

  const branches = flow.locator('[data-flow-branch]');
  await expect(branches).toHaveCount(3);
  await expect(branches.nth(0)).toContainText('评估后');
  await expect(branches.nth(0)).toContainText('不做 / 先做别的');
  await expect(branches.nth(0)).toContainText('折回起点或终止');
  await expect(branches.nth(1)).toContainText('报价后');
  await expect(branches.nth(1)).toContainText('暂不推进');
  await expect(branches.nth(1)).toContainText('终止');
  await expect(branches.nth(2)).toContainText('支持期发现新场景');
  await expect(branches.nth(2)).toContainText('回到“方案与报价”，按新项目走');

  await expect(flow.getByText('实线 = 正常推进')).toBeVisible();
  await expect(flow.getByText('虚线 = 可选或终止')).toBeVisible();
  await expect(flow.getByText('典型路径，实际以合同为准。')).toBeVisible();
});

test('process stage table carries cycle, participants, client input, outputs, boundary and copy', async ({
  page,
}) => {
  await page.goto('/process');

  const section = page.locator('section#stages');
  const table = section.locator('[data-stage-table]');
  await expect(table).toBeVisible();

  for (const header of ['阶段', '周期', '参与人', '客户投入', '产出', '边界']) {
    await expect(table.getByRole('columnheader', { name: header })).toBeVisible();
  }

  const rows = table.locator('[data-stage-row]');
  await expect(rows).toHaveCount(6);

  const stages = [
    {
      id: 'intro',
      name: '初次沟通',
      cycle: '1次沟通',
      client: '业务发起人，技术对接人可同来',
      copy: '围绕一个具体业务场景，说明现状、瓶颈与预期结果。沟通结束给出判断：是否值得进入评估。',
    },
    {
      id: 'assessment',
      name: '需求与可行性评估',
      cycle: '1–2周',
      client: '业务专家 + IT / 数据对接人 + 业务sponsor',
      copy: '核定范围、前提与风险，给出结论：做、不做，或先做哪一步。',
    },
    {
      id: 'proposal',
      name: '方案与报价',
      cycle: '3–5个工作日',
      client: '业务sponsor，采购 / 法务按需',
      copy: '按已确认范围报价，验收标准随报价一并给出。范围变动重新报价；范围未定不出价。',
    },
    {
      id: 'contract',
      name: '合同与启动',
      cycle: '1–2周，取决于采购流程',
      client: '采购 / 法务 + 业务sponsor + 项目对接人',
      copy: '合同生效后开工。启动会确定对接人、验收人与交付排期；采购周期不计入交付周期。',
    },
    {
      id: 'delivery',
      name: '交付与验收',
      cycle: '4–12周，视范围，以报价排期为基准',
      client: '业务专家 + IT（环境与权限）+ 验收人',
      copy: '按周交付，按合同的验收标准逐项判定。验收以记录与评测结果为依据，不以演示为准。',
    },
    {
      id: 'support',
      name: '上线后支持',
      cycle: '按合同约定，按次或按项目，不做年度订阅',
      client: '运维对接人 + 业务负责人',
      copy: '按约定范围处理问题与迭代，按次或按项目另行约定。新场景按新项目立项。',
    },
  ] as const;

  for (const expected of stages) {
    const row = table.locator(`[data-stage-row="${expected.id}"]`);
    await expect(row).toHaveCount(1);
    await expect(row.locator('[data-stage-name]')).toHaveText(expected.name);
    await expect(row.locator('[data-stage-duration]')).toHaveText(expected.cycle);
    await expect(row.locator('[data-stage-client]')).toContainText(expected.client);
    await expect(row.locator('[data-stage-copy]')).toHaveText(expected.copy);
    await expect(row.locator('[data-stage-investment]')).not.toBeEmpty();
    await expect(row.locator('[data-stage-outputs]')).not.toBeEmpty();
    await expect(row.locator('[data-stage-boundary]')).not.toBeEmpty();
  }

  await expect(section.locator('[data-process-stage-card]')).toHaveCount(6);
  await expect(section.getByRole('link', { name: '工作方法' })).toHaveAttribute(
    'href',
    '/methodology#stages',
  );
});

test('pricing principles state the commercial model and the support boundary', async ({ page }) => {
  await page.goto('/process');

  const section = page.locator('section#pricing');
  await expect(section).toHaveCount(1);
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('项目制，按范围报价。');

  const principles = section.locator('[data-pricing-principle]');
  await expect(principles).toHaveCount(6);

  for (const [title, phrases] of [
    ['项目制', ['按场景与交付范围报价', '不做订阅制']],
    ['按里程碑付款', ['启动款 + 里程碑 + 验收尾款', '比例与节点写进合同']],
    ['范围变更重新报价', ['不按人天追加', '范围未定不报固定总价、不报固定工期']],
    [
      '最小项目规模',
      ['一个能真正上线的Agent场景', '不接只做演示、只评估不上线、或纯人力外包的项目'],
    ],
    ['上线后支持', ['按次或按项目另行约定，不做年度订阅']],
    ['价格不公开', ['不公开起步价、区间与套餐', '报价随方案给']],
  ] as const) {
    const card = section.locator('[data-pricing-principle]', {
      has: page.getByRole('heading', { name: title }),
    });
    await expect(card, title).toHaveCount(1);
    for (const phrase of phrases) {
      await expect(card, title).toContainText(phrase);
    }
  }

  const support = page.locator('#support');
  await expect(support).toHaveCount(1);
  await expect(support.getByRole('heading', { level: 3 })).toHaveText(
    '上线后支持，按约定范围处理。',
  );
  await expect(support.locator('[data-support-boundary]')).toHaveCount(3);
  for (const boundary of [
    '不含新场景开发，按新项目走。',
    '不含7×24值守。',
    '响应与范围逐次约定。',
  ]) {
    await expect(support.getByText(boundary, { exact: true })).toBeVisible();
  }
});

test('process page stays within its scope and resolves all three anchors', async ({ page }) => {
  await page.goto('/process');

  const main = page.getByRole('main');
  await expect(main.locator(':scope > section')).toHaveCount(3);
  await expect(main.locator('section#next-step')).toHaveCount(0);
  await expect(main.locator('a[data-primary-cta]')).toHaveCount(1);
  await expect(main.getByRole('link', { name: '开始第一次沟通' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );

  for (const bannedHeading of ['不承诺什么', '首次沟通方式']) {
    await expect(main.getByRole('heading', { name: bannedHeading })).toHaveCount(0);
    await expect(main.getByText(bannedHeading, { exact: true })).toHaveCount(0);
  }

  const text = await main.innerText();
  for (const banned of [
    'Discover',
    'Diagnose',
    'Define',
    'Design',
    'Build',
    'Validate',
    'Deploy',
    'Optimize',
  ]) {
    expect(text, `process page must not restate delivery stage ${banned}`).not.toContain(banned);
  }
  for (const sentinel of ['待补', '占位', 'example', '【']) {
    expect(text, `process page must not contain sentinel ${sentinel}`).not.toContain(sentinel);
  }

  for (const id of ['stages', 'pricing', 'support']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(main.getByRole('link', { name: '工作方法' })).toHaveAttribute(
    'href',
    '/methodology#stages',
  );

  await page.goto('/process#support');
  await expect(page.locator('#support')).toBeInViewport();
});

test('process keeps one H1 and never skips a heading level', async ({ page }) => {
  await page.goto('/process');

  const main = page.getByRole('main');
  await expect(main.locator('h1')).toHaveCount(1);

  const levels = await main
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((elements) => elements.map((element) => Number(element.tagName.slice(1))));

  for (let index = 1; index < levels.length; index += 1) {
    expect(
      levels[index] - levels[index - 1],
      `heading jumps from h${levels[index - 1]} to h${levels[index]}`,
    ).toBeLessThanOrEqual(1);
  }
});

test.describe('process at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('stacks the flow and replaces the stage table with collapsible cards', async ({ page }) => {
    await page.goto('/process');

    await expect(page.locator('[data-stage-table]')).toBeHidden();
    const cards = page.locator('[data-process-stage-card]');
    await expect(cards).toHaveCount(6);
    await expect(cards.first()).toBeVisible();

    for (const card of await cards.all()) {
      await expect(card).not.toHaveAttribute('open', '');
    }

    const ids = await cards.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-process-stage-card')),
    );
    expect(ids).toEqual(['intro', 'assessment', 'proposal', 'contract', 'delivery', 'support']);

    const first = cards.first();
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(first.getByText('不出方案、不报价、不做技术验证')).toBeVisible();
    await expect(first.locator('summary').getByText('1次沟通')).toBeVisible();

    const second = cards.nth(1);
    await second.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');

    const flowColumns = await page.locator('[data-flow-track]').evaluate((element) =>
      getComputedStyle(element)
        .gridTemplateColumns.split(' ')
        .filter((value) => value.length > 0),
    );
    expect(flowColumns).toHaveLength(1);
    await expect(page.locator('[data-flow-returns]')).toBeHidden();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('every section heading renders the mini isometric stack', async ({ page }) => {
  await page.goto('/process');

  const stacks = page.locator('.section-heading svg.mini-stack');
  await expect(stacks).toHaveCount(2);
  await expect(page.locator('.mini-stack')).toHaveCount(2);

  for (const stack of await stacks.all()) {
    await expect(stack).toHaveAttribute('aria-hidden', 'true');
    await expect(stack).toHaveCSS('height', '120px');
  }
});

test('process hero enters with the shared hero-in motion and stills under reduced motion', async ({
  page,
}) => {
  await page.goto('/process');

  const copy = page.locator('.process-hero .hero-copy');
  await expect(copy).toHaveCSS('animation-name', 'hero-in');
  await expect(copy).toHaveCSS('animation-duration', '0.6s');
  await expect(copy).toHaveCSS('animation-timing-function', 'cubic-bezier(0.22, 0.61, 0.36, 1)');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(copy).toHaveCSS('animation-name', 'none');
});

test('tabular numerals stay scoped to the cycle column and flow durations (E6)', async ({
  page,
}) => {
  await page.goto('/process');

  for (const cell of await page.locator('.stage-duration').all()) {
    await expect(cell).toHaveCSS('font-variant-numeric', 'tabular-nums');
  }
  for (const cell of await page.locator('.flow-duration').all()) {
    await expect(cell).toHaveCSS('font-variant-numeric', 'tabular-nums');
  }
  for (const no of await page.locator('.stage-no, .flow-no').all()) {
    await expect(no).toHaveCSS('font-variant-numeric', 'normal');
  }
});

test('process page keeps reveal limited to its two section headings', async ({ page }) => {
  await page.goto('/process');

  await expect(page.locator('.section-heading.reveal')).toHaveCount(2);
  await expect(page.locator('.reveal')).toHaveCount(2);
  await expect(page.locator('.process-flow.reveal')).toHaveCount(0);
  await expect(page.locator('[data-deployment-bar].reveal')).toHaveCount(0);
});
