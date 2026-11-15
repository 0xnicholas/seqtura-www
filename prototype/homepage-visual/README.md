# 首页视觉样张 v3：laravel.com 版式 + Laravel 红

一次性视觉探索，不是生产代码。要回答的问题：

> Seqtura 官网首页能否直接沿用 laravel.com 当前的版式骨架与视觉语法，并用 Laravel 红 `#F53003` 作为主强调色？

v2 被 owner 认为「与 laravel.com 参照差距较大」：自创的制图语言、深青强调色和偏技术面板的密度，压过了参照站本身的版式。v3 改为逐段对照 laravel.com 的布局，并直接使用它的红。**这一版不是 A/B/C 换色变体**，因为问题已经从「选哪种气质」收敛成「能不能贴住参照站」。

## 打开

```bash
open prototype/homepage-visual/index.html
```

或从仓库根目录起一个本地服务：

```bash
python3 -m http.server 8000
# http://localhost:8000/prototype/homepage-visual/index.html
```

截图参数 `?capture=1` 会隐藏左下角的 Prototype 标记，并停掉入场动画，方便截图。

## 截图

| 文件 | 用途 |
|---|---|
| `shots/seqtura-hero-1440.png` | 1440×1000 首屏 |
| `shots/seqtura-full-1440.png` | 1440 全页 |
| `shots/seqtura-mobile-390.png` | 390×844 移动首屏 |
| `shots/seqtura-mobile-full.png` | 390 移动全页 |

线上参考：<https://laravel.com/>（2026-11-15 实测）。对照时先看结构，再看颜色；两站的文案与产品内容完全不同。

## 与 laravel.com 的逐段对照

| laravel.com 的做法 | v3 的落法 |
|---|---|
| 64px sticky 导航：字标居左，导航居中偏左，右侧 CTA | 同一骨架；右侧是 `hello@seqtura.ai` + 红色「预约沟通」 |
| 分栏 Hero：左侧 746px 文案，右侧等距能力堆栈；H1 72/1.0，导语 20/28，按钮 48 高 | 左侧 620px 文案 + 右侧等距能力栈；H1 72/1.04（中文行高），导语 20/1.6，按钮 48 高 |
| 首屏底部 129px 客户 logo 带，1px 分隔、7px 红色刻度 | 同尺寸 proof strip：8 阶段 / 5 层 / 3 控制面 / 1 个主转化 |
| 居中 H2 60/1.0 + 20px 导语 | 居中 H2 60/1.08 + 20px 导语；上方红色 mono 小标 |
| 左文案 + 清单 + 次级按钮，右侧白色代码面板；面板上方胶囊、文件标签、14px mono | 同一结构；代码内容是 `delivery.yml` 的 8 阶段 / 3 个门禁，文件标签可切换 |
| 2×2 特性网格，1px 发丝线分隔，每格一个标题、正文、清单、次级按钮 | 同一结构；内容是 Discover–Optimize 四组 |
| 居中 H2 + bento：一张深色卡 + 多张白卡 | 居中 H2 + bento：架构平面图 + 深色 trace 卡 + 3 张控制面卡 |
| 居中 CTA：大标题 + 红按钮 + 红径向光晕 | 同一结构；「先聊一个具体场景。」 |
| 页脚多列 + 巨大红色字标收尾 | 四列页脚 + 巨大红色 `Seqtura` 字标 |
| 1280px 内容宽、80px 边距、24px 网格纹、1px 线、7px 刻度 | 同一套尺度；1440 视口下内容 1280 |
| 红色只出现在 CTA、刻度、字标与光晕 | 同一原则，另加少量红色 mono 小标与代码 key；小字红改用 `#C42602` |

## 颜色决定

- **主红：`#F53003`**，直接取自 laravel.com 的 `--color-laravel-red`。owner 在 2026-11-15 明确要求直接使用 Laravel 红，map 中「不挪用 Laravel 红色」的旧约束已同步改写。
- **小字红：`#C42602`**（Laravel 的 darkened 红）。白底小字用 `#F53003` 只有 3.96:1，达不到正文 AA；`#C42602` 用于红色 mono 小标、代码 key、页脚标语。
- **红色洗色**：`#FFE2DD` / `#FFF7F5`；径向光晕用 14–16% 透明度，静态不闪。
- **主按钮**：`#F53003` 底 + 白字。18px / 500 字重下对比度仍是 3.96:1，**达不到 WCAG AA 的普通文本标准**。这是「直接使用 Laravel 红」的代价。若要过 AA，有两条路：按钮底改用 `#C42602`（仍是 Laravel 红系），或把按钮文字提到 19px / 600 以进入大字号阈值。需要 owner 拍板。
- 不挪用：Laravel 字标与 L 图形、产品线色（Cloud / Forge / Vapor / Nightwatch / Nova 各自的色值）、Artisan / 社区语汇、Laracon 照片、Laravel 原版等距堆栈插画。v3 的能力栈是 Seqtura 自己的五层结构图。

