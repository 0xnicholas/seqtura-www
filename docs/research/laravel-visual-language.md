# laravel.com 视觉语言拆解（2026-11-15 实测）

> **检查方式**：2026-11-15 用 `curl`（普通浏览器 UA）抓取 `https://laravel.com/`（200，532,728 字节）与主 CSS/JS 产物，再用 Headless Chrome 157 通过 CDP 读取 `getComputedStyle` 的实际渲染值，并在 1440×1000 与 390×844 两个视口截图比对。
> **注意**：线上站点随时会改版，本文所有数值以 2026-11-15 的构建产物为准；下次沿用前请重新核验哈希文件名（本文引用的 `app-CbmKlInb.css` 改版即失效）。截图未入库，按文末「来源」中的方法可复现。

## 结论先行

laravel.com 不是靠「渐变 + 玻璃拟态」营造高级感，而是靠**一套制图（technical drawing）语法**：白纸底、1px 细线、7px 红色定位刻度、1280px 固定栅格、近乎单一字重的超大标题、单一强调色。整页只有一个「材质」——纸与线；只有一个「主角」——代码面板。信息密度低、留白极大，但每个边界都被精确画出来，所以显得严谨而非空洞。

**值得抄的三条**：① 60–72px / 行高 1.0 的轻字重标题 + 大留白；② 1px hairline 栅格 + 刻度点构成的「图纸感」；③ 用代码面板/终端替代营销插画作为产品证据。

**不能抄的三条**：① 权重失衡——全站字重只有 400/500 两级（实测 392 个 400、80 个 500、1 个 700），中文无法承受；② 行高 1.0 与 -5% 字距，CJK 会挤成一团；③ 浅色单主题的「白纸」，中国企业 B2B 客户常预期深色或至少更「重」的表面。

## 色彩

白底 `#FFFFFF`，正文 `#171717`（Tailwind neutral-900，实际计算值 `oklch(0.205 0 none)`），次级文字 `#737373`（neutral-500，4.74:1），分割线 `#E5E5E5`（neutral-200，仅 1.26:1——它只用来画线，不承载信息）。

强调色是单一红：`--color-laravel-red: #F53003`，另有 `#FFE2DD`（faded）、`#C42602`（darkened）。**关键比例**：首屏实测 124 个 DOM 节点使用该红，但视觉面积占比极低——红色只出现在主 CTA、7px 刻度点、footer 文字和代码里的少量高亮。

红色从不做成大片底色，而是做成**低透明度的径向光晕**：`radial-gradient(70% 70% at 50% 90%, rgba(245,48,3,.15), transparent)`（1440×908 的区块）、`radial-gradient(45% 100% at 65% 80%, rgba(245,48,3,.20), transparent)`（1278×530）。光晕尺寸是内容块的整块尺寸，透明度 15–20%，且**静态不闪**。卡片偶尔用红色 6.7% 的洗色（`#f001`）作底。

对比度提醒：`#F53003` 在白底仅 **3.96:1**，达不到小字号 AA，只够大字号与 UI 边框。这本身就是「不要把强调色用于正文」的技术理由。

产品线各有一色（`--color-cloud:#0057FF`、`--color-forge:#18B69B`、`--color-vapor:#25C4F2`、`--color-nightwatch:#68008C`、`--color-nova:#00E5BF`），同一套皮肤换一个强调色即可——`/cloud` 页就是实例：H1 降到 60px/字重 500，主 CTA 改黑底，首屏的蓝只出现在 tab 下划线与进度勾上。**这是对 Seqtura 最有价值的模式**。

## 字体与字号阶梯

全站只用两个字体族：**InstrumentSans**（388 个文本节点）与 **IBM Plex Mono**（85 个）。InterVariable、Geist Mono、Merriweather 被 preload/加载但没有在首页实际使用（Merriweather 只在其他页面）。

