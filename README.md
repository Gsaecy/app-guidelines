# App Guidelines · APP UI 设计规范、原理、组件与测试

一套完整的 App UI 设计参考站与 Agent Skill：**规范速查 + 设计原理 + 组件画廊 + 测试工具**。

> 在线浏览：<https://gsaecy.github.io/app-guidelines/>

![pages](https://img.shields.io/badge/pages-7-0071e3) ![components](https://img.shields.io/badge/components-29-34c759) ![elements](https://img.shields.io/badge/elements-66-34c759) ![deps](https://img.shields.io/badge/dependencies-0-34c759) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

## 七个页面

| 页面 | 内容 |
|---|---|
| [规范速查](https://gsaecy.github.io/app-guidelines/) | 24 章：圆角 / 间距 / 布局断点 / 字号 / 图标 / 控件 / 颜色 / 状态 / 材质 / 阴影 / 动效 / 文案 / 页面结构 / 令牌 / 工具 / 性能 / 清单 / 陷阱 |
| [设计原理](https://gsaecy.github.io/app-guidelines/principles.html) | 格式塔 6 原则、13 条交互与认知定律，配 Fitts 靶场、Hick 反应、分块记忆三个实验 |
| [元素总览](https://gsaecy.github.io/app-guidelines/elements.html) | 7 大族 66 个界面元素：规范要点 / 效果参数 / 深查链接，附三大元素解剖与效果落点表 |
| [组件画廊](https://gsaecy.github.io/app-guidelines/components.html) | 29 个组件实时样例，可切换密度（32/40/48）与圆角（4/8/10），含状态对比 |
| [产品蓝图](https://gsaecy.github.io/app-guidelines/blueprint.html) | 12 个产品模块 × 9 个规范维度矩阵，Logo 构造/禁用示例、全平台图标尺寸、登录字段规范、48 项交付物清单 |
| [Logo 规范](https://gsaecy.github.io/app-guidelines/logo.html) | 6 种类型、几何比例、布尔切割实验台、光学修正、安全区与最小尺寸、响应式三形态、SVG 交付 |
| [测试工具](https://gsaecy.github.io/app-guidelines/testing.html) | 对比度检查、色盲模拟、热区检查、键盘可达性、响应式预览、可读性、12 题知识自测 |

## 包含什么

| 章节 | 内容 |
|---|---|
| 快速决策 | 卡片/按钮圆角、字号、热区、图标网格、缓动、时长，一眼查完 |
| 圆角 | Windows 三档（0/4/8）、Apple 嵌套规则、Material 形状刻度 + 可视化对比 |
| 间距与栅格 | 4px 刻度尺、9 类场景常用值、三平台栅格基准 |
| 布局与响应式 | 5 类窗口断点、窗口/侧栏/内容宽、密度模式、导航形态、安全区 |
| 字号 | 桌面实用字阶、Material 3 全套 type scale、Apple 动态字号表、Windows 11 官方字阶 |
| 图标 | SF Symbols / Material Symbols / Fluent / Lucide 网格与描边，24px 画板 + 安全区演示 |
| 控件与组件 | 按钮、输入框、开关、导航、下拉、面包屑、卡片、进度、模态、Tooltip、CTA、分段控件——全部可点 |
| 颜色 | 12 个语义色 + **实时 WCAG 对比度计算**，状态色派生规则，点击复制色值 |
| 状态与反馈 | 空/加载/错误/成功/禁用/进行中/离线 8 种状态的视觉、文案与禁止项 |
| 材质 | Liquid Glass / Vibrancy / Acrylic / Mica / Backdrop Blur / Noise，**可拖动指针、调参的材质实验室** |
| 阴影 | 5 级 elevation 参数 + 可直接复制的多层阴影配方 |
| 动效 | 缓动曲线可视化 + 时长滑杆 + 播放、交错、涟漪、骨架屏、Ken Burns、视差、M3 缓动令牌表 |
| 效果实验室 | 流场粒子 / 散景 / 焦散（Canvas 实时渲染），泛光、暗角、景深开关，鱼游行进波示意 |
| 文案规范 | 按钮/错误/破坏性操作/空状态写法、长度上限、Casing 规则、正反例 |
| 页面结构 | 16 类 App 页面术语（启动页、一级/二级页面、详情页 …） |
| 术语表 | 42 条设计术语 + 50 条特效术语，中英对照，支持搜索 |
| 设计令牌 | 本项目令牌表（颜色 / 圆角 / 字号 / 时长） |
| 工具集 | 对比度检查器、同心圆角计算器、阴影生成器、缓动曲线编辑器、tokens.json/css 导出 |
| 性能预算 | 10 项可量化指标 + 列表页 4.4GB→389MB 真实案例 + 测量工具 |
| 自检清单 | 6 组 21 条，勾选进度本地保存 |
| 平台差异 | 12 个跨平台陷阱（字号、圆角语义、Casing、高 DPI…） |
| 变更记录 | 版本化的规范变更，避免团队出现多个「版本」 |
| 来源 | 全部官方文档链接 |

另外：全站搜索（`Ctrl/⌘ + K`）、深浅色主题、打印样式（隐藏交互区，适合导出 PDF 走查）。

## 本地预览

零依赖、零构建，任何静态服务器都行：

```bash
# 任选其一
python -m http.server 8080
npx serve .
```

然后打开 <http://localhost:8080>。

> 直接双击 `index.html` 也能看，但 `fetch`/剪贴板等特性在 `file://` 下受限，建议起本地服务器。

## Skill（给 AI 编码时直接用）

`skills/app-design-spec/` 是配套的 Agent Skill，采用「主文件 + 按需加载的 references」结构：

```
skills/app-design-spec/
├── SKILL.md              # 快速决策表、圆角/间距/字号/图标/控件/颜色/材质/阴影/动效/无障碍 + 自检清单
└── references/
    ├── principles.md     # 格式塔、Fitts/Hick/Doherty、认知与记忆、原理→数值映射
    ├── components.md     # 29 个组件的尺寸/圆角/内边距/状态/常见错误
    ├── testing.md        # 7 项上线检查、WCAG 2.2 清单、性能预算
    ├── glossary.md       # 92 条中英术语 + 16 类页面结构
    ├── platforms.md      # Apple / M3 / Windows 数值对照
    ├── modules.md        # 12 模块 × 9 维度矩阵、Logo/图标/登录、交付物清单
    ├── elements.md       # 7 族 66 个元素的规范要点与效果参数
    └── logo.md           # Logo 类型/布尔切割/光学修正/安全区/交付
```

安装（用户级）：

```bash
cp -r skills/app-design-spec ~/.copilot/skills/
```

之后在任何会话里说「按 app-design-spec 走查这个页面」即可；改内容只改 `assets/data.js`（网站）与 `references/`（技能），两边同源。

## 目录结构

```
index.html                 规范速查（24 章，数据表 + 材质/动效/粒子实验室 + 工具集）
principles.html            设计原理（格式塔 + 13 条定律 + 3 个实验）
elements.html              元素总览（7 族 66 个元素的规范与效果索引）
components.html            组件画廊（29 个组件，密度/圆角/状态切换）
blueprint.html             产品蓝图（12 模块矩阵 + Logo/图标/登录规范 + 交付物）
logo.html                  Logo 规范（类型/布尔切割实验台/光学修正/安全区/交付）
testing.html               测试工具（7 个检查器 + 12 题自测）
assets/style.css           设计令牌 + 全部样式（浅/深色 + 打印）
assets/data.js             规范唯一数据源：所有数值、术语、清单、变更记录
assets/app.js              首页渲染 + 实验室 + 工具 + Ctrl/⌘K 搜索
assets/shell.js            共享：主题、Toast、复制、顶部导航高亮
assets/principles.js       定律卡片 + Fitts/Hick/分块实验
assets/elements.js         66 个元素的族分组、搜索与效果落点
assets/components.js       29 个组件样例与规格标注
assets/logo.js             Logo 布尔切割实验台、光学修正、响应式与清单
assets/testing.js          对比度/色盲/热区/键盘/响应式/可读性/自测
skills/app-design-spec/    Agent Skill（SKILL.md + references/）
.github/workflows/pages.yml GitHub Pages 自动部署
sitemap.xml / robots.txt    站点索引
```

**改内容只动 `assets/data.js`**：新增一条术语、改一个圆角值，刷新即可，不用碰 HTML。

## 部署

推送到 `main` 即触发 GitHub Actions 部署到 Pages（`Settings → Pages → Source: GitHub Actions`）。

## 数据来源

Apple Human Interface Guidelines、Material Design 3、Windows 11 / Fluent 2、WCAG 2.2 官方文档，详见页面「来源」章节。标 ⚠️ 的是项目经验值，不是平台硬性规定。

## 许可

MIT
