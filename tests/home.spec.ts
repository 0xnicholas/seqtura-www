import { expect, test, type Response } from '@playwright/test';

test('home states the positioning and routes both hero actions', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('企业AI Agent的工程化交付');
  await expect(page.getByText('把业务场景做成可验收、可私有化、可维护的AI Agent。')).toBeVisible();
  await expect(page.getByRole('link', { name: '预约沟通' }).first()).toHaveAttribute(
    'href',
    '/contact#channels',
  );
  await expect(page.getByRole('link', { name: '看工作方法论' }).first()).toHaveAttribute(
    'href',
    '/methodology',
  );

  const facts = page.locator('[data-hero-fact]');
  await expect(facts).toHaveCount(3);
  await expect(facts).toHaveText(['8个交付阶段', '5层能力栈', '3条控制面']);
  await expect(page.getByRole('img', { name: /五层能力栈的等距示意图/ })).toBeVisible();
});

test('loads the self-hosted Instrument Sans webfont once within the font budget', async ({
  page,
}) => {
  const fontResponses: Response[] = [];
  page.on('response', (response) => {
    if (response.url().endsWith('.woff2')) {
      fontResponses.push(response);
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  expect(fontResponses).toHaveLength(1);
  expect(fontResponses[0].url()).toContain('/fonts/');
  const fontBody = await fontResponses[0].body();
  expect(fontBody.byteLength).toBeLessThanOrEqual(100 * 1024);

  await expect(page.locator('head link[rel="preload"][as="font"]')).toHaveCount(1);

  const faces = await page.evaluate(() => ({
    regular: document.fonts.check('16px "Instrument Sans"'),
    semibold: document.fonts.check('600 19px "Instrument Sans"'),
  }));
  expect(faces.regular).toBe(true);
  expect(faces.semibold).toBe(true);
});

test('renders Chinese headings at weight 500 on the Instrument Sans heading stack', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const heroTitle = page.locator('h1.type-h1');
  const heroType = await heroTitle.evaluate((element) => {
    const style = getComputedStyle(element);
    return { weight: style.fontWeight, family: style.fontFamily };
  });
  expect(heroType.weight).toBe('500');
  expect(heroType.family).toContain('Instrument Sans');

  await expect(page.locator('h2.type-h2').first()).toHaveCSS('font-weight', '500');
  await expect(page.locator('.trace-title')).toHaveCSS('font-weight', '500');
});

test('home shows the four delivery facts in the proof strip', async ({ page }) => {
  await page.goto('/');

  const facts = page.locator('.proof-strip .proof-cell');
  await expect(facts).toHaveCount(4);
  await expect(facts).toContainText(['8个交付阶段', '5层能力栈', '3条控制面', '1个主转化']);
});

test('methodology preview states the method, its checkpoints and every stage group', async ({
  page,
}) => {
  await page.goto('/');

  const section = page.locator('section#methodology');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '从业务结果出发，而不是从技术方案出发。',
  );
  await expect(
    section.getByText(
      '8个交付阶段，4组推进。Define / Validate / Deploy不可跳过；每个阶段都有产出物和过关条件。',
    ),
  ).toBeVisible();
  for (const checkpoint of ['问题定义：', '验收标准：', '评测集：', '生产上线：']) {
    await expect(section.getByText(checkpoint).first()).toBeVisible();
  }
  await expect(section.getByRole('link', { name: '看完整方法论' })).toHaveAttribute(
    'href',
    '/methodology',
  );

  for (const phrase of [
    '问题定义不是需求清单',
    'Agent规格卡写清职责',
    '在沙箱或预发环境跑真实任务',
    '接入生产系统，完成权限',
  ]) {
    await expect(section.getByText(phrase)).toBeVisible();
  }

  for (const heading of [
    'Discover / Diagnose',
    'Define / Design',
    'Build / Validate',
    'Deploy / Optimize',
  ]) {
    await expect(section.getByRole('heading', { name: heading })).toBeVisible();
  }

  await expect(section.locator('[data-method-group]')).toHaveCount(4);
  for (const [title, label] of [
    ['Discover / Diagnose', '看阶段01–02'],
    ['Define / Design', '看阶段03–04'],
    ['Build / Validate', '看阶段05–06'],
    ['Deploy / Optimize', '看阶段07–08'],
  ] as const) {
    const group = section.locator('[data-method-group]', {
      has: page.getByRole('heading', { name: title }),
    });
    await expect(group).toHaveCount(1);
    await expect(group).toHaveAttribute('href', '/methodology#stages');
    await expect(group.getByText(label, { exact: true })).toBeVisible();
  }
});

test('methodology code panel switches files by click and arrow keys', async ({ page }) => {
  await page.goto('/');

  const section = page.locator('section#methodology');
  const tablist = section.getByRole('tablist', { name: '方法论文件' });
  const delivery = tablist.getByRole('tab', { name: 'delivery.yml' });
  const validate = tablist.getByRole('tab', { name: 'gate-validate.md' });

  const tablistChildren = await tablist.evaluate((element) =>
    Array.from(element.children).map((child) => child.getAttribute('role')),
  );
  expect(tablistChildren).toEqual(['tab', 'tab']);
  await expect(section.getByText('READ ONLY')).toBeVisible();

  await expect(delivery).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel')).toContainText('8阶段 / 3个门禁');

  await validate.click();
  await expect(validate).toHaveAttribute('aria-selected', 'true');
  await expect(delivery).toHaveAttribute('aria-selected', 'false');
  await expect(section.getByRole('tabpanel')).toContainText('能否进入Deploy');

  await validate.press('ArrowLeft');
  await expect(delivery).toBeFocused();
  await expect(delivery).toHaveAttribute('aria-selected', 'true');
  await expect(section.getByRole('tabpanel')).toContainText('8阶段 / 3个门禁');

  const focusRing = await delivery.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusRing.style).toBe('solid');
  expect(Number.parseFloat(focusRing.width)).toBeGreaterThan(0);

  await delivery.press('ArrowRight');
  await expect(validate).toBeFocused();
  await expect(validate).toHaveAttribute('aria-selected', 'true');
});