- 字体栈：`"InstrumentSans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`；等宽 `"IBM Plex Mono", monospace`。
- 特性开关：正文 `font-feature-settings: "ss02" 1, "ss09" 1`；等宽 `"ss01","ss02","ss03"`。
- **标题字重 400**（不是 600/700）。这是它气质的来源：大字 + 细笔画 = 克制。

实测阶梯（桌面 ≥1024px / 移动 390px）：

| 角色 | 桌面 | 行高 | 字距 | 字重 | 说明 |
|---|---|---|---|---|---|
| H1 | 72px | 72px（1.0） | -3.6px（-5%） | 400 | 实测 746×144，两行 |
| H2 | 60px | 60px（1.0） | -3px（-5%） | 400 | 居中，`max-width:768px` |
| H3 | 36px | 40px（1.11） | -1.8px（-5%） | 400 | 移动端 H1 用 36/40 |
| H4 | 24px | 32px | -0.6px | 500 | |
| 导语 | 20px | 28px | -0.5px | 400/500 | `max-width:672px` |
| 正文 | 16px | 24px（1.5） | 0 | 400 | 占绝对多数（231 节点） |
| 小字 | 14px | 20–22.75px | 0 | 400/500 | |
| 微标 | 12px | 16px | 0 | 500 | 徽标、状态胶囊 |

断点沿用 Tailwind v4 默认值：`40rem(640) / 48rem(768) / 64rem(1024) / 80rem(1280) / 96rem(1536)`。字距 token：`--tracking-heading: -2%`、`--tracking-heading-tighter: -5%`；`--tracking-tighter: -0.05em`。

**换算到中文**：CJK 没有 x-height 缓冲，-5% 字距会让字与字互相顶住；400 字重在 60px 以上会显得「发虚」。建议标题 500、字距 `0`～`-0.01em`、行高 1.05–1.1，只有在纯拉丁/数字段（如 `72`、`2026`）才用 -0.02em。

## 版式与组件

- **容器**：1280px 固定宽，1440 视口下左右各 80px 边距；正文列宽 746px，长文 `max-width:768px`（`max-w-3xl`）。
- **图纸语法**（最值得抄的部分）：整页用 1px `#E5E5E5` 横向分割线切带；在栅格交点放 **7×7px 色块**，偏移 -4px 使其正好骑在线上（实测 x=77 / x=1356，共 15 个）。这就是「高级感」的真实来源——它看起来像工程图纸的定位标。
- **纹理**：`.grid-pattern` 是 24×24px 的内联 SVG 平铺（横线 `#F9F9F8` + 方格 `#EEEEEC`）；`.dot-pattern` 是 `#D4D3CE` 的 1px 点、24px 间距。两者都低到几乎看不见，只做「有纸纹」的心理暗示。
- **区块节奏**：H2 区高约 485px，上下内边距按截图量得 92–103px（≈`py-24`，96px）；首屏 672px。
- **导航**：高 64px，白 80% + `backdrop-blur(8px)`，底边 `#00000018`。
- **圆角**：8px 是绝对主力（按钮、卡片），6px 用于小号 chip，12px 用于媒体与代码面板，20px 用于单角强调（`rounded-tl-[20px]`），2px 用于头像（**不是圆形**），胶囊用 9999px。
- **阴影**：极克制。`shadow-xs` 实测为 `0 0 1px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.06)`；卡片 `shadow-sm` = `0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`。没有大范围弥散投影。
- **按钮**：主按钮 206×48，`#F53003` 底、白字、18px/28px 字、字距 -0.45px、**圆角 8px**、`border:1px solid transparent`；次按钮白底 + `1px #E5E5E5` 边框，文字 `#11181C`。
- **代码面板的角色**：它不是装饰，是**产品演示本体**。首页核心区块右侧是一块 785×391 的面板：上方一排能力筛选胶囊（Auth / AI SDK / ORM / Migrations / Validation / Storage / Queues / Testing），面板内是文件标签（`web.php`、`UserController.php`）+ 代码；白底、12px 圆角（底边直角）、`shadow-sm`、内边距 24/20px、IBM Plex Mono 14px/22.75px、Shiki `light-plus` 主题。也就是说：**用可切换的真实代码代替截图**。
- **卡片**：证言卡 365×180 固定高、白 60% 底 + 1px 白边 + `shadow-sm`、20px 内距（顶部 24px）。LOGO 墙是一条 129px 高的带子，等分单元用 1px 线分隔，Logo 去色后约 28px 高。

