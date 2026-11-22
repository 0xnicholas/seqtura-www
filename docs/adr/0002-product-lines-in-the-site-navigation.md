# 0002 官网纳入产品线，产品页只讲产品

- Status: Accepted
- Date: 2026-11-22

## Context

官网此前只讲一件事：Seqtura 如何用 FDE 方法把 AI Agent 从业务问题做到生产上线。2026-11-22 起有三条独立产品线需要对外出现——Oribos（Agent 框架）、Fdesforce（FDE 工作台）、Heirloom（本体层）——它们各有自己的仓库与站点雏形（`oribos.ai` 仍是临时域名，Heirloom 的站点还在 `github.io` 子路径，Fdesforce 只有仓库），且三个仓库里没有一处提到 Seqtura。这条导航是「它们属于同一家公司」的第一次公开声明。

## Decision

- 顶层导航新增「产品和服务」分组，排在「合作流程」之前；「相关资料」仍在中间，「联系我们」收尾。
- 三条产品线各建一张站内页面（`/products/oribos`、`/products/fdesforce`、`/products/heirloom`），导航子项指向它们；不建 `/products` 汇总页。
- 产品页只讲产品：不写 FDE 服务叙事，不做产品级转化（无按钮、无表单），不放任何出站链接。全站主 CTA 仍由 header 的「预约沟通」承担。
- 产品页以「它在五层能力栈里的位置」收尾，回指 `/architecture`。`/architecture` 正文不动，仍是厂商中立的公共能力模型。
- 页脚新增「产品」列；首页本轮不改。
- 站内规范名：`Oribos`、`Fdesforce`、`Heirloom`；中文定位分别是「Agent 框架」「FDE 工作台」「本体层」。

## Considered Options

- **导航直接外链到各产品站点**：三处落点状态不一（临时域名 / `github.io` 子路径 / 只有仓库），会把官网流量送到未完工的页面，未采用。
- **只做一个 `/products` 汇总页、子项指向锚点**：子菜单会变成假跳转，且三款产品的读者与问题不同，未采用。
- **把 `/architecture` 改写成 Oribos 的架构**：会让已上线的公共能力模型失去厂商中立性，且需重写整页，未采用。
- **给三条产品线各配一个强调色**：`§3.1` 红系 token 刚冻结，产品线色会把「哪个红是品牌、哪个红是产品」永久留在 CSS 里；等产品页有真实内容再开独立视觉议题，未采用。

## Consequences

- 三个产品仓库里都没有 Seqtura 的引用，因此这次导航是单向声明；产品侧站点不会回指，访客可能先在别处遇到同名产品。要消除这一点需要另一轮改动。
- **已知冲突（待收口）**：`oribos.ai` 已经以自己的名义售卖 FDE engagement（2–6 周、嵌入、handoff、best-effort support），与本站的 8 阶段交付 + 合作流程是同一件事的两套话术；`oribos.ai` 的 solution page 也宣称拥有 "reference architecture"，与本站的「参考架构」撞名。本轮不出站，冲突对访客不可见，但两站同时对外时会被问到。
- 「不出站」是早期可逆决定：等 `oribos.ai` 域名落定、Heirloom 站点有正式域名后，是否在产品页加入口需要重新裁决；届时把链接集中在一处（产品页正文），不要散到导航。
- 产品页没有 CTA，转化路径完全依赖全站 chrome；这是刻意的，不要在产品页「补」一个按钮。