test('architecture bento shows the capability stack, trace and control planes', async ({
  page,
}) => {
  await page.goto('/');

  const section = page.locator('section#architecture');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    '一个能上生产的Agent系统，由什么构成。',
  );

  for (const layer of ['运行时与部署', '知识与记忆', '工具与系统集成', '模型', '接入与编排']) {
    await expect(section.getByText(layer, { exact: true })).toBeVisible();
  }

  await expect(section.getByRole('img', { name: /5 层能力栈.*3 条控制面.*客户/ })).toBeVisible();
  await expect(section.getByText(/客户环境：系统/)).toBeVisible();
  await expect(section.getByText(/我们交付组件与模式/)).toBeVisible();

  await expect(
    section.getByRole('heading', { name: /一条任务，\s*从进入到留下什么。/ }),
  ).toBeVisible();
  for (const event of [
    'task.in',
    'policy.check',
    'tool.call',
    'hitl.gate',
    'eval.run',
    'task.out',
  ]) {
    await expect(section.getByText(event, { exact: true })).toBeVisible();
  }
  await expect(section.locator('[data-structural-note]')).toHaveCount(2);

  for (const name of ['身份与权限', '评测与可观测', '策略与审计']) {
    await expect(section.getByRole('heading', { name })).toBeVisible();
  }

  await expect(section.locator('a[href="/architecture#overview"]')).toHaveAttribute(
    'href',
    '/architecture#overview',
  );
  await expect(section.locator('a[href="/architecture#lifecycle"]')).toHaveAttribute(
    'href',
    '/architecture#lifecycle',
  );

  const controlLinks = section.locator('a[href="/architecture#controls"]');
  await expect(controlLinks).toHaveCount(3);
  for (const name of ['身份与权限', '评测与可观测', '策略与审计']) {
    await expect(controlLinks.filter({ hasText: name })).toBeVisible();
  }
});

test('delivery section states four conditional commitments and the first three process steps', async ({
  page,
}) => {
  await page.goto('/');

  const section = page.locator('section#delivery');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('先把边界说清楚，再谈交付。');

  const commitments = section.locator('[data-commitment]');
  await expect(commitments).toHaveCount(4);
  for (const [name, detail] of [
    ['源码交付（按合同）', '以合同为准'],
    ['私有化', '按项目评估'],
    ['验收标准前置', 'Define阶段'],
    ['支持范围先说清', '按次或按项目'],
  ] as const) {
    const card = section.locator('[data-commitment]', { has: page.getByRole('heading', { name }) });
    await expect(card).toContainText(detail);
  }

  for (const step of ['初次沟通', '需求与可行性评估', '方案与报价']) {
    await expect(section.getByText(step, { exact: true })).toBeVisible();
  }
  await expect(section.getByRole('link', { name: '看合作流程' })).toHaveAttribute(
    'href',
    '/process#stages',
  );
});

