import { placeholders } from './placeholders';
import { productList } from '../data/products';

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export interface NavSection {
  readonly label: string;
  readonly items: readonly NavLink[];
}

export type NavEntry = NavLink | NavSection;

export function isNavSection(entry: NavEntry): entry is NavSection {
  return 'items' in entry;
}

const workMethod: NavLink = { href: '/methodology', label: '工作方法' };
const architecture: NavLink = { href: '/architecture', label: '技术架构' };
const process: NavLink = { href: '/process', label: '合作流程' };
const contact: NavLink = { href: '/contact', label: '联系我们' };

// 三条产品线走自己的列，不重复进「站点」（ADR-0002）。
const productLinks: readonly NavLink[] = productList.map(({ name, href }) => ({
  href,
  label: name,
}));

// 交付服务页面，顺序即页脚「站点」列的展示顺序。
const pageLinks: readonly NavLink[] = [workMethod, architecture, process, contact];

// 顶部导航按阅读时机分组：「产品和服务」答「你们卖什么」，排在最前；
// 「相关资料」收纳先读一读、了解我们怎么做的页面；
// 「合作流程」「联系我们」回答「准备开始谈」之后的问题，留在顶层。
export const navItems: readonly NavEntry[] = [
  { label: '产品和服务', items: productLinks },
  process,
  { label: '相关资料', items: [workMethod, architecture] },
  contact,
];

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly NavLink[];
}

export const footerColumns: readonly FooterColumn[] = [
  {
    title: '产品',
    links: productLinks,
  },
  {
    title: '站点',
    links: [{ href: '/', label: '首页' }, ...pageLinks],
  },
  {
    title: '交付',
    links: [
      { href: '/methodology#stages', label: '8阶段交付' },
      { href: '/architecture#overview', label: '参考架构' },
      { href: '/process#stages', label: '验证切片' },
      { href: '/process#support', label: '支持期' },
    ],
  },
  {
    title: '联系',
    links: [
      { href: '/contact#channels', label: '预约沟通' },
      { href: '/contact#about', label: '关于我们' },
      { href: `mailto:${placeholders.contactEmail.value}`, label: '邮箱' },
    ],
  },
];

export const site = {
  name: 'Seqtura AI',
  nameCn: '序构 AI',
  tagline: '把AI Agent从演示做到上线。',
  defaultTitle: 'Seqtura AI（序构 AI）｜企业 AI Agent 的工程化交付',
  description: '把 AI Agent 从演示做到上线：8 阶段交付方法、可私有化的参考架构、可审计的工程边界。',
  contactPath: '/contact#channels',
} as const;
