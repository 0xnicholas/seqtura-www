export interface DeliveryStage {
  readonly no: string;
  readonly anchor: string;
  readonly name: string;
  readonly nameCn: string;
  readonly chainArtifact: string;
  readonly purpose: string;
  readonly copy: string;
  readonly activities: readonly string[];
  readonly artifacts: readonly string[];
  readonly clientParticipation: readonly string[];
  readonly exitCriteria: readonly string[];
}

export type DeliveryGroupId =
  'discover-diagnose' | 'define-design' | 'build-validate' | 'deploy-optimize';

export const deliveryStages: readonly DeliveryStage[] = [
  {
    no: '01',
    anchor: 'discover',
    name: 'Discover',
    nameCn: '发现',
    chainArtifact: '客户业务画像',
    purpose: '理解业务、组织、现有系统和痛点，建立共同语境。',
    copy: '我们先理解客户的业务、组织、现有系统和真正的痛点，不先讲Agent能做什么。这个阶段的目标不是收集需求，而是建立对业务运转方式的共同理解。',
    activities: [
      '业务、组织与决策链访谈',
      '现有系统、数据与流程盘点',
      '痛点、约束与失败代价梳理',
      '关键角色与项目对接人确认',
    ],
    artifacts: ['客户业务画像（Customer Profile）'],
    clientParticipation: ['业务负责人和一线专家参与访谈', '提供组织、系统、流程资料', '指定对接人'],
    exitCriteria: ['业务画像经客户确认', '关键角色、系统、约束无重大遗漏'],
  },
  {
    no: '02',
    anchor: 'diagnose',
    name: 'Diagnose',
    nameCn: '诊断',
    chainArtifact: '问题定义',
    purpose: '找到真正值得用Agent解决的业务问题，评估ROI、可行性和风险。',
    copy: '不是所有痛点都值得用Agent解决。我们把问题拆到可判断的程度：业务价值、数据与系统条件、失败代价、组织接受度，和人工 / 自动化 / 现成软件比一遍，再给出做、不做或先做哪一步的结论。',
    activities: [
      '问题清单与优先级',
      'ROI假设与人工基线',
      '数据、系统、权限可行性',
      '风险、失败代价与替代方案比较',
      '推荐第一个Agent场景',
    ],
    artifacts: ['问题定义（Problem Statement），含ROI假设、可行性、风险、建议场景'],
    clientParticipation: [
      '业务sponsor确认问题优先级与ROI假设',
      '提供基线数据',
      'IT确认系统 / 数据可达性',
    ],
    exitCriteria: ['问题定义经sponsor确认', 'ROI假设有基线', '主要风险有应对'],
  },
  {
    no: '03',
    anchor: 'define',
    name: 'Define',
    nameCn: '定义',
    chainArtifact: 'Agent规格卡 + 验收标准 + 评测集v0',
    purpose: '明确Agent的职责、目标、边界、权限和成功指标；把验收标准前置。',
    copy: '我们把Agent要做什么、不做什么、能碰哪些系统和数据、什么算成功，写成一份可评审的规格。验收标准和评测集在这一步就定下来，后面Build和Validate都对着同一份标准走。',
    activities: [
      '职责、目标与非目标',
      '工作边界与人工交接点',
      '工具、数据与权限边界',
      '成功指标与验收标准',
      '评测集v0（正常 / 边界 / 失败样本）',
      '评审与签字',
    ],
    artifacts: ['Agent规格卡（Agent Specification）', '验收标准', '评测集v0'],
    clientParticipation: [
      '提供代表性样本与历史案例',
      '业务与IT共同评审职责边界、权限、成功指标',
      '业务sponsor确认验收标准',
      '指定验收人',
    ],
    exitCriteria: ['规格、验收标准、评测集v0经客户签字', '权限边界经IT / 安全确认'],
  },
  {
    no: '04',
    anchor: 'design',
    name: 'Design',
    nameCn: '设计',
    chainArtifact: '方案架构',
    purpose: '设计Agent架构、Workflow、Tools、Knowledge、Ontology和系统集成。',
    copy: '规格确定后，才进入方案设计。我们定义Agent的编排方式、工具与系统连接、知识来源、业务本体和权限模型，并标出哪些地方必须让人介入。产出是一份可评审、可施工的架构，而不是一张概念图。',
    activities: [
      'Agent架构与编排模式',
      'Workflow与人工交接点',
      'Tools / Connectors与系统集成',
      'Knowledge / RAG与数据流',
      '业务本体（Ontology）',
      '权限、安全、审计与非功能要求',
    ],
    artifacts: ['方案架构（Solution Architecture）'],
    clientParticipation: [
      'IT / 安全评审集成、权限、数据流',
      '业务确认Workflow与人工交接点',
      '确认延迟、成本、可用性等非功能要求',
    ],
    exitCriteria: ['架构评审通过', '集成、权限、数据流无阻断', '评测方案与测试场景补齐'],
  },
  {
    no: '05',
    anchor: 'build',
    name: 'Build',
    nameCn: '构建',
    chainArtifact: '可运行原型',
    purpose: '复用平台组件、开源项目和已有Skills，快速构建可运行的Agent。',
    copy: '我们不做一次性演示，而是按规格构建一个能跑真实任务的版本。通用能力复用已有组件，客户专属逻辑按规格实现；每一轮构建都跑评测集，结果留痕。',
    activities: [
      '编排、工具、知识、护栏实现',
      '复用平台组件、开源方案与已有Skills',
      '客户系统沙箱 / 测试环境联调',
      '每轮评测与失败归因',
      '已知限制记录',
    ],
    artifacts: ['可运行原型（Working Prototype）'],
    clientParticipation: ['提供测试账号 / 沙箱数据', '业务专家每周看原型', 'IT配合联调'],
    exitCriteria: ['原型跑通核心任务', '评测集达到阶段性阈值', '无阻断级问题'],
  },
  {
    no: '06',
    anchor: 'validate',
    name: 'Validate',
    nameCn: '验证',
    chainArtifact: '评测报告',
    purpose: '与客户真实业务人员共同测试，评估准确率、任务成功率、成本和效率。',
    copy: '验证不是我们自己在演示环境里点一遍，而是客户真实业务人员用真实任务跑。我们按Define阶段锁定的评测集和验收标准逐项打分，把准确率、任务成功率、成本和效率写成一份可复核的报告。没达标的地方，要么修，要么明确写成已知限制。',
    activities: [
      '真实业务用户测试',
      '按锁定评测集逐项验证',
      '准确率、任务成功率、成本、效率',
      '失败案例归因',
      '已知限制与风险',
      '验收变更控制',
    ],
    artifacts: ['评测报告（Evaluation Report）'],
    clientParticipation: ['真实业务人员参与测试', '验收人按标准确认', '业务sponsor接受已知限制'],
    exitCriteria: ['验收标准逐项通过或有明确豁免', '评测报告经客户确认', '上线风险可接受'],
  },
  {
    no: '07',
    anchor: 'deploy',
    name: 'Deploy',
    nameCn: '部署',
    chainArtifact: '生产Agent + 上线检查清单 + 运行手册',
    purpose: '接入客户生产系统，配置权限、安全策略、监控和运行环境。',
    copy: '上线不是把原型换个地址，而是把Agent接进客户的生产系统：权限、安全、监控、告警、回滚和运行环境都要配好。我们交付的不只是一个能跑的Agent，还有一套客户运维团队能接手的东西。',
    activities: [
      '生产环境部署（SaaS / 专属实例 / 自托管）',
      '权限、安全、审计配置',
      '监控、告警、日志',
      '回滚与应急预案',
      '上线检查清单与运行手册',
      '运维培训',
    ],
    artifacts: ['生产Agent（Production Agent）', '上线检查清单', '运行手册', '监控 / 权限配置'],
    clientParticipation: ['运维 / 安全参与上线评审', '确认监控、告警、回滚', '签收上线检查清单'],
    exitCriteria: ['上线检查清单全绿', '监控 / 告警生效', '客户运维能独立完成一次排障 / 回滚演练'],
  },
  {
    no: '08',
    anchor: 'optimize',
    name: 'Optimize',
    nameCn: '优化',
    chainArtifact: '运营报告 + 迭代清单 + 更新后的评测集 / 知识库',
    purpose: '根据实际使用数据迭代Agent、Skills、Knowledge和Workflow。',
    copy: '上线后，Agent会暴露真实世界里的长尾问题。我们在约定的支持范围内看使用数据、失败案例和成本，按优先级迭代Agent、知识库和工作流；每次迭代都更新评测集，避免改好一个、弄坏另一个。',
    activities: [
      '使用数据、成功率、成本监控',
      '失败案例归因',
      'Agent / Skills / Knowledge / Workflow迭代',
      '评测集更新',
      '迭代优先级与发布',
      '运营报告',
    ],
    artifacts: ['运营报告', '迭代清单', '更新后的评测集 / 知识库（Continuous Improvement）'],
    clientParticipation: [
      '业务与运维定期看运营报告',
      '确认迭代优先级',
      '提供新的真实案例',
      '更新知识',
    ],
    exitCriteria: ['运营报告定期产出', '迭代清单有优先级和负责人', '评测集随迭代更新'],
  },
];

