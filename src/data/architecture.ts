export interface CapabilityLayer {
  readonly no: string;
  readonly name: string;
  readonly label: string;
  readonly summary: string;
  readonly chips: readonly string[];
}

export type OverviewMark = 'lock' | 'human' | 'record';

export interface ArchitectureLayer extends CapabilityLayer {
  readonly id: 'ingress' | 'models' | 'tools' | 'knowledge' | 'runtime';
  readonly responsibility: string;
  readonly constraint: string;
  readonly practice: string;
  readonly marks: readonly OverviewMark[];
}

export const architectureLayers: readonly ArchitectureLayer[] = [
  {
    id: 'ingress',
    no: 'L1',
    name: '接入与编排',
    label: 'Ingress & Orchestration',
    responsibility: '任务从哪来、下一步由代码还是模型决定、何时交给人。',
    constraint:
      'Workflow可预测但覆盖有限；Agent灵活但需要护栏；多Agent handoff增加状态与责任边界。',
    practice:
      '先workflow后agent；单Agent优先；多Agent只在职责边界清楚时用；HITL gate放在敏感工具调用前。',
    summary: '任务入口 / Workflow / HITL gate / 状态与重放',
    chips: ['Workflow', 'HITL', '路由'],
    marks: ['human'],
  },
  {
    id: 'models',
    no: 'L2',
    name: '模型',
    label: 'Models',
    responsibility: '选模型、降级、控制质量 / 成本 / 时延。',
    constraint: '路由受最小模型上下文限制；效果需自有评测集验证；私有模型能力参差。',
    practice: '模型层按可替换设计；路由 + fallback；不绑定单一厂商；模型选择用评测集说话。',
    summary: '模型路由 / 结构化输出 / 失败回退 / 成本控制',
    chips: ['路由', 'Fallback', '成本'],
    marks: [],
  },
  {
    id: 'tools',
    no: 'L3',
    name: '工具与系统集成',
    label: 'Tools & Integration',
    responsibility: '把客户系统暴露为Agent可调用的工具。',
    constraint: '工具是权限边界；每次调用都要校验；写操作需要幂等 / 回滚。',
    practice: 'MCP / OpenAPI按标准协议接入；工具注册与最小权限；沙箱联调；工具调用处设权限检查点。',
    summary: '标准接入 / 最小权限 / 沙箱联调 / 幂等回滚',
    chips: ['MCP', 'OpenAPI', '最小权限'],
    marks: ['lock', 'record'],
  },
  {
    id: 'knowledge',
    no: 'L4',
    name: '知识与记忆',
    label: 'Knowledge & Memory',
    responsibility: '让Agent拿到正确的业务知识，并在多轮 / 跨会话中保持状态。',
    constraint: '检索必须带权限过滤；引用要可追溯；长期记忆涉及保留 / 删除 / 合规。',
    practice:
      'ingestion → 解析 → 索引 → 检索 → 引用；检索时ACL；短期会话状态与长期记忆分开；记忆策略写入方案架构。',
    summary: '业务本体 / 检索 / 会话记忆 / 权限过滤',
    chips: ['RAG', 'ACL', '引用'],
    marks: ['lock'],
  },
  {
    id: 'runtime',
    no: 'L5',
    name: '运行时与部署',
    label: 'Runtime & Deployment',
    responsibility: 'Agent跑在哪、如何隔离、如何升级 / 回滚 / 监控。',
    constraint: '部署形态决定数据边界、运维责任与成本；自托管增加客户运维负担。',
    practice:
      '按三档部署模型（SaaS / 专属实例 / 自托管）；会话隔离与沙箱；监控 / 告警 / 回滚；上线检查清单与运行手册。',
    summary: 'SaaS / 专属实例 / 自托管 / 监控与回滚',
    chips: ['SaaS', '专属实例', '自托管'],
    marks: ['record'],
  },
];

export const capabilityLayers: readonly CapabilityLayer[] = [...architectureLayers]
  .reverse()
  .map(({ no, name, label, summary, chips }) => ({ no, name, label, summary, chips }));

export const structuralNote = '结构示意，非客户项目数据';

export interface ControlPlane {
  readonly id: 'identity' | 'evaluation' | 'policy';
  readonly code: string;
  readonly short: string;
  readonly name: string;
  readonly label: string;
  readonly manages: string;
  readonly lands: string;
  readonly verifies: string;
  readonly summary: string;
  readonly chips: readonly string[];
}

