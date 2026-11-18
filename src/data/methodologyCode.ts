export type CodeTokenKind = 'key' | 'str' | 'comment' | 'punct' | 'add';

export interface CodeToken {
  readonly text: string;
  readonly kind?: CodeTokenKind;
}

export interface CodeLine {
  readonly tokens: readonly CodeToken[];
}

export interface CodeFile {
  readonly id: string;
  readonly name: string;
  readonly lines: readonly CodeLine[];
}

export const codeFiles: readonly CodeFile[] = [
  {
    id: 'delivery',
    name: 'delivery.yml',
    lines: [
      { tokens: [{ text: '# delivery.yml — 8阶段 / 3个门禁', kind: 'comment' }] },
      {
        tokens: [
          { text: 'stages', kind: 'key' },
          { text: ':', kind: 'punct' },
        ],
      },
      {
        tokens: [
          { text: '  discover', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    客户业务画像', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  diagnose', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    问题定义 + ROI假设', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  define', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '      Agent规格卡 / 验收标准 / 评测集v0', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  design', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '      方案架构', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  build', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '       可运行原型', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  validate', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    评测报告', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  deploy', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '      生产Agent', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '  optimize', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    运营报告', kind: 'str' },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          { text: 'gates', kind: 'key' },
          { text: ':', kind: 'punct' },
        ],
      },
      {
        tokens: [
          { text: '  define', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    验收标准未定，不进入Build', kind: 'comment' },
        ],
      },
      {
        tokens: [
          { text: '  validate', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '  评测集未锁定，不进入Deploy', kind: 'comment' },
        ],
      },
      {
        tokens: [
          { text: '  deploy', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    权限 / 监控 / 回滚未配置，不上线', kind: 'comment' },
        ],
      },
    ],
  },
  {
    id: 'validate',
    name: 'gate-validate.md',
    lines: [
      { tokens: [{ text: '# gate-validate.md — 能否进入Deploy？', kind: 'comment' }] },
      {
        tokens: [
          { text: '- [x]', kind: 'add' },
          { text: ' 评测集在Build前锁定', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '- [x]', kind: 'add' },
          { text: ' 正常 / 边界 / 失败样本齐全', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '- [x]', kind: 'add' },
          { text: ' 按验收标准逐项打分', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: '- [ ]', kind: 'comment' },
          { text: ' 客户业务负责人签字', kind: 'str' },
        ],
      },
      { tokens: [] },
      { tokens: [{ text: '---', kind: 'punct' }] },
      {
        tokens: [
          { text: 'decision', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: ' 未全部通过，不进入Deploy', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: 'owner', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: '    客户业务负责人', kind: 'str' },
        ],
      },
      {
        tokens: [
          { text: 'evidence', kind: 'key' },
          { text: ':', kind: 'punct' },
          { text: ' 评测报告 / trace / 失败案例', kind: 'str' },
        ],
      },
    ],
  },
];
