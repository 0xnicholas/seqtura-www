export const contactHero = {
  kicker: '联系我们',
  title: '先聊一个具体场景。',
  lead: '30 分钟，围绕一个具体业务场景，给出值不值得做、下一步是什么的判断。',
  note: '提交后，我们会通过你留下的邮箱或微信联系你。',
  formCta: '填写预约表单',
  secondaryCta: '看工作方法论',
} as const;

export interface BookingStep {
  readonly no: string;
  readonly title: string;
  readonly text: string;
}

export const bookingCopy = {
  kicker: '预约表单',
  title: '预约 30 分钟沟通',
  lead: '带一个真实的业务流程来。我们会先读你的描述，再约 30 分钟一起判断。',
  steps: [
    {
      no: '01',
      title: '你留下场景',
      text: '用几句话说明业务、现状与卡点，不需要先准备方案。',
    },
    {
      no: '02',
      title: '我们先读一遍',
      text: '判断是否适合用 Agent 解决，以及还需要补充哪些信息。',
    },
    {
      no: '03',
      title: '30 分钟沟通',
      text: '给出值不值得做、先做哪一步，以及下一步的具体建议。',
    },
  ] satisfies readonly BookingStep[],
  note: '30 分钟 · 不收费 · 不推销',
  submitLabel: '提交预约',
  submittingLabel: '提交中…',
} as const;

export const contactChannels = {
  kicker: '其他通道',
  title: '其他通道',
  lead: '不想填表，也可以直接写邮件，或通过已开通的飞书 / 微信联系。',
  channels: [
    {
      id: 'wechat',
      no: '01',
      title: '微信',
      configuredNote: '扫码添加微信，备注「预约」。',
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
    { label: '交付方法', value: 'FDE 8 阶段' },
    { label: '参考架构', value: '5 层能力栈 + 3 条控制面' },
  ] as const;
}

export const contactAbout = {
  kicker: '关于我们',
  title: '关于我们',
  paragraphs: [
    'Seqtura AI（序构 AI）为企业定制 AI Agent，把业务场景从评估做到生产上线。',
    '我们服务技术 / 数字化负责人与业务负责人，按 FDE 8 阶段交付方法工作。',
    '我们相信：先把验收标准定下来，再开始构建。',
  ],
  methodologyLink: '看工作方法论',
  architectureLink: '看技术架构',
} as const;
