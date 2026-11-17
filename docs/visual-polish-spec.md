# 视觉打磨规格

状态：累积草稿（`spec/visual-polish` 分支，逐区块填充，一次性 PR 合入 main 即定稿锁定）。

## 1. 读我

- **范围**：审计覆盖整站；本规格以首页为定标页，逐区块给出 before/after 级决策；其它页不写 before/after，沿用首页规则（第 5 节映射）。实现（代码改造）不在本规格内，定稿后另起 effort。
- **护栏**：Lighthouse CI 与 Playwright（含 a11y）测试必须保持绿；每项决策标注性能预算影响。已锁预算：首屏字体 ≤100KB、preload ≤1 个文件（#27）；动效只动 transform/opacity/filter（#32）；色彩替换性能影响零（#28）。
- **定稿流程**：逐区块 ticket 产出该节草稿 → owner 按验收点逐条确认或打回 → 全部确认后关闭 ticket、该节 commit 到本分支；全部区块确认后一次性 PR 合入 main（#33）。
- **出处**：全部决策的推理与证据见地图 [#25](https://github.com/0xnicholas/seqtura-www/issues/25) 的 Decisions so far；本节只引用结论。

## 2. 设计原则

从 #26–#32 已锁定决策蒸馏；区块级取舍冲突时按此顺序裁决。

1. **克制可信**。受众是企业决策者：任何视觉细节服务于可信度，不为装饰而装饰。三家对标（laravel / Linear / Stripe）的高级感全部来自约束而非堆料；hover 与反馈全部短时长、ease-out 系、无弹性曲线。（#26、#32）
2. **品牌独特性优先**。维度优先级：品牌独特性 ≈ 视觉资产 > 排版 > 动效。与 laravel 的色彩距离已主动归零（ΔE00 0，#28），区分度完全由标志性图形语言（等距栈延展，#29）与排版（#27、#30）承担；取舍冲突时品牌区分度让渡最少。
3. **单材质约束**。同一时刻全站只有一套质感/图形材质系统，对标三家无一家混用两种以上（#26）。本站材质 = 制图语法骨架（hairline + 7px tick + mono 标签）+ 红色光晕单材质（不新增网格/纸纹等第二质感层，#31）+ 等距栈几何（纯 SVG，无外部插画资源，#29）。
4. **密度纪律**。每页至多一处图示化（#29）；全站唯一环境动效 = 首页 hero 等距栈描边缓动（周期 ≥20s，#32）。任何区块新增视觉元素前，先数这页已有几处。
5. **少而准**。动效仅两类：入场编排 + 功能反馈；允许动的属性按白名单，名单外不动（#32）。推广到所有维度：每条变更必须可验收（数值、token 名、对比度比值），说不清的宁可不变。

## 3. Token 层

锚定 `src/styles/global.css` 自定义属性。所有 token 改动只进本表，区块节引用不重复定义（#33）。列 = token / 现值 / 目标值 / 出处。

### 3.1 色彩（`@theme`）

| Token                                                                                                                                                  | 现值      | 目标值                                                | 出处 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------- | ---- |
| `--color-red`                                                                                                                                          | `#f53003` | `#FF2D20`（laravel 品牌红原值）                       | #28  |
| `--color-red-dark`                                                                                                                                     | `#c42602` | `#cd2318`（按现状 ramp 的 OKLCH 偏移 ΔL −0.096 派生） | #28  |
| `--color-red-hover`                                                                                                                                    | `#a11d00` | `#aa1b12`（同上，ΔL −0.168）                          | #28  |
| `--color-red-faded`                                                                                                                                    | `#ffe2dd` | 不变                                                  | #28  |
| `--color-red-wash`                                                                                                                                     | `#fff7f5` | 不变                                                  | #28  |
| 中性色阶（`--color-canvas` / `paper` / `ink` / `ink-2` / `muted` / `faint` / `line` / `line-strong` / `dark` / `dark-2` / `dark-line` / `dark-muted`） | 现状      | 不变                                                  | #28  |

记录在案（#28）：

- 白字压主红 `#FF2D20` 对比度 3.72:1，未过 AA（laravel.com 自身相同）。按钮维持 `--color-red-dark` 底（白字 5.46:1 ✓）；kicker / text-link 用 `--color-red-dark`（5.46:1 ✓）。若想让按钮也照搬亮红底，须明知这是 3.72 的取舍。
- 组件内硬编码的红色 `rgb(245 48 3 / …)`（光晕等，全库 29 处、16 个文件）随 token 换值一并更新，逐区块节在 Before 列列出各自份额。
- 性能预算影响：零（纯色值替换）。三组被否决的微调候选留档于 `prototype/color-tuning` 分支。

### 3.2 字体与排版

| Token / 机制                                                                                            | 现值                                                       | 目标值                                                                                                                                                                                                                           | 出处     |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `--font-sans`                                                                                           | `'Instrument Sans'` 居栈首但从未加载，全站实际渲染系统字体 | 栈声明不变；新增 `@font-face` 真正加载 Instrument Sans 可变字体（wght 400–700，latin 子集，WOFF2 自托管，实测 30KB，preload 1 个文件，`font-display: swap`）                                                                     | #27      |
| 回退字体度量（新增 `Instrument Sans Fallback` `@font-face`）                                            | 无                                                         | `size-adjust: 100.8%; ascent-override: 97.0%; descent-override: 25.0%`（macOS / Helvetica Neue 标定，cap-height 对齐法，snippet 见 `prototype/type-specimen` 标样页 07 区块）；Windows / Arial 值于实现阶段首台 Windows 机器标定 | #30、#34 |
| 字重层级（`.type-h1` / `.type-h2` / `.type-h3` / `.type-lead` / `.mono-label` / `.kicker` / `.btn` 等） | 标题 400（`.type-h3` 500）、正文 400                       | 方案 c：正文 400；交互与中强调 500；中文标题 500（`:lang(zh)`，可变字体下零文件代价）；拉丁标题恒定 400                                                                                                                          | #30      |
| 中西文混排（`body` 级声明，非自定义属性）                                                               | 无                                                         | `text-autospace: normal` + `text-spacing-trim: normal`，Chrome 系渐进增强（macOS 苹方 + Chrome 157 实测标点挤压生效）；Firefox / Safari 静默降级可接受                                                                           | #27、#30 |
| 数字排版                                                                                                | 无                                                         | 多数字并列对齐场景（表格/榜单）开 `font-variant-numeric: tabular-nums`；单个数字与正文内联数字不开（hero-facts、proof-value 判例，#37 加注）                                                                                     | #30      |

记录在案：

- **退路**：微软雅黑只有 Regular/Bold，`font-weight: 500` 在 `font-synthesis: none` 下落 Bold；若实现阶段真机验证 60–72px 中文大标题观感过重，中文标题回 400，层级让位给字号差（#34）。
- **配套规格要求（非 token）**：`src/data` 现有 276 处手写空格（盘古之白：architecture 60 / delivery 116 / homepage 42 / process 30 / contact 16 / methodologyCode 12）在 autospace 新默认下会双重加宽，实现阶段全量清理（#30）。
- **预算**：首屏字体 ≤100KB、preload ≤1 个文件；中文全量 webfont 不可行（Noto Sans SC 单字重 4.4MB），CJK 维持系统栈（#27）。

### 3.3 动效

| Token                        | 现值                                                    | 目标值                                                                  | 出处     |
| ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| `--duration-micro`（新增）   | 无（`.btn` transition 硬编码 `50ms ease-out`）          | `150ms`：一切 hover / 功能反馈                                          | #32      |
| `--duration-enter`（新增）   | 无（`.reveal` 600ms、内页 hero `hero-in` 600ms 内联）   | `600ms`：区块与内页入场                                                 | #32      |
| `--duration-hero`（新增）    | 无（首页 hero `blur-up` 900ms 与 hero-art 1000ms 混用） | `1000ms`：首页 hero 入场统一                                            | #32      |
| `--duration-ambient`（新增） | 无                                                      | `24s`：首页 hero 等距栈描边循环（全站唯一环境动效，周期 ≥20s 档内取整） | #32、#36 |
| `--ease-site`                | `cubic-bezier(0.22, 0.61, 0.36, 1)`                     | 不变；全站唯一缓动，消灭 `.btn` 等处硬编码 `ease-out` 例外              | #32      |

动效的类型级约束（#32）：仅「入场编排 + 功能反馈」两类；装饰性动画在 `prefers-reduced-motion` 下全静态化，表单 spinner 以 `motion-safe` 反向豁免保留旋转。逐元素白名单、入场编排规则与各区块表现见第 4 节相关区块。

## 4. 首页逐区块

区块节模板（#33 锁定，六字段）：

```
### 区块 N · <名称>（Pn）
**目标**：……
**Before / After**：| 维度 | Before | After | 优先级 |（逐维度：色彩 / 排版 / 图形语言 / 质感 / 动效；无变化写「不变」）
**Token 影响**：引用第 3 节 / 「无新增」
**性能预算影响**：「零」或具体数值
**验收点**：可验证清单（数值、token 名、对比度比值）
**决策依据**：链接 ticket / 原型
```

优先级标注：逐条变更行标 P0/P1/P2（P0 = 品牌区分度核心，P1 = 专业度与质感提升，P2 = 锦上添花），区块取其内最高行级；定档依据 = 维度优先级（品牌独特性 ≈ 视觉资产 > 排版 > 动效）兼顾实现成本（#33）。

### 区块 1 · Hero（P0）

**目标**：图形语言与动效的主战场。等距栈主图作为全站等距几何母版维持现状（#29）；红系换值落到区块内每一处硬编码（#28）；入场阶梯沉稳化，并承载全站唯一环境动效——等距栈描边缓动（#32）；中文大标题升 500（#30）。结构、栅格与文案不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                         | After                                                                                                                                                                                                                                                                        | 优先级 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | 区块内硬编码品牌红 30 处：`.hero-art::before` 光晕 `rgb(245 48 3 / 12%→0%)`（2 个 stop）；等距栈 SVG `#F53003` ×24、`#C42602` ×4（光晕 stops、slab 渐变与投影、控制面虚线、L3 红板、注记路径） | 全部纯值替换：`#F53003`→`#FF2D20`、`#C42602`→`#CD2318`、`rgb(245 48 3 / …)`→`rgb(255 45 32 / …)`，透明度不变；`#FF8A65` 桃色 ×6 与 `#171717` 等中性色不动；SVG 不类化、不引 token（presentation attribute 不支持 `var()`）                                                   | P0     |
| 排版        | h1 `.type-h1` 400；Instrument Sans 声明未加载、实际渲染系统字体；hero 文案手写中西空格 12 处（kicker 2 / titleLead 2 / lead 1 / primaryCta 2 / facts 3 / caption 2）                           | h1 中文 500（`:lang(zh)`，方案 c；拉丁恒定 400）；Instrument Sans 可变字体真正加载（§3.2）；autospace + 标点挤压 body 级生效（§3.2）；12 处手写空格随全量清理归零；字号/行高/字距不变。kicker 现状已 500 不变；hero-facts 为 mono 栈、数字本等宽，tnum 无视觉效果不开        | P1     |
| 图形语言    | 等距栈主图（五层 slab + 三条控制面 + 任务/工具/HITL 注记）                                                                                                                                     | 不变。主图为全站等距几何母版；向区块头部 mini 版与区块图示的延展规则见区块 2–7 各自节；密度纪律：首页图示化即此一处                                                                                                                                                          | —      |
| 质感        | hero-art 12% 红色光晕（全站 5 处光晕之一）                                                                                                                                                     | 不变（光晕单材质系统保留，不新增网格/纸纹；色值随「色彩」行换值）                                                                                                                                                                                                            | —      |
| 动效 · 入场 | blur-up 900ms，copy 五子元素 delay 60/140/220/300/380ms；hero-art 1000ms delay 180ms                                                                                                           | blur-up 保留（opacity + blur(4px) + translateY(12px)，品牌签名）；delay 改 0/200/400/600/800ms 等差阶梯（DOM 序 kicker→h1→lead→CTA→facts），hero-art 1000ms 收尾；时长统一 `var(--duration-hero)` 1000ms；缓动 `var(--ease-site)`；两个 `.title-line` 不拆阶、随 h1 整体入场 | P1     |
| 动效 · 环境 | 无                                                                                                                                                                                             | 新增全站唯一环境动效：C1/C2/C3 控制面竖虚线 + HITL 虚线引导路径 `stroke-dashoffset` 线性循环（linear infinite），周期 `var(--duration-ambient)` = 24s；slab 轮廓与其余元素静止；`prefers-reduced-motion` 下静止                                                              | P0     |
| 动效 · 反馈 | `.btn` transition 50ms ease-out 硬编码                                                                                                                                                         | 并入 §3.3：`--duration-micro` 150ms + `--ease-site`；hover 白名单不变（按钮 color/background/border-color；主 CTA 箭头 translate(2px,-2px) 为全站唯一位移 hover）                                                                                                            | P1     |

**Token 影响**：引用 §3.1（红系三行换值；硬编码更新本区块份额 = 上表 30 处）、§3.2（字体加载、字重方案 c、autospace/标点挤压、手写空格清理要求）、§3.3（`--duration-hero`、`--duration-micro`、`--ease-site`）。新增一行进 §3.3：`--duration-ambient: 24s`（首页 hero 等距栈描边循环专用，出处 #32、#36）。入场 delay 阶梯（0/200/400/600/800/1000ms）为单区块一次性取值，不 token 化，写在本节验收点。

**性能预算影响**：≈零。字体 30KB / preload 1 个已在 §3.2 预算内（首屏 ≤100KB）；blur(4px) 为入场一次性开销；dashoffset 循环只动 stroke 属性，无 layout 抖动、无新请求；光晕系统零变化（#31）。Lighthouse CI 与 Playwright 护栏不变。

**边界**：`<1024px` 时 hero-art `display:none`，描边缓动与 art 入场仅 ≥1024px 存在；copy 阶梯全断点生效。全部动画维持只动 transform/opacity/filter（dashoffset 为 SVG 呈现属性，不触发布局）。

**验收点**：

- [ ] `.hero-copy > *` 五个子元素 `animation-delay` 依次为 0 / 200 / 400 / 600 / 800ms，`.hero-art` 为 1000ms；时长全部 `var(--duration-hero)`（1000ms），缓动 `var(--ease-site)`；blur-up keyframes 保持 opacity + blur(4px) + translateY(12px)
- [ ] C1/C2/C3 竖虚线与 HITL 虚线路径 `stroke-dashoffset` 动画 linear infinite、周期 `var(--duration-ambient)` = 24s；`prefers-reduced-motion: reduce` 下静止
- [ ] `IsometricCapabilityStack.astro` 中 `#F53003`、`#C42602` grep 零残留（对应换为 `#FF2D20`、`#CD2318`），`#FF8A65` ×6 保留；`HomeHero.astro` 光晕为 `rgb(255 45 32 / 12%)`
- [ ] hero h1 在 `:lang(zh)` 下 `font-weight: 500`；网络面板加载 1 个 Instrument Sans woff2（≈30KB），hero 标题渲染 Instrument Sans 而非系统回退
- [ ] hero 文案 12 处手写中西空格清零（kicker 2 / titleLead 2 / lead 1 / primaryCta 2 / facts 3 / caption 2），autospace 下无双重加宽
- [ ] 12% 光晕保留、未新增网格/纸纹层；hero 主图未替换、几何未改
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[对标拆解](https://github.com/0xnicholas/seqtura-www/issues/26)、[字体调研](https://github.com/0xnicholas/seqtura-www/issues/27)、[色彩微调候选](https://github.com/0xnicholas/seqtura-www/issues/28)、[标志性图形语言](https://github.com/0xnicholas/seqtura-www/issues/29)、[排版标样页](https://github.com/0xnicholas/seqtura-www/issues/30)、[第二图层质感](https://github.com/0xnicholas/seqtura-www/issues/31)、[动效预算与语言](https://github.com/0xnicholas/seqtura-www/issues/32)；六字段模板来自[规格的结构与验收标准](https://github.com/0xnicholas/seqtura-www/issues/33)。

### 区块 2 · ProofStrip（P1）

**目标**：品牌红随 token 换值落到 5 处 7px tick；Instrument Sans 加载后 28px 数字与西文标签真实渲染切换；内联文案 8 处手写空格随全量清理归零；补上首页唯一缺席的区块级入场。结构、栅格、文案、tick 几何不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                            | After                                                                                                                                                                                                                                                                                                | 优先级 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | 5 处 7px tick（`.proof-intro::before` + 4×`.proof-cell::before`）取 `var(--color-red)` = `#f53003`；区块内零硬编码红（纯 token 引用，不占 #28 的 29 处份额）                                                                                      | token 换值后自动落 `#FF2D20`（§3.1）；无其它色彩变化                                                                                                                                                                                                                                                 | P1     |
| 排版        | `proof-value` 28px/400，Instrument Sans 居栈首但未加载、实际渲染系统字体；`proof-label`/`.unit` mono 400；内联文案手写中西空格 8 处（facts 四行：`8 个交付阶段`/`FDE 交付方法 · 4 组`/`5 层能力栈`/`3 条控制面`/`1 个主转化`/`预约 30 分钟沟通`） | Latin 数字与西文渲染为 Instrument Sans（§3.2），CJK 维持系统栈；字重不动（proof-value 400 非标题；proof-label 400 与 `.mono-label` 层级一致）；8 处手写空格随全量清理归零，autospace 接管混排缝隙；`身份 / 评测 / 审计` 等「 / 」分隔保留；tnum 不开（单个数字无对齐收益，同 hero-facts 判例，§3.2） | P1     |
| 图形语言    | 制图语法骨架（hairline + tick×5 + mono 标签）；无区块头部                                                                                                                                                                                         | 不变。无 SectionHeading，不适用 mini 等距栈统一规则（规则见区块 3）；本区块品牌表达 = tick 换值                                                                                                                                                                                                      | —      |
| 质感        | 无光晕、无质感层                                                                                                                                                                                                                                  | 不变                                                                                                                                                                                                                                                                                                 | —      |
| 动效 · 入场 | 无入场（`data-proof-intro`/`data-proof-fact` 全库无 JS/CSS 挂载，为死属性；首页唯一无入场的内容区块）                                                                                                                                             | `.proof-grid` 加 `.reveal`，随 §3.3 全局规则：IO 触发（threshold ≈0.15）、once-only、600ms `var(--duration-enter)`、`var(--ease-site)`、无逐格 stagger；死属性实现阶段清理                                                                                                                           | P2     |
| 动效 · 反馈 | 无可交互元素                                                                                                                                                                                                                                      | 不变                                                                                                                                                                                                                                                                                                 | —      |

**Token 影响**：引用 §3.1（红系换值；本区块硬编码份额 0 处）、§3.2（字体加载；手写空格清理本区块份额 8 处）、§3.3（reveal 全局机制）。无新增 token。

**性能预算影响**：≈零。reveal 只动 transform/opacity，IO 运行时成本≈零；字体预算已在 §3.2 计。

**边界**：`<1024px` 栅格两列、`<768px` 字号收缩等响应式规则不变；tick 全断点保留。

**验收点**：

- [ ] 5 处 tick 计算样式渲染为 `#FF2D20`；`ProofStrip.astro` 内无硬编码红
- [ ] `proof-value` 数字与 `Built for production` 渲染为 Instrument Sans（非系统回退）；proof-value 400、proof-label 400 不变
- [ ] 内联文案 8 处手写中西空格清零，autospace 下无双重加宽；「 / 」分隔保留
- [ ] `.proof-grid` 带 `.reveal`：进入视口触发一次 600ms section-in，回滚不重演，无逐格 stagger；`prefers-reduced-motion` 下静态
- [ ] `proof-value` 无 `font-variant-numeric` 声明（tnum 不开）
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#28](https://github.com/0xnicholas/seqtura-www/issues/28)（红系换值）、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（mini 版只进区块头部，本区块无头部不适用）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)（方案 c、autospace 与手写空格清理；tnum 判例同区块 1 hero-facts）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)（reveal IO 化、once-only、无组内 stagger）。

### 区块 3 · MethodologyPreview（P0）

**目标**：首页第一个 SectionHeading 的 mini 等距栈在此定标（本区块唯一 P0 品牌动作，统一规则随此节确立）；红色光晕保留换值；h2 中文升 500；39 处手写空格清理；3 处 reveal 与 code-tab 反馈并入全局动效 token 体系。结构、栅格、文案、CodePanel 交互不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                                                                                                                                                         | After                                                                                                                                                                                                                                                                                                                                                                                                                              | 优先级 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | `code-wrap::before` 光晕 `rgb(245 48 3 / 13%→0%)` 2 个 stop 硬编码（本区块占 #28 清单份额 2 处；全站 5 处光晕之一）；`.check-mark` / code-tab 文件图标 / code-foot 圆点取 `var(--color-red)`（装饰性，`aria-hidden`）；`.method-range` / `.method-group-link` 取 `var(--color-red-dark)`，已符合文本红规则；CodePanel 中性硬编码 `.code-line:hover` `#fafaf8`、`.ln` `#c8c8c4` | 光晕 2 个 stop 纯值替换为 `rgb(255 45 32 / …)`，透明度与范围（`inset: 4% 0 -8% 8%`）不变；token 引用处随 §3.1 自动换值；中性硬编码不动、记录在案（中性色阶锁定 #28）                                                                                                                                                                                                                                                               | P1     |
| 排版        | h2 `.type-h2` 中文 400；`.type-h3` 现状已 500；kicker 500；文案手写中西空格 39 处（homepage methodology 段 6 / deliveryGroups 21 / methodologyCode 12——methodologyCode 唯一消费者即本区块 CodePanel）                                                                                                                                                                          | h2 中文 500（`:lang(zh)`，方案 c；拉丁恒定 400）；type-h3 / kicker 不变；39 处随全量清理归零，autospace 接管；code 内 CJK 注释同规清理，token 前导缩进空格保留；无多数字并列场景，tnum 不开（§3.2）                                                                                                                                                                                                                                | P1     |
| 图形语言    | 无图形资产：SectionHeading = kicker + 标题 + lead 纯文字；组卡纯文字                                                                                                                                                                                                                                                                                                           | SectionHeading 头部加 **mini 等距栈**：三层 slab、中层红板（token 换值后 `#FF2D20`）、高 120px、居中于 kicker 上方、纯 SVG 内联、与 hero 主图同一几何（定标形态 = `prototype/graphic-language` 分支第二轮 A 变体）。**统一规则：mini 等距栈是所有 SectionHeading 区块头部的标准配置**，区块 4/5/6 节引用本行，内页由 §5 沿用；mini 栈为头部标记、不计入「每页至多一处图示化」预算——首页图示化仍仅 hero，组卡不加原型中的阶梯对图示 | P0     |
| 质感        | code-wrap 13% 红色光晕                                                                                                                                                                                                                                                                                                                                                         | 不变（光晕单材质保留；色值随「色彩」行换值）；不新增网格/纸纹                                                                                                                                                                                                                                                                                                                                                                      | —      |
| 动效 · 入场 | 3 处 `.reveal`（section-heading / method-split / method-groups）load 即播（折叠线以下白播）                                                                                                                                                                                                                                                                                    | 随 §3.3 全局改 IO 触发、once-only、无组内 stagger；时长 `var(--duration-enter)` 600ms                                                                                                                                                                                                                                                                                                                                              | P2     |
| 动效 · 反馈 | `.code-tab` transition `50ms ease-out` 硬编码；`.btn`（method-link）50ms（§3.3 已统收）；`.method-group` hover `background-color 150ms var(--ease-site)` 已合规；组卡箭头 `translate(2px,-2px)` 在白名单内                                                                                                                                                                     | `.code-tab` 并入 `var(--duration-micro)` 150ms + `var(--ease-site)`；其余不变：卡片 hover 仅 background-color，位移 hover 全站仅箭头 2px                                                                                                                                                                                                                                                                                           | P2     |

**Token 影响**：引用 §3.1（红系换值；硬编码份额 2 处 = 光晕 stops）、§3.2（字体、方案 c；手写空格清理本区块份额 39 处）、§3.3（`--duration-micro`、reveal 机制）。无新增 token；mini 栈几何不 token 化（单一形态，SVG 内联）。

**性能预算影响**：≈零。mini 栈为内联 SVG（<2KB、无新请求）；光晕换值零成本；IO 运行时≈零；字体已在 §3.2 预算内。Lighthouse CI 与 Playwright 护栏不变。

**边界**：`<1024px` method-split 单列、组卡 2→1 列不变；mini 栈全断点 120px 固定；code-tab 横向滚动现状保留。

**验收点**：

- [ ] SectionHeading 头部渲染 mini 等距栈：三层 slab、中层红板 `#FF2D20`、居中、高 120px、SVG 内联无外部资源，与 hero 主图几何同源
- [ ] 组卡内无阶梯对或其它图示化元素（密度纪律：首页图示化仅 hero 一处）
- [ ] `MethodologyPreview.astro` 中 `rgb(245 48 3` grep 零残留（换为 `rgb(255 45 32 / …)`）；`.code-line:hover` `#fafaf8` 与 `.ln` `#c8c8c4` 保持原值
- [ ] 本区块 h2 在 `:lang(zh)` 下 `font-weight: 500`；introTitle 与组卡标题（`.type-h3`）500 不变
- [ ] 39 处手写中西空格清零（homepage methodology 段 6 / deliveryGroups 21 / methodologyCode 12）；code token 前导缩进不动
- [ ] `.code-tab` transition 为 `150ms var(--ease-site)`；`50ms ease-out` 零残留
- [ ] 3 处 reveal 元素 IO 触发、once-only；`.method-group` hover 仅 background-color 150ms；组卡箭头 `translate(2px,-2px)` 保留
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#26](https://github.com/0xnicholas/seqtura-www/issues/26)（单材质约束）、[#28](https://github.com/0xnicholas/seqtura-www/issues/28)、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（方向 A；mini 版只进区块头部）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)、[#31](https://github.com/0xnicholas/seqtura-www/issues/31)（光晕单材质保留）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)；mini 栈定标形态：[prototype/graphic-language](https://github.com/0xnicholas/seqtura-www/blob/prototype/graphic-language/prototype/graphic-language/README.md)（第二轮 A 变体）。

### 区块 4 · ArchitectureBento（P0）

**目标**：SectionHeading 头部进 mini 等距栈（本区块唯一 P0 品牌动作，统一规则引用区块 3 定标行）；红系换值落到区块内 4 处硬编码（#28）；h2 与 trace 卡中文标题升 500（#30 方案 c）；28 处手写空格随全量清理；3 处 hover transition 并入动效 token。plan panel、trace 卡、控制面卡的结构、栅格与文案不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | After                                                                                                                                                                                                                                                                                                  | 优先级 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 色彩        | 硬编码红 4 处（本区块占 #28 清单份额 4 处）：`.arch-section` 光晕 `rgb(245 48 3 / 10%)`、`.trace-card` 光晕 `rgb(245 48 3 / 16%)`（全站 5 处光晕之二，各 2 个 stop）、`.trace-line.is-hitl` 行底 `rgb(245 48 3 / 7%)`、plan 控制面虚线 `rgb(245 48 3 / 38%)`（ReferenceArchitecturePlan.astro）；`.trace-head` / `.trace-line .ev` / `.plane-label` 文字与状态点、tick 方块取 `var(--color-red)`，`.control-code` / `.plane-label` 取 `var(--color-red-dark)`，已符合文本红规则 | 4 处纯值替换为 `rgb(255 45 32 / …)`，透明度不变；token 引用处随 §3.1 自动换值。记录在案：trace 卡红色 mono 文字（`--color-red` 压 `--color-dark` `#171717`）换值后对比度 ≈4.9:1 过 AA（换值前 ≈4.6:1），无需处理                                                                                       | P1     |
| 排版        | h2 `.type-h2` 中文 400；`.trace-title` 30px/400（组件级中文标题未按方案 c）；`.control-title` / `.arch-name b` 现状已 500；kicker 500；Instrument Sans 居栈首但未加载、实际渲染系统字体；引用数据手写中西空格 28 处（homeSections.architecture 4：title 2 / lead 2；architectureLayers 18，capabilityLayers 同源；controlPlanes 6；traceSteps、structuralNote 为 0）                                                                                                            | h2 与 `.trace-title` 中文 500（`:lang(zh)`，方案 c；拉丁恒定 400）；control-title / arch-name b / kicker 不变；Instrument Sans 真正加载（§3.2），CJK 维持系统栈；28 处随全量清理归零，autospace 接管混排缝隙；trace-log 为 mono 栈、数字本等宽，tnum 不开（同 hero-facts 判例，§3.2）                  | P1     |
| 图形语言    | 无头部图形资产：SectionHeading = kicker + 标题 + lead 纯文字；plan panel（5 层行 × 3 虚线控制面 + 边界注记）为表格化信息骨架                                                                                                                                                                                                                                                                                                                                                    | SectionHeading 头部加 **mini 等距栈**（统一规则与定标形态见区块 3：三层 slab、中层红板 `#FF2D20`、高 120px、居中于 kicker 上方、纯 SVG 内联、与 hero 主图同一几何；静止无动效）。plan panel 不按图示化计、结构不变；trace 卡与控制面卡不加阶梯对或其它图示化元素（密度纪律：首页图示化仍仅 hero 一处） | P0     |
| 质感        | `.arch-section` 10% 与 `.trace-card` 16% 两处红色光晕（全站 5 处光晕之二）                                                                                                                                                                                                                                                                                                                                                                                                      | 不变（光晕单材质保留，#31；色值随「色彩」行换值）；不新增网格/纸纹                                                                                                                                                                                                                                     | —      |
| 动效 · 入场 | 1 处 `.reveal`（bento 容器）load 即播（折叠线以下白播）                                                                                                                                                                                                                                                                                                                                                                                                                         | 随 §3.3 全局改 IO 触发、once-only、无组内 stagger；时长 `var(--duration-enter)` 600ms                                                                                                                                                                                                                  | P2     |
| 动效 · 反馈 | 3 处 transition 硬编码 `150ms`（`.trace-card` box-shadow、`.control-card` border-color、`.arch-panel` border-color）；缓动已 `var(--ease-site)`；hover 均在白名单内（无位移）                                                                                                                                                                                                                                                                                                   | 时长并入 `var(--duration-micro)`（150ms），缓动不变；其余不动                                                                                                                                                                                                                                          | P2     |

**Token 影响**：引用 §3.1（红系换值；硬编码更新本区块份额 = 4 处）、§3.2（字体加载、方案 c；手写空格清理本区块份额 28 处）、§3.3（`--duration-micro`、`--duration-enter`、reveal 机制）。无新增 token；mini 栈几何不 token 化（单一形态，SVG 内联，同区块 3）。

**性能预算影响**：≈零。mini 栈为内联 SVG（<2KB、无新请求）；光晕与虚线换值零成本；IO 运行时≈零；字体已在 §3.2 预算内。Lighthouse CI 与 Playwright 护栏不变。

**边界**：`<1024px` arch / trace 卡通栏、控制面卡 2 列，`<768px` 单列与 trace 字号收缩等响应式规则不变；mini 栈全断点 120px 固定（同区块 3）。

**验收点**：

- [ ] SectionHeading 头部渲染 mini 等距栈：三层 slab、中层红板 `#FF2D20`、居中、高 120px、SVG 内联无外部资源、无动效，与 hero 主图几何同源（形态同区块 3）
- [ ] plan panel 结构不变（5 层行 + 3 虚线控制面 + 边界注记）；trace 卡与控制面卡内无阶梯对或其它图示化元素（密度纪律：首页图示化仅 hero 一处）
- [ ] `ArchitectureBento.astro` / `ReferenceArchitecturePlan.astro` 中 `rgb(245 48 3` grep 零残留（4 处换为 `rgb(255 45 32 / 10% / 16% / 7% / 38%)`，透明度不变）
- [ ] 本区块 h2 与 `.trace-title` 在 `:lang(zh)` 下 `font-weight: 500`；`.control-title`、`.arch-name b` 500 不变，拉丁标题恒定 400
- [ ] 28 处手写中西空格清零（homeSections.architecture 4 / architectureLayers 18 / controlPlanes 6），autospace 下无双重加宽
- [ ] 3 处 transition（`.trace-card` box-shadow、`.control-card` border-color、`.arch-panel` border-color）为 `150ms var(--ease-site)`，时长取 `var(--duration-micro)`，无裸值 `150ms`
- [ ] 两处光晕（10% / 16%）保留、未新增质感层；`.reveal` IO 触发、once-only、600ms `var(--duration-enter)`
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#28](https://github.com/0xnicholas/seqtura-www/issues/28)（红系换值；硬编码份额 4 处）、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（方向 A；mini 版只进区块头部）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)（方案 c、autospace 与手写空格清理）、[#31](https://github.com/0xnicholas/seqtura-www/issues/31)（光晕单材质保留）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)（动效 token 与 reveal 机制）、[#37](https://github.com/0xnicholas/seqtura-www/issues/37)（mini 等距栈统一规则，本节引用区块 3 定标行；plan panel「不按图示化计」的判定经 #38 会话仲裁确认）。

### 区块 5 · DeliverySection（P0）

**目标**：SectionHeading 头部进 mini 等距栈（本区块唯一 P0 品牌动作，统一规则引用区块 3 定标行）；红全走 token、区块内零硬编码，换值自动生效（#28）；h2 中文升 500，commit / step 标题已 500 不动；7 处手写空格随全量清理；reveal 并入全局机制。tick、hairline 网格、结构、栅格与文案不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                    | After                                                                                                                                                                                                                                                                                          | 优先级 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | 区块内零硬编码红（不占 #28 的 29 处份额）：7px tick（`.commit-card:nth-child(odd)::before`）取 `var(--color-red)`；`.commit-code` / `.step-no` 取 `var(--color-red-dark)`，已符合文本红规则                                               | token 换值后自动落 `#FF2D20` / `#CD2318`（§3.1）；无其它色彩变化                                                                                                                                                                                                                               | P1     |
| 排版        | h2 `.type-h2` 中文 400；`.commit-title` 24px/500、`.step-title` 18px/500 现状已 500；kicker 500；Instrument Sans 居栈首但未加载、实际渲染系统字体；引用数据手写中西空格 7 处（commitments 7；homeSections.delivery、processPreview 为 0） | h2 中文 500（`:lang(zh)`，方案 c；拉丁恒定 400）；commit-title / step-title / kicker 不变；Instrument Sans 真正加载（§3.2），CJK 维持系统栈；7 处随全量清理归零，autospace 接管混排缝隙；无多数字并列场景，tnum 不开（§3.2）                                                                   | P1     |
| 图形语言    | 无头部图形资产：SectionHeading 纯文字；7px tick（奇数卡）+ hairline 网格为制图语法骨架                                                                                                                                                    | SectionHeading 头部加 **mini 等距栈**（统一规则与定标形态见区块 3：三层 slab、中层红板 `#FF2D20`、高 120px、居中于 kicker 上方、纯 SVG 内联、与 hero 主图同一几何；静止无动效）。tick 与 hairline 网格为保留骨架不变；承诺卡与步骤列表不加任何图示化元素（密度纪律：首页图示化仍仅 hero 一处） | P0     |
| 质感        | 无光晕、无质感层                                                                                                                                                                                                                          | 不变                                                                                                                                                                                                                                                                                           | —      |
| 动效 · 入场 | 2 处 `.reveal`（commit-grid / process-preview）load 即播（折叠线以下白播）                                                                                                                                                                | 随 §3.3 全局改 IO 触发、once-only、无组内 stagger；时长 `var(--duration-enter)` 600ms                                                                                                                                                                                                          | P2     |
| 动效 · 反馈 | 无可交互元素（卡片为 `<article>` 非链接；process-head 的 `text-link` 为全局类，随 §3.3 统收）                                                                                                                                             | 不变                                                                                                                                                                                                                                                                                           | —      |

**Token 影响**：引用 §3.1（红系换值；本区块硬编码份额 0 处）、§3.2（字体加载、方案 c；手写空格清理本区块份额 7 处）、§3.3（reveal 机制）。无新增 token。

**性能预算影响**：≈零。mini 栈为内联 SVG（<2KB、无新请求）；reveal IO 运行时≈零；字体已在 §3.2 预算内。Lighthouse CI 与 Playwright 护栏不变。

**边界**：`<1024px` commit-grid 2 列、process-list 单列，`<768px` 单列与字号收缩等响应式规则不变；mini 栈全断点 120px 固定（同区块 3）。

**验收点**：

- [ ] SectionHeading 头部渲染 mini 等距栈：三层 slab、中层红板 `#FF2D20`、居中、高 120px、SVG 内联无外部资源、无动效，与 hero 主图几何同源（形态同区块 3）
- [ ] `DeliverySection.astro` 及引用数据（`commitments` / `processPreview` / `homeSections.delivery`）grep `245 48 3` / `#F53003` / `#C42602` 零命中（维持项）
- [ ] 本区块 h2 在 `:lang(zh)` 下 `font-weight: 500`；`.commit-title` / `.step-title` 500 不变，拉丁标题恒定 400
- [ ] `commitments` 7 处手写中西空格清零，autospace 下无双重加宽
- [ ] 7px tick（`.commit-card:nth-child(odd)::before`）保留；commit-grid / process-list hairline 结构不变；卡与列表内无图示化元素
- [ ] 2 处 `.reveal` IO 触发、once-only、600ms `var(--duration-enter)`；无区块级动效新增
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#28](https://github.com/0xnicholas/seqtura-www/issues/28)（红系换值）、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（方向 A；mini 版只进区块头部）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)（方案 c、autospace 与手写空格清理）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)（reveal 机制）、[#37](https://github.com/0xnicholas/seqtura-www/issues/37)（mini 等距栈统一规则，本节引用区块 3 定标行）。

### 区块 6 · FitSituations（P0）

**目标**：SectionHeading 头部进 mini 等距栈（本区块唯一 P0 品牌动作，统一规则引用区块 3 定标行）；红全走 token、区块内零硬编码，换值自动生效（#28）；h2 中文升 500，`.fit-title` 已 500 不动；9 处手写空格随全量清理；2 处 transition 声明并入动效 token。三卡结构、栅格、文案与整卡链接 `/process` 的行为不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                                                                              | After                                                                                                                                                                                                                                                                       | 优先级 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | 区块内零硬编码红（不占 #28 的 29 处份额）：3 处 7px tick（`.fit-card::before`，每卡右上角）取 `var(--color-red)`；`.fit-code`（10px mono）与 `.fit-link`（13px/500）取 `var(--color-red-dark)`，已符合文本红规则；卡面边框与底取中性 token（`line` / `line-strong` / `canvas` / `paper`，锁定不变） | token 换值后自动落 `#FF2D20` / `#CD2318`（§3.1）；无其它色彩变化                                                                                                                                                                                                            | P1     |
| 排版        | h2 `.type-h2` 中文 400；`.fit-title` 24px/500 现状已 500；kicker 500；`.fit-code` mono 400；Instrument Sans 居栈首但未加载、实际渲染系统字体；引用数据手写中西空格 9 处（`fitSituations` 全量：code「情境 01/02/03」×3、sponsor 卡 title 1、summary 两卡 5；`homeSections.fit` 为 0）               | h2 中文 500（`:lang(zh)`，方案 c；拉丁恒定 400）；fit-title / kicker / fit-code 不变；Instrument Sans 真正加载（§3.2），CJK 维持系统栈；9 处随全量清理归零，autospace 接管混排缝隙；无多数字并列场景，tnum 不开（§3.2）                                                     | P1     |
| 图形语言    | 无头部图形资产：SectionHeading = kicker + 标题 + lead 纯文字；卡角 7px tick ×3 为制图语法骨架                                                                                                                                                                                                       | SectionHeading 头部加 **mini 等距栈**（统一规则与定标形态见区块 3：三层 slab、中层红板 `#FF2D20`、高 120px、居中于 kicker 上方、纯 SVG 内联、与 hero 主图同一几何；静止无动效）。卡内 tick 保留；三张情境卡不加阶梯对或其它图示化元素（密度纪律：首页图示化仍仅 hero 一处） | P0     |
| 质感        | 无光晕、无质感层                                                                                                                                                                                                                                                                                    | 不变                                                                                                                                                                                                                                                                        | —      |
| 动效 · 入场 | 区块自身 1 处 `.reveal`（fit-grid）load 即播（折叠线以下白播）；SectionHeading 头部自带 1 处随组件同规（区块 3 已列）                                                                                                                                                                               | 随 §3.3 全局改 IO 触发、once-only、无组内 stagger（三卡同帧入场）；时长 `var(--duration-enter)` 600ms                                                                                                                                                                       | P2     |
| 动效 · 反馈 | 2 处 transition 声明硬编码 `150ms`（`.fit-card` 的 border-color + background-color；`.fit-link svg` 的 transform）；缓动已 `var(--ease-site)`；hover 均在白名单内（卡片无 lift/scale，箭头 `translate(2px,-2px)` 为白名单唯一位移模式）                                                             | 时长并入 `var(--duration-micro)`（150ms），缓动不变；其余不动。记录在案：`data-fit-situation` 为 Playwright 测试锚点（home.spec.ts），非死属性，保留不动                                                                                                                    | P2     |

**Token 影响**：引用 §3.1（红系换值；本区块硬编码份额 0 处）、§3.2（字体加载、方案 c；手写空格清理本区块份额 9 处 = `fitSituations` 全量，`fitSituations` 与 `homeSections.fit` 的唯一消费者即本区块）、§3.3（`--duration-micro`、`--duration-enter`、reveal 机制）。无新增 token；mini 栈几何不 token 化（单一形态，SVG 内联，同区块 3）。

**性能预算影响**：≈零。mini 栈为内联 SVG（<2KB、无新请求）；reveal IO 运行时≈零；字体已在 §3.2 预算内。Lighthouse CI 与 Playwright 护栏不变。

**边界**：`<1024px` fit-grid 单列、卡片 `min-height` 归零，`<768px` padding 26/24 与 fit-title 22px 收缩等响应式规则不变；mini 栈全断点 120px 固定（同区块 3）。

**验收点**：

- [ ] SectionHeading 头部渲染 mini 等距栈：三层 slab、中层红板 `#FF2D20`、居中、高 120px、SVG 内联无外部资源、无动效，与 hero 主图几何同源（形态同区块 3）
- [ ] `FitSituations.astro` 及引用数据（`fitSituations` / `homeSections.fit`）grep `245 48 3` / `#F53003` / `#C42602` 零命中（维持项）
- [ ] 3 处 `.fit-card::before` tick 计算样式 `#FF2D20`；`.fit-code` / `.fit-link` 计算样式 `#CD2318`
- [ ] 本区块 h2 在 `:lang(zh)` 下 `font-weight: 500`；`.fit-title` 500 与 kicker 500 不变，拉丁标题恒定 400
- [ ] 9 处手写中西空格清零（code ×3 / title ×1 / summary ×5），`homeSections.fit` 维持 0；autospace 下无双重加宽
- [ ] 卡内无阶梯对或其它图示化元素，7px tick ×3 保留（密度纪律：首页图示化仅 hero 一处）
- [ ] `.fit-grid` reveal IO 触发、once-only、600ms `var(--duration-enter)`，三卡同帧无 stagger；`prefers-reduced-motion` 下静态
- [ ] `.fit-card` 与 `.fit-link svg` transition 为 `150ms var(--ease-site)`、时长取 `var(--duration-micro)`，无裸值 `150ms`；hover 仅 border-color / background-color + 箭头 `translate(2px,-2px)`
- [ ] `data-fit-situation` 属性保留（测试锚点）
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#28](https://github.com/0xnicholas/seqtura-www/issues/28)（红系换值）、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（方向 A；mini 版只进区块头部）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)（方案 c、autospace 与手写空格清理）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)（动效 token 与 reveal 机制）、[#37](https://github.com/0xnicholas/seqtura-www/issues/37)（mini 等距栈统一规则，本节引用区块 3 定标行）。

### 区块 7 · CtaSection（P1）

**目标**：14% 红色光晕（全站 5 处光晕之末）纯值换色（#28）；h2 中文升 500（#30 方案 c）；4 处手写空格随全量清理；reveal 并入全局机制。本区块头部为自建居中结构（kicker + h2 + lead）而非 SectionHeading 组件，不适用 mini 等距栈统一规则（判例同区块 2）。结构、文案、双按钮行为与 note 不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                                                                                      | After                                                                                                                                                                                                                                                                                  | 优先级 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | 硬编码红 1 处（本区块占 #28 清单份额 1 处）：`.cta-section` 背景光晕 `radial-gradient(54% 70% at 50% 78%, rgb(245 48 3 / 14%), transparent 72%)`（单 colored stop + `transparent` 关键字；全站 5 处光晕之末）；kicker（red-dark 文字 + red tick）与 `.btn-primary`（red-dark 底 / red-hover hover）走 token | 光晕纯值替换为 `rgb(255 45 32 / 14%)`，透明度与范围不变；token 引用处随 §3.1 自动换值；白字压 red-dark 底对比度维持 §3.1 记录（5.46:1 ✓，按钮不搬亮红）。记录在案：内页 `MethodologyCta` / `ArchitectureCta` 为同构渐变（同几何、同 14%），份额计入 #28 清单，沿用映射由 §5（#42）落笔 | P1     |
| 排版        | h2 `.type-h2` 中文 400；kicker 500；`.type-lead` 400；`.cta-note` mono 11px/400；Instrument Sans 居栈首但未加载、实际渲染系统字体；引用数据手写中西空格 4 处（lead 1：「30 分钟」；primaryCta 2：「预约 30 分钟沟通」；note 1）                                                                             | h2 中文 500（`:lang(zh)`，方案 c；拉丁恒定 400）；kicker / lead / cta-note 不变；Instrument Sans 真正加载（§3.2），CJK 维持系统栈；4 处随全量清理归零，autospace 接管混排缝隙；note 的「 · 」分隔保留（同区块 2「 / 」判例）；无多数字并列场景，tnum 不开（§3.2）                      | P1     |
| 图形语言    | 无 SectionHeading、无头部图形资产：自建居中 kicker + h2 + lead；品牌表达 = 14% 光晕 + kicker tick                                                                                                                                                                                                           | 不变。不适用 mini 等距栈统一规则（#37 规则枚举区块 4/5/6 为 SectionHeading 消费者；本区块非组件消费者，判例同区块 2 ProofStrip）；不加任何图示化元素（密度纪律：首页图示化仍仅 hero 一处）                                                                                             | —      |
| 质感        | `.cta-section` 14% 红色光晕（全站 5 处光晕之末）                                                                                                                                                                                                                                                            | 不变（光晕单材质保留，#31；色值随「色彩」行换值）；不新增网格/纸纹                                                                                                                                                                                                                     | —      |
| 动效 · 入场 | 1 处 `.reveal`（cta-inner）load 即播（折叠线以下白播）                                                                                                                                                                                                                                                      | 随 §3.3 全局改 IO 触发、once-only、无组内 stagger；时长 `var(--duration-enter)` 600ms                                                                                                                                                                                                  | P2     |
| 动效 · 反馈 | 无区块级 transition / hover 规则；两个按钮继承全局 `.btn`（`50ms ease-out` 硬编码，§3.3 已统收，区块 1 已列）；hover 仅 background-color / border-color / color，白名单内无位移                                                                                                                             | 不变                                                                                                                                                                                                                                                                                   | —      |

**Token 影响**：引用 §3.1（红系换值；硬编码更新本区块份额 = 1 处光晕 colored stop）、§3.2（字体加载、方案 c；手写空格清理本区块份额 4 处，`homeSections.cta` 的唯一消费者即本区块）、§3.3（reveal 机制；`.btn` 全局统收见区块 1）。无新增 token。

**性能预算影响**：≈零。光晕换值为纯色值替换；reveal IO 运行时≈零；字体已在 §3.2 预算内。Lighthouse CI 与 Playwright 护栏不变。

**边界**：`<768px` padding-block 88/96、按钮纵排全宽、cta-note 10px 等响应式规则不变；`overflow: hidden` 裁切光晕保留；`data-primary-cta` 为测试锚点（home.spec.ts 计数全页主 CTA），保留不动。

**验收点**：

- [ ] `CtaSection.astro` 光晕声明为 `radial-gradient(54% 70% at 50% 78%, rgb(255 45 32 / 14%), transparent 72%)`（几何与透明度不变，源码级核对），`rgb(245 48 3` grep 零残留
- [ ] 本区块 h2 在 `:lang(zh)` 下 `font-weight: 500`；kicker 500 / `.type-lead` 400 / `.cta-note` 400 不变，拉丁标题恒定 400
- [ ] 4 处手写中西空格清零（lead 1 / primaryCta 2 / note 1）；「30 分钟 · 不收费 · 不推销」的「 · 」分隔保留，autospace 下无双重加宽
- [ ] 头部维持自建居中结构（kicker + h2 + lead），不渲染 mini 等距栈；区块内无图示化元素
- [ ] `.btn-primary` 底计算样式 `#CD2318`、hover `#AA1B12`；`.btn` transition 为 `150ms var(--ease-site)`、时长取 `var(--duration-micro)`（§3.3 全局统收）
- [ ] `.cta-inner` reveal IO 触发、once-only、600ms `var(--duration-enter)`；`prefers-reduced-motion` 下静态（home.spec.ts 已锁定）
- [ ] 14% 光晕保留、未新增质感层；双按钮 href（`/contact#book` / `mailto:`）与 note 文案不变（测试锁定）
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#28](https://github.com/0xnicholas/seqtura-www/issues/28)（红系换值；硬编码份额 1 处）、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（mini 版只进区块头部，本区块不适用）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)（方案 c、autospace 与手写空格清理）、[#31](https://github.com/0xnicholas/seqtura-www/issues/31)（光晕单材质保留，本区块为全站 5 处之末）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)（reveal 机制）；不适用 mini 栈的判例来自[区块 2 / #37](https://github.com/0xnicholas/seqtura-www/issues/37)。

### 区块 8 · 全站 chrome（Header / Footer）（P1）

**目标**：chrome 两组件全站共享（BaseLayout 唯一实例），本节即 §5「其它页沿用规则」的 chrome 基线——内页同一组件天然继承，无需逐页映射。红系换值全走 token 自动生效（两组件零硬编码，#28）；立**标识类字重判例**（brand-name / footer-mark 不适用方案 c「拉丁恒定 400」，#40）；9 处硬编码 `150ms` 声明并入 `--duration-micro`（#32）；chrome 渲染到的 6 处手写空格随全量清理（#30）；mobile menu 维持瞬时开合（#40）。sticky 行为、毛玻璃、栅格、结构、文案与品牌几何不动。

**Before / After**：

| 维度        | Before                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | After                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 优先级 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 色彩        | 零硬编码红（不占 #28 清单份额，grep 验证）：nav 当前页下划线（`.desktop-nav a::after`）、`.brand-mark` 红方块（16px + inset 4px）、`.footer-mark` 巨字取 `var(--color-red)`；移动端菜单 `[aria-current]`、`.footer-tagline`、`.footer-mail` hover 取 `var(--color-red-dark)`；header-cta 为全局 `.btn-primary`（red-dark 底，§3.1 记录维持）。中性硬编码记录在案：header 底 `rgb(255 255 255 / 88%)` + backdrop blur(8px)、is-scrolled 边 `rgb(0 0 0 / 9%)`、mobile-menu 阴影 `rgb(0 0 0 / 6%)`                                    | token 换值后自动落 `#FF2D20` / `#CD2318`（§3.1）；中性硬编码不动（中性色阶锁定 #28，判例同区块 3）；footer-tagline 换值后对比度维持 ≈5.46:1 ✓                                                                                                                                                                                                                                                                                                                                                              | P1     |
| 排版        | chrome 内无 `.type-h1/h2/h3`；`.brand-name` 19px/600（footer 22px）与 `.footer-mark` clamp(96px, 29vw, 418px)/500 为拉丁标识文字；desktop-nav / mobile-menu 链接、`.footer-col-title`、`.footer-tagline` 均 500；Instrument Sans 居栈首但未加载，brand-name 与 footer-mark 实际渲染系统字体；chrome 渲染到的手写中西空格 6 处（`src/config/site.ts` 5 处：tagline 2 / 「8 阶段交付」1 / 「预约 30 分钟」2；`Brand.astro` 1 处：「序构 AI」）                                                                                       | **标识类判例（#40）**：brand-name 600、footer-mark 500 不适用方案 c「拉丁恒定 400」，维持现状字重——方案 c 约束 `.type-*` 排版层级类，wordmark 与 aria-hidden 装饰大字为品牌资产而非标题；两拉丁标识随 §3.2 渲染为 Instrument Sans（nav 等 CJK 标签维持系统栈），footer-mark 字距 −0.055em 观感实现阶段目检；6 处手写空格随全量清理归零，autospace 接管；「飞书 / 微信」的「 / 」分隔保留（判例同区块 2/7）；`defaultTitle` / `description` 为 meta 文案不经渲染，不动；无多数字并列场景，tnum 不开（§3.2） | P1     |
| 图形语言    | `.brand-mark` 红方块 + wordmark 为全站唯一 logo 形态；`.footer-mark` 巨型红字（clamp 96–418px、letter-spacing −0.055em、translateY(2%)、aria-hidden）为页脚品牌资产；chrome 无 SectionHeading                                                                                                                                                                                                                                                                                                                                      | 不变。**判例（#40）**：footer-mark 为文字排版品牌资产，不计入「每页至多一处图示化」预算，出现于每页不违密度纪律（#29）；chrome 不适用 mini 等距栈规则（无 SectionHeading，判例同区块 2/7）；不加任何图示化元素（密度纪律：首页图示化仍仅 hero 一处）                                                                                                                                                                                                                                                       | —      |
| 质感        | 无光晕、无第二质感层；header 毛玻璃 blur(8px) 为 sticky 可读性的功能处理                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 不变（不新增网格/纸纹，#31）；毛玻璃维持                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —      |
| 动效 · 入场 | chrome 无入场动效（header 随首帧即见；footer 无 reveal）                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 不变。chrome 非内容区块，不设区块级 reveal（少而准，#32）                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —      |
| 动效 · 反馈 | 9 处 transition 声明硬编码 `150ms var(--ease-site)`：Header 5（`.site-header` border-color、`.desktop-nav a` color、nav 下划线 scaleX、`.header-email` color、menu-toggle 图标 morph 的 transform+top）、Footer 3（`.footer-mail` color+border-color、`.footer-col a` color、`.footer-meta a` color）、skip-link 1（global.css transform）；缓动均已 `var(--ease-site)`；hover 全在白名单（色值与 scaleX，无位移）；mobile menu 本体 `hidden` 瞬时切换、零过渡。header-cta 的全局 `.btn` 50ms ease-out 由 §3.3 统收（区块 1 已列） | 9 处时长并入 `var(--duration-micro)`，缓动与其余声明不变；**mobile menu 维持瞬时开合（#40）**：瞬时切换对 Escape / 焦点归还 / 断点切换零风险，shell.spec.ts 的即时可见性断言已锁定该行为；其余不动                                                                                                                                                                                                                                                                                                         | P2     |

**Token 影响**：引用 §3.1（红系换值；本区块硬编码份额 0 处）、§3.2（字体加载；手写空格清理本区块份额 6 处——#30 台账 276 处仅覆盖 `src/data`，本节 6 处为 `src/config/site.ts` 5 处 + `Brand.astro` 1 处的补记份额）、§3.3（`--duration-micro`；`.btn` 统收见 §3.3 与区块 1）。无新增 token。

**性能预算影响**：≈零。token 换值与 transition 改名零成本；字体 30KB / preload 1 个已在 §3.2 预算内（footer-mark / brand-name 渲染切换无新增请求）；无新增动效。Lighthouse CI 与 Playwright 护栏不变。

**边界**：header sticky 全断点；`<1024px` desktop-nav / header-email / header-cta 隐藏、compact CTA 与 menu-toggle 出现；`<768px` brand-cn 隐藏、compact CTA 34px；footer 栅格 1023px 三列 / 767px 两列 / 359px 单列与 footer-mark 23vw / 22vw 收缩不变。测试锚点 `data-primary-cta` ×2 / `data-menu-toggle` / `data-mobile-menu` / `data-footer-mark` / `data-filing` 保留。`shell.spec.ts` 锚定含手写空格的「8 阶段交付」等标签断言，实现阶段随清理同步更新（判例同区块 7 note 行）。

**验收点**：

- [ ] chrome 内红全部走 token：nav 下划线、`.brand-mark`、`.footer-mark` 计算样式 `#FF2D20`；移动端 `[aria-current]`、`.footer-tagline`、`.footer-mail` hover `#CD2318`；`Header.astro` / `Footer.astro` / `Brand.astro` / `SkipLink.astro` grep `245 48 3` / `#F53003` / `#C42602` 零命中（维持项）
- [ ] `.brand-name` 维持 600、`.footer-mark` 维持 500（标识类判例）；两者渲染为 Instrument Sans（非系统回退）；nav 中文标签维持系统 CJK 栈
- [ ] `.footer-tagline` 计算样式 `#CD2318`，白底对比度 ≥4.5:1
- [ ] 6 处手写中西空格清零（site.ts：tagline 2 / 「8 阶段交付」1 / 「预约 30 分钟」2；Brand.astro：「序构 AI」1），autospace 下无双重加宽；「飞书 / 微信」的「 / 」分隔保留；`shell.spec.ts` 含空格标签断言已同步更新
- [ ] 9 处 transition 声明时长取 `var(--duration-micro)`（Header 5 / Footer 3 / skip-link 1），组件内裸值 `150ms` grep 零残留；缓动 `var(--ease-site)` 不变
- [ ] mobile menu 本体维持 `hidden` 瞬时切换、无过渡动画；menu-toggle 图标 morph 为 `var(--duration-micro) var(--ease-site)`
- [ ] footer-mark 几何不变（clamp(96px, 29vw, 418px) / −0.055em / translateY(2%)）、aria-hidden 保留、不计图示化预算；chrome 内无 mini 等距栈、无图示化元素
- [ ] header 中性硬编码维持原值（88% 白底 + blur(8px)、is-scrolled `rgb(0 0 0 / 9%)`、mobile-menu 阴影）；sticky 行为不变（header 高 64px，shell.spec.ts 锁定）
- [ ] 测试锚点 `data-primary-cta` ×2 / `data-menu-toggle` / `data-mobile-menu` / `data-footer-mark` / `data-filing` 保留
- [ ] Lighthouse CI 与 Playwright（含 a11y）全绿

**决策依据**：[#28](https://github.com/0xnicholas/seqtura-www/issues/28)（红系换值，chrome 零硬编码自动落位；中性色阶锁定）、[#29](https://github.com/0xnicholas/seqtura-www/issues/29)（密度纪律；footer-mark 非图示化判例）、[#30](https://github.com/0xnicholas/seqtura-www/issues/30)（方案 c 与标识类豁免判例；autospace 与手写空格清理）、[#31](https://github.com/0xnicholas/seqtura-www/issues/31)（不新增质感层）、[#32](https://github.com/0xnicholas/seqtura-www/issues/32)（`--duration-micro` 统收；chrome 无入场动效）、[#33](https://github.com/0xnicholas/seqtura-www/issues/33)（六字段模板）；标识类字重豁免、footer-mark 非图示化、mobile menu 瞬时开合三项判例为本节 [#40](https://github.com/0xnicholas/seqtura-www/issues/40) 新立；「 / 」分隔保留与非 SectionHeading 不适用 mini 栈的判例引自区块 2/7（[#37](https://github.com/0xnicholas/seqtura-www/issues/37)、[#39](https://github.com/0xnicholas/seqtura-www/issues/39)）。

## 5. 其它页沿用规则

锁定原则（#33）：其它页不写 before/after，沿用首页定标区块规则 + 例外清单。本节输入 = #41 整站区块审计（区块清单、份额数字与例外候选的采集口径见[审计清单](https://github.com/0xnicholas/seqtura-www/issues/41#issuecomment-6948014292)）；审计所列份额数字供实现定位用，验收以 §3.2 的 276 台账与 §6 总口径为准。

### 5.1 全局规则清单

以下各项实现落点后全站自动生效，或经单点实现一次覆盖，无需逐块动作：

- **红系换值（§3.1）**：走 token 的红（tick、文本红、按钮、nav 下划线等）随 `--color-red` / `--color-red-dark` 换值全站自动落位；硬编码份额按 5.2 逐页列出，全部纯值替换、透明度不变。
- **字体与排版（§3.2）**：Instrument Sans 可变字体加载全站生效；方案 c 以 `.type-*:lang(zh)` 机制实现，全站 `.type-h1` / `.type-h2` 中文标题（含 404 页）自动 500；autospace + 标点挤压为 body 级声明，覆盖全部页面含 legal mdx 正文。
- **动效（§3.3）**：`--duration-micro` / `--duration-enter` / `--duration-hero` / `--duration-ambient` 与 `--ease-site` 全站统收；`.reveal` 全局改 IntersectionObserver 触发、once-only、无组内 stagger；`prefers-reduced-motion` 全站秒杀装饰、豁免表单 spinner。
- **chrome 基线（区块 8）**：Header / Footer / SkipLink 为 BaseLayout 唯一实例，六页天然继承区块 8 全部决策，无需逐页映射（#40）。
- **mini 等距栈单点实现（区块 3 定标行）**：mini 栈实现于 SectionHeading 组件内，全站 18 处实例（首页 4 + 内页 14）一次生效；内页 14 处不再逐块重复规则，5.2 各行以「SH」标记指代。

### 5.2 沿用映射表

#### architecture 页（9 区块，SH ×7）

| 区块                  | 沿用                                                                                         | 本页显式动作                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ArchitectureHero      | 区块 1 排版行（h1 中文 500 自动；hero-tags 为 mono 栈、tnum 不开，同 hero-facts 判例）+ §3.3 | 8% 光晕 1 声明（2 stops）纯值替换；`hero-in` 600ms 内联 → `var(--duration-enter)`（时值一致，仅 token 化）                                                                                                                                        |
| ArchitectureOverview  | SH（mini 栈组件化）+ 区块 4 同构（硬编码纯值替换、结构不变、reveal IO 化）                   | 硬编码红 7 色值 / 6 声明（overview 35% 边框 ×1 + ArchitectureMap 内 6）纯值替换；conclusion-grid / legend 2 处 reveal 随全局 IO 化；DeploymentTierBar 为表格化信息骨架（plan panel 判例），结构不变、维持无 reveal；ArchitectureMap 定性见 5.3-E5 |
| ArchitectureLifecycle | SH + 区块 4                                                                                  | 35% 边框 1 处纯值替换；2 处 reveal IO 化；LifecycleDiagram 定性见 5.3-E5                                                                                                                                                                          |
| ArchitectureLayers    | SH + 区块 4                                                                                  | table-frame reveal IO 化；零硬编码                                                                                                                                                                                                                |
| ArchitectureControls  | SH + 区块 4                                                                                  | table-frame reveal IO 化；零硬编码                                                                                                                                                                                                                |
| EnterpriseConcerns    | SH + 区块 4                                                                                  | concern-grid reveal IO 化；零硬编码                                                                                                                                                                                                               |
| ArchitectureScenarios | SH + 区块 4                                                                                  | 35% 边框 1 处纯值替换；scenario-grid reveal IO 化                                                                                                                                                                                                 |
| ArchitectureMetrics   | SH + 区块 2（tick 换值随 token 自动）                                                        | metric-grid reveal IO 化；metric-no 为 mono 编号，tnum 不开（hero-facts 判例）；零硬编码                                                                                                                                                          |
| ArchitectureCta       | 区块 7 全行（自建头部不加 mini 栈判例直接适用；h2 中文 500 自动）                            | 14% 光晕 1 声明纯值替换；cta-inner reveal IO 化                                                                                                                                                                                                   |

页注：空格份额 = 本页独有 ≈37 + 同源（architectureLayers / controlPlanes）已计首页区块 4 台账，清理一次两页生效；reveal 计 18 处（含 SH 自带）全部 IO 化；图示化口径见 5.3-E5。

#### methodology 页（6 组件、7 个 section，SH ×5）

| 区块                                       | 沿用                                                  | 本页显式动作                                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MethodologyHero                            | 同 ArchitectureHero 行                                | 8% 光晕 1 声明纯值替换；`hero-in` 600ms 内联 → `var(--duration-enter)`；hero-facts mono 栈 tnum 不开                                                                                     |
| MethodologyPrinciples                      | SH + 区块 4                                           | principle-grid reveal IO 化；裸 `150ms` ×1 → `var(--duration-micro)`                                                                                                                     |
| MethodologyStages（总览 + 详情两 section） | SH ×2 + 区块 5（步骤卡同构 commitments / steps 处理） | 裸 `150ms` ×5（stages 3 + StageCard 2）→ `var(--duration-micro)`；3 处 reveal（group-grid / loopback-row / trim-rule）IO 化；sticky stage-nav 子导航结构不变；trim-gates mono chips 不变 |
| MethodologyArtifacts                       | SH + 区块 4                                           | artifact-layout reveal IO 化；裸 `150ms` ×1 → `var(--duration-micro)`                                                                                                                    |
| MethodologyDivision                        | SH + 区块 4                                           | division-grid reveal IO 化；零硬编码                                                                                                                                                     |
| MethodologyCta                             | 区块 7 全行（同 ArchitectureCta 行）                  | 14% 光晕 1 声明纯值替换                                                                                                                                                                  |

页注：空格份额 = 本页 ≈99 + 同源 deliveryGroups 已计首页区块 3 台账（清理一次两页生效）；reveal 计 12 处（含 SH 自带）全部 IO 化。

#### process 页（3 区块，SH ×2）

| 区块              | 沿用                                                                                                                  | 本页显式动作                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProcessHero       | 同 ArchitectureHero 行 + 5.3-E2                                                                                       | 9% 光晕 1 声明纯值替换；补 hero-in 入场（600ms `var(--duration-enter)`、`var(--ease-site)`，P2，与另三页 hero 对齐）                                          |
| stages section    | SH + 区块 4 判例（ProcessStageTable 真 `<table>` 为表格化信息骨架，结构不变）+ 5.3-E5（ProcessFlow 同判例不按图示化） | 裸 `150ms` ×3 → `var(--duration-micro)`；tnum 按 5.3-E6：周期列与 flow-duration 行开 `tabular-nums`，stage-no / flow-no 不开；ProcessFlow 与表格维持无 reveal |
| PricingPrinciples | SH + 区块 4                                                                                                           | 裸 `150ms` ×1 → `var(--duration-micro)`；价格卡结构不变；support-kicker mono 不变                                                                             |

页注：空格份额 32 全属本页；reveal 计 2 处（含 SH 自带）全部 IO 化。

#### contact 页（4 区块，SH ×0；5.3-E7 判例页）

| 区块            | 沿用                                             | 本页显式动作                                                                                                                    |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| ContactHero     | 同 ArchitectureHero 行                           | 8% 光晕 1 声明纯值替换；`hero-in` 600ms 内联 → `var(--duration-enter)`                                                          |
| ContactBooking  | 区块 7 判例（自建头部非 SH，不加 mini 栈）+ §3.3 | field `150ms` 1 声明（双属性）→ `var(--duration-micro)`；spinner `submit-spin` 维持 #32 既定 reduced-motion 豁免；维持无 reveal |
| ContactChannels | 同 ContactBooking 行                             | 裸 `150ms` ×1 → `var(--duration-micro)`；维持无 reveal；微信 QR 占位逻辑不变                                                    |
| ContactAbout    | 同 ContactBooking 行                             | 维持无 reveal；sticky intro 与 facts dl 不变                                                                                    |

页注：空格份额 16 全属本页；全页零 reveal 维持不加（少而准，#32）；除 hero 光晕外零硬编码红。

#### legal 页（privacy / terms，LegalPage 单区块 ×2 页）

- 沿用：§3.2 全局项（autospace 覆盖 mdx 正文；prose h2/h3 现状已 500 不变）+ §3.3。
- 显式动作：`.legal-title:lang(zh)` 400 → 500（5.3-E4，P1；非 `.type-*` 类，方案 c 机制覆盖不到，需单独声明规则）；TOC `150ms` ×1 → `var(--duration-micro)`；mdx 手写空格 60 处（privacy 41 / terms 19）随全量清理（5.3-E3）；零硬编码红、无光晕、零 reveal 维持。

#### 404 页

全局自动项即全部（h1 `.type-h1` 中文 500 随方案 c 自动），零区块级动作。

### 5.3 例外与判例

#41 审计提交的 8 项例外候选，裁决如下（E8 为事实复核，非取舍）：

- **E1 · 光晕全站口径**：全站光晕计 11 处 = 首页 5（hero 12% / code-wrap 13% / arch-section 10% / trace-card 16% / cta 14%）+ 内页 6（hero 8%×3 + 9%×1、CTA 14%×2）。光晕单材质系统不变（#31），内页 6 处纯值换色、透明度与几何不变。各区块节「全站 5 处」表述为首页口径，全站口径以本节为准。
- **E2 · ProcessHero 补入场（P2）**：补 hero-in 入场（600ms `var(--duration-enter)`、`var(--ease-site)`），与另三页内页 hero 对齐；属 #32 允许的「入场编排」类，非新增动效类型，性能影响零。
- **E3 · 手写空格总口径 342**：清理总口径 = 276（#30 台账，`src/data`）+ 60（legal mdx：privacy 41 / terms 19）+ 6（chrome，#40 补记）。autospace 为 body 级声明，mdx 正文同样双重加宽，必须同批清理。§3.2 已确认节不回改，总口径由 §6 承载。
- **E4 · legal-title 升 500（P1）**：`.legal-title`（40px/400，非 `.type-*` 类）中文升 500，随区块 4 trace-title 判例；方案 c 的 `.type-*` 机制覆盖不到，实现为单独 `:lang(zh)` 规则。
- **E5 · 密度纪律三分定性**：ProcessFlow（8 节点 flow-track + SVG 回流线 + legend）判为表格化信息骨架（同 #38 plan panel 判例），不按图示化计，结构不变；ArchitectureMap（`role="img"`，div 架构全图）占 architecture 页唯一图示化额度；LifecycleDiagram（环形生命周期图）为明示内页例外——现状保留、记录在案、不构成新增先例。总则：密度纪律（#29）约束新增、不追溯既有内容，本规格对三者均只定性、不改结构；ArchitectureMap 非等距几何，不引阶梯对、不做 #29 方向 A 延展。
- **E6 · tnum**：ProcessStageTable 周期列与 ProcessFlow flow-duration 行（多数字并列对齐）开 `tabular-nums`；mono 编号类（metric-no / stage-no / flow-no）维持不开（hero-facts 判例，§3.2）。
- **E7 · contact 页三判例**：三区块自建头部（非 SectionHeading）不加 mini 栈（区块 2/7 判例）；全页零 reveal 维持不加（少而准，#32）；ContactForm spinner 维持 #32 既定 reduced-motion 豁免。
- **E8 · #28 台账对账（事实复核，闭合）**：实测 `rgb(245 48 3` 全站 28 色值 / 15 文件（首页 9 + 内页 19，与 5.2 份额一致）；#28 台账「29 处 / 16 文件」的差 1 处 1 文件 = `src/styles/global.css` 的 `--color-red: #f53003` token 定义行（随 §3.1 换值）。SVG 十六进制（IsometricCapabilityStack 的 `#F53003` ×24 / `#C42602` ×4）单列于区块 1 的 30 处口径，不在该 rgb 台账内。两口径各自闭合，无需处理。

## 6. 全局验收清单

### 6.1 性能预算汇总

| 预算项         | 锁定值                                                                    | 出处       | 验收方式                     |
| -------------- | ------------------------------------------------------------------------- | ---------- | ---------------------------- |
| 首屏字体       | ≤100KB、preload ≤1 个文件（实测 Instrument Sans 可变 woff2 30KB ×1）      | #27        | 网络面板核对字体请求数与体积 |
| 动效属性白名单 | 只动 transform / opacity / filter；dashoffset 为 SVG 呈现属性，不触发布局 | #32        | 代码审查 + Lighthouse CI     |
| 环境动效       | 全站唯一 = 首页 hero 等距栈描边循环 24s，reduced-motion 静止              | #32、#36   | 源码核对 + 系统设置抽查      |
| 色彩替换       | 性能影响零（纯色值替换）                                                  | #28        | —                            |
| 第二图层       | 光晕单材质，零新增请求（不新增网格 / 纸纹层）                             | #31        | —                            |
| mini 等距栈    | 内联 SVG <2KB、零外部请求；18 处随 SectionHeading 单点实现一次生效        | #29、#37   | 源码核对                     |
| Lighthouse CI  | 现有阈值不破                                                              | 护栏（§1） | CI 全绿                      |

### 6.2 对比度记录

| 元素               | 前景 / 背景                       | 比值    | 判定                                                        | 出处   |
| ------------------ | --------------------------------- | ------- | ----------------------------------------------------------- | ------ |
| 白字压主红         | `#FFFFFF` / `#FF2D20`             | 3.72:1  | 未过 AA，记录在案的取舍（laravel.com 相同）；按钮不搬亮红底 | #28    |
| 按钮白字           | `#FFFFFF` / `#CD2318`（red-dark） | 5.46:1  | ✓ AA                                                        | #28    |
| kicker / text-link | `#CD2318` / 白底                  | 5.46:1  | ✓ AA                                                        | #28    |
| trace 卡红 mono    | `#FF2D20`（换值后） / `#171717`   | ≈4.9:1  | ✓ AA（换值前 ≈4.6:1）                                       | 区块 4 |
| footer-tagline     | `#CD2318` / 白底                  | ≈5.46:1 | ✓ AA                                                        | 区块 8 |

### 6.3 整页一致性检查

**自动化断言（实现阶段全库 grep 与样式核对）**：

- [ ] 旧红零残留：`rgb(245 48 3`（28 处 / 15 文件）、`#f53003`、`#c42602`、`#a11d00` 全库 grep 零命中（大小写均查）；`global.css` token 定义行换为 §3.1 目标值
- [ ] 裸时长零残留：各区块节枚举处——`50ms ease-out` ×2（`.btn`、code-tab）与裸 `150ms`（chrome 9 / 区块 4 三处 / 区块 6 两处 / 内页 14）全部取 `var(--duration-micro)`；缓动统一 `var(--ease-site)`
- [ ] 内联 hero-in 零残留：ArchitectureHero / MethodologyHero / ContactHero 3 处 token 化为 `var(--duration-enter)`；ProcessHero 补齐 1 处同规（5.3-E2）
- [ ] 手写空格 342 处清零（276 `src/data` + 60 legal mdx + 6 chrome）；autospace 下无双重加宽；「 / 」「 · 」分隔符保留（区块 2/7 判例）
- [ ] `text-autospace: normal` 与 `text-spacing-trim: normal` body 级声明存在；`.type-h1` / `.type-h2` 的 `:lang(zh)` 500 规则存在；`.legal-title:lang(zh)` 500 单独规则存在（5.3-E4）
- [ ] reveal 全站一致：IO 触发、once-only、600ms `var(--duration-enter)`、`var(--ease-site)`、无组内 stagger；contact / legal / 404 维持零 reveal；ProcessFlow / ProcessStageTable / DeploymentTierBar 维持无 reveal
- [ ] mini 等距栈 18 处（首页 4 + 内页 14）全部渲染定标形态（三层 slab / 中层 `#FF2D20` / 高 120px / 居中 / 纯 SVG 内联）；非 SH 头部（区块 2/7、contact 三区块、chrome）零 mini 栈
- [ ] 密度复核：首页图示化仍仅 hero 主图一处；architecture 页 = ArchitectureMap + LifecycleDiagram（5.3-E5 例外记录）；其余页零图示化
- [ ] 测试锚点保留：`data-fit-situation` / `data-primary-cta` / `data-menu-toggle` / `data-mobile-menu` / `data-footer-mark` / `data-filing`；区块 2 死属性 `data-proof-intro` / `data-proof-fact` 随实现清理

**测试**：

- [ ] Lighthouse CI 全绿；Playwright（含 a11y）全绿
- [ ] `shell.spec.ts` 含手写空格的标签断言（「8 阶段交付」等）随清理同步更新（#40 记录在案）

**人工目检**：

- [ ] mini 栈 18 处形态一致性抽查；footer-mark 字距 −0.055em 观感（区块 8）
- [ ] autospace 混排缝隙抽查（首页 + 内页各一）；Instrument Sans 渲染切换无跳变（size-adjust 标定值生效）
- [ ] 延后项：Windows 真机雅黑中文标题 500 观感与 Arial size-adjust 标定（#34 记录在案，实现阶段首台 Windows 机器补跑，标定机制内建于 type-specimen 标样页 07 区块）
