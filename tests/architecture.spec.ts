import { expect, test } from '@playwright/test';

const conclusions = [
  'Agent 不是一个模型调用，而是一条有状态的执行链：接入 → 编排 → 模型 → 工具 / 知识 → 人 → 输出。',
  '敢上线靠三条横切控制面：身份与权限、评测与可观测、策略与审计；安全不是最后一层。',
  '架构按交付边界划分：我们交付组件与模式，客户保留系统、数据、身份与审批权。',
];

const layerRows = [
  {
    id: 'ingress',
    name: '接入与编排',
    label: 'Ingress & Orchestration',
    responsibility: '任务从哪来',
    constraint: 'Workflow 可预测但覆盖有限',
    practice: '先 workflow 后 agent',
  },
  {
    id: 'models',
    name: '模型',
    label: 'Models',
    responsibility: '选模型、降级、控制质量',
    constraint: '路由受最小模型上下文限制',
    practice: '按可替换设计',
  },
  {
    id: 'tools',
    name: '工具与系统集成',
    label: 'Tools & Integration',
    responsibility: '把客户系统暴露为 Agent 可调用的工具',
    constraint: '工具是权限边界',
    practice: '按标准协议接入',
  },
  {
    id: 'knowledge',
    name: '知识与记忆',
    label: 'Knowledge & Memory',
    responsibility: '让 Agent 拿到正确的业务知识',
    constraint: '检索必须带权限过滤',
    practice: '短期会话状态与长期记忆分开',
  },
  {
    id: 'runtime',
    name: '运行时与部署',
    label: 'Runtime & Deployment',
    responsibility: 'Agent 跑在哪',
    constraint: '部署形态决定数据边界',
    practice: '按三档部署模型',
  },
];

test('architecture hero frames the reference architecture and routes both actions', async ({
  page,
}) => {
  const response = await page.goto('/architecture');

  expect(response?.status()).toBe(200);
  const main = page.getByRole('main');
  await expect(main.locator('h1')).toHaveCount(1);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    '一个能上生产的 Agent 系统，由什么构成',
  );
  await expect(main.getByText('技术架构 / 交付参考架构')).toBeVisible();
  await expect(
    main.getByText(
      '可私有化、可审计、模型可替换的交付参考架构；从一次任务的进入，到上线后的迭代。',
    ),
  ).toBeVisible();

  const tags = main.locator('[data-hero-tag]');
  await expect(tags).toHaveCount(3);
  await expect(tags).toHaveText(['可私有化', '可审计', '模型可替换']);

  await expect(main.getByRole('link', { name: '和架构师聊聊' }).first()).toHaveAttribute(
    'href',
    '/contact#book',
  );
  await expect(main.getByRole('link', { name: '看工作方法论' }).first()).toHaveAttribute(
    'href',
    '/methodology',
  );
  await expect(page.locator('.preview-note')).toHaveCount(0);
});

test('overview states the three conclusions and draws a readable layered schematic', async ({
  page,
}) => {
  await page.goto('/architecture');

  const section = page.locator('section#overview');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '一张图，看清系统、控制面与交付边界。',
  );

  const items = section.locator('[data-arch-conclusion]');
  await expect(items).toHaveCount(3);
  for (const [index, conclusion] of conclusions.entries()) {
    await expect(items.nth(index)).toContainText(conclusion);
  }

  const diagram = section.locator('[data-arch-diagram]');
  await expect(diagram).toHaveAttribute('role', 'img');
  await expect(diagram).toHaveAccessibleName(/五层能力栈.*三条控制面/);
  await expect(diagram.locator('[data-map-layer]')).toHaveCount(5);
  const layerIds = await diagram
    .locator('[data-map-layer]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-map-layer')));
  expect(layerIds).toEqual(['ingress', 'models', 'tools', 'knowledge', 'runtime']);
  for (const layer of layerRows) {
    await expect(diagram.getByText(layer.name, { exact: true })).toBeVisible();
  }

  const legend = section.locator('[data-legend-item]');
  await expect(legend).toHaveCount(7);
  for (const label of [
    '实线 = 请求 / 数据流',
    '虚线 = 控制 / 遥测',
    '锁 = 权限检查点',
    '人 = HITL gate',
    '点线 = trace',
    '记录 = audit',
    '虚线框 = Seqtura 交付边界',
  ]) {
    await expect(section.getByText(label, { exact: true })).toBeVisible();
  }

  const tiers = section.locator('[data-deployment-tier]');
  await expect(tiers).toHaveCount(3);
  for (const [id, name] of [
    ['saas', 'SaaS'],
    ['dedicated', '专属实例'],
    ['self-hosted', '自托管'],
  ] as const) {
    const tier = section.locator(`[data-deployment-tier="${id}"]`);
    await expect(tier.getByRole('heading', { name, exact: true })).toBeVisible();
    for (const label of ['谁运维', '数据在哪', '模型能否离线', '选择依据']) {
      await expect(tier.getByText(label, { exact: true })).toBeVisible();
    }
  }
  await expect(
    section.getByText('三档是参考部署模型与选择依据；具体档位、运维分工与合同条款在方案阶段确认。'),
  ).toBeVisible();
});

