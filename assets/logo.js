/* ==========================================================================
   logo.js — logo types, boolean cutting demo, optical fix, responsive mark,
   delivery specs and checklist.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const TYPES = [
    ["文字标 Wordmark", "识别快、能承载品牌名", "跨语言/长名字难处理", "品牌名短且独特"],
    ["字母标 Lettermark", "极简、缩小友好", "需要额外解释全称", "名字长、缩写有辨识度"],
    ["图形标 Pictorial", "跨语言、图标化", "与功能图标易混淆", "有具象符号可占位"],
    ["抽象标 Abstract", "独占性强、易延伸", "首期无含义，需要教育", "科技/平台型产品"],
    ["徽章标 Emblem", "权威、可做印章", "缩小后细节丢失", "机构、赛事、认证"],
    ["组合标 Combination", "图形 + 文字最完整", "必须准备拆分布局", "大多数产品首选"],
  ];

  const RATIOS = [
    ["Φ 黄金比", "1 : 1.618", "主形与留白、标识与文字间距"],
    ["√2 白银比", "1 : 1.414", "A 系列纸张、等距缩放"],
    ["1 : 2", "倍数关系", "图标网格、模块单元"],
    ["三等分", "1/3 · 2/3", "构造辅助线、视觉重心"],
    ["8 点网格", "8 / 16 / 24 / 32", "最小单元，所有坐标取整"],
    ["圆半径族", "R / 2R / 3R", "同一标识内的半径必须成倍数"],
    ["描边单位", "1 / 2 / 4 单位", "转角与切口宽度统一"],
  ];

  const MIN_SIZE = [
    ["favicon", "16 × 16", "使用简化版，去掉 ≤ 2 单位细节"],
    ["应用图标", "16 / 24 / 32", "与系统圆角遮罩一起检查"],
    ["网页页眉", "高 ≥ 24", "低于 24 改用纯标识"],
    ["桌面端工具栏", "高 ≥ 16", "只保留标识轮廓"],
    ["印刷", "宽 ≥ 10 mm", "细线 ≥ 0.25 mm"],
    ["刺绣 / 丝印", "宽 ≥ 25 mm", "去掉渐变与细描边"],
    ["户外招牌", "按观看距离 1:250", "10 m 距离对应字高 ≥ 40 mm"],
  ];

  const LOGO_MOTION = [
    ["路径绘制 Draw-on", "stroke-dashoffset 600–900ms，ease-out"],
    ["遮罩揭示 Mask reveal", "240–400ms，线性或 ease-in-out"],
    ["形态变换 Morph", "≤ 800ms，中间态帧数 ≥ 12"],
    ["悬停微动", "120–180ms，位移 ≤ 2px，不缩放"],
    ["启动动画总时长", "≤ 1.2s，且仅首次启动播放"],
    ["reduce motion", "只保留淡入（≤ 200ms），不做绘制"],
  ];

  const DELIVERY = [
    ["描边转轮廓", "所有 stroke 转为填充路径", "SVG 里搜索 stroke= 应为 0"],
    ["viewBox", "统一 0 0 24 24 / 0 0 1024 1024，无 width/height 硬编码", "缩放窗口不变形"],
    ["路径精度", "坐标保留 2 位小数；合并重复节点", "文件 < 20KB"],
    ["颜色", "使用 token 变量或命名色板，不写散落 hex", "全文件 hex 数量 ≤ 3"],
    ["安全区", "SVG 内含 ≥ 0.5x 的内边距", "四周留白一致"],
    ["版本", "彩色 / 单色 / 反白 / 深色 四份", "缺一不可"],
    ["位图导出", "PNG @1x/2x/3x，透明底，无投影", "边缘无灰边"],
    ["命名", "brand-mark-color.svg / brand-mark-mono.svg", "全小写连字符"],
    ["字体", "文字转曲或明确引用并附字体文件/授权", "换机器不变形"],
  ];

  const CHECKLIST = [
    ["几何构造说明已写清（画板/网格/半径/布尔顺序）", "逻辑"],
    ["所有坐标落在 8 点网格或明确比例上", "几何"],
    ["圆/三角已做 overshoot 修正", "光学"],
    ["文字已转曲或附字体授权", "交付"],
    ["安全区 = 0.5x，四周等距", "布局"],
    ["最小尺寸下无细节丢失（16px 实测）", "尺寸"],
    ["准备完整 / 紧凑 / 纯标识三形态", "响应式"],
    ["浅色 / 深色 / 反白 / 单色 四版本齐全", "配色"],
    ["对比度 ≥ 3:1（标识按非文本）", "无障碍"],
    ["SVG 无描边、viewBox 统一、文件 < 20KB", "交付"],
    ["禁止用法示例图已出（拉伸/改色/旋转等）", "规范"],
    ["动效 ≤ 1.2s 且支持 reduce motion", "动效"],
  ];

  function renderTable(id, rows, cls) {
    const tbody = document.getElementById(id);
    if (!tbody) return;
    tbody.innerHTML = rows.map(function (r) {
      return "<tr>" + r.map(function (c) { return "<td" + (cls ? ' class="' + cls + '"' : "") + ">" + c + "</td>"; }).join("") + "</tr>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderTable("typeTableBody", TYPES);
    renderTable("ratioTableBody", RATIOS);
    renderTable("minSizeBody", MIN_SIZE);
    renderTable("logoMotionBody", LOGO_MOTION);
    renderTable("deliveryBody", DELIVERY);

    /* ---------------- boolean cutting */
    const groups = {
      source: $("#opSource"),
      union: $("#opUnion"),
      subtract: $("#opSubtract"),
      intersect: $("#opIntersect"),
      exclude: $("#opExclude"),
    };
    const notes = {
      source: "原始形：圆形与方形，虚线表示两条基础几何。",
      union: "合并（Union）：取两者并集，重叠区合并为一个整体。",
      subtract: "减去（Subtract）：从圆形中挖掉方形覆盖的部分，得到缺口。",
      intersect: "相交（Intersect）：只保留两者重叠区域。",
      exclude: "排除（Exclude）：保留不重叠的部分，重叠区挖空。",
    };
    const sw = $("#opSwitch");
    function showOp(op) {
      Object.keys(groups).forEach(function (k) {
        if (groups[k]) groups[k].style.display = k === op ? "" : "none";
      });
      const note = $("#opNote");
      if (note) note.textContent = notes[op];
    }
    if (sw) {
      sw.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-op]");
        if (!btn) return;
        $$("button", sw).forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        showOp(btn.getAttribute("data-op"));
      });
    }
    showOp("source");

    const grid = $("#opGrid");
    if (grid) {
      grid.addEventListener("change", function () {
        const layer = $("#opGridLayer");
        if (layer) layer.style.display = grid.checked ? "" : "none";
      });
    }

    /* ---------------- optical correction */
    const fix = $("#optFix");
    const circle = $("#optCircle");
    function applyOptical() {
      if (!circle) return;
      const on = !fix || fix.checked;
      circle.style.transform = on ? "scale(1.02)" : "none";
      const note = $("#optNote");
      if (note) {
        note.textContent = on
          ? "修正中：圆放大 2%（overshoot），视觉面积与方形接近。"
          : "关闭修正：同尺寸的圆看起来明显比方形小——这就是需要 overshoot 的原因。";
      }
    }
    if (fix) fix.addEventListener("change", applyOptical);
    applyOptical();

    /* ---------------- responsive logo */
    const range = $("#respW");
    const stage = $("#respStage");
    const logo = $("#respLogo");
    const wVal = $("#respWVal");
    const variant = $("#respVariant");
    function applyResponsive() {
      if (!range || !stage) return;
      const w = Number(range.value);
      if (stage) stage.style.maxWidth = "min(" + w + "px, 100%)";
      if (wVal) wVal.textContent = w + "px";
      if (logo) {
        const word = logo.querySelector(".resp-word");
        if (word) word.style.display = w >= 320 ? "" : "none";
        logo.style.fontSize = w >= 320 ? "30px" : "24px";
        if (variant) variant.textContent = w >= 320 ? "完整组合" : w >= 160 ? "紧凑（纯标识 + 字标缩写）" : "纯标识";
        if (w < 160 && word) word.style.display = "none";
      }
    }
    if (range) {
      range.addEventListener("input", applyResponsive);
      applyResponsive();
    }

    /* ---------------- checklist */
    const gridEl = $("#logoCheckGrid");
    const bar = $("#logoProgressBar");
    const text = $("#logoProgressText");
    if (gridEl) {
      const KEY = "ag-logo-checklist";
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }

      gridEl.innerHTML = CHECKLIST.map(function (item, i) {
        const id = "lc" + i;
        return '<label class="check" for="' + id + '" style="align-items:flex-start;padding:6px 0">' +
          '<input type="checkbox" id="' + id + '" data-id="' + id + '"' + (saved[id] ? " checked" : "") + ">" +
          "<span>" + item[0] + '<span style="color:var(--text-3);font-size:11px"> · ' + item[1] + "</span></span></label>";
      }).join("");

      const boxes = $$('input[type="checkbox"]', gridEl);
      function update() {
        const done = boxes.filter(function (b) { return b.checked; }).length;
        const pct = Math.round((done / boxes.length) * 100);
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
  });
})();
