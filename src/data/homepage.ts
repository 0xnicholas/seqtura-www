export interface Commitment {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly summary: string;
  readonly tag: string;
}

export const homeHero = {
  kicker: '企业AI Agent定制交付',
  titleLead: '企业AI Agent的',
  titleTail: '工程化交付',
  lead: '把业务场景做成可验收、可私有化、可维护的AI Agent。',
  primaryCta: '预约沟通',
  secondaryCta: '看工作方法论',
  facts: ['8个交付阶段', '5层能力栈', '3条控制面'],
  caption: '交付参考架构 / 5层能力栈 + 3条控制面',
} as const;

export const homeSections = {
  methodology: {
    kicker: '工作方法论',
    title: '从业务结果出发，而不是从技术方案出发。',
    lead: '8个交付阶段，4组推进。Define / Validate / Deploy不可跳过；每个阶段都有产出物和过关条件。',
    introTitle: '每个阶段都有可检查的产出物。',
    introBody:
      '先把问题定义清楚，再定验收标准与评测集，然后才进入构建。Agent不是一次模型调用，而是一条有状态的执行链；每一环都要能被验证、被审计、被接手。',
    checks: [
      { label: '问题定义', text: '值得做、不值得做，或先做哪一步，给出结论。' },
      { label: '验收标准', text: 'Define阶段前置，逐项可量化、可复核。' },
      { label: '评测集', text: 'Build之前锁定，正常 / 边界 / 失败样本齐全。' },
      { label: '生产上线', text: '权限、监控、告警与回滚配置完成才算交付。' },
    ],
    linkLabel: '看完整方法论',
  },
  architecture: {
    kicker: '技术架构',
    title: '一个能上生产的Agent系统，由什么构成。',
    lead: '5层能力栈，3条横切控制面。我们交付组件与模式；系统、数据、身份与审批权留在客户环境。',
    footnote: '参考架构描述可复用的能力模型；具体部署形态与实现范围在方案阶段按项目确认。',
  },
  delivery: {
    kicker: '交付与合作',
    title: '先把边界说清楚，再谈交付。',
    lead: '四条承诺与三个合作节点；具体范围以合同为准。',
    processLabel: '合作三步',
    processLinkLabel: '看合作流程',
  },
  fit: {
    kicker: '适配情境',
    title: '什么时候最适合找我们。',
    lead: '不按行业与规模筛选，按三个情境判断。',
    cardLinkLabel: '了解合作流程',
  },
  cta: {
    kicker: '下一步',
    title: '先聊一个具体场景。',
    lead: '带一个真实的业务流程来。我们一起判断值不值得做、先做哪一步，以及第一个验证切片长什么样。',
    primaryCta: '预约沟通',
    secondaryCta: '写邮件给我们',
    note: '不收费 · 不推销',
  },
} as const;

export const commitments: readonly Commitment[] = [
  {
    id: 'source',
    code: '01 / SOURCE',
    title: '源码交付（按合同）',
    summary: '是否交付源码、交付范围与License以合同为准；未约定部分不作为承诺。',
    tag: '合同约定',
  },
  {
    id: 'private',
    code: '02 / PRIVATE',
    title: '私有化',
    summary: 'SaaS、专属实例、自托管三档，按项目评估；具体档位以方案与合同为准。',
    tag: '按项目评估',
  },
  {
    id: 'acceptance',
    code: '03 / ACCEPTANCE',
    title: '验收标准前置',
    summary: 'Define阶段确认验收标准与评测集v0，Validate阶段按同一套标准逐项打分。',
    tag: 'Define → Validate',
  },
  {
    id: 'support',
    code: '04 / SUPPORT',
    title: '支持范围先说清',
    summary: '上线后支持按次或按项目约定，不含新场景与7×24值守。',
    tag: '按次 / 按项目',
  },
];

export interface ProcessPreviewStep {
  readonly no: string;
  readonly title: string;
  readonly summary: string;
}

export const processPreview: readonly ProcessPreviewStep[] = [
  {
    no: '01',
    title: '初次沟通',
    summary: '讲清一个具体场景与现状，给出值不值得做的判断。',
  },
  {
    no: '02',
    title: '需求与可行性评估',
    summary: '核定范围、前提与风险；结论可能是做、不做，或先做别的。',
  },
  {
    no: '03',
    title: '方案与报价',
    summary: '按已确认范围报价，验收标准随报价一并给出。',
  },
];

export interface FitSituation {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly summary: string;
}

export const fitSituations: readonly FitSituation[] = [
  {
    id: 'repeatable-process',
    code: '情境01',
    title: '有明确、重复发生的业务流程',
    summary: '愿意拿它做第一个Agent，而不是只想看看AI能做什么。',
  },
  {
    id: 'open-systems',
    code: '情境02',
    title: '愿意开放必要的系统与数据',
    summary: '或能安排业务专家对接，让Agent能接入真实流程。',
  },
  {
    id: 'business-sponsor',
    code: '情境03',
    title: '有业务侧sponsor',
    summary: '能一起定义验收标准，并对结果拍板。',
  },
];