export const controlPlanes: readonly ControlPlane[] = [
  {
    id: 'identity',
    code: 'C1 / IDENTITY',
    short: 'C1',
    name: '身份与权限',
    label: 'Identity & Access',
    manages: '架构要求Agent独立身份、委派与最小权限。',
    lands: '每次工具调用、每次数据访问。',
    verifies: '权限矩阵 + 审计记录 + 越权测试。',
    summary:
      '每次工具调用都应有主体、权限与审批记录；读、写、外发分开授权，敏感操作经过HITL gate。',
    chips: ['RBAC', '审批', '最小权限'],
  },
  {
    id: 'evaluation',
    code: 'C2 / EVALUATION',
    short: 'C2',
    name: '评测与可观测',
    label: 'Evaluation & Observability',
    manages: '离线 / 在线评测、检索 / 工具 / 任务三层指标、trace。',
    lands: '评测集、生产trace、发布门禁。',
    verifies: '评测报告 + trace回放。',
    summary:
      '评测集、trace、成本与失败案例放在同一视图；上线前按同一套标准打分，上线后持续用真实任务回归。',
    chips: ['评测集', 'Trace', '成本'],
  },
  {
    id: 'policy',
    code: 'C3 / AUDIT',
    short: 'C3',
    name: '策略与审计',
    label: 'Policy & Audit',
    manages: 'guardrail、审批gate、审计字段、保留与数据边界。',
    lands: '输入 / 输出 / 工具调用。',
    verifies: '策略清单 + 审计导出 + 审批记录。',
    summary: '策略在工具调用前生效，审计字段覆盖输入、检索、工具调用与输出，可回放到具体一步。',
    chips: ['策略', '可回放', '留痕'],
  },
];

export interface TraceStep {
  readonly time: string;
  readonly event: string;
  readonly detail: string;
  readonly hitl?: boolean;
}

export const traceSteps: readonly TraceStep[] = [
  { time: '00:00', event: 'task.in', detail: '来自客户系统的退款咨询' },
  { time: '00:03', event: 'policy.check', detail: '身份与权限校验通过' },
  { time: '00:11', event: 'tool.call', detail: '查询订单与售后记录' },
  {
    time: '00:42',
    event: 'hitl.gate',
    detail: '金额超过阈值，等待业务负责人审批',
    hitl: true,
  },
  { time: '01:06', event: 'eval.run', detail: '按评测集检查回复与工具调用' },
  { time: '01:08', event: 'task.out', detail: '输出回复，写入审计字段' },
];

export const architectureCopy = {
  hero: {
    kicker: '技术架构 / 交付参考架构',
    title: '一个能上生产的Agent系统，由什么构成',
    lead: '可私有化、可审计、模型可替换的交付参考架构；从一次任务的进入，到上线后的迭代。',
    tags: ['可私有化', '可审计', '模型可替换'],
    primaryCta: '和架构师聊聊',
    secondaryCta: '看工作方法',
  },
  overview: {
    kicker: '01 / 总览',
    title: '一张图，看清系统、控制面与交付边界。',
    lead: '五层能力栈是能力的纵向分工，三条控制面横切每一次调用；虚线框内是我们交付的组件与模式。',
    boundaryNote: '源码范围、部署档位与实现深度由合同约定；这里只描述可复用的组件与模式。',
  },
  lifecycle: {
    kicker: '02 / 请求生命周期',
    title: '一条任务，六步走完；每一步都留下记录。',
    lead: '以一张售后工单为示意，从任务进入、编排决策到输出与评测，看状态、权限与人工介入点落在哪里。',
    scenarioTitle: '一张售后工单，如何穿过生命周期',
    scenarioNote: '示意：售后工单微场景，非客户案例。',
  },
  layers: {
    kicker: '03 / 能力栈',
    title: '五层能力栈，按职责与边界划分。',
    lead: '每一层都写清负责什么、关键约束与我们的做法；能力chip只列机制，不展开具体选型。',
    caption: '五层能力栈：负责什么、关键约束、我们的做法与能力。',
  },
  controls: {
    kicker: '04 / 控制面',
    title: '三条控制面，横切五层。',
    lead: '身份与权限、评测与可观测、策略与审计不是最后一层安全，而是每次任务执行都要经过的横切机制。',
    caption: '三条控制面：管什么、落在哪、怎么验证。',
    note: '以上为架构设计原则与验证方式；具体能力范围与实现方式在方案阶段确认。',
  },
  concerns: {
    kicker: '05 / 企业关切',
    title: '五个企业关切，先讲机制，再讲边界。',
    lead: '每个关切都按问题、机制、边界展开；边界之外的事，留给方案与合同。',
  },
  scenarios: {
    kicker: '06 / 典型场景',
    title: '三个典型场景，把架构映射到业务问题。',
    lead: '每个场景都写清Agent做什么、用到哪几层、人在哪里介入、怎么评测。',
    note: '典型场景示意，非客户案例。',
  },
  metrics: {
    kicker: '07 / 指标',
    title: '指标只讲评什么、怎么用，不报数字。',
    lead: '指标用于发布门禁、回归与迭代判断，不作为营销证明。',
    note: '不报未经验证的数字；具体阈值按项目与评测集约定。',
  },
  closing: {
    kicker: '下一步',
    title: '工作方法讲怎么把Agent做对；这页讲系统长什么样、凭什么敢上线。',
    lead: '带上一个具体场景，我们一起判断它该落在哪几层、哪一档部署，以及第一个验证切片怎么做。',
    primaryCta: '和架构师聊聊',
    secondaryCta: '看工作方法',
    processCta: '看合作流程',
  },
} as const;

