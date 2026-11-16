# 企业 AI Agent 平台公开技术架构参考

> 研究简报 · 2026-11 · 对应 ticket #5
> 只使用厂商官方文档、规范、开源项目文档与工程博客；未把营销页当作架构证据。文中 S1 形式的编号均为可点击来源，完整列表见文末。

## 结论先行

1. **没有唯一的"标准架构"，但能力集合已经收敛。** AWS Bedrock AgentCore 把平台拆成 Runtime、Memory、Gateway、Identity、Observability、Evaluations、Policy、Registry 等模块 [S2]；Microsoft Foundry Agent Service 的主要组件包括 Agent Runtime、Toolboxes、Models、Observability、Identity & Security、Publishing 等 [S1]。模块名不同，覆盖的能力几乎一一对应。架构页应按"能力层"组织，而不是照抄某家厂商的模块名。
2. **厂商叙事分两派，页面要同时回答两个问题。** 模型厂商从"agent = LLM + tools + loop"讲起：Anthropic 的 augmented LLM [S9]、OpenAI 的 agents/handoffs/guardrails [S11]。云平台从"托管运行时 + 企业治理"讲起 [S1]、[S2]。前者回答"为什么能做事"，后者回答"为什么敢上线"。
3. **术语已经收敛，保留英文原词更省沟通成本。** agent、tool、handoff、guardrail、session、memory、trace、evaluation、MCP、A2A、human-in-the-loop 在两套以上主流文档中反复出现 [S1]、[S2]、[S9]、[S11]、[S16]。
4. **企业关切是横切能力，不是最后一层"安全"。** 身份、网络与数据驻留、模型路由与成本、评测、HITL、审计，在官方文档里同时落在运行时、模型层和治理层 [S1]、[S2]、[S4]、[S5]。
5. **架构页的主线应是"一次任务的生命周期"，不是"我们的技术栈"。** 先用一张总览图说明请求如何进入、被编排、调用模型与工具、在何处被拦下或交给人，再展开各层。图层可以借鉴公开文档，但图必须自绘；版权提醒见文末。

## 典型分层

| 层             | 公开文档里的对应物                                                                                                                                  | 架构页要讲清什么                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 接入与编排     | LangGraph 的 graph/state/nodes/edges [S17]；OpenAI 的 agents 与 handoffs [S11]；Foundry 的 Agent Runtime 与 Publishing [S1]                         | 下一步由代码决定还是模型决定；单 agent 还是多 agent  |
| 模型层         | Foundry 的 model catalog 与 model router [S1]、[S5]；ADK 的模型无关适配 [S3]                                                                        | 模型路由、fallback、私有模型接入，而非模型清单       |
| 工具与系统集成 | MCP 的 host/client/server 与 tools/resources/prompts [S14]；Foundry Toolboxes 的托管 MCP 端点 [S1]；AgentCore Gateway 把 API 转成 MCP 工具 [S2]     | 工具是权限边界，不只是 API 列表                      |
| 知识与检索     | Bedrock 托管知识库的检索时 ACL、引用与 rerank [S6]；LlamaIndex 的 connectors/indexes/query engines [S24]                                            | RAG 是可被 agent 调用的工具，检索必须带权限过滤      |
| 记忆           | LangGraph 的 checkpointer 与 store [S18]；semantic/episodic/procedural 三类记忆 [S19]；OpenAI sessions [S13]                                        | 会话状态与长期记忆分开；长期记忆涉及保留、删除与合规 |
| 评测           | LangSmith 的 offline/online evaluation [S21]；Ragas 的 faithfulness、context precision/recall、tool call accuracy [S25]；AgentCore Evaluations [S2] | 分别评检索、工具调用、任务完成，不能只报一个准确率   |
| 可观测性       | LangSmith 的 run/trace/thread/trajectory [S22]；AgentCore Observability 的 OTel 兼容遥测 [S2]；Langfuse 基于 OpenTelemetry [S26]                    | trace 用于排障，audit 用于合规，两者不能互替         |
| 权限与审计     | MCP 的 OAuth 2.1 授权与 audience 绑定 [S15]；Foundry 的 Entra agent identity 与 RBAC [S1]；CloudTrail [S7]                                          | agent 要有独立身份；权限落到每次工具调用             |
| 部署形态       | Foundry 的 prompt/hosted agent、VNet 与 BYO VNet [S1]；LangSmith 自托管 [S23]；ADK 容器化或 Agent Runtime/Cloud Run/GKE [S3]                        | 部署形态决定数据边界、运维责任与成本结构             |

