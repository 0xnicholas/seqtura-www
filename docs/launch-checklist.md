# 上线检查表（Owner）

本表是 #24 的发布门禁：所有勾选项必须由 owner 在正式上线前确认。未确认的交付承诺、周期、角色、架构能力与法务事实，一律保持代码中的默认写法，不得改写成既成事实。

- 默认文案来源：`src/data/delivery.ts`、`src/data/process.ts`、`src/data/architecture.ts`、`src/data/homepage.ts`、`src/config/placeholders.ts`、`src/config/legal.ts`。
- 环境变量清单：`.env.example`。
- 自动化门禁：`pnpm lint`、`pnpm check`、`pnpm build`、`pnpm check:links`、`pnpm check:sentinels`、`pnpm test`、`pnpm lighthouse`。
- CI 顺序见 `.github/workflows/ci.yml`。`main` 分支保护由仓库设置维护：必须要求 CI 的 `quality` job 通过后才能合并；本仓库代码不修改分支保护。

## 1. 四条交付承诺

逐条确认；任一项不成立，先改对应页面文案，再上线。

| #   | 承诺           | 当前默认写法                                                      | 需要 owner 确认                                          | 不成立时                                 |
| --- | -------------- | ----------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| 1   | 源码交付       | `源码交付（按合同）`：是否交付、范围与 License 以合同为准         | 是否所有项目都交付源码；交付范围；License 形式           | 保持“按合同”，不要写成无条件源码交付     |
| 2   | 私有化         | SaaS / 专属实例 / 自托管三档，按项目评估                          | 三档是否都能实际交付；每档谁运维、数据在哪、模型能否离线 | 只保留已确认档位；不要写“三档均可交付”   |
| 3   | 验收标准前置   | Define 阶段确认验收标准与评测集 v0；Validate 按同一套标准逐项打分 | 是否确实在 Define 阶段由业务 sponsor 签字确认            | 改写流程说明，不要把前置验收写成既成流程 |
| 4   | 上线后支持范围 | 按次或按项目约定；不含新场景与 7×24 值守                          | 支持方式、响应约定、明确不包含项                         | 按实际合同改写，不承诺未约定的 SLA       |

## 2. 流程周期与角色

来源：`src/data/process.ts`。owner 必须核对数字与实际团队配置；不一致时先改代码。

| 阶段             | 典型周期                          | 我方参与人                   | 客户侧参与人                              |
| ---------------- | --------------------------------- | ---------------------------- | ----------------------------------------- |
| 初次沟通         | 30 分钟，1 次                     | 技术负责人 + 业务负责人      | 业务发起人，技术对接人可同来              |
| 需求与可行性评估 | 1–2 周                            | 前置交付工程师 + 方案 / 架构 | 业务专家 + IT / 数据对接人 + 业务 sponsor |
| 方案与报价       | 3–5 个工作日                      | 方案 + 商务                  | 业务 sponsor，采购 / 法务按需             |
| 合同与启动       | 1–2 周，取决于采购流程            | 商务 + 项目负责人            | 采购 / 法务 + 业务 sponsor + 项目对接人   |
| 交付与验收       | 4–12 周，视范围，以报价排期为基准 | 前置交付工程师 + 工程 / 架构 | 业务专家 + IT + 验收人                    |
| 上线后支持       | 按合同                            | 交付工程师                   | 运维对接人 + 业务负责人                   |

同时确认：

- [ ] 合同生效前不开工；采购周期不计入交付周期。
- [ ] 支持按次或按项目，不做年度订阅；不含新场景开发与 7×24 值守。
- [ ] 2–4 周验证切片是正式项目内的一部分，不单独售卖。
- [ ] 报价绑定已确认范围；范围变更重新报价；范围未定不报固定总价 / 固定工期。
- [ ] 各阶段参与人角色与实际团队配置一致。

## 3. 架构 12 项待确认事实

来源：`src/data/architecture.ts`。未确认时严格使用“默认写法”，不得把设计原则写成已实现能力。

