# 平台数值对照（platforms.md）

## 圆角

| 平台 | 窗口/浮层 | 页内控件 | 其他 |
|---|---|---|---|
| Apple | 10–12pt | 6–8pt | 卡片 16–22；胶囊 ≥ 高度/2 |
| Material 3 | 12dp（medium） | 8dp（small） | 大卡片 16dp；抽屉 28dp |
| Windows 11 | 8px | 4px | 直角相接/最大化 0 |

嵌套：外 16 → 内 ≤ 12 → 再内 ≤ 8；相邻差 ≥ 4px；一页 ≤ 3 种圆角。

## 字号

| 平台 | 正文 | 最小 | 备注 |
|---|---|---|---|
| iOS | 17pt | 11pt | 动态字号，避免 Light |
| macOS | 13pt | 10pt | 桌面密度高 |
| Material 3 | 14sp / 16sp | 11sp | 字阶 15 级 |
| Windows 11 | 14px | 12px | 一律 sentence case |

Windows 官方字阶：Caption 12/16 · Body 14/20 · Body Strong 14/20 semibold · Body Large 18/24 · Subtitle 20/28 semibold · Title 28/36 · Title Large 40/52 · Display 68/92。

## 间距与控件

| 项 | Apple | M3 | Windows |
|---|---|---|---|
| 基准栅格 | 4pt | 8dp（4 半格） | 4px |
| 主按钮高 | 44–50 | 40（最小 36） | 32/40 |
| 次按钮高 | 28–32 | 36 | 32 |
| 输入框高 | 44 | 56 | 32 |
| 热区 | 44×44 | 48×48 | 40×40（鼠标 32） |
| 水平内边距 | 16–20 | 24 | 12 |

## 图标

| 体系 | 画板 | 描边 |
|---|---|---|
| SF Symbols | 可变 | 随字重 |
| Material Symbols | 24dp | 2dp |
| Fluent | 20px（16/24/28/32/48） | 1.5px |
| Lucide | 24px | 2px |

## 颜色

| 平台 | 主色 | 底 |
|---|---|---|
| Apple systemBlue | #007AFF / #0A84FF | #F5F5F7 / #000 |
| Apple 营销蓝 | #0071E3 | — |
| M3 primary | #6750A4（种子） | surface 由种子派生 |
| Windows accent | #0067C0（默认） | Mica/Acrylic |

状态派生：Hover 8% 前景叠加 · Pressed 12% · Selected 主色 12% · Disabled 容器 12% / 文字 38% · 分隔线 8%（深色 12% 白）。

## 动效

| 场景 | Apple | M3 | Windows |
|---|---|---|---|
| 悬停/按压 | 0.1–0.2s | 100–200ms | 83–167ms |
| 展开 | 0.25–0.35s | 200–300ms | 167–250ms |
| 页面切换 | 0.3–0.4s | emphasized 500ms | 250–333ms |
| 缓动 | 弹簧为主 | cubic-bezier(0.2,0,0,1) | cubic-bezier(0,0,0,1) |

弹簧经验：stiffness 300–500 / damping 25–35（iOS 用 response 0.3–0.5s、dampingFraction 0.7–0.9）。

## 平台陷阱

字号不通用（Win 14px ≈ iOS 15pt ≈ macOS 13pt）· 圆角语义不同 · 按钮高矮不同 · 桌面滚动条常驻 · Windows 用省略号截断 · sentence case · Windows 靠 1px 描边分层 · 中文字体回退改变字重行高 · 高 DPI 下 1px 会发虚 · 桌面必须支持右键菜单与键盘路径 · 必须设最小窗口尺寸。