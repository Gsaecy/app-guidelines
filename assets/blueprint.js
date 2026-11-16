/* ==========================================================================
   blueprint.js — 12 product modules, spec matrix, icon sizes, login fields,
   deliverables checklist.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const MODULES = [
    {
      n: "01", name: "品牌与视觉基础", en: "Brand Foundation", stage: "brand",
      pages: ["Logo", "品牌色", "字体", "图形语言", "图标风格"],
      specs: [
        "Logo 构造网格、安全区、最小尺寸、深浅色与单色版本",
        "品牌色：主色 + 2 个辅助色 + 语义色（成功/警告/危险）",
        "字体栈：拉丁 + 中文 fallback，明确字重与字号阶梯",
        "图标体系：同源、同描边、同端点，尺寸 16/20/24/28",
        "图形语言：圆角、描边、透明度、插画风格",
        "禁用示例：拉伸、改色、旋转、低对比",
      ],
      nums: ["安全区 ≥ 0.5×标识高", "数字端 Logo ≥ 24px", "对比 ≥ 3:1", "图标描边 24px→2px"],
      mistakes: ["只给一张 PNG，没有矢量与多尺寸", "品牌色没有深浅两套，深色模式发光"],
      links: [{ t: "圆角", h: "index.html#radius" }, { t: "图标", h: "index.html#icons" }, { t: "颜色", h: "index.html#color" }],
    },
    {
      n: "02", name: "应用图标与商店素材", en: "App Icon & Store", stage: "brand",
      pages: ["应用图标", "商店展示页", "截图", "宣传图", "关键词"],
      specs: [
        "各平台图标尺寸与安全区一次出齐（见下方尺寸表）",
        "iOS 图标不可带 alpha、不可自带圆角（系统裁切）",
        "Android 自适应图标：108dp 画板、66dp 安全区",
        "Windows MSIX：44/150/310/宽图/商店 Logo/启动画面",
        "商店截图：首屏讲清价值，5–8 张，含深浅色",
        "宣传图与文案：一句话卖点 + 三条能力 + 价格锚点",
      ],
      nums: ["iOS 1024 商店图", "iPhone 180/120", "Android 108dp", "Win 44/150/310", "截图 ≥ 3 张"],
      mistakes: ["图标文字过多，缩到 44px 不可读", "截图直接贴界面，没有说明文案"],
      links: [{ t: "页面结构", h: "index.html#pages" }, { t: "文案", h: "index.html#copy" }],
    },
    {
      n: "03", name: "启动与首次体验", en: "Launch & Onboarding", stage: "onboard",
      pages: ["启动页/闪屏", "广告页", "引导页", "权限预请求", "空账号首屏"],
      specs: [
        "闪屏只做品牌露出，停留 ≤ 2s，不做阻塞式广告",
        "引导页 3–5 屏，每屏一个卖点 + 可跳过 + 进度指示",
        "权限请求前先给「预请求」说明收益，再调系统弹窗",
        "首次空账号要有示例内容或明确的第一步",
        "首启仅教 1 件事，其余用 tooltip 渐进披露",
      ],
      nums: ["闪屏 ≤ 2s", "引导 3–5 屏", "跳过按钮常驻", "首启 ≤ 2 步到主功能"],
      mistakes: ["启动即弹权限三连", "引导页不可跳过、无进度"],
      links: [{ t: "状态与反馈", h: "index.html#states" }, { t: "渐进披露", h: "principles.html#cognition" }],
    },
    {
      n: "04", name: "账户与身份", en: "Account & Auth", stage: "onboard",
      pages: ["登录", "注册", "验证码", "找回密码", "2FA", "注销账户"],
      specs: [
        "字段最少化：手机号或邮箱二选一，密码规则前置说明",
        "错误文案 = 发生了什么 + 怎么改，贴近字段",
        "第三方登录与「通过 Apple 登录」入口同等显著",
        "提交中禁用按钮 + spinner，防重复提交",
        "会话过期有明确提示与一键重登，不丢草稿",
        "注销 / 删除账户：二次确认 + 影响说明 + 冷静期",
      ],
      nums: ["密码 ≥ 8 位", "验证码 6 位 / 60s 重发", "错误行内提示", "登录按钮 40 高"],
      mistakes: ["错误只弹「登录失败」", "注销入口藏在三级菜单且无说明"],
      links: [{ t: "登录规范", h: "blueprint.html#login" }, { t: "文案", h: "index.html#copy" }],
    },
    {
      n: "05", name: "导航与信息架构", en: "Navigation & IA", stage: "core",
      pages: ["首页", "一级页面", "侧栏/标签栏", "搜索", "分类", "深链"],
      specs: [
        "一级入口 3–7 个，超过就分组；移动底部标签 ≤ 5",
        "当前位置必须有选中态（实底或指示条）",
        "搜索：输入即结果、历史、空结果有建议",
        "面包屑只在 3 层以上出现，末项不可点",
        "深链：每个核心页面有稳定 URL / URI 协议",
      ],
      nums: ["侧栏 216–280", "行高 40", "标签栏 ≤ 5", "搜索框 32–36"],
      mistakes: ["导航项随版本漂移", "选中态只改文字颜色"],
      links: [{ t: "布局断点", h: "index.html#layout" }, { t: "控件", h: "index.html#controls" }],
    },
    {
      n: "06", name: "内容浏览与列表", en: "Browse & Lists", stage: "core",
      pages: ["列表/网格", "卡片", "筛选排序", "分页/无限滚动", "批量选择", "空状态"],
      specs: [
        "卡片：一张卡一件事，标题 1 行、副信息 1–2 行",
        "筛选与排序分开，结果数量实时反馈",
        "分页 vs 无限滚动二选一，加载失败可重试",
        "批量选择进入明确模式，显示已选数量与退出方式",
        "空状态：说明现状 + 一个主操作",
      ],
      nums: ["卡片最小宽 240/160", "网格间距 16", "首屏图片 ≤ 12 张", "列表重建需 diff"],
      mistakes: ["299 张卡片一次性解码导致假死", "空状态只写「暂无数据」"],
      links: [{ t: "性能预算", h: "index.html#performance" }, { t: "状态", h: "index.html#states" }],
    },
    {
      n: "07", name: "详情与操作", en: "Detail & Actions", stage: "core",
      pages: ["详情页", "媒体查看器", "操作菜单", "分享", "编辑/新建"],
      specs: [
        "详情首屏：主视觉 + 标题 + 关键属性 + 主操作",
        "主操作吸底或固定，次操作进「更多」",
        "图片/视频查看器支持缩放、键盘左右切换、Esc 退出",
        "分享面板包含链接、图片与「复制链接」",
        "编辑态与阅读态明确区分，离开前提示未保存",
      ],
      nums: ["主按钮 40", "操作菜单行高 40", "图片最大宽 1120", "保存反馈 ≤ 200ms"],
      mistakes: ["详情页有 5 个同权重按钮", "编辑离开无提醒导致内容丢失"],
      links: [{ t: "组件画廊", h: "components.html" }, { t: "动效", h: "index.html#motion" }],
    },
    {
      n: "08", name: "商业化与交易", en: "Monetization", stage: "money",
      pages: ["定价页", "内购/订阅", "支付", "订单", "退款", "恢复购买", "兑换码", "试用"],
      specs: [
        "定价页：3 档以内，推荐档高亮，年付显示折算月价",
        "价格与权益必须在购买前完整可见，隐藏续费即违规",
        "支付状态机：待支付 / 处理中 / 成功 / 失败 / 已退款，每态有出口",
        "恢复购买、兑换码、试用入口都要有",
        "订单与发票可查、可退款，退款后权益同步回收",
        "失败文案给原因与替代支付方式，不留死路",
      ],
      nums: ["档位 ≤ 3", "试用 7 天", "订单可查 ≥ 12 个月", "按钮禁用防重复扣款"],
      mistakes: ["只写「¥xx/月」不写自动续费", "购买成功后无权益刷新"],
      links: [{ t: "文案", h: "index.html#copy" }, { t: "状态", h: "index.html#states" }],
    },
    {
      n: "09", name: "设置与账户管理", en: "Settings & Profile", stage: "money",
      pages: ["个人资料", "设置", "通知设置", "隐私", "数据导出/删除", "关于", "意见反馈"],
      specs: [
        "设置按主题分组（通用/外观/通知/隐私/关于），组内 ≤ 7 项",
        "开关即时生效，不配「保存」；破坏性操作置底并二次确认",
        "通知权限未开时给出系统设置跳转",
        "隐私页：收集了什么、为什么、如何删除",
        "关于页含版本号、许可、联系方式与版权",
        "反馈入口预填环境信息（版本/系统/日志 ID）",
      ],
      nums: ["行高 40/48", "分组标题 12px", "危险操作红色 + 确认"],
      mistakes: ["设置项命名用内部术语", "删除账户无入口"],
      links: [{ t: "文案", h: "index.html#copy" }, { t: "页面结构", h: "index.html#pages" }],
    },
    {
      n: "10", name: "系统集成", en: "System Integration", stage: "system",
      pages: ["托盘/菜单栏", "系统通知", "快捷键", "文件关联", "自动更新", "多窗口", "拖放"],
      specs: [
        "桌面端提供托盘/菜单栏常驻入口与「退出」",
        "通知可关闭、可分组，点击直达对应页面",
        "快捷键符合平台约定（⌘, 设置 / Ctrl+, 设置）",
        "文件关联与「用…打开」注册正确图标与类型",
        "自动更新：静默下载 + 重启提示，可查看更新日志",
        "多窗口与标签页状态独立，不共享滚动位置",
      ],
      nums: ["托盘点按 32×32", "更新检查 ≤ 24h", "快捷键 ≥ 2 组可自定义"],
      mistakes: ["关闭主窗口即退出且无托盘", "更新弹窗强制立即重启"],
      links: [{ t: "平台陷阱", h: "index.html#traps" }, { t: "组件", h: "components.html" }],
    },
    {
      n: "11", name: "状态、错误与恢复", en: "States & Recovery", stage: "system",
      pages: ["空/加载/错误", "离线", "同步冲突", "崩溃恢复", "重试策略"],
      specs: [
        "每个列表/表单都定义空、加载、错误、成功四态",
        "错误分级：字段级 / 表单级 / 页面级 / 全局网络级",
        "离线可用缓存内容，并标注「离线模式」",
        "同步冲突给「保留本地 / 保留云端 / 合并」三选一",
        "崩溃后重启恢复未保存内容",
        "重试带退避（1s/2s/4s），可手动取消",
      ],
      nums: ["Toast 2–4s", "重试 3 次退避", "骨架屏 > 1s 才出现", "错误不自动消失"],
      mistakes: ["所有错误都弹同一个「操作失败」", "离线直接白屏"],
      links: [{ t: "状态", h: "index.html#states" }, { t: "测试", h: "testing.html#contrast" }],
    },
    {
      n: "12", name: "无障碍、国际化与质量", en: "A11y, i18n & QA", stage: "system",
      pages: ["无障碍", "多语言", "主题", "性能", "埋点", "走查"],
      specs: [
        "对比度、焦点环、键盘顺序、读屏名称全覆盖",
        "文案外置，预留 30% 膨胀空间；支持 RTL 镜像",
        "日期/货币/单位按 locale 格式化，不硬编码",
        "深浅色与高对比模式都要走一遍",
        "性能预算写入验收（帧、启动、内存）",
        "关键路径埋点与 A/B 实验位预留",
      ],
      nums: ["正文 4.5:1", "焦点环 2px", "启动 ≤ 2s", "单帧 ≤ 16.7ms", "文案 +30%"],
      mistakes: ["只用颜色表达状态", "英文文案硬编码在布局里导致截断"],
      links: [{ t: "无障碍", h: "index.html#checklist" }, { t: "测试工具", h: "testing.html" }, { t: "性能", h: "index.html#performance" }],
    },
  ];

  const DIMS = ["视觉", "布局", "排版", "交互", "状态", "无障碍", "文案", "性能", "数据"];
  const MATRIX = {
    "01": ["●", "○", "●", "○", "○", "●", "○", "○", "—"],
    "02": ["●", "●", "●", "—", "—", "●", "●", "●", "○"],
    "03": ["●", "●", "●", "●", "●", "●", "●", "○", "○"],
    "04": ["●", "●", "○", "●", "●", "●", "●", "●", "●"],
    "05": ["●", "●", "●", "●", "●", "●", "○", "●", "○"],
    "06": ["●", "●", "●", "●", "●", "●", "○", "●", "●"],
    "07": ["●", "●", "●", "●", "●", "●", "●", "○", "○"],
    "08": ["●", "●", "○", "●", "●", "●", "●", "●", "●"],
    "09": ["○", "●", "●", "●", "●", "●", "●", "○", "○"],
    "10": ["○", "○", "○", "●", "●", "●", "●", "●", "○"],
    "11": ["●", "○", "○", "●", "●", "●", "●", "●", "●"],
    "12": ["●", "●", "●", "●", "●", "●", "●", "●", "●"],
  };

  const ICON_SIZES = [
    ["iOS", "App Store", "1024 × 1024", "无 alpha、无自带圆角（系统裁切）"],
    ["iOS", "iPhone @3x / @2x", "180 × 180 / 120 × 120", "跟随系统圆角遮罩"],
    ["iOS", "iPad Pro / iPad", "167 × 167 / 152 × 152", "同上"],
    ["iOS", "设置 / 聚焦", "87 / 80 / 58 / 40 / 29 / 20", "小尺寸需简化"],
    ["Android", "自适应图标", "108 × 108 dp", "安全区 66dp，内容不越界"],
    ["Android", "Play 商店", "512 × 512", "32 位 PNG，无透明"],
    ["Windows", "MSIX 图标", "44 / 150 / 310（方形）", "另需宽图 310×150"],
    ["Windows", "商店 / 启动画面", "50 × 50 / 620 × 300", "启动画面可带品牌色底"],
    ["macOS", "App 图标", "1024 × 1024 → 16", "系统自动加圆角（约 22.37%）"],
    ["Web", "favicon / PWA", "16 / 32 / 180 / 192 / 512", "maskable 安全区 40%"],
  ];

  const LOGIN_FIELDS = [
    ["手机号", "本地 11 位；允许空格与短横线", "手机号格式不正确，请检查后重试"],
    ["邮箱", "含 @ 与域名；不区分大小写", "邮箱格式不正确，例如 name@example.com"],
    ["验证码", "6 位数字；60s 后可重发；支持粘贴", "验证码已过期，请重新获取"],
    ["密码", "≥ 8 位；允许粘贴与密码管理器", "密码至少 8 位，建议包含数字与字母"],
    ["确认密码", "与上一字段一致", "两次输入的密码不一致"],
    ["协议勾选", "默认不勾选；链接可打开且保留输入", "请阅读并同意服务条款与隐私政策"],
  ];

  const DELIVERABLES = [
    ["品牌基础", ["Logo SVG + PNG（1x/2x/3x）", "单色 / 反白 / 深色版本", "Logo 禁用示例图", "品牌色与字体 token"]],
    ["图标与商店", ["全平台图标尺寸包", "商店截图 3–8 张（含深浅色）", "宣传图与一句话卖点", "商店关键词与描述"]],
    ["首次体验", ["闪屏与启动时序", "引导页 3–5 屏 + 可跳过", "权限预请求文案", "空账号首屏示例"]],
    ["账户与身份", ["登录注册流程图", "字段校验与错误文案表", "第三方登录与 Apple 登录", "注销 / 删除账户流程"]],
    ["导航与信息架构", ["IA 树与命名表", "导航规格（宽/行高/选中态）", "搜索与空结果设计", "深链表"]],
    ["核心浏览", ["列表与卡片规格", "筛选排序交互", "分页或无限滚动方案", "四态（空/加载/错误/成功）"]],
    ["详情与操作", ["详情布局栅格", "媒体查看器交互", "操作菜单与权限", "分享与未保存提醒"]],
    ["商业化", ["定价页与权益表", "支付状态机", "订单 / 退款 / 发票", "恢复购买与兑换码"]],
    ["设置与账户", ["设置分组结构", "隐私与数据导出/删除", "关于与许可", "反馈入口与环境预填"]],
    ["系统集成", ["托盘 / 菜单栏菜单", "通知与点击跳转", "快捷键表", "自动更新与文件关联"]],
    ["状态与恢复", ["状态矩阵", "错误码与文案映射", "离线与重试策略", "崩溃恢复验证记录"]],
    ["质量与交付", ["无障碍检查表", "i18n 文案表（+30%）", "性能预算与实测", "设计走查记录"]],
  ];

  /* ------------------------------------------------------------ render */

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function renderModules(stage) {
    const grid = $("#moduleGrid");
    if (!grid) return;
    const list = MODULES.filter(function (m) { return stage === "all" || m.stage === stage; });
    grid.innerHTML = list.map(function (m) {
      return '<article class="module-card" id="m' + m.n + '">' +
        '<div class="module-card__head">' +
          '<div class="module-card__idx">' + m.n + "</div>" +
          '<div><div class="module-card__title">' + m.name + "</div>" +
          '<div class="module-card__en">' + m.en + "</div></div>" +
        "</div>" +
        '<div class="module-card__chips">' + m.pages.map(function (p) { return '<span class="chip-sm">' + p + "</span>"; }).join("") + "</div>" +
        "<h4>必须定义</h4><ul>" + m.specs.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" +
        "<h4>关键数值</h4><div class=\"module-card__chips\">" + m.nums.map(function (s) { return '<span class="chip-sm">' + s + "</span>"; }).join("") + "</div>" +
        "<h4>常见错误</h4><ul>" + m.mistakes.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>" +
        '<div class="module-card__links">' + m.links.map(function (l) {
          return '<a href="' + l.h + '">' + l.t + " →</a>";
        }).join("") + "</div>" +
      "</article>";
    }).join("");
  }

  function renderMatrix() {
    const head = $("#matrixHead");
    const body = $("#matrixBody");
    if (!head || !body) return;
    head.innerHTML = "<th>模块</th>" + DIMS.map(function (d) { return "<th>" + d + "</th>"; }).join("");
    body.innerHTML = MODULES.map(function (m) {
      const row = MATRIX[m.n] || [];
      return "<tr><td>" + m.n + " " + m.name + "</td>" + row.map(function (v) {
        const cls = v === "●" ? "req" : v === "○" ? "opt" : "na";
        return '<td class="' + cls + '">' + v + "</td>";
      }).join("") + "</tr>";
    }).join("");
  }

  function renderIcons() {
    const body = $("#iconSizeBody");
    if (!body) return;
    body.innerHTML = ICON_SIZES.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="mono">' + r[2] + "</td><td>" + esc(r[3]) + "</td></tr>";
    }).join("");
  }

  function renderLogin() {
    const body = $("#loginFieldBody");
    if (!body) return;
    body.innerHTML = LOGIN_FIELDS.map(function (r) {
      return "<tr><td>" + r[0] + '</td><td class="mono">' + r[1] + "</td><td>" + esc(r[2]) + "</td></tr>";
    }).join("");
  }

  function renderDeliverables() {
    const grid = $("#deliverGrid");
    const bar = $("#deliverProgressBar");
    const text = $("#deliverProgressText");
    if (!grid) return;

    const KEY = "ag-deliverables";
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }

    grid.innerHTML = DELIVERABLES.map(function (group, gi) {
      return '<div><div class="card__title" style="margin-bottom:6px">' + group[0] + "</div>" +
        '<div class="checklist">' +
        group[1].map(function (item, ii) {
          const id = "d" + gi + "-" + ii;
          return '<label for="' + id + '"><input type="checkbox" id="' + id + '" data-id="' + id + '"' +
            (saved[id] ? " checked" : "") + "><span>" + esc(item) + "</span></label>";
        }).join("") +
        "</div></div>";
    }).join("");

    const boxes = $$('#deliverGrid input[type="checkbox"]');
    function update() {
      const done = boxes.filter(function (b) { return b.checked; }).length;
      const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      if (bar) bar.style.width = pct + "%";
      if (text) text.textContent = done + " / " + boxes.length + "（" + pct + "%）";
    }
    boxes.forEach(function (b) {
      b.addEventListener("change", function () {
        saved[b.getAttribute("data-id")] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ }
        update();
      });
    });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderModules("all");
    renderMatrix();
    renderIcons();
    renderLogin();
    renderDeliverables();

    const filter = $("#moduleFilter");
    if (filter) {
      filter.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-stage]");
        if (!btn) return;
        $$("button", filter).forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        renderModules(btn.getAttribute("data-stage"));
      });
    }

    const grid = $("#logoGrid");
    const clear = $("#logoClear");
    const gridLayer = $("#logoGridLayer");
    const clearLayer = $("#logoClearLayer");
    if (grid && gridLayer) {
      const apply = function () {
        gridLayer.style.setProperty("--grid-opacity", grid.checked ? "1" : "0");
        if (clearLayer) clearLayer.style.setProperty("--clear-opacity", clear && clear.checked ? "1" : "0");
      };
      grid.addEventListener("change", apply);
      if (clear) clear.addEventListener("change", apply);
      apply();
    }
  });
})();