这九层是"能力视图"；Azure Architecture Center 还提供按编排模式切的视图：sequential、concurrent、group chat、handoff、magentic [S4]。两种视图可以叠加使用。

## 厂商与开源项目怎么讲

**Anthropic：先分清 workflow 与 agent。** workflow 由预定义代码路径编排，agent 由模型自主决定流程和工具 [S9]。再往下是 augmented LLM（retrieval、tools、memory）和五种模式：prompt chaining、routing、parallelization、orchestrator-workers、evaluator-optimizer [S9]。Anthropic 另外提出 context engineering：compaction、structured note-taking、sub-agent 架构 [S10]。这套叙事适合解释能力边界。原文顶部已声明工具生态变化并指向 Claude Managed Agents；该文档在当前网络不可达，细节未核实。

**OpenAI：把原语做小。** 核心只有 Agent、handoff、guardrail，加上 sessions 与 tracing [S11]。guardrail 分 input/output/tool 三类，blocking 模式可以在贵模型启动前拦住请求 [S12]。适合工程读者，但企业治理讲得少。

**Microsoft：SDK 叙事与平台叙事分开。** Semantic Kernel 是 middleware，核心是 plugins/OpenAPI、filters、telemetry [S27]；Agent Framework 是 Semantic Kernel 与 AutoGen 的继任者，在 SK 的 session state、middleware、telemetry 之上加入 graph workflows [S28]。平台侧 Foundry Agent Service 把 prompt agent、hosted agent、toolboxes、identity、observability、publishing 打包 [S1]。

**AWS：从"一个 agent 的构成"讲到"agent 的周边"。** Bedrock Agents 用 action groups、knowledge bases、traces、aliases/versions 解释 agent [S8]；AgentCore 则拆成 Harness、Runtime、Memory、Gateway、Identity、Code Interpreter、Browser、Observability、Evaluations、Optimization、Policy、Registry 等模块 [S2]。后者更接近企业架构页的粒度。

**Google：开放框架 + 部署自由。** ADK 强调 graph workflows、上下文管理（sessions、memory、tool outputs、artifacts）和 deploy anywhere：可容器化自托管，也可到 Agent Runtime、Cloud Run、GKE [S3]。

**LangGraph / LangChain：runtime 与平台分工。** LangGraph 是 low-level orchestration runtime：graph、shared state、durable execution、streaming、HITL、persistence，明确"不规定 agent 架构" [S17]。LangSmith 独立承担 tracing、evaluation、deployment [S21]、[S22]、[S23]。开源 runtime + 商业平台的分工值得借鉴。

**LlamaIndex：RAG 不是产品，是工具。** 讲法是 context augmentation：connectors → indexes → query engines → agents；RAG pipeline 只是 agent 可调用的工具之一，workflows 负责多步、分支、重试和 HITL [S24]。

**协议层已经出现分工。** MCP 管 agent 到工具：host/client/server 三层，server 只暴露必要的 tools/resources/prompts，且不应看到完整对话 [S14]；HTTP 传输的授权基于 OAuth 2.1，token 绑定 audience [S15]。A2A 管 agent 到 agent：Agent Card 描述能力，Task/Message/Artifact 描述协作，强调 opaque execution，不暴露内部计划与工具 [S16]。多 agent 架构页可以只承诺协议，不承诺内部实现。

**已经形成的图示语言**（从文档归纳，不是市场调研）：

- 分层栈：接入 / 编排 / 模型 / 工具 / 知识 / 记忆 / 观测 / 治理 [S1]、[S2]。
- 图与状态：节点、边、共享 state、checkpoint [S17]。
- 请求时序：guardrail → 模型 → 工具 → HITL → 回到模型 [S9]、[S12]。
- 控制面 / 数据面：身份、策略、评测、观测独立于业务请求路径 [S1]、[S2]。
- 编排模式：sequential、concurrent、group chat、handoff、magentic [S4]。

## 企业关切怎么呈现

