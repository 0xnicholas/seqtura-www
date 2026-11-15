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
}

export const deliveryGroups: readonly DeliveryGroup[] = [
  {
    id: 'discover-diagnose',
    title: 'Discover / Diagnose',
    range: '阶段 01–02',
    summary: '先把业务和问题看清楚，不急着讲方案。',
  },
  {
    id: 'define-design',
    title: 'Define / Design',
    range: '阶段 03–04',
    summary: '把职责、验收标准和方案定死，再动手。',
  },
  {
    id: 'build-validate',
    title: 'Build / Validate',
    range: '阶段 05–06',
    summary: '按规格构建，用真实业务人员和评测集验证。',
  },
  {
    id: 'deploy-optimize',
    title: 'Deploy / Optimize',
    range: '阶段 07–08',
    summary: '接进生产系统，用真实数据持续迭代。',
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
