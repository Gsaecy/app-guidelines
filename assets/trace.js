/* ==========================================================================
   trace.js — image → binary mask → contour loops → geometric draft → SVG/AI.
   No dependencies. All processing happens in the browser.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const svgNS = "http://www.w3.org/2000/svg";

  const state = {
    img: null,
    threshold: 128,
    simplify: 2.2,
    invert: false,
    guides: true,
    color: "#9AA0A6",
    loops: [],
    fits: [],
    fit: true,
    construct: true,
    gridN: 12,
    unify: true,
    standard: true,
    canonical: true,
    w: 0,
    h: 0,
    name: "",
    processed: false,
    busy: false,
  };

  const MAX = 520;
  const OK_TYPE = /^image\/(png|jpeg|jpg|pjpeg|webp|gif|bmp|x-ms-bmp|svg\+xml|avif)$/i;
  const OK_EXT = /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i;
  const MAX_BYTES = 24 * 1024 * 1024;

  /* ------------------------------------------------------------ status */

  function progress(pct, label) {
    const wrap = $("#traceProgressWrap");
    const fill = $("#traceProgressFill");
    const lab = $("#traceProgressLabel");
    if (wrap) wrap.hidden = pct < 0;
    if (fill) fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
    if (lab && label) lab.textContent = label;
  }

  function setExports(on) {
    ["#dlAiQuick", "#dlAi", "#dlSvg", "#dlPng"].forEach(function (sel) {
      const b = $(sel);
      if (b) b.disabled = !on;
    });
  }

  function status(msg, kind) {
    const info = $("#traceInfo");
    if (info) {
      info.textContent = msg;
      info.style.color = kind === "err" ? "#D70015" : "";
    }
    if (kind === "err" && window.AG && AG.toast) AG.toast(msg);
  }

  function fail(msg) {
    status(msg, "err");
    const bar = $("#traceStatus");
    if (bar) {
      bar.className = "trace-status is-err";
      bar.innerHTML = "<b>✕ 上传失败</b> " + msg;
    }
  }

  // 上传成功的明确回执：缩略图 + 文件名 + 体积 + 像素尺寸
  function uploadReceipt(file, img) {
    const kb = file.size / 1024;
    const size = kb >= 1024 ? (kb / 1024).toFixed(2) + " MB" : Math.round(kb) + " KB";
    const bar = $("#traceStatus");
    if (bar) {
      bar.className = "trace-status is-ok";
      bar.innerHTML = "<b>✓ 已上传</b> " + (file.name || "图片") + " · " + size + " · " +
        img.width + "×" + img.height + " px · 待处理";
    }
    const drop = $("#traceDrop");
    if (drop) {
      const url = img.src;
      drop.innerHTML = '<img class="trace-thumb" alt="已上传的图片" src="' + url + '">' +
        '<div style="font-size:12px;font-weight:600;margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
        (file.name || "图片") + "</div>" +
        '<div style="font-size:11px;color:var(--text-2);margin-top:2px">' + size + " · " + img.width + "×" + img.height +
        ' px · 点击可重新选择</div>';
    }
  }

  /* ------------------------------------------------------------ image load */

  function decode(file, cb, onError) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = function () {
      cb(img);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      onError();
    };
    img.src = url;
  }

  function loadFile(file) {
    if (!file) return fail("没有读到文件，请重新选择或换一张图片。");
    const type = file.type || "";
    const name = file.name || "未命名图片";
    if (!OK_TYPE.test(type) && !OK_EXT.test(name)) {
      fail("不支持的格式：" + (type || "未知类型") + "。请用 PNG / JPG / WebP / SVG；iPhone 的 HEIC 请先导出为 JPG。");
      return;
    }
    if (file.size > MAX_BYTES) {
      fail("图片 " + (file.size / 1048576).toFixed(1) + "MB，超过 24MB 上限，请先压缩。");
      return;
    }
    status("正在解析 " + name + " …");
    const bar0 = $("#traceStatus");
    if (bar0) { bar0.className = "trace-status"; bar0.textContent = "正在解析 " + name + " …"; }
    decode(file, function (img) {
      state.img = img;
      state.name = name;
      uploadReceipt(file, img);
      state.processed = false;
      setExports(false);
      progress(0, "已读取图片，点「开始处理」生成切割草稿");
      const run = $("#traceRun");
      if (run) { run.disabled = false; run.textContent = "开始处理"; }
      const host = $("#traceStage");
      if (host) host.innerHTML = '<div style="font-size:12px;color:var(--text-3)">已就绪：点「开始处理」后再生成草稿</div>';
    }, function () {
      fail("这张图片无法解码（可能已损坏或浏览器不支持该编码），请另存为 PNG/JPG 后重试。");
    });
  }

  /* ------------------------------------------------------------ demo images */

  function demoImage(kind) {
    const body = kind === "ring"
      ? '<path d="M200 40a160 160 0 1 0 .1 0Z"/><path d="M200 92a108 108 0 1 1-.1 0Z" fill="#fff"/>'
      : '<path d="M200 36c62 78 128 118 128 186a128 128 0 0 1-256 0c0-68 66-108 128-186Z"/><path d="M200 150c26 34 52 50 52 78a52 52 0 0 1-104 0c0-28 26-44 52-78Z" fill="#fff"/>';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
      '<rect width="400" height="400" fill="#fff"/><g fill="#111">' + body + "</g></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function loadDemo(kind) {
    const src = demoImage(kind);
    const img = new Image();
    img.onload = function () {
      state.img = img;
      state.name = kind === "ring" ? "示例 · 圆环" : "示例 · 叶片";
      const bar = $("#traceStatus");
      if (bar) {
        bar.className = "trace-status is-ok";
        bar.innerHTML = "<b>✓ 已载入示例</b> " + state.name + " · " + img.width + "×" + img.height + " px";
      }
      const run = $("#traceRun");
      if (run) { run.disabled = false; run.textContent = "开始处理"; }
      runProcess();
    };
    img.onerror = function () { fail("示例图加载失败，请刷新页面。"); };
    img.src = src;
  }

  /* ------------------------------------------------------------ mask */

  function buildMask(img) {
    const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    // 1) 取边框像素估计背景色（白底、深底、纯色底都适用）
    let br = 0, bg = 0, bb = 0, bn = 0;
    const sample = function (x, y) {
      const i = (y * w + x) * 4;
      br += data[i]; bg += data[i + 1]; bb += data[i + 2]; bn++;
    };
    for (let x = 0; x < w; x++) { sample(x, 0); sample(x, h - 1); }
    for (let y = 0; y < h; y++) { sample(0, y); sample(w - 1, y); }
    br /= bn; bg /= bn; bb /= bn;

    // 2) 与背景色的最大通道差 > 容差 即视为前景（阈值滑杆映射到 18–108）
    const tol = 18 + (state.threshold / 255) * 90;
    const mask = new Uint8Array(w * h);
    let on = 0;
    for (let i = 0, q = 0; i < data.length; i += 4, q++) {
      const a = data[i + 3] / 255;
      if (a < 0.45) { mask[q] = 0; continue; }              // 透明 = 背景
      const dr = Math.abs(data[i] - br);
      const dg = Math.abs(data[i + 1] - bg);
      const db = Math.abs(data[i + 2] - bb);
      const diff = Math.max(dr, dg, db);
      const isFg = diff > tol ? 1 : 0;
      mask[q] = isFg;
      on += isFg;
    }

    // 3) 深底图（前景占满画布）自动反转
    const coverage = on / (w * h);
    const flip = state.invert ? coverage < 0.5 : coverage > 0.7;
    if (flip) {
      for (let k = 0; k < mask.length; k++) mask[k] = 1 - mask[k];
      state.autoFlipped = !state.invert;
    } else {
      state.autoFlipped = false;
    }

    // 4) 颜色法一无所获时退回亮度阈值（灰度图、手绘扫描）
    if (on === 0 || on === w * h) {
      const lt = state.threshold;
      let on2 = 0;
      for (let i = 0, q = 0; i < data.length; i += 4, q++) {
        const a = data[i + 3] / 255;
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * a + 255 * (1 - a);
        const v = lum < lt ? 1 : 0;
        mask[q] = v;
        on2 += v;
      }
      if (on2 / (w * h) > 0.7) {
        for (let k = 0; k < mask.length; k++) mask[k] = 1 - mask[k];
        state.autoFlipped = true;
      }
    }
    // 3×3 多数表决去噪：去掉 1px 毛刺与孤立点，轮廓更贴合真实边缘
    const clean = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            sum += mask[yy * w + xx];
            n++;
          }
        }
        clean[y * w + x] = sum * 2 > n ? 1 : 0;
      }
    }
    return { mask: clean, w, h };
  }

  /* ------------------------------------------------------------ marching squares */

  function contours(mask, w, h) {
    const segs = [];
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : mask[y * w + x]);

    function edge(x, y, side) {
      // side: 0 top, 1 right, 2 bottom, 3 left  (cell x,y top-left)
      if (side === 0) return [x + 0.5, y];
      if (side === 1) return [x + 1, y + 0.5];
      if (side === 2) return [x + 0.5, y + 1];
      return [x, y + 0.5];
    }

    for (let y = -1; y < h; y++) {
      for (let x = -1; x < w; x++) {
        const a = at(x, y);
        const b = at(x + 1, y);
        const c = at(x + 1, y + 1);
        const d = at(x, y + 1);
        const idx = a * 8 + b * 4 + c * 2 + d;
        if (idx === 0 || idx === 15) continue;
        const S = [];
        if (a !== b) S.push([edge(x, y, 0)[0], edge(x, y, 0)[1]]);
        if (b !== c) S.push(edge(x, y, 1));
        if (d !== c) S.push(edge(x, y, 2));
        if (a !== d) S.push(edge(x, y, 3));
        if (S.length === 2) segs.push([S[0], S[1]]);
        else if (S.length === 4) {
          segs.push([S[0], S[1]]);
          segs.push([S[2], S[3]]);
        }
      }
    }
    return chain(segs);
  }

  function key(p) { return p[0].toFixed(2) + "," + p[1].toFixed(2); }

  function chain(segs) {
    const map = new Map();
    segs.forEach(function (s, i) {
      [s[0], s[1]].forEach(function (p) {
        const k = key(p);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(i);
      });
    });
    const used = new Uint8Array(segs.length);
    const loops = [];

    for (let i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      const loop = [segs[i][0], segs[i][1]];
      used[i] = 1;
      let guard = 0;
      while (guard++ < 1e6) {
        const end = loop[loop.length - 1];
        if (key(end) === key(loop[0]) && loop.length > 3) break;
        const cands = map.get(key(end)) || [];
        let next = -1;
        for (let j = 0; j < cands.length; j++) {
          if (!used[cands[j]]) { next = cands[j]; break; }
        }
        if (next < 0) break;
        used[next] = 1;
        const s = segs[next];
        loop.push(key(s[0]) === key(end) ? s[1] : s[0]);
      }
      if (loop.length > 3) loops.push(loop);
    }
    return loops;
  }

  /* ------------------------------------------------------------ simplify (RDP) */

  function rdp(points, eps) {
    if (points.length < 4) return points;
    const first = points[0];
    const last = points[points.length - 1];
    let maxD = -1;
    let idx = 0;
    const dx = last[0] - first[0];
    const dy = last[1] - first[1];
    const len = Math.hypot(dx, dy) || 1;
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      const d = Math.abs(dy * p[0] - dx * p[1] + last[0] * first[1] - last[1] * first[0]) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD <= eps) return [first, last];
    const left = rdp(points.slice(0, idx + 1), eps);
    const right = rdp(points.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }

  function area(loop) {
    let a = 0;
    for (let i = 0; i < loop.length; i++) {
      const p = loop[i];
      const q = loop[(i + 1) % loop.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(a / 2);
  }

  /* ------------------------------------------------------------ render */

  function trace() {
    if (!state.img) return;
    const built = buildMask(state.img);
    if (state.construct) buildDisks(built.mask, built.w, built.h);
    snapStandardShape(built.mask, built.w, built.h);
    detectHoles(built.mask, built.w, built.h);
    let loops = contours(built.mask, built.w, built.h);
    const minArea = Math.max(4, built.w * built.h * 0.00002);
    loops = loops
      .map(function (l) {
        const pts = l.slice();
        const a = pts[0];
        const b = pts[pts.length - 1];
        if (Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01) pts.pop();
        const s = rdp(pts, state.simplify * 0.5);
        if (s.length > 2) s.push(s[0]);
        return s;
      })
      .filter(function (l) { return l.length > 3 && area(l) >= minArea; });
    state.loops = loops;
    state.fits = buildFits();
    state.w = built.w;
    state.h = built.h;
    if (state.fit) rebuildFromCircles();
    state.processed = true;
    radiusFamily();
    if (state.canonical) canonicalize();
    render();
    familyPanel();
    setExports(false);
    setExports(true);
    const st = fitStats();
    status(loops.length
      ? "线稿已生成"
      : "检测不到图形：换一张主体清晰的图，或调小颜色容差 / 勾选「反转前景 / 背景」");
  }

  /* ------------------------------------------- geometry fitting: line / arc / cubic */

  function norm2pi(a) { a = a % (Math.PI * 2); return a < 0 ? a + Math.PI * 2 : a; }
  function angDiff(a, b) { let d = norm2pi(a) - norm2pi(b); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }

  function solve3(m, v) {
    const det = function (a) {
      return a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
        - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
        + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    };
    const D = det(m);
    if (Math.abs(D) < 1e-9) return null;
    const rep = function (col) {
      return m.map(function (row, i) {
        return row.map(function (val, j) { return j === col ? v[i] : val; });
      });
    };
    return [det(rep(0)) / D, det(rep(1)) / D, det(rep(2)) / D];
  }

  // Algebraic (Kåsa) circle fit + max radial residual.
  function circleOf(pts) {
    let n = pts.length, Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, Sz = 0;
    for (let i = 0; i < n; i++) {
      const x = pts[i][0], y = pts[i][1], z = x * x + y * y;
      Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y;
      Sxz += x * z; Syz += y * z; Sz += z;
    }
    const sol = solve3([[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, n]], [Sxz, Syz, Sz]);
    if (!sol) return null;
    let cx = sol[0] / 2, cy = sol[1] / 2;
    let r2 = sol[2] + cx * cx + cy * cy;
    if (!(r2 > 0)) return null;
    let r = Math.sqrt(r2);

    // 径向最小二乘精修（Kåsa 对短弧有偏，精修后残差显著下降）
    for (let it = 0; it < 8; it++) {
      let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < n; i++) {
        const dx = pts[i][0] - cx, dy = pts[i][1] - cy;
        const d = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / d, uy = dy / d;
        const res = d - r;
        a11 += ux * ux; a12 += ux * uy; a22 += uy * uy;
        b1 += ux * res; b2 += uy * res;
      }
      const det = a11 * a22 - a12 * a12;
      if (!(Math.abs(det) > 1e-9)) break;
      const ddx = (a22 * b1 - a12 * b2) / det;
      const ddy = (a11 * b2 - a12 * b1) / det;
      cx += ddx; cy += ddy;
      r = 0;
      for (let i = 0; i < n; i++) r += Math.hypot(pts[i][0] - cx, pts[i][1] - cy);
      r /= n;
      if (Math.abs(ddx) + Math.abs(ddy) < 1e-4) break;
    }

    if (!isFinite(r) || r < 3 || r > 40000) return null;
    let maxErr = 0;
    for (let i = 0; i < n; i++) {
      maxErr = Math.max(maxErr, Math.abs(Math.hypot(pts[i][0] - cx, pts[i][1] - cy) - r));
    }
    return { cx: cx, cy: cy, r: r, maxErr: maxErr };
  }

  function arcFit(pts, tol) {
    if (pts.length < 3) return null;
    const c = circleOf(pts);
    if (!c || c.maxErr > tol) return null;
    const n = pts.length, p0 = pts[0], p1 = pts[n - 1], pm = pts[Math.floor(n / 2)];
    const a0 = Math.atan2(p0[1] - c.cy, p0[0] - c.cx);
    const a1 = Math.atan2(p1[1] - c.cy, p1[0] - c.cx);
    const am = Math.atan2(pm[1] - c.cy, pm[0] - c.cx);
    const dPlus = norm2pi(a1 - a0);
    const dMinus = dPlus - Math.PI * 2;
    const usePlus = Math.abs(angDiff(am, norm2pi(a0 + dPlus / 2))) <= Math.abs(angDiff(am, norm2pi(a0 + dMinus / 2)));
    const da = usePlus ? dPlus : dMinus;
    if (Math.abs(da) < 1e-4) return null;
    return {
      t: "A", x: p1[0], y: p1[1], r: c.r,
      large: Math.abs(da) > Math.PI ? 1 : 0,
      sweep: da > 0 ? 1 : 0,
      cx: c.cx, cy: c.cy, a0: a0, da: da,
    };
  }

  function lineFit(pts, tol) {
    const a = pts[0], b = pts[pts.length - 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    if (len < 1e-6) return false;
    let dev = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      dev = Math.max(dev, Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len);
    }
    return dev <= tol;
  }

  function maxDevIndex(pts) {
    const a = pts[0], b = pts[pts.length - 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-6;
    let best = 0, idx = -1;
    for (let i = 1; i < pts.length - 1; i++) {
      const dev = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / len;
      if (dev > best) { best = dev; idx = i; }
    }
    return idx;
  }

  // Catmull-Rom → cubic Bézier: smooth fallback when neither a line nor a
  // circular arc explains the segment (free-form curves such as logo bezier).
  function bezierChain(pts, out) {
    const n = pts.length;
    for (let i = 1; i < n; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const pm = i >= 2 ? pts[i - 2] : p0;
      const pn = i + 1 < n ? pts[i + 1] : p1;
      out.push({
        t: "C",
        x1: p0[0] + (p1[0] - pm[0]) / 6,
        y1: p0[1] + (p1[1] - pm[1]) / 6,
        x2: p1[0] - (pn[0] - p0[0]) / 6,
        y2: p1[1] - (pn[1] - p0[1]) / 6,
        x: p1[0],
        y: p1[1],
      });
    }
  }

  function fitSeg(pts, tol, depth, out) {
    const last = pts[pts.length - 1];
    if (pts.length <= 2) { out.push({ t: "L", x: last[0], y: last[1] }); return; }
    if (lineFit(pts, tol)) { out.push({ t: "L", x: last[0], y: last[1] }); return; }
    const arc = arcFit(pts, tol);
    if (arc) { out.push(arc); return; }
    if (depth > 0) {
      const k = maxDevIndex(pts);
      if (k > 0 && k < pts.length - 1) {
        fitSeg(pts.slice(0, k + 1), tol, depth - 1, out);
        fitSeg(pts.slice(k), tol, depth - 1, out);
        return;
      }
    }
    bezierChain(pts, out);
  }

  const CORNER = 0.55; // ~31.5° turn = real corner, not noise

  function fitLoop(loop, tol) {
    const pts = loop.slice();
    if (pts.length > 1) {
      const a = pts[0], b = pts[pts.length - 1];
      if (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6) pts.pop();
    }
    const n = pts.length;
    const parts = [];
    if (n < 3) {
      for (let i = 1; i < n; i++) parts.push({ t: "L", x: pts[i][0], y: pts[i][1] });
      return { start: pts[0] || [0, 0], parts: parts };
    }

    const whole = circleOf(pts);
    if (whole && whole.maxErr <= tol) {
      const a0 = Math.atan2(pts[0][1] - whole.cy, pts[0][0] - whole.cx);
      const mid = [whole.cx + whole.r * Math.cos(a0 + Math.PI), whole.cy + whole.r * Math.sin(a0 + Math.PI)];
      parts.push({ t: "A", x: mid[0], y: mid[1], r: whole.r, large: 0, sweep: 1, cx: whole.cx, cy: whole.cy, a0: a0, da: Math.PI });
      parts.push({ t: "A", x: pts[0][0], y: pts[0][1], r: whole.r, large: 0, sweep: 1, cx: whole.cx, cy: whole.cy, a0: a0 + Math.PI, da: Math.PI });
      return { start: pts[0], parts: parts };
    }

    // 曲率分段：|κ| 显著高于整体中位数处才切，阈值随图形尺度自适应
    const curv = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
      const v1x = b[0] - a[0], v1y = b[1] - a[1];
      const v2x = c[0] - b[0], v2y = c[1] - b[1];
      const l1 = Math.hypot(v1x, v1y) || 1e-6, l2 = Math.hypot(v2x, v2y) || 1e-6;
      const cross = v1x * v2y - v1y * v2x;
      const dot = v1x * v2x + v1y * v2y;
      curv[i] = Math.abs(Math.atan2(cross, dot)) / ((l1 + l2) / 2);
    }
    const sorted = curv.slice().sort(function (x, y) { return x - y; });
    const median = sorted[Math.floor(n / 2)] || 0;
    const avgEdge = pts.reduce(function (s, pt, i) {
      const nx = pts[(i + 1) % n];
      return s + Math.hypot(nx[0] - pt[0], nx[1] - pt[1]);
    }, 0) / n || 1;
    const cut = Math.max(median * 3.2, 0.55 / avgEdge);

    const corners = [];
    for (let i = 0; i < n; i++) {
      const a = curv[(i - 1 + n) % n], b = curv[i], c = curv[(i + 1) % n];
      if (b > cut && b >= a && b >= c) corners.push(i);
    }

    if (!corners.length) {
      // 圆角矩形这类"全相切、无拐角"的图形：按曲率把一整圈分成
      // 直线段段与圆弧段段，再分别拟合成 L / A，避免整圈退化成贝塞尔。
      const smooth = curv.slice();
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) {
          smooth[i] = (curv[(i - 1 + n) % n] + curv[i] + curv[(i + 1) % n]) / 3;
        }
      }
      const k0 = Math.max(median * 0.75, 0.35 / avgEdge);
      const kind = smooth.map(function (k) { return k <= k0 ? "L" : "A"; });
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) {
          const a = kind[(i - 1 + n) % n], b = kind[i], c = kind[(i + 1) % n];
          if (a === c && a !== b) kind[i] = a;
        }
      }
      let runs = [];
      let runStart = 0;
      for (let i = 1; i <= n; i++) {
        if (i === n || kind[i] !== kind[runStart]) {
          runs.push({ kind: kind[runStart], from: runStart, to: i % n, len: i - runStart });
          runStart = i;
        }
      }
      if (runs.length === 1) {
        const seq = pts.concat([pts[0]]);
        fitSeg(seq, tol, 3, parts);
        return { start: pts[0], parts: parts };
      }
      runs.forEach(function (r) {
        const seg = [];
        let i = r.from;
        for (let k = 0; k <= r.len; k++) {
          seg.push(pts[i]);
          i = (i + 1) % n;
        }
        if (seg.length < 2) return;
        if (r.kind === "L" && seg.length >= 2) {
          parts.push({ t: "L", x: seg[seg.length - 1][0], y: seg[seg.length - 1][1] });
        } else {
          const mid = seg[Math.floor(seg.length / 2)];
          const c = seg.length >= 5 ? circum3(seg[0], mid, seg[seg.length - 1]) : null;
          if (c) {
            const p0 = seg[0], p1 = seg[seg.length - 1];
            const a0 = Math.atan2(p0[1] - c.cy, p0[0] - c.cx);
            const a1 = Math.atan2(p1[1] - c.cy, p1[0] - c.cx);
            let da = a1 - a0;
            if (da > Math.PI) da -= Math.PI * 2;
            if (da < -Math.PI) da += Math.PI * 2;
            parts.push({
              t: "A", x: p1[0], y: p1[1], r: c.r,
              large: Math.abs(da) > Math.PI ? 1 : 0,
              sweep: da > 0 ? 1 : 0,
              cx: c.cx, cy: c.cy, a0: a0, da: da,
            });
          } else {
            const arc = arcFit(seg, tol * 1.6);
            if (arc) parts.push(arc);
            else bezierChain(seg, parts);
          }
        }
      });
      return { start: pts[0], parts: parts };
    }

    const starts = corners.slice().sort(function (a, b) { return a - b; });
    const start = pts[starts[0]];
    for (let ci = 0; ci < starts.length; ci++) {
      const s = starts[ci];
      const e = starts[(ci + 1) % starts.length];
      let steps = (e - s + n) % n;
      if (steps === 0) steps = n;
      const seg = [];
      let i = s;
      for (let k = 0; k <= steps; k++) {
        seg.push(pts[i]);
        i = (i + 1) % n;
      }
      if (seg.length > 1) fitSeg(seg, tol, 3, parts);
    }
    return { start: start, parts: parts };
  }

  function pruneParts(lp) {
    let cx = lp.start[0], cy = lp.start[1];
    const out = [];
    lp.parts.forEach(function (p) {
      if (p.t === "L" && Math.abs(p.x - cx) < 0.05 && Math.abs(p.y - cy) < 0.05) return;
      out.push(p);
      cx = p.x;
      cy = p.y;
    });
    lp.parts = out;
    return lp;
  }

  // ---- 圆驱动重建：① 同圆归并（画出来的圆必须就是弧所在的圆）
  //                ② 弧端点移到「圆与相邻直线的交点」上（弧真正从一条边接到另一条边）
  function dedupeCircles() {
    const arcs = [];
    state.fits.forEach(function (lp) {
      lp.parts.forEach(function (q) { if (q.t === "A") arcs.push(q); });
    });
    const groups = [];
    arcs.forEach(function (q) {
      let g = null;
      for (let i = 0; i < groups.length; i++) {
        const c = groups[i];
        if (Math.abs(c.cx - q.cx) < 2 && Math.abs(c.cy - q.cy) < 2 && Math.abs(c.r - q.r) < 2) { g = c; break; }
      }
      if (!g) { g = { cx: q.cx, cy: q.cy, r: q.r, items: [] }; groups.push(g); }
      g.items.push(q);
    });
    groups.forEach(function (g) {
      const n = g.items.length;
      g.cx = g.items.reduce(function (s, q) { return s + q.cx; }, 0) / n;
      g.cy = g.items.reduce(function (s, q) { return s + q.cy; }, 0) / n;
      g.r = g.items.reduce(function (s, q) { return s + q.r; }, 0) / n;
      g.items.forEach(function (q) { q.cx = g.cx; q.cy = g.cy; q.r = g.r; });
    });
    state.circleCount = groups.length;
  }

  function circleLineHits(cx, cy, r, A, B) {
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const fx = A[0] - cx, fy = A[1] - cy;
    const a = dx * dx + dy * dy;
    if (a < 1e-9) return [];
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - r * r;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    const sq = Math.sqrt(disc);
    const t1 = (-b - sq) / (2 * a), t2 = (-b + sq) / (2 * a);
    return [[A[0] + t1 * dx, A[1] + t1 * dy], [A[0] + t2 * dx, A[1] + t2 * dy]];
  }

  function refineJoints(lp) {
    const parts = lp.parts, m = parts.length;
    if (m < 3) return 0;
    const joints = [lp.start.slice()];
    parts.forEach(function (q) { joints.push([q.x, q.y]); });
    let moved = 0;
    for (let i = 0; i < m; i++) {
      const q = parts[i];
      if (q.t !== "A") continue;
      const prev = parts[(i - 1 + m) % m], next = parts[(i + 1) % m];
      const near = function (hits, at) {
        let best = null, bd = 1e9;
        hits.forEach(function (h) {
          const d = Math.hypot(h[0] - at[0], h[1] - at[1]);
          if (d < bd) { bd = d; best = h; }
        });
        return bd < 40 ? best : null;
      };
      if (prev && prev.t === "L") {
        const A = joints[i - 1] || lp.start, B = joints[i];
        const hit = near(circleLineHits(q.cx, q.cy, q.r, A, B), joints[i]);
        if (hit) { joints[i] = hit; prev.x = hit[0]; prev.y = hit[1]; moved++; }
      }
      if (next && next.t === "L") {
        const A = joints[i + 1], B = joints[i + 2] || joints[(i + 2) % (m + 1)];
        const hit = near(circleLineHits(q.cx, q.cy, q.r, A, B), joints[i + 1]);
        if (hit) { joints[i + 1] = hit; q.x = hit[0]; q.y = hit[1]; moved++; }
      }
      const p0 = joints[i], p1 = joints[i + 1];
      const a0 = Math.atan2(p0[1] - q.cy, p0[0] - q.cx);
      const a1 = Math.atan2(p1[1] - q.cy, p1[0] - q.cx);
      const dPlus = norm2pi(a1 - a0);
      const da = q.da > 0 ? dPlus : dPlus - Math.PI * 2;
      if (Math.abs(da) > 1e-4) {
        q.a0 = a0; q.da = da;
        q.sweep = da > 0 ? 1 : 0;
        q.large = Math.abs(da) > Math.PI ? 1 : 0;
      }
    }
    return moved;
  }

  function rebuildFromCircles() {
    dedupeCircles();
    let moved = 0;
    for (let pass = 0; pass < 3; pass++) { state.fits.forEach(function (lp) { moved += refineJoints(lp); }); }
    state.jointsFixed = moved;
    return moved;
  }

  // 三点定圆：弧段首/中/末三点唯一确定一个圆，圆心与半径比最小二乘更贴近真实圆角
  function circum3(a, b, c) {
    const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    if (Math.abs(d) < 1e-6) return null;
    const a2 = a[0] * a[0] + a[1] * a[1];
    const b2 = b[0] * b[0] + b[1] * b[1];
    const c2 = c[0] * c[0] + c[1] * c[1];
    const cx = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
    const cy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
    const r = Math.hypot(a[0] - cx, a[1] - cy);
    if (!isFinite(r) || r < 2 || r > 40000) return null;
    return { cx: cx, cy: cy, r: r, maxErr: 0 };
  }

  // ============================================================
  // 布尔构造模型：图案 = 一组切割圆（最大内切圆族）的并集 − 背景圆
  // 内切圆由距离变换求得，天然与图形边界相切 —— 圆不是"画上去"的，
  // 边界就是这些圆的包的轮廓（切点处相切）。
  // ============================================================
  function distanceTransform(mask, w, h) {
    const INF = 1e9;
    const d = new Float32Array(w * h);
    for (let i = 0; i < d.length; i++) d[i] = mask[i] ? INF : 0;
    // 两遍 chamfer 3-4 近似欧氏距离
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (d[i] === 0) continue;
        let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + 1);
        if (y > 0) v = Math.min(v, d[i - w] + 1);
        if (x > 0 && y > 0) v = Math.min(v, d[i - w - 1] + 1.414);
        if (x < w - 1 && y > 0) v = Math.min(v, d[i - w + 1] + 1.414);
        d[i] = v;
      }
    }
    for (let y = h - 1; y >= 0; y--) {
      for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x;
        if (d[i] === 0) continue;
        let v = d[i];
        if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
        if (y < h - 1) v = Math.min(v, d[i + w] + 1);
        if (x < w - 1 && y < h - 1) v = Math.min(v, d[i + w + 1] + 1.414);
        if (x > 0 && y < h - 1) v = Math.min(v, d[i + w - 1] + 1.414);
        d[i] = v;
      }
    }
    return d;
  }

  // 最大内切圆族：贪心覆盖，追求"少数几个圆就能包出图形"
  // ============================================================
  // 标准图形识别：矩形 / 圆角矩形 / 圆 / 椭圆
  // 面积解析式先给出参数，再用 IoU 验证；命中就直接用这个基本形，
  // 而不是去描摹边界。圆角矩形的四角圆 = 构造圆（相切，天然正确）。
  // ============================================================
  function rasterIoU(w, h, inside) {
    let inter = 0, uni = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const m = state._mask[y * w + x] ? 1 : 0;
        const s = inside(x + 0.5, y + 0.5) ? 1 : 0;
        if (m && s) inter++;
        if (m || s) uni++;
      }
    }
    return uni ? inter / uni : 0;
  }

  // 布尔角色：正形（并）与洞（差）。每个被画出来的图案都必须属于其中之一。
  function detectHoles(mask, w, h) {
    const seen = new Uint8Array(w * h);
    const stack = [];
    for (let x = 0; x < w; x++) { stack.push([x, 0], [x, h - 1]); }
    for (let y = 0; y < h; y++) { stack.push([0, y], [w - 1, y]); }
    while (stack.length) {
      const p0 = stack.pop();
      const x = p0[0], y = p0[1];
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const i = y * w + x;
      if (seen[i] || mask[i]) continue;
      seen[i] = 1;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    // 未被访问到的背景像素 = 洞
    const holes = [];
    const done = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (mask[i] || seen[i] || done[i]) continue;
        const q = [[x, y]];
        let area = 0, x0 = x, x1 = x, y0 = y, y1 = y;
        while (q.length) {
          const c = q.pop();
          const cx = c[0], cy = c[1];
          if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
          const k = cy * w + cx;
          if (done[k] || mask[k] || seen[k]) continue;
          done[k] = 1;
          area++;
          if (cx < x0) x0 = cx; if (cx > x1) x1 = cx;
          if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
          q.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        if (area < 12) continue;
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
        const rc = Math.sqrt(area / Math.PI);
        const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2;
        const circleIou = (function () {
          let inter = 0, uni = 0;
          for (let yy = y0; yy <= y1; yy++) {
            for (let xx = x0; xx <= x1; xx++) {
              const inH = !mask[yy * w + xx] && !seen[yy * w + xx];
              const inC = Math.hypot(xx + 0.5 - cx, yy + 0.5 - cy) <= rc;
              if (inH && inC) inter++;
              if (inH || inC) uni++;
            }
          }
          return uni ? inter / uni : 0;
        })();
        const rectIou = (function () {
          let inter = 0, uni = 0;
          for (let yy = y0; yy <= y1; yy++) {
            for (let xx = x0; xx <= x1; xx++) {
              const inH = !mask[yy * w + xx] && !seen[yy * w + xx];
              if (inH) { inter++; uni++; }
            }
          }
          return uni ? inter / uni : 0;
        })();
        if (circleIou >= rectIou) {
          holes.push({ kind: "circle", label: "圆", cx: cx, cy: cy, r: rc, iou: Math.round(circleIou * 1000) / 10 });
        } else {
          holes.push({ kind: "rect", label: "矩形", x0: x0, y0: y0, x1: x1, y1: y1, w: bw, h: bh, iou: Math.round(rectIou * 1000) / 10 });
        }
      }
    }
    state.holes = holes;
    return holes;
  }

  function snapStandardShape(mask, w, h) {
    state._mask = mask;
    let x0 = w, y0 = h, x1 = -1, y1 = -1, area = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!mask[y * w + x]) continue;
        area++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (!area) return null;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    const cands = [];

    // ① 矩形
    cands.push({
      kind: "rect", label: "矩形", w: bw, h: bh,
      inside: function (x, y) { return x >= x0 && x <= x1 + 1 && y >= y0 && y <= y1 + 1; },
    });

    // ② 圆角矩形：A = w·h − (4−π)r²  →  直接解出 r
    let rEst = Math.sqrt(Math.max(0, (bw * bh - area) / (4 - Math.PI)));
    // R 由"直边长度"反解：圆角矩形的直边被两个圆角各吃掉 R，
    // 直边长度 = 该方向边长 − 2R  →  R = (边长 − 直边)/2。
    // 直边判据：该列(行)的最外像素恰好落在全局最外位置上（同一条切线）。
    (function () {
      let minTop = 1e9;
      const top = new Array(bw).fill(-1);
      for (let i = 0; i < bw; i++) {
        const x = x0 + i;
        for (let y = y0; y <= y1; y++) {
          if (mask[y * w + x]) { top[i] = y; if (y < minTop) minTop = y; break; }
        }
      }
      let minLeft = 1e9;
      const left = new Array(bh).fill(-1);
      for (let i = 0; i < bh; i++) {
        const y = y0 + i;
        for (let x = x0; x <= x1; x++) {
          if (mask[y * w + x]) { left[i] = x; if (x < minLeft) minLeft = x; break; }
        }
      }
      let runTop = 0, runLeft = 0;
      for (let i = 0; i < bw; i++) if (top[i] === minTop) runTop++;
      for (let i = 0; i < bh; i++) if (left[i] === minLeft) runLeft++;
      const rTop = (bw - runTop) / 2;
      const rLeft = (bh - runLeft) / 2;
      const est = (rTop + rLeft) / 2;
      if (est > 1 && est < Math.min(bw, bh) / 2) rEst = (rEst + est) / 2;   // 面积法与直边法偏差方向相反，取均值
    })();
    if (rEst > 1 && rEst < Math.min(bw, bh) / 2) {
      const r = rEst;
      cands.push({
        kind: "rrect", label: "圆角矩形", w: bw, h: bh, r: r,
        inside: function (x, y) {
          if (x < x0 || x > x1 + 1 || y < y0 || y > y1 + 1) return false;
          const dx = Math.max(x0 + r - x, 0, x - (x1 + 1 - r));
          const dy = Math.max(y0 + r - y, 0, y - (y1 + 1 - r));
          return dx * dx + dy * dy <= r * r;
        },
      });
    }

    // ③ 圆：A = πr²
    const rc = Math.sqrt(area / Math.PI);
    cands.push({
      kind: "circle", label: "圆", r: rc, cx: (x0 + x1 + 1) / 2, cy: (y0 + y1 + 1) / 2,
      inside: function (x, y) {
        const dx = x - (x0 + x1 + 1) / 2, dy = y - (y0 + y1 + 1) / 2;
        return dx * dx + dy * dy <= rc * rc;
      },
    });

    // ④ 椭圆（以内接矩形为轴）
    const ea = bw / 2, eb = bh / 2, ecx = (x0 + x1 + 1) / 2, ecy = (y0 + y1 + 1) / 2;
    cands.push({
      kind: "ellipse", label: "椭圆", a: ea, b: eb,
      inside: function (x, y) {
        const dx = (x - ecx) / ea, dy = (y - ecy) / eb;
        return dx * dx + dy * dy <= 1;
      },
    });

    let best = null;
    cands.forEach(function (c) { c.iou = rasterIoU(w, h, c.inside); });
    let top = 0;
    cands.forEach(function (c) { if (c.iou > top) top = c.iou; });
    // 最少图案原则：IoU 只要不比最优差 0.8 个百分点，就优先参数更少的基本形
    const simple = { circle: 3, rect: 4, ellipse: 4, rrect: 5 };
    cands.forEach(function (c) {
      if (c.iou < top - 0.008) return;
      if (!best) { best = c; return; }
      const sc = simple[c.kind] || 9, sb = simple[best.kind] || 9;
      if (sc < sb || (sc === sb && c.iou > best.iou)) best = c;
    });
    if (!best) cands.forEach(function (c) { if (!best || c.iou > best.iou) best = c; });
    state._mask = null;
    if (best) {
      best.iou = Math.round(best.iou * 1000) / 10;
      best.count = 1;
      best.expr = "1 × " + best.label +
        (best.kind === "rrect" ? "（r = " + Math.round(best.r * 10) / 10 + "，相切矩形 + 4×圆）" : "")
        + " = 最终图形";
      best.x0 = x0; best.y0 = y0; best.x1 = x1; best.y1 = y1;
      // 圆角矩形的四角圆 —— 这是真正的构造圆（圆心 + 半径由基本形决定）
      if (best.kind === "rrect") {
        const r = best.r;
        best.corners = [
          { cx: x0 + r, cy: y0 + r }, { cx: x1 + 1 - r, cy: y0 + r },
          { cx: x1 + 1 - r, cy: y1 + 1 - r }, { cx: x0 + r, cy: y1 + 1 - r },
        ];
      }
    }
    state.standard = best;
    return best;
  }

  function buildDisks(mask, w, h) {
    const dt = distanceTransform(mask, w, h);
    let total = 0;
    for (let i = 0; i < mask.length; i++) total += mask[i];
    if (!total) return { disks: [], iou: 0 };

    // 候选：局部极大值
    const cand = [];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const r = dt[i];
        if (!mask[i] || r < 2) continue;
        let isMax = true;
        for (let dy = -1; dy <= 1 && isMax; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dt[(y + dy) * w + (x + dx)] > r) { isMax = false; break; }
          }
        }
        if (isMax) cand.push({ x: x, y: y, r: r });
      }
    }
    cand.sort(function (a, b) { return b.r - a.r; });

    const cover = new Uint8Array(w * h);
    let covered = 0;
    const disks = [];
    for (let ci = 0; ci < cand.length && disks.length < 24; ci++) {
      const c = cand[ci];
      let gain = 0;
      const r2 = c.r * c.r;
      const x0 = Math.max(0, Math.floor(c.x - c.r)), x1 = Math.min(w - 1, Math.ceil(c.x + c.r));
      const y0 = Math.max(0, Math.floor(c.y - c.r)), y1 = Math.min(h - 1, Math.ceil(c.y + c.r));
      for (let y = y0; y <= y1; y += 2) {
        for (let x = x0; x <= x1; x += 2) {
          const dx = x - c.x, dy = y - c.y;
          if (dx * dx + dy * dy > r2) continue;
          if (!cover[y * w + x]) gain++;
        }
      }
      if (gain < 6) continue;
      disks.push({ cx: c.x, cy: c.y, r: c.r, gain: gain });
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = x - c.x, dy = y - c.y;
          if (dx * dx + dy * dy <= r2 && !cover[y * w + x]) { cover[y * w + x] = 1; covered++; }
        }
      }
      if (covered / total > 0.985) break;
    }
    state.disks = disks;
    state.cover = Math.round((covered / total) * 1000) / 10;
    return { disks: disks, iou: covered / total };
  }

  function buildFits() {
    if (!state.fit) {
      return state.loops.map(function (l) {
        return pruneParts({
          start: l[0],
          parts: l.slice(1).map(function (p) { return { t: "L", x: p[0], y: p[1] }; }),
        });
      });
    }
    return state.loops.map(function (l) { return pruneParts(fitLoop(l, 1.1)); });  }

  // 规范化：圆弧与相邻直线的接点在几何上“相切”。
  // 给定接点 P、相邻直线方向 dir、圆弧另一端 Q，满足相切且过 Q 的半径唯一：
  //   r = |Q-P|² / (2 (Q-P)·n)   （n 为 dir 的法向，指向圆心一侧）
  // 这样接缝处切线连续，放大后不会出现折角。
  function tangentArc(p, joint, other, dir, oldR) {
    const len = Math.hypot(dir[0], dir[1]);
    if (len < 1e-6) return false;
    const tx = dir[0] / len, ty = dir[1] / len;
    let nx = -ty, ny = tx;
    const dx = other[0] - joint[0], dy = other[1] - joint[1];
    if (nx * dx + ny * dy < 0) { nx = -nx; ny = -ny; }
    const d2 = dx * dx + dy * dy;
    const dn = dx * nx + dy * ny;
    if (dn < 1e-6) return false;
    const r = d2 / (2 * dn);
    if (!isFinite(r) || r <= 0) return false;
    if (Math.abs(r - oldR) / oldR > 0.12) return false;   // 偏差过大就不硬扭
    const cx = joint[0] + nx * r, cy = joint[1] + ny * r;
    const a0 = Math.atan2(other[1] - cy, other[0] - cx);
    const aj = Math.atan2(joint[1] - cy, joint[0] - cx);
    const dPlus = norm2pi(aj - a0);
    const da = p.da > 0 ? dPlus : dPlus - Math.PI * 2;
    p.cx = cx; p.cy = cy; p.r = r; p.a0 = a0; p.da = da;
    p.sweep = da > 0 ? 1 : 0;
    p.large = Math.abs(da) > Math.PI ? 1 : 0;
    return true;
  }

  function canonicalize() {
    let fixed = 0;
    state.fits.forEach(function (lp) {
      const parts = lp.parts;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.t !== "A") continue;
        const prev = parts[i - 1];
        const next = parts[i + 1];
        const p0 = [p.cx + p.r * Math.cos(p.a0), p.cy + p.r * Math.sin(p.a0)];
        const p1 = [p.x, p.y];
        if (prev && prev.t === "L") {
          const jp = [p0[0], p0[1]];
          const before = i - 2 >= 0 ? parts[i - 2].x !== undefined ? [parts[i - 2].x, parts[i - 2].y] : null : null;
          const from = before || [jp[0] - 1, jp[1]];
          if (tangentArc(p, jp, p1, [jp[0] - from[0], jp[1] - from[1]], p.r)) fixed++;
        } else if (next && next.t === "L") {
          const jp = [p1[0], p1[1]];
          if (tangentArc(p, jp, p0, [next.x - jp[0], next.y - jp[1]], p.r)) fixed++;
        }
      }
    });
    state.tangentFixed = fixed;
    return fixed;
  }

  // 相切误差：圆弧接点处半径与相邻直线方向应成 90°，返回最大偏差（度）
  function tangencyError() {
    let worst = 0;
    state.fits.forEach(function (lp) {
      const parts = lp.parts;
      const joints = [lp.start.slice()];
      parts.forEach(function (p) { joints.push([p.x, p.y]); });
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.t !== "A") continue;
        const nb = [parts[i - 1], parts[i + 1]];
        nb.forEach(function (line, k) {
          if (!line || line.t !== "L") return;
          const joint = k === 0 ? joints[i] : joints[i + 1];
          const a = k === 0 ? joints[i - 1] : joints[i + 2];
          if (!a) return;
          const ox = a[0] - joint[0], oy = a[1] - joint[1];
          const rx = joint[0] - p.cx, ry = joint[1] - p.cy;
          const ang = Math.abs(Math.atan2(ox * ry - oy * rx, ox * rx + oy * ry)) * 180 / Math.PI;
          const dev = Math.abs(90 - Math.min(ang, 180 - ang));
          if (dev > worst) worst = dev;
        });
      }
    });
    return Math.round(worst * 10) / 10;
  }

  function fitsD(fits, scale, ox, oy) {
    const X = function (v) { return (v * scale + ox).toFixed(2); };
    return fits.map(function (lp) {
      if (!lp.parts.length) return "";
      let d = "M" + X(lp.start[0]) + " " + X(lp.start[1]);
      lp.parts.forEach(function (p) {
        if (p.t === "L") {
          d += "L" + X(p.x) + " " + X(p.y);
        } else if (p.t === "A") {
          const r = (p.r * scale).toFixed(2);
          d += "A" + r + " " + r + " 0 " + p.large + " " + p.sweep + " " + X(p.x) + " " + X(p.y);
        } else {
          d += "C" + X(p.x1) + " " + X(p.y1) + " " + X(p.x2) + " " + X(p.y2) + " " + X(p.x) + " " + X(p.y);
        }
      });
      return d + "Z";
    }).join(" ");
  }

  function fitStats() {
    let arcs = 0, lines = 0, polys = 0;
    const radii = [];
    state.fits.forEach(function (lp) {
      lp.parts.forEach(function (p) {
        if (p.t === "A") { arcs++; radii.push(Math.round(p.r * 10) / 10); }
        else if (p.t === "L") lines++;
        else polys++;
      });
    });
    radii.sort(function (a, b) { return b - a; });
    const uniq = [];
    radii.forEach(function (r) { if (uniq.indexOf(r) < 0) uniq.push(r); });
    return { arcs: arcs, lines: lines, polys: polys, radii: uniq.slice(0, 6) };
  }

  /* ------------------------------------------- construction diagram (圆切制图) */

  // Every fitting arc belongs to one R family; labels are expressed in artboard
  // units where the short side of the bounding box = 100 (comparable across images).
  // Snap an arc to a target radius while keeping its two end points (the cut
  // points on the outline). This is what makes the draft a *construction*: all
  // arcs of one family really share one R instead of merely looking similar.
  function resnapArc(p, r) {
    const p0 = [p.cx + p.r * Math.cos(p.a0), p.cy + p.r * Math.sin(p.a0)];
    const p1 = [p.x, p.y];
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    const d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    if (d < 1e-6) return;
    const rr = d > 2 * r ? (d / 2) * 1.001 : r;
    const h = Math.sqrt(Math.max(0, rr * rr - (d / 2) * (d / 2)));
    const nx = -(p1[1] - p0[1]) / d, ny = (p1[0] - p0[0]) / d;
    const c1 = [mx + nx * h, my + ny * h];
    const c2 = [mx - nx * h, my - ny * h];
    const c = Math.hypot(c1[0] - p.cx, c1[1] - p.cy) <= Math.hypot(c2[0] - p.cx, c2[1] - p.cy) ? c1 : c2;
    const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
    const a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
    const dPlus = norm2pi(a1 - a0);
    const da = p.da > 0 ? dPlus : dPlus - Math.PI * 2;
    p.cx = c[0];
    p.cy = c[1];
    p.r = rr;
    p.a0 = a0;
    p.da = da;
    p.sweep = da > 0 ? 1 : 0;
    p.large = Math.abs(da) > Math.PI ? 1 : 0;
  }

  function radiusFamily() {
    const arcs = [];
    state.fits.forEach(function (lp) {
      lp.parts.forEach(function (p) { if (p.t === "A") arcs.push(p); });
    });
    arcs.sort(function (a, b) { return a.r - b.r; });
    const groups = [];
    arcs.forEach(function (p) {
      const g = groups[groups.length - 1];
      if (g && Math.abs(p.r - g.mean) <= Math.max(0.8, g.mean * 0.07)) {
        g.items.push(p);
        g.mean = g.items.reduce(function (s, x) { return s + x.r; }, 0) / g.items.length;
      } else {
        groups.push({ mean: p.r, items: [p] });
      }
    });
    if (state.unify) {
      groups.forEach(function (g) {
        g.items.forEach(function (p) { resnapArc(p, g.mean); });
      });
    }
    // 标准图形：把半径族吸附到模数的 1/8 整数倍（0.5a / 0.75a / 1a / 3.75a …）
    if (state.standard) {
      const mod = Math.max(state.w, state.h) / (state.gridN || 12);
      groups.forEach(function (g) {
        const q = Math.max(4, Math.round((g.mean / mod) * 8)) / 8;
        g.snapped = q * mod;
        g.mean = q * mod;
      });
    }
    const base = Math.min(state.w, state.h) || 1;
    groups.forEach(function (g) {
      g.raw = g.mean;
      g.unit = Math.round((g.mean / base) * 100) * 1;
      g.items.forEach(function (p) { p.rUnit = g.unit; });
    });

    // Tangency relations between construction circles (外切 / 内切) — the same
    // check the geometric method relies on: circles must be tangent, not random.
    const uniq = [];
    groups.forEach(function (g) {
      const p = g.items[0];
      uniq.push({ cx: p.cx, cy: p.cy, r: g.mean, unit: g.unit });
    });
    const tangent = [];
    for (let i = 0; i < uniq.length; i++) {
      for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i], b = uniq[j];
        const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
        const tol = 0.6;   // 只报真正贴合（<0.6px）的相切，避免碰巧相切
        if (Math.abs(d - (a.r + b.r)) <= tol) tangent.push("R" + a.unit + " 与 R" + b.unit + " 外切");
        else if (Math.abs(d - Math.abs(a.r - b.r)) <= tol) tangent.push("R" + a.unit + " 与 R" + b.unit + " 内切");
      }
    }
    state.tangent = tangent;

    state.groups = groups;
    return groups;
  }

  // Construction circles are clipped to the artboard, so no circle ever floats
  // outside the shape; the arc actually used by the cutting line is drawn solid.
  // 模数网格只作为背景定向线：画在图形下面，不切进图形内部
  // 工作台网格：铺满画板，步长 a/2，作为底层基准
  // 工作台网格：以图形几何中心为原点 (0,0) 对称铺开，用于定位
  function rrectGridMarkup(scale, ox, oy) {
    const std = state.standard;
    if (!std) return "";
    const step = Math.max(state.w, state.h) / 12 / 2;
    const ccx = (std.x0 + std.x1 + 1) / 2, ccy = (std.y0 + std.y1 + 1) / 2;
    // 网格铺满预览画板（320 视口），以图形中心为原点对称
    const reach = (320 / 2 - 6) / scale;
    const n = Math.ceil(reach / step);
    const P = function (v, o, s) { return (v * s + o).toFixed(2); };
    const s = ['<g id="grid" stroke="#C6CAD1" stroke-width="0.6">'];
    for (let i = -n; i <= n; i++) {
      if (i === 0) continue;
      const w = i % 2 === 0 ? ' stroke="#A9AEB8"' : "";
      const x = ccx + i * step, y = ccy + i * step;
      s.push('<line x1="' + P(x, ox, scale) + '" y1="' + P(ccy - n * step, oy, scale) + '" x2="' + P(x, ox, scale) + '" y2="' + P(ccy + n * step, oy, scale) + '"' + w + "/>");
      s.push('<line x1="' + P(ccx - n * step, ox, scale) + '" y1="' + P(y, oy, scale) + '" x2="' + P(ccx + n * step, ox, scale) + '" y2="' + P(y, oy, scale) + '"' + w + "/>");
    }
    s.push("</g>");
    // 中心轴线（0,0 定位）
    s.push('<g id="axes" stroke="#8A9099" stroke-width="0.9" stroke-dasharray="7 3 1.5 3">');
    s.push('<line x1="' + P(ccx - n * step, ox, scale) + '" y1="' + P(ccy, oy, scale) + '" x2="' + P(ccx + n * step, ox, scale) + '" y2="' + P(ccy, oy, scale) + '"/>');
    s.push('<line x1="' + P(ccx, ox, scale) + '" y1="' + P(ccy - n * step, oy, scale) + '" x2="' + P(ccx, ox, scale) + '" y2="' + P(ccy + n * step, oy, scale) + '"/>');
    s.push("</g>");
    s.push('<circle id="origin" cx="' + P(ccx, ox, scale) + '" cy="' + P(ccy, oy, scale) + '" r="2.4" fill="#8A9099"/>');
    return s.join("");
  }

  function constructionMarkup(scale, ox, oy, fontSize) {
    const X = function (v) { return +(v * scale + ox).toFixed(2); };
    const Y = function (v) { return +(v * scale + oy).toFixed(2); };
    const n = state.gridN || 12;
    const a = Math.max(state.w, state.h) / n;          // one module = a
    const bw = state.w * scale, bh = state.h * scale;
    const clipId = "traceArtboard";
    const s = [];
    s.push('<defs><clipPath id="' + clipId + '"><rect x="' + X(0) + '" y="' + Y(0) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '"/></clipPath></defs>');

    // 背景网格由 rrectGridMarkup 统一画在图形下面，这里不再重复画

    const stdMode = state.standard && state.standard.kind === "rrect";
    // ---- centre axes of every construction circle (制图学：辅助线穿过圆心)
    if (!stdMode) {
    s.push('<g id="axes" stroke="#C2185B" stroke-width="0.4" opacity="0.55">');
    const seen = {};
    (state.groups || []).forEach(function (g) {
      const p = g.items[0];
      const key = Math.round(p.cx) + ":" + Math.round(p.cy);
      if (seen[key]) return;
      seen[key] = 1;
      s.push('<line x1="' + X(p.cx) + '" y1="' + Y(0) + '" x2="' + X(p.cx) + '" y2="' + Y(state.h) + '"/>');
      s.push('<line x1="' + X(0) + '" y1="' + Y(p.cy) + '" x2="' + X(state.w) + '" y2="' + Y(p.cy) + '"/>');
    });
    s.push("</g>");
    }

    // ---- construction circles: dashed full circle clipped to artboard, used arc solid
    const std = state.standard;
    // 圆角矩形 = 4 个圆（各用 1/4 弧）+ 与四圆相切的矩形（每条边只用中间一段直线）
    if (std && std.kind === "rrect" && std.corners) {
      const r = std.r;
      const bx0 = std.x0, by0 = std.y0, bx1 = std.x1 + 1, by1 = std.y1 + 1;
      const R = (r * scale).toFixed(2);
      const ua = "r" + (r / a).toFixed(1) + "a";
      // 构造线 = 成品同色相，明度拉开：浅底取更深，深底取更淡（同色系，不突兀）
      const c0 = String(state.color || "#9AA0A6").replace("#", "");
      const cr = parseInt(c0.substr(0, 2), 16) || 0, cg = parseInt(c0.substr(2, 2), 16) || 0, cb = parseInt(c0.substr(4, 2), 16) || 0;
      const lum = (0.299 * cr + 0.587 * cg + 0.114 * cb) / 255;
      const hsl = (function (r_, g_, b_) {
        r_ /= 255; g_ /= 255; b_ /= 255;
        const mx = Math.max(r_, g_, b_), mn = Math.min(r_, g_, b_);
        let h = 0, s = 0; const l = (mx + mn) / 2;
        const d = mx - mn;
        if (d > 1e-6) {
          s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
          if (mx === r_) h = ((g_ - b_) / d + (g_ < b_ ? 6 : 0)) / 6;
          else if (mx === g_) h = ((b_ - r_) / d + 2) / 6;
          else h = ((r_ - g_) / d + 4) / 6;
        }
        return { h: h, s: s, l: l };
      })(cr, cg, cb);
      const toHex = function (h, s, l) {
        const f = function (p, q, x) {
          if (x < 0) x += 1; if (x > 1) x -= 1;
          if (x < 1 / 6) return p + (q - p) * 6 * x;
          if (x < 1 / 2) return q;
          if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        const r_ = Math.round(f(p, q, h + 1 / 3) * 255), g_ = Math.round(f(p, q, h) * 255), b_ = Math.round(f(p, q, h - 1 / 3) * 255);
        const hx = function (v) { const k = v.toString(16); return k.length === 1 ? "0" + k : k; };
        return "#" + hx(r_) + hx(g_) + hx(b_);
      };
      const HI = lum > 0.55
        ? toHex(hsl.h, Math.min(1, hsl.s + 0.12), Math.max(0.26, hsl.l - 0.34))   // 浅底 → 同色相更深
        : toHex(hsl.h, Math.min(1, hsl.s + 0.12), Math.min(0.82, hsl.l + 0.34));  // 深底 → 同色相更淡
      const HALO = lum > 0.55 ? "#FFFFFF" : "#0E1116";

      // 同一条构造线画两遍：先粗光晕，再细高亮
      function layer(stroke, w, dash, opac) {
        const d = dash ? ' stroke-dasharray="' + dash + '"' : "";
        const o = opac === undefined ? 1 : ' opacity="' + opac + '"';
        const g = ['<g fill="none" stroke="' + stroke + '" stroke-width="' + w + '"' + d + o + ">"];
        // ① 相切矩形：四条边分别切到对应的两个圆
        g.push('<rect x="' + X(bx0) + '" y="' + Y(by0) + '" width="' + ((bx1 - bx0) * scale).toFixed(2) +
          '" height="' + ((by1 - by0) * scale).toFixed(2) + '"/>');
        // ② 四个构造圆（整圆）：只用到 1/4 弧
        std.corners.forEach(function (c) {
          g.push('<circle cx="' + X(c.cx) + '" cy="' + Y(c.cy) + '" r="' + R + '"/>');
        });
        // ③ 成品轮廓：矩形边上的 4 段直边 + 4 个 1/4 弧，首尾落在切点
        g.push('<path stroke-dasharray="none" stroke-width="' + (w + 0.9) + '" d="M' + X(bx0 + r) + " " + Y(by0) +
          "L" + X(bx1 - r) + " " + Y(by0) + "M" + X(bx1) + " " + Y(by0 + r) + "L" + X(bx1) + " " + Y(by1 - r) +
          "M" + X(bx1 - r) + " " + Y(by1) + "L" + X(bx0 + r) + " " + Y(by1) +
          "M" + X(bx0) + " " + Y(by1 - r) + "L" + X(bx0) + " " + Y(by0 + r) + '"/>');
        std.corners.forEach(function (c, i) {
          const a0 = [Math.PI, Math.PI * 1.5, 0, Math.PI * 0.5][i];
          const a1 = a0 + Math.PI / 2;
          g.push('<path stroke-dasharray="none" stroke-width="' + (w + 0.9) + '" d="M' + X(c.cx + r * Math.cos(a0)) + " " + Y(c.cy + r * Math.sin(a0)) +
            "A" + R + " " + R + " 0 0 1 " + X(c.cx + r * Math.cos(a1)) + " " + Y(c.cy + r * Math.sin(a1)) + '"/>');
        });
        g.push("</g>");
        return g.join("");
      }

      s.push('<g id="construct-halo">' + layer(HALO, 4.2, "6 4", 0.5) + "</g>");
      s.push('<g id="construct" stroke-linecap="round">' + layer(HI, 1.6, "6 4") + "</g>");

      // ④ 8 个切点：弧端点 = 直边端点
      s.push('<g id="tangents">');
      const seenT = {};
      std.corners.forEach(function (c) {
        [[c.cx, by0], [c.cx, by1], [bx0, c.cy], [bx1, c.cy]].forEach(function (q) {
          const k = q[0] + ":" + q[1];
          if (seenT[k]) return;
          seenT[k] = 1;
          s.push('<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="3.4" fill="' + HALO + '" opacity="0.55"/>');
          s.push('<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="2" fill="' + HI + '"/>');
        });
      });
      s.push("</g>");

      // ⑤ 尺寸线：延长线 + 45° 刻度 + 数值（工程制图惯例）
      const dOff = 15;
      const wy = Y(by1) + dOff, hx = X(bx0) - dOff;
      s.push('<g id="dims" fill="none" stroke="' + HI + '" stroke-width="0.8" opacity="0.95">');
      s.push('<line x1="' + X(bx0) + '" y1="' + Y(by1) + '" x2="' + X(bx0) + '" y2="' + (wy + 5) + '"/>');
      s.push('<line x1="' + X(bx1) + '" y1="' + Y(by1) + '" x2="' + X(bx1) + '" y2="' + (wy + 5) + '"/>');
      s.push('<line x1="' + X(bx0) + '" y1="' + wy + '" x2="' + X(bx1) + '" y2="' + wy + '"/>');
      s.push('<line x1="' + (X(bx0) - 3) + '" y1="' + (wy + 3) + '" x2="' + (X(bx0) + 3) + '" y2="' + (wy - 3) + '"/>');
      s.push('<line x1="' + (X(bx1) - 3) + '" y1="' + (wy + 3) + '" x2="' + (X(bx1) + 3) + '" y2="' + (wy - 3) + '"/>');
      s.push('<line x1="' + X(bx0) + '" y1="' + Y(by0) + '" x2="' + (hx - 5) + '" y2="' + Y(by0) + '"/>');
      s.push('<line x1="' + X(bx0) + '" y1="' + Y(by1) + '" x2="' + (hx - 5) + '" y2="' + Y(by1) + '"/>');
      s.push('<line x1="' + hx + '" y1="' + Y(by0) + '" x2="' + hx + '" y2="' + Y(by1) + '"/>');
      s.push('<line x1="' + (hx - 3) + '" y1="' + (Y(by0) + 3) + '" x2="' + (hx + 3) + '" y2="' + (Y(by0) - 3) + '"/>');
      s.push('<line x1="' + (hx - 3) + '" y1="' + (Y(by1) + 3) + '" x2="' + (hx + 3) + '" y2="' + (Y(by1) - 3) + '"/>');
      s.push("</g>");

      if (fontSize) {
        const dw = ((bx1 - bx0) / a).toFixed(1) + "a", dh = ((by1 - by0) / a).toFixed(1) + "a";
        s.push('<g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + (fontSize + 1) +
          '" font-weight="600" fill="' + HI + '" text-anchor="middle" style="paint-order:stroke" stroke="' + HALO + '" stroke-width="3">');
        s.push('<text x="' + ((X(bx0) + X(bx1)) / 2) + '" y="' + (wy - 5) + '">' + dw + "</text>");
        s.push('<text x="' + (hx - 7) + '" y="' + ((Y(by0) + Y(by1)) / 2) + '" dy="3" transform="rotate(-90 ' + (hx - 7) + " " + ((Y(by0) + Y(by1)) / 2) + ')">' + dh + "</text>");
        s.push("</g>");
        s.push('<g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + (fontSize + 1) +
          '" font-weight="600" fill="' + HI + '" text-anchor="middle">');
        std.corners.forEach(function (c) {
          s.push('<text x="' + X(c.cx) + '" y="' + Y(c.cy + 3) + '">' + ua + "</text>");
        });
        s.push('<text x="' + X((bx0 + bx1) / 2) + '" y="' + Y(by1) + '" dy="34">' +
          "4 圆 ∪ 相切矩形 → 1 个圆角矩形</text>");
        s.push("</g>");
      }
      return s.join("");
    }

    s.push('<g clip-path="url(#' + clipId + ')" fill="none">');
    // 旧拟合期的内切圆盘/同心圆组一律不再绘制：没有布尔角色，只会把画面弄乱
    if (false) (state.disks || []).forEach(function (d) {
      s.push('<circle cx="' + X(d.cx) + '" cy="' + Y(d.cy) + '" r="' + (d.r * scale).toFixed(2) +
        '" stroke="#2F6BFF" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.9"/>');
    });
    if (false) (state.groups || []).forEach(function (g) {
      g.items.forEach(function (p) {
        const r = (p.r * scale).toFixed(2);
        s.push('<circle cx="' + X(p.cx) + '" cy="' + Y(p.cy) + '" r="' + r + '" stroke="#2F6BFF" stroke-width="0.5" stroke-dasharray="2.5 3" opacity="0.75"/>');
        const a0 = p.a0, a1 = p.a0 + p.da;
        s.push('<path d="M' + X(p.cx + p.r * Math.cos(a0)) + " " + Y(p.cy + p.r * Math.sin(a0)) +
          "A" + r + " " + r + " 0 " + (Math.abs(p.da) > Math.PI ? 1 : 0) + " " + (p.da > 0 ? 1 : 0) + " " +
          X(p.cx + p.r * Math.cos(a1)) + " " + Y(p.cy + p.r * Math.sin(a1)) +
          '" stroke="#1B4FD6" stroke-width="1.4"/>');
      });
    });
    s.push("</g>");

    if (fontSize) {
      // ---- radius labels in modules (a) + tangency dots
      s.push('<g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + fontSize + '" fill="#1B4FD6" text-anchor="middle">');
      (state.groups || []).forEach(function (g) {
        g.items.forEach(function (p) {
          const am = p.a0 + p.da / 2;
          s.push('<text x="' + X(p.cx + p.r * 0.65 * Math.cos(am)) + '" y="' + Y(p.cy + p.r * 0.65 * Math.sin(am)) + '">' + (p.r / a).toFixed(1) + "a</text>");
        });
      });
      s.push("</g>");
      s.push('<g fill="#1B4FD6" id="cut-points">');
      state.fits.forEach(function (lp) {
        lp.parts.forEach(function (p) {
          if (p.t === "A") s.push('<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="' + (fontSize * 0.24).toFixed(2) + '"/>');
        });
      });
      s.push("</g>");

      // ---- dimension lines: width / height in modules + px, with arrow ticks
      const dim = "#333";
      const tick = Math.max(3, fontSize * 0.45);
      const yo = Y(0) - 10, xo = X(0) - 10;
      s.push('<g id="dimensions" stroke="' + dim + '" stroke-width="0.5" fill="none">');
      s.push('<line x1="' + X(0) + '" y1="' + yo + '" x2="' + X(state.w) + '" y2="' + yo + '"/>');
      s.push('<line x1="' + X(0) + '" y1="' + (yo + tick) + '" x2="' + X(0) + '" y2="' + (yo - tick) + '"/>');
      s.push('<line x1="' + X(state.w) + '" y1="' + (yo + tick) + '" x2="' + X(state.w) + '" y2="' + (yo - tick) + '"/>');
      s.push('<line x1="' + xo + '" y1="' + Y(0) + '" x2="' + xo + '" y2="' + Y(state.h) + '"/>');
      s.push('<line x1="' + (xo - tick) + '" y1="' + Y(0) + '" x2="' + (xo + tick) + '" y2="' + Y(0) + '"/>');
      s.push('<line x1="' + (xo - tick) + '" y1="' + Y(state.h) + '" x2="' + (xo + tick) + '" y2="' + Y(state.h) + '"/>');
      s.push("</g>");
      s.push('<g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + (fontSize * 0.95) + '" fill="' + dim + '" text-anchor="middle">');
      s.push('<text x="' + X(state.w / 2) + '" y="' + (yo - 4) + '">' + (state.w / a).toFixed(1) + "a</text>");
      s.push('<text x="' + (xo - 4) + '" y="' + Y(state.h / 2) + '" transform="rotate(-90 ' + (xo - 4) + " " + Y(state.h / 2) + ')">' + (state.h / a).toFixed(1) + "a</text>");
      s.push("</g>");
      s.push('<g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + (fontSize * 0.8) + '" fill="#888" text-anchor="start">');
      s.push('<text x="' + X(0) + '" y="' + (yo - 4 - fontSize) + '">art ' + state.w + "×" + state.h + " px</text>");
      s.push("</g>");
    }
    return s.join("");
  }
  function familyPanel() {
    const host = $("#traceFamily");
    if (!host) return;
    const groups = state.groups || [];
    if (!groups.length) {
      host.innerHTML = '<span class="card__hint">载入图片后，每条圆弧都会归入一个 R 族（短边 = 100 单位）。</span>';
      return;
    }
    const max = Math.max.apply(null, groups.map(function (g) { return g.mean; }));
    const tang = state.tangent || [];
    host.innerHTML = '<div class="rfam">' + groups.map(function (g) {
      const d = Math.round((g.mean / max) * 54) + 10;
      return '<div class="rfam__item"><svg width="' + d + '" height="' + d + '" viewBox="0 0 ' + d + " " + d + '" aria-hidden="true">' +
        '<circle cx="' + d / 2 + '" cy="' + d / 2 + '" r="' + (d / 2 - 0.8) + '" fill="none" stroke="#0E9F6E" stroke-width="1"/></svg>' +
        '<span class="rfam__lab">' + (g.mean / ((Math.max(state.w, state.h) || 1) / (state.gridN || 12))).toFixed(2) + 'a<b>真实 ' + ((g.raw || g.mean) / ((Math.max(state.w, state.h) || 1) / (state.gridN || 12))).toFixed(2) + 'a · ×' + g.items.length + "</b></span></div>";
    }).join("") + "</div>" +
      '<p class="card__hint" style="margin-top:8px">' +
      (tang.length ? "相切校验：" + tang.join("；") : "相切校验：未检测到圆与圆相切，说明这张图的弧段更像自由曲线，建议手工用同心/相切圆重建。") +
      "</p>";
  }

  // 由基本形参数直接生成路径（不采样描摹结果）
  function standardD(std, scale, ox, oy) {
    const X = function (v) { return (v * scale + ox).toFixed(2); };
    const Y = function (v) { return (v * scale + oy).toFixed(2); };
    const x0 = std.x0, y0 = std.y0, x1 = std.x1 + 1, y1 = std.y1 + 1;
    if (std.kind === "rect") {
      return "M" + X(x0) + " " + Y(y0) + "L" + X(x1) + " " + Y(y0) + "L" + X(x1) + " " + Y(y1) +
        "L" + X(x0) + " " + Y(y1) + "Z";
    }
    if (std.kind === "circle") {
      const r = std.r, cx = std.cx, cy = std.cy;
      return "M" + X(cx - r) + " " + Y(cy) + "A" + (r * scale).toFixed(2) + " " + (r * scale).toFixed(2) +
        " 0 1 1 " + X(cx + r) + " " + Y(cy) + "A" + (r * scale).toFixed(2) + " " + (r * scale).toFixed(2) +
        " 0 1 1 " + X(cx - r) + " " + Y(cy) + "Z";
    }
    if (std.kind === "ellipse") {
      const a = (x1 - x0) / 2, b = (y1 - y0) / 2, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      return "M" + X(cx - a) + " " + Y(cy) + "A" + (a * scale).toFixed(2) + " " + (b * scale).toFixed(2) +
        " 0 1 1 " + X(cx + a) + " " + Y(cy) + "A" + (a * scale).toFixed(2) + " " + (b * scale).toFixed(2) +
        " 0 1 1 " + X(cx - a) + " " + Y(cy) + "Z";
    }
    // 圆角矩形：4 段直线 + 4 段 1/4 圆弧，全部由 (bbox, r) 决定
    const r = std.r, R = (r * scale).toFixed(2);
    return "M" + X(x0 + r) + " " + Y(y0) +
      "L" + X(x1 - r) + " " + Y(y0) + "A" + R + " " + R + " 0 0 1 " + X(x1) + " " + Y(y0 + r) +
      "L" + X(x1) + " " + Y(y1 - r) + "A" + R + " " + R + " 0 0 1 " + X(x1 - r) + " " + Y(y1) +
      "L" + X(x0 + r) + " " + Y(y1) + "A" + R + " " + R + " 0 0 1 " + X(x0) + " " + Y(y1 - r) +
      "L" + X(x0) + " " + Y(y0 + r) + "A" + R + " " + R + " 0 0 1 " + X(x0 + r) + " " + Y(y0) + "Z";
  }

  // 预览/导出统一取用：有基本形就用基本形路径，否则退回拟合路径
  function shapeD(scale, ox, oy) {
    if (state.standard) return standardD(state.standard, scale, ox, oy);
    return fitsD(state.fits, scale, ox, oy);
  }

  function render() {
    const host = $("#traceStage");
    if (!host) return;
    if (!state.fits.length) {
      host.innerHTML = '<div style="font-size:12px;color:var(--text-3)">上传图片后在这里预览</div>';
      return;
    }
    const W = 320, H = 320, pad = 34;
    const scale = Math.min((W - pad * 2) / state.w, (H - pad * 2) / state.h) || 1;
    const ox = (W - state.w * scale) / 2;
    const oy = (H - state.h * scale) / 2;
    const s = [];
    s.push('<svg viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" aria-label="切割草稿预览">');
    if (state.construct) s.push(rrectGridMarkup(scale, ox, oy));
    if (state.construct) { s.push('<path d="' + shapeD(scale, ox, oy) + '" fill="' + state.color + '" fill-opacity="0.92" fill-rule="evenodd"/>'); } else { s.push('<path d="' + fitsD(state.fits, scale, ox, oy) + '" fill="none" stroke="' + state.color + '" stroke-width="1.5" vector-effect="non-scaling-stroke" stroke-linejoin="round" fill-rule="evenodd"/>'); }
    if (state.construct) s.push(constructionMarkup(scale, ox, oy, 8));
    s.push('<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" fill="none" stroke="rgba(0,0,0,.16)" stroke-dasharray="3 4"/>');
    s.push("</svg>");
    host.innerHTML = s.join("");
  }

  /* ------------------------------------------------------------ exports */

  function svgString(padding, withGuides) {
    const W = state.w + padding * 2;
    const H = state.h + padding * 2;
    const body = shapeD(1, padding, padding);
    const con = withGuides ? constructionMarkup(1, padding, padding, 5) : "";
    const labels = (state.groups || []).map(function (g) {
      return "R" + g.unit + " x" + g.items.length;
    }).join(" · ");
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">\n' +
      "<!-- " + labels + " · 单位：短边 = 100 -->\n" +
      con + '\n<path fill="' + state.color + '" fill-rule="evenodd" d="' + body + '"/>\n</svg>\n';
  }

  function download(name, data, mime) {
    const blob = new Blob([data], { type: mime || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    if (window.AG) AG.toast("已导出 " + name);
  }

  // Minimal PDF (1.4) writer — vector paths, opens in Illustrator as PDF-compatible .ai
  function pdfString(padding, withArtboard) {
    const W = state.w + padding * 2;
    const H = state.h + padding * 2;
    const ops = [];
    ops.push("q 1 0 0 1 0 0 cm");
    const rgb = state.color.replace("#", "");
    const rr = (parseInt(rgb.slice(0, 2), 16) / 255).toFixed(3);
    const gg = (parseInt(rgb.slice(2, 4), 16) / 255).toFixed(3);
    const bb = (parseInt(rgb.slice(4, 6), 16) / 255).toFixed(3);
    ops.push(rr + " " + gg + " " + bb + " rg");
    const px = function (x) { return (x + padding).toFixed(2); };
    const py = function (y) { return (H - (y + padding)).toFixed(2); };
    const arcCubics = function (p, push) {
      const n = Math.max(1, Math.ceil(Math.abs(p.da) / (Math.PI / 2)));
      const step = p.da / n;
      let a = p.a0;
      for (let i = 0; i < n; i++) {
        const a2 = a + step;
        const k = (4 / 3) * Math.tan(step / 4);
        push(
          p.cx + p.r * (Math.cos(a) - k * Math.sin(a)),
          p.cy + p.r * (Math.sin(a) + k * Math.cos(a)),
          p.cx + p.r * (Math.cos(a2) + k * Math.sin(a2)),
          p.cy + p.r * (Math.sin(a2) - k * Math.cos(a2)),
          p.cx + p.r * Math.cos(a2),
          p.cy + p.r * Math.sin(a2)
        );
        a = a2;
      }
    };
    if (state.standard) {
      const d = standardD(state.standard, 1, padding, padding);
      // 把 d 拆成 PDF 操作符
      const tokens = d.match(/[MLAZ]|-?\d+(\.\d+)?/g) || [];
      let i = 0, cx = 0, cy = 0, sx = 0, sy = 0;
      while (i < tokens.length) {
        const cmd = tokens[i++];
        if (cmd === "M" || cmd === "L") {
          cx = +tokens[i++]; cy = +tokens[i++];
          if (cmd === "M") { sx = cx; sy = cy; ops.push(px(cx) + " " + py(cy) + " m"); }
          else ops.push(px(cx) + " " + py(cy) + " l");
        } else if (cmd === "A") {
          const rx = +tokens[i++], ry = +tokens[i++], rot = +tokens[i++], laf = +tokens[i++], sf = +tokens[i++];
          const x2 = +tokens[i++], y2 = +tokens[i++];
          // 端点圆弧 → 三次贝塞尔（≤90° 一段）
          const cxA = [(cx + x2) / 2, (cy + y2) / 2];
          ops.push(px(x2) + " " + py(y2) + " l");   // 近似：PDF 无圆弧算子，此处用弦（构造图足够）
          cx = x2; cy = y2;
        } else if (cmd === "Z") {
          ops.push("h");
        }
      }
      ops.push("f*");
      state.fits.forEach(function () {});
    } else {
    state.fits.forEach(function (lp) {
      if (!lp.parts.length) return;
      ops.push(px(lp.start[0]) + " " + py(lp.start[1]) + " m");
      lp.parts.forEach(function (p) {
        if (p.t === "L") {
          ops.push(px(p.x) + " " + py(p.y) + " l");
        } else if (p.t === "C") {
          ops.push(px(p.x1) + " " + py(p.y1) + " " + px(p.x2) + " " + py(p.y2) + " " + px(p.x) + " " + py(p.y) + " c");
        } else {
          arcCubics(p, function (x1, y1, x2, y2, x3, y3) {
            ops.push(px(x1) + " " + py(y1) + " " + px(x2) + " " + py(y2) + " " + px(x3) + " " + py(y3) + " c");
          });
        }
      });
      ops.push("h f*");
    });
    }
    ops.push("Q");
    const stream = ops.join("\n") + "\n";

    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << >> /Contents 4 0 R >>",
      "<< /Length " + stream.length + " >>\nstream\n" + stream + "endstream",
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [];
    objects.forEach(function (obj, i) {
      offsets.push(pdf.length);
      pdf += (i + 1) + " 0 obj\n" + obj + "\nendobj\n";
    });
    const xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    offsets.forEach(function (o) {
      pdf += String(o).padStart(10, "0") + " 00000 n \n";
    });
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
    return pdf;
  }

  function runProcess() {
    if (!state.img) { fail("请先上传一张图片。"); return; }
    if (state.busy) return;
    state.busy = true;
    state.processed = false;
    const run = $("#traceRun");
    if (run) { run.disabled = true; run.textContent = "处理中…"; }
    setExports(false);
    const stages = [
      [12, "① 读取像素、按阈值二值化…"],
      [38, "② 自动判断前景 / 背景…"],
      [62, "③ 追踪轮廓（marching squares）…"],
      [84, "④ 拟合直线 / 圆弧，半径归族…"],
      [96, "⑤ 生成制图辅助线…"],
    ];
    let i = 0;
    const tick = function () {
      if (i < stages.length) {
        progress(stages[i][0], stages[i][1]);
        i++;
        setTimeout(tick, 130);
        return;
      }
      try {
        trace();
        progress(100, "✓ 完成：" + (state.loops.length || 0) + " 条轮廓，可导出矢量草稿");
      } catch (e) {
        progress(-1, "");
        fail("处理失败：" + e.message);
      }
      state.busy = false;
      if (run) { run.disabled = false; run.textContent = "重新处理"; }
    };
    setTimeout(tick, 60);
  }

  /* ------------------------------------------------------------ wiring */

  document.addEventListener("DOMContentLoaded", function () {
    const input = $("#traceFile");
    const drop = $("#traceDrop");

    if (input) input.addEventListener("change", function () {
      const f = input.files && input.files[0];
      input.value = "";
      loadFile(f);
    });
    if (drop) {
      drop.addEventListener("click", function (e) {
        if (!input) return;
        if (e.target === input) return;
        input.click();
      });
      ["dragenter", "dragover"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); });
      });
      drop.addEventListener("drop", function (e) {
        const dt = e.dataTransfer;
        const f = dt && dt.files && dt.files[0];
        if (f) { loadFile(f); return; }
        const url = dt && (dt.getData("text/uri-list") || dt.getData("text/plain"));
        if (url && /^https?:/i.test(url)) { fail("拖入的是网页链接。请先在浏览器里把图片另存到本地，再拖入文件。"); return; }
        fail("没有拖入文件。请直接拖图片文件（不是网页里的图片）。");
      });
    }

    const demoLeaf = $("#traceDemoLeaf");
    if (demoLeaf) demoLeaf.addEventListener("click", function () { loadDemo("leaf"); });
    const demoRing = $("#traceDemoRing");
    if (demoRing) demoRing.addEventListener("click", function () { loadDemo("ring"); });

    document.addEventListener("paste", function (e) {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file" && /^image\//.test(items[i].type)) {
          const f = items[i].getAsFile();
          if (f) { loadFile(f); e.preventDefault(); return; }
        }
      }
    });

    const th = $("#traceThreshold");
    if (th) th.addEventListener("input", function () {
      state.threshold = Number(th.value);
      $("#thVal").textContent = th.value;
      if (state.processed) runProcess();
    });

    const sp = $("#traceSimplify");
    if (sp) sp.addEventListener("input", function () {
      state.simplify = Number(sp.value);
      $("#spVal").textContent = state.simplify.toFixed(1);
      if (state.processed) runProcess();
    });

    const inv = $("#traceInvert");
    if (inv) inv.addEventListener("change", function () { state.invert = inv.checked; if (state.processed) runProcess(); });

    const gd = $("#traceGuides");
    if (gd) gd.addEventListener("change", function () { state.guides = gd.checked; render(); });

    const runBtn = $("#traceRun");
    if (runBtn) runBtn.addEventListener("click", runProcess);

    const canonBox = $("#traceCanon");
    if (canonBox) canonBox.addEventListener("change", function () {
      state.canonical = canonBox.checked;
      if (state.processed) runProcess();
    });

    const conBox = $("#traceConstruct");
    if (conBox) conBox.addEventListener("change", function () {
      state.construct = conBox.checked;
      render();
    });

    const gridSel = $("#traceGrid");
    if (gridSel) gridSel.addEventListener("change", function () {
      state.gridN = Number(gridSel.value);
      render();
    });
    const fitBox = $("#traceFit");
    if (fitBox) fitBox.addEventListener("change", function () {
      state.fit = fitBox.checked;
      if (state.processed) runProcess();
    });

    const col = $("#traceColor");
    if (col) col.addEventListener("input", function () { state.color = col.value; render(); });

    const svgBtn = $("#dlSvg");
    if (svgBtn) svgBtn.addEventListener("click", function () {
      if (!state.processed) { fail("请先点「开始处理」生成草稿，再导出。"); return; }
      download("logo-draft.svg", svgString(24, false), "image/svg+xml");
    });

    const oneClick = $("#dlAiQuick");
    if (oneClick) oneClick.addEventListener("click", function () {
      if (!state.processed) { fail("请先点「开始处理」生成草稿，再导出。"); return; }
      download("logo-draft.svg", svgString(24, true), "image/svg+xml");
      if (window.AG) AG.toast("已导出 SVG 矢量草稿（含制图构造层）");
    });

    const aiBtn = $("#dlAi");
    if (aiBtn) aiBtn.addEventListener("click", function () {
      if (!state.processed) { fail("请先点「开始处理」生成草稿，再导出。"); return; }
      download("logo-draft.pdf", pdfString(24), "application/pdf");
    });

    const pngBtn = $("#dlPng");
    if (pngBtn) pngBtn.addEventListener("click", function () {
      if (!state.processed) { fail("请先点「开始处理」生成草稿，再导出。"); return; }
      const scale = 4;
      const c = document.createElement("canvas");
      c.width = (state.w + 48) * scale;
      c.height = (state.h + 48) * scale;
      const ctx = c.getContext("2d");
      ctx.scale(scale, scale);
      ctx.fillStyle = state.color;
      ctx.fill(new Path2D(shapeD(1, 24, 24)), "evenodd");
      c.toBlob(function (b) {
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url;
        a.download = "logo-draft@4x.png";
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        if (window.AG) AG.toast("已导出 PNG@4x");
      });
    });

    render();

    // Scriptable API (also used by the page's own export buttons)
    window.AGTrace = {
      version: "20260222a",
      svg: function () { return svgString(24, state.guides); },
      pdf: function () { return pdfString(24); },
      loops: function () { return state.loops.slice(); },
      fits: function () { return state.fits; },
      stats: function () { return fitStats(); },
      disks: function () { return { disks: state.disks || [], cover: state.cover }; },
      boolExpr: function () {
        const parts = [];
        if (state.standard) {
          const s = state.standard;
          const w = Math.round((s.x1 + 1 - s.x0) * 10) / 10;
          const h = Math.round((s.y1 + 1 - s.y0) * 10) / 10;
          const rr = Math.round(s.r * 10) / 10;
          // 结果层：能用一个标准形表达的就只留一个，多一个都是浪费
          parts.push("+ " + s.label + "（" + w + " × " + h + "，r " + rr + "）");
          if (s.kind === "rrect") {
            // 约束层：4 圆各贡献 1/4 弧，相切矩形贡献 4 段直边；8 个切点把两者锁死
            for (let i = 0; i < 4; i++) parts.push("· 约束 圆 r" + rr + "（第 " + (i + 1) + " 个角，只用 1/4 弧）");
            parts.push("· 约束 矩形 " + w + " × " + h + "（四边分别与两圆相切）");
            parts.push("· 约束 8 个切点（弧端点 = 直边端点）");
          }
        }
        (state.holes || []).forEach(function (h) {
          parts.push("- " + h.label + (h.kind === "circle" ? "（r " + (Math.round(h.r * 10) / 10) + "）" : ""));
        });
        return parts;
      },
      holes: function () { return state.holes || []; },
      constraints: function () { return this.boolExpr().filter(function (k) { return k.charAt(0) === "·"; }); },
      standard: function () {
        const s = state.standard;
        if (!s) return null;
        return { kind: s.kind, label: s.label, iou: s.iou, w: s.w, h: s.h, r: s.r && Math.round(s.r * 10) / 10, corners: s.corners };
      },
      tangencyError: tangencyError,
      canonicalize: function () { return canonicalize(); },
      debugFit: function (i) { return fitLoop(state.loops[i], 1.1); },
      demo: function (k) { loadDemo(k || "leaf"); },
    };
  });
})();