## 中文排版结论

| 角色 | 桌面 | 移动 | 字重 |
|---|---|---|---|
| H1 | 72 / 1.04 / `-0.025em` | 40 / 1.12 | 400 |
| H2 | 60 / 1.08 / `-0.025em` | 31 / 1.16 | 400 |
| H3 | 32 / 1.25 | 24 / 1.3 | 500 |
| 导语 | 20 / 1.6 | 17 / 1.65 | 400 |
| 正文 | 16 / 1.7 | 16 / 1.7 | 400 |
| 代码 | 14 / 1.85 mono | 12 / 1.85 | 400 |

- 不照搬 Laravel 的 `-5%` 字距和 1.0 行高；中文会顶字、挤行。标题保留 400 字重以接近 Laravel 的气质，20–27px 的小标题改用 500。
- 字体栈走系统：macOS 是 SF Pro / PingFang SC，Windows 回退 Microsoft YaHei。没有打包 Instrument Sans；如果生产环境要完全复刻 Laravel 的 Latin 字形，需要自托管 Instrument Sans（OFL）与 IBM Plex Mono。
- 中文与 Latin 之间保留空格；标点用全角；段落用 `text-wrap: pretty`，标题用 `text-wrap: balance`。

## 移动端

- 导航：字标 + 汉堡；展开后是四项导航 + 全宽红色 CTA。
- Hero：居中，隐藏等距插画（laravel.com 移动端也隐藏）；按钮全宽、上下堆叠。
- Proof strip：首格通栏，其余 2×2。
- 方法论：居中标题 → 左文案 → 代码面板（横向滚动）→ 单列四组。
- 架构：平面图每层显示名称 + 描述，隐藏右侧 chips；trace 卡与三张控制面卡依次单列。
- CTA：按钮全宽；页脚两列，巨大字标降到 23vw。
- 已验证 320 / 390 / 768 / 1024 / 1440 五档，`scrollWidth === innerWidth`，无页面级横向溢出；代码面板与阶段胶囊内部可横向滚动。

## 交互

- 移动菜单：开合、点击链接关闭、Esc 关闭。
- 代码面板：`delivery.yml` / `gate-validate.md` 两个文件标签可切换，键盘左右键可切换。
- 入场：600ms 淡入上移；Hero 1000ms blur-up；`prefers-reduced-motion` 下全部关闭。
- `?capture=1`：停掉动画、显示全部内容、隐藏 Prototype 标记。

## 验证

- 用 Headless Chrome 157 实际渲染并截图：1440×1000、1024×900、768×900、390×844、320×700。
- 每个断点检查 `document.documentElement.scrollWidth` 与 `innerWidth` 相等。
- 交互实测：文件标签切换、移动菜单开合、`?capture=1` 的内容全显。
- 所有文案里的数字、trace、评测与架构均为**结构示意**，不是客户项目数据。

## 待 owner 决定

1. **方向确认**：这条「laravel.com 版式 + Laravel 红」的方向是否成立？成立就关闭 `#10`，把结论写进 map 的 Decisions so far，并作为首页视觉规格。
2. **红色对比度**：坚持 `#F53003` 原色（白字按钮 3.96:1），还是为了 AA 改用 `#C42602` 或加大按钮字号？
3. **Hero 主视觉**：等距能力栈是否保留？另一条路是把首屏右侧换成白色代码面板 / 产品截图，更接近「代码即产品证明」。
4. **页脚字标**：保留巨大的红色 `Seqtura`，还是换成更克制的页脚？v3 按 laravel.com 保留了。
5. **导航占位**：这是单页首页样张，`合作流程` 暂时落到联系 CTA；上线时应指向 `/process`。`hello@seqtura.ai` 是占位邮箱。

## 边界

- 这是首页视觉样张，不包含其他页面的实现，也不作为生产代码合并。
- 邮箱是明确标注的占位；飞书 / 微信二维码未放入样张。
- 导航中的「合作流程」在真实站点是独立页面；本样张只验证首页版式。
