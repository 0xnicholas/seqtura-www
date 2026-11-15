import { placeholders } from './placeholders';

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const navItems: readonly NavItem[] = [
  { href: '/methodology', label: '工作方法论' },
  { href: '/architecture', label: '技术架构' },
  { href: '/process', label: '合作流程' },
  { href: '/contact', label: '联系我们' },
];

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly NavItem[];
}

export const footerColumns: readonly FooterColumn[] = [
  {
    title: '站点',
    links: [{ href: '/', label: '首页' }, ...navItems],
  },
  {
    title: '交付',
    links: [
      { href: '/methodology#stages', label: '8 阶段交付' },
      { href: '/architecture#overview', label: '参考架构' },
      { href: '/process#stages', label: '验证切片' },
      { href: '/process#support', label: '支持期' },
    ],
  },
  {
    title: '联系',
    links: [
      { href: '/contact#book', label: '预约 30 分钟' },
      { href: '/contact#about', label: '关于我们' },
      { href: '/contact#channels', label: '飞书 / 微信' },
      { href: `mailto:${placeholders.contactEmail.value}`, label: '邮箱' },
    ],
  },
];

export const site = {
  name: 'Seqtura AI',
  nameCn: '序构 AI',
  tagline: '把 AI Agent 从演示做到上线。',
  defaultTitle: 'Seqtura AI（序构 AI）｜企业 AI Agent 的工程化交付',
  description: '把 AI Agent 从演示做到上线：8 阶段交付方法、可私有化的参考架构、可审计的工程边界。',
  bookingPath: '/contact#book',
} as const;

export interface PageAnchor {
  readonly id: string;
  readonly label: string;
}

export const pageAnchors = {
  methodology: [
    { id: 'stages', label: '8 阶段总览' },
    { id: 'discover', label: '01 Discover / 发现' },
    { id: 'diagnose', label: '02 Diagnose / 诊断' },
    { id: 'define', label: '03 Define / 定义' },
    { id: 'design', label: '04 Design / 设计' },
    { id: 'build', label: '05 Build / 构建' },
    { id: 'validate', label: '06 Validate / 验证' },
    { id: 'deploy', label: '07 Deploy / 部署' },
    { id: 'optimize', label: '08 Optimize / 优化' },
  ],
  architecture: [
    { id: 'overview', label: '参考架构总览' },
    { id: 'lifecycle', label: '请求生命周期' },
    { id: 'layers', label: '能力栈分层' },
    { id: 'controls', label: '控制面' },
    { id: 'scenarios', label: '典型场景' },
  ],
  process: [
    { id: 'stages', label: '合作阶段' },
    { id: 'pricing', label: '计价原则' },
    { id: 'support', label: '上线后支持' },
  ],
  contact: [
    { id: 'book', label: '预约表单' },
    { id: 'channels', label: '其他通道' },
    { id: 'about', label: '关于我们' },
  ],
} as const satisfies Record<string, readonly PageAnchor[]>;

export type AnchoredPage = keyof typeof pageAnchors;
