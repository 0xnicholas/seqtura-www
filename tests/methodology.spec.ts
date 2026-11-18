import { expect, test } from '@playwright/test';

test('methodology hero states the FDE method and routes both actions', async ({ page }) => {
  const response = await page.goto('/methodology');

  expect(response?.status()).toBe(200);
  const main = page.getByRole('main');
  await expect(main.locator('h1')).toHaveCount(1);
  await expect(main.getByRole('heading', { level: 1 })).toHaveText(
    '从业务结果出发，而不是从技术方案出发。',
  );
  await expect(main.getByText('FDE 8阶段交付方法论')).toBeVisible();
  await expect(
    main.getByText('8个交付阶段，3条原则；把AI Agent从业务问题做到生产上线。'),
  ).toBeVisible();
  await expect(main.getByRole('link', { name: '聊聊你的场景' }).first()).toHaveAttribute(
    'href',
    '/contact#channels',
  );
  await expect(main.getByRole('link', { name: '看合作流程' }).first()).toHaveAttribute(
    'href',
    '/process',
  );
  await expect(
    main.getByText(
      'FDE（Forward Deployed Engineering，前置交付）是一种工程师与客户业务人员共同工作的交付模式；执行者是前置交付工程师。',
    ),
  ).toBeVisible();
  await expect(page.locator('.preview-note')).toHaveCount(0);
});

test('methodology states the three principles that constrain every stage', async ({ page }) => {
  await page.goto('/methodology');

  const section = page.locator('section#principles');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '三条原则，约束每个交付阶段。',
  );
  await expect(section.locator('[data-principle]')).toHaveCount(3);

  for (const [title, label, phrase] of [
    ['结果导向', 'Outcome-driven', '按Define阶段定下的验收标准验收；做不出来就早说'],
    ['共同构建', 'Co-building', '关键产出物由客户拍板'],
    ['产品化沉淀', 'Productization', '客户专属的业务逻辑、数据、本体与配置留在客户环境'],
  ] as const) {
    const card = section.locator('[data-principle]', {
      has: page.getByRole('heading', { name: title }),
    });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(label);
    await expect(card).toContainText(phrase);
  }
});

test('methodology groups the eight stages into the four delivery groups', async ({ page }) => {
  await page.goto('/methodology');

  const section = page.locator('section#stages');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('8个交付阶段，4组推进。');
  await expect(section.locator('[data-stage-group]')).toHaveCount(4);
  await expect(section.locator('[data-stage-link]')).toHaveCount(8);

  for (const [group, stages] of [
    ['发现与诊断', ['01 Discover', '02 Diagnose']],
    ['定义与设计', ['03 Define', '04 Design']],
    ['构建与验证', ['05 Build', '06 Validate']],
    ['上线与优化', ['07 Deploy', '08 Optimize']],
  ] as const) {
    const card = section.locator('[data-stage-group]', {
      has: page.getByRole('heading', { name: group }),
    });
    await expect(card).toHaveCount(1);
    for (const stage of stages) {
      await expect(card.getByRole('link', { name: new RegExp(stage) })).toBeVisible();
    }
  }

  for (const [no, stage, href] of [
    ['01', 'Discover', '#discover'],
    ['02', 'Diagnose', '#diagnose'],
    ['03', 'Define', '#define'],
    ['04', 'Design', '#design'],
    ['05', 'Build', '#build'],
    ['06', 'Validate', '#validate'],
    ['07', 'Deploy', '#deploy'],
    ['08', 'Optimize', '#optimize'],
  ] as const) {
    await expect(section.getByRole('link', { name: new RegExp(`${no} ${stage}`) })).toHaveAttribute(
      'href',
      href,
    );
  }

  await expect(section.getByRole('heading', { name: '阶段裁剪规则' })).toBeVisible();
  await expect(
    section.getByText(/Discover \/ Diagnose \/ Design \/ Build \/ Optimize可以合并/),
  ).toBeVisible();
  await expect(section.getByText(/Define、Validate、Deploy不跳过/)).toBeVisible();
  await expect(section.locator('[data-loopback]')).toHaveCount(2);
  await expect(section.getByText('Validate → Build / Design')).toBeVisible();
  await expect(section.getByText('Optimize → Build / Knowledge')).toBeVisible();
});

