---
name: app-design-spec
description: '**App 界面规范 SKILL** — 做任何 App / 桌面端 / 网页界面时先查这套规范：三大平台（Apple HIG、Material Design 3、Windows 11 Fluent）的圆角、间距栅格、字号与行高、图标网格与描边、控件尺寸与触控热区、颜色与对比度、材质（Liquid Glass / Acrylic / Mica / Vibrancy）、阴影层级、动效时长与缓动、无障碍要求，以及**特效专业术语中英对照**（材质光学 / 动效过渡 / 粒子程序化 / 壁纸专属）。含 MaiKer Windows 现有令牌映射表与「新页面自检清单」。USE FOR: 设计规范 / 圆角多大 / 间距用多少 / 字号行高 / 图标间距 / 按钮尺寸 / 触控热区 / 对比度 / 玻璃材质 / 阴影层级 / 动效时长 / 缓动曲线 / 这个特效叫什么 / 术语翻译 / UI 走查 / 界面自检 / 设计令牌 tokens。Triggers: 规范, 设计规范, HIG, Human Interface Guidelines, Material Design, Fluent, Win11 设计, 圆角, radius, 间距, spacing, 栅格, grid, 字号, 行高, type scale, 图标间距, icon grid, 触控热区, 44pt, 48dp, 对比度, contrast, liquid glass, acrylic, mica, vibrancy, elevation, 阴影, 缓动, easing, duration, 无障碍, a11y, 术语, glossary, 特效名称。'
---

# App 界面规范（跨平台设计标准速查 + 术语表）

> 用途：任何界面改动前先查本规范，避免"凭感觉"定圆角/字号/间距。
> 数值来源：Apple HIG、Material Design 3、Windows 11 / Fluent 2 官方文档（文末列链接）。
> 标 ⚠️ 的是经验值/项目约定，不是官方硬性规定。

---

## 0. 快速决策表（最常用的问题直接查这里）

| 问题 | Apple | Material 3 | Windows 11 |
|---|---|---|---|
| 卡片圆角 | 16–20pt ⚠️ | 12dp（medium）/ 16dp（large） | 8px（浮层/容器） |
| 按钮圆角 | 6–12pt ⚠️（CTA 可胶囊） | 胶囊或 8dp | **4px** |
| 窗口圆角 | 10–12pt（系统） | — | **8px**（贴边/最大化 0） |
| 正文默认字号 | iOS 17pt / macOS 13pt | 14sp / 16sp | **14px** |
| 最小字号 | iOS 11pt / macOS 10pt | 11sp | 12px（Regular）/ 14px（Semibold） |
| 最小热区 | **44×44pt** | **48×48dp** | 32×32px（鼠标），触控 40px ⚠️ |
| 图标网格 | SF Symbols（可变） | 24dp，2dp 描边 | 20px 画板 |
| 间距栅格 | 4pt 基准 ⚠️ | **8dp**（4dp 半格） | **4px** |
| 标准缓动 | 弹簧为主 | `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(0, 0, 0, 1)` |
| 标准时长 | 0.25–0.4s | 200–300ms（emphasized 500ms） | 167 / 250 / 333ms |

---

## 1. 圆角（Corner Radius）

### 1.1 平台硬性值

**Windows 11（官方明确，只有三档）**
| 值 | 用途 |
|---|---|
| **8px** | 顶层容器：窗口、Flyout、Dialog、MenuFlyout、TeachingTip |
| **4px** | 页内元素：Button、CheckBox、ComboBox、TextBox、ListView 背板、ProgressBar、ScrollBar、Slider、ToolTip |
| **0px** | 直角相接（SplitButton 两段）、窗口吸附/最大化时 |

> 全局资源：`ControlCornerRadius`（默认 4）、`OverlayCornerRadius`（默认 8）。

**Apple（系统控件隐含值，非公开硬标准 ⚠️）**
| 值 | 用途 |
|---|---|
| 10–12pt | 普通窗口、弹窗 |
| 6–8pt | 小控件（push button、segmented control 内段） |
| 10–14pt | 表单行、列表分组 |
| 16–22pt | 卡片、模态面板、大圆角卡片 |
| ≥ 高度/2 | 胶囊按钮（主要 CTA） |