export const overviewConclusions: readonly string[] = [
  'Agent不是一个模型调用，而是一条有状态的执行链：接入 → 编排 → 模型 → 工具 / 知识 → 人 → 输出。',
  '敢上线靠三条横切控制面：身份与权限、评测与可观测、策略与审计；安全不是最后一层。',
  '架构按交付边界划分：我们交付组件与模式，客户保留系统、数据、身份与审批权。',
];

export interface OverviewZone {
  readonly id: 'users' | 'runtime';
  readonly tag: string;
  readonly title: string;
  readonly items: readonly string[];
  readonly note: string;
}

export const overviewZones: readonly OverviewZone[] = [
  {
    id: 'users',
    tag: 'ZONE A / 请求来源',
    title: '用户 / 业务系统',
    items: ['业务系统', '客服工作台', '内部工具', '定时任务'],
    note: '请求从这里进入；身份由客户身份源提供。',
  },
  {
    id: 'runtime',
    tag: 'ZONE C / 客户保留',
    title: '客户运行环境',
    items: ['客户系统', '数据与存储', '身份源', '审批流程'],
    note: '系统、数据、身份与审批权留在客户侧。',
  },
];

export const overviewBoundary = {
  tag: 'ZONE B / 交付边界',
  title: 'Seqtura交付边界',
  sub: '组件与模式',
  flow: '请求 / 数据流穿过五层；控制面横切每一次调用',
} as const;

export interface ArchitectureLegendItem {
  readonly id: string;
  readonly marker: 'solid' | 'dashed' | 'dotted' | 'boundary' | 'lock' | 'human' | 'record';
  readonly label: string;
}

export const architectureLegend: readonly ArchitectureLegendItem[] = [
  { id: 'flow', marker: 'solid', label: '实线 = 请求 / 数据流' },
  { id: 'control', marker: 'dashed', label: '虚线 = 控制 / 遥测' },
  { id: 'permission', marker: 'lock', label: '锁 = 权限检查点' },
  { id: 'hitl', marker: 'human', label: '人 = HITL gate' },
  { id: 'trace', marker: 'dotted', label: '点线 = trace' },
  { id: 'audit', marker: 'record', label: '记录 = audit' },
  { id: 'boundary', marker: 'boundary', label: '虚线框 = Seqtura交付边界' },
];

export interface DeploymentTier {
  readonly id: 'saas' | 'dedicated' | 'self-hosted';
  readonly no: string;
  readonly name: string;
  readonly label: string;
  readonly operator: string;
  readonly data: string;
  readonly offline: string;
  readonly when: string;
}

export const deploymentTiers: readonly DeploymentTier[] = [
  {
    id: 'saas',
    no: 'D1',
    name: 'SaaS',
    label: '托管服务',
    operator: '服务方运维托管环境。',
    data: '数据在服务方托管环境，区域与保留策略按方案确认。',
    offline: '不承诺离线模型；模型调用发生在托管服务内。',
    when: '需要快速上线、接受托管边界时优先评估。',
  },
  {
    id: 'dedicated',
    no: 'D2',
    name: '专属实例',
    label: '隔离实例',
    operator: '服务方与客户按合同划分，客户负责自有网络与身份源。',
    data: '数据在客户指定的隔离实例内，可使用客户自有存储与密钥。',
    offline: '按项目评估；模型能否离线取决于所选模型与客户环境。',
    when: '需要更强隔离、但不想承担全部运维时评估。',
  },
  {
    id: 'self-hosted',
    no: 'D3',
    name: '自托管',
    label: '客户环境',
    operator: '客户运维；Seqtura提供组件、模式与运行手册。',
    data: '数据留在客户自有环境，日志与备份由客户控制。',
    offline: '按所选模型与部署条件确认；不默认承诺离线。',
    when: '数据边界或网络隔离要求最高时评估。',
  },
];