## 图像与插画

三类，比例差异明显：

1. **等距插画**（首屏）：一摞半透明玻璃质感的方块 + 1px 连线 + 小胶囊标签，配色是红色低透明度。连线有 `stroke-dasharray` 动画（`dashes 10s linear infinite`）。它不是「科技感背景」，而是**架构图**——把产品结构画出来。
2. **产品截图**：Nightwatch 仪表盘 1814×490 原生，显示为 581×223（≈3.7:1），`object-fit: cover`，左上 12px 圆角，底部渐隐入背景。
3. **社区照片**：Laracon 横幅 2500×1600 原生，裁成 1279×540（≈2.37:1）通栏，上面压 `linear-gradient(to top, rgba(0,0,0,.5), transparent 50%)` 再加白色文字。这是全站唯一「有人」的图像。
4. **头像**：96×96 原生显示 40×40，圆角 2px，方形而非圆形——与整体的「图纸」气质一致。

结论：**插画承担结构解释，截图承担产品证明，照片只承担社区情绪**，三者比例约 1:3:1，且照片永远只有一条、通栏、带压暗。

## 动效

整体极克制，时长分三档：

- **50ms**：按钮颜色过渡（`transition-colors duration-50 ease-out`）——几乎瞬时，只有「确认感」。
- **150ms**：hover 颜色、`backdrop-filter` 变化。
- **600ms**：入场（`.entrance-animation`，`cubic-bezier(.22,.61,.36,1)`，配合 `@starting-style`，纯 CSS）。
- **1000ms**：首屏大标题的 `blur-up`——`opacity 0→1`、`blur(5px)→0`、`translateY(5%)→0`，后续元素以 0.2/0.4/0.6/0.8s 错峰。另有 12px 模糊的 `nw-blur-up` 变体。
- **循环动画只给示意图**：虚线 10s、浮动 2s、脉冲 2s、无缝滚动 20s，全部 linear/ease-in-out。
- `prefers-reduced-motion` 通过 `motion-safe:`/`motion-reduce:` 变体和 `@media` 包裹严格生效。

**没有**：视差、鼠标跟随、滚动劫持、按钮磁吸。克制程度可以概括为——动效只服务于「进场」和「状态确认」，从不服务于「炫技」。

## 不可挪用的品牌边界

- **Laravel 字标与 L 图形**（红色 `#F53003` 的字标）：这是注册商标，直接用等于冒充。
- **`#F53003` 本身**：技术上它是 Laravel 的品牌红，且白底对比度仅 3.96:1；即便不涉及法务，也不适合做 Seqtura 的强调色。
- **产品线色值**：`#0057FF`(Cloud)、`#18B69B`(Forge)、`#25C4F2`(Vapor)、`#68008C`(Nightwatch)、`#00E5BF`(Nova)。这些是子品牌资产，避开以免看起来像 Laravel 生态产品。
- **语汇**：「Artisan / 工匠」、「The clean stack for Artisans and agents」、「batteries-included」、「ship it」、Laracon 及其照片、社区梗与 Taylor Otwell 的个人叙事。**这些不是视觉，但是最强的品牌识别符**，中文站一旦借用会立刻被读成「Laravel 中文站」。
- **等距「技术栈」插画**：那摞玻璃方块是 Laravel 的专属隐喻，抄结构可以，抄那张图不行。
- 依据：Laravel 官方商标政策明确写「任何商业用途（含培训、会议、设计服务）、软件产品、域名中的使用均需授权」，且不得暗示背书或关联（`https://laravel.com/legal/trademark`）。

**可以借的**：栅格与留白比例、1px hairline + 刻度点的制图语言（把刻度换成自己的强调色）、8px 圆角、轻字重大标题的排版逻辑、50ms 交互反馈、用代码/终端做产品证明的做法。