test('every stage card carries the six delivery fields', async ({ page }) => {
  await page.goto('/methodology');

  const section = page.locator('section#stage-details');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '每个阶段，都有可检查的交付。',
  );
  await expect(section.locator('[data-stage-card]')).toHaveCount(8);

  for (const expected of [
    {
      id: 'discover',
      name: 'Discover',
      cn: '发现',
      copy: '这个阶段的目标不是收集需求',
      purpose: '理解业务、组织、现有系统和痛点',
      artifact: '客户业务画像',
      exit: '业务画像经客户确认',
    },
    {
      id: 'diagnose',
      name: 'Diagnose',
      cn: '诊断',
      copy: '不是所有痛点都值得用Agent解决',
      purpose: '找到真正值得用Agent解决的业务问题',
      artifact: '问题定义（Problem Statement）',
      exit: '问题定义经sponsor确认',
    },
    {
      id: 'define',
      name: 'Define',
      cn: '定义',
      copy: '验收标准和评测集在这一步就定下来',
      purpose: '明确Agent的职责、目标、边界、权限和成功指标',
      artifact: 'Agent规格卡（Agent Specification）',
      exit: '权限边界经IT / 安全确认',
    },
    {
      id: 'design',
      name: 'Design',
      cn: '设计',
      copy: '而不是一张概念图',
      purpose: '设计Agent架构、Workflow、Tools、Knowledge、Ontology',
      artifact: '方案架构（Solution Architecture）',
      exit: '集成、权限、数据流无阻断',
    },
    {
      id: 'build',
      name: 'Build',
      cn: '构建',
      copy: '我们不做一次性演示',
      purpose: '复用平台组件、开源项目和已有Skills',
      artifact: '可运行原型（Working Prototype）',
      exit: '原型跑通核心任务',
    },
    {
      id: 'validate',
      name: 'Validate',
      cn: '验证',
      copy: '验证不是我们自己在演示环境里点一遍',
      purpose: '与客户真实业务人员共同测试',
      artifact: '评测报告（Evaluation Report）',
      exit: '评测报告经客户确认',
    },
    {
      id: 'deploy',
      name: 'Deploy',
      cn: '部署',
      copy: '上线不是把原型换个地址',
      purpose: '接入客户生产系统',
      artifact: '生产Agent（Production Agent）',
      exit: '上线检查清单全绿',
    },
    {
      id: 'optimize',
      name: 'Optimize',
      cn: '优化',
      copy: 'Agent会暴露真实世界里的长尾问题',
      purpose: '根据实际使用数据迭代',
      artifact: '运营报告',
      exit: '评测集随迭代更新',
    },
  ] as const) {
    const card = page.locator(`#${expected.id}`);
    await expect(card, expected.id).toHaveAttribute('data-stage-card', '');
    await expect(card.getByRole('heading', { level: 4 }), expected.id).toContainText(expected.name);
    await expect(card.getByRole('heading', { level: 4 }), expected.id).toContainText(expected.cn);
    await expect(card.locator('[data-stage-field]'), expected.id).toHaveCount(6);
    await expect(card.locator('[data-stage-field="purpose"]')).toContainText('目的');
    await expect(card.locator('[data-stage-field="purpose"]')).toContainText(expected.purpose);
    await expect(card.locator('[data-stage-field="copy"]')).toContainText(expected.copy);
    await expect(card.locator('[data-stage-field="activities"]')).toContainText('关键活动');
    await expect(card.locator('[data-stage-field="artifact"]')).toContainText('产出物');
    await expect(card.locator('[data-stage-field="artifact"]')).toContainText(expected.artifact);
    await expect(card.locator('[data-stage-field="participation"]')).toContainText('客户参与点');
    await expect(card.locator('[data-stage-field="exit"]')).toContainText('过关条件');
    await expect(card.locator('[data-stage-field="exit"]')).toContainText(expected.exit);
  }
});

test('artifact chain and Agent spec card make the handoffs inspectable', async ({ page }) => {
  await page.goto('/methodology');

  const section = page.locator('section#artifacts');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '从客户业务画像，到运营报告。',
  );

  const steps = section.locator('[data-artifact-step]');
  await expect(steps).toHaveCount(8);
  for (const [stage, artifact] of [
    ['Discover', '客户业务画像'],
    ['Diagnose', '问题定义'],
    ['Define', 'Agent规格卡 + 验收标准 + 评测集v0'],
    ['Design', '方案架构'],
    ['Build', '可运行原型'],
    ['Validate', '评测报告'],
    ['Deploy', '生产Agent + 上线检查清单 + 运行手册'],
    ['Optimize', '运营报告 + 迭代清单 + 更新后的评测集 / 知识库'],
  ] as const) {
    const step = steps.filter({ hasText: stage });
    await expect(step, stage).toHaveCount(1);
    await expect(step).toContainText(artifact);
  }

  const specCard = section.locator('[data-spec-card]');
  await expect(specCard.getByRole('heading', { name: 'Agent规格卡' })).toBeVisible();
  await expect(specCard.locator('[data-spec-item]')).toHaveCount(9);
  for (const item of [
    '目标 / 非目标',
    '用户与使用场景',
    '输入 / 输出',
    '工具与系统权限',
    '知识与记忆',
    '人工交接点',
    '失败模式与兜底',
    '成功指标与验收标准',
    '评测集v0',
  ]) {
    await expect(specCard.getByText(item, { exact: true })).toBeVisible();
  }
  await expect(specCard.locator('[data-spec-note]')).toHaveText('结构示意；非客户项目数据。');
  await expect(specCard.locator('img')).toHaveCount(0);
});