**Material 3 形状刻度**
| Token | 值 | 用途 |
|---|---|---|
| none | 0 | 全宽列表 |
| extra-small | 4dp | 小控件 |
| small | 8dp | Chip、输入框 |
| medium | 12dp | 卡片、Dialog |
| large | 16dp | 大卡片 |
| extra-large | 28dp | 底部抽屉、大容器 |

### 1.2 嵌套规则（三平台通用）
- **外大内小**：容器 16 ➜ 内部 ≤ 12 ➜ 再内部 ≤ 8。
- 圆角差建议 ≥ 4px，否则看起来"没对齐"。
- 同层元素圆角必须统一；同一页面最多 3 种圆角。

---

## 2. 间距与栅格

### 2.1 基准栅格
| 平台 | 基准 | 说明 |
|---|---|---|
| Apple | 4pt（以 8pt 步进为主 ⚠️） | 布局边距常用 16/20 |
| Material 3 | **8dp**，允许 4dp 半格 | 组件内 16dp，屏幕边 16dp |
| Windows 11 | **4px** | 控件间 4/8，区块 12/16/24 |

### 2.2 常用间距表（可直接套用）
| 场景 | 值 |
|---|---|
| 图标 ↔ 文字 | 6–8px |
| 图标按钮内图标 ↔ 边 | 6–8px |
| 控件水平内边距 | 12–16（小）/ 20–24（大按钮） |
| 表单行高 | 40（Win）/ 44（iOS）/ 56（M3） |
| 卡片内边距 | 12–16（紧凑）/ 20–24（宽松） |
| 卡片之间 | 16（网格）/ 12（密集列表） |
| 区块之间 | 24–32 |
| 页面左右边距 | 16（移动）/ 20–24（平板）/ 24–32（桌面） |
| 页面上下边距 | 16–24（标题区）/ 24–32（底部） |

> 硬规则：同一页面所有间距必须是 4 的倍数；不同层级用倍数关系（4/8/16/24/32）建立层次。

---

## 3. 字号、字重、行高

### 3.1 平台字号（官方）
- **Apple**：iOS 默认 17pt、最小 11pt；macOS 默认 13pt、最小 10pt；避免 Light 及更细字重。
- **Windows 11**：正文 **14px Regular**、标题 **14px+ Semibold**；**12px Regular 是下限**；一律 **sentence case**（不要 Title Case / 全大写）；截断优先省略号。

### 3.2 Material 3 字阶（sp / 行高）
| 角色 | 字号 | 行高 |
|---|---|---|
| Display Large / Medium / Small | 57 / 45 / 36 | 64 / 52 / 44 |
| Headline Large / Medium / Small | 32 / 28 / 24 | 40 / 36 / 32 |
| Title Large / Medium / Small | 22 / 16 / 14 | 28 / 24 / 20 |
| Body Large / Medium / Small | 16 / 14 / 12 | 24 / 20 / 16 |
| Label Large / Medium / Small | 14 / 12 / 11 | 20 / 16 / 16 |

### 3.3 桌面 App 实用字阶（项目通用 ⚠️）
| 用途 | 字号 | 字重 | 行高 |
|---|---|---|---|
| 页面主标题 | 28–34 | Bold | 1.2 |
| 区块标题 | 18–20 | Semibold | 1.3 |
| 卡片标题 | 15–16 | Semibold | 1.35 |
| 正文 | 13–14 | Regular | 1.45–1.5 |
| 辅助文字 | 12 | Regular | 1.4 |
| 计数/元信息 | 11 | Medium | 1.3 |

**行高规则**：`行高 ≈ 字号 × 1.4~1.5`（大标题 1.2，小字 1.5）。中文再 +0.05 ⚠️。

---

## 4. 图标

