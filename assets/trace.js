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
    w: 0,
    h: 0,
  };

  const MAX = 520;

  /* ------------------------------------------------------------ image load */

  function loadFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      state.img = img;
      URL.revokeObjectURL(url);
      trace();
    };
    img.src = url;
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

    const mask = new Uint8Array(w * h);
    const t = state.threshold;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const a = data[i + 3] / 255;
      const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * a + 255 * (1 - a);
      let on = lum < t ? 1 : 0;
      if (state.invert) on = 1 - on;
      mask[p] = on;
    }
    return { mask, w, h };
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
    const minArea = Math.max(6, built.w * built.h * 0.00025);
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
    state.w = built.w;
    state.h = built.h;
    render();
    const info = $("#traceInfo");
    if (info) info.textContent = loops.length + " 条轮廓 · " + built.w + "×" + built.h + " px";
  }

  function pathData(loops, scale, ox, oy) {
    return loops.map(function (l) {
      return l.map(function (p, i) {
        return (i ? "L" : "M") + (p[0] * scale + ox).toFixed(2) + " " + (p[1] * scale + oy).toFixed(2);
      }).join("") + "Z";
    }).join(" ");
  }

  function render() {
    const host = $("#traceStage");
    if (!host) return;
    host.innerHTML = "";
    const W = 320;
    const H = 320;
    const scale = Math.min((W - 40) / state.w, (H - 40) / state.h) || 1;
    const ox = (W - state.w * scale) / 2;
    const oy = (H - state.h * scale) / 2;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", "100%");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "切割草稿预览");

    if (state.guides) {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("stroke", "#0071E3");
      g.setAttribute("opacity", "0.22");
      g.setAttribute("fill", "none");
      for (let x = 20; x <= W - 20; x += 20) {
        const l = document.createElementNS(svgNS, "line");
        l.setAttribute("x1", x); l.setAttribute("y1", 12);
        l.setAttribute("x2", x); l.setAttribute("y2", H - 12);
        g.appendChild(l);
      }
      for (let y = 20; y <= H - 20; y += 20) {
        const l = document.createElementNS(svgNS, "line");
        l.setAttribute("x1", 12); l.setAttribute("y1", y);
        l.setAttribute("x2", W - 12); l.setAttribute("y2", y);
        g.appendChild(l);
      }
      const rings = [[W / 2, H / 2, 90], [W / 2, H / 2, 130], [W / 2, H / 2, 60]];
      rings.forEach(function (r) {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("cx", r[0]); c.setAttribute("cy", r[1]); c.setAttribute("r", r[2]);
        c.setAttribute("stroke-dasharray", "4 5");
        g.appendChild(c);
      });
      svg.appendChild(g);
    }

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData(state.loops, scale, ox, oy));
    path.setAttribute("fill", state.color);
    path.setAttribute("fill-rule", "evenodd");
    svg.appendChild(path);

    const frame = document.createElementNS(svgNS, "rect");
    frame.setAttribute("x", 6); frame.setAttribute("y", 6);
    frame.setAttribute("width", W - 12); frame.setAttribute("height", H - 12);
    frame.setAttribute("fill", "none");
    frame.setAttribute("stroke", "rgba(0,0,0,.18)");
    frame.setAttribute("stroke-dasharray", "3 4");
    svg.appendChild(frame);

    host.appendChild(svg);
  }

  /* ------------------------------------------------------------ exports */

  function svgString(padding, withGuides) {
    const W = state.w + padding * 2;
    const H = state.h + padding * 2;
    const body = pathData(state.loops, 1, padding, padding);
    let guides = "";
    if (withGuides) {
      const step = Math.max(8, Math.round(Math.max(W, H) / 16));
      let lines = "";
      for (let x = 0; x <= W; x += step) lines += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + H + '"/>';
      for (let y = 0; y <= H; y += step) lines += '<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '"/>';
      guides = '<g stroke="#0071E3" stroke-width="0.4" opacity="0.35" fill="none">' + lines + "</g>";
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">\n' +
      guides + '\n<path fill="' + state.color + '" fill-rule="evenodd" d="' + body + '"/>\n</svg>\n';
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
  function pdfString(padding) {
    const W = state.w + padding * 2;
    const H = state.h + padding * 2;
    const ops = [];
    ops.push("q 1 0 0 1 0 0 cm");
    const rgb = state.color.replace("#", "");
    const rr = (parseInt(rgb.slice(0, 2), 16) / 255).toFixed(3);
    const gg = (parseInt(rgb.slice(2, 4), 16) / 255).toFixed(3);
    const bb = (parseInt(rgb.slice(4, 6), 16) / 255).toFixed(3);
    ops.push(rr + " " + gg + " " + bb + " rg");
    state.loops.forEach(function (l) {
      l.forEach(function (p, i) {
        const x = (p[0] + padding).toFixed(2);
        const y = (H - (p[1] + padding)).toFixed(2);
        ops.push(x + " " + y + (i ? " l" : " m"));
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

  /* ------------------------------------------------------------ wiring */

  document.addEventListener("DOMContentLoaded", function () {
    const input = $("#traceFile");
    const drop = $("#traceDrop");

    if (input) input.addEventListener("change", function () { loadFile(input.files[0]); });
    if (drop) {
      drop.addEventListener("click", function () { if (input) input.click(); });
      ["dragenter", "dragover"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); });
      });
      drop.addEventListener("drop", function (e) {
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) loadFile(f);
      });
    }

    const th = $("#traceThreshold");
    if (th) th.addEventListener("input", function () {
      state.threshold = Number(th.value);
      $("#thVal").textContent = th.value;
      trace();
    });

    const sp = $("#traceSimplify");
    if (sp) sp.addEventListener("input", function () {
      state.simplify = Number(sp.value);
      $("#spVal").textContent = state.simplify.toFixed(1);
      trace();
    });

    const inv = $("#traceInvert");
    if (inv) inv.addEventListener("change", function () { state.invert = inv.checked; trace(); });

    const gd = $("#traceGuides");
    if (gd) gd.addEventListener("change", function () { state.guides = gd.checked; render(); });

    const col = $("#traceColor");
    if (col) col.addEventListener("input", function () { state.color = col.value; render(); });

    const svgBtn = $("#dlSvg");
    if (svgBtn) svgBtn.addEventListener("click", function () {
      if (!state.loops.length) return;
      download("logo-draft.svg", svgString(24, state.guides), "image/svg+xml");
    });

    const aiBtn = $("#dlAi");
    if (aiBtn) aiBtn.addEventListener("click", function () {
      if (!state.loops.length) return;
      download("logo-draft.ai", pdfString(24), "application/postscript");
    });

    const pngBtn = $("#dlPng");
    if (pngBtn) pngBtn.addEventListener("click", function () {
      if (!state.loops.length) return;
      const scale = 4;
      const c = document.createElement("canvas");
      c.width = (state.w + 48) * scale;
      c.height = (state.h + 48) * scale;
      const ctx = c.getContext("2d");
      ctx.scale(scale, scale);
      ctx.fillStyle = state.color;
      state.loops.forEach(function (l) {
        ctx.beginPath();
        l.forEach(function (p, i) {
          const x = p[0] + 24;
          const y = p[1] + 24;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
      });
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
      svg: function () { return svgString(24, state.guides); },
      pdf: function () { return pdfString(24); },
      loops: function () { return state.loops.slice(); },
    };
  });
})();