test('fit situations describe who the delivery model suits and link to the process page', async ({
  page,
}) => {
  await page.goto('/');

  const section = page.locator('section#fit');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('什么时候最适合找我们。');

  for (const heading of [
    '有明确、重复发生的业务流程',
    '愿意开放必要的系统与数据',
    '有业务侧sponsor',
  ]) {
    await expect(section.getByRole('heading', { name: heading })).toBeVisible();
  }

  const cards = section.locator('[data-fit-situation]');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await expect(card).toHaveAttribute('href', '/process');
  }
});

test('closing CTA sends visitors to the contact channels with an email fallback', async ({
  page,
}) => {
  await page.goto('/');

  const section = page.locator('section#next-step');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('先聊一个具体场景。');
  await expect(section.getByText(/带一个真实的业务流程来/)).toBeVisible();
  await expect(section.getByRole('link', { name: '预约沟通' })).toHaveAttribute(
    'href',
    '/contact#channels',
  );
  await expect(section.getByRole('link', { name: '写邮件给我们' })).toHaveAttribute(
    'href',
    'mailto:hello@seqtura.ai',
  );
  await expect(section.getByText('不收费 · 不推销')).toBeVisible();
});

test('every primary CTA on the home page lands on the contact channels', async ({ page }) => {
  await page.goto('/');

  const primaryCtas = page.locator('[data-primary-cta]');
  await expect(primaryCtas).toHaveCount(4);
  for (const cta of await primaryCtas.all()) {
    await expect(cta).toHaveAttribute('href', '/contact#channels');
  }
});

test('brand red tokens render the §3.1 target values in computed styles', async ({ page }) => {
  await page.goto('/');

  const tick = await page
    .locator('[data-fit-situation]')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return { background: style.backgroundColor, width: style.width, height: style.height };
    });
  expect(tick.width).toBe('7px');
  expect(tick.height).toBe('7px');
  expect(tick.background).toBe('rgb(255, 45, 32)');

  const primaryCta = page.locator('main [data-primary-cta]').first();
  await expect(primaryCta).toHaveCSS('background-color', 'rgb(205, 35, 24)');
  await primaryCta.hover();
  await expect(primaryCta).toHaveCSS('background-color', 'rgb(170, 27, 18)');

  await expect(page.locator('main .kicker').first()).toHaveCSS('color', 'rgb(205, 35, 24)');
  await expect(page.locator('main .text-link').first()).toHaveCSS('color', 'rgb(205, 35, 24)');
});

test('structural illustrations are labelled as non-client data', async ({ page }) => {
  await page.goto('/');

  const notes = page.getByRole('main').locator('[data-structural-note]');
  await expect(notes).toHaveCount(4);
  for (const note of await notes.all()) {
    await expect(note).toHaveText('结构示意，非客户项目数据');
  }
});

test('section headings render the mini isometric stack as a static inline SVG', async ({
  page,
}) => {
  await page.goto('/');

  const stacks = page.locator('.section-heading svg.mini-stack');
  await expect(stacks).toHaveCount(4);
  await expect(page.locator('.mini-stack')).toHaveCount(4);
  await expect(page.locator('.section-heading img')).toHaveCount(0);

  const expectedRed = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-red)';
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });

  for (const stack of await stacks.all()) {
    await expect(stack).toHaveAttribute('aria-hidden', 'true');

    const state = await stack.evaluate((node) => {
      const style = getComputedStyle(node);
      const redSlab = node.querySelector('.mini-stack-red');
      return {
        height: style.height,
        animationName: style.animationName,
        transitionDuration: style.transitionDuration,
        polygons: node.querySelectorAll('polygon').length,
        redSlabs: node.querySelectorAll('.mini-stack-red').length,
        redFill: redSlab ? getComputedStyle(redSlab).fill : null,
        externalRefs: node.querySelectorAll('image, use, foreignObject').length,
      };
    });
    expect(state.height).toBe('120px');
    expect(state.animationName).toBe('none');
    expect(state.transitionDuration).toBe('0s');
    expect(state.polygons).toBe(9);
    expect(state.redSlabs).toBe(3);
    expect(state.redFill).toBe(expectedRed);
    expect(state.externalRefs).toBe(0);

    const stackBox = await stack.boundingBox();
    const kickerBox = await stack
      .locator('xpath=following-sibling::p[contains(@class,"kicker")]')
      .boundingBox();
    expect(
      Math.abs(stackBox!.x + stackBox!.width / 2 - (kickerBox!.x + kickerBox!.width / 2)),
    ).toBeLessThanOrEqual(1);
  }
});