### 4.1 网格与描边
| 体系 | 画板 | 描边 | 说明 |
|---|---|---|---|
| SF Symbols（Apple） | 可变，随字号 | 与字重联动 | 光学对齐、圆角端点 |
| Material Symbols | **24dp** | **2dp** | 4dp 安全内边距 |
| Fluent System Icons（Win） | **20px**（另有 16/24/28/32/48） | **1.5px** | 2px 内边距，MIT |
| Feather（本项目在用） | **24px** | **2px** | 圆角端点，MIT |

### 4.2 使用规范
- 尺寸档位只用 **16 / 20 / 24 / 28**，不要出现 17、23 这种值。
- 图标与文字**基线居中**对齐。
- 图标按钮热区 ≥ 32×32（鼠标）/ 40–44（触控）。
- 同组图标必须同源、同描边、同端点；**不要混用实心与线性**。
- 描边随尺寸缩放：24px→2px，16px→1.5px ⚠️。

---

## 5. 控件尺寸

| 控件 | Apple | Material 3 | Windows 11 | 项目约定 ⚠️ |
|---|---|---|---|---|
| 主按钮高 | 44–50 | 40（最小 36） | 32 / 40 | 32 / 40 |
| 次按钮高 | 28–32 | 36 | 32 | 26 / 32 |
| 小按钮/chip | 22–26 | 32 | 24–28 | 22 / 26 |
| 输入框高 | 44 | 56 | 32 | 32–38 |
| 触控热区 | 44×44 | 48×48 | 40×40 | 32×32（鼠标） |
| 按钮水平内边距 | 16–20 | 24 | 12 | 15–24 |

**按钮文字**：必须完整包在按钮内（容器不够时省略号收尾，禁止溢出）。

---

## 6. 颜色与对比度

### 6.1 系统主色
| 平台 | 主色（浅/深） |
|---|---|
| Apple systemBlue | `#007AFF` / `#0A84FF` |
| Apple 强调蓝（网页/营销） | `#0071E3` |
| Material 3 primary | 由种子色生成，默认 `#6750A4` |
| Windows 11 accent | 用户主题色，默认 `#0067C0` |

### 6.2 中性色（Apple 风格最稳的一套 ⚠️）
| 语义 | 浅色 | 深色 |
|---|---|---|
| 页面底 | `#F5F5F7` | `#000000` / `#1C1C1E` |
| 卡片底 | `#FFFFFF` | `#1C1C1E` |
| 分隔线 | `rgba(0,0,0,.08)` | `rgba(255,255,255,.12)` |
| 主要文字 | `#1D1D1F` | `rgba(255,255,255,.95)` |
| 次要文字 | `rgba(0,0,0,.55)` | `rgba(255,255,255,.62)` |
| 三级文字 | `rgba(0,0,0,.35)` | `rgba(255,255,255,.40)` |

### 6.3 对比度硬指标（WCAG 2.2）
- 正文 **≥ 4.5:1**；大字号（≥18.66px Bold 或 ≥24px）**≥ 3:1**；
- 图标/边框等非文本 **≥ 3:1**；
- 不要用颜色作为唯一信息载体。

---

## 7. 材质（Material / Glass）

| 术语 | 平台 | 效果 | 参数建议 |
|---|---|---|---|
| **Liquid Glass** | Apple（2025+） | 控制层可折射背景的液态玻璃 + scroll edge effect | 只用于控件层 ⚠️ |
| **Vibrancy** | Apple | 背景透到文字/图标 | 配合 `NSVisualEffectView` |
| **Acrylic** | Windows | 半透明模糊 + 噪点 + 色调 | blur 30–60px，tint α0.5–0.7，仅浮层/侧栏 |
| **Mica** | Windows 11 | 桌面壁纸取样着色（不模糊内容） | 主窗口背景，性能友好 |
| **Backdrop Blur** | Web/通用 | 背景模糊 | 12–24px |
| **Noise / Grain** | 通用 | 细噪点去塑料感 | α 0.02–0.10 |

**层级规则**：材质只用于"临时/浮起"的层（弹窗、侧栏、工具栏）；正文内容用实色。

---

## 8. 阴影 / 层级（Elevation）

