/* ==========================================================================
   shell.js — shared behaviour for every page (theme, toast, copy, top nav).
   ========================================================================== */
(function () {
  "use strict";

  const KEY = "ag-theme";

  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#000000" : "#f5f5f7");
  }

  const saved = (function () {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  })();
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", function () {
        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    }

    const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".topnav a").forEach(function (a) {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === here || (here === "" && href === "index.html")) a.classList.add("is-on");
    });
  });

  let timer = 0;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(timer);
    timer = setTimeout(function () { t.classList.remove("is-on"); }, 1600);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("已复制 " + text); }).catch(function () { toast(text); });
    } else {
      toast(text);
    }
  }

  window.AG = { toast: toast, copy: copy, applyTheme: applyTheme };
})();