**私有化 / 专有云。** 常见三档：多租户 SaaS、专属实例/VPC、自托管/本地化。Foundry 对 prompt agent 提供 VNet 隔离，hosted agent 支持 BYO VNet，每个 session 跑在 VM 隔离沙箱 [S1]；LangSmith 自托管明确 trace 与运营数据留在自有环境，架构是 frontend/backend/queue 加 ClickHouse/PostgreSQL/Redis/对象存储 [S23]；ADK 可容器化跑在自有基础设施 [S3]。"专有云"是商业包装词，本轮未找到统一定义；谁运维、谁持钥、能否离线，需要产品与合同确认——**未核实**。

**数据驻留 / 数据不出域。** 技术控制点主要是区域选择、VNet/PrivateLink、自带存储与密钥、日志保留。Azure 把 VNet 与 data residency 放在一起，并支持 BYO storage/search/Cosmos DB [S1]；AWS 提供 VPC/PrivateLink 与区域化部署 [S7]；模型路由声称遵守 data zone 边界 [S5]。但"不出域"是法律与合同承诺，文档只能证明技术能力，不能替代合规评估。

**模型路由。** Azure model router 是一个"用模型做的路由器"：按 prompt 复杂度、任务类型实时选模型，提供 Balanced/Cost/Quality 三种模式、模型子集、自动 failover，官方称不存储 prompt [S5]。两个常被忽略的约束：有效上下文窗口受最小模型限制；路由效果仍需用自有评测集验证 [S5]。这两点比"支持多模型"更有说服力。

**成本控制。** 官方文档给的是组合拳：按任务复杂度给每个 agent 配不同模型、监控每 agent/每次编排的 token、在 agent 之间做 context compaction [S4]；guardrail 用 blocking 模式避免贵模型白跑 [S12]；Langfuse 的 gateway 可按用户/API key/模型记账 [S26]。成本控制是运营闭环，不是某个开关。

**评测。** LangSmith 把评测分成 offline（dataset/experiment，有参考答案）与 online（生产 trace，无参考答案），方法是 human、code、LLM-as-judge、pairwise [S21]；Ragas 给出 RAG 与 agent 两套指标，如 faithfulness、context precision/recall、tool call accuracy、agent goal accuracy [S25]；AgentCore 把评测做成托管服务，支持 session/trace/span 级评估 [S2]。架构页应写"评什么、用什么数据、谁来判"。

**Human-in-the-loop。** LangGraph 的 interrupt 在节点内暂停，用 checkpointer 保存状态，等待 `Command(resume=...)` 恢复，适合审批、改状态、审工具调用 [S20]；OpenAI 的 run 可因 approval 中断并用同一 session 恢复 [S13]；Azure 的编排指南建议把 HITL gate 放在敏感工具调用上，而不是每个输出都拦 [S4]。设计关键是"在哪儿停、停多久、恢复后是否重放副作用"。

**权限与审计。** MCP 为 HTTP 传输定义的授权基于 OAuth 2.1，要求 token 绑定 audience、禁止 token passthrough [S15]；Foundry 可为每个 agent 配置独立 Entra 身份并支持 RBAC [S1]；AWS 建议用 CloudTrail 记录 API 活动 [S7]；NIST AI RMF 是自愿性风险管理框架，2024 年发布了生成式 AI Profile [S29]；OWASP 的 Agentic Applications Top 10（2026 版）称由 100 多位专家同行评审 [S30]。审计要回答"谁（用户/agent）、用什么身份、调了什么工具、改了什么数据"，trace 本身不够。

## 对 Seqtura 架构页的建议结构

| 区块         | 要回答的买方问题                             | 建议图示                                                                   |
| ------------ | -------------------------------------------- | -------------------------------------------------------------------------- |
| 一页总览     | 平台由哪几块组成？                           | 把上表九层合并成 5 层能力栈 + 3 条横切控制面（身份、观测/评测、策略/审计） |
| 请求生命周期 | 一次任务从进来到交付发生了什么？             | 时序图：ingress → 编排 → 模型 → 工具/知识 → HITL gate → 输出               |
| 编排内核     | workflow 还是 agent？多 agent 怎么协作？     | graph/state 图 + sequential/handoff 两种模式                               |
| 模型层       | 支持哪些模型？怎么选、怎么降级、怎么控成本？ | 路由决策图（质量/成本/时延）+ fallback                                     |
| 工具与集成   | 怎么接现有系统？权限怎么控？                 | MCP/OpenAPI 接入图，工具调用处标权限检查点                                 |
| 知识与记忆   | RAG 怎么做？记忆存什么、存多久？             | ingestion → 解析 → 索引 → 检索 → 引用；记忆分短期/长期                     |
| 企业控制面   | 私有化、数据驻留、审计、评测怎么保证？       | 控制面/数据面分离 + 部署三档                                               |
| 交付与指标   | 怎么证明上线后有效？                         | 任务成功率、工具调用正确率、P95 时延、单任务成本                           |

