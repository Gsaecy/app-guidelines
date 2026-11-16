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
    color: "#0071E3",
    loops: [],
    fits: [],
    fit: true,
    construct: false,
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
    state.processed = true;
    radiusFamily();
    if (state.canonical) canonicalize();
    render();
    familyPanel();
    setExports(false);
    setExports(true);
    const st = fitStats();
    status(loops.length + " 条轮廓 · " + built.w + "×" + built.h + " px" +
      (state.name ? " · " + state.name : "") +
      (state.autoFlipped ? " · 已自动反转前景" : "") +
      (loops.length
        ? " · 圆弧 " + st.arcs + " · 直线 " + st.lines +
          (st.polys ? " · 曲线 " + st.polys : "") +
          (st.radii.length ? " · R " + st.radii.join(" / ") : "")
        : "（检测不到前景：这张图可能白底/深底、或主体太细。换一张主体清晰的图，或拖动阈值、勾选「反转前景 / 背景」）"));
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
          const arc = arcFit(seg, tol * 1.6);
          if (arc) parts.push(arc);
          else bezierChain(seg, parts);
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
  function constructionMarkup(scale, ox, oy, fontSize) {
    const X = function (v) { return +(v * scale + ox).toFixed(2); };
    const Y = function (v) { return +(v * scale + oy).toFixed(2); };
    const n = state.gridN || 12;
    const a = Math.max(state.w, state.h) / n;          // one module = a
    const bw = state.w * scale, bh = state.h * scale;
    const clipId = "traceArtboard";
    const s = [];
    s.push('<defs><clipPath id="' + clipId + '"><rect x="' + X(0) + '" y="' + Y(0) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '"/></clipPath></defs>');

    // ---- module grid (a) + artboard
    s.push('<g id="grid" stroke="#D8D8D8" stroke-width="0.5">');
    if (state.guides) {
      for (let x = 0; x <= state.w + 0.01; x += a) s.push('<line x1="' + X(x) + '" y1="' + Y(0) + '" x2="' + X(x) + '" y2="' + Y(state.h) + '"/>');
      for (let y = 0; y <= state.h + 0.01; y += a) s.push('<line x1="' + X(0) + '" y1="' + Y(y) + '" x2="' + X(state.w) + '" y2="' + Y(y) + '"/>');
    }
    s.push("</g>");

    // ---- centre axes of every construction circle (制图学：辅助线穿过圆心)
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

    // ---- construction circles: dashed full circle clipped to artboard, used arc solid
    s.push('<g clip-path="url(#' + clipId + ')" fill="none">');
    (state.groups || []).forEach(function (g) {
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
    s.push('<path d="' + fitsD(state.fits, scale, ox, oy) + '" fill="' + (state.construct ? "#9AA0A6" : state.color) + '" fill-rule="evenodd" opacity="' + (state.construct ? "0.85" : "0.92") + '"/>');
    if (state.construct) s.push(constructionMarkup(scale, ox, oy, 8));
    s.push('<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" fill="none" stroke="rgba(0,0,0,.16)" stroke-dasharray="3 4"/>');
    s.push("</svg>");
    host.innerHTML = s.join("");
  }

  /* ------------------------------------------------------------ exports */

  function svgString(padding, withGuides) {
    const W = state.w + padding * 2;
    const H = state.h + padding * 2;
    const body = fitsD(state.fits, 1, padding, padding);
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
      ctx.fill(new Path2D(fitsD(state.fits, 1, 24, 24)), "evenodd");
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
      version: "20260213c",
      svg: function () { return svgString(24, state.guides); },
      pdf: function () { return pdfString(24); },
      loops: function () { return state.loops.slice(); },
      fits: function () { return state.fits; },
      stats: function () { return fitStats(); },
      tangencyError: tangencyError,
      canonicalize: function () { return canonicalize(); },
      debugFit: function (i) { return fitLoop(state.loops[i], 1.1); },
      demo: function (k) { loadDemo(k || "leaf"); },
    };
  });
})();