| 层级 | 用途 | 阴影（y / blur / alpha） |
|---|---|---|
| 0 | 页面底、平铺列表 | 无 |
| 1 | 卡片（静止） | 2 / 6 / 0.06 |
| 2 | 卡片（悬停） | 6 / 14 / 0.10 |
| 3 | 弹窗/菜单 | 12 / 24 / 0.16 |
| 4 | 模态面板 | 18 / 40 / 0.22 |

Apple 偏柔和+大扩散；Material 偏短距离多层叠加；Windows 偏"几乎无阴影 + 1px 描边"。

---

## 9. 动效

| 场景 | 时长 | 缓动 |
|---|---|---|
| 悬停/按压 | 120–180ms | ease-out |
| 展开/收起 | 200–250ms | `cubic-bezier(0.2, 0, 0, 1)` |
| 页面切换 | 240–320ms | emphasized（M3：500ms） |
| 主题切换 | 180–250ms | linear（避免闪烁） |
| 骨架/加载循环 | 1000–1400ms | linear |

- **弹簧**（Apple 首选）：stiffness 300–500 / damping 25–35 ⚠️，用于回弹、翻转。
- **必须支持 reduce motion**：去掉位移/缩放，只保留淡入淡出。
- 阈值：<100ms 视为瞬时；>400ms 觉得慢（进度类除外）。

---

## 10. 无障碍清单

- [ ] 正文对比度 ≥ 4.5:1，大字号 ≥ 3:1
- [ ] 交互元素有可见焦点环（2px，距元素 2px）
- [ ] 热区 ≥ 32×32（鼠标）/ 44×44（触控）
- [ ] 文字放大 200% 不破版
- [ ] 不依赖颜色传达状态
- [ ] 关键操作可确认或撤销
- [ ] 支持 Tab 顺序与 Esc 关闭
- [ ] 尊重 reduce motion

---

## 11. 特效专业术语表（中英对照）

### 11.1 材质 / 光学
| 中文 | 英文 | 说明 |
|---|---|---|
| 液态玻璃 | Liquid Glass | Apple 2025 材质，可折射背景 |
| 毛玻璃/磨砂玻璃 | Frosted Glass / Blur | 背景模糊 |
| 亚克力 | Acrylic | Windows 半透明 + 噪点 |
| 云母 | Mica | Windows 桌面取样着色 |
| 活力 | Vibrancy | 背景透色到前景文字/图标 |
| 边缘高光 | Rim Light / Edge Highlight | 1px 亮边制造厚度 |
| 镜面高光 | Specular Highlight | 跟随指针的高光点 |
| 折射 | Refraction | 玻璃扭曲背景 |
| 色散 | Chromatic Dispersion | 边缘彩边 |
| 噪点 | Noise / Grain | 细颗粒纹理 |
| 渐变遮罩 | Gradient Scrim / Veil | 图上盖渐变保证文字可读 |
| 滚动边缘效果 | Scroll Edge Effect | 内容滚到工具栏下方渐隐 |

### 11.2 动效 / 过渡
| 中文 | 英文 | 说明 |
|---|---|---|
| 缓动 | Easing | 速度曲线 |
| 强调曲线 | Emphasized Easing | M3 主曲线 |
| 弹簧动画 | Spring Animation | 物理回弹 |
| 交错 | Stagger | 元素依次入场 |
| 视差 | Parallax | 前后景不同速度 |
| 共享元素转场 | Shared Element Transition | 跨页复用元素 |
| 英雄动画 | Hero Animation | 列表→详情放大 |
| 交叉淡入 | Cross-dissolve | 叠化 |
| 橡皮筋 | Rubber Banding | 越界回弹 |
| 涟漪 | Ripple | 点击扩散反馈 |
| 磁吸 | Magnetic Snap | 靠近对齐点吸附 |
| 骨架屏 | Skeleton Loading | 结构占位 |
| 肯·伯恩斯 | Ken Burns | 图片缓慢推拉（壁纸常用） |