写作原则：

- 先给"一页图 + 三条结论"，再展开；买方不会从术语表开始读。
- 每个能力点配一个"约束/代价"：路由受最小模型上下文限制、HITL 增加时延、自托管增加运维责任。可信度来自约束，不来自形容词。
- 不把"安全"画成最后一层；不把 RAG 画成唯一知识路径；不堆模型 logo 墙。
- 合规认证、客户案例、SLA 数字，没有一手材料不要写。本报告未核实 Seqtura 自身能力。

## 术语表（中英对照）

| 中文            | English                       | 一句话解释                                                | 参考         |
| --------------- | ----------------------------- | --------------------------------------------------------- | ------------ |
| 智能体          | Agent                         | LLM 在循环中自主调用工具、根据环境反馈推进任务            | [S9]         |
| 智能体工作流    | Agentic workflow              | 用预定义代码路径编排 LLM 与工具，可预测性更高             | [S9]         |
| 编排            | Orchestration                 | 决定下一步由谁做、做什么、何时停                          | [S17]、[S4]  |
| 工具            | Tool                          | 模型可调用的外部能力，通常有 JSON Schema                  | [S14]        |
| 模型上下文协议  | MCP                           | host/client/server 架构，统一暴露 tools/resources/prompts | [S14]        |
| 智能体间协议    | A2A                           | 独立 agent 之间发现、委派、交换任务与产物                 | [S16]        |
| 移交            | Handoff                       | 一个 agent 把任务与上下文转给另一个 agent                 | [S11]        |
| 护栏            | Guardrail                     | 对输入、输出或工具调用做校验，可中断执行                  | [S12]        |
| 会话 / 线程     | Session / Thread              | 一次多轮交互的上下文边界                                  | [S13]、[S17] |
| 短期 / 长期记忆 | Short-term / Long-term memory | 线程内状态 vs 跨会话持久数据                              | [S18]、[S19] |
| 检查点          | Checkpointer                  | 持久化图状态，用于恢复、回放与 HITL                       | [S18]        |
| 检索增强生成    | RAG                           | 先检索私有数据，再把结果放进上下文生成                    | [S6]、[S24]  |
| 离线 / 在线评测 | Offline / Online evaluation   | 用数据集测 vs 用生产流量测                                | [S21]        |
| 追踪 / 跨度     | Trace / Span                  | 一次请求的调用树；树中的一个工作单元                      | [S22]        |
| 人在回路        | Human-in-the-loop             | 在关键动作前暂停，等待人审批或修改                        | [S20]        |
| 智能体身份      | Agent identity                | 每个 agent 独立于用户的身份与凭证                         | [S1]、[S2]   |
| 模型路由        | Model routing                 | 按请求特征选择模型，平衡质量、成本、时延                  | [S5]         |
| 数据驻留        | Data residency                | 数据存储与处理的地理/法域约束                             | [S1]、[S7]   |

## 来源

### 可借鉴的公开页面 / 图示（5 个）

| 页面                                        | 可借鉴什么                                                   | 复用提醒                                                       |
| ------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| [Anthropic: Building effective agents][S9]  | augmented LLM 与五种 workflow 模式图                         | 版权归 Anthropic；只重绘结构，不复制原图与文案                 |
| [MCP Architecture][S14]                     | host/client/server 的信任边界与能力协商                      | 规范文本可引用；图表复用前核对仓库与文档站许可证               |
| [Foundry Agent Service 概览][S1]            | "Agent Service at a glance" 组件表、prompt/hosted agent 分层 | 转述可以；产品图标与商标不可直接复用，使用条款以页面为准       |
| [AWS Bedrock AgentCore 概览][S2]            | 运行时、记忆、网关、身份、观测的模块化画法                   | AWS 文档未声明可复用，按默认版权处理；只借鉴能力划分，不复制图 |
| [Azure AI agent orchestration patterns][S4] | sequential/concurrent/group chat/handoff/magentic 五种模式图 | Microsoft 文档；重绘并标注"参考"来源，不复制原图               |