export interface DeliveryGroup {
  readonly id: DeliveryGroupId;
  readonly title: string;
  readonly titleCn: string;
  readonly range: string;
  readonly summary: string;
  readonly checks: readonly string[];
  readonly linkLabel: string;
  readonly stageAnchors: readonly string[];
}

export const deliveryGroups: readonly DeliveryGroup[] = [
  {
    id: 'discover-diagnose',
    title: 'Discover / Diagnose',
    titleCn: '发现与诊断',
    range: '阶段01–02',
    summary:
      '先把业务、组织、系统、数据与约束盘点清楚，再判断值不值得做。问题定义不是需求清单，而是带ROI假设、可行性与风险的结论。',
    checks: ['客户业务画像', '问题定义与ROI假设'],
    linkLabel: '看阶段01–02',
    stageAnchors: ['discover', 'diagnose'],
  },
  {
    id: 'define-design',
    title: 'Define / Design',
    titleCn: '定义与设计',
    range: '阶段03–04',
    summary:
      '先把验收标准与评测集定下来，再动手构建。Agent规格卡写清职责、目标、非目标、权限与成功指标；方案架构写到可施工。',
    checks: ['Agent规格卡与验收标准', '评测集v0与方案架构'],
    linkLabel: '看阶段03–04',
    stageAnchors: ['define', 'design'],
  },
  {
    id: 'build-validate',
    title: 'Build / Validate',
    titleCn: '构建与验证',
    range: '阶段05–06',
    summary:
      '在沙箱或预发环境跑真实任务，按规格构建可运行原型；再用同一套锁定评测集与验收标准逐项打分，产出可复核的评测报告。',
    checks: ['可运行原型', '评测报告与失败案例'],
    linkLabel: '看阶段05–06',
    stageAnchors: ['build', 'validate'],
  },
  {
    id: 'deploy-optimize',
    title: 'Deploy / Optimize',
    titleCn: '上线与优化',
    range: '阶段07–08',
    summary:
      '接入生产系统，完成权限、监控、告警与回滚配置；上线后用使用数据、失败案例与成本持续迭代Agent、Skills、Knowledge与Workflow。',
    checks: ['生产Agent与上线检查清单', '运营报告与下一轮迭代计划'],
    linkLabel: '看阶段07–08',
    stageAnchors: ['deploy', 'optimize'],
  },
];