test('lifecycle walks six nodes with trace, audit marks and an iteration loop', async ({
  page,
}) => {
  await page.goto('/architecture');

  const section = page.locator('section#lifecycle');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '一条任务，六步走完；每一步都留下记录。',
  );

  const nodes = section.locator('[data-lifecycle-node]');
  await expect(nodes).toHaveCount(6);
  const nodeIds = await nodes.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-lifecycle-node')),
  );
  expect(nodeIds).toEqual([
    'task-in',
    'orchestrate',
    'model-route',
    'tools-knowledge',
    'hitl-gate',
    'output-eval',
  ]);

  for (const [id, label] of [
    ['task-in', '任务进入'],
    ['orchestrate', '编排决策'],
    ['model-route', '模型选择'],
    ['tools-knowledge', '工具 / 知识调用'],
    ['hitl-gate', 'HITL gate'],
    ['output-eval', '输出与评测'],
  ] as const) {
    await expect(section.locator(`[data-lifecycle-node="${id}"]`)).toContainText(label);
  }

  await expect(section.locator('[data-trace-span]')).toHaveCount(1);
  await expect(section.locator('[data-trace-span]')).toContainText('一条 trace 贯穿全部节点');

  const auditMarks = section.locator('[data-audit-mark]');
  await expect(auditMarks).toHaveCount(3);
  for (const audit of ['工具调用', '数据变更', '人工审批']) {
    await expect(auditMarks.filter({ hasText: audit }), audit).toHaveCount(1);
  }

  const loop = section.locator('[data-iteration-loop]');
  await expect(loop).toContainText('评测结果 → 编排 / 知识迭代');
  await expect(loop).toContainText('迭代不等于自动改生产');

  const scenario = section.locator('[data-lifecycle-scenario]');
  await expect(scenario).toContainText('售后工单');
  await expect(scenario).toContainText('状态');
  await expect(scenario).toContainText('权限');
  await expect(scenario).toContainText('人工介入');
  await expect(scenario).toContainText('非客户案例');

  const constraints = section.locator('[data-lifecycle-constraint]');
  await expect(constraints).toHaveCount(3);
  await expect(constraints.nth(0)).toContainText('Workflow 可预测');
  await expect(constraints.nth(1)).toContainText('Agent 更灵活');
  await expect(constraints.nth(2)).toContainText('HITL 增加时延');
});

test('five capability layers carry responsibility, constraint, practice and chips', async ({
  page,
}) => {
  await page.goto('/architecture');

  const section = page.locator('section#layers');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '五层能力栈，按职责与边界划分。',
  );
  await expect(section.getByRole('table', { name: /五层能力栈/ })).toBeVisible();

  const rows = section.locator('[data-layer]');
  await expect(rows).toHaveCount(5);
  const ids = await rows.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-layer')),
  );
  expect(ids).toEqual(['ingress', 'models', 'tools', 'knowledge', 'runtime']);

  for (const expected of layerRows) {
    const row = section.locator(`[data-layer="${expected.id}"]`);
    await expect(row, expected.id).toContainText(expected.name);
    await expect(row, expected.id).toContainText(expected.label);
    await expect(row.locator('[data-layer-field="responsibility"]')).toContainText(
      expected.responsibility,
    );
    await expect(row.locator('[data-layer-field="constraint"]')).toContainText(expected.constraint);
    await expect(row.locator('[data-layer-field="practice"]')).toContainText(expected.practice);

    const chips = row.locator('[data-layer-chip]');
    const chipCount = await chips.count();
    expect(chipCount, expected.id).toBeGreaterThanOrEqual(2);
    expect(chipCount, expected.id).toBeLessThanOrEqual(3);
  }
});

