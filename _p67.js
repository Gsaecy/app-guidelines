const fs=require("fs");let t=fs.readFileSync("assets/trace.js","utf8").replace(/\r\n/g,"\n");
const rep=(a,b)=>{ if(!t.includes(a)){console.error("MISS: "+a.slice(0,70));process.exit(1);} t=t.replace(a,b); };

// ① 统一避让：数字之间不重叠（贪心位移）
rep(`  function constructionMarkup(scale, ox, oy, fontSize) {`,
`  // 标注数字避让：按估算字宽逐个放置，互相重叠时按候选位移推开（工程图也要求数字互不重叠）
  function placeLabels(list, size) {
    const placed = [];
    const steps = [[0, 0], [0, -13], [0, 13], [16, 0], [-16, 0], [16, -13], [-16, -13], [16, 13], [-16, 13], [0, -26], [0, 26], [32, 0], [-32, 0], [32, -20], [-32, -20]];
    list.forEach(function (L) {
      const w = L.text.length * size * 0.62 + 4, h = size + 4;
      const anchor = L.anchor || "middle";
      for (let i = 0; i < steps.length; i++) {
        const px = L.x + steps[i][0], py = L.y + steps[i][1];
        const left = anchor === "end" ? px - w : anchor === "start" ? px : px - w / 2;
        const box = { x: left - 2, y: py - h + 2, w: w + 4, h: h };
        const hit = placed.some(function (p) {
          return !(box.x + box.w < p.x || p.x + p.w < box.x || box.y + box.h < p.y || p.y + p.h < box.y);
        });
        if (!hit || i === steps.length - 1) { L.px = px; L.py = py; placed.push(box); break; }
      }
    });
    return list;
  }

  function constructionMarkup(scale, ox, oy, fontSize) {`);

// ② 圆/矩形/椭圆/带孔分支：所有数字统一经 placeLabels 定位
rep(`        const mask = ' style="paint-order:stroke" stroke="#FFFFFF" stroke-width="2.5"';
        s.push('<g id="dim-text" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + fontSize +
          '" font-weight="500" fill="' + HI + '" text-anchor="middle"' + mask + ">");
        if (std.kind === "circle") {
          s.push('<text x="' + X(cx + rr0 * 0.62 * Math.cos(angR)) + '" y="' + Y(cy + rr0 * 0.62 * Math.sin(angR)) + '" dy="-3">R' +
            (rr0 / a).toFixed(1) + "</text>");
        } else {
          s.push('<text x="' + ((X(bx0) + X(bx1)) / 2) + '" y="' + (wy - 4) + '">' + dwv + "</text>");
          s.push('<text x="' + (hx - 3) + '" y="' + ((Y(by0) + Y(by1)) / 2) + '" dy="3" text-anchor="end">' + dhv + "</text>");
        }
        holeLabels.forEach(function (q) {
          s.push('<text x="' + q.x + '" y="' + (q.y + 3) + '">' + q.t + "</text>");
        });`,
`        const mask = ' style="paint-order:stroke" stroke="#FFFFFF" stroke-width="2.5"';
        const lab = [];
        if (std.kind === "circle") {
          lab.push({ x: X(cx + rr0 * 0.62 * Math.cos(angR)), y: Y(cy + rr0 * 0.62 * Math.sin(angR)) - 3, text: "R" + (rr0 / a).toFixed(1) });
        } else {
          lab.push({ x: (X(bx0) + X(bx1)) / 2, y: wy - 4, text: dwv });
          lab.push({ x: hx - 3, y: (Y(by0) + Y(by1)) / 2 + 3, text: dhv, anchor: "end" });
        }
        holeLabels.forEach(function (q) { lab.push({ x: q.x, y: q.y + 3, text: q.t }); });
        placeLabels(lab, fontSize);
        s.push('<g id="dim-text" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + fontSize +
          '" font-weight="500" fill="' + HI + '"' + mask + ">");
        lab.forEach(function (q) {
          s.push('<text x="' + q.px + '" y="' + q.py + '"' + (q.anchor ? ' text-anchor="' + q.anchor + '"' : "") + ">" + q.text + "</text>");
        });`);

t=t.replace('version: "20260222o"','version: "20260222p"');
fs.writeFileSync("assets/trace.js",t,"utf8");
let x=fs.readFileSync("trace.html","utf8").replace(/\r\n/g,"\n");
x=x.replace('trace.js?v=20260222o','trace.js?v=20260222p').replace('window.AGTrace.version!=="20260222o"','window.AGTrace.version!=="20260222p"');
fs.writeFileSync("trace.html",x,"utf8");
console.log("ok");
