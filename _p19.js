const fs = require("fs");
const p = "assets/trace.js";
let t = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

// 三点定圆：用弧段的首/中/末三个点直接确定圆心与半径。
// 比在被污染的点集上做最小二乘更准，能保证"画出的圆就是这段弧所在的圆"。
const anchor = `  function buildFits() {`;
const helper = `  function circum3(a, b, c) {
    const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    if (Math.abs(d) < 1e-6) return null;
    const a2 = a[0] * a[0] + a[1] * a[1];
    const b2 = b[0] * b[0] + b[1] * b[1];
    const c2 = c[0] * c[0] + c[1] * c[1];
    const cx = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
    const cy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
    const r = Math.hypot(a[0] - cx, a[1] - cy);
    if (!isFinite(r) || r <= 0) return null;
    return { cx: cx, cy: cy, r: r, maxErr: 0 };
  }

${anchor}`;
if (!t.includes(anchor)) { console.error("MISS anchor"); process.exit(1); }
t = t.replace(anchor, helper);

// 弧段改用三点定圆
const oldPick = `        const c = circleOf(ext) || circleOf(seg);
        return c ? { t: "A", c: c, seg: seg } : { t: "L", seg: seg };`;
const newPick = `        const mid = seg[Math.floor(seg.length / 2)];
        const c = (seg.length >= 5 && circum3(seg[0], mid, seg[seg.length - 1])) || circleOf(seg);
        return c ? { t: "A", c: c, seg: seg } : { t: "L", seg: seg };`;
if (!t.includes(oldPick)) { console.error("MISS pick"); process.exit(1); }
t = t.replace(oldPick, newPick);

t = t.replace('version: "20260214c"', 'version: "20260214d"');
fs.writeFileSync(p, t, "utf8");

const h = "trace.html";
let x = fs.readFileSync(h, "utf8").replace(/\r\n/g, "\n");
x = x.replace('trace.js?v=20260214c', 'trace.js?v=20260214d');
x = x.replace('window.AGTrace.version!=="20260214c"', 'window.AGTrace.version!=="20260214d"');
fs.writeFileSync(h, x, "utf8");
console.log("patched");
