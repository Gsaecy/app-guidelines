/* ==========================================================================
   data.js — single source of truth for every number, term and rule on the site.
   Edit here, the whole page re-renders. Numbers marked ⚠️ are project
   conventions, everything else is taken from the platform documentation.
   ========================================================================== */

window.DATA = {
  meta: {
    version: "1.0.0",
    updated: "2026-11-16",
  },

  /* ------------------------------------------------------------ 快速决策 */
  decision: [
    ["卡片圆角", "16–20pt ⚠️", "12dp（medium）/ 16dp（large）", "8px（浮层/容器）"],
    ["按钮圆角", "6–12pt ⚠️（CTA 可胶囊）", "胶囊或 8dp", "4px"],
    ["窗口圆角", "10–12pt（系统）", "—", "8px（贴边/最大化 0）"],
    ["正文默认字号", "iOS 17pt / macOS 13pt", "14sp / 16sp", "14px"],
    ["最小字号", "iOS 11pt / macOS 10pt", "11sp", "12px（Regular）/ 14px（Semibold）"],
    ["最小热区", "44×44pt", "48×48dp", "32×32px（鼠标）/ 40px（触控）⚠️"],
    ["图标网格", "SF Symbols（可变）", "24dp / 2dp 描边", "20px 画板 / 1.5px"],
    ["间距栅格", "4pt 基准 ⚠️", "8dp（4dp 半格）", "4px"],
    ["标准缓动", "弹簧为主", "cubic-bezier(0.2, 0, 0, 1)", "cubic-bezier(0, 0, 0, 1)"],
    ["标准时长", "0.25–0.4s", "200–300ms（emphasized 500ms）", "167 / 250 / 333ms"],
  ],

  /* ------------------------------------------------------------ 圆角 */
  radiusTiers: {
    win: {
      title: "Windows 11（官方只有三档）",
      rows: [
        ["8px", "顶层容器：窗口、Flyout、Dialog、MenuFlyout、TeachingTip"],
        ["4px", "页内元素：Button、CheckBox、ComboBox、TextBox、ListView 背板、ProgressBar、ScrollBar、Slider、ToolTip"],
        ["0px", "直角相接（SplitButton 两段）、窗口吸附 / 最大化"],
      ],
      note: "全局资源：ControlCornerRadius（默认 4）、OverlayCornerRadius（默认 8）。",
    },
    apple: {
      title: "Apple（系统控件隐含值，非公开硬标准 ⚠️）",
      rows: [
        ["6–8pt", "小控件：push button、segmented control 内段"],
        ["10–12pt", "普通窗口、弹窗"],
        ["10–14pt", "表单行、列表分组"],
        ["16–22pt", "卡片、模态面板、大圆角卡片"],
        ["≥ 高度 / 2", "胶囊按钮（主要 CTA）"],
      ],
      note: "同一页面最多 3 种圆角；嵌套遵循「外大内小」，差 ≥ 4px。",
    },
    m3: {
      title: "Material 3 形状刻度",
      rows: [
        ["none · 0", "全宽列表"],
        ["extra-small · 4dp", "小控件"],
        ["small · 8dp", "Chip、输入框"],
        ["medium · 12dp", "卡片、Dialog"],
        ["large · 16dp", "大卡片"],
        ["extra-large · 28dp", "底部抽屉、大容器"],
      ],
      note: "形状刻度与组件状态绑定，不要自创中间值。",
    },
  },
  radiusDemo: [
    { px: 4, use: "Windows 控件" },
    { px: 8, use: "Windows 容器 / 小按钮" },
    { px: 10, use: "列表行 / Apple 小控件" },
    { px: 12, use: "Material 卡片" },
    { px: 14, use: "表单卡片" },
    { px: 18, use: "内容卡片" },
    { px: 20, use: "面板 / 弹窗" },
    { px: 24, use: "Hero / 大面板" },
    { px: 999, use: "胶囊 CTA" },
  ],

  /* ------------------------------------------------------------ 间距 */
  spacingScale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  spacingUse: [
    ["图标 ↔ 文字", "6–8"],
    ["图标按钮内图标 ↔ 边", "6–8"],
    ["控件水平内边距", "12–16（小）/ 20–24（大按钮）"],
    ["表单行高", "40（Win）/ 44（iOS）/ 56（M3）"],
    ["卡片内边距", "12–16（紧凑）/ 20–24（宽松）"],
    ["卡片之间", "16（网格）/ 12（密集列表）"],
    ["区块之间", "24–32"],
    ["页面左右边距", "16（移动）/ 20–24（平板）/ 24–32（桌面）"],
    ["页面上下边距", "16–24（标题区）/ 24–32（底部）"],
  ],

  /* ------------------------------------------------------------ 字号 */
  typeApple: [
    ["Large Title", "34pt", "41pt", "Bold"],
    ["Title 1", "28pt", "34pt", "Regular"],
    ["Title 2", "22pt", "28pt", "Regular"],
    ["Title 3", "20pt", "25pt", "Regular"],
    ["Headline", "17pt", "22pt", "Semibold"],
    ["Body", "17pt", "22pt", "Regular"],
    ["Callout", "16pt", "21pt", "Regular"],
    ["Subhead", "15pt", "20pt", "Regular"],
    ["Footnote", "13pt", "18pt", "Regular"],
    ["Caption 1", "12pt", "16pt", "Regular"],
    ["Caption 2", "11pt", "13pt", "Regular"],
  ],
  typeM3: [
    ["Display Large", "57", "64"],
    ["Display Medium", "45", "52"],
    ["Display Small", "36", "44"],
    ["Headline Large", "32", "40"],
    ["Headline Medium", "28", "36"],
    ["Headline Small", "24", "32"],
    ["Title Large", "22", "28"],
    ["Title Medium", "16", "24"],
    ["Title Small", "14", "20"],
    ["Body Large", "16", "24"],
    ["Body Medium", "14", "20"],
    ["Body Small", "12", "16"],
    ["Label Large", "14", "20"],
    ["Label Medium", "12", "16"],
    ["Label Small", "11", "16"],
  ],
  typeDesktop: [
    ["页面主标题", 30, 700, "1.2", "标题：一屏只有一个"],
    ["区块标题", 20, 600, "1.3", "分节头"],
    ["卡片标题", 16, 600, "1.35", "可单行省略"],
    ["正文", 14, 400, "1.5", "默认阅读字号"],
    ["辅助文字", 13, 400, "1.45", "说明、时间、计数"],
    ["元信息", 11, 500, "1.3", "徽标、角标"],
  ],

  /* ------------------------------------------------------------ 图标 */
  iconSystems: [
    ["SF Symbols（Apple）", "可变，随字号", "与字重联动", "光学对齐、圆角端点；SF Symbols 6 起支持动画"],
    ["Material Symbols", "24dp", "2dp", "4dp 安全内边距；可变字重/填充"],
    ["Fluent System Icons（Win）", "20px（16/24/28/32/48）", "1.5px", "2px 内边距；MIT"],
    ["Feather / Lucide（Web）", "24px", "2px", "圆角端点、统一 24 网格；MIT"],
  ],
  iconRules: [
    "尺寸只用 16 / 20 / 24 / 28，不要出现 17、23 这类中间值。",
    "图标与文字基线居中；光学居中比数学居中更准。",
    "图标按钮热区 ≥ 32×32（鼠标）/ 44–48（触控）。",
    "同组图标同源、同描边、同端点，不混用实心与线性。",
    "描边随尺寸缩放：24px→2px，16px→1.5px ⚠️。",
    "纯装饰图标 aria-hidden，语义图标必须有可访问名称。",
  ],
  icons: [
    ["home", "M3 10.5 12 3l9 7.5V21H3z"],
    ["search", "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4.2-4.2"],
    ["heart", "M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 7a4 4 0 0 1 7 3.7C19 15.6 12 20 12 20z"],
    ["settings", "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.2.7z"],
    ["download", "M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"],
    ["image", "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4"],
    ["grid", "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
    ["play", "M8 5v14l11-7z"],
    ["star", "M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"],
    ["trash", "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"],
    ["user", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6"],
    ["chevron", "M9 6l6 6-6 6"],
  ],

  /* ------------------------------------------------------------ 控件 */
  controls: [
    ["主按钮高", "44–50", "40（最小 36）", "32 / 40", "32 / 40"],
    ["次按钮高", "28–32", "36", "32", "26 / 32"],
    ["小按钮 / chip", "22–26", "32", "24–28", "22 / 26"],
    ["输入框高", "44", "56", "32", "32–38"],
    ["触控热区", "44×44", "48×48", "40×40", "32×32（鼠标）"],
    ["按钮水平内边距", "16–20", "24", "12", "15–24"],
    ["标题栏高度", "52（macOS 工具栏）", "64（TopAppBar）", "48（标准）/ 32（紧凑）", "50"],
  ],
  componentSpecs: [
    {
      name: "按钮 Button",
      en: "Button",
      rules: ["一个区域只有一个主按钮", "文字必须完整包住，溢出即不合格", "悬停 / 按压 / 焦点 / 禁用 四态齐全", "最小宽度 ≥ 64px，避免文字紧贴边框"],
    },
    {
      name: "输入框 Text Field",
      en: "Input / Text Field",
      rules: ["始终配 label，placeholder 不替代 label", "聚焦态边框变强调色 + 3px 光晕", "错误态用图标 + 文案，不只靠红色", "单行 32–44px，多行最小 3 行高"],
    },
    {
      name: "复选框 / 开关",
      en: "Checkbox / Switch",
      rules: ["多选 → 复选框；即时生效 → 开关", "开关不要配「保存」按钮", "点击区域扩大到整行（含标签）", "切换动画 120–180ms"],
    },
    {
      name: "导航栏 Navigation",
      en: "Navigation Bar / Sidebar",
      rules: ["一级入口 3–7 个，超过就分组", "当前位置必须有选中态（填充或指示条）", "移动端底部标签 ≤ 5 个", "桌面侧栏宽度 216–280px"],
    },
    {
      name: "下拉菜单 Dropdown",
      en: "Dropdown / Select",
      rules: ["选项 ≤ 12 个用下拉，更多用搜索", "展开层用 8px 圆角 + 层级 3 阴影", "键盘 ↑↓ / Enter / Esc 必须可用", "选中项打勾，不只变色"],
    },
    {
      name: "面包屑 Breadcrumb",
      en: "Breadcrumb",
      rules: ["只在 3 层以上出现", "最后一项是当前页，不可点", "分隔符统一（/ 或 ›）", "过长中间项折叠为 …"],
    },
    {
      name: "卡片 Card",
      en: "Card",
      rules: ["一张卡只表达一件事", "圆角 12–20，内边距 16–24", "悬停抬升 ≤ 3px，阴影 ≤ 层级 2", "整卡可点时不要在内嵌第二个主操作"],
    },
    {
      name: "进度条 Progress",
      en: "Progress Bar",
      rules: ["< 1s 不显示进度", "未知时长用循环态，不要假装百分比", "进度只增不减，避免回退造成焦虑", "完成态 400ms 内切换为结果"],
    },
    {
      name: "模态框 Modal",
      en: "Modal / Dialog",
      rules: ["只用于必须打断的决策", "宽度 360–560，主操作在右", "遮罩 α 0.32–0.5 + 背景模糊可选", "Esc 关闭，焦点锁定在框内"],
    },
    {
      name: "工具提示 Tooltip",
      en: "Tooltip",
      rules: ["只放一句话，≤ 60 字", "延迟 300–500ms 出现", "不承载可交互内容", "触屏用长按替代悬停"],
    },
    {
      name: "用户行为召唤 CTA",
      en: "Call to Action",
      rules: ["文案用动词开头：立即购买 / 开始试用", "颜色对比 ≥ 4.5:1", "同屏只保留一个高频 CTA", "位置在视口首屏内或滚动末端"],
    },
    {
      name: "分段控件 Segmented",
      en: "Segmented Control",
      rules: ["2–5 个互斥选项", "选中项用实底 + 阴影，不用边框", "高度 28–32，圆角跟随容器", "切换即时生效，不加确认"],
    },
  ],

  /* ------------------------------------------------------------ 颜色 */
  colors: [
    ["强调色 Accent", "#0071E3", "主按钮、链接、选中态"],
    ["强调色（深色）", "#0A84FF", "深色模式下的强调色"],
    ["iOS systemBlue", "#007AFF", "iOS 系统蓝"],
    ["M3 默认 primary", "#6750A4", "Material 3 种子色默认结果"],
    ["Win11 accent", "#0067C0", "Windows 默认主题色"],
    ["页面底", "#F5F5F7", "浅色背景"],
    ["卡片底", "#FFFFFF", "内容容器"],
    ["次级底", "#EDEDF0", "分组、轨道、禁用底"],
    ["主文字", "#1D1D1F", "正文与标题"],
    ["成功", "#34C759", "完成、正向"],
    ["警告", "#FF9F0A", "风险提示"],
    ["危险", "#FF453A", "删除、错误"],
  ],

  /* ------------------------------------------------------------ 材质 */
  materials: [
    ["Liquid Glass", "Apple 2025+", "可折射背景的液态玻璃，随滚动出现 scroll edge effect", "只用于控件层，内容层保持实色"],
    ["Vibrancy", "Apple", "背景色透到文字与图标", "配合 NSVisualEffectView；对比度要复核"],
    ["Acrylic", "Windows", "半透明模糊 + 噪点 + 色调", "blur 30–60px，tint α 0.5–0.7，仅浮层/侧栏"],
    ["Mica", "Windows 11", "取桌面壁纸着色，不模糊内容", "主窗口背景，性能友好"],
    ["Backdrop Blur", "Web / 通用", "背景模糊", "12–24px，注意 GPU 开销"],
    ["Noise / Grain", "通用", "细噪点去塑料感", "α 0.02–0.10，叠加模式 overlay/soft-light"],
  ],

  /* ------------------------------------------------------------ 阴影 */
  elevation: [
    [0, "页面底、平铺列表", 0, 0, 0],
    [1, "卡片（静止）", 2, 6, 0.06],
    [2, "卡片（悬停）", 6, 14, 0.1],
    [3, "弹窗 / 菜单", 12, 24, 0.16],
    [4, "模态面板", 18, 40, 0.22],
  ],

  /* ------------------------------------------------------------ 动效 */
  motion: [
    ["悬停 / 按压", "120–180ms", "ease-out", "只改颜色/缩放，位移 ≤ 2px"],
    ["展开 / 收起", "200–250ms", "cubic-bezier(0.2, 0, 0, 1)", "高度动画用 clip 或 scale，避免 layout 抖动"],
    ["页面切换", "240–320ms", "emphasized（M3 500ms）", "进入快、退出更快"],
    ["主题切换", "180–250ms", "linear", "避免中间态闪烁"],
    ["骨架 / 加载循环", "1000–1400ms", "linear", "与真实加载节奏一致"],
    ["弹簧回弹", "—", "stiffness 300–500 / damping 25–35 ⚠️", "用于拖拽回位、翻转"],
  ],
  motionRules: [
    "阈值：< 100ms 视为瞬时，> 400ms 会被认为卡（进度类除外）。",
    "动画不阻塞输入：交互反馈必须在 100ms 内出现。",
    "必须尊重 reduce motion：去掉位移与缩放，只保留淡入淡出。",
    "同一次交互只用一个方向的动画，避免来回弹跳。",
  ],

  /* ------------------------------------------------------------ 无障碍 */
  a11y: [
    "正文对比度 ≥ 4.5:1，大字号（≥ 24px 或 ≥ 18.66px Bold）≥ 3:1",
    "非文本（图标、边框、焦点环）≥ 3:1",
    "交互元素有可见焦点环：2px，偏移 2px",
    "热区 ≥ 32×32（鼠标）/ 44×44（触控）",
    "文字放大 200% 不破版、不截断关键信息",
    "不依赖颜色单独传达状态（配图标或文字）",
    "关键操作可撤销，破坏性操作二次确认",
    "支持 Tab 顺序、Esc 关闭、Enter 确认",
    "图片有 alt，装饰图 aria-hidden",
    "尊重 prefers-reduced-motion 与系统对比度设置",
  ],

  /* ------------------------------------------------------------ 页面结构 */
  pages: [
    ["启动图标", "App Icon", "点击启动应用的图标，需覆盖多场景尺寸（桌面、商店、通知）。"],
    ["应用市场展示页", "Store Listing", "下载前让用户了解功能的页面，承担转化，截图与文案要有主次。"],
    ["启动页（闪屏）", "Splash Screen", "启动加载时显示，通常只有 Logo + slogan 或一张主视觉，停留 ≤ 2s。"],
    ["广告页", "Interstitial Ad", "启动页前后的运营/广告页，必须可跳过，避免阻断主流程。"],
    ["引导页", "Onboarding", "首次打开介绍核心功能，只出现一次；版本更新可展示新功能。"],
    ["首页", "Home", "进入应用默认页面，决定首屏信息密度与主 CTA 位置。"],
    ["一级页面", "Top-level Page", "通过底部标签或侧栏直接到达的页面，数量控制在 3–5 个。"],
    ["二级页面", "Secondary Page", "从一级页面进入、可一步返回的页面，如聊天、详情。"],
    ["注册登录页", "Sign In / Sign Up", "账号注册登录，优先第三方登录，表单字段最小化。"],
    ["个人主页 / 我的", "Profile", "个人信息与订单、收藏、优惠券等资产入口。"],
    ["菜单导航页", "Menu / Category", "以分类栏目为主的导航页，通常就是首页的一种形态。"],
    ["搜索页", "Search", "输入与结果页，可带推荐、历史与广告位。"],
    ["设置页", "Settings", "修改应用偏好，分组呈现，危险操作放最底部。"],
    ["详情页", "Detail", "展示单个对象的完整信息，主操作固定或吸底。"],
    ["关于我们", "About", "版本、功能说明、公司信息、联系方式与版权声明。"],
    ["意见反馈", "Feedback", "收集问题与建议，尽量预填环境信息减少输入。"],
  ],

  /* ------------------------------------------------------------ 30 术语 */
  terms: [
    {
      cat: "基础名词",
      items: [
        ["UI", "User Interface", "用户界面。通过布局、导航与视觉元素让产品可读可用。"],
        ["UX", "User Experience", "用户体验。覆盖使用前中后的整体感受，不止界面。"],
        ["GUI", "Graphical User Interface", "图形用户界面。用窗口、图标、按钮替代命令行。"],
        ["设计系统", "Design System", "统一的规范 + 组件库，保证一致性与协作效率。"],
        ["栅格系统", "Grid System", "把页面切成等宽列与行，保证布局秩序与响应式适配。"],
        ["像素", "PX / Pixel", "屏幕显示的最小单位，决定清晰度与切图精度。"],
        ["视觉层次", "Visual Hierarchy", "用大小、颜色、位置区分主次，引导注意力顺序。"],
        ["情绪板", "Mood Board", "用图片、色彩、字体拼出风格方向，统一团队审美预期。"],
      ],
    },
    {
      cat: "界面元素",
      items: [
        ["按钮", "Button", "触发操作的基础控件，需有明确主次与四态反馈。"],
        ["输入框", "Input / Text Field", "接收文本输入，需 label、占位符与聚焦/错误态。"],
        ["图标", "Icon", "高度抽象的图形符号，需可辨识、同源同风格。"],
        ["导航栏", "Navigation Bar", "顶部、底部或侧边的页面切换入口，层级要扁平清晰。"],
        ["下拉菜单", "Dropdown Menu", "点击展开选项列表，注意遮挡与选项间距。"],
        ["面包屑", "Breadcrumb", "显示当前位置路径，支持逐级返回。"],
        ["复选框", "Checkbox", "多选控件，勾选状态要有明确视觉与动画反馈。"],
        ["卡片", "Card", "把相关信息与操作聚合在一个容器里，靠阴影或描边分层。"],
        ["进度条", "Progress Bar", "表达任务完成度，需要实时更新与明确终点。"],
        ["模态框", "Modal / Dialog", "打断式弹窗，必须处理才能返回，需半透明遮罩。"],
        ["工具提示", "Tooltip", "悬停/长按出现的短说明，只放一句话。"],
        ["用户行为召唤", "CTA (Call to Action)", "引导用户完成关键动作的按钮或链接，要醒目且文案直接。"],
      ],
    },
    {
      cat: "流程与方法",
      items: [
        ["可访问性", "Accessibility / a11y", "让障碍用户也能感知与操作，含对比度、键盘、读屏。"],
        ["响应式设计", "Responsive Design", "同一套布局随屏幕尺寸流式变化。"],
        ["自适应设计", "Adaptive Design", "为不同设备加载预定义的独立布局。"],
        ["A/B 测试", "A/B Testing", "把用户随机分组对比两个版本，用数据决策。"],
        ["5 秒法则", "Five-Second Rule", "用户应在 5 秒内看懂页面主旨与下一步动作。"],
        ["自动布局", "Auto Layout", "用约束与关系描述布局，随容器变化自动重排。"],
        ["切图", "Asset Export / Slicing", "把设计元素导出为开发可用的独立资源并优化体积。"],
        ["可用性测试", "Usability Testing", "观察真实用户完成任务，发现界面障碍。"],
        ["视觉一致性", "Visual Consistency", "全产品统一颜色、字体、图标、间距与控件样式。"],
        ["设计走查", "Design Review", "设计与研发共同逐页检查，提前消除实现偏差。"],
      ],
    },
  ],

  /* ------------------------------------------------------------ 特效术语 */
  effects: [
    {
      cat: "材质 / 光学",
      items: [
        ["液态玻璃", "Liquid Glass", "Apple 2025 材质，可折射背景并随滚动产生边缘效果。"],
        ["毛玻璃 / 磨砂玻璃", "Frosted Glass / Blur", "背景模糊，最通用的浮层材质。"],
        ["亚克力", "Acrylic", "Windows 半透明 + 噪点 + 色调，适合侧栏与浮层。"],
        ["云母", "Mica", "Windows 11 取桌面壁纸着色，不模糊内容。"],
        ["活力", "Vibrancy", "背景色透到前景文字与图标。"],
        ["边缘高光", "Rim Light / Edge Highlight", "1px 亮边制造厚度感。"],
        ["镜面高光", "Specular Highlight", "跟随指针移动的高光点。"],
        ["折射", "Refraction", "玻璃扭曲其后的背景。"],
        ["色散", "Chromatic Dispersion", "边缘出现彩色分离。"],
        ["噪点", "Noise / Grain", "细颗粒纹理，去塑料感。"],
        ["渐变遮罩", "Gradient Scrim / Veil", "图上盖渐变，保证文字可读。"],
        ["滚动边缘效果", "Scroll Edge Effect", "内容滚到工具栏下方渐隐。"],
      ],
    },
    {
      cat: "动效 / 过渡",
      items: [
        ["缓动", "Easing", "速度随时间变化的曲线。"],
        ["强调曲线", "Emphasized Easing", "Material 3 主曲线，长距离位移更自然。"],
        ["弹簧动画", "Spring Animation", "基于刚度/阻尼的物理回弹。"],
        ["交错", "Stagger", "元素按序延迟入场，形成节奏。"],
        ["视差", "Parallax", "前后景不同速度位移，制造纵深。"],
        ["共享元素转场", "Shared Element Transition", "跨页面复用同一元素，保持连续感。"],
        ["英雄动画", "Hero Animation", "列表项放大为详情页主视觉。"],
        ["交叉淡入", "Cross-dissolve", "两层叠化切换。"],
        ["橡皮筋", "Rubber Banding", "越界拖拽的阻尼回弹。"],
        ["涟漪", "Ripple", "点击处扩散的水波反馈。"],
        ["磁吸", "Magnetic Snap", "靠近对齐点自动吸附。"],
        ["骨架屏", "Skeleton Loading", "用结构占位替代转圈。"],
        ["肯·伯恩斯", "Ken Burns", "图片缓慢推拉平移，壁纸常用。"],
      ],
    },
    {
      cat: "粒子 / 程序化",
      items: [
        ["粒子系统", "Particle System", "大量小元素按规则运动，如雪、萤火。"],
        ["实例化渲染", "GPU Instancing", "一次 draw call 渲染上万同源粒子。"],
        ["流场", "Flow Field", "用噪声场驱动粒子方向，形成流体感。"],
        ["位移映射", "Displacement Mapping", "用纹理改变几何形变。"],
        ["反应扩散", "Reaction–Diffusion", "生成有机斑纹与生长纹理。"],
        ["元球", "Metaball", "形状相互融合的水滴/生命球效果。"],
        ["光线步进", "Raymarching", "体积云、雾、抽象光线。"],
        ["有向距离场", "SDF (Signed Distance Field)", "用距离函数描述形状，描边平滑。"],
        ["焦散", "Caustics", "水下光斑与折射光纹。"],
        ["体积光", "Volumetric Light / God Rays", "可见光束穿透场景。"],
        ["泛光", "Bloom", "高亮区域向外溢出光晕。"],
        ["景深", "Depth of Field", "按距离虚化前后景。"],
        ["散景", "Bokeh", "失焦形成圆形光斑。"],
        ["暗角", "Vignette", "四角压暗聚焦中心。"],
        ["色调映射", "Tone Mapping", "HDR 映射到屏幕可显示范围。"],
        ["色差", "Chromatic Aberration", "镜头边缘的彩色错位。"],
      ],
    },
    {
      cat: "壁纸 / 生物运动",
      items: [
        ["卡兰吉式游动", "Carangiform Locomotion", "鲹科鱼类：身体后 1/3 摆动推进。"],
        ["行进波", "Traveling Wave", "正弦波沿身体向后传播。"],
        ["波数", "Wave Number", "身体上完整波的数量。"],
        ["摆幅包络", "Amplitude Envelope", "头部接近 0、尾部最大的幅度分布。"],
        ["相位滞后", "Phase Lag", "尾部动作晚于头部，形成 S 形。"],
        ["尾流", "Wake / Vortex Shedding", "尾鳍脱落的涡流，提供推力。"],
        ["3D 互动壁纸", "3D Interactive Wallpaper", "随鼠标/陀螺仪响应的实时 3D 场景。"],
        ["动态壁纸", "Dynamic / Live Wallpaper", "视频或序列帧类壁纸。"],
        ["视差壁纸", "Parallax Wallpaper", "多层图层随指针位移。"],
      ],
    },
  ],

  /* ------------------------------------------------------------ 令牌 */
  tokens: [
    ["Accent", "#0071E3 / #0A84FF", "强调色（浅/深）", true],
    ["Bg0", "#F5F5F7", "页面底", true],
    ["Bg1", "#FFFFFF", "卡片底", true],
    ["Bg2", "#EDEDF0", "次级底", true],
    ["TextPrimary", "black α .88", "主要文字", false],
    ["TextSecondary", "black α .55", "次要文字", false],
    ["TextTertiary", "black α .35", "三级文字", false],
    ["RadiusControl", "8", "控件", false],
    ["RadiusRow", "10", "列表行", false],
    ["RadiusCard", "18", "内容卡片", false],
    ["RadiusPanel", "20", "面板/弹窗", false],
    ["RadiusHero", "22", "首屏主视觉", false],
    ["TitleBarHeight", "50", "标题栏", false],
    ["SidebarRowHeight", "40", "导航行高", false],
    ["CardThumbHeight", "148", "卡片图高", false],
    ["FontPage", "30", "页面标题", false],
    ["FontSection", "20", "区块标题", false],
    ["FontHeadline", "16", "卡片标题", false],
    ["FontBody", "14", "正文", false],
    ["FontCallout", "13", "辅助", false],
    ["FontCaption", "12", "说明", false],
    ["FontCaption2", "11", "元信息", false],
    ["MsHover", "180", "悬停时长", false],
    ["MsPage", "240", "页面切换", false],
  ],

  /* ------------------------------------------------------------ 自检 */
  checklist: [
    {
      title: "布局",
      items: [
        "间距都是 4 的倍数，层级用倍数区分（4/8/16/24/32）",
        "圆角 ≤ 3 种，满足「外大内小」",
        "首屏能看到标题 + 主视觉 + 至少一行内容",
        "最小窗口宽度下无重叠、无横向滚动、无文字溢出",
      ],
    },
    {
      title: "文字",
      items: [
        "正文 ≥ 12px（Windows）/ 11pt（iOS）/ 10pt（macOS）",
        "一页 ≤ 2 个字重、≤ 3 个字号档",
        "标题不与区块标题重复",
        "长文本有省略号或换行策略",
      ],
    },
    {
      title: "控件",
      items: [
        "按钮文字完整包在按钮内（溢出 = 不合格）",
        "图标按钮热区 ≥ 32×32（鼠标）/ 44（触控）",
        "同组图标同源、同描边、同端点",
        "悬停 / 按压 / 禁用 / 焦点 四态齐全",
      ],
    },
    {
      title: "颜色与材质",
      items: [
        "对比度达标（正文 4.5:1，大字 3:1）",
        "材质只用于浮层，内容层用实色",
        "深色模式无遗漏的硬编码颜色",
      ],
    },
    {
      title: "动效",
      items: [
        "时长 120–320ms（进度类除外）",
        "尊重 reduce motion",
        "动画不阻塞输入",
      ],
    },
    {
      title: "性能（列表页必查）",
      items: [
        "100+ 项列表不一次性解码全部图片（分批 + 缓存）",
        "列表重建前判断「数据是否真的变了」",
        "滚动时 UI 线程可控（无掉帧、无未响应）",
      ],
    },
  ],

  /* ------------------------------------------------------------ 来源 */
  sources: [
    ["Apple HIG — Layout", "https://developer.apple.com/design/human-interface-guidelines/layout"],
    ["Apple HIG — Typography", "https://developer.apple.com/design/human-interface-guidelines/typography"],
    ["Apple HIG — Materials", "https://developer.apple.com/design/human-interface-guidelines/materials"],
    ["Apple HIG — Color", "https://developer.apple.com/design/human-interface-guidelines/color"],
    ["Material 3 — Shape", "https://m3.material.io/styles/shape/overview-principles"],
    ["Material 3 — Type scale", "https://m3.material.io/styles/typography/type-scale-tokens"],
    ["Material 3 — Spacing", "https://m3.material.io/foundations/layout/understanding-layout/spacing"],
    ["Windows 11 — Geometry (8px/4px)", "https://learn.microsoft.com/windows/apps/design/signature-experiences/geometry"],
    ["Windows 11 — Typography", "https://learn.microsoft.com/windows/apps/design/signature-experiences/typography"],
    ["Fluent 2 Design System", "https://fluent2.microsoft.design/"],
    ["WCAG 2.2 — Contrast minimum", "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"],
    ["SF Symbols", "https://developer.apple.com/sf-symbols/"],
    ["Material Symbols", "https://fonts.google.com/icons"],
    ["Fluent System Icons", "https://github.com/microsoft/fluentui-system-icons"],
    ["Lucide Icons", "https://lucide.dev/"],
  ],
};
