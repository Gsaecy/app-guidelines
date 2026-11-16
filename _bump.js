const fs = require("fs");
for (const f of ["assets/trace.js", "trace.html"]) {
  let s = fs.readFileSync(f, "utf8");
  s = s.split("20260301a").join("20260301b");
  fs.writeFileSync(f, s, "utf8");
}
console.log("bumped to 20260301b");
