export const processHero = {
  kicker: '合作流程',
  titleLead: '从第一次沟通，',
  titleTail: '到上线之后',
  lead: '六个合作阶段：每段做什么、需要你投入什么、到哪里为止。',
  primaryCta: '开始第一次沟通',
  secondaryCta: '看技术架构',
} as const;

export interface ProcessStage {
  readonly id: string;
  readonly no: string;
  readonly name: string;
  readonly flowDuration: string;
  readonly cycle: string;
  readonly customerRole: string;
  readonly ourParticipants: string;
  readonly clientParticipants: string;
  readonly clientInvestment: string;
  readonly outputs: string;
  readonly boundary: string;
  readonly copy: string;
}

export const processStages: readonly ProcessStage[] = [
  {
    id: 'intro',
    no: '01',
    name: '初次沟通',
    flowDuration: '1次',
    cycle: '1次沟通',
    customerRole: '业务发起人',
    ourParticipants: '技术负责人 + 业务负责人',
    clientParticipants: '业务发起人，技术对接人可同来',
    clientInvestment: '讲清一个具体场景与现状；不用准备材料',
    outputs: '一个直白结论：值不值得做、下一步是什么',
    boundary: '不出方案、不报价、不做技术验证',
    copy: '围绕一个具体业务场景，说明现状、瓶颈与预期结果。沟通结束给出判断：是否值得进入评估。',
  },
  {
    id: 'assessment',
    no: '02',
    name: '需求与可行性评估',
    flowDuration: '1–2周',
    cycle: '1–2周',
    customerRole: '业务专家 + IT + sponsor',
    ourParticipants: '前置交付工程师 + 方案 / 架构',
    clientParticipants: '业务专家 + IT / 数据对接人 + 业务sponsor',
    clientInvestment: '1名业务专家参加访谈；说明系统与数据可达性；提供人工基线',
    outputs: '可行性结论 + 建议的第一个场景 + 大致范围、风险与前提',
    boundary: '不写代码、不做原型；结论可能是不做，或先做别的',
    copy: '核定范围、前提与风险，给出结论：做、不做，或先做哪一步。',
  },
  {
    id: 'proposal',
    no: '03',
    name: '方案与报价',
    flowDuration: '3–5个工作日',
    cycle: '3–5个工作日',
    customerRole: 'sponsor',
    ourParticipants: '方案 + 商务',
    clientParticipants: '业务sponsor，采购 / 法务按需',
    clientInvestment: '确认范围边界与验收口径；告知采购流程与时间',
    outputs: '方案说明 + 报价 + 交付排期 + 验收标准草案',
    boundary:
      '报价绑定已确认范围，范围变了重新报价；范围未定不报一口价；模型按评测选，不绑定单一厂商',
    copy: '按已确认范围报价，验收标准随报价一并给出。范围变动重新报价；范围未定不出价。',
  },
  {
    id: 'contract',
    no: '04',
    name: '合同与启动',
    flowDuration: '1–2周',
    cycle: '1–2周，取决于采购流程',
    customerRole: '采购 + 对接人',
    ourParticipants: '商务 + 项目负责人',
    clientParticipants: '采购 / 法务 + 业务sponsor + 项目对接人',
    clientInvestment: '走完采购与用印；指定1名项目对接人 + 1名业务专家；确认启动会时间',
    outputs: '合同生效 + 启动会 + 交付排期确认',
    boundary: '合同生效前不开工；采购周期不计入交付周期',
    copy: '合同生效后开工。启动会确定对接人、验收人与交付排期；采购周期不计入交付周期。',
  },
  {
    id: 'delivery',
    no: '05',
    name: '交付与验收',
    flowDuration: '4–12周',
    cycle: '4–12周，视范围，以报价排期为基准',
    customerRole: '业务专家 + IT + 验收人',
    ourParticipants: '前置交付工程师 + 工程 / 架构',
    clientParticipants: '业务专家 + IT（环境与权限）+ 验收人',
    clientInvestment:
      '业务专家每周参与一次评审与验证；提供沙箱 / 测试账号与系统访问；验收人按标准签字',
    outputs: '上线的Agent + 验收记录 + 上线与运行所需文档',
    boundary:
      '只做合同范围内的场景；按合同那份验收标准逐项判定；不承诺未评测的效果数字；可选先做2–4周验证切片；验证切片是正式项目内的一部分，不单独售卖',
    copy: '按周交付，按合同的验收标准逐项判定。验收以记录与评测结果为依据，不以演示为准。',
  },
  {
    id: 'support',
    no: '06',
    name: '上线后支持',
    flowDuration: '按合同',
    cycle: '按合同约定，按次或按项目，不做年度订阅',
    customerRole: '运维 + 业务负责人',
    ourParticipants: '交付工程师',
    clientParticipants: '运维对接人 + 业务负责人',
    clientInvestment: '指定1名运维对接人；反馈失败案例与使用数据',
    outputs: '按约定范围处理问题与迭代',
    boundary: '不含新场景开发，按新项目走；不含7×24值守；响应与范围逐次约定',
    copy: '按约定范围处理问题与迭代，按次或按项目另行约定。新场景按新项目立项。',
  },
];

