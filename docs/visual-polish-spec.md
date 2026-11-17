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
| 数字排版                                                                                                | 无                                                         | 数据/统计数字场景 `font-variant-numeric: tabular-nums`；正文内联数字不开                                                                                                                                                         | #30      |

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

### 区块 2 · ProofStrip

（留白，由 #37 填充）

### 区块 3 · MethodologyPreview

（留白，由 #37 填充）

### 区块 4 · ArchitectureBento

（留白，由 #38 填充）

### 区块 5 · DeliverySection

（留白，由 #38 填充）

### 区块 6 · FitSituations

（留白，由 #39 填充）

### 区块 7 · CtaSection

（留白，由 #39 填充）

### 区块 8 · 全站 chrome（Header / Footer）

（留白，由 #40 填充）

## 5. 其它页沿用规则

（留白，由 #42 落笔；输入 = #41 整站区块审计的区块清单与映射。锁定原则：其它页不写 before/after，沿用首页定标区块规则 + 例外清单。——#33）

## 6. 全局验收清单

（留白，由 #42 落笔。已知纳入项：字体预算 ≤100KB / preload ≤1（#27）；对比度记录——白字压主红 3.72:1 未过 AA 的取舍与按钮 5.46:1 ✓（#28）；276 处手写空格清理完成（#30）；Lighthouse CI 与 Playwright（含 a11y）全绿；整页一致性检查。）
