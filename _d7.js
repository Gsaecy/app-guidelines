const t=require("fs").readFileSync("assets/trace.js","utf8").split("\n");
const i=t.findIndex(l=>l.indexOf("clip-path=\"url(#")>-1 && l.indexOf("clipId")>-1);
console.log("idx",i+1);
for(let k=i-6;k<i+3;k++) console.log((k+1)+"| "+t[k]);