test('home page makes no customer-proof or certification claims', async ({ page }) => {
  await page.goto('/');

  const main = page.getByRole('main');
  await expect(main.locator('img')).toHaveCount(0);

  const text = await main.innerText();
  for (const banned of ['客户案例', '客户 logo', '客户 Logo', '等保', 'ISO 27001', 'SLA']) {
    expect(text).not.toContain(banned);
  }
});

test('proof strip keeps its four facts on one row on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const boxes = await page.locator('.proof-strip .proof-cell').evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y) };
    }),
  );

  expect(new Set(boxes.map((box) => box.y)).size).toBe(1);
  for (let index = 1; index < boxes.length; index += 1) {
    expect(boxes[index].x).toBeGreaterThan(boxes[index - 1].x);
  }
});

test('home keeps one H1 and never skips a heading level', async ({ page }) => {
  await page.goto('/');

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

test('reduced motion leaves section content fully visible without entrance effects', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  for (const selector of [
    'section#methodology .section-heading',
    'section#methodology .method-split',
    'section#architecture .bento',
    'section#delivery .commit-grid',
    'section#next-step .cta-inner',
  ]) {
    const element = page.locator(selector);
    await expect(element, selector).toBeVisible();
    const state = await element.evaluate((node) => {
      const style = getComputedStyle(node);
      return { opacity: style.opacity, transform: style.transform };
    });
    expect(state.opacity, selector).toBe('1');
    expect(state.transform, selector).toBe('none');
  }
});

test('below-fold reveal sections enter once on scroll and stay revealed', async ({ page }) => {
  await page.goto('/');

  const target = page.locator('section#next-step .cta-inner');

  const initial = await target.evaluate((node) => getComputedStyle(node).opacity);
  expect(initial).toBe('0');

  await target.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => target.evaluate((node) => getComputedStyle(node).opacity), {
      timeout: 3000,
    })
    .toBe('1');

  const timing = await target.evaluate((node) => {
    const style = getComputedStyle(node);
    return { duration: style.animationDuration, delay: style.animationDelay };
  });
  expect(timing.duration).toBe('0.6s');
  expect(timing.delay).toBe('0s');

  await page.evaluate(() => window.scrollTo(0, 0));
  await target.scrollIntoViewIfNeeded();
  const reentered = await target.evaluate((node) => getComputedStyle(node).opacity);
  expect(reentered).toBe('1');
  await page.waitForTimeout(300);
  const settled = await target.evaluate((node) => getComputedStyle(node).opacity);
  expect(settled).toBe('1');
});

test('proof strip participates in the scroll reveal', async ({ page }) => {
  await page.goto('/');

  const grid = page.locator('.proof-strip .proof-grid');
  await expect(grid).toHaveClass(/reveal/);

  const before = await grid.evaluate((node) => getComputedStyle(node).opacity);
  expect(before).toBe('0');

  await grid.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => grid.evaluate((node) => getComputedStyle(node).opacity), {
      timeout: 3000,
    })
    .toBe('1');
});

test('interactive transitions resolve to the shared micro duration and easing', async ({
  page,
}) => {
  await page.goto('/');

  for (const selector of ['.btn', '[data-fit-situation]']) {
    const timing = await page
      .locator(selector)
      .first()
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          durations: style.transitionDuration.split(', '),
          easing: style.transitionTimingFunction,
        };
      });
    expect(new Set(timing.durations), selector).toEqual(new Set(['0.15s']));
    expect(timing.easing, selector).toBe(
      timing.durations.map(() => 'cubic-bezier(0.22, 0.61, 0.36, 1)').join(', '),
    );
  }
});

