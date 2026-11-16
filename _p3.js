const fs = require("fs");
const p = "assets/trace.js";
let t = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const orig = t;

// 1) simple defaults: clean vector draft first, construction layer off
t = t.replace("    construct: true,", "    construct: false,");
t = t.replace("    unify: true,", "    unify: true,\n    standard: true,");

// 2) snap every radius family onto standard module fractions (1/8 a)
const anchor = `    const base = Math.min(state.w, state.h) || 1;`;
const snap = `    // 标准图形：把半径族吸附到模数的 1/8 整数倍（0.5a / 0.75a / 1a / 3.75a …）
    if (state.standard) {
      const mod = Math.max(state.w, state.h) / (state.gridN || 12);
      groups.forEach(function (g) {
        const q = Math.max(4, Math.round((g.mean / mod) * 8)) / 8;
        g.mean = q * mod;
      });
    }
${anchor}`;
if (!t.includes(anchor)) { console.error("MISS base"); process.exit(1); }
t = t.replace(anchor, snap);

// 3) one-click: fit -> download AI
const hook = `    const aiBtn = $("#dlAi");`;
const oneClick = `    const oneClick = $("#dlAiQuick");
    if (oneClick) oneClick.addEventListener("click", function () {
      if (!state.fits.length) { fail("请先上传一张图片（或点「载入示例」）。"); return; }
      download("logo-draft.ai", pdfString(24), "application/postscript");
      if (window.AG) AG.toast("已导出 AI 矢量草稿");
    });

${hook}`;
if (!t.includes(hook)) { console.error("MISS aiBtn"); process.exit(1); }
t = t.replace(hook, oneClick);

fs.writeFileSync(p, t, "utf8");
console.log("patched", t.length !== orig.length);