export interface MethodologyPrinciple {
  readonly title: string;
  readonly label: string;
  readonly summary: string;
}

export const methodologyPrinciples: readonly MethodologyPrinciple[] = [
  {
    title: '结果导向',
    label: 'Outcome-driven',
    summary:
      '我们不以“Agent开发完成”为交付标准，而以业务结果为目标。每个阶段都有可检查的产出，最终按Define阶段定下的验收标准验收；做不出来就早说。',
  },
  {
    title: '共同构建',
    label: 'Co-building',
    summary:
      '前置交付工程师与客户业务人员一起设计、构建、验证，不让需求在交接中失真。关键产出物由客户拍板，不是我们单方面宣布完成。',
  },
  {
    title: '产品化沉淀',
    label: 'Productization',
    summary:
      '每次交付都把通用能力沉淀为可复用的Agent模式、Skills、Connectors和工程组件。客户专属的业务逻辑、数据、本体与配置留在客户环境，不进入复用池。',
  },
];

export interface ArtifactStep {
  readonly no: string;
  readonly stage: string;
  readonly stageAnchor: string;
  readonly artifact: string;
}

export const artifactChain: readonly ArtifactStep[] = deliveryStages.map((stage) => ({
  no: stage.no,
  stage: stage.name,
  stageAnchor: stage.anchor,
  artifact: stage.chainArtifact,
}));