export const processStagesCopy = {
  kicker: '六段合作阶段',
  title: '六个阶段，各有边界。',
  lead: '主干六段合作阶段，含典型周期与客户侧角色；虚线标出可能的分支。',
  flowLabel: '典型路径',
  flowCount: '6个合作阶段',
  branchLabel: '分支路径',
  legendSolid: '实线 = 正常推进',
  legendDashed: '虚线 = 可选或终止',
  note: '典型路径，实际以合同为准。',
  tableKicker: '阶段明细',
  tableTitle: '每段做什么、需要你投入什么、到哪里为止。',
  tableLead: '周期、参与人、客户投入、产出与边界，逐项写清。',
  methodologyRef: '交付期内部的工程阶段、产出物与过关条件，见',
  methodologyLink: '工作方法',
} as const;

export interface ProcessBranch {
  readonly id: string;
  readonly route: string;
  readonly label: string;
  readonly detail: string;
}

export const processBranches: readonly ProcessBranch[] = [
  {
    id: 'stop-or-defer',
    route: '02 → 01',
    label: '评估后“不做 / 先做别的”',
    detail: '折回起点或终止。',
  },
  {
    id: 'pause',
    route: '03 → 终止',
    label: '报价后“暂不推进”',
    detail: '终止。',
  },
  {
    id: 'new-scenario',
    route: '06 → 03',
    label: '支持期发现新场景',
    detail: '回到“方案与报价”，按新项目走。',
  },
];

export interface PricingPrinciple {
  readonly id: string;
  readonly no: string;
  readonly title: string;
  readonly label: string;
  readonly summary: string;
}

export const pricingPrinciples: readonly PricingPrinciple[] = [
  {
    id: 'project',
    no: '01',
    title: '项目制',
    label: '按场景与交付范围报价',
    summary: '按场景与交付范围报价；不做订阅制。',
  },
  {
    id: 'milestones',
    no: '02',
    title: '按里程碑付款',
    label: '启动款 + 里程碑 + 验收尾款',
    summary: '启动款 + 里程碑 + 验收尾款；比例与节点写进合同。',
  },
  {
    id: 'change',
    no: '03',
    title: '范围变更重新报价',
    label: '不按人天追加',
    summary: '范围变了重新报价，不按人天追加；范围未定不报固定总价、不报固定工期。',
  },
  {
    id: 'minimum',
    no: '04',
    title: '最小项目规模',
    label: '一个能真正上线的Agent场景',
    summary: '一个能真正上线的Agent场景。不接只做演示、只评估不上线、或纯人力外包的项目。',
  },
  {
    id: 'support',
    no: '05',
    title: '上线后支持',
    label: '按次或按项目',
    summary: '按次或按项目另行约定，不做年度订阅。',
  },
  {
    id: 'public-pricing',
    no: '06',
    title: '价格不公开',
    label: '报价随方案给',
    summary: '不公开起步价、区间与套餐；报价随方案给。',
  },
];

export const pricingCopy = {
  kicker: '计价原则',
  title: '项目制，按范围报价。',
  lead: '付款、变更、最小项目规模与支持边界都写清楚；不公开价格，报价随方案给。',
  supportKicker: '支持边界',
  supportTitle: '上线后支持，按约定范围处理。',
  supportLead: '支持期按次或按项目另行约定，不做年度订阅。',
  supportBoundaries: ['不含新场景开发，按新项目走。', '不含7×24值守。', '响应与范围逐次约定。'],
} as const;