test('three control planes show what they govern, where they land and how to verify', async ({
  page,
}) => {
  await page.goto('/architecture');

  const section = page.locator('section#controls');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('三条控制面，横切五层。');
  await expect(section.getByRole('table', { name: /三条控制面/ })).toBeVisible();

  const rows = section.locator('[data-control-plane]');
  await expect(rows).toHaveCount(3);
  const ids = await rows.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-control-plane')),
  );
  expect(ids).toEqual(['identity', 'evaluation', 'policy']);

  for (const [id, name, manages, lands, verifies] of [
    ['identity', '身份与权限', 'Agent 独立身份', '每次工具调用', '越权测试'],
    ['evaluation', '评测与可观测', '三层指标', '发布门禁', 'trace 回放'],
    ['policy', '策略与审计', '审批 gate', '输入 / 输出 / 工具调用', '审计导出'],
  ] as const) {
    const row = section.locator(`[data-control-plane="${id}"]`);
    await expect(row, id).toContainText(name);
    await expect(row.locator('[data-control-field="manages"]'), id).toContainText(manages);
    await expect(row.locator('[data-control-field="lands"]'), id).toContainText(lands);
    await expect(row.locator('[data-control-field="verifies"]'), id).toContainText(verifies);
  }

  await expect(section).toContainText('以上为架构设计原则与验证方式');
});

test('five enterprise concerns follow question, mechanism and boundary', async ({ page }) => {
  await page.goto('/architecture');

  const section = page.locator('section#concerns');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '五个企业关切，先讲机制，再讲边界。',
  );

  const concerns = section.locator('[data-concern]');
  await expect(concerns).toHaveCount(5);
  const ids = await concerns.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-concern')),
  );
  expect(ids).toEqual(['private', 'residency', 'identity', 'cost', 'evaluation']);

  for (const id of ids) {
    const concern = section.locator(`[data-concern="${id}"]`);
    for (const field of ['question', 'mechanism', 'boundary']) {
      await expect(
        concern.locator(`[data-concern-field="${field}"]`),
        `${id}/${field}`,
      ).toHaveCount(1);
    }
  }

  await expect(section.locator('[data-concern="private"]')).toContainText(
    '具体档位与合同条款在方案阶段确认',
  );
  await expect(section.locator('[data-concern="residency"]')).toContainText(
    '“不出域”是法律与合同承诺',
  );
  await expect(section.locator('[data-concern="identity"]')).toContainText(
    '客户身份源与审批流程仍在客户侧',
  );
  await expect(section.locator('[data-concern="cost"]')).toContainText('路由受最小模型限制');
  await expect(section.locator('[data-concern="evaluation"]')).toContainText(
    'trace 用于排障，audit 用于合规，不能互替',
  );
});

test('three scenarios map architecture to business work and are labelled as illustrative', async ({
  page,
}) => {
  await page.goto('/architecture');

  const section = page.locator('section#scenarios');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '三个典型场景，把架构映射到业务问题。',
  );
  await expect(section.locator('[data-scenario-note]')).toHaveText('典型场景示意，非客户案例。');

  const cards = section.locator('[data-scenario]');
  await expect(cards).toHaveCount(3);
  const ids = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-scenario')),
  );
  expect(ids).toEqual(['support', 'knowledge-base', 'process-automation']);

  for (const [id, title] of [
    ['support', '客服与售后工单'],
    ['knowledge-base', '企业知识库问答'],
    ['process-automation', '流程自动化（审批 / 录入 / 对账）'],
  ] as const) {
    const card = section.locator(`[data-scenario="${id}"]`);
    await expect(card.getByRole('heading', { name: title })).toBeVisible();
    for (const field of ['scene', 'role', 'layers', 'human', 'evaluation']) {
      await expect(card.locator(`[data-scenario-field="${field}"]`), `${id}/${field}`).toHaveCount(
        1,
      );
    }
  }

  await expect(section.locator('[data-scenario="support"]')).toContainText(
    '金额超阈值或高风险操作由业务负责人审批',
  );
  await expect(section.locator('[data-scenario="knowledge-base"]')).toContainText(
    '低置信度或权限不足时转知识管理员',
  );
  await expect(section.locator('[data-scenario="process-automation"]')).toContainText(
    '异常与写操作前审批',
  );
});

test('metrics explain what is measured and how it is used without publishing numbers', async ({
  page,
}) => {
  await page.goto('/architecture');

  const section = page.locator('section#metrics');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '指标只讲评什么、怎么用，不报数字。',
  );

  const metrics = section.locator('[data-metric]');
  await expect(metrics).toHaveCount(5);
  await expect(metrics).toContainText([
    '任务成功率',
    '工具调用正确率',
    '检索质量',
    'P95 时延',
    '单任务成本',
  ]);

  const text = await section.innerText();
  expect(text).not.toMatch(/\d+(?:\.\d+)?\s*%/);
  expect(text).not.toMatch(/\d+\s*(?:ms|毫秒|QPS|TPS)/i);
  await expect(section).toContainText('不报未经验证的数字');
});

