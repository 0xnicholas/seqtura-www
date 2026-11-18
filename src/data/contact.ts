export const contactHero = {
  kicker: '联系我们',
  title: '先聊一个具体场景。',
  lead: '围绕一个具体业务场景，给出值不值得做、下一步是什么的判断。',
  note: '扫码添加企业微信、打开飞书，或直接写邮件。',
  primaryCta: '预约沟通',
  secondaryCta: '看工作方法论',
} as const;

export const contactChannels = {
  kicker: '联系渠道',
  title: '直接联系',
  lead: '扫码添加企业微信、打开飞书，或直接写邮件；备注「预约」即可。',
  channels: [
    {
      id: 'wecom',
      no: '01',
      title: '企业微信',
      configuredNote: '扫码添加企业微信，备注「预约」。',
      fallbackNote: '暂未公开，请先通过邮箱联系：',
    },
    {
      id: 'feishu',
      no: '02',
      title: '飞书',
      configuredNote: '在飞书中打开联系入口，直接留言。',
      fallbackNote: '暂未公开，请先通过邮箱联系：',
    },
    {
      id: 'email',
      no: '03',
      title: '邮箱',
      configuredNote: '直接写邮件，附上业务背景与你希望解决的问题。',
      fallbackNote: '',
    },
  ],
} as const;

export function contactFacts(operatorName: string, operatorLocation?: string) {
  return [
    { label: '运营主体', value: operatorName },
    ...(operatorLocation ? [{ label: '所在地', value: operatorLocation }] : []),
    { label: '交付方法', value: 'FDE 8阶段' },
    { label: '参考架构', value: '5层能力栈 + 3条控制面' },
  ] as const;
}

export const contactAbout = {
  kicker: '关于我们',
  title: '关于我们',
  paragraphs: [
    'Seqtura AI（序构AI）为企业定制AI Agent，把业务场景从评估做到生产上线。',
    '我们服务技术 / 数字化负责人与业务负责人，按FDE 8阶段交付方法工作。',
    '我们相信：先把验收标准定下来，再开始构建。',
  ],
  methodologyLink: '看工作方法论',
  architectureLink: '看技术架构',
} as const;
