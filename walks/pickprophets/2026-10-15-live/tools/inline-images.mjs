// Inlines shots/*.jpg into tools/report.src.html as data URIs and writes REPORT.html.
// Run from the run folder: node tools/inline-images.mjs
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync("tools/report.src.html", "utf8").replace(/src="(shots\/[^"]+\.jpg)"/g,
  (_, p) => `src="data:image/jpeg;base64,${readFileSync(p).toString("base64")}"`);
if (/src="shots\//.test(html)) throw new Error("an image was not inlined");
writeFileSync("REPORT.html", html);
console.log(`REPORT.html ${html.length} bytes`);