test('closing connects the architecture to method, process and booking', async ({ page }) => {
  await page.goto('/architecture');

  const section = page.locator('[data-arch-closing]');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '方法论讲怎么把 Agent 做对；这页讲系统长什么样、凭什么敢上线。',
  );
  await expect(section.getByRole('link', { name: '和架构师聊聊' })).toHaveAttribute(
    'href',
    '/contact#book',
  );
  await expect(section.getByRole('link', { name: '看工作方法论' })).toHaveAttribute(
    'href',
    '/methodology',
  );
  await expect(section.getByRole('link', { name: '看合作流程' })).toHaveAttribute(
    'href',
    '/process',
  );
});

test('architecture keeps the public red lines and the default wording for unconfirmed facts', async ({
  page,
}) => {
  await page.goto('/architecture');

  const text = await page.getByRole('main').innerText();

  for (const banned of [
    'OpenAI',
    'Anthropic',
    'Claude',
    'GPT',
    'Gemini',
    'Llama',
    'Qwen',
    '通义',
    '文心',
    '豆包',
    'DeepSeek',
    'Kimi',
    '等保',
    '信创',
    'ISO',
    'SOC 2',
    'SLA',
    '专有云',
    '价格',
    '报价',
    '￥',
    '客户 logo',
    '客户名称',
    '行业案例',
    '金融',
    '零售',
    '制造',
    '已实现',
    '兼容',
    'OTel',
    'OpenTelemetry',
    '源码交付',
    '均可交付',
    '待补',
    '占位',
    'example',
    '【',
  ]) {
    expect(text, `architecture page must not contain ${banned}`).not.toContain(banned);
  }

  expect(text).not.toMatch(/\d+(?:\.\d+)?\s*%/);
  expect(text).not.toMatch(/\d+\s*(?:ms|毫秒|QPS|TPS)/i);

  await expect(page.getByRole('main').locator('img')).toHaveCount(0);

  for (const phrase of [
    '按可替换设计',
    '架构要求',
    '审计应',
    '按标准协议接入',
    '检索必须带权限过滤',
    '短期',
    '长期',
    'trace 用于排障',
    '不报未经验证的数字',
    '由合同约定',
    '具体档位',
    '非客户案例',
  ]) {
    expect(text, `architecture page must include ${phrase}`).toContain(phrase);
  }
});

test('architecture keeps one h1 and never skips a heading level', async ({ page }) => {
  await page.goto('/architecture');

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

test('architecture anchors clear the sticky header', async ({ page }) => {
  await page.goto('/architecture#layers');

  await expect
    .poll(() =>
      page
        .locator('#layers')
        .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBeGreaterThanOrEqual(64);
});

test('architecture CTA focus is visible for keyboard users', async ({ page }) => {
  await page.goto('/architecture');

  const link = page.getByRole('link', { name: '和架构师聊聊' }).first();
  await link.focus();

  const outline = await link.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style).toBe('solid');
  expect(Number.parseFloat(outline.width)).toBeGreaterThan(0);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`architecture has no page-level horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/architecture');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `architecture overflows at ${width}px`).toBeLessThanOrEqual(0);
  });
}

test.describe('architecture at 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps the capability table and deployment tiers side by side', async ({ page }) => {
    await page.goto('/architecture');

    await expect(page.locator('section#layers thead')).toBeVisible();

    const columns = await page.locator('[data-deployment-grid]').evaluate((element) =>
      getComputedStyle(element)
        .gridTemplateColumns.split(' ')
        .filter((value) => value.length > 0),
    );
    expect(columns).toHaveLength(3);
  });
});

test.describe('architecture at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('stacks layers, lifecycle nodes and deployment tiers in one column', async ({ page }) => {
    await page.goto('/architecture');

    const layerRows = page.locator('[data-layer]');
    const firstLayer = await layerRows.nth(0).boundingBox();
    const secondLayer = await layerRows.nth(1).boundingBox();
    expect(secondLayer!.y).toBeGreaterThan(firstLayer!.y + firstLayer!.height / 2);

    const nodes = page.locator('[data-lifecycle-node]');
    const firstNode = await nodes.nth(0).boundingBox();
    const secondNode = await nodes.nth(1).boundingBox();
    expect(secondNode!.y).toBeGreaterThan(firstNode!.y + firstNode!.height / 2);

    const tiers = page.locator('[data-deployment-tier]');
    const firstTier = await tiers.nth(0).boundingBox();
    const secondTier = await tiers.nth(1).boundingBox();
    expect(secondTier!.y).toBeGreaterThan(firstTier!.y + firstTier!.height / 2);

    const columns = await page.locator('[data-deployment-grid]').evaluate((element) =>
      getComputedStyle(element)
        .gridTemplateColumns.split(' ')
        .filter((value) => value.length > 0),
    );
    expect(columns).toHaveLength(1);
  });
});