| #   | 待确认事实                                           | 未确认时的默认写法                         |
| --- | ---------------------------------------------------- | ------------------------------------------ |
| 1   | 源码交付范围、License、是否所有项目                  | 交付边界只写组件与模式；源码范围由合同约定 |
| 2   | 私有化三档是否都能做；谁运维、数据在哪、模型能否离线 | 只写三档模型与选择依据，不写“三档均可交付” |
| 3   | 模型接入方式；路由 / fallback 是否已有实现           | 写“按可替换设计”，不写具体实现             |
| 4   | Agent 是否独立身份；权限是否落到每次工具调用         | 写“架构要求”，不写“已实现”                 |
| 5   | 审计字段、保留期、能否导出                           | 写“审计应回答什么”，不写“已实现”           |
| 6   | 是否有固定评测集与三层指标；能否给脱敏报告结构       | 写“评什么、怎么用”，不报数字               |
| 7   | 是否全链路 trace；是否 OTel 兼容；能否接客户自有观测 | 只写“trace 用于排障”，不写兼容性           |
| 8   | MCP / OpenAPI 是否标准方式；有无连接器清单           | 写“按标准协议接入”                         |
| 9   | 检索时权限过滤是否已实现                             | 写“检索必须带权限过滤”作为设计原则         |
| 10  | 长期记忆的保留 / 删除策略                            | 写“短期 / 长期分开，策略在方案中定义”      |
| 11  | 有无可脱敏的规格卡 / 评测报告 / 上线检查清单样例     | 只用结构示意，不放假截图                   |
| 12  | 等保 / ISO / 信创；可公开的 P95 / 成功率 / SLA       | 不写                                       |

**自托管离线模型口径（必须逐项确认，不得合并成一句“支持离线”）**

- SaaS：不承诺离线模型；模型调用发生在托管服务内。
- 专属实例：按项目评估；模型能否离线取决于所选模型与客户环境。
- 自托管：可以；具体模型与硬件要求按项目确认。
- 若 owner 无法确认某一档，保留“按项目评估 / 按方案确认”，不要写“全部可离线”。

## 4. 法务、运营主体与备案占位

生产构建不得出现占位标记。逐项通过环境变量注入，或在缺失时使用中性措辞 / 整项隐藏。

| 环境变量                    | 当前缺失时的行为                | owner 提供             |
| --------------------------- | ------------------------------- | ---------------------- |
| `PUBLIC_OPERATOR_NAME`      | 法务页回退为 `Seqtura AI`       | 运营主体全称           |
| `PUBLIC_REGISTERED_ADDRESS` | 省略注册地址条款                | 注册地址               |
| `PUBLIC_SITE_DOMAIN`        | 省略官网域名                    | 官网域名               |
| `PUBLIC_LAUNCH_DATE`        | 生效日期使用构建默认值          | 上线日期（YYYY-MM-DD） |
| `PUBLIC_LEGAL_UPDATED_AT`   | 回退到上线日期                  | 法务最后更新日期       |
| `PUBLIC_OPERATOR_LOCATION`  | 回退为“运营主体所在地”          | 运营主体所在地         |
| `PUBLIC_EMAIL_PROVIDER`     | 回退为“境内企业邮箱 / 邮件服务” | 邮件服务商             |
| `PUBLIC_HOSTING_PROVIDER`   | 回退为“站点托管服务商”          | 托管服务商             |
| `PUBLIC_HOSTING_LOCATION`   | 省略托管所在地                  | 托管所在地             |
| `PUBLIC_ICP_NUMBER`         | 页脚不显示 ICP 项               | ICP 备案号             |
| `PUBLIC_PSB_NUMBER`         | 页脚不显示公安备案项            | 公安备案号             |
| `PUBLIC_PRIVACY_VERSION`    | 默认 `1.0`                      | 隐私政策版本号         |

同时确认：

- [ ] ICP / 公安备案缺失时整项隐藏，不显示“待补”或空链接。
- [ ] `PUBLIC_SHOW_PLACEHOLDERS=false`；预览占位标记不会进入生产。
- [ ] 隐私政策有生效日期、最后更新、版本号与目录锚点。
- [ ] 隐私政策先于表单收集上线。
- [ ] 服务条款明确“内容不构成报价或承诺”。
- [ ] 法务审核建议完成；未审核不阻塞，但 owner 需确认内容。

## 5. 真实通道与凭证

当前仓库只用占位地址与测试桩，生产凭证必须由 owner 注入。

- [ ] `hello@seqtura.ai` 可收信、有人负责回复；联系页“提交后联系”的说明与实际一致。
- [ ] `privacy@seqtura.ai` 可收信；隐私权利请求有处理人。
- [ ] 飞书机器人 webhook 与签名密钥已配置（`FEISHU_WEBHOOK_URL`、`FEISHU_WEBHOOK_SECRET`）。
- [ ] 微信二维码已上传或配置（`PUBLIC_WECHAT_QR`），移动端可打开。
- [ ] 境内邮件服务凭证已配置：`EMAIL_PROVIDER=smtp` + `SMTP_*`、`CONTACT_TO_EMAIL`、`CONTACT_FROM_EMAIL`。
- [ ] 发信域名 SPF / DKIM / DMARC 已配置并通过验证。
- [ ] 生产提交一次真实测试线索：飞书或邮件至少一路成功；两路都检查；失败时页面显示邮件兜底。
- [ ] 密钥只放在服务端环境变量；没有任何 secret 进入 `PUBLIC_*`。
- [ ] 若表单端点与静态站不同域：`PUBLIC_CONTACT_ENDPOINT` 指向境内端点，CSP `connect-src` 与 CORS 白名单同步放行。

