export interface Commitment {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly summary: string;
  readonly tag: string;
}

export const homeHero = {
  kicker: '企业 AI Agent 定制交付',
  titleLead: '把 AI Agent',
  titleTail: '从演示做到上线。',
  lead: '从业务问题出发，用 8 阶段交付方法把 Agent 接进真实流程。可私有化、可审计、模型可替换。',
  primaryCta: '预约 30 分钟沟通',
  secondaryCta: '看工作方法论',
  facts: ['8 个交付阶段', '5 层能力栈', '3 条控制面'],
  caption: '交付参考架构 / 5 层能力栈 + 3 条控制面',
} as const;

export const homeSections = {
  methodology: {
    kicker: '工作方法论',
    title: '从业务结果出发，而不是从技术方案出发。',
    lead: '8 个交付阶段，3 条原则；把 Agent 从业务问题做到生产上线。',
    introTitle: '每个阶段都有可检查的产出物。',
    introBody:
      '先把问题定义清楚，再定验收标准与评测集，然后才进入构建。Agent 不是一次模型调用，而是一条有状态的执行链；每一环都要能被验证、被审计、被接手。',
    linkLabel: '看工作方法论',
    groupLinkLabel: '看阶段详情',
  },
  architecture: {
    kicker: '技术架构',
    title: '一个能上生产的 Agent 系统，由什么构成。',
    lead: '5 层能力栈 + 3 条控制面；可私有化、可审计、模型可替换。',
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
    lead: '30 分钟，围绕一个具体业务场景，给出值不值得做、下一步是什么的判断。',
    primaryCta: '预约 30 分钟沟通',
    secondaryCta: '写邮件给我们',
    note: '30 分钟 · 不收费 · 不推销',
  },
} as const;

export const commitments: readonly Commitment[] = [
  {
    id: 'source',
    code: '01 / SOURCE',
    title: '源码交付',
    summary: '交付范围与 License 在合同中写明；合同未约定的部分不作为承诺。',
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
    summary: 'Define 阶段确认验收标准与评测集 v0，Validate 阶段按同一套标准逐项打分。',
    tag: 'Define → Validate',
  },
  {
    id: 'support',
    code: '04 / SUPPORT',
    title: '支持范围先说清',
    summary: '上线后支持按次或按项目约定，不含新场景与 7×24 值守。',
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
    code: '情境 01',
    title: '有明确、重复发生的业务流程',
    summary: '愿意拿它做第一个 Agent，而不是只想看看 AI 能做什么。',
  },
  {
    id: 'open-systems',
    code: '情境 02',
    title: '愿意开放必要的系统与数据',
    summary: '或能安排业务专家对接，让 Agent 能接入真实流程。',
  },
  {
    id: 'business-sponsor',
    code: '情境 03',
    title: '有业务侧 sponsor',
    summary: '能一起定义验收标准，并对结果拍板。',
  },
];