export const agentSpecCardItems: readonly string[] = [
  '目标 / 非目标',
  '用户与使用场景',
  '输入 / 输出',
  '工具与系统权限',
  '知识与记忆',
  '人工交接点',
  '失败模式与兜底',
  '成功指标与验收标准',
  '评测集v0',
];

export const methodologyCopy = {
  hero: {
    kicker: 'FDE 8阶段交付方法论',
    title: '从业务结果出发，而不是从技术方案出发。',
    lead: '8个交付阶段，3条原则；把AI Agent从业务问题做到生产上线。',
    primaryCta: '聊聊你的场景',
    secondaryCta: '看合作流程',
    facts: ['8个交付阶段', '4组推进', '3条原则'],
    fdeNote:
      'FDE（Forward Deployed Engineering，前置交付）是一种工程师与客户业务人员共同工作的交付模式；执行者是前置交付工程师。',
  },
  principles: {
    kicker: '三条原则',
    title: '三条原则，约束每个交付阶段。',
    lead: '原则不是口号；它们决定阶段怎么排、产出物怎么定义、客户在哪里拍板。',
  },
  stages: {
    kicker: '8阶段总览',
    title: '8个交付阶段，4组推进。',
    lead: '从发现与诊断，到上线与优化；每一组都有自己的产出物与过关条件。',
    trimTitle: '阶段裁剪规则',
    trimBody:
      '项目规模不同，Discover / Diagnose / Design / Build / Optimize可以合并；但Define、Validate、Deploy不跳过。这三步分别对应“做对的事、证明做对了、真正上线”。',
  },
  details: {
    kicker: '逐阶段详情',
    title: '每个阶段，都有可检查的交付。',
    lead: '目的、关键活动、产出物、客户参与点和过关条件；进入下一阶段之前先过门禁。',
  },
  artifacts: {
    kicker: '产出物链',
    title: '从客户业务画像，到运营报告。',
    lead: '8个阶段依次留下可检查的产出物；Agent规格卡把职责、权限与验收写在同一份规格里。',
    specTitle: 'Agent规格卡',
    specNote: '结构示意；非客户项目数据。',
  },
  division: {
    kicker: '两页怎么分工',
    title: '方法论讲交付，流程页讲合作。',
    lead: '一个回答“怎么把Agent做对”，一个回答“合作怎么开始、怎么推进”。',
    cards: [
      {
        id: 'methodology',
        code: '01 / 这一页',
        title: '交付阶段',
        summary: '讲8个阶段的工程活动、产出物、客户参与点与过关条件。',
        points: [
          '每个阶段的目的与过关条件',
          '8项产出物如何在阶段之间交接',
          '工程上怎么验证，而不是怎么演示',
        ],
      },
      {
        id: 'process',
        code: '02 / 合作流程页',
        title: '合作节点',
        summary: '讲合作如何开始、如何做可行性评估、如何推进到上线之后。',
        points: ['第一次沟通与可行性判断', '如何从评估走到启动', '上线之后的支持边界'],
        linkLabel: '看合作流程',
      },
    ],
  },
  cta: {
    kicker: '下一步',
    title: '从第一个具体场景开始。',
    lead: '带一个真实的业务流程来。我们一起判断值不值得做、先做哪一步，以及第一个验证切片长什么样。',
    primaryCta: '聊聊你的场景',
    secondaryCta: '看合作流程',
  },
} as const;