export const deploymentNote =
  '三档是参考部署模型与选择依据；具体档位、运维分工与合同条款在方案阶段确认。';

export interface LifecycleNode {
  readonly id: string;
  readonly no: string;
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly permission?: boolean;
  readonly hitl?: boolean;
  readonly audits?: readonly string[];
}

export const lifecycleNodes: readonly LifecycleNode[] = [
  {
    id: 'task-in',
    no: '01',
    name: '任务进入',
    label: 'Task In',
    description: '来自业务系统、人工入口或定时任务；先记录来源、身份与目标。',
  },
  {
    id: 'orchestrate',
    no: '02',
    name: '编排决策',
    label: 'Orchestrate',
    description: '由workflow决定下一步，或由agent在护栏内选择；状态与责任边界写入执行记录。',
  },
  {
    id: 'model-route',
    no: '03',
    name: '模型选择',
    label: 'Model Route',
    description: '按任务复杂度与上下文窗口选择模型；失败时按规则fallback。',
  },
  {
    id: 'tools-knowledge',
    no: '04',
    name: '工具 / 知识调用',
    label: 'Tools / Knowledge',
    description: '按标准协议调用客户系统或检索知识；每次调用校验权限，写操作要求幂等与回滚。',
    permission: true,
    audits: ['工具调用', '数据变更'],
  },
  {
    id: 'hitl-gate',
    no: '05',
    name: 'HITL gate',
    label: 'Human Gate',
    description: '敏感工具调用或高风险写操作前交给人；审批结果进入审计。',
    permission: true,
    hitl: true,
    audits: ['人工审批'],
  },
  {
    id: 'output-eval',
    no: '06',
    name: '输出与评测',
    label: 'Output & Eval',
    description: '输出结果、引用与评测记录；评测结果回到编排与知识迭代。',
  },
];

export const lifecycleConstraints = [
  {
    id: 'workflow',
    title: 'Workflow可预测，但覆盖有限。',
    body: '固定路径容易验证，遇到长尾就要靠人工兜底与规则补丁。',
  },
  {
    id: 'agent',
    title: 'Agent更灵活，但需要护栏与评测。',
    body: '自主选择下一步，必须用权限、工具边界与评测集约束。',
  },
  {
    id: 'hitl',
    title: 'HITL增加时延，路由受最小模型上下文限制。',
    body: '人工审批与模型切换都要计入端到端时延与成本。',
  },
] as const;

export interface EnterpriseConcern {
  readonly id: 'private' | 'residency' | 'identity' | 'cost' | 'evaluation';
  readonly no: string;
  readonly title: string;
  readonly question: string;
  readonly mechanism: string;
  readonly boundary: string;
}

export const enterpriseConcerns: readonly EnterpriseConcern[] = [
  {
    id: 'private',
    no: '01',
    title: '私有化',
    question: '能不能放在我们自己的环境里？',
    mechanism: 'SaaS、专属实例、自托管三档，按数据边界、运维责任与模型离线需求选择。',
    boundary: '具体档位与合同条款在方案阶段确认。',
  },
  {
    id: 'residency',
    no: '02',
    title: '数据驻留',
    question: '数据会不会离开我们的边界？',
    mechanism: '区域选择、VNet / PrivateLink、自带存储与密钥、日志保留，都是架构设计中的控制点。',
    boundary: '“不出域”是法律与合同承诺，架构只提供技术控制点。',
  },
  {
    id: 'identity',
    no: '03',
    title: '身份、权限与审计',
    question: 'Agent会不会拿着过大的权限行动？',
    mechanism:
      '架构要求Agent使用独立身份、最小权限，并在每次工具调用时校验；审计应能回答“谁 / 什么身份 / 调了什么工具 / 改了什么数据”。',
    boundary: '客户身份源与审批流程仍在客户侧。',
  },
  {
    id: 'cost',
    no: '04',
    title: '模型路由与成本',
    question: '会不会被单一模型锁定，成本失控？',
    mechanism: '按任务复杂度选模型、fallback、按任务 / Agent观测token与成本；模型层按可替换设计。',
    boundary: '路由受最小模型限制，效果需自有评测集验证。',
  },
  {
    id: 'evaluation',
    no: '05',
    title: '评测与可观测',
    question: '上线后怎么知道它变好还是变坏？',
    mechanism: '三层指标、离线 / 在线评测、trace与audit分开；评测结果进入发布门禁与迭代。',
    boundary: '不报未经验证的数字；trace用于排障，audit用于合规，不能互替。',
  },
];