### 11.3 粒子 / 程序化图形
| 中文 | 英文 | 说明 |
|---|---|---|
| 粒子系统 | Particle System | 雪花/落叶/萤火 |
| 实例化渲染 | GPU Instancing | 上万粒子同屏 |
| 流场 | Flow Field | 噪声场驱动运动 |
| 位移映射 | Displacement Mapping | 纹理改形变 |
| 反应扩散 | Reaction–Diffusion | 有机纹理生成 |
| 元球 | Metaball | 融合水滴/生命球 |
| 光线步进 | Raymarching | 体积云/雾 |
| 有向距离场 | SDF (Signed Distance Field) | 平滑形状与描边 |
| 焦散 | Caustics | 水下光斑 |
| 体积光 | Volumetric Light / God Rays | 光束 |
| 泛光 | Bloom | 高光溢出 |
| 景深 | Depth of Field | 前后虚化 |
| 散景 | Bokeh | 圆形光斑虚化 |
| 暗角 | Vignette | 四周压暗 |
| 色调映射 | Tone Mapping | HDR→SDR |
| 色差 | Chromatic Aberration | 镜头彩边 |

### 11.4 壁纸 / 生物运动（本项目在用）
| 中文 | 英文 | 说明 |
|---|---|---|
| 卡兰吉式游动 | Carangiform Locomotion | 鲹科鱼：身体后 1/3 摆动 |
| 行进波 | Traveling Wave | 正弦波沿身体传播 |
| 波数 | Wave Number | 身体上完整波的数量 |
| 摆幅包络 | Amplitude Envelope | 头部 0 → 尾部最大 |
| 相位滞后 | Phase Lag | 尾部慢于头部 |
| 尾流 | Wake / Vortex Shedding | 尾鳍涡流 |
| 3D 互动壁纸 | 3D Interactive Wallpaper | 本项目互动壁纸 |
| 动态壁纸 | Dynamic / Live Wallpaper | 视频类 |
| 视差壁纸 | Parallax Wallpaper | 鼠标跟随位移 |

---

## 12. 本项目（MaiKer Windows）令牌映射

唯一真源：`Views/Mac/MacTheme.cs`（改这里，全站自动生效）。

| Token | 当前值 | 语义 |
|---|---|---|
| `Accent` | `#0071E3` / `#0A84FF`（深色） | 强调色 |
| `Bg0 / Bg1 / Bg2` | `#F5F5F7` / `#FFFFFF` / `#EDEDF0` | 页面底 / 卡片底 / 次级底 |
| `Sidebar0 / Sidebar1` | `#F2F2F7` / `#E9E9EE` | 侧栏渐变 |
| `TextPrimary / Secondary / Tertiary` | 黑 .88 / .55 / .35 | 文字层级 |
| `RadiusControl / Row / Search` | 8 / 10 / 10 | 控件圆角 |
| `RadiusCard / Panel / Hero` | 18 / 20 / 22 | 容器圆角 |
| `RadiusSettingsCard / EffectCard` | 14 / 18 | 表单 / 特效卡 |
| `TitleBarHeight` | 50 | 标题栏高度 |
| `SidebarRowHeight / EffectsRowHeight` | 40 / 36 | 导航行高 |
| `CardThumbHeight` | 148 | 卡片图高 |
| `FontPage / Section / Headline / Body / Callout / Caption / Caption2` | 30 / 20 / 16 / 14 / 13 / 12 / 11 | 字阶 |
| `MsHover / MsPress / MsPage / MsTheme` | 180 / 180 / 240 / 200 | 动效时长（ms） |

组件：`MacButton`（按钮）、`NavRow`（侧栏导航）、`GlassSurface`（材质/阴影）、`WallpaperCard`（卡片）、`CaptionButtons`（窗口按钮）。

---

## 13. 新页面 / 改版自检清单

**布局**
- [ ] 间距都是 4 的倍数，层级用倍数区分（4/8/16/24/32）
- [ ] 圆角 ≤ 3 种，满足「外大内小」
- [ ] 首屏能看到 标题 + 主视觉 + 至少一行内容
- [ ] 最小窗口宽度下无重叠、无横向滚动、无文字溢出

