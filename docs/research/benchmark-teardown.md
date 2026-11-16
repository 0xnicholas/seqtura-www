# 对标拆解:laravel.com / Linear / Stripe 视觉细节模式

> 研究简报 · 2026-11-16 · 对应 ticket #26(wayfinder research,纯研究,不改产品代码)
> **检查方式**:用 `curl`(Chrome UA)抓取三站首页与内页的 HTML/CSS 产物并直接检索字体声明、CSS 变量、class 名;辅以设计测量/拆解文章交叉验证。文中 S1–S14 编号为可点击来源,完整列表见文末。
> **重要局限**:本次调研机器的网络将 `linear.com` 重定向到了无关站点(`www.analog.com`,DNS/CDN 层劫持),`web.archive.org` 与 `r.jina.ai` 代理均超时——**Linear 一节全部来自第三方实测提取([S7] 声明数值取自 live DOM/CSSOM)、字阶提取服务 [S9] 与分析文章 [S10],未做一手复核,相关条目均标注「推断」**。laravel.com 与 stripe.com 的数值均来自当日一手构建产物。内置浏览器在本调研环境中不可用,所有「渲染效果」类判断结合了抓取到的 CSS 与文献,未逐像素截图验证。
> laravel.com 的逐像素拆解已有一份更详细的内部报告 [S15](2026-11-15,CDP 实测计算值),本文 Laravel 一节只做要点归纳与补充,避免重复。

## 结论先行

1. **三家的「高级感」都来自约束而非堆料**:每家只选一个材质层做品牌载体——Laravel 是「制图语法」(hairline + 红色刻度 + 代码面板),Linear 是「暗室 + 噪点 + 自家产品截图」,Stripe 是「流动渐变 + 轻字重排版」。没有任何一家同时用两种以上质感层。
2. **字体是品牌资产,不是排版工具**:Stripe 花商业授权用 Söhne 单一可变字体打全站六年不换 [S11];Linear 用 Inter Variable 的 510 这种「非标准字重」制造辨识 [S10];Laravel 用 Instrument Sans 全家桶(含 Condensed 变体)+ 三种等宽字体分工 [S2]。**对比之下,本站 `--font-sans` 首位声明了 Instrument Sans 却没有任何加载机制(`src/` 全库无 `@font-face`/字体 link/preload,已核实),实际渲染系统字体——这是与三家最大的差距,也是收益最大的单点修复。**
3. **字距是「工程感」的最廉价来源**:Linear 的展示标题按尺寸比例收紧字距(72px→-1.584px、48px→-1.056px、32px→-0.704px,恒等于约 -0.022em)[S10];Laravel hero 用 `tracking-tighter = -0.05em` [S1][S2];本站已有 -0.025em,方向正确,只需字体落地后才会真正显现。
4. **动效全部是 token 化、短时长、ease-out 系**:Stripe 把每类动效的 duration/easing 都命名成 CSS 变量 [S5];Laravel 首页 `ease-out` 出现 55 次、`duration-100` 出现 62 次 [S1];Linear 的卡片 hover 只是 `brightness(120%)`、active 是 `scale(0.97)` [S7]。**没有一家用弹性/回弹曲线做营销页交互。**
5. **CJK 策略只有 Stripe 有,且手法可直接照抄**:`:lang(zh)` 下字重压档(bold→500)、hero 字号封顶下调、行高放宽到 1.2,且**不加载任何 CJK webfont**,全靠系统回退 [S5]。Laravel 与 Linear 的营销站均无中文版本 [S1][推断]。

---

## 一、laravel.com(当前版本:2025 年 2 月随 Laravel 12/Cloud 上线的新站 [S13])

深度拆解见内部报告 [S15],此处为一手抓取(2026-11-16,首页 HTML 532,728 字节、主 CSS `app-CbmKlInb.css` 622,008 字节 [S1][S2])的要点与补充。

### 字体

