# 排版标样：字重层级与 CJK 细节（issue #30）

一次性原型，不是生产代码。要回答的问题：

> 「字体调研」（#27）选定的方案——Instrument Sans 可变（latin 子集，30,092B，自托管 + swap）+ CJK 系统栈；字重层级正文 400 / 交互与中强调 500 / **中文标题升 500**；混排接受 `text-autospace` 新默认、`text-spacing-trim` 作渐进增强——在真实文案下的实际渲染效果是否可接受？

红色按 #28 锁定值（`#FF2D20` / `#cd2318` / `#aa1b12`）。验收方式：owner 肉眼确认字重对比与混排细节，或给出调整方向。

## 打开

```bash
open prototype/type-specimen/index.html
```

或起本地服务：`python3 -m http.server 8000` 后访问 `http://localhost:8000/prototype/type-specimen/index.html`（http 下预算读数有真实传输字节；file:// 下显示声明值）。

整页自上而下即标样本体（沿用 color-tuning 的「并排同见」验收方式）。**底部浮条**切四个全局开关，状态进 URL 参数可分享：

| 开关 | 值 | 默认 |
|---|---|---|
| 字体 | `webfont`（当前方案）/ `系统栈`（webfont 未加载的回退形态） | webfont |
| autospace | on（`text-autospace: normal`）/ off | on |
| 标点挤压 | on（`text-spacing-trim: normal`）/ off | off（浏览器初始） |
| 中文标题 | a·400（现状）/ c·500（推荐） | c·500 |

`?capture=1` 隐藏浮条与锚点导航（截图用）。←/→ 快速切换字体。

## 页面结构

| 区块 | 内容 |
|---|---|
| 01 hero 复刻 | 生产最小场景集（kicker + 两行 H1 + lead + 双按钮 + mono 事实条），真实文案，跟随全局开关 |
| 02 层级×字种矩阵 | H1/H2/H3/lead/body/kicker+mono × 纯中文/纯拉丁/混排/数字，每格 webfont vs 系统栈双 lane |
| 03 字重梯度 | Instrument Sans 400–700 实渲染（`font-synthesis: none` 保证真实字重）；**中文标题方案 a/c 固定并排（核心验收点）** |
| 04 混排间距 | autospace 三 lane 固定对照：新默认 / 关闭 / 新默认+手写空格（现状文案写法） |
| 05 标点挤压 | `text-spacing-trim: normal` vs `space-all`，窄栏迫使全宽标点到行首行尾相邻处 |
| 06 数字场景 | tnum on/off 同一份数字对照表、hero 事实条复刻、正文内联数字 |
| 07 度量与预算 | JS 实时测量字形度量，生成回退字体 `size-adjust` 标定 snippet（可复制进规格）；字体预算实时读数 |
| 08 边界 | 未验证项清单 |

页面顶部的环境徽章实时显示当前浏览器对 `text-autospace` / `text-spacing-trim` 的支持与字体加载状态。

## 截图（1440 宽，Chrome 157）

| 文件 | 内容 |
|---|---|
| `shots/hero.png` | hero 复刻（方案 c，中文标题 500） |
| `shots/hero-scheme-a.png` | hero（方案 a，中文标题 400）——a/c 差异直查 |
| `shots/matrix.png` | 层级×字种矩阵整段 |
| `shots/weights.png` | 拉丁字重梯度 + 中文标题 a/c 固定对照 |
| `shots/autospace.png` | 混排间距三 lane |
| `shots/trim.png` | 标点挤压两 lane |
| `shots/numbers.png` | tnum 对照 + 事实条 |
| `shots/metrics.png` | 度量标定 + 预算读数 |
| `shots/full.png` | 整页 |

重截：`node prototype/type-specimen/shots.mjs`（Playwright + 本机 Chrome，走 `file://`，无需 dev server；控制台同时输出环境探测结果）。

## 实测发现（2026-11-17，macOS + Chrome 157）

- **标点挤压生效**：`text-spacing-trim: normal` 在本机 Chrome 157 + 苹方下可见挤压（`。（`、`。）`、`」` 相邻处半宽化，行内折行位置随之变化）——解除 #27 存疑项「苹方是否内建 halt/chws」的 macOS 侧。雅黑/Windows 侧仍未验证。
- **手写空格双重加宽实测成立**：lane C（手写空格 + autospace 新默认）的中西缝隙明显宽于 lane A（纯 autospace）——`text-autospace: normal` 不会识别已有空格。src/data 现有 **276 处**手写空格（architecture 60 / delivery 116 / homepage 42 / process 30 / contact 16 / methodologyCode 12），接受新默认则规格阶段需一轮文案清理。
- **size-adjust 标定（macOS）**：以 Helvetica Neue 为回退，cap-height 对齐得 `size-adjust: 100.8%`、`ascent-override: 97.0%`、`descent-override: 25.0%`；页面 07 区块的 snippet 可直接复制进规格。Windows 需对 Arial 另跑一次。
- **预算 PASS**：1 个 woff2、30,092B（≤100KB、preload ≤1）。file:// 下 Performance API 无传输计量，显示声明值。
- **方案 c 在苹方 Medium 下成立**：72/60px 中文标题 500 与拉丁 400 的「细拉丁 + 稳中文」分字种层级清晰（见 `shots/weights.png` 对照）。雅黑会落 Bold，待 Windows 真机。
- **mono 栈 CJK 逐字回退可见**：kicker / 事实条里数字是 SF Mono、汉字落苹方，混排观感现状可接受（mono webfont 是预算内预留的未来项）。

## 边界

- 只做排版判断：版式、栅格、组件结构沿用现状；颜色用 #28 锁定值，与生产（`#f53003` 系）不同属预期。
- Windows/雅黑、Safari/Firefox 旧版未真机验证；`text-autospace` 在 Chrome/Edge 140+、Safari 18.4+、Firefox 145+ 才生效，旧浏览器静默降级为无自动间距。
- latin-ext 子集（+10.6KB）未加载；全站实际需要与否取决于未来是否出现拉丁扩展字符。
- 验收：owner 肉眼确认字重对比与混排细节，或给方向性反馈后迭代一轮。
