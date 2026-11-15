export interface DeliveryStage {
  readonly no: string;
  readonly name: string;
  readonly nameCn: string;
  readonly artifact: string;
}

export const deliveryStages: readonly DeliveryStage[] = [
  { no: '01', name: 'Discover', nameCn: '发现', artifact: '客户业务画像' },
  { no: '02', name: 'Diagnose', nameCn: '诊断', artifact: '问题定义 + ROI 假设' },
  { no: '03', name: 'Define', nameCn: '定义', artifact: 'Agent 规格卡 / 验收标准 / 评测集 v0' },
  { no: '04', name: 'Design', nameCn: '设计', artifact: '方案架构' },
  { no: '05', name: 'Build', nameCn: '构建', artifact: '可运行原型' },
  { no: '06', name: 'Validate', nameCn: '验证', artifact: '评测报告' },
  { no: '07', name: 'Deploy', nameCn: '部署', artifact: '生产 Agent' },
  { no: '08', name: 'Optimize', nameCn: '优化', artifact: '运营报告' },
];

export interface DeliveryGroup {
  readonly id: string;
  readonly title: string;
  readonly range: string;
  readonly summary: string;
  readonly checks: readonly string[];
  readonly linkLabel: string;
}

export const deliveryGroups: readonly DeliveryGroup[] = [
  {
    id: 'discover-diagnose',
    title: 'Discover / Diagnose',
    range: '阶段 01–02',
    summary:
      '先把业务、组织、系统、数据与约束盘点清楚，再判断值不值得做。问题定义不是需求清单，而是带 ROI 假设、可行性与风险的结论。',
    checks: ['客户业务画像', '问题定义与 ROI 假设'],
    linkLabel: '看阶段 01–02',
  },
  {
    id: 'define-design',
    title: 'Define / Design',
    range: '阶段 03–04',
    summary:
      '先把验收标准与评测集定下来，再动手构建。Agent 规格卡写清职责、目标、非目标、权限与成功指标；方案架构写到可施工。',
    checks: ['Agent 规格卡与验收标准', '评测集 v0 与方案架构'],
    linkLabel: '看阶段 03–04',
  },
  {
    id: 'build-validate',
    title: 'Build / Validate',
    range: '阶段 05–06',
    summary:
      '在沙箱或预发环境跑真实任务，按规格构建可运行原型；再用同一套锁定评测集与验收标准逐项打分，产出可复核的评测报告。',
    checks: ['可运行原型', '评测报告与失败案例'],
    linkLabel: '看阶段 05–06',
  },
  {
    id: 'deploy-optimize',
    title: 'Deploy / Optimize',
    range: '阶段 07–08',
    summary:
      '接入生产系统，完成权限、监控、告警与回滚配置；上线后用使用数据、失败案例与成本持续迭代 Agent、Skills、Knowledge 与 Workflow。',
    checks: ['生产 Agent 与上线检查清单', '运营报告与下一轮迭代计划'],
    linkLabel: '看阶段 07–08',
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
    summary: '以业务结果验收，不以 Agent 开发完成为标准。',
  },
  {
    title: '共同构建',
    label: 'Co-building',
    summary: '客户业务人员参与设计、构建与验证，关键产出物由客户拍板。',
  },
  {
    title: '产品化沉淀',
    label: 'Productization',
    summary: '通用能力沉淀为可复用组件；客户专属逻辑与数据留在客户环境。',
  },
];
