/* ==========================================================================
   principles.js — law cards + three hands-on experiments.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const GESTALT = [
    ["接近性", "Proximity", "距离近的元素被看成一组。", "同组间距 ≤ 组间间距的 1/2；卡片内 16，卡片间 16–24 并用分组标题断开。"],
    ["相似性", "Similarity", "形状、颜色、大小相似的元素被归为一类。", "同类操作同色同形；危险操作必须换颜色 + 图标，不能只靠位置。"],
    ["闭合性", "Closure", "大脑会自动补全不完整的形状。", "图标可以留缺口；卡片不必画满边框，留白也能成组。"],
    ["连续性", "Continuity", "视线沿连续线条移动。", "表单与列表左对齐成一条线，避免锯齿状对齐。"],
    ["图底关系", "Figure / Ground", "注意力区分主体与背景。", "模态用遮罩压暗背景；内容层不要用比背景更弱的对比。"],
    ["共同区域", "Common Region", "同一容器内的元素被看成一组。", "用背景色或描边划分区块，比单纯加间距更强。"],
  ];

  const COGNITION = [
    ["米勒定律", "Miller's Law", "工作记忆约 4±1 个组块，不是 7±2 的「无限容量」。", "导航 5–7 项封顶；长表单分步；数字分组显示。"],
    ["冯·雷斯托夫效应", "Von Restorff", "与众不同的那一个最容易被记住。", "一屏只让一个元素「跳出来」：主 CTA、当前项、错误项。"],
    ["序列位置效应", "Serial Position", "开头与结尾记得最牢，中间最容易被忘。", "重要项放首尾；长列表中间放次要信息，并提供搜索。"],
    ["峰终定律", "Peak-End Rule", "体验由最高峰和结束时的感受决定。", "把最顺的一步放结尾（成功页/完成动画）；错误恢复体验决定口碑。"],
    ["认知负荷", "Cognitive Load", "同时处理的变量越少，完成率越高。", "默认值、智能填充、记住上次选择；高级选项进「更多」。"],
    ["渐进披露", "Progressive Disclosure", "先给必要信息，按需展开。", "设置页分组；首次使用只教 1 件事，其余用tooltip。"],
  ];

  const CONVENTION = [
    ["雅各布定律", "Jakob's Law", "用户大部分时间花在别的产品上，期望你的产品像它们。", "沿用平台控件与手势；自定义交互要有明显收益。"],
    ["特斯勒定律", "Tesler's Law", "复杂度守恒：要么系统承担，要么用户承担。", "把复杂度放进默认值、预设与自动化，而不是塞进界面。"],
    ["美学-可用性效应", "Aesthetic-Usability", "好看的东西会被认为更好用（但只在小问题上）。", "视觉精致度影响容错；但可用性缺陷不会被美观掩盖。"],
    ["心智模型", "Mental Model", "用户按既有理解预测结果。", "沿用「齿轮=设置」「垃圾桶=删除」；新概念必须给可见解释。"],
    ["信息架构", "Information Architecture", "分类与命名决定可发现性。", "用用户词而不是内部术语；一级分类 ≤ 7 个。"],
    ["最小惊讶", "Principle of Least Astonishment", "同样的操作应产生同样的结果。", "全局一致：同一图标同一含义，同一手势同一行为。"],
  ];

  const MAPPING = [
    ["Fitts 定律", "目标越大越近越快", "热区 ≥ 44×44pt / 32×32px；主按钮高度 40–50；危险操作不要贴边"],
    ["Hick 定律", "选项越多决策越慢", "一级导航 3–7 项；下拉 ≤ 12 项，更多用搜索"],
    ["Doherty 阈值", "400ms 内必须有反馈", "悬停/按压 120–180ms；页面切换 240–320ms"],
    ["米勒定律", "工作记忆 4±1 块", "表单分步；卡片信息 ≤ 3 层；导航分组"],
    ["格式塔·接近性", "间距即分组", "同组 16 / 组间 24–32；间距全是 4 的倍数"],
    ["格式塔·共同区域", "容器即分组", "卡片圆角 12–20 + 内边距 16–24"],
    ["峰终定律", "结尾决定记忆", "成功页/完成态必须有明确反馈，错误要给出下一步"],
    ["雅各布定律", "沿用平台约定", "Windows 圆角 4/8、sentence case；iOS 44pt 热区"],
  ];

  function mountLawCards(id, list) {
    const host = document.getElementById(id);
    if (!host) return;
    host.innerHTML = list.map(function (item) {
      return '<div class="law">' +
        '<div class="law__head"><span class="law__zh">' + item[0] + "</span><span class=\"law__en\">" + item[1] + "</span></div>" +
        '<div class="law__body">' + item[2] + "</div>" +
        '<div class="law__apply"><b>落地：</b>' + item[3] + "</div>" +
      "</div>";
    }).join("");
  }

  mountLawCards("gestaltCards", GESTALT);
  mountLawCards("cognitionCards", COGNITION);
  mountLawCards("conventionCards", CONVENTION);

  const mapBody = $("#mappingBody");
  if (mapBody) {
    mapBody.innerHTML = MAPPING.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>";
    }).join("");
  }

  /* ------------------------------------------------------------ gestalt dots */

  (function gestaltDots() {
    const host = $("#gestaltDots");
    const note = $("#gestaltNote");
    const sw = $("#gestaltSwitch");
    if (!host) return;

    const groups = [3, 3, 3, 3];
    const counts = [4, 4, 4];

    function render(gap) {
      const dots = [];
      counts.forEach(function (n, gi) {
        for (let i = 0; i < n; i++) {
          dots.push('<span class="gdot' + (gi % 2 ? " gdot--alt" : "") + '"></span>');
        }
      });
      host.style.gap = gap + "px";
      host.innerHTML = dots.join("");
      if (note) {
        note.textContent = gap <= 4
          ? "间距 4px：12 个点被看成一个整体。"
          : gap <= 16
            ? "间距 16px：开始出现「4-4-4」的分组感，但仍属于同一区域。"
            : "间距 32px：明确分成三组——这就是「间距即分组」。";
      }
    }

    if (sw) {
      sw.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-gap]");
        if (!btn) return;
        $$("button", sw).forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        render(Number(btn.getAttribute("data-gap")));
      });
    }
    render(4);
    void groups;
  })();

  /* ------------------------------------------------------------ fitts */

  (function fitts() {
    const stage = $("#fittsStage");
    const target = $("#fittsTarget");
    if (!stage || !target) return;

    let condition = "near";
    let startAt = 0;
    const times = { near: [], far: [] };

    function layout() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const size = condition === "near" ? 64 : 26;
      const left = condition === "near" ? 24 : w - size - 24;
      const top = condition === "near" ? 24 : h - size - 24;
      target.style.width = target.style.height = size + "px";
      target.style.left = left + "px";
      target.style.top = top + "px";
      target.style.fontSize = condition === "near" ? "12px" : "9px";
      target.textContent = condition === "near" ? "点击" : "·";
      startAt = performance.now();
    }

    function stats() {
      const avg = function (arr) {
        if (!arr.length) return "—";
        return Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length) + "ms";
      };
      const a = $("#fittsNear");
      const b = $("#fittsFar");
      if (a) a.textContent = avg(times.near);
      if (b) b.textContent = avg(times.far);
      const c = $("#fittsCount");
      if (c) c.textContent = String(times.near.length + times.far.length);
    }

    target.addEventListener("click", function () {
      const dt = Math.round(performance.now() - startAt);
      times[condition].push(dt);
      condition = condition === "near" ? "far" : "near";
      stats();
      layout();
    });

    const reset = $("#fittsReset");
    if (reset) reset.addEventListener("click", function () {
      times.near = [];
      times.far = [];
      condition = "near";
      stats();
      layout();
    });

    layout();
    stats();
  })();

  /* ------------------------------------------------------------ hick */

  (function hick() {
    const grid = $("#hickGrid");
    const msEl = $("#hickMs");
    const nEl = $("#hickN");
    const levels = $("#hickLevels");
    if (!grid) return;

    let count = 2;
    let targetAt = 0;
    const samples = [];

    function startRound() {
      const idx = Math.floor(Math.random() * count);
      $$(".hick-btn", grid).forEach(function (b, i) {
        b.classList.toggle("is-target", i === idx);
      });
      targetAt = performance.now();
    }

    function build() {
      grid.className = "hick-grid hick-grid--" + (count === 2 ? "2" : "4");
      grid.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hick-btn";
        b.textContent = "选项 " + (i + 1);
        b.addEventListener("click", function () {
          if (!b.classList.contains("is-target")) return;
          samples.push(performance.now() - targetAt);
          if (msEl) msEl.textContent = Math.round(samples.reduce(function (a, c) { return a + c; }, 0) / samples.length) + "ms";
          if (nEl) nEl.textContent = String(samples.length);
          b.classList.remove("is-target");
          setTimeout(startRound, 450);
        });
        grid.appendChild(b);
      }
      startRound();
    }

    if (levels) {
      levels.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-n]");
        if (!btn) return;
        $$("button", levels).forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        count = Number(btn.getAttribute("data-n"));
        samples.length = 0;
        if (msEl) msEl.textContent = "—";
        if (nEl) nEl.textContent = "0";
        build();
      });
    }

    const reset = $("#hickReset");
    if (reset) reset.addEventListener("click", function () {
      samples.length = 0;
      if (msEl) msEl.textContent = "—";
      if (nEl) nEl.textContent = "0";
      build();
    });

    build();
  })();

  /* ------------------------------------------------------------ chunking */

  (function chunking() {
    const start = $("#chunkStart");
    const display = $("#chunkDisplay");
    const mode = $("#chunkMode");
    if (!start || !display) return;

    let block = true;
    let digits = "";

    if (mode) {
      mode.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-mode]");
        if (!btn) return;
        $$("button", mode).forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        block = btn.getAttribute("data-mode") === "block";
      });
    }

    start.addEventListener("click", function () {
      digits = String(Math.floor(100000000000 + Math.random() * 899999999999));
      const shown = block ? digits.replace(/(\d{4})(?=\d)/g, "$1 ") : digits;
      display.textContent = shown;
      display.style.color = "var(--accent)";
      start.disabled = true;

      setTimeout(function () {
        display.textContent = block ? "• • •  • • •  • • •" : "• • • • • • • • • • • •";
        display.style.color = "var(--text-3)";
        setTimeout(function () {
          display.textContent = shown + "  ← 刚才的数字";
          display.style.color = "var(--text-2)";
          start.disabled = false;
        }, 3200);
      }, 2000);
    });
  })();
})();