test('methodology explains its division of labor and closes with the booking CTA', async ({
  page,
}) => {
  await page.goto('/methodology');

  const division = page.locator('section#division');
  await expect(division.getByRole('heading', { level: 2 })).toHaveText(
    '方法论讲交付，流程页讲合作。',
  );
  await expect(division.locator('[data-division]')).toHaveCount(2);

  const thisPage = division.locator('[data-division="methodology"]');
  await expect(thisPage).toContainText('8个阶段的工程活动、产出物、客户参与点与过关条件');

  const processPage = division.locator('[data-division="process"]');
  await expect(processPage).toContainText('合作如何开始');
  await expect(processPage.getByRole('link', { name: '看合作流程' })).toHaveAttribute(
    'href',
    '/process',
  );

  const cta = page.locator('section#next-step');
  await expect(cta.getByRole('heading', { level: 2 })).toHaveText('从第一个具体场景开始。');
  await expect(cta.getByRole('link', { name: '聊聊你的场景' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );
  await expect(cta.getByRole('link', { name: '看合作流程' })).toHaveAttribute('href', '/process');
});

test('methodology leaves commercial terms to the process page', async ({ page }) => {
  await page.goto('/methodology');

  const text = await page.getByRole('main').innerText();
  for (const banned of ['周期', '价格', '合同', '付款', 'SLA', '报价', '订阅', '7×24']) {
    expect(text, `methodology page must not contain ${banned}`).not.toContain(banned);
  }
});

test('every stage anchor resolves directly', async ({ page }) => {
  await page.goto('/methodology');

  for (const id of [
    'stages',
    'discover',
    'diagnose',
    'define',
    'design',
    'build',
    'validate',
    'deploy',
    'optimize',
  ]) {
    await expect(page.locator(`#${id}`), id).toHaveCount(1);
  }
});

test('methodology does not rely on CSP-blocked inline scripts', async ({ page }) => {
  await page.goto('/methodology');

  const inlineScripts = page.locator('script:not([src]):not([type="application/ld+json"])');
  await expect(inlineScripts).toHaveCount(0);
});

test.describe('desktop stage subnav', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('keeps the four groups usable while scrolling and activates stage links from the keyboard', async ({
    page,
  }) => {
    await page.goto('/methodology');

    const nav = page.getByRole('navigation', { name: '交付阶段子导航' });
    await expect(nav).toBeVisible();
    await expect(nav.locator('[data-subnav-group]')).toHaveCount(4);
    await expect(nav.getByRole('link')).toHaveCount(8);

    const defineLink = nav.getByRole('link', { name: /03 Define/ });
    await defineLink.focus();

    const focusRing = await defineLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });
    expect(focusRing.style).toBe('solid');
    expect(Number.parseFloat(focusRing.width)).toBeGreaterThan(0);

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#define$/);
    await expect(page.locator('#define')).toBeVisible();
    await expect(page.locator('#define')).toHaveAttribute('open', '');

    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const section = document.querySelector('#stage-details');
      if (section) {
        window.scrollTo(0, window.scrollY + section.getBoundingClientRect().top + 600);
      }
    });

    const stickyTop = await nav.evaluate((element) =>
      Math.round(element.getBoundingClientRect().top),
    );
    expect(stickyTop).toBeGreaterThanOrEqual(80);
    expect(stickyTop).toBeLessThanOrEqual(96);

    await page.evaluate(() => window.scrollBy(0, 600));
    await expect
      .poll(() => nav.evaluate((element) => Math.round(element.getBoundingClientRect().top)))
      .toBe(stickyTop);
  });
});

test.describe('methodology at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('collapses the stage cards in order and opens them on demand', async ({ page }) => {
    await page.goto('/methodology');

    await expect(page.getByRole('navigation', { name: '交付阶段子导航' })).toBeHidden();

    const cards = page.locator('[data-stage-card]');
    await expect(cards).toHaveCount(8);
    for (const card of await cards.all()) {
      await expect(card).not.toHaveAttribute('open', '');
    }

    const ids = await cards.evaluateAll((elements) => elements.map((element) => element.id));
    expect(ids).toEqual([
      'discover',
      'diagnose',
      'define',
      'design',
      'build',
      'validate',
      'deploy',
      'optimize',
    ]);

    const validate = page.locator('#validate');
    await validate.locator('summary').click();
    await expect(validate).toHaveAttribute('open', '');
    await expect(
      validate
        .locator('[data-stage-field="artifact"]')
        .getByText('评测报告（Evaluation Report）', { exact: true }),
    ).toBeVisible();

    await page.goto('/methodology#optimize');
    const optimize = page.locator('#optimize');
    await expect(optimize).toHaveAttribute('open', '');
    await expect(optimize.locator('summary')).toBeInViewport();
  });
});

test('methodology keeps one H1 and never skips a heading level', async ({ page }) => {
  await page.goto('/methodology');

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