export interface ArchitectureScenario {
  readonly id: 'support' | 'knowledge-base' | 'process-automation';
  readonly no: string;
  readonly title: string;
  readonly scene: string;
  readonly role: string;
  readonly layers: string;
  readonly human: string;
  readonly evaluation: string;
  readonly flow: readonly ScenarioFlowNode[];
}

export interface ScenarioFlowNode {
  readonly label: string;
  readonly layer: string;
  readonly human?: boolean;
}

export const architectureScenarios: readonly ArchitectureScenario[] = [
  {
    id: 'support',
    no: '01',
    title: '客服与售后工单',
    scene: '客户提出退换货、物流或售后问题，需要跨订单与售后记录处理。',
    role: '识别问题、查订单 / 售后记录、起草回复或发起退款工单。',
    layers: '接入与编排、模型、工具与系统集成、运行时与部署。',
    human: '金额超阈值或高风险操作由业务负责人审批。',
    evaluation: '任务成功率、工具调用正确率、回复引用准确性。',
    flow: [
      { label: '工单进入', layer: '接入与编排' },
      { label: '识别问题', layer: '模型' },
      { label: '查订单与售后记录', layer: '工具与系统集成' },
      { label: '业务负责人审批', layer: 'HITL gate', human: true },
      { label: '起草回复与留痕', layer: '运行时与部署' },
    ],
  },
  {
    id: 'knowledge-base',
    no: '02',
    title: '企业知识库问答',
    scene: '员工需要查制度、产品与交付文档。',
    role: '检索制度 / 产品 / 交付文档，带引用回答，缺口转人工。',
    layers: '知识与记忆、模型、接入与编排、控制面。',
    human: '低置信度或权限不足时转知识管理员。',
    evaluation: '检索质量、引用可追溯、拒答准确率。',
    flow: [
      { label: '提问进入', layer: '接入与编排' },
      { label: '检索制度与交付文档', layer: '知识与记忆' },
      { label: '带引用回答', layer: '模型' },
      { label: '低置信度转知识管理员', layer: 'HITL gate', human: true },
      { label: '缺口回流知识迭代', layer: '知识与记忆' },
    ],
  },
  {
    id: 'process-automation',
    no: '03',
    title: '流程自动化（审批 / 录入 / 对账）',
    scene: '重复的审批、录入与对账流程需要跨系统搬运与核对。',
    role: '抽取字段、匹配规则、生成审批或录入草稿，异常转人工。',
    layers: '工具与系统集成、接入与编排、运行时与部署、控制面。',
    human: '异常与写操作前审批。',
    evaluation: '任务完成率、字段准确率、回滚成功率。',
    flow: [
      { label: '单据进入', layer: '接入与编排' },
      { label: '抽取字段', layer: '模型' },
      { label: '匹配规则、调用系统', layer: '工具与系统集成' },
      { label: '异常与写操作审批', layer: 'HITL gate', human: true },
      { label: '生成草稿与回滚记录', layer: '运行时与部署' },
    ],
  },
];

export interface ArchitectureMetric {
  readonly id: string;
  readonly no: string;
  readonly name: string;
  readonly use: string;
}

export const architectureMetrics: readonly ArchitectureMetric[] = [
  {
    id: 'task-success',
    no: '01',
    name: '任务成功率',
    use: '判断Agent是否真正完成任务；用于发布门禁与上线后回归。',
  },
  {
    id: 'tool-correctness',
    no: '02',
    name: '工具调用正确率',
    use: '检查工具选择与参数是否正确；用于定位集成与权限问题。',
  },
  {
    id: 'retrieval-quality',
    no: '03',
    name: '检索质量',
    use: '检查召回与引用是否支撑回答；用于知识库迭代。',
  },
  {
    id: 'latency',
    no: '04',
    name: 'P95时延',
    use: '观察端到端响应；用于容量与体验权衡。',
  },
  {
    id: 'cost',
    no: '05',
    name: '单任务成本',
    use: '按任务 / Agent归集token与调用成本；用于模型路由与预算。',
  },
];
