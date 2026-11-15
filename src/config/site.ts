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
