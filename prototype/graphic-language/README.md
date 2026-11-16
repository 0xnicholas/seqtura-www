# 标志性图形语言粗稿：等距栈延展 vs 蓝图线稿（issue #29）

一次性原型，不是生产代码。要回答的问题：

> Seqtura 官网的标志性图形语言走哪个方向（或混合）？选定后成为「第二图层」与后续区块规格的图形语言基础。

**第二轮（2026-11-17）**：owner 反馈「hero 图保持现状、区块层面看不出差别」，因此 hero 不再参与变体（全站 hero 恒为现有等距能力栈）；三个变体改为把方法论页「8 阶段总览」区块整体换肤。第一轮尝试过的 hero 主图替换方案已否决，组件已删除（见分支首个提交）。

三个变体，`?variant=` 切换（无参数 = 现状对照）：

| 变体 | 参数 | 区块处理 |
|---|---|---|
| A · 等距栈延展 | `?variant=iso` | 区块头部 120px mini 等距栈；每张组卡以「等距阶梯对」图开场：两个阶段各一块板，红色箭头串联，门禁阶段（Define / Validate / Deploy）为红色填充板，阶段号落在板面 |
| B · 蓝图线稿 | `?variant=bp` | 区块头部蓝图小图 + 标题下尺寸界线（`SHT-01 · 阶段总览`）；每张组卡加图纸角规线与底部标题栏（`SHEET 0x · 组代号 · 阶段区间`） |
| C · 混合 | `?variant=mix` | 等距几何 × 蓝图注记：线框阶梯对 + 引线标注阶段名，门禁阶段为唯一红色填充板 |

## 打开

```bash
pnpm dev
# http://localhost:4321/methodology?variant=iso
# http://localhost:4321/methodology?variant=bp
# http://localhost:4321/methodology?variant=mix
# 首页 hero 三向相同（保持现状），无需对比
```

左下角黑色 `PROTO` 切换条：点箭头或按键盘 `←` / `→` 循环切换变体；URL 参数可分享、刷新保持。切换条与变体 DOM 只在 dev 模式渲染（`import.meta.env.DEV`），生产构建不含原型代码。

实现说明：`output: 'static'` 下 `Astro.url` 不含查询串，变体由 `public/scripts/prototype-graphic-language.js` 在客户端按 `?variant=` 切换。原型代码集中在 `src/components/prototype/`；对生产组件的改动只有 `MethodologyStages.astro`（变体区块）与 `BaseLayout.astro`（切换条），均标注 `PROTOTYPE graphic-language (#29)`。`HomeHero.astro` 已还原与 main 一致。

## 截图（1440 宽，方法论页「8 阶段总览」）

| 文件 | 内容 |
|---|---|
| `shots/meth-base.png` | 现状对照 |
| `shots/meth-iso.png` | A · 等距栈延展 |
| `shots/meth-bp.png` | B · 蓝图线稿 |
| `shots/meth-mix.png` | C · 混合 |

重截：`node tests/support/proto-shots.mjs`（需要 dev server 在 4321）。

## 边界

- 粗稿：只看图形语言方向，不抠字号、间距、对齐细节。
- hero 主图已由 owner 拍板保持现状，不在本原型范围内。
- 内页应用示意选了方法论页「8 阶段总览」；架构页等其它区块留到规格阶段按选定方向展开。
- 不评估动效；三个变体的入场动效沿用现状。