### 完整来源

**平台与云厂商**

1. [Microsoft Foundry Agent Service 概览][S1]
2. [Amazon Bedrock AgentCore 概览][S2]
3. [Google Agent Development Kit (ADK)][S3]
4. [Azure Architecture Center: AI Agent Orchestration Patterns][S4]
5. [Microsoft Foundry: Model router][S5]
6. [Amazon Bedrock Knowledge Bases][S6]
7. [Amazon Bedrock: Data protection][S7]
8. [Amazon Bedrock Agents][S8]

**模型厂商与协议**

9. [Anthropic: Building effective agents][S9]
10. [Anthropic: Effective context engineering for AI agents][S10]
11. [OpenAI Agents SDK][S11]
12. [OpenAI Agents SDK: Guardrails][S12]
13. [OpenAI Agents SDK: Sessions][S13]
14. [MCP: Architecture][S14]
15. [MCP: Authorization][S15]
16. [A2A Protocol Specification 1.0.0][S16]

**开源框架与工具**

17. [LangGraph overview][S17]
18. [LangGraph persistence][S18]
19. [LangGraph memory][S19]
20. [LangGraph interrupts][S20]
21. [LangSmith evaluation concepts][S21]
22. [LangSmith observability concepts][S22]
23. [LangSmith self-hosted][S23]
24. [LlamaIndex Framework][S24]
25. [Ragas metrics][S25]
26. [Langfuse docs][S26]
27. [Semantic Kernel overview][S27]
28. [Microsoft Agent Framework overview][S28]

**治理与风险**

29. [NIST AI Risk Management Framework][S29]
30. [OWASP Top 10 for Agentic Applications for 2026][S30]

### 未核实与边界

- Anthropic 的 Claude Managed Agents 文档在当前网络不可达（区域限制），产品细节**未核实**；只能确认 Anthropic 在原文顶部指向它。
- "专有云""信创适配""等保三级"等中国采购语境下的具体定义与认证要求，本轮**未核实**；不要在架构页把认证写成既成事实。
- 未核实任何 Seqtura 自身能力、客户案例、SLA 或性能数字。
- 未做买方访谈；"术语收敛"是从厂商文档归纳，不是市场调研结论。
- OpenTelemetry GenAI semantic conventions 原页面已迁移，本轮未取得新规范正文；只使用各厂商文档中"OTel 兼容"的表述。

[S1]: https://learn.microsoft.com/en-us/azure/ai-foundry/agents/overview
[S2]: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
[S3]: https://adk.dev/
[S4]: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
[S5]: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/model-router
[S6]: https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html
[S7]: https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html
[S8]: https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html
[S9]: https://www.anthropic.com/engineering/building-effective-agents
[S10]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
[S11]: https://openai.github.io/openai-agents-python/
[S12]: https://openai.github.io/openai-agents-python/guardrails/
[S13]: https://openai.github.io/openai-agents-python/sessions/
[S14]: https://modelcontextprotocol.io/specification/2025-06-18/architecture
[S15]: https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
[S16]: https://a2a-protocol.org/latest/specification/
[S17]: https://docs.langchain.com/oss/python/langgraph/overview
[S18]: https://docs.langchain.com/oss/python/langgraph/persistence
[S19]: https://docs.langchain.com/oss/python/langgraph/memory
[S20]: https://docs.langchain.com/oss/python/langgraph/interrupts
[S21]: https://docs.langchain.com/langsmith/evaluation-concepts
[S22]: https://docs.langchain.com/langsmith/observability-concepts
[S23]: https://docs.langchain.com/langsmith/self-hosted
[S24]: https://developers.llamaindex.ai/python/framework/
[S25]: https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/
[S26]: https://langfuse.com/docs
[S27]: https://learn.microsoft.com/en-us/semantic-kernel/overview/
[S28]: https://learn.microsoft.com/en-us/agent-framework/overview/
[S29]: https://www.nist.gov/itl/ai-risk-management-framework
[S30]: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
