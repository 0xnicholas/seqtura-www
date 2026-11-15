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
    '/contact#book',
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

  const names = ['初次沟通', '需求与可行性评估', '方案与报价', '合同与启动', '交付与验收', '上线后支持'];
  const durations = ['30 分钟', '1–2 周', '3–5 个工作日', '1–2 周', '4–12 周', '按合同'];
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
      duration: '30 分钟',
      durationDetail: '1 次',
      client: '业务发起人，技术对接人可同来',
      copy: '围绕一个具体业务场景，说明现状、瓶颈与预期结果。沟通结束给出判断：是否值得进入评估。',
    },
    {
      id: 'assessment',
      name: '需求与可行性评估',
      duration: '1–2 周',
      durationDetail: null,
      client: '业务专家 + IT / 数据对接人 + 业务 sponsor',
      copy: '核定范围、前提与风险，给出结论：做、不做，或先做哪一步。',
    },
    {
      id: 'proposal',
      name: '方案与报价',
      duration: '3–5 个工作日',
      durationDetail: null,
      client: '业务 sponsor，采购 / 法务按需',
      copy: '按已确认范围报价，验收标准随报价一并给出。范围变动重新报价；范围未定不出价。',
    },
    {
      id: 'contract',
      name: '合同与启动',
      duration: '1–2 周',
      durationDetail: '取决于采购流程',
      client: '采购 / 法务 + 业务 sponsor + 项目对接人',
      copy: '合同生效后开工。启动会确定对接人、验收人与交付排期；采购周期不计入交付周期。',
    },
    {
      id: 'delivery',
      name: '交付与验收',
      duration: '4–12 周',
      durationDetail: '视范围，以报价排期为基准',
      client: '业务专家 + IT（环境与权限）+ 验收人',
      copy: '按周交付，按合同的验收标准逐项判定。验收以记录与评测结果为依据，不以演示为准。',
    },
    {
      id: 'support',
      name: '上线后支持',
      duration: '按合同',
      durationDetail: '按次或按项目，不做年度订阅',
      client: '运维对接人 + 业务负责人',
      copy: '按约定范围处理问题与迭代，按次或按项目另行约定。新场景按新项目立项。',
    },
  ] as const;

  for (const expected of stages) {
    const row = table.locator(`[data-stage-row="${expected.id}"]`);
    await expect(row).toHaveCount(1);
    await expect(row.locator('[data-stage-name]')).toHaveText(expected.name);
    await expect(row.locator('[data-stage-duration]')).toHaveText(expected.duration);
    if (expected.durationDetail) {
      await expect(row.locator('[data-stage-duration-detail]')).toHaveText(
        expected.durationDetail,
      );
    }
    await expect(row.locator('[data-stage-client]')).toContainText(expected.client);
    await expect(row.locator('[data-stage-copy]')).toHaveText(expected.copy);
    await expect(row.locator('[data-stage-investment]')).not.toBeEmpty();
    await expect(row.locator('[data-stage-outputs]')).not.toBeEmpty();
    await expect(row.locator('[data-stage-boundary]')).not.toBeEmpty();
  }

  await expect(section.locator('[data-process-stage-card]')).toHaveCount(6);
  await expect(section.getByRole('link', { name: '工作方法论' })).toHaveAttribute(
    'href',
    '/methodology#stages',
  );
});