## 三套可执行样式 token

强调色**推荐青（deep cyan/teal）**而非任何红：浅色 `#0E7490`（白底 5.36:1，可做正文链接）、深色 `#38BDF8`（`#0B0F14` 上 8.97:1）。它与 Laravel 红（`#F53003`）色相相差约 180°（11° vs 193°），与 Cloud 蓝（`#0057FF`，219°）也明确不同，且中文语境下「青」比「蓝紫渐变」更接近基础设施/政企气质。备选：靛 `#4F46E5` / 深 `#818CF8`（白底 6.29:1），若品牌更想强调 AI 属性。

### 共用尺度（三套方案共享）

```css
:root {
  --font-sans: "Inter", "PingFang SC", "Hiragino Sans GB",
               "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace,
               "SF Mono", Menlo, monospace;

  /* 中文版阶梯：比 Laravel 更重、更松、不收字距 */
  --fs-display: 64px; --lh-display: 1.06; --ls-display: -0.02em;
  --fs-h2: 48px; --lh-h2: 1.12;
  --fs-h3: 32px; --lh-h3: 1.25;
  --fs-h4: 24px; --lh-h4: 1.35;
  --fs-lead: 20px; --lh-lead: 1.6;
  --fs-body: 16px; --lh-body: 1.75;
  --fs-caption: 14px; --lh-caption: 1.55;
  --fs-micro: 12px; --lh-micro: 1.5;
  --fs-mono: 14px; --lh-mono: 1.65;

  --fw-display: 500; --fw-body: 400; --fw-emphasis: 600;

  --radius-xs: 2px;  --radius-sm: 6px; --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 20px; --radius-pill: 9999px;

  --gutter: 24px; --container: 1280px;
  --section-y: 96px;           /* 移动端 64px */
  --hairline: 1px;
  --tick: 7px;                 /* 栅格交点刻度块 */

  --ease-out: cubic-bezier(.22, .61, .36, 1);
  --dur-tap: 60ms; --dur-hover: 150ms; --dur-enter: 600ms;
}

@media (min-width: 1024px) { :root { --gutter: 80px; } }
@media (max-width: 640px) {
  :root { --fs-display: 40px; --fs-h2: 32px; --fs-h3: 26px; --section-y: 64px; }
}
```

### A. 深色（主推，dark-first）

```css
[data-theme="dark"] {
  color-scheme: dark;
  --bg:            #0B0F14;
  --bg-subtle:     #0F141A;
  --surface:       #12171E;
  --surface-raised:#171D25;
  --line:          #232A33;   /* hairline */
  --line-strong:   #2E3742;
  --grid-line:     #1A212A;   /* 24px 网格纹 */

  --text:          #F2F5F8;
  --text-muted:    #9AA6B2;   /* 7.56:1 */
  --text-faint:    #6B7684;   /* 仅装饰性标签 */

  --accent:        #38BDF8;   /* 8.97:1 */
  --accent-hover:  #5CCBFA;
  --accent-ink:    #04141D;   /* 强调色块上的文字 */
  --accent-soft:   rgba(56, 189, 248, .14);

  --btn-bg: var(--accent); --btn-fg: var(--accent-ink);
  --btn-ghost-bg: transparent;
  --btn-ghost-border: var(--line-strong);

  --shadow-card: 0 1px 0 rgba(255,255,255,.04) inset,
                 0 12px 32px rgba(0,0,0,.45);
  --glow: radial-gradient(60% 55% at 50% 0%,
          rgba(56,189,248,.14), rgba(56,189,248,0) 70%);
}
```

### B. 浅色（light）