**文字**
- [ ] 正文 ≥ 12px（Windows）/ 11pt（iOS）/ 10pt（macOS）
- [ ] 一页 ≤ 2 个字重、≤ 3 个字号档
- [ ] 标题不与区块标题重复
- [ ] 长文本有省略号或换行策略

**控件**
- [ ] 按钮文字完整包在按钮内（溢出 = 不合格）
- [ ] 图标按钮热区 ≥ 32×32（鼠标）/ 44（触控）
- [ ] 同组图标同源、同描边、同端点
- [ ] 悬停/按压/禁用/焦点 四态齐全

**颜色与材质**
- [ ] 对比度达标（正文 4.5:1）
- [ ] 材质只用于浮层，内容层用实色
- [ ] 深色模式无遗漏的硬编码颜色

**动效**
- [ ] 时长 120–320ms（进度类除外）
- [ ] 尊重 reduce motion
- [ ] 动画不阻塞输入

**性能（列表类页面必查）**
- [ ] 100+ 项列表不一次性解码全部图片（分批 + 缓存）
- [ ] 列表重建判断「数据是否真的变了」
- [ ] 滚动时 UI 线程可控（无掉帧、无未响应）

---

## 14. 平台差异陷阱

1. **字号不通用**：Windows 14px ≈ iOS 15pt ≈ macOS 13pt。
2. **圆角语义不同**：Windows 只有 4/8 两档；Apple 更自由。
3. **按钮高矮**：Windows 32px 标准，Apple 44pt 起，别直接抄。
4. **热区**：鼠标 32 可接受，触控必须 44/48。
5. **截断**：Windows 推荐省略号；Apple 更常用渐隐。
6. **Casing**：Windows 一律 sentence case。
7. **阴影**：Windows 靠描边分层，重阴影会"不像系统应用"。

---

## 15. 来源

- Apple HIG — Layout：https://developer.apple.com/design/human-interface-guidelines/layout
- Apple HIG — Typography（默认/最小字号表）：https://developer.apple.com/design/human-interface-guidelines/typography
- Apple HIG — Materials / Liquid Glass：https://developer.apple.com/design/human-interface-guidelines/materials
- Material Design 3 — Shape：https://m3.material.io/styles/shape/overview-principles
- Material Design 3 — Typescale：https://m3.material.io/styles/typography/type-scale-tokens
- Material Design 3 — Layout/Spacing：https://m3.material.io/foundations/layout/understanding-layout/spacing
- Windows 11 — Geometry（8px/4px）：https://learn.microsoft.com/windows/apps/design/signature-experiences/geometry
- Windows 11 — Typography（14px/12px、sentence case）：https://learn.microsoft.com/windows/apps/design/signature-experiences/typography
- Fluent 2：https://fluent2.microsoft.design/
- WCAG 2.2 对比度：https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- SF Symbols：https://developer.apple.com/sf-symbols/
- Material Symbols：https://fonts.google.com/icons
- Fluent System Icons：https://github.com/microsoft/fluentui-system-icons
- Feather Icons：https://feathericons.com/

---

## 16. App 页面结构术语（沟通用标准名称）

> 与产品/设计沟通时用这套名称，90% 的成员都能听懂。

| 中文 | 英文 | 说明 |
|---|---|---|
| 启动图标 | App Icon | 点击启动应用，需覆盖桌面、商店、通知等场景尺寸 |
| 应用市场展示页 | Store Listing | 下载前的介绍页，承担转化，截图要有主次 |
| 启动页（闪屏） | Splash Screen | 加载时显示，Logo + slogan 或一张主视觉，停留 ≤ 2s |
| 广告页 | Interstitial Ad | 启动前后的运营/广告页，必须可跳过 |
| 引导页 | Onboarding | 首次打开的功能介绍，只出现一次；大版本可复用 |
| 首页 | Home | 默认落地页，决定首屏信息密度与主 CTA |
| 一级页面 | Top-level Page | 底部标签/侧栏直接到达，数量 3–5 个 |
| 二级页面 | Secondary Page | 从一级进入、一步可返回，如详情、聊天 |
| 注册登录页 | Sign In / Sign Up | 优先第三方登录，字段最小化 |
| 个人主页 / 我的 | Profile | 个人信息与订单、收藏、权益入口 |
| 菜单导航页 | Menu / Category | 以分类栏目为主，常与首页重合 |
| 搜索页 | Search | 输入 + 结果，可带历史与推荐 |
| 设置页 | Settings | 分组呈现，危险操作放最底部 |
| 详情页 | Detail | 单对象完整信息，主操作吸底或固定 |
| 关于我们 | About | 版本、功能、公司、联系方式、版权 |
| 意见反馈 | Feedback | 预填环境信息，减少用户输入 |

