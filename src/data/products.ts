export type ProductId = 'oribos' | 'fdesforce' | 'heirloom';

export interface ProductFact {
  readonly label: string;
  readonly value: string;
}

export interface ProductCopy {
  readonly id: ProductId;
  readonly no: string;
  readonly name: string;
  readonly category: string;
  readonly href: string;
  readonly hero: {
    readonly kicker: string;
    readonly lead: string;
    readonly tags: readonly string[];
  };
  readonly what: {
    readonly kicker: string;
    readonly title: string;
    readonly lead: string;
    readonly facts: readonly ProductFact[];
  };
  readonly place: {
    readonly kicker: string;
    readonly title: string;
    readonly lead: string;
    readonly linkLabel: string;
  };
}

// 三条产品线共用一套页面骨架：hero → 它是什么 → 它在能力栈里的位置。
// 产品页不做产品级转化、不放站外链接（ADR-0002）；唯一出口是页尾回指 /architecture。
export const products: Record<ProductId, ProductCopy> = {
  oribos: {
    id: 'oribos',
    no: '01',
    name: 'Oribos',
    category: 'Agent框架',
    href: '/products/oribos',
    hero: {
      kicker: '产品线01 · Agent框架',
      lead: 'TypeScript的Agent框架：Agent、记忆、Workflow，加上长跑Agent、信号与定时任务三样运行时能力，零运行时依赖。',
      tags: ['Apache-2.0开源', 'pre-1.0', '零运行时依赖'],
    },
    what: {
      kicker: '它是什么',
      title: '把Agent做成可组合的模块',
      lead: '只组合用得到的那部分，跑在哪由你决定。',
      facts: [
        {
          label: '定位',
          value: 'Agent、记忆、Workflow与运行时能力的一层库，不是托管平台。',
        },
        {
          label: '给谁',
          value: '要把代码与部署握在自己手里的团队。',
        },
        {
          label: '现在',
          value: 'pre-1.0，接口仍会变；开源，Apache-2.0。',
        },
      ],
    },
    place: {
      kicker: '位置',
      title: '它对应能力栈的L1与L5',
      lead: '参考架构的L1负责任务从哪来、下一步由代码还是模型决定；L5负责Agent跑在哪、怎么隔离与回滚。Oribos是把这两层写成库的那条路。',
      linkLabel: '看技术架构',
    },
  },
  fdesforce: {
    id: 'fdesforce',
    no: '02',
    name: 'Fdesforce',
    category: 'FDE工作台',
    href: '/products/fdesforce',
    hero: {
      kicker: '产品线02 · FDE工作台',
      lead: 'FDE与交付团队的构建器：把Customer的Solution Spec编译成可独立部署的Bundle，让每次构建都可核对、可复现。',
      tags: ['内部工具', '失败即拒的门禁', '可复现摘要'],
    },
    what: {
      kicker: '它是什么',
      title: '交付物从一份声明式配置长出来',
      lead: 'Solution Spec是唯一真相来源；生成物、密钥与环境实际值不进配置。',
      facts: [
        {
          label: '定位',
          value: '读Solution Spec，生成可独立部署的Bundle，并用固定输入、门禁与摘要核对这次构建。',
        },
        {
          label: '给谁',
          value: '我们自己的FDE与交付团队；不对外提供账号。',
        },
        {
          label: '现在',
          value: '第一阶段「配置 → 部署 → 只读闭环」进行中。',
        },
      ],
    },
    place: {
      kicker: '位置',
      title: '它横切能力栈，不在某一层里',
      lead: '能力栈描述系统长什么样；Fdesforce描述设计怎么变成可部署的产物——方案里的编排、工具、知识与运行时，被编译进同一个Bundle。',
      linkLabel: '看技术架构',
    },
  },
  heirloom: {
    id: 'heirloom',
    no: '03',
    name: 'Heirloom',
    category: '本体层',
    href: '/products/heirloom',
    hero: {
      kicker: '产品线03 · 本体层',
      lead: '把企业的领域模型写成代码：数据、动作、逻辑与权限，在一处定义。开源、自托管。',
      tags: ['Apache-2.0开源', '自托管', '设计阶段'],
    },
    what: {
      kicker: '它是什么',
      title: '一份可执行的业务本体',
      lead: '业务对象、关系与动作不再散落在文档和各系统里，而是同一份定义。',
      facts: [
        {
          label: '定位',
          value: '用TypeScript定义业务对象、关系、动作与权限，让应用与Agent读同一份定义。',
        },
        {
          label: '给谁',
          value: '要收拢业务语义、又不愿把模型托管给第三方的团队。',
        },
        {
          label: '现在',
          value: '设计阶段：规范已公开，实现未定版。',
        },
      ],
    },
    place: {
      kicker: '位置',
      title: '它落在知识与记忆层',
      lead: '参考架构的L4负责让Agent拿到正确的业务知识，并在多轮、跨会话中保持状态；Heirloom提供这层里的定义部分——不是向量库，也不是检索管线。',
      linkLabel: '看技术架构',
    },
  },
};

export const productList: readonly ProductCopy[] = Object.values(products);