- **四套字体分工明确**,全部 `font-display: swap`、自托管 woff2(Merriweather 除外)[S2]:
  - `--font-sans: "InstrumentSans"` —— 默认正文字体。静态字重 400/500/600/700 + 对应斜体,外加 **InstrumentSans Condensed / SemiCondensed** 两个宽度变体家族(各 400–700)[S2]。与 Tailwind 惯例相反,它的 `--font-sans` 不是系统栈而是品牌字体。
  - `--font-app-sans: "InterVariable"` —— 可变字重 100–900 + 斜体,并开启 OpenType 特性 `cv01/cv03/cv04/cv06/cv11`(单层 a、圆引号等替代形)[S2]。推断用于文档/控制台类界面表面。
  - `--font-mono: "IBM Plex Mono"`(可变 100–700)与 `--font-geist-mono: "Geist Mono"`(按 `unicode-range` 子集化)[S2]。两种等宽并存,推断前者用于代码块、后者用于 Cloud/控制台表面。
  - `--font-merriweather: "Merriweather"` —— 唯一走 CDN 的字体(Bunny Fonts,仅 400 一档),衬线点缀 [S1]。
- **字阶**:Tailwind v4 默认阶梯(xs 12 → 8xl 96)外加自定义 `--text-13: 13px`、`--text-28: 28px` [S2]。Hero H1 实测 class:`text-4xl sm:text-5xl md:text-7xl`(36→48→72px)、`tracking-tighter`(**-0.05em**,比普通 tight -0.025em 更狠)、`text-pretty` [S1][S2]。另有 `--tracking-heading: -2%` 供标题统一使用 [S2]。
- **字重层级极扁**:全站基本 400/500 两级(实测 392 处 400、80 处 500、仅 1 处 700,见 [S15])。大标题就是 400 字重 + 负字距 + 大字号,不靠加粗。
- **文档页**(`/docs/12.x` [S3]):正文容器 `.docs_main` 用 `max-w-prose`(约 65ch);H1 `letter-spacing: -1px`、字号按断点 2em→4em 递增;H2/H3 `margin-top: 2em`——用「段前距翻倍」而不是分隔线来切章节 [S2][S3]。

### 间距节奏

- 容器上限 `--container-7xl: 80rem`(1280px),与本站 `--container-site: 1280px` 完全一致 [S2]。
- 栅格:`grid grid-cols-12` + `divide-neutral-200 md:divide-x`——**12 列 hairline 竖线栅格**,列间不是留白而是 1px 线,这是「图纸感」的结构基础 [S1]。
- Section 纵向间距实测分布:`py-20`(80px)×4、`py-12`×4、`py-24`、hero 顶部 `pt-40`(160px)[S1]。比本站 `--section-y: 112px` 略松。
- 圆角尺度:`.125/.25/.375/.5/.75rem` 五档 [S2]。
- **画框式 body**:整个页面 body 有 2px 内边距、圆角,坐在一层深砂色(`--color-sand-dark-1: #111110`)的外框里,像一张装裱起来的图纸 [S2]。这是新站最激进的辨识度手法。

### 第二图层

- **红色径向光晕**:多处 `md:bg-[radial-gradient(… rgba(245,48,3,0.20), transparent)]`,20% 透明度、不同锚点(65% 80% / 50% 80% / 40% 100%),且只在 md 以上断点出现 [S1]。与本站 hero-art 已有的 12% 红晕同手法,但用在 section 级背景。
- **导航磨砂**:`bg-(--bg-color)/80 backdrop-blur-sm` [S1]。
- **代码面板即主视觉**:Torchlight 高亮代码块,`pre` 透明底、14px、行号淡灰,让代码面板承担「产品证据」角色 [S1]。
- **遮罩淡出**:hero 图形用 `mask-image: radial-gradient(...)`;logo 墙两端用 `bg-gradient-to-r from-white` 遮挡条做边缘消隐 [S1]。
- 完整 dark mode(`data-theme=dark` 驱动的 `dark:` 变体遍布全站)[S1][S2]。

### 交互与动效

- 使用 tailwindcss-motion 的 **`motion-preset-blur-up`**(blur 5px + translateY 5% + 透明度合成入场),hero 三行依次 `motion-delay-200/400`、`motion-duration-1000` [S1][S2]。
- 微交互统计:`ease-out` ×55、`duration-100` ×62、`duration-150` ×19——**所有 hover/颜色过渡都在 100–150ms** [S1]。
- logo 墙:`animate-infinite-scroll-x` 60s 无限滚动,`group-hover:[animation-play-state:paused]` 悬停暂停,且包在 `motion-safe:` 里(尊重 reduced-motion)[S1]。
- `@keyframes dashes`:SVG 描边 `stroke-dashoffset` 动画,让装饰线稿有「正在绘制」的生命感 [S2]。

