# 字体调研：中西文配对与 webfont 性能预算（#27，2026-11-16）

> **调研方式**：2026-11-16 完成。字体规格以官方仓库/官方文档为准；文件体积为当日实测（`curl -sI` 读取 Google Fonts `css2` API（Chrome 131 UA）与 Fontsource/jsDelivr CDN 的 `content-length`）；浏览器支持度以 [MDN](https://developer.mozilla.org/) 与 [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) 主干为准；页面字体基线取 HTTP Archive Web Almanac。所有体积数字是当日快照，Google Fonts 切片数量与哈希随字体版本变化（本次实测 Noto Sans SC 为 v41），复用前建议重新核验。
> **性质**：wayfinder 纯研究票据，不改产品代码。结论可直接支撑后续「排版标样页」prototype ticket（输入清单见文末）。

## 结论先行

**推荐方案**：拉丁用 **Instrument Sans 可变字体（wght 400–700，latin 子集，WOFF2，自托管 + preload + `font-display: swap`）**，实测 **22.8–30.1KB**（两种获取路径，见第 1 节）；中文**维持系统字体栈**（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Noto Sans SC，零下载）；混排接受 **`text-autospace` 新默认**（初始值即 `normal`，2025-11 起 Baseline，新版浏览器已自动生效）+ `text-spacing-trim: normal` 作为 Chrome 系渐进增强；字重层级定为 **正文 400 / 交互与中强调 500 / 中文标题升 500**（可变字体下加字重零文件代价）。

**首屏字体预算：≤ 100KB、preload 不超过 1 个文件**。推荐方案实测占用约 **23–30KB**（取决于获取路径，余量留给未来的 mono webfont 或 latin-ext）。作为参照，HTTP Archive 2024 全网页字体中位数是 131KB——预算定为「优于中位数」。

**不推荐的路线**：中文全量 webfont。实测 Noto Sans SC 经 Google Fonts 切片（每字重 101 片）：**可变全量（wght 100–900）101 片总和 ≈4.4MB**、**静态单字重 400 的 101 片总和 ≈2.3MB**，Fontsource 简体子集单文件 **1.12MB**，微软雅黑/苹方的桌面文件本身就有 10–12MB——中文全量上 web 没有不子集化的余地。

| 维度     | 推荐                                               | 备选                                                               | 代价                                                             |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 拉丁字体 | Instrument Sans（可变，30KB）                      | Inter（可变，48KB）或不加载（纯系统栈，0KB）                       | Inter 视觉增量小；不加载则放弃品牌字形一致性                     |
| CJK      | 系统字体栈（0KB）                                  | Noto Sans SC 构建期文案子集化（约 150–400KB）或 cn-font-split 分包 | 子集化有缺字回退风险，需随文案更新重跑                           |
| 混排间距 | `text-autospace: normal`                           | 手写「盘古之白」空格                                               | 手写方案跨端一致但难维护，且与 autospace 并存会双重加宽          |
| 标点挤压 | `text-spacing-trim: normal`（仅 Chrome/Edge 123+） | 不处理（现状）                                                     | Firefox/Safari 暂不支持，只能当渐进增强                          |
| 字重层级 | 400/500 两级为主，中文标题 500                     | 400/500/600 三级                                                   | 600 在 CJK 系统栈上跨平台落差大（苹方 Semibold vs 雅黑 Bold）    |
| 加载策略 | 自托管 + preload + swap + size-adjust 匹配回退字体 | Google Fonts CDN                                                   | CDN 多一次跨域连接，且被本站 CSP（`default-src 'self'`）直接拦死 |

## 现状盘点（本仓库事实）

- `src/styles/global.css:22` 的 `--font-sans` 以 `'Instrument Sans'` 打头，但全站**没有任何 `@font-face` 或字体 `<link>`**（`src/layouts/BaseLayout.astro` 内无 font preload/stylesheet），实际渲染落到 `-apple-system` / `PingFang SC` / `Microsoft YaHei` 等系统字体——即「声明的是品牌字体，渲染的是系统字体」。
- 排版类 `.type-h1/.type-h2` 为 `font-weight: 400`（72px/60px，字距 -0.025em），`.type-h3` 为 500，`.type-lead`/正文 400；`.mono-label`、`.kicker` 用 `--font-mono`（SF Mono / JetBrains Mono 栈，同样无 webfont）。`body` 已设 `font-synthesis: none`（`global.css:118`）——缺字重时浏览器不会伪造粗体，这对「系统栈上 500/600 是否真实存在」提出了硬性要求。
- 首页 Hero（`src/components/HomeHero.astro`）实际用法：`.kicker` + `.type-h1` 两行标题 + `.type-lead` + `.btn`（18px/500）+ mono 大写事实条——是标样页必须覆盖的最小场景集。
- Lighthouse CI（`lighthouserc.cjs`）只断言 `accessibility` / `best-practices` / `seo` 三类满分，**没有任何性能/体积护栏**；`pnpm lighthouse` 跑 `lhci autorun`。字体预算目前是「无护栏状态」，本报告第 5 节给出建议值。
- `public/_headers` 对 `/_astro/*` 已配 `max-age=31536000, immutable`，其余路径 `max-age=0, must-revalidate`；CSP 为 `default-src 'self'`——**第三方字体 CDN（Google Fonts 等）会被 CSP 拦截**，自托管不仅是性能最优也是合规必需。字体若放 `public/fonts/` 需另配缓存头；若经 `src/assets` 由 Vite 打进 `/_astro/` 则自动获得指纹+长缓存。

## 1. 拉丁 webfont 选型

### 候选规格对比

|                   | Instrument Sans                                                                                                                                                         | Inter                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 设计定位          | 为 Instrument 品牌设计的新怪诞体，「精确 + 些许俏皮」，2024 年开源                                                                                                      | 为屏幕 UI 而生的几何新怪诞体，高 x -height，小字号可读性优先              |
| 可变轴            | `wght` 400–700、`wdth` 75–100、`ital`（[官方仓库](https://github.com/Instrument/instrument-sans)）                                                                      | `wght` 100–900 全九级 + 斜体（[官方仓库](https://github.com/rsms/inter)） |
| OpenType 特性     | 12 组 stylistic sets（ss02 单层 a、ss10 数字 2 等）、`tnum`/`pnum`/`case`/`liga`                                                                                        | `calt` 上下文替换、`tnum` 表格数字、`zero` 斜杠零、多组 cv/ss             |
| 语言覆盖          | 389 种语言                                                                                                                                                              | 拉丁/西里尔/希腊，覆盖面更大                                              |
| 实测体积（WOFF2） | Fontsource 全轴可变 latin **30.1KB**、latin-ext **10.6KB**；Google Fonts 仅 wght 轴实例形态 upright latin+latin-ext 合计 **22.8KB**；静态 400/500/600/700 各约 **17KB** | Fontsource 可变 latin **48.3KB**；静态 400/500 约 **24KB**                |
| 授权              | SIL OFL 1.1                                                                                                                                                             | SIL OFL 1.1                                                               |
| 采用背书          | laravel.com 全站正文字体（见本仓库 `docs/research/laravel-visual-language.md`，388 个文本节点实测）                                                                     | GitLab、Mozilla、NASA、Figma、苏黎世机场等（官方 README 列举）            |
| 分发注意          | Google Fonts / Fontsource 均为最新                                                                                                                                      | **作者明确建议不要用 Google Fonts 版**（过时、无斜体），应自托管官方包    |

### 判断：Instrument Sans 适合本站

本站的视觉语言（白纸底、1px 细线、7px 红色刻度、1280px 栅格、400 字重大标题）直接承袭 laravel.com（见 `docs/research/laravel-visual-language.md`），而 Instrument Sans 正是该语言的原生字体——**选它不是新决定，是把已经在 `--font-sans` 首位的声明落到实处**。它的 neo-grotesque 骨架克制、无过度几何化，配合 12 组 stylistic sets 可调出更「冷」的字形（如 ss05 直腿 R、ss06 斜切 M），调性上符合「克制、可信、企业级」；30KB 的可变 latin 子集在候选里体积最小。

它的两个短板要写明：一是 `wght` 下限 400，**没有 100–300 的细体**——若未来想要更「飘」的超大标题无从下调；二是与苹方/雅黑并置时属于「另一位新怪诞」，气质契合但字腔更开，中西文同段时灰度略浅于苹方，需在标样页实测（这正是 prototype ticket 要验证的）。

**Inter 作为备选**的处境：规格更强（字重 100–900、特性更全、QA 里程长），但视觉增量小——它与 San Francisco/PingFang 本就同族，用户端「系统字体 vs Inter」的感知差异远小于「系统字体 vs Instrument Sans」；体积还大约 60%（48KB vs 30KB）。若标样页显示 Instrument Sans 在正文小字号下可读性不佳，Inter 是第一替补。

**第三选项「不加载拉丁 webfont」**（0KB，现状即如此）：放弃品牌字形一致性，macOS 得 SF、Windows 得 Segoe UI。对于一个卖给企业决策者的站点，字体是仅有的几个「每个像素都可控」的品牌触点之一，30KB 买这个一致性是值的；但此选项应作为**慢网降级目标**保留（见 `font-display` 策略）。

### 加载策略（任一选型通用）

依据 [MDN @font-face/font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)、[MDN rel=preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) 与 [MDN size-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust)（Baseline 2023-09 起全浏览器可用）：

1. **自托管 WOFF2 单文件**（可变字体，`wght 400 700`），同源经 `/_astro/` 指纹长缓存；CSP 已禁止第三方源，CDN 路线（Google Fonts）在本站不可行也不优——它多一次跨域 DNS/TLS 且 CSS 与字体分两跳。
2. **preload 且只 preload 这一个文件**：`<link rel="preload" as="font" type="font/woff2" crossorigin>`（字体 preload 必须带 `crossorigin`，否则被丢弃）。
3. **`font-display: swap`**：系统字体先渲染，webfont 到达后替换；慢网下用户始终有字看。若标样页对交换闪烁敏感，可降格为 `optional`（极短 block 期、不换字，慢网直接放弃 webfont——正好实现上面的「第三选项」降级）。
4. **用 `size-adjust`/`ascent-override` 校准回退字体度量**（例如声明一个度量对齐的 `"Instrument Sans Fallback"` 指向本地 Helvetica Neue/Arial），把交换瞬间的 CLS 压到接近 0。具体数值需在标样页用真实字形标定。
5. 静态字重路线（17KB×3 ≈ 51KB）全面劣于可变单文件（22.8–30KB）——可变字体全球支持率 **97.35%**（[caniuse: variable-fonts](https://caniuse.com/variable-fonts)，2026-11 数据），本站无需静态回退。获取路径二选一：Fontsource 全轴包（latin 30.1KB，经 npm 进构建）；或 Google Fonts `css2` 的仅 wght 轴实例（upright latin+latin-ext 22.8KB，下载后自托管，少一个用不到的 `wdth` 轴）。

## 2. CJK 策略

### 体积现实（2026-11-16 实测）

- **Noto Sans SC 全量（Google Fonts 分发形态）**：每字重切 **101 片** unicode-range 子片。两套实测（2026-11-16，命令见文末「来源」）：静态单字重 400 的 101 片总和 **2,410,336B（≈2.3MB）**，片体积 1.4KB–41.3KB、中位 25.8KB；可变全量（`wght@100..900`）同样 101 片，总和 **4,354,412B（≈4.4MB）**——交接材料中的「单字重全量约 4.4MB」经复核对应的是可变全量，静态单字重约为它的一半。请求 `wght@400;500;700` 三个字重时，光 `css2` 返回的 CSS 就有 **339KB、303 条 `@font-face`**。
- **Fontsource 单文件形态**：`chinese-simplified-400-normal.woff2` = **1,142,552B（≈1.12MB）**——即「不做切片、只做简体中文子集」的下限。
- 参照系：常用字规模见《现代汉语常用字表》**常用 2500 字 + 次常用 1000 字**；桌面端的苹方约 12MB、微软雅黑约 10MB——中文字体全量上 web 必须子集化，没有第三条路。

### 三条路线对比

| 路线                                                       | 首屏代价                                                                                                                                                                                                                                     | 视觉收益                                                                                                                      | 风险与维护                                                                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. 系统字体栈（现状）**                                  | **0KB**、零字体请求、零 CLS、LCP 不受影响                                                                                                                                                                                                    | 苹方（macOS/iOS，6 字重）> 雅黑（Windows，字重少、大字渲染一般）> Noto CJK（Android）——单平台内都「够用」，但跨平台字形不一致 | `font-synthesis: none` 下，雅黑没有 500/600，中文标题的字重层级在 Windows 会塌掉；品牌字体不可控                                                                  |
| **B. Noto Sans SC 构建期文案子集化**                       | 本站文案来自 `src/data/` 与 MDX，字形清单封闭，预计 800–1500 个汉字 → 单文件约 **150–400KB**（按静态 400 全量 2.3MB/约 2 万字线性折算为 90–170KB，加 WOFF2 固定表结构开销取保守区间；Fontsource 简体子集 1.12MB 可作上限参照，待标样页实测） | 全平台字形、字重（可用 100–900 全范围）完全一致；与拉丁 webfont 同权的品牌控制                                                | 文案一改就要重跑 `pyftsubset`，漏字会以系统字体混入（不是豆腐块，是「字体打架」，更难察觉）；需要 CI 卡点                                                         |
| **C. 切片分包（cn-font-split / Google 式 unicode-range）** | 浏览器按页用字自动取片，单页通常 5–20 片 ≈ **100–600KB** 首访；之后 HTTP 缓存                                                                                                                                                                | 同 B，且无「文案封闭」前提，任意文案安全                                                                                      | 101+ 个文件的托管与缓存矩阵复杂；[cn-font-split](https://github.com/KonghaYao/cn-font-split)（中文网字计划，Rust 实现）可自托管生成细粒度分包；首访仍有一次性成本 |

### 判断

**推荐 A（系统栈），把 B 留作「品牌一致性升级」备选。** 理由：本站读者是企业决策者，iOS/macOS 与 Windows 占比高，苹方与雅黑的正文质量都在可接受线以上；而中文 webfont 的 cheapest 可靠形态也要 150KB+，在「先内容后装饰」的营销站上，用 5 倍于拉丁字体的预算换「跨平台字形一致」不划算。触发升级到 B 的信号：标样页上雅黑大标题（60–72px）渲染被判定不可接受，或品牌方明确要求全平台同字。

若走到 B/C，Noto Sans SC（思源黑体）是唯一现实候选：OFL 授权、与 Adobe Source Han Sans 同源、可变字重 100–900、且本身就是字体栈里 Android 端的回退——上 webfont 后 Android 端视觉不变，只统一了其余平台。

## 3. 中西文混排细节规范候选

规范依据 W3C《[中文排版需求（CLReq）](https://w3c.github.io/clreq/)》：汉字与西文字母、阿拉伯数字之间使用**不多于四分之一个汉字宽**的字距，且西文出现在行首/行尾时不加空白；标点挤压遵循「先挤进、后推出」等行内调整规则。

| 议题                   | 规范候选                                                                                                                                                                                  | 浏览器现实（2026-11 查证）                                                                                                                                                                                                                | 建议                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 中西文/数字间距        | [`text-autospace: normal`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-autospace)（CSS Text 4；默认 `insert` 语义——已有空格处不重复加；初始值即 `normal`） | **Baseline 2025-11**：Chrome/Edge 140、Safari 18.4、Firefox 145 起可用（[BCD 主干](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-autospace.json)）；新版浏览器默认已生效，旧浏览器静默无空格，可接受的优雅降级 | 无需显式开启（初始值生效）；标样页验证新默认行为，并逐步**停用手写「盘古之白」空格**（并存会间距过宽，手写空格宽度随字体漂移） |
| 标点挤压               | [`text-spacing-trim: normal`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim)（全宽标点相邻/行首行尾压半宽，依赖字体的 `halt`/`chws` OpenType 特性）                  | **仅 Chrome/Edge 123+**；Firefox、Safari 未实现（[BCD 主干](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-spacing-trim.json)）                                                                                 | 作为 Chrome 系渐进增强开启；苹方/雅黑/Noto 是否带 `halt`/`chws` 未验证，标样页实测                                             |
| 标点悬挂               | `hanging-punctuation: allow-end` 等                                                                                                                                                       | **Safari 独占**（Chrome/Firefox 均未实现）                                                                                                                                                                                                | 不纳入规范，挂了也只有一半用户看得到                                                                                           |
| 基线与灰度对齐         | 拉丁在前、CJK 在后的字体栈（本站现状正确）；必要时用 `size-adjust` 微调拉丁 webfont 与 CJK 的 em 对齐                                                                                     | 全浏览器                                                                                                                                                                                                                                  | 标样页上标定 Instrument Sans vs 苹方/雅黑的 x-height/cap-height 视觉差，决定是否给拉丁 `@font-face` 加 `size-adjust`           |
| 中文段落里的数字与英文 | 数据/统计数字用 `font-feature-settings: "tnum"`（Instrument Sans 与 Inter 都有表格数字）；英文词保持拉丁字体渲染，不设额外字距                                                            | 全浏览器（`font-feature-settings` 为 Baseline）                                                                                                                                                                                           | 数字密集处（hero facts、数据卡）开 `tnum`；正文内联英文不开                                                                    |

注意 `text-autospace` 与 `letter-spacing`/`word-spacing` 是**加性叠加**（MDN 明示）——本站标题的 -0.025em 字距会与 autospace 相抵，混排标题的实测间距需在标样页过目。

## 4. 性能预算（Lighthouse CI 护栏下）

**现状**：`lighthouserc.cjs` 仅断言 a11y/best-practices/SEO 满分，无性能类目、无资源体积断言。字体预算因此分为「建议立即遵守的自律值」与「建议后续补进 CI 的断言」。

外部基线：HTTP Archive [Page Weight 2024](https://almanac.httparchive.org/en/2024/page-weight) 的桌面中位页面字体总量为 **131KB**；[Web Almanac 2025 Fonts](https://almanac.httparchive.org/en/2025/fonts) 指出单字体文件中位数已到 36–39KB 且逐年上涨。

**建议预算（首屏、单个页面）**：

| 项                            | 上限                                     | 推荐方案实测                       |
| ----------------------------- | ---------------------------------------- | ---------------------------------- |
| 字体文件总量                  | **≤ 100KB**                              | 30KB（Instrument Sans 可变 latin） |
| preload 的字体文件数          | ≤ 1                                      | 1                                  |
| 字体 CSS（@font-face 声明）   | ≤ 5KB（内联或随主 CSS）                  | <1KB（自托管单条 @font-face）      |
| CJK webfont（若启用备选 B/C） | 首屏 ≤ 300KB 且必须 `font-display: swap` | 0（不启用）                        |
| 字体交换导致的 CLS            | ≈ 0（size-adjust 校准后）                | 待标样页标定                       |

**CI 护栏建议**（后续 ticket，不在本票据范围）：在 `lighthouserc.cjs` 的 `assert.assertions` 增加 `resource-summary:font`（如 `['error', {maxNumericValue: 102400}]`）与 `categories:performance` 下限；目前 `numberOfRuns: 1` 对体积类断言够用，对 LCP/CLS 类建议提到 3 次取中位。

## 5. 字重层级方案候选

现状：标题全部 400（`.type-h1/.type-h2`）、H3 与交互元素 500、正文 400——两级字重。laravel 调研（`docs/research/laravel-visual-language.md:12,49`）已给出直接警告：**全站 400/500 两级字重「中文无法承受」**，400 字重在 60px 以上的中文大字会「发虚」，建议中文标题 500。

| 方案                                                    | 拉丁效果                                                                      | 中文效果                                                                                                                              | 代价                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **a. 400 一统（现状）**                                 | 大字细笔画 = laravel 式「制图感」，气质来源                                   | 苹方 400（Regular）大字偏纤细但成立；雅黑 400 大字单薄发虚                                                                            | 层级只能靠字号/颜色，0 体积代价                               |
| **b. 400/500/600 三级**                                 | 层级最清晰，但 600 标题破坏「克制」气质，回退到普通企业站                     | 苹方有完整 500/600；**雅黑只有 Regular/Bold，500/600 在 Windows 会落不到实处**（且 `font-synthesis:none` 禁止伪造），跨平台层级不一致 | 可变字体下 0KB；静态路线 +34KB                                |
| **c. 正文 400 / 交互与标签 500 / 中文标题 500（推荐）** | 拉丁标题维持 400 的制图感（纯拉丁/数字标题如「72」「2026」保持 400 + 负字距） | 中文标题统一升 500：苹方 Medium 成立，雅黑落 Bold 略重但可接受；层级差靠「拉丁细、中文稳」的分字种处理                                | 0KB（可变字体）；需要按字种分层的排版约定，标样页验证雅黑表现 |

**推荐 c**，它是 a 的气质与 b 的中文可用性之间的折中；若标样页显示雅黑 500→Bold 的落差难看，退而求其次：中文标题保持 400 但**收紧字距到 0 并加大字号差**（层级让位给尺度）。不建议全站引入 600。

## 给「排版标样页」prototype ticket 的输入清单

1. 对比矩阵：Instrument Sans(400/500/600) × 回退字体（SF / Segoe UI / 雅黑 / 苹方）在 72/60/32/20/16px 的并排渲染，含纯中文、纯拉丁、混排、数字四组文案。
2. 标定 `size-adjust`/`ascent-override`：让 `"Instrument Sans Fallback"`（local Helvetica Neue/Arial）与 webfont 交换时 CLS≈0。
3. `text-autospace: normal` 开关对照；检查与现有手写空格文案是否双重加宽（文案侧需排查）。
4. `text-spacing-trim: normal` 在 Chrome 的标点挤压对照；顺带验证苹方/雅黑/Noto 的 `halt`/`chws` 支持。
5. 字重方案 c 的雅黑实测（Windows 真机或 BrowserStack）：500 是否落到 Bold、大字是否过粗。
6. 预算验证：加载后 DevTools Network 字体面板总量 ≤100KB、字体请求数 = 1。

## 存疑与未验证项

- 交接材料中的「Noto Sans SC 单字重全量约 4.4MB / 101 切片」经复核：**4.4MB 对应可变全量（wght 100–900）的 101 片总和**（4,354,412B）；静态单字重 400 实测为 2,410,336B。两个数字均按文末命令复现，正文已更正。
- **web.dev《Font best practices》原文本次无法访问**（本机网络到 web.dev 超时，curl/FetchURL 均失败）；加载策略一节改以 MDN 三篇一手文档为据，结论与 web.dev 通行建议一致，但未能直接引用原文。
- **苹方/雅黑/Noto Sans SC 是否内建 `halt`/`chws`**（`text-spacing-trim` 生效前提）未验证——MDN 明示字体缺这两个特性时该属性自动失效，需标样页实测。
- **Windows 上 `font-weight: 500/600` 对微软雅黑的实际映射**（落 Bold 还是 Regular）未在真机验证。
- Google Fonts 的切片数量（101 片/字重）与字体版本号（Noto Sans SC v41）是当日实测快照，会随上游版本漂移。
- 「苹方约 12MB、雅黑约 10MB」来自二手整理（[速查在线工具箱](https://www.suchatool.cn/tools/font-stack-gen.html)），仅作数量级参照。
- Instrument Sans 的发布时间（2024）与 laravel.com 所用具体版本未向上游考证；`docs/research/laravel-visual-language.md` 实测其为 laravel 正文字体，本站 `--font-sans` 首位声明与之同源。
- 本站访客的平台分布（决定系统栈路线的实际体验分布）无数据，建议后续从分析工具补。

## 来源

- [Instrument/instrument-sans（官方仓库：可变轴、stylistic sets、389 语言、OFL 1.1）](https://github.com/Instrument/instrument-sans)
- [rsms/inter（官方仓库：wght 100–900、特性、OFL 1.1、Google Fonts 版过时警告）](https://github.com/rsms/inter)
- [MDN: @font-face/font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) ・ [MDN: rel=preload（字体须带 crossorigin）](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) ・ [MDN: size-adjust（Baseline 2023-09）](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust)
- [MDN: text-autospace（Baseline 2025-11；初始值 normal、与 letter/word-spacing 加性叠加）](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-autospace) ・ [BCD 主干：text-autospace 支持矩阵（Chrome/Edge 140、Safari 18.4、Firefox 145）](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-autospace.json) ・ [MDN: text-spacing-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/text-spacing-trim) ・ [BCD 主干：text-spacing-trim 支持矩阵](https://github.com/mdn/browser-compat-data/blob/main/css/properties/text-spacing-trim.json) ・ [BCD 主干：hanging-punctuation 支持矩阵](https://github.com/mdn/browser-compat-data/blob/main/css/properties/hanging-punctuation.json) ・ [caniuse: variable-fonts（全球支持 97.35%）](https://caniuse.com/variable-fonts)
- [W3C 中文排版需求 CLReq（中西文间距 ≤1/4 字宽、行首行尾不加、挤压「先挤进后推出」）](https://w3c.github.io/clreq/)
- [HTTP Archive Web Almanac 2024: Page Weight（中位页面字体 131KB）](https://almanac.httparchive.org/en/2024/page-weight) ・ [Web Almanac 2025: Fonts（单文件中位 36–39KB）](https://almanac.httparchive.org/en/2025/fonts)
- [KonghaYao/cn-font-split（中文网字计划分包工具）](https://github.com/KonghaYao/cn-font-split)
- 体积实测命令（2026-11-16，可复现）：`curl -s -A <Chrome 131 UA> "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400&display=swap"` 得 101 条 @font-face（CSS 本身 114,948B），逐片 `curl -sI` 求 `content-length` 和 = **2,410,336B**；同法 `wght@100..900` 可变全量 101 片 = **4,354,412B**；`wght@400;500;700` 得 303 条 @font-face / 339KB CSS。Instrument Sans `css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700` upright 两片：latin 11,708B + latin-ext 11,092B = **22.8KB**。`curl -sI https://cdn.jsdelivr.net/fontsource/fonts/{instrument-sans:vf@latest/latin-wght-normal.woff2 → 30,092B；instrument-sans:vf@latest/latin-ext-wght-normal.woff2 → 10,604B；instrument-sans@latest/latin-{400,500,600,700}-normal.woff2 → 16,860/17,232/17,408/17,012B；inter:vf@latest/latin-wght-normal.woff2 → 48,256B；inter@latest/latin-{400,500}-normal.woff2 → 23,664/24,272B；noto-sans-sc@latest/chinese-simplified-400-normal.woff2 → 1,142,552B}`
- 本仓库事实：`src/styles/global.css`（--font-sans、.type-*、font-synthesis:none）、`src/layouts/BaseLayout.astro`（无字体加载）、`lighthouserc.cjs`、`public/_headers`、`docs/research/laravel-visual-language.md`
