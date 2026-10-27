// Harness capture (GET only, demo session, 1440x900): the top of each page a finding is about.
import { createRequire } from "node:module";
const require = createRequire("/wt/msw/msw-mfx-msw-wg-team-walk-1/server/package.json");
const { chromium } = require("playwright");
const D = "/wt/.msw-walks/workgraph-ai/2026-10-25-demo";
const shots = JSON.parse(process.argv[2]); // [[name, path, scrollY?]]
const b = await chromium.launch(); const c = await b.newContext({ storageState: `${D}/harness/demo-session.json`, viewport: { width: 1440, height: 900 } });
await c.route("**/*", r => ["GET", "HEAD"].includes(r.request().method()) && new URL(r.request().url()).hostname === "localhost" ? r.continue() : r.abort());
const p = await c.newPage();
for (const [name, path, y] of shots) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  if (y) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(500); }
  await p.screenshot({ path: `${D}/shots/${name}.png` }); console.log(name, new URL(p.url()).pathname);
}
await b.close();