## 6. 表单合规

- [ ] 表单字段、校验、投递语义与环境变量契约未改动；真实凭证替换不需要改端点。
- [ ] 表单端点与邮件通道在中华人民共和国境内；静态站可境外。
- [ ] 静态托管商访问日志的存储地域已确认；必要时由法务确认隐私政策对应条款。
- [ ] 表单数据只进飞书与邮箱；不建数据库、CRM 或队列。
- [ ] 不接访问统计、Cookie、Cookie 横幅、A/B 测试。
- [ ] 同意勾选默认不勾选，链接到隐私政策并在新标签打开；提交 payload 带 `consent`、`consentAt`、`privacyVersion`。
- [ ] 预览环境保持 `FORM_MODE=test`（或 `off`）；生产 `FORM_MODE=live` 仅在凭证就绪后设置。
- [ ] 生产限流由宿主 WAF 或共享 KV 执行；仓库内的内存限流只作为本地回退。
- [ ] `FORM_MODE=off` 时返回 503 并显示邮件兜底；`live` 两路失败返回 502。

## 7. 占位哨兵

- [ ] `pnpm check:sentinels` 通过。脚本只扫描 `dist/client/**/*.{html,js,css}`，不扫描 `dist/server`（框架注释可能含 `example`）。
- [ ] 生产构建不含 `【`、`待补`、`占位`、`example`。
- [ ] 页面正文、脚本、样式、页脚备案条均无占位字符串。
- [ ] CI 在 build 后运行哨兵扫描，命中即失败。

## 8. 托管、安全头、缓存与 SEO

### 8.1 部署形态

- 静态产物：`dist/client`，可部署到任意静态托管。
- 动态端点：`dist/server/entry.mjs`（Node standalone）或独立的境内运行时；`POST /api/contact` 是唯一动态路由。
- 安全头与缓存规则随仓库走：`public/_headers`，构建后复制到 `dist/client/_headers`。
- **注意**：Astro Node preview 会自己服务 HTML 与 API，不会把 `_headers` 当作中间件应用；预览环境中 HTML 没有 HSTS / CSP 等头是预期行为。正式部署必须由静态托管或反向代理应用这些头。不要用预览响应证明安全头已生效。

### 8.2 必须核对的响应头