**层级判断**：能通过底部标签/侧栏直达 = 一级页面；从一级页面进入且一次返回可回到一级 = 二级页面。

---

## 17. UI 设计基础术语 30 条

### 17.1 基础名词

| 中文 | 英文 | 一句话 |
|---|---|---|
| 用户界面 | UI (User Interface) | 用户与产品交互的界面，管布局、导航与视觉 |
| 用户体验 | UX (User Experience) | 使用前中后的整体感受，范围大于 UI |
| 图形用户界面 | GUI | 用窗口/图标/按钮替代命令行 |
| 设计系统 | Design System | 规范 + 组件库，保证一致性与协作效率 |
| 栅格系统 | Grid System | 把页面切成等宽列行，保证布局秩序 |
| 像素 | PX | 屏幕最小显示单位 |
| 视觉层次 | Visual Hierarchy | 用大小/颜色/位置区分主次 |
| 情绪板 | Mood Board | 用图片、色彩、字体拼出风格方向 |

### 17.2 界面元素

| 中文 | 英文 | 一句话 |
|---|---|---|
| 按钮 | Button | 触发操作，需明确主次与四态 |
| 输入框 | Input / Text Field | 接收文本，需 label + 聚焦/错误态 |
| 图标 | Icon | 高度抽象的符号，需可辨识、同源同风格 |
| 导航栏 | Navigation Bar | 页面切换入口，层级扁平清晰 |
| 下拉菜单 | Dropdown / Select | 展开选项列表，注意遮挡与键盘操作 |
| 面包屑 | Breadcrumb | 显示位置路径，支持逐级返回 |
| 复选框 | Checkbox | 多选控件，勾选要有明确反馈 |
| 卡片 | Card | 聚合相关信息的容器，靠阴影/描边分层 |
| 进度条 | Progress Bar | 表达完成度，需实时更新与明确终点 |
| 模态框 | Modal / Dialog | 打断式弹窗，必须处理才能返回 |
| 工具提示 | Tooltip | 悬停/长按的一句短说明 |
| 用户行为召唤 | CTA (Call to Action) | 引导关键动作，文案动词开头、视觉突出 |

### 17.3 流程与方法

| 中文 | 英文 | 一句话 |
|---|---|---|
| 可访问性 | Accessibility / a11y | 让障碍用户也能感知与操作 |
| 响应式设计 | Responsive | 同一布局随屏幕流式变化 |
| 自适应设计 | Adaptive | 为不同设备加载预定义布局 |
| A/B 测试 | A/B Testing | 随机分组对比两版，用数据决策 |
| 5 秒法则 | Five-Second Rule | 5 秒内看懂主旨与下一步 |
| 自动布局 | Auto Layout | 用约束描述布局，随容器自动重排 |
| 切图 | Asset Export | 导出开发可用资源并优化体积 |
| 可用性测试 | Usability Testing | 观察真实用户完成任务找障碍 |
| 视觉一致性 | Visual Consistency | 全产品统一颜色/字体/图标/间距 |
| 设计走查 | Design Review | 设计与研发逐页核对实现偏差 |

---

## 18. 在线版（可视化 + 可交互）

- 站点：https://gsaecy.github.io/app-guidelines/
- 仓库：https://github.com/Gsaecy/app-guidelines
- 网页里的「材质实验室 / 动效实验室 / 效果实验室」可直接调参看效果；所有数值与本文件同源（`assets/data.js`）。
- 需要看具体效果参数时优先打开网页，比读文字描述更快。