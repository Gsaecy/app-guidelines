/* ==========================================================================
   app.js — renders the data tables and powers the interactive labs.
   No dependencies, no build step.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.DATA;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const num = (n) => (typeof n === "number" ? String(n) : n);

  /* ------------------------------------------------------------- utilities */

  function row(cells, opts) {
    const cls = (opts && opts.cls) || "";
    return "<tr" + (cls ? ' class="' + cls + '"' : "") + ">" +
      cells.map((c) => "<td>" + c + "</td>").join("") + "</tr>";
  }

  function tableRows(tbody, rows) {
    if (!tbody) return;
    tbody.innerHTML = rows.map((r) => row(r)).join("");
  }

  let toastTimer = 0;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 1600);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("已复制 " + text)).catch(() => toast(text));
    } else {
      toast(text);
    }
  }

  /* ------------------------------------------------------------- theme */

  const THEME_KEY = "ag-theme";
  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* private mode */ }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#000000" : "#f5f5f7");
  }
  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
    const btn = $("#themeToggle");
    if (btn) btn.addEventListener("click", () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  })();

  /* ------------------------------------------------------------- meta */

  $$('[data-bind="version"]').forEach((n) => (n.textContent = D.meta.version));
  $$('[data-bind="updated"]').forEach((n) => (n.textContent = D.meta.updated));

  /* ------------------------------------------------------------- decision */

  tableRows($("#decisionBody"), D.decision);

  /* ------------------------------------------------------------- radius */

  (function radius() {
    const grid = $("#radiusSwatches");
    if (grid) {
      grid.innerHTML = D.radiusDemo.map((r) => {
        const radius = r.px >= 999 ? "999px" : r.px + "px";
        return '<div class="radius-demo">' +
          '<div class="radius-demo__box" style="border-radius:' + radius + '"></div>' +
          '<div class="radius-demo__val">' + (r.px >= 999 ? "capsule" : r.px + "px") + "</div>" +
          '<div class="radius-demo__use">' + r.use + "</div>" +
          "</div>";
      }).join("");
    }

    const map = [
      { key: "win", title: "#radiusWinTitle", body: "#radiusWinBody", note: "#radiusWinNote" },
      { key: "apple", title: "#radiusAppleTitle", body: "#radiusAppleBody", note: "#radiusAppleNote" },
      { key: "m3", title: "#radiusM3Title", body: "#radiusM3Body", note: "#radiusM3Note" },
    ];
    map.forEach((m) => {
      const data = D.radiusTiers[m.key];
      $(m.title).textContent = data.title;
      tableRows($(m.body), data.rows);
      $(m.note).textContent = data.note;
    });
  })();

  /* ------------------------------------------------------------- spacing */

  (function spacing() {
    const host = $("#spacingRuler");
    if (host) {
      host.innerHTML = D.spacingScale.map((v) => {
        const w = Math.min(v * 4, 100);
        return '<div class="spacing-row">' +
          '<span class="spacing-row__label">' + v + "px</span>" +
          '<span class="spacing-row__bar" style="width:' + w + 'px"></span>' +
          "</div>";
      }).join("");
    }
    tableRows($("#spacingUseBody"), D.spacingUse);
  })();

  /* ------------------------------------------------------------- type */

  (function type() {
    const host = $("#typeSpecimens");
    if (host) {
      host.innerHTML = D.typeDesktop.map(([name, size, weight, lh, note]) =>
        '<div class="type-row">' +
          '<div class="type-meta">' + size + "px · " + weight + "<br>lh " + lh + "</div>" +
          '<div><div class="type-sample" style="font-size:' + size + "px;font-weight:" + weight + ";line-height:" + lh + '">' + name + "</div>" +
          '<div class="card__hint" style="margin-top:2px">' + note + "</div></div>" +
        "</div>"
      ).join("");
    }
    tableRows($("#typeM3Body"), D.typeM3.map((r) => [r[0], r[1] + " sp", r[2] + " sp"]));

    const tbody = $("#typeAppleBody");
    if (tbody) {
      tbody.innerHTML = D.typeApple.map((r) =>
        '<tr><td>' + r[0] + '</td><td class="mono">' + r[1] + '</td><td class="mono">' + r[2] + "</td><td>" + r[3] + "</td></tr>"
      ).join("");
    }
  })();

  /* ------------------------------------------------------------- icons */

  (function icons() {
    const grid = $("#iconGrid");
    if (grid) {
      grid.innerHTML = D.icons.map(([name, d]) =>
        '<div class="icon-cell">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>' +
          "<span>" + name + "</span></div>"
      ).join("");
    }
    const tbody = $("#iconSystemBody");
    if (tbody) {
      tbody.innerHTML = D.iconSystems.map((r) =>
        '<tr><td>' + r[0] + '</td><td class="mono">' + r[1] + '</td><td class="mono">' + r[2] + "</td></tr>"
      ).join("");
    }
    const rules = $("#iconRules");
    if (rules) rules.innerHTML = D.iconRules.map((t) => "<li>" + t + "</li>").join("");
  })();

  /* ------------------------------------------------------------- controls */

  (function controls() {
    const tbody = $("#controlsBody");
    if (tbody) {
      tbody.innerHTML = D.controls.map((r) =>
        '<tr><td>' + r[0] + '</td><td class="mono">' + r[1] + '</td><td class="mono">' + r[2] +
        '</td><td class="mono">' + r[3] + '</td><td class="mono">' + r[4] + "</td></tr>"
      ).join("");
    }
  })();

  /* ---------------------------------------------------- component specimens */

  const SAMPLES = {
    "按钮 Button":
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<button class="btn btn--primary" type="button">主要操作</button>' +
      '<button class="btn btn--secondary" type="button">次要</button>' +
      '<button class="btn btn--outline" type="button">描边</button>' +
      '<button class="btn btn--primary" type="button" disabled>禁用</button>' +
      "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">' +
      '<button class="btn btn--primary btn--lg" type="button">大按钮 40</button>' +
      '<button class="btn btn--primary btn--sm" type="button">小按钮 26</button>' +
      '<button class="btn btn--primary btn--round" type="button">胶囊 CTA</button>' +
      "</div>",
    "输入框 Text Field":
      '<div class="stack" style="gap:10px">' +
      '<label class="field"><span class="field__label">邮箱</span><input class="input" type="email" placeholder="you@example.com"></label>' +
      '<label class="field"><span class="field__label">错误示例</span>' +
      '<input class="input" value="abc@" style="border-color:#ff453a;box-shadow:0 0 0 3px rgba(255,69,58,.15)"></label>' +
      '<span class="card__hint" style="color:#ff453a">请输入完整的邮箱地址</span>' +
      "</div>",
    "复选框 / 开关":
      '<div class="stack" style="gap:12px">' +
      '<label class="check"><input type="checkbox" checked>开启自动更新</label>' +
      '<label class="check"><input type="checkbox">加入体验计划</label>' +
      '<label class="switch"><input type="checkbox" checked>动态壁纸自动播放</label>' +
      "</div>",
    "导航栏 Navigation":
      '<div style="display:flex;flex-direction:column;gap:4px;max-width:260px">' +
      '<a class="nav__link is-active" style="pointer-events:none"><span class="nav__num">01</span>每日推荐</a>' +
      '<a class="nav__link" style="pointer-events:none"><span class="nav__num">02</span>全部壁纸</a>' +
      '<a class="nav__link" style="pointer-events:none"><span class="nav__num">03</span>壁纸特效</a>' +
      '<a class="nav__link" style="pointer-events:none"><span class="nav__num">04</span>我的收藏</a>' +
      "</div>",
    "下拉菜单 Dropdown":
      '<div style="display:flex;flex-direction:column;gap:6px;max-width:240px">' +
      '<button class="btn btn--outline" type="button" style="justify-content:space-between">分辨率 4K' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"></path></svg></button>' +
      '<div style="border:1px solid var(--line);border-radius:12px;background:var(--card);box-shadow:0 12px 24px rgba(0,0,0,.14);padding:4px">' +
      '<div style="padding:8px 10px;border-radius:8px;background:var(--accent-soft);font-size:13px;color:var(--accent);font-weight:600">4K ✓</div>' +
      '<div style="padding:8px 10px;border-radius:8px;font-size:13px">2K</div>' +
      '<div style="padding:8px 10px;border-radius:8px;font-size:13px">1080p</div>' +
      "</div></div>",
    "面包屑 Breadcrumb":
      '<div style="font-size:13px;color:var(--text-2);display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<a href="#pages">首页</a><span>›</span><a href="#pages">壁纸特效</a><span>›</span>' +
      '<span style="color:var(--text);font-weight:600">液态玻璃</span></div>',
    "卡片 Card":
      '<div class="elev" style="height:auto;padding:16px;display:block;box-shadow:var(--sh-1)">' +
      '<div class="skeleton" style="height:88px;border-radius:12px"></div>' +
      '<div style="font-size:14px;font-weight:600;margin-top:10px">晨雾山谷</div>' +
      '<div class="card__hint">4K · 动态 · 128 MB</div>' +
      "</div>",
    "进度条 Progress":
      '<div class="stack" style="gap:10px">' +
      '<div class="progress"><i style="width:38%"></i></div>' +
      '<div class="progress"><i style="width:72%"></i></div>' +
      '<div class="card__hint">已完成 72% · 剩余约 12 秒</div>' +
      "</div>",
    "模态框 Modal":
      '<button class="btn btn--secondary" type="button" id="modalOpen">打开模态框</button>' +
      '<dialog id="demoModal" style="border:0;padding:0;border-radius:18px;max-width:420px;width:92%;box-shadow:0 18px 40px rgba(0,0,0,.28);background:var(--card);color:var(--text)">' +
      '<div style="padding:22px">' +
      '<div style="font-size:17px;font-weight:600">删除这张壁纸？</div>' +
      '<p style="font-size:13px;color:var(--text-2);margin-top:8px">删除后可从云端重新下载，本地缓存会一并清理。</p>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">' +
      '<button class="btn btn--secondary" type="button" id="modalCancel">取消</button>' +
      '<button class="btn btn--primary" type="button" id="modalOk">删除</button>' +
      "</div></div></dialog>",
    "工具提示 Tooltip":
      '<span style="position:relative;display:inline-block" class="tip-host">' +
      '<button class="btn btn--outline" type="button">悬停查看</button>' +
      '<span class="tip" role="tooltip" style="position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);white-space:nowrap;background:rgba(28,28,30,.94);color:#fff;font-size:12px;padding:6px 10px;border-radius:8px;opacity:0;transition:opacity 160ms;pointer-events:none">下载后自动设为壁纸</span>' +
      "</span>",
    "用户行为召唤 CTA":
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn--primary btn--lg" type="button">立即开通 Pro</button>' +
      '<button class="btn btn--secondary btn--lg" type="button">查看权益</button>' +
      "</div>",
    "分段控件 Segmented":
      '<div class="segmented" role="group" aria-label="示例分段控件">' +
      '<button type="button" class="is-on">全部</button>' +
      '<button type="button">动态</button>' +
      '<button type="button">3D</button>' +
      "</div>",
  };

  (function components() {
    const grid = $("#componentGrid");
    if (!grid) return;
    grid.innerHTML = D.componentSpecs.map((c) =>
      '<div class="card">' +
        '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">' +
          '<div class="card__title">' + c.name + "</div>" +
          '<span class="card__hint" style="font-family:var(--mono)">' + c.en + "</span>" +
        "</div>" +
        '<div style="margin-top:14px">' + (SAMPLES[c.name] || "") + "</div>" +
        '<ul style="margin:14px 0 0;padding-left:18px;font-size:12.5px;color:var(--text-2);line-height:1.8">' +
          c.rules.map((r) => "<li>" + r + "</li>").join("") +
        "</ul>" +
      "</div>"
    ).join("");

    const open = $("#modalOpen");
    const dlg = $("#demoModal");
    if (open && dlg) {
      open.addEventListener("click", () => dlg.showModal());
      $("#modalCancel").addEventListener("click", () => dlg.close());
      $("#modalOk").addEventListener("click", () => { dlg.close(); toast("已删除（示例）"); });
    }

    $$(".tip-host").forEach((host) => {
      const tip = $(".tip", host);
      if (!tip) return;
      const show = () => (tip.style.opacity = "1");
      const hide = () => (tip.style.opacity = "0");
      host.addEventListener("mouseenter", show);
      host.addEventListener("mouseleave", hide);
      host.addEventListener("focusin", show);
      host.addEventListener("focusout", hide);
    });
  })();

  /* ------------------------------------------------------------- color */

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
  }
  function luminance(rgb) {
    const a = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(hexA, hexB) {
    const la = luminance(hexToRgb(hexA));
    const lb = luminance(hexToRgb(hexB));
    const hi = Math.max(la, lb);
    const lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  (function colors() {
    const grid = $("#colorGrid");
    if (!grid) return;
    grid.innerHTML = D.colors.map(([name, hex, use]) => {
      const onWhite = contrast(hex, "#ffffff");
      const onDark = contrast(hex, "#1d1d1f");
      const best = Math.max(onWhite, onDark);
      const cls = best >= 4.5 ? "badge--ok" : best >= 3 ? "badge--warn" : "badge--bad";
      const label = best >= 4.5 ? "可做文字色" : best >= 3 ? "仅大字 / 图标" : "装饰用";
      return '<div class="card">' +
        '<div style="height:56px;border-radius:12px;background:' + hex + ';border:1px solid var(--line)"></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px">' +
          '<div class="card__title">' + name + "</div>" +
          '<span class="badge ' + cls + '">' + best.toFixed(2) + ":1</span>" +
        "</div>" +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px">' +
          '<button class="copy-chip" type="button" data-copy="' + hex + '">' + hex + "</button>" +
          '<span class="card__hint">' + label + "</span>" +
        "</div>" +
        '<div class="card__hint" style="margin-top:6px">' + use + "</div>" +
      "</div>";
    }).join("");

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (btn) copy(btn.getAttribute("data-copy"));
    });
  })();

  /* ------------------------------------------------------------- materials */

  (function materials() {
    const host = $("#materialCards");
    if (host) {
      host.innerHTML = D.materials.map(([name, platform, effect, use]) =>
        '<div class="card">' +
          '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">' +
            '<div class="card__title">' + name + "</div>" +
            '<span class="card__hint">' + platform + "</span>" +
          "</div>" +
          '<p style="font-size:12.5px;color:var(--text-2);margin-top:6px;line-height:1.65">' + effect + "</p>" +
          '<p class="card__hint" style="margin-top:6px">用法：' + use + "</p>" +
        "</div>"
      ).join("");
    }
  })();

  /* ------------------------------------------------------- material lab */

  (function materialLab() {
    const stage = $("#glassStage");
    const card = $("#glassCard");
    if (!stage || !card) return;

    const state = { preset: "liquid", spec: true, rim: true, noise: false, blur: 22, tint: 16, sat: 170 };
    const titles = {
      liquid: ["Liquid Glass", "可折射背景的液态玻璃；只用于控件层，内容层保持实色。"],
      acrylic: ["Acrylic", "半透明模糊 + 噪点 + 色调，Windows 侧栏与浮层的标准解法。"],
      vibrancy: ["Vibrancy", "背景色透到文字与图标，对比度必须重新复核。"],
      plain: ["实色层", "内容层不用材质，保证可读性与性能。"],
    };

    function apply() {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (state.preset === "plain") {
        card.style.background = dark ? "#1c1c1e" : "#ffffff";
        card.style.backdropFilter = "none";
        card.style.webkitBackdropFilter = "none";
        card.style.borderColor = dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.12)";
        card.style.color = dark ? "rgba(255,255,255,.94)" : "#1d1d1f";
      } else {
        card.style.background = "rgba(255,255,255," + (state.tint / 100) + ")";
        card.style.backdropFilter = "blur(" + state.blur + "px) saturate(" + state.sat + "%)";
        card.style.webkitBackdropFilter = "blur(" + state.blur + "px) saturate(" + state.sat + "%)";
        card.style.borderColor = "rgba(255,255,255," + (state.rim ? 0.42 : 0.14) + ")";
        card.style.color = "#fff";
      }
      card.style.setProperty("--spec-opacity", state.spec ? "1" : "0");
      card.style.setProperty("--rim-opacity", state.rim ? "0.55" : "0");
      card.classList.toggle("noise", state.noise);
      card.style.setProperty("--noise-opacity", state.noise ? "0.4" : "0");

      $("#glassTitle").textContent = titles[state.preset][0];
      $("#glassDesc").textContent = titles[state.preset][1];
      $("#blurVal").textContent = state.blur + "px";
      $("#tintVal").textContent = (state.tint / 100).toFixed(2);
      $("#satVal").textContent = state.sat + "%";
    }

    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", x.toFixed(1) + "%");
      card.style.setProperty("--my", y.toFixed(1) + "%");
      const rx = (0.5 - (e.clientY - r.top) / r.height) * 6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      card.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    });
    stage.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "0%");
    });

    const presetHost = $("#glassPreset");
    if (presetHost) {
      presetHost.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-preset]");
        if (!btn) return;
        $$("button", presetHost).forEach((b) => b.classList.toggle("is-on", b === btn));
        state.preset = btn.getAttribute("data-preset");
        if (state.preset === "acrylic") { state.blur = 40; state.sat = 130; state.tint = 28; }
        if (state.preset === "vibrancy") { state.blur = 26; state.sat = 200; state.tint = 12; }
        if (state.preset === "liquid") { state.blur = 22; state.sat = 170; state.tint = 16; }
        $("#glassBlur").value = state.blur;
        $("#glassTint").value = state.tint;
        $("#glassSat").value = state.sat;
        apply();
      });
    }

    $("#glassSpec").addEventListener("change", (e) => { state.spec = e.target.checked; apply(); });
    $("#glassRim").addEventListener("change", (e) => { state.rim = e.target.checked; apply(); });
    $("#glassNoise").addEventListener("change", (e) => { state.noise = e.target.checked; apply(); });
    $("#glassBlur").addEventListener("input", (e) => { state.blur = +e.target.value; apply(); });
    $("#glassTint").addEventListener("input", (e) => { state.tint = +e.target.value; apply(); });
    $("#glassSat").addEventListener("input", (e) => { state.sat = +e.target.value; apply(); });

    apply();
    window.addEventListener("themechange", apply);
  })();

  /* ------------------------------------------------------- scrim / parallax */

  (function scrim() {
    const t = $("#scrimToggle");
    const txt = $("#scrimText");
    if (t && txt) {
      const apply = () => txt.style.setProperty("--scrim", t.checked ? "0.72" : "0");
      t.addEventListener("change", apply);
      apply();
    }
  })();

  (function parallax() {
    const stage = $("#parallaxStage");
    const layer = $("#parallaxLayer");
    if (!stage || !layer) return;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 28;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 18;
      layer.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    });
    stage.addEventListener("pointerleave", () => (layer.style.transform = "translate(0,0)"));
  })();

  /* ------------------------------------------------------------- elevation */

  (function elevation() {
    const grid = $("#elevationGrid");
    if (grid) {
      grid.innerHTML = D.elevation.map(([level, use, y, blur, alpha]) => {
        const shadow = level === 0 ? "none" : "0 " + y + "px " + blur + "px rgba(0,0,0," + alpha + ")";
        return '<div class="elev" style="box-shadow:' + shadow + '">' +
          "层级 " + level + '<br><span style="font-size:11px;opacity:.7">' + use + "</span></div>";
      }).join("");
    }
    const tbody = $("#elevationBody");
    if (tbody) {
      tbody.innerHTML = D.elevation.map((r) =>
        '<tr><td class="mono">' + r[0] + "</td><td>" + r[1] + '</td><td class="mono">' + r[2] +
        '</td><td class="mono">' + r[3] + '</td><td class="mono">' + r[4] + "</td></tr>"
      ).join("");
    }
  })();

  /* ------------------------------------------------------------- motion lab */

  (function motionLab() {
    const dot = $("#motionDot");
    const track = $("#motionTrack");
    const play = $("#motionPlay");
    const picker = $("#curvePicker");
    const durRange = $("#durRange");
    const durVal = $("#durVal");
    const curvePath = $("#curvePath");
    const curveDot = $("#curveDot");
    const code = $("#curveCode");
    if (!dot || !track || !play) return;

    let curve = [0.22, 1, 0.36, 1];
    let duration = 240;
    let anim = null;

    function bezierPoint(p1x, p1y, p2x, p2y, t) {
      const cx = 3 * p1x;
      const bx = 3 * (p2x - p1x) - cx;
      const ax = 1 - cx - bx;
      const cy = 3 * p1y;
      const by = 3 * (p2y - p1y) - cy;
      const ay = 1 - cy - by;
      return {
        x: ((ax * t + bx) * t + cx) * t,
        y: ((ay * t + by) * t + cy) * t,
      };
    }

    function drawCurve() {
      if (!curvePath) return;
      const W = 190;
      const H = 140;
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const p = bezierPoint(curve[0], curve[1], curve[2], curve[3], i / 60);
        pts.push((20 + p.x * W).toFixed(1) + "," + (160 - p.y * H).toFixed(1));
      }
      curvePath.setAttribute("d", "M" + pts.join(" L"));
      if (curveDot) {
        const p = bezierPoint(curve[0], curve[1], curve[2], curve[3], 0.62);
        curveDot.setAttribute("cx", (20 + p.x * W).toFixed(1));
        curveDot.setAttribute("cy", (160 - p.y * H).toFixed(1));
      }
      if (code) code.textContent = "cubic-bezier(" + curve.join(", ") + ")";
    }

    function run() {
      if (anim) anim.cancel();
      const max = track.clientWidth - 34 - 12;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      anim = dot.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(" + max + "px)" }],
        { duration: reduce ? 1 : duration, easing: "cubic-bezier(" + curve.join(",") + ")", fill: "both" }
      );
    }

    if (picker) {
      picker.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-curve]");
        if (!btn) return;
        $$("button", picker).forEach((b) => b.classList.toggle("is-on", b === btn));
        curve = btn.getAttribute("data-curve").split(",").map(Number);
        drawCurve();
      });
    }
    if (durRange) {
      durRange.addEventListener("input", (e) => {
        duration = +e.target.value;
        if (durVal) durVal.textContent = duration + "ms";
      });
    }
    play.addEventListener("click", run);
    drawCurve();
    if (window.ResizeObserver) new ResizeObserver(() => run()).observe(track);
  })();

  /* ------------------------------------------------------------- stagger */

  (function stagger() {
    const grid = $("#staggerGrid");
    const btn = $("#staggerPlay");
    if (!grid) return;
    grid.innerHTML = Array.from({ length: 6 }, () => "<i></i>").join("");
    const cells = $$("i", grid);

    function play() {
      cells.forEach((cell, i) => {
        cell.animate(
          [
            { transform: "translateY(10px) scale(.96)", opacity: 0.15 },
            { transform: "translateY(0) scale(1)", opacity: 0.9 },
          ],
          { duration: 320, delay: i * 55, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "both" }
        );
      });
    }
    if (btn) btn.addEventListener("click", play);
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { play(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(grid);
    }
  })();

  /* ------------------------------------------------------------- ripple */

  (function ripple() {
    const btn = $("#rippleBtn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = size + "px";
      span.style.left = e.clientX - r.left + "px";
      span.style.top = e.clientY - r.top + "px";
      btn.appendChild(span);
      setTimeout(() => span.remove(), 600);
    });
  })();

  /* ------------------------------------------------------------- canvases */

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fitCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 320;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  // cheap value noise
  function hash(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function noise2(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }

  (function flowField() {
    const canvas = $("#flowCanvas");
    if (!canvas) return;
    let ctx, w, h;
    let particles = [];
    let mode = "flow";
    let t = 0;
    let running = false;
    const opts = { bloom: true, vignette: true, dof: false };

    const palette = ["#5ac8fa", "#7b5cff", "#00c2a8", "#ffb340", "#ff5f8f"];

    function reset() {
      const fit = fitCanvas(canvas);
      ctx = fit.ctx; w = fit.w; h = fit.h;
      particles = [];
      const count = mode === "bokeh" ? 26 : 420;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          px: 0, py: 0,
          v: 0.4 + Math.random() * 1.5,
          c: palette[(Math.random() * palette.length) | 0],
          r: mode === "bokeh" ? 14 + Math.random() * 46 : 0.8 + Math.random() * 1.6,
          a: 0.35 + Math.random() * 0.6,
        });
      }
      ctx.fillStyle = "#060a14";
      ctx.fillRect(0, 0, w, h);
    }

    function drawFlow() {
      ctx.fillStyle = "rgba(6,10,20,0.075)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = opts.bloom ? "lighter" : "source-over";
      if (opts.bloom) ctx.shadowBlur = 14;
      ctx.lineWidth = 1.25;
      for (const p of particles) {
        const a = noise2(p.x * 0.0025, p.y * 0.0025 + t * 0.0004) * Math.PI * 4;
        p.px = p.x; p.py = p.y;
        p.x += Math.cos(a) * p.v;
        p.y += Math.sin(a) * p.v;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          continue;
        }
        ctx.shadowColor = p.c;
        ctx.strokeStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    }

    function drawBokeh() {
      ctx.fillStyle = "rgba(6,10,20,0.14)";
      ctx.fillRect(0, 0, w, h);
      for (const p of particles) {
        p.x += Math.sin(t * 0.002 + p.r) * 0.25;
        p.y -= p.v * 0.35;
        if (p.y < -p.r) { p.y = h + p.r; p.x = Math.random() * w; }
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, p.c + "aa");
        g.addColorStop(0.72, p.c + "55");
        g.addColorStop(1, p.c + "00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawCaustics() {
      ctx.fillStyle = "rgba(3,20,28,0.12)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 26; i++) {
        const y0 = (i / 26) * h;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y = y0 +
            Math.sin(x * 0.012 + t * 0.0016 + i) * 14 +
            Math.sin(x * 0.004 - t * 0.001 + i * 1.7) * 22;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(120,240,255," + (0.05 + (i % 5) * 0.02) + ")";
        ctx.lineWidth = 1 + (i % 3);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function frame() {
      if (!running) return;
      t += 16;
      if (mode === "bokeh") drawBokeh();
      else if (mode === "caustics") drawCaustics();
      else drawFlow();
      requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion()) return;
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    reset();

    const picker = $("#fxPicker");
    if (picker) {
      picker.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-fx]");
        if (!btn) return;
        $$("button", picker).forEach((b) => b.classList.toggle("is-on", b === btn));
        mode = btn.getAttribute("data-fx");
        reset();
        if (!running) start();
      });
    }

    const bloom = $("#fxBloom");
    const vig = $("#fxVignette");
    const dof = $("#fxDof");
    if (bloom) bloom.addEventListener("change", (e) => { opts.bloom = e.target.checked; });
    if (vig) vig.addEventListener("change", (e) => {
      opts.vignette = e.target.checked;
      canvas.style.boxShadow = opts.vignette ? "inset 0 0 160px 40px rgba(0,0,0,.75)" : "none";
    });
    if (dof) dof.addEventListener("change", (e) => {
      opts.dof = e.target.checked;
      canvas.style.filter = opts.dof ? "blur(2.5px) saturate(1.1)" : "none";
    });
    if (vig && vig.checked) canvas.style.boxShadow = "inset 0 0 160px 40px rgba(0,0,0,.75)";

    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => (en.isIntersecting ? start() : stop()));
      }, { threshold: 0.15 });
      io.observe(canvas);
    } else {
      start();
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { reset(); if (running) { stop(); start(); } }, 180);
    });
  })();

  (function fishWave() {
    const canvas = $("#fishCanvas");
    if (!canvas) return;
    let ctx, w, h, t = 0, running = false;
    const showEnvelope = () => ($("#fishEnvelope") ? $("#fishEnvelope").checked : true);
    const showPhase = () => ($("#fishPhase") ? $("#fishPhase").checked : true);

    function fit() {
      const f = fitCanvas(canvas);
      ctx = f.ctx; w = f.w; h = f.h;
    }
    fit();

    function centerY(x, phase) {
      const u = x / w;
      const env = Math.pow(u, 1.8);
      const k = 2.4 * Math.PI;
      return h * 0.5 + Math.sin(u * k - phase) * env * h * 0.26;
    }

    function draw(phase) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#060a14";
      ctx.fillRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,.06)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo((w / 6) * i, 0);
        ctx.lineTo((w / 6) * i, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (h / 6) * i);
        ctx.lineTo(w, (h / 6) * i);
        ctx.stroke();
      }

      // amplitude envelope
      if (showEnvelope()) {
        ctx.strokeStyle = "rgba(90,200,250,.35)";
        ctx.setLineDash([5, 5]);
        [-1, 1].forEach((s) => {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 4) {
            const u = x / w;
            const e = Math.pow(u, 1.8) * h * 0.26;
            const y = h * 0.5 + s * e;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }

      // body: ribbon around centerline
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(122,92,255,.25)");
      grad.addColorStop(0.5, "rgba(90,200,250,.35)");
      grad.addColorStop(1, "rgba(0,194,168,.45)");
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const cy = centerY(x, phase);
        const thick = 8 + Math.pow(x / w, 0.9) * h * 0.1;
        if (x === 0) ctx.moveTo(x, cy - thick); else ctx.lineTo(x, cy - thick);
      }
      for (let x = w; x >= 0; x -= 4) {
        const cy = centerY(x, phase);
        const thick = 8 + Math.pow(x / w, 0.9) * h * 0.1;
        ctx.lineTo(x, cy + thick);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // centerline + traveling wave dots
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = centerY(x, phase);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (let i = 0; i <= 10; i++) {
        const x = (w * i) / 10;
        const y = centerY(x, phase);
        ctx.beginPath();
        ctx.arc(x, y, i === 10 ? 6 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = i === 10 ? "#ffb340" : "rgba(255,255,255,.7)";
        ctx.fill();
      }

      // head marker
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.font = "12px -apple-system, Segoe UI, sans-serif";
      ctx.fillText("头 · 摆幅≈0", 10, h * 0.5 - h * 0.34);
      ctx.fillStyle = "#ffb340";
      ctx.fillText("尾 · 摆幅最大", w - 92, h * 0.5 + h * 0.36);

      if (showPhase()) {
        ctx.strokeStyle = "rgba(255,179,64,.55)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        const xh = w * 0.9;
        const yh = centerY(xh, phase);
        ctx.moveTo(xh, yh);
        const xt = w * 0.6;
        ctx.lineTo(xt, centerY(xt, phase));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,179,64,.9)";
        ctx.fillText("相位滞后 Δφ", w * 0.6, Math.min(yh, centerY(xt, phase)) - 10);
      }
    }

    function loop() {
      if (!running) return;
      t += 0.016;
      draw(t * 2.4);
      requestAnimationFrame(loop);
    }

    if (reduceMotion()) {
      draw(1.2);
    } else if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !running) { running = true; requestAnimationFrame(loop); }
          else if (!en.isIntersecting) running = false;
        });
      }, { threshold: 0.15 });
      io.observe(canvas);
    } else {
      running = true;
      requestAnimationFrame(loop);
    }

    ["#fishEnvelope", "#fishPhase"].forEach((sel) => {
      const el = $(sel);
      if (el) el.addEventListener("change", () => draw(t * 2.4));
    });

    let rt = 0;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { fit(); draw(t * 2.4); }, 180);
    });
  })();

  /* ---------------------------------------------------- effect summary cards */

  (function effectCards() {
    const host = $("#effectCardGrid");
    if (!host) return;
    const picks = [
      ["粒子系统", "Particle System", "成千上万个细小球体，各自独立受物理与噪声驱动。"],
      ["流场", "Flow Field", "用二维噪声生成方向场，粒子沿场流动，才有「风」的感觉。"],
      ["泛光", "Bloom", "高亮像素向外扩散，让发光体看起来真的在发光。"],
      ["景深", "Depth of Field", "按深度虚化前后景，眼睛自然聚焦到主体。"],
      ["暗角", "Vignette", "四角压暗，把注意力推向画面中心。"],
      ["散景", "Bokeh", "失焦高光形成圆形光斑，是夜景最廉价的高级感。"],
      ["焦散", "Caustics", "水面折射形成的流动光纹。"],
      ["色差", "Chromatic Aberration", "边缘 RGB 分离，模拟镜头缺陷。"],
    ];
    host.innerHTML = picks.map(([zh, en, desc]) =>
      '<div class="card">' +
        '<div class="card__title">' + zh + "</div>" +
        '<div class="card__hint" style="font-family:var(--mono);margin-top:2px">' + en + "</div>" +
        '<p style="font-size:12.5px;color:var(--text-2);margin-top:8px;line-height:1.65">' + desc + "</p>" +
      "</div>"
    ).join("");
  })();

  /* ------------------------------------------------------------- pages */

  (function pages() {
    const grid = $("#pageGrid");
    if (!grid) return;
    grid.innerHTML = D.pages.map(([zh, en, desc], i) =>
      '<div class="page-card">' +
        '<div class="page-card__idx">' + String(i + 1).padStart(2, "0") + "</div>" +
        '<div class="page-card__body">' +
          '<div class="page-card__name">' + zh + "</div>" +
          '<div class="page-card__en">' + en + "</div>" +
          '<div class="page-card__desc">' + desc + "</div>" +
        "</div>" +
      "</div>"
    ).join("");
  })();

  /* ------------------------------------------------------------- glossary */

  (function glossary() {
    const list = $("#termList");
    const search = $("#glossarySearch");
    const count = $("#glossaryCount");
    const tabs = $("#glossaryTabs");
    if (!list) return;

    let tab = "design";
    let q = "";

    function source() {
      if (tab === "design") {
        return D.terms.flatMap((g) => g.items.map(([zh, en, desc]) => ({ cat: g.cat, zh, en, desc })));
      }
      return D.effects.flatMap((g) => g.items.map(([zh, en, desc]) => ({ cat: g.cat, zh, en, desc })));
    }

    function render() {
      const all = source();
      const needle = q.trim().toLowerCase();
      const items = needle
        ? all.filter((it) =>
            (it.zh + " " + it.en + " " + it.desc + " " + it.cat).toLowerCase().includes(needle)
          )
        : all;

      if (!items.length) {
        list.innerHTML = '<div class="card"><div class="card__hint">没有匹配的术语，换个关键词试试。</div></div>';
      } else {
        list.innerHTML = items.map((it) =>
          '<div class="term">' +
            '<div><div class="term__zh">' + it.zh + '</div><div class="term__en">' + it.en + "</div>" +
            '<div class="term__cat">' + it.cat + "</div></div>" +
            '<div class="term__desc">' + it.desc + "</div>" +
          "</div>"
        ).join("");
      }
      if (count) count.textContent = items.length + " / " + all.length + " 条";
    }

    if (tabs) {
      tabs.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-tab]");
        if (!btn) return;
        $$("button", tabs).forEach((b) => b.classList.toggle("is-on", b === btn));
        tab = btn.getAttribute("data-tab");
        render();
      });
    }
    if (search) {
      search.addEventListener("input", () => { q = search.value; render(); });
    }
    render();
  })();

  /* ------------------------------------------------------------- tokens */

  (function tokens() {
    const tbody = $("#tokenBody");
    if (!tbody) return;
    tbody.innerHTML = D.tokens.map(([name, value, use, isColor]) => {
      const swatch = isColor && /^#/.test(value)
        ? '<span class="dot" style="background:' + value.split(" ")[0] + '"></span>'
        : "";
      return '<tr><td>' + name + '</td><td class="mono">' + swatch +
        '<button class="copy-chip" type="button" data-copy="' + value + '">' + value + "</button></td><td>" + use + "</td></tr>";
    }).join("");
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (btn) copy(btn.getAttribute("data-copy"));
    });
  })();

  /* ------------------------------------------------------------- checklist */

  (function checklist() {
    const grid = $("#checklistGrid");
    const bar = $("#checkProgressBar");
    const text = $("#checkProgressText");
    if (!grid) return;

    const KEY = "ag-checklist";
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }

    grid.innerHTML = D.checklist.map((group, gi) =>
      '<div>' +
        '<div class="card__title" style="margin-bottom:6px">' + group.title + "</div>" +
        '<div class="checklist">' +
        group.items.map((item, ii) => {
          const id = "c" + gi + "-" + ii;
          return '<label for="' + id + '"><input type="checkbox" id="' + id + '" data-id="' + id + '"' +
            (saved[id] ? " checked" : "") + "><span>" + item + "</span></label>";
        }).join("") +
        "</div></div>"
    ).join("");

    const boxes = $$('input[type="checkbox"]', grid);

    function update() {
      const done = boxes.filter((b) => b.checked).length;
      const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      bar.style.width = pct + "%";
      text.textContent = done + " / " + boxes.length + "（" + pct + "%）";
    }

    boxes.forEach((b) => b.addEventListener("change", () => {
      saved[b.getAttribute("data-id")] = b.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* ignore */ }
      update();
    }));

    update();
  })();

  /* ------------------------------------------------------------- sources */

  (function sources() {
    const host = $("#sourceList");
    if (!host) return;
    host.innerHTML = D.sources.map(([name, url]) =>
      '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + name +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-8 8M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"></path></svg></a>'
    ).join("");
  })();

  /* ------------------------------------------------------------- numbering */

  (function autoNumber() {
    const sections = $$("main section[id]");
    sections.forEach((s, i) => {
      const n = String(i + 1).padStart(2, "0");
      const numEl = $(".section__kicker .num", s);
      if (numEl) numEl.textContent = n;
      const link = $('.nav__link[href="#' + s.id + '"]');
      if (link) {
        const ln = $(".nav__num", link);
        if (ln) ln.textContent = n;
      }
    });
  })();

  /* ------------------------------------------------------------- new tables */

  tableRows($("#breakpointBody"), D.breakpoints);
  tableRows($("#layoutSpecBody"), D.layoutSpecs);
  tableRows($("#densityBody"), D.densityModes);
  tableRows($("#colorStateBody"), D.colorStates);
  tableRows($("#stateBody"), D.uiStates);
  tableRows($("#m3EasingBody"), D.m3Easing);
  tableRows($("#copyRuleBody"), D.copyRules);
  tableRows($("#copyLimitBody"), D.copyLimits);
  tableRows($("#casingBody"), D.casing);
  tableRows($("#perfBody"), D.perfBudget);
  tableRows($("#trapBody"), D.traps);

  (function typeWin() {
    const tbody = $("#typeWinBody");
    if (!tbody) return;
    tbody.innerHTML = D.typeWin.map((r) =>
      '<tr><td>' + r[0] + '</td><td class="mono">' + r[1] + '</td><td class="mono">' + r[2] +
      "</td><td>" + r[3] + "</td><td>" + r[4] + "</td></tr>"
    ).join("");
  })();

  (function shadowRecipes() {
    const host = $("#shadowRecipeList");
    if (!host) return;
    host.innerHTML = D.shadowRecipes.map(([name, css]) =>
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
        '<span style="font-size:12.5px;min-width:110px">' + name + "</span>" +
        '<button class="copy-chip" type="button" data-copy="box-shadow: ' + css + '">box-shadow</button>' +
      "</div>"
    ).join("");
    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (btn) copy(btn.getAttribute("data-copy"));
    });
  })();

  (function changelog() {
    const host = $("#changelogList");
    if (!host) return;
    host.innerHTML = D.changelog.map(([ver, date, note]) =>
      '<div class="changelog__item">' +
        '<div class="changelog__ver">v' + ver + "</div>" +
        '<div class="changelog__date">' + date + "</div>" +
        '<div class="changelog__note">' + note + "</div>" +
      "</div>"
    ).join("");
  })();

  /* ------------------------------------------------------------- tools */

  (function contrastTool() {
    const fg = $("#fgColor");
    const bg = $("#bgColor");
    const size = $("#fgSize");
    const preview = $("#contrastPreview");
    const out = $("#contrastResult");
    if (!fg || !bg || !out) return;

    function update() {
      const f = fg.value;
      const b = bg.value;
      const px = Number(size.value) || 14;
      preview.style.color = f;
      preview.style.background = b;
      const ratio = contrast(f, b);
      const isLarge = px >= 24 || px >= 18.66;
      const need = isLarge ? 3 : 4.5;
      const pass = ratio >= need;
      const aaa = ratio >= (isLarge ? 4.5 : 7);
      out.innerHTML =
        '<span class="badge ' + (pass ? "badge--ok" : "badge--bad") + '">' + ratio.toFixed(2) + ":1</span>" +
        "<span>" + (isLarge ? "大字号" : "正文") + "需 ≥ " + need + ":1 · " + (pass ? "通过" : "不通过") +
        (aaa ? " · AAA" : " · 未达 AAA") + "</span>";
    }
    [fg, bg, size].forEach((el) => el.addEventListener("input", update));
    update();
  })();

  (function radiusTool() {
    const outer = $("#outerRadius");
    const pad = $("#innerPadding");
    const inner = $("#innerRadius");
    const demo = $("#nestedDemo");
    const hint = $("#nestedHint");
    if (!outer || !pad) return;

    function update() {
      const R = Math.max(0, Number(outer.value) || 0);
      const P = Math.max(0, Number(pad.value) || 0);
      const value = Math.max(0, R - P);
      if (inner) inner.value = value;
      if (demo) {
        demo.style.setProperty("--outer", R + "px");
        demo.style.setProperty("--pad", Math.min(P, 40) + "px");
        demo.style.setProperty("--inner", value + "px");
      }
      if (hint) {
        const diff = R - P;
        hint.innerHTML = diff >= 4
          ? '<span class="badge badge--ok">差值 ' + diff + 'px</span><span>内外同心，视觉上对齐</span>'
          : '<span class="badge badge--warn">差值 ' + Math.max(0, diff) + 'px</span><span>差值 &lt; 4px，会显得「没对齐」</span>';
      }
    }
    [outer, pad].forEach((el) => el.addEventListener("input", update));
    update();
  })();

  (function shadowTool() {
    const y = $("#shadowY");
    const b = $("#shadowB");
    const a = $("#shadowA");
    const box = $("#shadowBox");
    const code = $("#shadowCode");
    if (!y || !box) return;

    function update() {
      const yy = Number(y.value);
      const bb = Number(b.value);
      const aa = Number(a.value) / 100;
      const css = "0 " + yy + "px " + bb + "px rgba(0,0,0," + aa.toFixed(2) + ")";
      box.style.boxShadow = css;
      code.textContent = "box-shadow: " + css + ";";
      $("#shadowYVal").textContent = yy;
      $("#shadowBVal").textContent = bb;
      $("#shadowAVal").textContent = aa.toFixed(2);
    }
    [y, b, a].forEach((el) => el.addEventListener("input", update));

    const copyBtn = $("#shadowCopy");
    if (copyBtn) copyBtn.addEventListener("click", () => copy(code.textContent));
    update();
  })();

  (function easeTool() {
    const ids = ["easeX1", "easeY1", "easeX2", "easeY2"];
    const els = ids.map((id) => document.getElementById(id));
    const path = $("#toolCurvePath");
    const dot = $("#toolCurveDot");
    const track = $("#toolTrack");
    const ball = $("#toolDot");
    const code = $("#easeCode");
    if (!path) return;

    const labels = { easeX1: "x1v", easeY1: "y1v", easeX2: "x2v", easeY2: "y2v" };

    function point(t) {
      const [x1, y1, x2, y2] = els.map((e) => Number(e.value));
      const cx = 3 * x1;
      const bx = 3 * (x2 - x1) - cx;
      const ax = 1 - cx - bx;
      const cy = 3 * y1;
      const by = 3 * (y2 - y1) - cy;
      const ay = 1 - cy - by;
      return { x: ((ax * t + bx) * t + cx) * t, y: ((ay * t + by) * t + cy) * t };
    }

    function css() {
      return "cubic-bezier(" + els.map((e) => Number(e.value).toFixed(2)).join(", ") + ")";
    }

    function draw() {
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const p = point(i / 60);
        pts.push((20 + p.x * 190).toFixed(1) + "," + (160 - p.y * 140).toFixed(1));
      }
      path.setAttribute("d", "M" + pts.join(" L"));
      if (dot) {
        const p = point(0.62);
        dot.setAttribute("cx", (20 + p.x * 190).toFixed(1));
        dot.setAttribute("cy", (160 - p.y * 140).toFixed(1));
      }
      els.forEach((el) => {
        const lb = document.getElementById(labels[el.id]);
        if (lb) lb.textContent = Number(el.value).toFixed(2);
      });
      code.textContent = css();
    }

    function play() {
      if (!track || !ball) return;
      const max = track.clientWidth - 34 - 12;
      ball.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(" + max + "px)" }],
        { duration: 500, easing: css(), fill: "both" }
      );
    }

    els.forEach((el) => el.addEventListener("input", draw));
    const playBtn = $("#toolPlay");
    if (playBtn) playBtn.addEventListener("click", play);
    const copyBtn = $("#easeCopy");
    if (copyBtn) copyBtn.addEventListener("click", () => copy("transition-timing-function: " + css() + ";"));
    draw();
  })();

  /* ------------------------------------------------------------- token export */

  const TOKENS_EXPORT = {
    color: {
      accent: "#0071E3",
      accentDark: "#0A84FF",
      bgBase: "#F5F5F7",
      bgCard: "#FFFFFF",
      bgSecondary: "#EDEDF0",
      textPrimary: "#1D1D1F",
      success: "#34C759",
      warning: "#FF9F0A",
      danger: "#FF453A",
    },
    radius: { control: "8px", row: "10px", form: "14px", card: "18px", panel: "20px", hero: "24px", pill: "999px" },
    spacing: { s1: "4px", s2: "8px", s3: "12px", s4: "16px", s5: "20px", s6: "24px", s8: "32px", s10: "40px", s12: "48px", s16: "64px" },
    type: { page: "30px", section: "20px", card: "16px", body: "14px", callout: "13px", caption: "12px", meta: "11px" },
    motion: {
      fast: "180ms",
      base: "240ms",
      slow: "320ms",
      easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
      easeStandard: "cubic-bezier(0.2, 0, 0, 1)",
    },
  };

  function download(name, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("已下载 " + name);
  }

  function cssFromTokens() {
    const lines = [":root {"];
    Object.entries(TOKENS_EXPORT.color).forEach(([k, v]) => lines.push("  --color-" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ": " + v + ";"));
    Object.entries(TOKENS_EXPORT.radius).forEach(([k, v]) => lines.push("  --radius-" + k + ": " + v + ";"));
    Object.entries(TOKENS_EXPORT.spacing).forEach(([k, v]) => lines.push("  --space-" + k.replace("s", "") + ": " + v + ";"));
    Object.entries(TOKENS_EXPORT.type).forEach(([k, v]) => lines.push("  --font-" + k + ": " + v + ";"));
    Object.entries(TOKENS_EXPORT.motion).forEach(([k, v]) => lines.push("  --motion-" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ": " + v + ";"));
    lines.push("}");
    return lines.join("\n");
  }

  (function exportUi() {
    const preview = $("#tokenPreview");
    if (!preview) return;
    const json = JSON.stringify(TOKENS_EXPORT, null, 2);
    preview.textContent = json;

    const j = $("#exportJson");
    const c = $("#exportCss");
    if (j) j.addEventListener("click", () => download("tokens.json", json, "application/json"));
    if (c) c.addEventListener("click", () => download("tokens.css", cssFromTokens(), "text/css"));
  })();

  /* ------------------------------------------------------------- search palette */

  (function palette() {
    const overlay = $("#palette");
    const input = $("#paletteInput");
    const list = $("#paletteList");
    const openBtn = $("#searchOpen");
    if (!overlay || !input || !list) return;

    const items = [];
    $$("main section[id]").forEach((s) => {
      const head = s.querySelector("h1, h2");
      const kicker = s.querySelector(".section__kicker");
      if (!head) return;
      items.push({
        label: head.textContent.trim(),
        sub: kicker ? kicker.textContent.replace(/\s+/g, " ").trim() : "概览",
        target: s.id,
        kind: "chapter",
        group: "章节",
      });
    });
    D.terms.forEach((g) =>
      g.items.forEach(([zh, en, desc]) => items.push({ label: zh + " · " + en, sub: desc, target: "glossary", kind: "term", group: g.cat, query: zh }))
    );
    D.effects.forEach((g) =>
      g.items.forEach(([zh, en, desc]) => items.push({ label: zh + " · " + en, sub: desc, target: "glossary", kind: "effect", group: g.cat, query: zh }))
    );

    let filtered = items;
    let sel = 0;

    function render() {
      if (!filtered.length) {
        list.innerHTML = '<div class="palette__empty">没有匹配结果，换个关键词试试</div>';
        return;
      }
      list.innerHTML = filtered.slice(0, 40).map((it, i) =>
        '<div class="palette__item' + (i === sel ? " is-sel" : "") + '" data-i="' + i + '" role="option">' +
          "<span>" + it.label + "</span>" +
          "<small>" + it.group + "</small>" +
        "</div>"
      ).join("");
    }

    function update() {
      const q = input.value.trim().toLowerCase();
      filtered = !q ? items : items.filter((it) =>
        (it.label + " " + it.sub + " " + it.group).toLowerCase().includes(q)
      );
      sel = 0;
      render();
    }

    function open() {
      overlay.hidden = false;
      input.value = "";
      update();
      setTimeout(() => input.focus(), 20);
    }
    function close() {
      overlay.hidden = true;
      if (openBtn) openBtn.focus();
    }

    function go(it) {
      close();
      const target = document.getElementById(it.target);
      if (target) target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
      if (it.kind === "term" || it.kind === "effect") {
        const tabs = $("#glossaryTabs");
        const tabBtn = tabs && tabs.querySelector('button[data-tab="' + (it.kind === "term" ? "design" : "effect") + '"]');
        if (tabBtn) tabBtn.click();
        const search = $("#glossarySearch");
        if (search) {
          search.value = it.query;
          search.dispatchEvent(new Event("input"));
        }
      }
    }

    if (openBtn) openBtn.addEventListener("click", open);
    overlay.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-close")) close();
    });
    input.addEventListener("input", update);
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, Math.min(filtered.length, 40) - 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === "Enter") { e.preventDefault(); if (filtered[sel]) go(filtered[sel]); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
    });
    list.addEventListener("click", (e) => {
      const row = e.target.closest(".palette__item");
      if (!row) return;
      const it = filtered[Number(row.getAttribute("data-i"))];
      if (it) go(it);
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
      else if (e.key === "Escape" && !overlay.hidden) close();
    });
  })();

  /* ------------------------------------------------------------- scrollspy */

  (function scrollspy() {
    const links = $$(".nav__link").filter((l) => (l.getAttribute("href") || "").charAt(0) === "#");
    const sections = links.map((l) => document.getElementById(l.getAttribute("href").slice(1))).filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + id));
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach((s) => io.observe(s));
  })();

  /* ------------------------------------------------------------- nav smooth */

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });
})();
