# 品牌红微调候选：红色系与中性色阶（issue #28）

一次性原型，不是生产代码。要回答的问题：

> 品牌红在红色系内微调（允许动色相/明度，不换色系），选哪一组？每组含主红、深色变体（dark / hover）、faded / wash，与现有中性色阶搭配的实际界面效果，并与 laravel 品牌红 `#FF2D20` 并排拉开可感知距离。

## 打开

```bash
open prototype/color-tuning/index.html
```

或起本地服务：`python3 -m http.server 8000` 后访问 `http://localhost:8000/prototype/color-tuning/index.html`。
`?capture=1` 隐藏锚点导航（截图用）。整页自上而下即对比本体，无变体切换——并排同见是本 ticket 的验收方式。

## 候选（主红）

| 候选 | 主红 | 调整方式 | ΔE00 vs laravel | ΔE00 vs 现状 | 白字对比 |
|---|---|---|---|---|---|
| 校准 · 现状 | `#f53003` | — | 4.12 | — | 3.96 ✗ |
| 校准 · laravel | `#FF2D20` | — | — | 4.12 | 3.72 ✗ |
| A · 沉稳朱红 | `#dc2600` | 同色相、降明度（L 0.627→0.575） | 8.35 | 5.90 | 4.86 ✓ |
| B · 绯红 | `#d3143a` | 色相向冷（HSL 11°→348°） | 14.52 | 16.13 | 5.34 ✓ |
| C · 砖红陶土 | `#b54016` | 降饱和（98%→78%）+ 降明度 | 14.64 | 12.18 | 5.66 ✓ |

ΔE00（CIEDE2000）：<2 几乎不可辨 · 2–5 并置可辨 · 5–10 明显差异 · >10 不同的颜色印象。现状与 laravel 仅 4.12，即「为什么要微调」。

完整梯度（dark = 按钮底色、hover = 悬停，偏移量沿用现状 ramp 的 OKLCH 关系）：

| token | A · 沉稳朱红 | B · 绯红 | C · 砖红陶土 |
|---|---|---|---|
| red | `#dc2600` | `#d3143a` | `#b54016` |
| red-dark | `#ac1c01` | `#a30d2b` | `#873216` |
| red-hover | `#8a1400` | `#820620` | `#662813` |
| red-faded | `#ffe2dc` | `#ffe1e0` | `#fee3da` |
| red-wash | `#fff7f5` | `#fff7f6` | `#fff7f4` |

laravel 对照列的 dark `#cd2318` / hover `#aa1b12` 为按本站同一梯度规则派生的参考值（laravel.com 未公开完整梯度）；faded / wash 各组按自主红色相等亮度生成（OKLCH L=0.935 / 0.982），组间观感差异极小。

## 截图（1440 宽）

| 文件 | 内容 |
|---|---|
| `shots/overview.png` | 色板总览（五组 × 五 token + ΔE00 + 对比度） |
| `shots/calib.png` | 校准组：现状 vs laravel（几乎不可辨的 4.12） |
| `shots/cand-a.png` | A · 沉稳朱红 vs laravel |
| `shots/cand-b.png` | B · 绯红 vs laravel |
| `shots/cand-c.png` | C · 砖红陶土 vs laravel |
| `shots/full.png` | 整页 |

重截：`node prototype/color-tuning/shots.mjs`（Playwright + 本机 Chrome，走 `file://`，无需 dev server）。

## 附带发现

三组候选的主红都过 WCAG AA（白字 ≥4.5:1），现状 `#f53003`（3.96）与 laravel `#FF2D20`（3.72）均未过。选定任一候选后，规格阶段可考虑把按钮映射简化为「主红底 + dark 悬停」，消掉 homepage-visual 遗留的对比度折中（现生产按钮用 red-dark 底）。kicker / text-link 等小字红沿用 red-dark 槽位，三组均 ≥7:1。

## 边界

- 只做颜色判断：版式、字号、间距沿用现状；中性色阶（canvas / paper / ink / muted / line）五组完全一致。
- mock 栏宽约 660px，hero 呈生产环境 ≤1023px 断点形态（居中、无等距插画）；等距插画的红色点缀与 tick 同色，已包含。
- 性能预算影响为零：纯色值 token 替换，不新增字体、图片或脚本。
- hover 态以 state chips 形式静态呈现（截图无法表达交互悬停）。
- 验收：owner 肉眼选定一组，或给方向性反馈（更冷/更暖、再深/再浅、饱和再降等）后迭代一轮。
