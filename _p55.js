const fs=require("fs");let t=fs.readFileSync("assets/trace.js","utf8").replace(/\r\n/g,"\n");
const anchor = `    s.push('<g clip-path="url(#' + clipId + '" fill="none">');`;
if(!t.includes(anchor)){console.error("MISS anchor");process.exit(1);}
const NB = `    // 圆 / 矩形 / 椭圆 / 带孔图形：同样要出构造线（中心线 + 尺寸），不能只有一条轮廓
    if (std && (std.kind === "circle" || std.kind === "rect" || std.kind === "ellipse")) {
      const bx0 = std.x0, by0 = std.y0, bx1 = std.x1 + 1, by1 = std.y1 + 1;
      const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2;
      const AR = 6, hwv = AR * Math.tan(Math.PI / 12);
      const arrow = function (x, y, ang) {
        const c = Math.cos(ang), s_ = Math.sin(ang), bx = x - AR * c, by = y - AR * s_, px = -s_ * hwv, py = c * hwv;
        return '<path d="M' + x + " " + y + "L" + (bx + px) + " " + (by + py) + "L" + (bx - px) + " " + (by - py) + '" fill="' + HI + '" stroke="none"/>';
      };
      // 中心线：长划点线，伸出轮廓约 2~5mm
      s.push('<g id="centrelines" stroke="' + HI + '" stroke-width="0.6" stroke-dasharray="14 3 1 3" opacity="0.9">');
      s.push('<line x1="' + (X(bx0) - 8) + '" y1="' + Y(cy) + '" x2="' + (X(bx1) + 8) + '" y2="' + Y(cy) + '"/>');
      s.push('<line x1="' + X(cx) + '" y1="' + (Y(by0) - 8) + '" x2="' + X(cx) + '" y2="' + (Y(by1) + 8) + '"/>');
      s.push("</g>");
      s.push('<g id="centres" stroke="' + HI + '" stroke-width="0.6">');
      s.push('<line x1="' + (X(cx) - 5) + '" y1="' + Y(cy) + '" x2="' + (X(cx) + 5) + '" y2="' + Y(cy) + '"/>');
      s.push('<line x1="' + X(cx) + '" y1="' + (Y(cy) - 5) + '" x2="' + X(cx) + '" y2="' + (Y(cy) + 5) + '"/>');
      s.push("</g>");

      const dOff = 16, gap = 2, over = 4, wy = Y(by1) + dOff, hx = X(bx0) - dOff;
      const dwv = ((bx1 - bx0) / a).toFixed(1), dhv = ((by1 - by0) / a).toFixed(1);
      s.push('<g id="dims" fill="none" stroke="' + HI + '" stroke-width="0.7">');
      if (std.kind === "circle") {
        // 圆：直径尺寸 ⌀，尺寸线过圆心、两端箭头
        s.push('<line x1="' + X(bx0) + '" y1="' + Y(cy) + '" x2="' + (X(bx1) - AR) + '" y2="' + Y(cy) + '"/>');
        s.push(arrow(X(bx0), Y(cy), 0), arrow(X(bx1), Y(cy), Math.PI));
      } else {
        s.push('<line x1="' + X(bx0) + '" y1="' + (Y(by1) + gap) + '" x2="' + X(bx0) + '" y2="' + (wy + over) + '"/>');
        s.push('<line x1="' + X(bx1) + '" y1="' + (Y(by1) + gap) + '" x2="' + X(bx1) + '" y2="' + (wy + over) + '"/>');
        s.push('<line x1="' + (X(bx0) + AR) + '" y1="' + wy + '" x2="' + (X(bx1) - AR) + '" y2="' + wy + '"/>');
        s.push(arrow(X(bx0), wy, 0), arrow(X(bx1), wy, Math.PI));
        s.push('<line x1="' + (X(bx0) - gap) + '" y1="' + Y(by0) + '" x2="' + (hx - over) + '" y2="' + Y(by0) + '"/>');
        s.push('<line x1="' + (X(bx0) - gap) + '" y1="' + Y(by1) + '" x2="' + (hx - over) + '" y2="' + Y(by1) + '"/>');
        s.push('<line x1="' + hx + '" y1="' + (Y(by0) + AR) + '" x2="' + hx + '" y2="' + (Y(by1) - AR) + '"/>');
        s.push(arrow(hx, Y(by0), Math.PI / 2), arrow(hx, Y(by1), -Math.PI / 2));
      }
      s.push("</g>");

      if (fontSize) {
        const mask = ' style="paint-order:stroke" stroke="#FFFFFF" stroke-width="2.5"';
        s.push('<g id="dim-text" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="' + fontSize +
          '" font-weight="500" fill="' + HI + '" text-anchor="middle"' + mask + ">");
        if (std.kind === "circle") {
          s.push('<text x="' + X(cx) + '" y="' + (Y(cy) - 4) + '">⌀' + dwv + "</text>");
        } else {
          s.push('<text x="' + ((X(bx0) + X(bx1)) / 2) + '" y="' + (wy - 4) + '">' + dwv + "</text>");
          s.push('<text x="' + (hx - 3) + '" y="' + ((Y(by0) + Y(by1)) / 2) + '" dy="3" text-anchor="end">' + dhv + "</text>");
        }
        // 孔：差集图案单独标注 ⌀
        (state.holes || []).forEach(function (h) {
          if (h.kind !== "circle") return;
          s.push('<text x="' + X(h.cx) + '" y="' + (Y(h.cy) - 4) + '" font-size="' + fontSize + '">⌀' +
            ((h.r * 2) / a).toFixed(1) + "</text>");
        });
        s.push('<text x="' + X(bx0) + '" y="' + Y(by1) + '" dy="40" text-anchor="start">' +
          "单位：a（模数 = 短边 / " + n + "）" + ((state.holes || []).length ? "，内孔为差集图案（−）" : "") + "</text>");
        s.push("</g>");
      }
      return s.join("");
    }

` + anchor;
t=t.replace(anchor, NB);
t=t.replace('version: "20260222d"','version: "20260222e"');
fs.writeFileSync("assets/trace.js",t,"utf8");
let x=fs.readFileSync("trace.html","utf8").replace(/\r\n/g,"\n");
x=x.replace('trace.js?v=20260222d','trace.js?v=20260222e').replace('window.AGTrace.version!=="20260222d"','window.AGTrace.version!=="20260222e"');
fs.writeFileSync("trace.html",x,"utf8");
console.log("ok");