| 范围                                                  | Header                                     | 期望值                                                                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全站                                                  | `Strict-Transport-Security`                | `max-age=31536000; includeSubDomains; preload`                                                                                                                                   |
| 全站                                                  | `X-Content-Type-Options`                   | `nosniff`                                                                                                                                                                        |
| 全站                                                  | `Referrer-Policy`                          | `strict-origin-when-cross-origin`                                                                                                                                                |
| 全站                                                  | `Permissions-Policy`                       | `camera=(), microphone=(), geolocation=()`                                                                                                                                       |
| 全站                                                  | `Content-Security-Policy`                  | `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| HTML                                                  | `Cache-Control`                            | `public, max-age=0, must-revalidate`                                                                                                                                             |
| `/_astro/*`                                           | `Cache-Control`                            | `public, max-age=31536000, immutable`                                                                                                                                            |
| `/sitemap-index.xml`、`/sitemap-0.xml`、`/robots.txt` | `Cache-Control`                            | `public, max-age=3600`                                                                                                                                                           |
| `/api/contact`                                        | `X-Content-Type-Options` / `Cache-Control` | `nosniff` / `no-store`（端点自身已设置）                                                                                                                                         |

- Cloudflare Pages / Netlify：直接读取发布根目录的 `_headers`（源文件为 `public/_headers`，构建后复制到 `dist/client/_headers`）。
- 自建 Nginx / Caddy / 其他反向代理：在代理层注入同一组头；不要只依赖 `_headers` 文件。
- 若宿主注入第三方脚本，按实际域名放宽 CSP，并重新跑 Lighthouse 与 CSP 检查。

### 8.3 上线后验证命令

```bash
# HTML 安全头与短缓存
curl -sSI https://seqtura.ai/ \
  | grep -Ei 'strict-transport-security|content-security-policy|x-content-type-options|referrer-policy|permissions-policy|cache-control'

# 带哈希静态资源的一年 immutable 缓存
asset=$(curl -s https://seqtura.ai/ | grep -o '/_astro/[^"]*\.css' | head -1)
curl -sSI "https://seqtura.ai$asset" | grep -i cache-control

# sitemap / robots 短缓存
curl -sSI https://seqtura.ai/sitemap-index.xml | grep -i cache-control
curl -sSI https://seqtura.ai/robots.txt | grep -i cache-control

# 联系端点自身头（无效请求应为 400，且带 nosniff / no-store）
curl -sS -D - -o /dev/null -X POST https://seqtura.ai/api/contact \
  -H 'content-type: application/json' -H 'origin: https://seqtura.ai' --data '{}'
```

### 8.4 托管与 SEO 检查

- [ ] 自定义域 + HTTPS 正常；apex ↔ www 301 到主域。
- [ ] PR 预览环境可访问；生产部署有历史与回滚。
- [ ] 环境变量 / secret 通过宿主注入，不提交到仓库。
- [ ] 访问日志已开启；日志地域已由 owner / 法务确认。
- [ ] sitemap 恰好包含 7 个可索引页面，404 不在 sitemap。
- [ ] `robots.txt` 指向 `/sitemap-index.xml`。
- [ ] 每页 canonical 指向自身；404 `noindex`；法务两页 `index, follow`。
- [ ] 每页 OG / Twitter 使用 1200×630 的 `/og-default.png`；社交预览调试器检查通过。
- [ ] JSON-LD 包含 `Organization` + `WebSite`；`lang="zh-CN"`。
- [ ] 链接检查通过：`pnpm check:links`。

## 9. 视觉、可访问性与人工检查

自动化已覆盖：

- [ ] `pnpm test` 全绿，包括 320 / 390 / 768 / 1024 / 1440 无页面级横向溢出。
- [ ] 200% 缩放近似测试通过（720px CSS 视口，无横向溢出，主内容与表单可用）。
- [ ] axe 扫描 7 个页面无 `serious` / `critical`；扫描在 `prefers-reduced-motion: reduce` 下运行，避免入场动画的半透明中间态被误判为低对比度。
- [ ] 跳过链接、可见焦点、键盘导航、键盘完成表单、移动菜单、代码面板左右键、流程图示意的可访问名称。
- [ ] 装饰元素 `aria-hidden`，导航有 `aria-label`，图表有可访问名称 / 描述。
- [ ] Lighthouse Accessibility / Best Practices / SEO 均为 100；Performance 只记录，不设门槛。

上线前人工过一遍：

- [ ] 浏览器 200% 缩放：导航、表单、法务目录、架构图仍可用。
- [ ] 仅键盘：Tab 到跳过链接 → 主内容；打开/关闭移动菜单；切换代码面板；完成表单提交与错误摘要。
- [ ] 读屏（VoiceOver / NVDA）：页头导航名称、当前页、主内容、图表名称与描述、表单标签与错误、成功态、页脚法务条。
- [ ] `prefers-reduced-motion`：入场、模糊与位移动画关闭。
- [ ] OG 预览：标题、描述、1200×630 图片正常。
- [ ] 五档断点目视验收：无页面级横向滚动；代码面板与阶段胶囊只在自身内部滚动。

## 10. 法务审核

- [ ] 隐私政策：收集字段、用途、存储地点、保存期限、权利与响应时限、Cookie / 统计声明、境内闭环与境外静态站说明。
- [ ] 服务条款：内容不构成报价或承诺、知识产权、使用规则、免责、适用法律。
- [ ] 两页均有生效日期、最后更新、版本号；隐私政策目录锚点可用。
- [ ] 运营主体、地址、域名、服务商、所在地、备案号已替换或按缺失规则隐藏。
- [ ] 建议法务审核；未审核不阻塞发布，但 owner 在下方签字确认内容。

## 11. Go / No-Go 签字

| 项目                           | 负责人 | 日期 | 证据 / 备注 |
| ------------------------------ | ------ | ---- | ----------- |
| 四条交付承诺                   |        |      |             |
| 流程周期与角色                 |        |      |             |
| 架构 12 项事实                 |        |      |             |
| 法务占位与备案                 |        |      |             |
| 真实通道与凭证                 |        |      |             |
| 表单合规与真实投递             |        |      |             |
| 哨兵扫描                       |        |      |             |
| 安全头 / 缓存 / HTTPS          |        |      |             |
| SEO / sitemap / OG             |        |      |             |
| 视觉 / 键盘 / 读屏 / 200% 缩放 |        |      |             |
| Lighthouse 三类 100            |        |      |             |
| 法务内容确认                   |        |      |             |

全部确认后，按正常 PR 流程合并到 `main`。合并前确认 `quality` CI job 全绿，且 `main` 分支保护仍要求该 job；本仓库不通过代码修改分支保护设置。