### 品牌辨识度载体

红(**当前 token `--color-laravel-red: #f53003**,配套 darkened `#c42602`、faded `#ffe2dd` [S2]——与经典品牌红 #FF2D20 的关系见「存疑」)+ 制图刻度 + mono 大写 kicker(`font-mono uppercase` 栏签 [S1])+ 代码面板 + 画框。 testimonial 墙(Adam Wathan 等社区名人)也是识别要素 [S1]。

### CJK 策略

无。站点仅英文,四套字体均不含 CJK 字形,回退 `system-ui` [S1][S2]。

---

## 二、Linear(linear.com)— 全部为二手测量,标注「推断」

> 一手页面未能获取(网络劫持,见文首局限)。以下来自:[S7](声明数值实测自 live DOM/CSSOM,含 z-index、@media、keyframes 等硬证据)、[S9] 字阶提取、[S10] 分析文章(引用了 Typ.io 的实际 CSS 抽取)、[S14] 品牌色汇总表。

### 字体

- UI:**Inter Variable**(`--font-primary: "Inter Variable", system-ui, sans-serif`)[S9];回退链含 "SF Pro Display" [S7]。代码:**Berkeley Mono**(商业授权字体,一个创业项目为等宽字体付费,本身即品牌信号)[S7]。`--font-variations: "opsz" auto`(启用光学尺寸轴)[S7]。
- 字阶(两来源互证):display 64/56/40,H 级 24/21,正文 16,小字 13/10 [S9];[S7] 的层级表为 64(display, w590, lh1.1, -0.02em)/ 48(H1)/ 24(H2, w510)/ 20(H3)/ 16(body, 400, lh1.5, -0.011em)/ 13(small)/ 12(caption)。
- **字重签名 510/538/590**:可变字体才允许的「非标字重」,用于导航与主 UI 标签;[S10] 引 Typ.io 实测指出真实页面还混用 400/600/800,510 是「品牌的脸」上的象征性选择——「叫不喊的控えめな强调」。
- **比例化负字距**:72px→-1.584px、48px→-1.056px、32px→-0.704px,恒定约 **-0.022em**,随尺寸等比收紧 [S10]。
- 行高:标题 1.1–1.4,正文/小字 1.5 [S7]。

### 间距节奏

- **严格 4px 基网**:4/8/12/16/20/24/32,不许出现 10px、18px 之类的网外值 [S7]。
- 容器:营销页上限约 1440px,内容常收在约 1100px 中央列(推断,[S7] 未从源码提取到容器值)。
- Section 纵向 64/96px(推断 [S7]);实测断点 640/768/1024/1280 [S7]。
- 圆角只有 4/6/12/9999 四档 [S7]。
- 留白哲学:不追求「空气感」,而是用一致间距把高密度信息切块 [S7]。

### 第二图层

- **暗色即原生**:`#08090a`/`#0f1011` 近黑画布(不是后涂的深色模式),文字 `#f7f8f8`、次级 `#8a8f98`、hairline `#2a2e33` [S7][S14]。
- **噪点(grain)**:实测存在 `Grain_grain / Grain_grainSubtle` 组件(z-index 3)——全站胶片噪点覆层 [S7]。这是暗底不发「闷」的关键。
- **不用投影用内线**:层级靠 1px 边框 + `rgba(0,0,0,0.2) 0 0 12px inset` 内阴影,而非 drop shadow [S7]。
- **自家产品 UI 截图当主视觉**:密集、工具感的界面截图本身就是 hero 素材 [S7]。

### 交互与动效

- 卡片 hover 实测 CSS:`filter: brightness(120%)`(统计卡 125%),`transition-duration: var(--speed-highlightFadeIn)` [S7]。
- active 态统一 `transform: scale(0.97)` [S7]。
- 全站 150+ CSS 动画声明(实测提取 20 个 @keyframes,如 `Blink_blink`、`CTA_fadeIn`、`Collapsible_slideDown`),但单个动作都极短促 [S7]。
- 按钮过渡:0.1–0.15s ease/ease-out [S7]。
- focus 环:`0 0 0 3px rgba(94,106,210,0.3)`(品牌色 30%)[S7]。

### 品牌辨识度载体

暗底 + indigo(`#5e6ad2`,只给交互态用)+ grain + 产品截图 + 键盘文化(Cmd+K)。**没有 logo 之外的品牌图形元素,辨识度全部来自「暗室里的精密工具」氛围** [S7][S10]。

### CJK 策略

营销站仅英文(推断——一手路由未能验证;其官网从未提供本地化营销页,产品内有多语言但与营销站无关)。

---

## 三、Stripe(stripe.com,2026-11-16 抓取 zh-CN 版,730,646 字节 [S4])

### 字体

- **单一字体打全站**:`sohne-var`(Klim Type Foundry 的 Söhne 可变版,字重轴声明 1–1000,实际 200–900),woff2 单文件、`<link rel="preload">` 预载、**`font-display: block`**(别家都是 swap——宁可短暂不可见也要避免字体跳动,因为整站只靠这一个字体)[S4][S5][S11]。回退 `"SF Pro Display", sans-serif` [S5]。
- 等宽:营销站 `SourceCodePro-Medium` 预载 [S4];docs 站用 `Source Code Pro` 与 `Menlo/Consolas` [S6]。
- 字重哲学:**display 用 300**(「whisper-weight authority」——自信到不必喊)[S8][S10];正文 400;标题全部 400。六年(2020.7 从 Camphor 切换至今)未换字体 [S11][S12]。
- 层级表(实测 [S8]):display 48/300/lh1.03/-0.01em;H1 32/400/lh1.2;H2 26;H3 22/lh1.3;body 16/400/lh1.4;caption 14。
- **hero 标题尺寸公式**:`font-size: max(min(6lvh, var(--lang-font-max)), var(--lang-font-min))`——**按视口高度(lvh)流式缩放,再按语种封顶**;`line-height: 1.03`(zh 语言下 1.2)、`max-width: 36ch`、`text-wrap: pretty` [S5]。
- 数字细节:`.tabular-nums--tight`(`font-feature-settings: "tnum"` + `letter-spacing: -0.03em`)在首页出现 49 次——所有统计数字都用表格数字 + 紧字距 [S4][S5]。Söhne 本身的表格数字、斜杠零是选型理由之一 [S11]。

### 间距节奏

- 4px 基网(4–32 七档)[S8]。容器约 1280px、12 列(推断 [S8]);section 纵向 64px(推断 [S8])。
- 圆角:按钮/输入一律 4px,卡片 16px——「控件方、容器圆」的明确分工 [S8]。
- 断点实测:640/939/1280 [S8]。
- 留白哲学:慷慨、安静,把舞台让给渐变与排版 [S8]。

### 第二图层

- **签名渐变**:橙 `#ff6118` → 粉 `#ffe0ef` → 紫 `#533afd`,只出现在 hero 与重营销视觉里 [S8]。2020 版为 WebGL/canvas 实现(Jonnie Hallman、Alex Sexton 的 making-of [S11][S12]);**当前首页 hero 渐变是 CSS 实现,且带 `stats-animation-gradient--daytime/--dusk` 白昼/黄昏时段变体**——渐变随一天中的时间变化 [S4][S5]。全页仅 1 个 `<canvas>`(在轮播组件,非 hero)[S4]。
- **影子也带品牌色**:投影用蓝紫调 `rgba(50,50,93,…)` 而非中性灰——「影子浸在品牌色里」[S10][S8]。卡片 hover:阴影从 `0.06/3px/6px` 升到 `0.08/15px/35px` + `translateY(-2px)`,250ms [S8]。
- **hero 统计数字滚动 ticker**:eyebrow 区数字有 `content-incoming/outgoing` 滚入滚出动画 + 竖向 mask 淡出 [S4][S5]。
- bento 卡用 `border-color-gradient`(边框渐变)做精致描边 [S4]。

### 交互与动效

- **全部 token 化**:`--graphic-reveal-duration: 300ms` + `--graphic-reveal-easing: cubic-bezier(0.25,1,0.5,1)`;案例轮播 800ms `cubic-bezier(0.165,0.84,0.44,1)`(easeOutQuart);手风琴 0.36s;资源卡 300ms `cubic-bezier(0.46,0.03,0.52,0.96)` [S5]。
- 导航 hover 箭头有进出双向 keyframes(`nav-hover-arrow-in/out`,translateX(-3px) 起点)[S5]。
- focus:`box-shadow: rgba(99,91,255,0.1) 0 0 0 3px`(品牌色 10% 光环,不用 outline)[S8]。
- 按钮:active 回弹 translateY 复位,hover 仅换色 + 上浮 1px [S8]。

### 品牌辨识度载体

**渐变 + Söhne 300 轻字重 + 斜切构图血统**(2017 年确立的斜切面语言,当前版本仍有斜切过渡带,推断)+ 无处不在的表格数字。官方品牌色为 `#0A2540` / `#635BFF`([S10] 指出第三方实测的 `#061b31`/`#533afd` 与官方值有偏差,引用时需以官方为准)。

### CJK 策略(三家中唯一有成体系做法的,全站 zh-CN 本地化已验证 [S4][S5])

1. **不加载任何 CJK webfont**:回退链到系统字体(PingFang SC 等,经 sans-serif 链,推断),零字体下载成本。
2. **字重压档**:`:where(:lang(zh)) { --hds-font-weight-normal: 400; --hds-font-weight-bold: 500 }`——中文语境下「bold」被重新定义成 500,避免黑体系字形过粗发糊 [S5]。
3. **hero 字号按语种封顶**:zh/th 的 `--lang-font-max` 用 `--hero-font-lang-large`(2.125–3rem,随断点),低于拉丁语上限 [S5]。
4. **行高放宽**:zh hero 标题 `line-height: 1.2`(拉丁 1.03)[S5]。
5. 细节:中文引用块字重统一 400;百分号前的 `.125ch` 间距只对 zh/ja 等语种加;ja 启用 `word-break: auto-phrase`;个别数据图表为 zh/ja 调整栅格列宽 [S5]。

### 内页对照

- `docs.stripe.com`:同一套 sohne-var + Source Code Pro/Menlo,独立「sail」设计系统 CSS [S6]。营销与文档字体完全一致,品牌无断层。
- Laravel `/docs/12.x`:同一 CSS 产物,`max-w-prose` + 2em 段前距节奏 [S3]。
- Linear 内页:未能一手获取(推断与其产品 UI 共用 token 体系,[S7] 的实测样本里已含产品内视图 class)。

---

## 四、横向速查表

| 维度 | Laravel | Linear(二手/推断) | Stripe |
|---|---|---|---|
| 正文字体 | InstrumentSans(自托管静态) [S2] | Inter Variable [S9] | sohne-var(单文件可变,商业授权) [S5][S11] |
| 等宽 | IBM Plex Mono / Geist Mono [S2] | Berkeley Mono(商业) [S7] | Source Code Pro / Menlo [S4][S6] |
| 加载策略 | 自托管 + `font-display: swap` [S2] | 推断自托管 + variable | preload + **`font-display: block`** [S4][S5] |
| 展示标题 | 36→72px,400,-0.05em [S1][S2] | 64px,590,-0.022em 比例字距 [S7][S10] | 48px(6lvh 流式+语种封顶),**300**,lh1.03 [S5][S8] |
| 字重层级 | 400/500 两级 [S15] | 400/510/590 [S7] | 300/400 两级 [S8] |
| 基网/容器 | 4px;1280px [S2] | 严格 4px;~1440/1100 [S7] | 4px;~1280 [S8] |
| 第二图层 | 红径向光晕 + 代码面板 + 画框 [S1][S2] | 暗底 + grain 噪点 + 内阴影 [S7] | CSS 渐变(时段变体)+ 蓝紫影 + 数字 ticker [S4][S5][S10] |
| hover | 100–150ms ease-out 换色 [S1] | brightness(120%),active scale(.97) [S7] | 上浮 1–2px + 影加深,250ms [S8] |
| 缓动 | ease-out 系 [S1] | ease/ease-out 0.1–0.15s [S7] | cubic-bezier token 化(0.25,1,0.5,1 等) [S5] |
| 品牌载体 | 红 + 刻度 + mono kicker + 画框 [S1][S2] | 暗室 + indigo + grain + 产品截图 [S7] | 渐变 + 轻字重 + 表格数字 [S5][S10] |
| CJK | 无(英文站) [S1] | 无(推断) | :lang(zh) 字重压档 + 字号封顶 + 行高放宽,无 CJK 字体 [S5] |

---

## 五、本站可直接借鉴的具体模式清单

> 本站现状锚点:`src/styles/global.css`(token、`.kicker`、`.section`、`.btn`、`.reveal`)、`src/components/HomeHero.astro`(blur-up 入场、hero-art 红晕)、`src/components/IsometricCapabilityStack.astro`(唯一大件视觉资产)、`src/pages/index.astro`(HomeHero / ProofStrip / MethodologyPreview / ArchitectureBento / DeliverySection / FitSituations / CtaSection)。

### 立即可做(低成本高收益)

1. **把 Instrument Sans 真正加载上(最高优先级)**
   - 模式:三家全部自托管 woff2 + `font-display: swap`(Stripe 用 block 是因为它只有一个字体);Laravel 与我们用同一字体,证明它承载得起这套「hairline + kicker」语言 [S2][S5]。
   - 为什么有效:本站的 -0.025em 字距、400 大标题、mono kicker 对比,全部依赖字体本体;现在实际渲染系统字体,设计意图是落空的。这是与三家差距最大、修复成本最低的一项。
   - 本站位置:`src/styles/global.css` 的 `--font-sans` 声明 + 布局文件(`src/layouts/`)加 `@font-face`/preload;建议只取 400/500/700 三档(对标 Laravel 的静态分档),避免全家族加载拖慢 Lighthouse。

2. **统计数字用表格数字 + 负字距**
   - 模式:Stripe `.tabular-nums--tight`:`font-feature-settings: "tnum"` + `letter-spacing: -0.03em`,全站 49 处 [S5]。
   - 为什么有效:数字等宽对齐 + 微紧字距,是「数据可信」的潜意识信号;企业决策者对数字排版极敏感。
   - 本站位置:`HomeHero.astro` 的 `.hero-facts`、`ProofStrip` 的任何数字/指标;可在 `global.css` 加一个 `.tnum` 工具类。

3. **入场交错节拍放宽到 200ms 档**
   - 模式:Laravel hero 用 blur-up + `delay-200/400` + `duration-1000` [S1];本站已有同构的 blur-up(`HomeHero.astro:166-205`,900ms + 60ms 步进)。
   - 为什么有效:60ms 步进偏「消费级轻快」,200ms 档更沉稳,与企业受众匹配;且能与 `.reveal`(600ms)形成「hero 慢、section 快」的两级节奏。
   - 本站位置:`HomeHero.astro` 的 `animation-delay` 序列(60→140→220→300→380ms 改为 0→200→400→600→800ms 左右)。

4. **logo/客户墙:无限滚动 + 悬停暂停 + 两端遮罩淡出**
   - 模式:Laravel 的 60s `infinite-scroll-x` + `group-hover:[animation-play-state:paused]` + 两端 `bg-gradient-to-r from-white` 遮挡条 + `motion-safe:` 包裹 [S1]。
   - 为什么有效:hover 暂停是可访问性与可用性的细节(用户能停下来看清);遮罩淡出避免生硬截断;`motion-safe` 与我们的 reduced-motion 护栏一致。
   - 本站位置:`ProofStrip`(若引入客户/技术 logo 墙)。

5. **section 级红色径向光晕**
   - 模式:Laravel 在多个 section 背景放 `radial-gradient(…, rgba(245,48,3,0.20), transparent)`,仅 md 以上显示 [S1]。
   - 为什么有效:单色低透明光晕是唯一与「克制」调性兼容的氛围层;本站 `HomeHero.astro:125-134` 已有 12% 红晕,延展到 1–2 个下游 section 即可形成首尾呼应,不引入新材质。
   - 本站位置:`CtaSection`(收尾强调)与/或 `DeliverySection`;保持「仅桌面端」的断点守卫。

### 结构层面(下次改版时做)

6. **hairline 12 列 divide-x 栅格**
   - 模式:Laravel 的 `grid-cols-12 divide-neutral-200 md:divide-x`——列间用 1px 竖线而不是色块/留白分隔 [S1]。
   - 为什么有效:与本站已有的 hairline 分隔线、7px 刻度同源,能把 bento/卡片区从「色块拼贴」升级为「图纸分区」,强化辨识度。
   - 本站位置:`ArchitectureBento`、`MethodologyPreview` 的卡片栅格;`global.css` 的 `.section` 已在容器边缘画红刻度,divide-x 是它的自然延伸。

7. **hover 反馈从「换色」升级为「换质感」**
   - 模式:Linear 卡片 hover `brightness(120%)`、active `scale(0.97)` [S7];Stripe 卡片 hover 上浮 2px + 阴影加深,250ms ease-out [S8]。
   - 为什么有效:本站 `.btn` 只有 50ms 换色(`global.css:290-294`),卡片类元素几乎没有 hover 态;「可交互的东西会响应」是可信度的组成部分。三家的共同点是时长 100–250ms、无弹性曲线。
   - 本站位置:`ArchitectureBento`/`FitSituations` 卡片加 `brightness` 或 `translateY(-2px)` + 既有 `--shadow-site-sm` 加深;时长沿用 `--ease-site` + 150–250ms。

8. **动效 token 化**
   - 模式:Stripe 把每类动效命名成 `--graphic-reveal-duration/easing` 等变量 [S5]。
   - 为什么有效:防止散落的 magic number;本站已有 `--ease-site`,只差时长尺度。
   - 本站位置:`global.css` 的 `@theme` 增加 `--dur-instant: 50ms / --dur-fast: 150ms / --dur-base: 300ms / --dur-slow: 600ms / --dur-hero: 1000ms` 一档尺。

9. **长文页排版节奏**
   - 模式:Laravel 文档用 `max-w-prose` + H2/H3 `margin-top: 2em`(段前距翻倍切章节)[S2][S3]。
   - 为什么有效:不依赖分隔线,纯靠节奏;与本站 legal/methodology 长文页现有的 token 体系(`--type-legal-*`)直接兼容。
   - 本站位置:`methodology`、`process` 页正文容器与标题间距。

### 品牌资产层面

10. **把「7px 红方块」当作注册商标来经营**
    - 模式对照:Laravel 的辨识度 = 红 + 刻度 + mono kicker;Linear = 暗室 + indigo + grain;Stripe = 渐变 + 轻字重 [S1][S7][S10]。**每家只有一个图形签名**。本站已有红方块(`.kicker::before`、`.section::before/after`、`hero-art::after` 三处),这是正确的收敛方向。
    - 可加强:给 `IsometricCapabilityStack.astro` 的等距 SVG 加 Laravel 式 `@keyframes dashes`(stroke-dashoffset 描边动画 [S2]),让静态线稿有「正在制图」的生命感——与等距线稿的制图语言自洽,且是 SVG 纯 CSS 动画,无性能负担(记得 `prefers-reduced-motion` 守卫,与 `global.css:420-437` 一致)。

### 明确不借鉴(反向结论同样重要)

- **Laravel 的画框 body**(2px 装裱外框 [S2]):辨识度高,但与「hairline + 满幅图纸」语言冲突,且会让 hairline 对齐逻辑复杂化。
- **Stripe 的 WebGL/时段渐变** [S4][S11]:与克制调性不符,Lighthouse 性能预算也吃不消;光晕已够。
- **Linear 的全暗底** [S7]:本站企业决策者受众预期浅色可信表面([S15] 对 Laravel 也有同向判断)。
- **Stripe 的 10% alpha focus 光环** [S8]:对比度太弱;本站 2px 红 outline(`global.css:146-149`)在 a11y 护栏下更稳,保留。
- **Laravel 的 -0.05em 字距与 1.0 行高**:对拉丁展示标题成立,一旦落中文就是灾难([S15] 已指出);本站若出中文内容,按 Stripe 的 :lang(zh) 三件套处理(字重压 500、字号封顶下调、行高 ≥1.2),不加载 CJK webfont [S5]。

---

## 六、存疑与未验证项

1. **Linear 全节为一手缺失的二手数据**:本机网络把 `linear.com`/`www.linear.com` 301 到了 `www.analog.com`(AkamaiGHost → TencentEdgeOne 链路),`web.archive.org`、`r.jina.ai` 均超时,内置浏览器在本调研环境不可用。[S7] 声明其数值实测自 live CSSOM(含 z-index、@media、真实 hover 规则等硬证据),可信度高,但未经我们复核;`Berkeley Mono`、grain 组件、brightness hover 等结论标注「推断」。
2. **Laravel 品牌红取值**:其 CSS token `--color-laravel-red` 实测为 `#f53003`(配套 `#c42602`/`#ffe2dd`,与本站红色三件套逐值相同)[S2];与经典品牌红 `#FF2D20` 的关系未核对(logo SVG 颜色未逐一验证,推断 logo 仍为 FF2D20、界面 token 已换为 F53003;也可能该 CSS 产物与 Laravel Cloud 共享导致 token 名与实际用途有偏差)。ticket 上下文里「laravel 是 #FF2D20」的说法与当前构建产物不符,以 token 实测为准存疑待核。
3. **Laravel hero 的 `font-display` 工具类**未在 CSS 中找到对应定义(可能经 Tailwind `@utility` 编译成其他形态),推断其映射到 InstrumentSans(或其 Condensed 变体)。
4. **Stripe 观察色偏差**:第三方实测的 `#533afd`/`#061b31` 与官方品牌资产 `#635BFF`/`#0A2540` 不一致([S10] 已明确指出),本文引用时两个值都给出。
5. **Stripe 当前 hero 渐变的渲染方式**:2020 版为 WebGL/canvas([S11][S12] 记述);本次抓取只在轮播组件发现 1 个 `<canvas>`,hero 渐变从 CSS 看是静态渐变 + 白昼/黄昏变体(`stats-animation-gradient--daytime/--dusk`),「时段变化」的触发机制(JS 判断本地时间?)未验证。
6. **Linear 字重 510 的实际覆盖率**:[S10] 引 Typ.io 指出真实页面混用 400/600/800,510 集中在导航/主标签;[S7] 的 590/510 层级表与 [S9] 的提取值(400/510/538)存在差异,未裁决。
7. **各站移动端表现**:除断点与字号 token 外,未在移动视口逐一验证(无截图条件)。

## 来源

- [S1] [laravel.com 首页 HTML](https://laravel.com)(2026-11-16 curl 抓取,532,728 字节)
- [S2] [laravel.com 主 CSS app-CbmKlInb.css](https://laravel.com/build/assets/app-CbmKlInb.css)(622,008 字节;哈希随改版失效)
- [S3] [laravel.com/docs/12.x](https://laravel.com/docs/12.x)(2026-11-16 抓取)
- [S4] [stripe.com 首页(zh-CN)](https://stripe.com)(2026-11-16 抓取,730,646 字节)
- [S5] stripe.com 营销站 CSS 产物(`70d739dff01e0964.css` 等四个,合计 551,184 字节,经 b.stripecdn.com)
- [S6] [docs.stripe.com/payments](https://docs.stripe.com/payments) 及其 `docs.*.css`/`sail.*.css`
- [S7] [DesignMD — Linear Design Tokens, Typography & CSS Variables](https://designmd.cc/benchmarks/linear)(声明实测 live DOM/CSSOM)
- [S8] [DesignMD — Stripe 设计系统测量](https://designmd.cc/benchmarks/stripe)
- [S9] [Typescale.app — Typography System of Linear](https://typescale.app/typescales/typescale-and-typography-system-of-linear)
- [S10] [untype.jp — AI時代のデザインシステム実践 第3回 Linear / Stripe / Notion を"読む"](https://www.untype.jp/blog/design-systems-ai-design-md-analysis/)(2026-04-20;含对 VoltAgent 书き起こし的批判性引用、Typ.io 实测、官方色偏差指出)
- [S11] [WeLoveDaily — What Font Does Stripe Use? Söhne by Klim](https://welovedaily.net/article/stripe-font)(2026-10-30;含 2026-10-27 对 stripe.com 字体声明的复核)
- [S12] Fonts In Use — Stripe website (2020) 条目(Camphor→Söhne 切换;经 [S11][S10] 引用)
- [S13] [Laravel News — Laravel News 2025 Recap](https://laravel-news.com/laravel-news-2025-recap)(2025 年 2 月「new Laravel website」上线记录)
- [S14] [awesome-claude-design 品牌 tokens 汇总](https://github.com/rohitg00/awesome-claude-design)(Linear `#08090a`/`#5e6ad2`/Inter;Stripe `#0a2540`/`#635bff`/Söhne)
- [S15] 内部报告 [laravel-visual-language.md](./laravel-visual-language.md)(2026-11-15,CDP 计算值实测)