```css
[data-theme="light"] {
  color-scheme: light;
  --bg:            #FFFFFF;
  --bg-subtle:     #F7F8FA;
  --surface:       #FFFFFF;
  --surface-raised:#FCFCFD;
  --line:          #E6E8EC;
  --line-strong:   #D7DAE0;
  --grid-line:     #EFEFF3;

  --text:          #11181C;
  --text-muted:    #5B6470;   /* 6.7:1 */
  --text-faint:    #8B93A1;

  --accent:        #0E7490;   /* 5.36:1 */
  --accent-hover:  #0B5F76;
  --accent-soft:   #E6F4F7;

  /* 主 CTA 用墨黑而非强调色——Laravel Cloud 的做法，更 B2B */
  --btn-bg:        #11181C; --btn-fg: #FFFFFF;
  --btn-ghost-bg:  #FFFFFF; --btn-ghost-border: var(--line);

  --shadow-card: 0 0 1px rgba(16,24,40,.03),
                 0 1px 2px rgba(16,24,40,.06);
  --glow: radial-gradient(70% 70% at 50% 90%,
          rgba(14,116,144,.10), rgba(14,116,144,0) 70%);
}
```

### C. 混合（hybrid：浅色画布 + 深色产品带）

```css
[data-theme="hybrid"] {
  /* 默认继承 light */
  --band-dark: #0B0F14;
}

/* 深色带只包裹「代码 / 终端 / Agent 执行轨迹」这类产品证据区 */
.surface-invert {
  color-scheme: dark;
  --bg:            #0B0F14;
  --surface:       #12171E;
  --line:          #232A33;
  --text:          #F2F5F8;
  --text-muted:    #9AA6B2;
  --accent:        #38BDF8;
  --accent-soft:   rgba(56,189,248,.14);
  --btn-bg:        #38BDF8; --btn-fg: #04141D;
  --shadow-card:   0 12px 32px rgba(0,0,0,.45);
  --glow: radial-gradient(60% 55% at 50% 0%,
          rgba(56,189,248,.14), rgba(56,189,248,0) 70%);

  background: var(--bg);
  color: var(--text);
}
```

**推荐 Seqtura 用 C（混合）作为首版**：浅色画布承接企业采购方的阅读习惯与打印/投屏场景，深色带专门装代码、终端、Agent 运行轨迹——亮度反差本身就是分段器，比再加一层灰色卡片更干净。若首屏必须「有气势」，则用 A（深色）通铺首屏，第二屏起切回浅色。

## 来源

抓取与核验时间：**2026-11-15**（Asia/Shanghai）。线上站点会持续改版，带哈希的产物文件名每日可能变化。

| 来源 | 用途 |
|---|---|
| `https://laravel.com/`（HTTP 200，532,728 B，`x-powered-by: Statamic`） | 首页 DOM、标题层级、类名、内联 JSON |
| `https://laravel.com/build/assets/app-CbmKlInb.css`（622,008 B） | 全部 CSS 自定义属性、色阶、字体 @font-face、断点、圆角、动画 |
| `https://laravel.com/build/assets/page-DJDQ5Krl.css`（48,806 B） | 仅含 Mapbox 样式，与视觉语言无关（负结果） |
| `https://laravel.com/build/manifest.json` | 资源依赖图，确认页面级 CSS 只有两份 |
| `https://laravel.com/cloud` | 子品牌换色实证：黑 CTA、`#0057FF` 只作功能性蓝 |
| `https://laravel.com/legal/trademark` | 商标使用边界（商业用途需授权） |
| `https://fonts.bunny.net/css?family=merriweather:400&display=swap` | 确认 Merriweather 被加载但首页未使用 |
| Headless Chrome 157 + CDP `getComputedStyle`，1440×1000 / 390×844 | 全部「实测」数值（字号、字距、行高、圆角、阴影、渐变、按钮尺寸、刻度坐标） |

复现方法：`curl -A "Mozilla/5.0 … Chrome/157" https://laravel.com/` 取 HTML，再取其中 `<link rel=stylesheet>` 指向的 CSS，搜索 `--color-laravel-red`、`--tracking-heading`、`--breakpoint-`、`@font-face`；渲染值用 Chrome DevTools 或 CDP 的 `Runtime.evaluate` + `getComputedStyle` 读取，均可复现本文表格。
