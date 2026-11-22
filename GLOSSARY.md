# Seqtura AI 官网

面向企业决策者的营销站，解释 Seqtura AI（序构 AI）如何把 AI Agent 从业务问题做到生产上线。本 glossary 只定义官网与交付方法中的领域术语，不记录页面实现。

## Language

### 基础

**AI Agent（Agent）**:
在业务流程中调用模型、工具与知识，能自主完成多步任务的软件系统。官网首次出现写「AI Agent」，之后用「Agent」。
_Avoid_: 智能体（仅首次出现与 SEO 的中文别名）, AI 助手, Bot

**FDE（Forward Deployed Engineering，前置交付）**:
一种前置交付工程师（Forward Deployed Engineer）与客户业务人员共同设计、构建、验证的交付模式。产品线上的 FDE 工作台指 Fdesforce，与这个交付模式区分。
_Avoid_: 外包, 远程交付

### 联系

**企业微信（WeCom）**:
面向企业客户的即时通讯渠道；Seqtura 用它接受客户咨询。官网统一写「企业微信」。
_Avoid_: 微信, 个人微信

**预约沟通**:
潜在客户通过官网公开的企业微信、飞书或邮箱主动联系 Seqtura，进入合作阶段「初次沟通」的动作。对外 CTA 统一用「预约沟通」。
客户添加企业微信 / 飞书时的备注统一写「序构」，站内文案是「备注「序构」」。
_Avoid_: 预约 30 分钟沟通, 预约表单, 备注「预约」

### 交付方法

**交付阶段**:
工作方法页描述的 8 个工程阶段，从 Discover 到 Optimize，对应一个 Agent 从业务问题到生产上线的完整路径。
_Avoid_: 合作阶段, 商业阶段

**合作阶段**:
合作流程页描述的 6 个商业节点：初次沟通、需求与可行性评估、方案与报价、合同与启动、交付与验收、上线后支持。
_Avoid_: 交付阶段

**验证切片**:
正式项目内早期 2–4 周的可运行版本，用于在全面构建前验证关键假设；通过标准沿用合同中的验收标准，不单独售卖。
_Avoid_: 免费 POC, Demo, 概念验证

**支持期**:
上线后按约定范围处理问题与迭代的期间，按次或按项目另行约定，不做年度订阅。
_Avoid_: 运维期, 服务期, 订阅期

**过关条件**:
每个交付阶段的退出标准，用于判断能否进入下一阶段。
_Avoid_: 验收标准（最终验收时）

**验收标准**:
Define 阶段与客户确认、Validate 阶段逐项执行的一组可量化标准。
_Avoid_: 过关条件（阶段退出标准）

**业务本体（Ontology）**:
对业务对象、关系与动作的定义，Agent 依据它理解业务规则并行动。产品线上的本体层指 Heirloom。
_Avoid_: 知识图谱, 语义层

**Skills（技能）**:
可复用的 Agent 能力单元，例如查询订单、生成工单摘要。
_Avoid_: 插件

**Connectors（连接器）**:
把客户系统与数据接入 Agent 的适配层。
_Avoid_: 接口

### 产出物

**客户业务画像（Customer Profile）**:
Discover 阶段的产出，记录客户的业务、组织、系统、痛点和约束。
_Avoid_: 需求文档

**问题定义（Problem Statement）**:
Diagnose 阶段的产出，给出值得做、不值得做或先做哪一步的结论，含 ROI 假设、可行性与风险。
_Avoid_: 需求清单

**Agent 规格卡（Agent Specification）**:
Define 阶段的产出，定义 Agent 的职责、目标、非目标、权限、成功指标与验收标准。
_Avoid_: 需求文档, PRD

**评测集（Evaluation Set）**:
在 Build 之前确定、在 Validate 阶段按同一套标准执行的一组正常、边界和失败样本。
_Avoid_: 评估集, 测试集

**方案架构（Solution Architecture）**:
Design 阶段的产出，定义 Agent 架构、Workflow、Tools、Knowledge、Ontology 与系统集成的可施工设计；是参考架构在单个客户项目中的实例。
_Avoid_: 技术方案

**可运行原型（Working Prototype）**:
Build 阶段的产出，能在沙箱或预发环境跑真实任务、按规格构建的 Agent 版本。
_Avoid_: Demo

**评测报告（Evaluation Report）**:
Validate 阶段的产出，按锁定评测集与验收标准逐项打分的可复核报告。
_Avoid_: 测试报告

**生产 Agent（Production Agent）**:
Deploy 阶段的产出，接入客户生产系统并完成权限、监控、告警与回滚配置的 Agent。
_Avoid_: 上线版本

**持续优化（Continuous Improvement）**:
Optimize 阶段的循环：依据使用数据、失败案例与成本，迭代 Agent、Skills、Knowledge 与 Workflow。
_Avoid_: 运维

**运营报告**:
Optimize 阶段的产出，记录使用数据、失败案例、成本与下一轮迭代计划。
_Avoid_: 周报

### 架构

**参考架构（Reference Architecture）**:
官网技术架构页公开的、可复用的企业 AI Agent 能力模型：5 层能力栈 + 3 条横切控制面，不绑定具体客户、模型厂商或部署形态。
_Avoid_: 平台架构, 产品架构, 技术方案

**能力栈（Capability Stack）**:
参考架构的纵向分层：接入与编排、模型、工具与系统集成、知识与记忆、运行时与部署。
_Avoid_: 技术栈, 架构层

**控制面（Control Plane）**:
横切能力栈的治理能力：身份与权限、评测与可观测、策略与审计。
_Avoid_: 安全层, 治理层

### 产品线

**产品线（Product Line）**:
官网列出、与交付服务并列的独立产品品牌；每条有各自的定位、能力边界与形态，不绑定 8 阶段交付方法。
_Avoid_: 业务线, 子品牌, 产品矩阵

**Oribos**:
TypeScript 的 Agent 框架，提供 Agent、记忆、Workflow 与运行时能力（长跑 Agent、信号、定时任务），零运行时依赖，Apache-2.0 开源、pre-1.0。
_Avoid_: Agent 平台, 智能体平台

**Fdesforce（FDE 工作台）**:
面向 FDE 与交付团队的构建器：把 Customer 的 Solution Spec 编译成可独立部署的 Bundle，以固定输入、失败即拒的门禁与可复现摘要保证构建可核对。内部工具，不对外提供账号。
_Avoid_: FdeForce, FDE Force, FDE 交付平台

**Heirloom（本体层）**:
把企业领域模型写成代码的开源、自托管本体层：数据、动作、逻辑与权限在一处定义；处于设计阶段。
_Avoid_: 语义层, 知识图谱, 图数据库

### 原则

**结果导向（Outcome-driven）**:
以业务结果为目标，而不是以 Agent 开发完成为目标。
_Avoid_: 交付导向

**共同构建（Co-building）**:
前置交付工程师与客户业务人员一起设计、构建、验证，关键产出物由客户拍板。
_Avoid_: 需求交接

**产品化沉淀（Productization）**:
把通用能力沉淀为可复用的 Agent 模式、Skills、Connectors 和工程组件；客户专属的业务逻辑、数据、本体与配置留在客户环境。
_Avoid_: 客户资产复用
