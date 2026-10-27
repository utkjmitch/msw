// Harness probe (GET only): Clients & Snapshots links, and fresh-load layout shift on the pages walk 1 flagged.
import { createRequire } from "node:module";
const require = createRequire("/wt/msw/msw-mfx-msw-wg-team-walk-1/server/package.json");
const { chromium } = require("playwright");
const D = "/wt/.msw-walks/workgraph-ai/2026-10-25-demo";
const b = await chromium.launch();
const ctx = async () => { const c = await b.newContext({ storageState: `${D}/harness/demo-session.json`, viewport: { width: 1440, height: 900 } });
  await c.route("**/*", r => ["GET", "HEAD"].includes(r.request().method()) && new URL(r.request().url()).hostname === "localhost" ? r.continue() : r.abort()); return c; };
let c = await ctx(); let p = await c.newPage();
await p.goto("http://localhost:3000/dashboard/projects", { waitUntil: "networkidle" });
console.log("h1:", await p.locator("h1").first().innerText());
console.log((await p.evaluate(() => [...document.querySelectorAll("main a")].map(a => `${a.innerText.trim().replace(/\s+/g, " ")} -> ${a.getAttribute("href")}`))).slice(0, 30).join("\n"));
await c.close();
for (const path of ["/dashboard/roles", "/dashboard/interviews", "/dashboard/roles/6df79d49-40eb-44e6-be5f-2ec522568c14", "/dashboard", "/dashboard/work-evolution/company"]) {
  c = await ctx(); p = await c.newPage();
  await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
  const t0 = Date.now(); await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" }); const ms = Date.now() - t0; await p.waitForTimeout(2000);
  console.log("CLS", path, (await p.evaluate(() => window.__cls)).toFixed(3), `${ms} ms to network idle`); await c.close();
}
await b.close();