test.describe('home at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('proof strip becomes a full-width intro plus a 2x2 fact grid', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-hero-art]')).toBeHidden();

    const facts = await page.locator('.proof-strip .proof-cell').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width) };
      }),
    );
    const intro = await page.locator('.proof-strip .proof-intro').boundingBox();

    expect(facts[0].x).toBe(facts[2].x);
    expect(facts[1].x).toBe(facts[3].x);
    expect(facts[0].y).toBe(facts[1].y);
    expect(facts[2].y).toBe(facts[3].y);
    expect(facts[0].y).toBeLessThan(facts[2].y);
    expect(intro?.width).toBeGreaterThan(facts[0].width * 1.5);
  });

  test('methodology, architecture and proof content stack in one column', async ({ page }) => {
    await page.goto('/');

    const methodCopy = await page.locator('section#methodology h3').first().boundingBox();
    const codePanel = await page.locator('section#methodology [data-code-panel]').boundingBox();
    expect(codePanel!.y).toBeGreaterThan(methodCopy!.y + methodCopy!.height);

    const archCard = await page.locator('a.arch-card').boundingBox();
    const traceCard = await page.locator('a.trace-card').boundingBox();
    const firstControl = await page.locator('a.control-card').first().boundingBox();

    expect(traceCard!.y).toBeGreaterThanOrEqual(archCard!.y + archCard!.height - 1);
    expect(firstControl!.y).toBeGreaterThanOrEqual(traceCard!.y + traceCard!.height - 1);
  });

  test('delivery, fit and closing CTA stack in one column', async ({ page }) => {
    await page.goto('/');

    for (const selector of [
      'section#delivery .commit-grid',
      'section#delivery .process-list',
      'section#fit .fit-grid',
    ]) {
      const columns = await page.locator(selector).evaluate((element) =>
        getComputedStyle(element)
          .gridTemplateColumns.split(' ')
          .filter((value) => value.length > 0),
      );
      expect(columns, selector).toHaveLength(1);
    }

    await expect(page.locator('section#next-step .cta-actions')).toHaveCSS(
      'flex-direction',
      'column',
    );
  });
});

test.describe('home at 320px', () => {
  test.use({ viewport: { width: 320, height: 700 } });

  test('code panel scrolls internally without overflowing the page', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('[data-code-body]').first();
    const metrics = await body.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      overflowX: getComputedStyle(element).overflowX,
    }));

    expect(metrics.overflowX).toBe('auto');
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(pageOverflow).toBeLessThanOrEqual(0);
  });
});

test('hero copy enters on the 0/200/400/600/800ms ladder with the art closing at 1000ms', async ({
  page,
}) => {
  await page.goto('/');

  const children = page.locator('.hero-copy > *');
  await expect(children).toHaveCount(5);

  const expectedDelays = ['0s', '0.2s', '0.4s', '0.6s', '0.8s'];
  for (const [index, delay] of expectedDelays.entries()) {
    const child = children.nth(index);
    await expect(child).toHaveCSS('animation-name', 'blur-up');
    await expect(child).toHaveCSS('animation-delay', delay);
    await expect(child).toHaveCSS('animation-duration', '1s');
    await expect(child).toHaveCSS('animation-timing-function', 'cubic-bezier(0.22, 0.61, 0.36, 1)');
  }

  const art = page.locator('.hero-art');
  await expect(art).toHaveCSS('animation-name', 'blur-up');
  await expect(art).toHaveCSS('animation-delay', '1s');
  await expect(art).toHaveCSS('animation-duration', '1s');
});

test('hero stack dashed guides drift on the 24s ambient loop', async ({ page }) => {
  await page.goto('/');

  const flows = page.locator('.stack-art .stack-flow');
  await expect(flows).toHaveCount(3);
  for (const flow of await flows.all()) {
    await expect(flow).toHaveCSS('animation-name', 'stack-flow-dash');
    await expect(flow).toHaveCSS('animation-duration', '24s');
    await expect(flow).toHaveCSS('animation-timing-function', 'linear');
    await expect(flow).toHaveCSS('animation-iteration-count', 'infinite');
  }

  const hitl = page.locator('.stack-art .stack-flow-path');
  await expect(hitl).toHaveCount(1);
  await expect(hitl).toHaveCSS('animation-name', 'stack-flow-dash-path');
  await expect(hitl).toHaveCSS('animation-duration', '24s');
  await expect(hitl).toHaveCSS('animation-timing-function', 'linear');
  await expect(hitl).toHaveCSS('animation-iteration-count', 'infinite');
});

test('reduced motion stills the hero ambient stroke drift', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  for (const flow of await page.locator('.stack-art .stack-flow').all()) {
    await expect(flow).toHaveCSS('animation-name', 'none');
  }
  await expect(page.locator('.stack-art .stack-flow-path')).toHaveCSS('animation-name', 'none');
});

test('mobile keeps the copy entrance ladder while the stack art stays absent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('.hero-art')).toBeHidden();

  const children = page.locator('.hero-copy > *');
  await expect(children).toHaveCount(5);
  const expectedDelays = ['0s', '0.2s', '0.4s', '0.6s', '0.8s'];
  for (const [index, delay] of expectedDelays.entries()) {
    await expect(children.nth(index)).toHaveCSS('animation-delay', delay);
    await expect(children.nth(index)).toHaveCSS('animation-duration', '1s');
  }
});
