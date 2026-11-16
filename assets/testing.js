/* ==========================================================================
   testing.js — seven hands-on checks: contrast, CVD, targets, keyboard,
   responsive, readability, quiz.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ------------------------------------------------------------ contrast */

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
  }
  function luminance(rgb) {
    const a = rgb.map(function (v) {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(a, b) {
    const la = luminance(hexToRgb(a));
    const lb = luminance(hexToRgb(b));
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  (function contrastTool() {
    const fg = $("#fgColor");
    const bg = $("#bgColor");
    const size = $("#fgSize");
    const weight = $("#fgWeight");
    const preview = $("#contrastPreview");
    const out = $("#contrastResult");
    if (!fg || !out) return;

    function update() {
      const px = Number(size.value) || 14;
      const w = Number(weight ? weight.value : 400);
      preview.style.color = fg.value;
      preview.style.background = bg.value;
      preview.style.fontSize = px + "px";
      preview.style.fontWeight = String(w);

      const ratio = contrast(fg.value, bg.value);
      const isLarge = px >= 24 || (px >= 18.66 && w >= 700);
      const needAA = isLarge ? 3 : 4.5;
      const needAAA = isLarge ? 4.5 : 7;
      const passAA = ratio >= needAA;
      const passAAA = ratio >= needAAA;

      out.innerHTML =
        '<span class="badge ' + (passAA ? "badge--ok" : "badge--bad") + '">' + ratio.toFixed(2) + ":1</span>" +
        '<span>' + (isLarge ? "大字号" : "正文") + " · AA 需 ≥ " + needAA + ":1 " + (passAA ? "✓" : "✗") +
        " · AAA 需 ≥ " + needAAA + ":1 " + (passAAA ? "✓" : "✗") + "</span>";
    }

    [fg, bg, size].forEach(function (el) { if (el) el.addEventListener("input", update); });
    if (weight) weight.addEventListener("change", update);

    const presets = $("#contrastPresets");
    if (presets) {
      const pairs = [
        ["#1d1d1f", "#f5f5f7", "主文字 / 页面底"],
        ["#000000", "#ffffff", "纯黑 / 纯白"],
        ["#777777", "#ffffff", "中灰 / 白（常翻车）"],
        ["#0071e3", "#ffffff", "主色 / 白"],
        ["#ffffff", "#0071e3", "白 / 主色"],
        ["#ff453a", "#1c1c1e", "危险 / 深色卡片"],
      ];
      presets.innerHTML = pairs.map(function (p) {
        return '<button class="copy-chip" type="button" data-fg="' + p[0] + '" data-bg="' + p[1] + '">' + p[2] + "</button>";
      }).join("");
      presets.addEventListener("click", function (e) {
        const b = e.target.closest("[data-fg]");
        if (!b) return;
        fg.value = b.getAttribute("data-fg");
        bg.value = b.getAttribute("data-bg");
        update();
      });
    }

    const swap = $("#contrastSwap");
    if (swap) swap.addEventListener("click", function () {
      const t = fg.value;
      fg.value = bg.value;
      bg.value = t;
      update();
    });

    update();
  })();

  /* ------------------------------------------------------------ cvd */

  (function cvd() {
    const sw = $("#cvdSwitch");
    const target = $("#cvdTarget");
    if (!sw || !target) return;
    sw.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-cvd]");
      if (!btn) return;
      $$("button", sw).forEach(function (b) { b.classList.toggle("is-on", b === btn); });
      const type = btn.getAttribute("data-cvd");
      target.style.filter = type === "none" ? "none" : "url(#" + type + ")";
    });
  })();

  /* ------------------------------------------------------------ hit areas */

  (function hotZones() {
    const toggle = $("#hotToggle");
    if (!toggle) return;
    function apply() {
      document.documentElement.style.setProperty("--hot-display", toggle.checked ? "block" : "none");
    }
    toggle.addEventListener("change", apply);
    apply();
  })();

  /* ------------------------------------------------------------ keyboard */

  (function keyboard() {
    const demo = $("#kbdDemo");
    const log = $("#kbdLog");
    const reset = $("#kbdReset");
    if (!demo || !log) return;

    let order = [];
    function labelOf(el) {
      if (!el) return "";
      if (el.getAttribute && el.getAttribute("aria-label")) return el.getAttribute("aria-label");
      if (el.placeholder) return el.placeholder;
      if (el.type === "checkbox") return (el.parentElement && el.parentElement.textContent.trim()) || "复选框";
      return (el.textContent || el.tagName).trim().slice(0, 16);
    }
    function render() {
      log.textContent = order.length
        ? "焦点顺序：" + order.map(function (n, i) { return i + 1 + ". " + n; }).join("  →  ")
        : "按 Tab 开始记录焦点顺序…";
    }
    demo.addEventListener("focusin", function (e) {
      const name = labelOf(e.target);
      if (!name) return;
      if (order[order.length - 1] === name) return;
      order.push(name);
      render();
    });
    if (reset) reset.addEventListener("click", function () { order = []; render(); });
  })();

  /* ------------------------------------------------------------ responsive */

  (function responsive() {
    const range = $("#respRange");
    const frame = $("#respFrame");
    const val = $("#respVal");
    const cls = $("#respClass");
    const inner = $("#respInner");
    if (!range || !frame) return;

    if (inner) {
      inner.innerHTML = Array.from({ length: 12 }, function () { return '<div class="resp-card"></div>'; }).join("");
    }

    function update() {
      const w = Number(range.value);
      frame.style.width = w + "px";
      frame.style.maxWidth = "100%";
      if (val) val.textContent = w + "px";
      const name = w < 600 ? "Compact" : w < 840 ? "Medium" : w < 1200 ? "Expanded" : "Large";
      if (cls) {
        cls.textContent = name;
        cls.className = "badge " + (w < 600 ? "badge--warn" : "badge--ok");
      }
    }
    range.addEventListener("input", update);
    update();
  })();

  /* ------------------------------------------------------------ readability */

  (function readability() {
    const size = $("#rdSize");
    const lh = $("#rdLh");
    const width = $("#rdWidth");
    const sample = $("#rdSample");
    const out = $("#rdResult");
    if (!size || !sample) return;

    function update() {
      const s = Number(size.value);
      const l = Number(lh.value);
      const w = Number(width.value);
      sample.style.fontSize = s + "px";
      sample.style.lineHeight = String(l);
      sample.style.maxWidth = w + "px";
      $("#rdSizeVal").textContent = s + "px";
      $("#rdLhVal").textContent = l.toFixed(2);
      $("#rdWidthVal").textContent = w + "px";

      const cpl = Math.round(w / s);
      const cplOk = cpl >= 25 && cpl <= 40;
      const checks = [
        { ok: s >= 12, text: "字号 " + s + "px" + (s >= 12 ? " 达标" : " 过小（< 12px）") },
        { ok: l >= 1.4 && l <= 1.7, text: "行高 " + l.toFixed(2) + (l >= 1.4 && l <= 1.7 ? " 合适" : " 建议 1.4–1.7") },
        {
          ok: cplOk,
          text: "每行约 " + cpl + " 字" + (cplOk ? " 合适" : cpl > 40 ? " 偏长（中文建议 25–40）" : " 偏短（中文建议 25–40）"),
        },
      ];
      out.innerHTML = checks.map(function (c) {
        return '<span class="badge ' + (c.ok ? "badge--ok" : "badge--warn") + '">' + c.text + "</span>";
      }).join("");
    }
    [size, lh, width].forEach(function (el) { el.addEventListener("input", update); });
    update();
  })();

  /* ------------------------------------------------------------ quiz */

  const QUIZ = [
    {
      q: "Windows 11 页内控件（按钮、输入框）的标准圆角是？",
      opts: ["0px", "4px", "8px", "12px"],
      a: 1,
      why: "Windows 11 只有三档：0（直角相接）、4（页内控件）、8（窗口/浮层容器）。",
    },
    {
      q: "Windows 11 正文的默认字号与下限分别是？",
      opts: ["12px / 10px", "14px / 12px", "16px / 14px", "17px / 13px"],
      a: 1,
      why: "正文 14px Regular，12px Regular 是下限；标题从 14px Semibold 起。",
    },
    {
      q: "iOS 的最小触控热区是？",
      opts: ["32×32pt", "40×40pt", "44×44pt", "48×48pt"],
      a: 2,
      why: "Apple HIG 要求 44×44pt；Material 为 48×48dp；桌面鼠标可接受 32×32px。",
    },
    {
      q: "Material 3 的基准栅格是？",
      opts: ["4dp", "8dp", "12dp", "16dp"],
      a: 1,
      why: "M3 用 8dp 主栅格，允许 4dp 半格；组件内边距常用 16dp。",
    },
    {
      q: "正文文字的对比度下限（WCAG 2.2 AA）是？",
      opts: ["3:1", "4.5:1", "7:1", "12:1"],
      a: 1,
      why: "正文 4.5:1；大字号（≥24px 或 ≥18.66px Bold）3:1；AAA 分别是 7:1 / 4.5:1。",
    },
    {
      q: "按钮内文字放不下时，正确做法是？",
      opts: ["把字号缩到 8px", "让文字溢出按钮", "省略号收尾或加宽按钮", "删掉一部分文字用图标代替"],
      a: 2,
      why: "文字必须完整包在按钮内：优先加宽按钮，空间不足时用省略号，禁止溢出或缩到不可读。",
    },
    {
      q: "用户点击后，多快必须出现可见反馈？",
      opts: ["100ms 内", "400ms 内", "1s 内", "3s 内"],
      a: 0,
      why: "按压反馈 100ms 内才算「即时」；Doherty 阈值要求 400ms 内完成一次响应闭环。",
    },
    {
      q: "卡片悬停抬升的建议幅度是？",
      opts: ["≤ 3px", "8px", "16px", "不应有任何变化"],
      a: 0,
      why: "层级 2 的悬停只需 2–3px 位移 + 稍大阴影；抬太多会显得轻浮且造成布局抖动。",
    },
    {
      q: "页面切换动画的推荐时长是？",
      opts: ["80ms", "240–320ms", "500ms", "800ms"],
      a: 1,
      why: "低于 100ms 视为瞬时，高于 400ms 会觉得卡；M3 emphasized 长距离可用到 500ms。",
    },
    {
      q: "Windows 英文界面按钮文案的 casing 规则是？",
      opts: ["sentence case", "Title Case", "ALL CAPS", "没有规定"],
      a: 0,
      why: "Windows 一律 sentence case（仅首字母大写）；全大写只用于 ≤ 3 词的短标签。",
    },
    {
      q: "空状态必须包含什么？",
      opts: ["只写「暂无数据」", "图标/说明 + 一个明确的下一步操作", "一张大幅广告", "自动跳转到其他页面"],
      a: 1,
      why: "空状态要说明现状并给出出口，否则用户会卡死在这一屏。",
    },
    {
      q: "深色模式下，主要文字的推荐透明度是？",
      opts: ["纯白 100%", "white α .94", "white α .60", "灰 #888"],
      a: 1,
      why: "深色模式主文字用 white α .94，次文字 .62，三级 .40；纯白在 OLED 上会刺眼并产生光晕。",
    },
  ];

  (function quiz() {
    const list = $("#quizList");
    const scoreEl = $("#quizScore");
    const totalEl = $("#quizTotal");
    const bar = $("#quizBar");
    const reset = $("#quizReset");
    if (!list) return;

    let correct = 0;
    let answered = 0;

    function render() {
      correct = 0;
      answered = 0;
      if (totalEl) totalEl.textContent = String(QUIZ.length);
      if (scoreEl) scoreEl.textContent = "0";
      if (bar) bar.style.width = "0%";

      list.innerHTML = QUIZ.map(function (item, qi) {
        return '<div class="quiz-q" data-q="' + qi + '">' +
          '<div class="quiz-q__title">' + (qi + 1) + ". " + item.q + "</div>" +
          '<div class="quiz-opts">' +
            item.opts.map(function (o, oi) {
              return '<button class="quiz-opt" type="button" data-opt="' + oi + '">' +
                '<span style="font-family:var(--mono);color:var(--text-3)">' + "ABCD"[oi] + "</span><span>" + o + "</span></button>";
            }).join("") +
          "</div>" +
          '<div class="quiz-explain">' + item.why + "</div>" +
        "</div>";
      }).join("");
    }

    list.addEventListener("click", function (e) {
      const btn = e.target.closest(".quiz-opt");
      if (!btn) return;
      const card = btn.closest(".quiz-q");
      if (!card || card.getAttribute("data-done")) return;
      const qi = Number(card.getAttribute("data-q"));
      const oi = Number(btn.getAttribute("data-opt"));
      const item = QUIZ[qi];
      card.setAttribute("data-done", "1");
      answered++;

      $$(".quiz-opt", card).forEach(function (b, i) {
        if (i === item.a) b.classList.add("is-correct");
        else if (i === oi) b.classList.add("is-wrong");
      });
      const ex = card.querySelector(".quiz-explain");
      if (ex) ex.classList.add("is-on");
      if (oi === item.a) correct++;

      if (scoreEl) scoreEl.textContent = String(correct);
      if (bar) bar.style.width = Math.round((correct / QUIZ.length) * 100) + "%";
      if (answered === QUIZ.length) {
        AG.toast("完成：" + correct + "/" + QUIZ.length);
      }
    });

    if (reset) reset.addEventListener("click", render);
    render();
  })();
})();
