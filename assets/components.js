/* ==========================================================================
   components.js — 28 components, live specimens with spec annotations.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  const COMPS = [
    {
      name: "按钮", en: "Button", cat: "操作",
      specs: "高 32（次）/ 40（主）· 圆角 8–10 · 水平内边距 15 · 状态：默认/悬停/按压/禁用",
      html:
        '<button class="btn btn--primary" type="button">主要操作</button>' +
        '<button class="btn btn--secondary" type="button">次要</button>' +
        '<button class="btn btn--outline" type="button">描边</button>' +
        '<button class="btn btn--primary" type="button" disabled>禁用</button>' +
        '<button class="btn btn--primary btn--round" type="button">胶囊 CTA</button>',
    },
    {
      name: "图标按钮", en: "Icon Button", cat: "操作",
      specs: "视觉 32×32 · 热区 ≥ 32×32（鼠标）/ 44×44（触控）· 图标 18–20",
      html:
        '<button class="btn btn--secondary" type="button" aria-label="收藏">☆</button>' +
        '<button class="btn btn--secondary" type="button" aria-label="下载">↓</button>' +
        '<button class="btn btn--secondary" type="button" aria-label="更多">⋯</button>' +
        '<button class="btn btn--primary" type="button" aria-label="播放">▶</button>',
    },
    {
      name: "输入框", en: "Text Field", cat: "输入",
      specs: "高 32–38 · 圆角 8 · 内边距 12 · 聚焦：主色边框 + 3px 光晕 · 错误：红边框 + 行内文案",
      html:
        '<div style="width:100%;display:grid;gap:10px">' +
        '<label class="field"><span class="field__label">邮箱</span><input class="input" placeholder="you@example.com"></label>' +
        '<label class="field"><span class="field__label">错误示例</span>' +
        '<input class="input" value="abc@" style="border-color:#ff453a;box-shadow:0 0 0 3px rgba(255,69,58,.15)">' +
        '<span style="font-size:12px;color:#ff453a">请输入完整的邮箱地址</span></label>' +
        "</div>",
    },
    {
      name: "搜索框", en: "Search Field", cat: "输入",
      specs: "高 32–36 · 圆角 999 或 8 · 左侧 16 图标 · 有内容时右侧出现清除按钮",
      html:
        '<div style="width:100%;position:relative">' +
        '<input class="input" style="width:100%;padding-left:34px;border-radius:999px" placeholder="搜索壁纸、作者、标签">' +
        '<span style="position:absolute;left:12px;top:8px;color:var(--text-3)">⌕</span></div>',
    },
    {
      name: "数字输入", en: "Number Field", cat: "输入",
      specs: "高 32 · 右侧步进器 24×24 · 输入即校验，不做「确定」二次确认",
      html:
        '<div style="display:flex;align-items:center;border:1px solid var(--line-strong);border-radius:8px;overflow:hidden;background:var(--card)">' +
        '<button class="btn" type="button" style="border-radius:0;height:32px;padding:0 12px">−</button>' +
        '<input value="12" style="width:56px;height:32px;text-align:center;border:0;background:transparent;color:var(--text);font:inherit">' +
        '<button class="btn" type="button" style="border-radius:0;height:32px;padding:0 12px">+</button>' +
        "</div>",
    },
    {
      name: "下拉选择", en: "Select", cat: "选择",
      specs: "高 32 · 展开层圆角 8 + 层级 3 阴影 · 选项 ≥ 36 高 · 选中打勾",
      html:
        '<div style="width:100%">' +
        '<button class="btn btn--outline" type="button" style="width:100%;justify-content:space-between">4K 超清 <span>⌄</span></button>' +
        '<div style="margin-top:6px;border:1px solid var(--line);border-radius:10px;background:var(--card);box-shadow:0 12px 24px rgba(0,0,0,.14);padding:4px">' +
        '<div style="padding:8px 10px;border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:13px;font-weight:600">4K 超清 ✓</div>' +
        '<div style="padding:8px 10px;border-radius:8px;font-size:13px">2K</div>' +
        '<div style="padding:8px 10px;border-radius:8px;font-size:13px">1080p</div>' +
        "</div></div>",
    },
    {
      name: "复选框", en: "Checkbox", cat: "选择",
      specs: "视觉 17×17 · 圆角 5 · 点击区域 = 整行（含标签）· 勾选动画 120ms",
      html:
        '<div style="display:grid;gap:10px">' +
        '<label class="check"><input type="checkbox" checked>开机自动启动</label>' +
        '<label class="check"><input type="checkbox">加入体验计划</label>' +
        '<label class="check"><input type="checkbox" disabled>需要 Pro（禁用）</label>' +
        "</div>",
    },
    {
      name: "单选组", en: "Radio Group", cat: "选择",
      specs: "视觉 17×17 圆形 · 互斥 2–5 项 · 必须有默认项 · 键盘 ↑↓ 切换",
      html:
        '<div style="display:grid;gap:10px">' +
        '<label class="check"><input type="radio" name="r1" checked style="border-radius:50%">每月订阅</label>' +
        '<label class="check"><input type="radio" name="r1" style="border-radius:50%">每年订阅（省 30%）</label>' +
        '<label class="check"><input type="radio" name="r1" style="border-radius:50%">终身买断</label>' +
        "</div>",
    },
    {
      name: "开关", en: "Switch", cat: "选择",
      specs: "38×22 · 圆 18 · 即时生效，不配保存按钮 · 切换 120–180ms",
      html:
        '<div style="display:grid;gap:12px">' +
        '<label class="switch"><input type="checkbox" checked>动态壁纸自动播放</label>' +
        '<label class="switch"><input type="checkbox">开机时恢复上次壁纸</label>' +
        "</div>",
    },
    {
      name: "滑块", en: "Slider", cat: "选择",
      specs: "轨道 4px · 拇指 20px · 拖动时显示数值 · 步长取整，避免 37.4 这种值",
      html:
        '<div style="width:100%">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-2)"><span>音量</span><span id="demoRangeVal">60%</span></div>' +
        '<input type="range" min="0" max="100" value="60" id="demoRange" style="margin-top:10px">' +
        "</div>",
    },
    {
      name: "分段控件", en: "Segmented Control", cat: "选择",
      specs: "高 28–32 · 圆角 9 · 选中：实底 + 阴影 · 2–5 项互斥",
      html:
        '<div class="segmented" role="group">' +
        '<button type="button" class="is-on">全部</button><button type="button">动态</button><button type="button">3D</button>' +
        "</div>",
    },
    {
      name: "标签页", en: "Tabs", cat: "导航",
      specs: "高 40 · 选中项 2px 指示条 · 标签 2–7 个 · 切换保留滚动位置",
      html:
        '<div style="width:100%;display:flex;gap:18px;border-bottom:1px solid var(--line)">' +
        '<span style="padding:10px 0;font-size:13px;font-weight:600;border-bottom:2px solid var(--accent);color:var(--accent)">推荐</span>' +
        '<span style="padding:10px 0;font-size:13px;color:var(--text-2)">最新</span>' +
        '<span style="padding:10px 0;font-size:13px;color:var(--text-2)">收藏</span>' +
        "</div>",
    },
    {
      name: "侧栏导航", en: "Sidebar Nav", cat: "导航",
      specs: "行高 40 · 圆角 10 · 选中：主色实底 + 白字 · 宽度 216–280",
      html:
        '<div style="width:100%;display:grid;gap:2px">' +
        '<a class="nav__link is-active" style="pointer-events:none"><span class="nav__num">01</span>每日推荐</a>' +
        '<a class="nav__link" style="pointer-events:none"><span class="nav__num">02</span>全部壁纸</a>' +
        '<a class="nav__link" style="pointer-events:none"><span class="nav__num">03</span>壁纸特效</a>' +
        "</div>",
    },
    {
      name: "面包屑", en: "Breadcrumb", cat: "导航",
      specs: "字号 13 · 分隔符统一 · 末项不可点 · 3 层以上才出现",
      html:
        '<div style="font-size:13px;color:var(--text-2);display:flex;gap:8px;flex-wrap:wrap">' +
        '<a href="#main">首页</a><span>›</span><a href="#main">壁纸特效</a><span>›</span>' +
        '<span style="color:var(--text);font-weight:600">液态玻璃</span></div>',
    },
    {
      name: "分页", en: "Pagination", cat: "导航",
      specs: "按钮 32×32 · 当前页实底 · 超过 7 页折叠为 …",
      html:
        '<div style="display:flex;gap:6px">' +
        '<button class="btn btn--outline" type="button">‹</button>' +
        '<button class="btn btn--primary" type="button">1</button>' +
        '<button class="btn btn--outline" type="button">2</button>' +
        '<button class="btn btn--outline" type="button">3</button>' +
        '<button class="btn btn--outline" type="button">…</button>' +
        '<button class="btn btn--outline" type="button">›</button>' +
        "</div>",
    },
    {
      name: "卡片", en: "Card", cat: "数据展示",
      specs: "圆角 12–18 · 内边距 16–24 · 悬停抬升 ≤ 3px · 一张卡只表达一件事",
      html:
        '<div style="width:100%;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:0 6px 14px rgba(0,0,0,.08)">' +
        '<div style="height:84px;border-radius:10px;background:linear-gradient(135deg,#7b5cff,#00c2a8)"></div>' +
        '<div style="font-size:14px;font-weight:600;margin-top:10px">晨雾山谷</div>' +
        '<div style="font-size:12px;color:var(--text-2)">4K · 动态 · 128 MB</div>' +
        "</div>",
    },
    {
      name: "列表行", en: "List Row", cat: "数据展示",
      specs: "高 40/48 · 左侧图标 20 · 右侧 chevron · 分隔线 8% 前景色",
      html:
        '<div style="width:100%;display:grid;gap:0">' +
        '<div style="display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid var(--line)">' +
        '<span>🖼</span><span style="flex:1;font-size:13px">默认下载目录</span><span style="color:var(--text-3)">›</span></div>' +
        '<div style="display:flex;align-items:center;gap:12px;padding:10px 4px">' +
        '<span>⏱</span><span style="flex:1;font-size:13px">自动切换间隔</span><span style="color:var(--text-2);font-size:12px">30 分钟</span><span style="color:var(--text-3)">›</span></div>' +
        "</div>",
    },
    {
      name: "表格", en: "Data Table", cat: "数据展示",
      specs: "行高 40 · 表头 12px 半粗 · 数字右对齐 · 100+ 行必须虚拟化",
      html:
        '<table class="table-demo"><thead><tr><th>壁纸</th><th>分辨率</th><th>大小</th></tr></thead>' +
        "<tbody><tr><td>晨雾山谷</td><td>3840×2160</td><td>128 MB</td></tr>" +
        "<tr><td>液态金属</td><td>2560×1440</td><td>64 MB</td></tr>" +
        "<tr><td>枯山水</td><td>1920×1080</td><td>22 MB</td></tr></tbody></table>",
    },
    {
      name: "徽章 / 标签", en: "Badge / Tag", cat: "数据展示",
      specs: "高 20–24 · 圆角 999 · 颜色只做辅助，必须配文字",
      html:
        '<span class="badge badge--ok">已安装</span>' +
        '<span class="badge badge--warn">更新中</span>' +
        '<span class="badge badge--bad">已失效</span>' +
        '<span class="badge" style="background:var(--accent-soft);color:var(--accent)">PRO</span>',
    },
    {
      name: "头像", en: "Avatar", cat: "数据展示",
      specs: "24 / 32 / 40 / 64 · 圆形 · 缺省用首字母 + 稳定配色",
      html:
        '<div style="width:40px;height:40px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:600">G</div>' +
        '<div style="width:32px;height:32px;border-radius:50%;background:#ff9f0a;color:#fff;display:grid;place-items:center;font-size:12px">M</div>' +
        '<div style="width:24px;height:24px;border-radius:50%;background:var(--card-2);border:1px solid var(--line);display:grid;place-items:center;font-size:11px">+3</div>',
    },
    {
      name: "进度条", en: "Progress", cat: "反馈",
      specs: "高 6 · 圆角 999 · 只增不减 · < 1s 不显示",
      html:
        '<div style="width:100%"><div class="progress"><i style="width:42%"></i></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-2);margin-top:6px"><span>正在生成预览…</span><span>42%</span></div></div>',
    },
    {
      name: "加载指示", en: "Spinner", cat: "反馈",
      specs: "16/20/32 · 循环 1000–1400ms · ≥ 1s 才出现，避免闪烁",
      html:
        '<div style="display:flex;gap:18px;align-items:center">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.1s" repeatCount="indefinite"/></path></svg>' +
        '<span style="font-size:13px;color:var(--text-2)">正在加载…</span></div>',
    },
    {
      name: "骨架屏", en: "Skeleton", cat: "反馈",
      specs: "与真实结构同形 · 1300ms 循环 · 不要用「假内容」占位",
      html:
        '<div style="width:100%;display:grid;gap:8px">' +
        '<div class="skeleton" style="height:14px;width:70%"></div>' +
        '<div class="skeleton" style="height:14px;width:52%"></div>' +
        '<div class="skeleton" style="height:56px"></div></div>',
    },
    {
      name: "提示条", en: "InfoBar", cat: "反馈",
      specs: "高度自适应 · 左侧状态图标 · 可关闭 · 不要与 Toast 混用",
      html:
        '<div style="width:100%;display:grid;gap:8px">' +
        '<div style="display:flex;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(255,159,10,.14);font-size:12.5px"><b style="color:#c76a00">!</b><span>当前为离线模式，显示已缓存内容。</span></div>' +
        '<div style="display:flex;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(52,199,89,.12);font-size:12.5px"><b style="color:#1a7f37">✓</b><span>已设为桌面背景。</span></div>' +
        "</div>",
    },
    {
      name: "工具提示", en: "Tooltip", cat: "反馈",
      specs: "延迟 300–500ms · 一句话 ≤ 60 字 · 不含可交互内容",
      html:
        '<span style="position:relative;display:inline-block" class="tip-host">' +
        '<button class="btn btn--outline" type="button">悬停查看</button>' +
        '<span class="tip" role="tooltip" style="position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);white-space:nowrap;background:rgba(28,28,30,.94);color:#fff;font-size:12px;padding:6px 10px;border-radius:8px;opacity:0;transition:opacity 160ms;pointer-events:none">下载后自动设为壁纸</span>' +
        "</span>",
    },
    {
      name: "对话框", en: "Dialog", cat: "反馈",
      specs: "宽 360–560 · 圆角 14–18 · 遮罩 α .32–.5 · 主操作在右 · Esc 关闭",
      html: '<button class="btn btn--secondary" type="button" id="dialogOpen">打开对话框</button>',
    },
    {
      name: "空状态", en: "Empty State", cat: "状态",
      specs: "图标 ≤ 96 · 一句说明 + 一个主操作 · 禁止只写「暂无数据」",
      html:
        '<div style="width:100%;text-align:center;padding:8px 0">' +
        '<div style="font-size:34px;opacity:.5">🖼</div>' +
        '<div style="font-size:14px;font-weight:600;margin-top:6px">还没有收藏</div>' +
        '<div style="font-size:12px;color:var(--text-2);margin-top:4px">在壁纸详情点「收藏」就会出现在这里</div>' +
        '<button class="btn btn--primary btn--sm" type="button" style="margin-top:12px">去逛逛</button></div>',
    },
    {
      name: "步骤条", en: "Stepper", cat: "状态",
      specs: "节点 24 · 连接线 2px · 当前步高亮 · 步骤 ≤ 5",
      html:
        '<div style="display:flex;align-items:center;gap:10px;width:100%">' +
        '<span style="width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:11px">1</span>' +
        '<span style="flex:1;height:2px;background:var(--accent)"></span>' +
        '<span style="width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:11px">2</span>' +
        '<span style="flex:1;height:2px;background:var(--line-strong)"></span>' +
        '<span style="width:22px;height:22px;border-radius:50%;border:1px solid var(--line-strong);display:grid;place-items:center;font-size:11px;color:var(--text-2)">3</span>' +
        "</div>",
    },
    {
      name: "上传区", en: "Drop Zone", cat: "输入",
      specs: "虚线 1.5px · 圆角 12 · 高 ≥ 120 · 支持点击与拖拽，且给出格式/大小限制",
      html:
        '<div style="width:100%;border:1.5px dashed var(--line-strong);border-radius:12px;padding:22px;text-align:center">' +
        '<div style="font-size:20px">⇪</div>' +
        '<div style="font-size:13px;font-weight:600;margin-top:6px">拖拽图片到这里，或点击选择</div>' +
        '<div style="font-size:11px;color:var(--text-2);margin-top:4px">JPG / PNG / WebP · 单张 ≤ 20 MB</div>' +
        "</div>",
    },
  ];

  const CATS = ["全部", "操作", "输入", "选择", "导航", "数据展示", "反馈", "状态"];

  const grid = $("#compGrid");
  const subnav = $("#compSubnav");
  const countEl = $("#galleryCount");
  let cat = "全部";
  let showStates = false;

  function stateRow() {
    if (!showStates) return "";
    return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:100%">' +
      '<span class="btn btn--primary" style="pointer-events:none">默认</span>' +
      '<span class="btn btn--primary" style="pointer-events:none;background:var(--accent-hover)">悬停</span>' +
      '<span class="btn btn--primary" style="pointer-events:none;transform:scale(.98);background:var(--accent-hover)">按压</span>' +
      '<span class="btn btn--primary" style="pointer-events:none;opacity:.42">禁用</span>' +
    "</div>";
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function render() {
    if (!grid) return;
    const list = COMPS.filter(function (c) { return cat === "全部" || c.cat === cat; });
    grid.innerHTML = list.map(function (c) {
      return '<div class="comp-card">' +
        '<div class="comp-card__head"><span class="comp-card__name">' + c.name + "</span>" +
        '<span class="comp-card__en">' + c.en + "</span></div>" +
        '<div class="comp-stage">' + c.html + "</div>" +
        stateRow() +
        '<div class="comp-specs">' + c.specs + "</div>" +
        '<details class="comp-code"><summary>查看可复刻代码</summary>' +
          '<div style="display:flex;justify-content:flex-end;margin-top:8px">' +
            '<button class="copy-chip" type="button" data-code="' + encodeURIComponent(c.html) + '">复制 HTML</button>' +
          "</div>" +
          "<pre class=\"code-block\" style=\"margin-top:6px\">" + esc(c.html) + "</pre>" +
        "</details>" +
      "</div>";
    }).join("");

    if (countEl) countEl.textContent = list.length + " / " + COMPS.length + " 个组件";

    const dlgBtn = $("#dialogOpen");
    if (dlgBtn) {
      dlgBtn.addEventListener("click", function () {
        const d = document.createElement("dialog");
        d.style.cssText = "border:0;padding:0;border-radius:16px;max-width:420px;width:92%;box-shadow:0 18px 40px rgba(0,0,0,.3);background:var(--card);color:var(--text)";
        d.innerHTML = '<div style="padding:22px"><div style="font-size:17px;font-weight:600">删除这张壁纸？</div>' +
          '<p style="font-size:13px;color:var(--text-2);margin-top:8px">删除后可从云端重新下载。</p>' +
          '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">' +
          '<button class="btn btn--secondary" type="button">取消</button>' +
          '<button class="btn btn--primary" type="button">删除</button></div></div>';
        document.body.appendChild(d);
        d.showModal();
        d.addEventListener("click", function (e) { if (e.target.tagName === "BUTTON") d.close(); });
        d.addEventListener("close", function () { d.remove(); });
      });
    }

    const range = $("#demoRange");
    if (range) {
      const out = $("#demoRangeVal");
      range.addEventListener("input", function () { if (out) out.textContent = range.value + "%"; });
    }

    document.querySelectorAll(".tip-host").forEach(function (host) {
      const tip = host.querySelector(".tip");
      if (!tip) return;
      host.addEventListener("mouseenter", function () { tip.style.opacity = "1"; });
      host.addEventListener("mouseleave", function () { tip.style.opacity = "0"; });
      host.addEventListener("focusin", function () { tip.style.opacity = "1"; });
      host.addEventListener("focusout", function () { tip.style.opacity = "0"; });
    });
  }

  if (subnav) {
    subnav.innerHTML = CATS.map(function (c) {
      return '<a href="#compGrid" data-cat="' + c + '" class="' + (c === "全部" ? "is-on" : "") + '">' + c + "</a>";
    }).join("");
    subnav.addEventListener("click", function (e) {
      const a = e.target.closest("a[data-cat]");
      if (!a) return;
      e.preventDefault();
      cat = a.getAttribute("data-cat");
      subnav.querySelectorAll("a").forEach(function (n) { n.classList.toggle("is-on", n === a); });
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const density = $("#densitySwitch");
    if (density) {
      density.addEventListener("click", function (e) {
        const b = e.target.closest("button[data-density]");
        if (!b) return;
        density.querySelectorAll("button").forEach(function (n) { n.classList.toggle("is-on", n === b); });
        grid.setAttribute("data-density", b.getAttribute("data-density"));
      });
      grid.setAttribute("data-density", "regular");
    }

    const radius = $("#radiusSwitch");
    if (radius) {
      radius.addEventListener("click", function (e) {
        const b = e.target.closest("button[data-radius]");
        if (!b) return;
        radius.querySelectorAll("button").forEach(function (n) { n.classList.toggle("is-on", n === b); });
        grid.setAttribute("data-radius", b.getAttribute("data-radius"));
      });
      grid.setAttribute("data-radius", "10");
    }

    const toggle = $("#showStateGrid");
    if (toggle) toggle.addEventListener("change", function () { showStates = toggle.checked; render(); });

    grid.addEventListener("click", function (e) {
      const b = e.target.closest("[data-code]");
      if (!b) return;
      const code = decodeURIComponent(b.getAttribute("data-code"));
      if (window.AG) AG.copy(code);
    });

    render();
  });
})();
