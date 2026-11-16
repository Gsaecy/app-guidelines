# App Guidelines · APP UI 设计规范与效果参考

一页看完 **Apple HIG / Material Design 3 / Windows 11 Fluent** 三平台的设计规范，外加可交互的**效果实验室**和中英**术语表**。

> 在线浏览：<https://gsaecy.github.io/app-guidelines/>

![sections](https://img.shields.io/badge/sections-24-0071e3) ![deps](https://img.shields.io/badge/dependencies-0-34c759) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

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

## 目录结构

```
index.html                 页面骨架（每个 section 对应一个规范域）
assets/style.css           设计令牌 + 全部样式（浅/深色）
assets/data.js             唯一数据源：所有数值、术语、清单
assets/app.js              渲染表格 + 材质/动效/Canvas 实验室
skills/app-design-spec/    Agent Skill（与网页同源，供 AI 编码时直接查阅）
.github/workflows/pages.yml GitHub Pages 自动部署
```

**改内容只动 `assets/data.js`**：新增一条术语、改一个圆角值，刷新即可，不用碰 HTML。

## 部署

推送到 `main` 即触发 GitHub Actions 部署到 Pages（`Settings → Pages → Source: GitHub Actions`）。

## 数据来源

Apple Human Interface Guidelines、Material Design 3、Windows 11 / Fluent 2、WCAG 2.2 官方文档，详见页面「来源」章节。标 ⚠️ 的是项目经验值，不是平台硬性规定。

## 许可

MIT
