export interface CapabilityLayer {
  readonly no: string;
  readonly name: string;
  readonly label: string;
  readonly summary: string;
  readonly chips: readonly string[];
}

export const capabilityLayers: readonly CapabilityLayer[] = [
  {
    no: 'L5',
    name: '运行时与部署',
    label: 'Runtime',
    summary: 'SaaS / 专属实例 / 自托管 / 监控与回滚',
    chips: ['专属实例', '自托管'],
  },
  {
    no: 'L4',
    name: '知识与记忆',
    label: 'Knowledge',
    summary: '业务本体 / 检索 / 会话记忆 / 权限过滤',
    chips: ['Ontology', 'RAG'],
  },
  {
    no: 'L3',
    name: '工具与系统集成',
    label: 'Tools',
    summary: '标准接入 / 最小权限 / 沙箱联调 / 幂等回滚',
    chips: ['API', 'MCP'],
  },
  {
    no: 'L2',
    name: '模型',
    label: 'Models',
    summary: '模型路由 / 结构化输出 / 失败回退 / 成本控制',
    chips: ['多模型', '可替换'],
  },
  {
    no: 'L1',
    name: '接入与编排',
    label: 'Orchestration',
    summary: '任务入口 / Workflow / HITL gate / 状态与重放',
    chips: ['Workflow', 'HITL'],
  },
];

export const structuralNote = '结构示意，非客户项目数据';

export interface ControlPlane {
  readonly code: string;
  readonly short: string;
  readonly name: string;
  readonly summary: string;
  readonly chips: readonly string[];
}

export const controlPlanes: readonly ControlPlane[] = [
  {
    code: 'C1 / IDENTITY',
    short: 'C1',
    name: '身份与权限',
    summary:
      '每次工具调用都应有主体、权限与审批记录；读、写、外发分开授权，敏感操作经过 HITL gate。',
    chips: ['RBAC', '审批', '最小权限'],
  },
  {
    code: 'C2 / EVALUATION',
    short: 'C2',
    name: '评测与可观测',
    summary:
      '评测集、trace、成本与失败案例放在同一视图；上线前按同一套标准打分，上线后持续用真实任务回归。',
    chips: ['评测集', 'Trace', '成本'],
  },
  {
    code: 'C3 / AUDIT',
    short: 'C3',
    name: '策略与审计',
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
