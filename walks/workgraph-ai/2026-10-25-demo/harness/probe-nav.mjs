// Harness probe (GET only): the dashboard sidebar's link names and addresses, signed in as the demo user.
import { createRequire } from "node:module";
const require = createRequire("/wt/msw/msw-mfx-msw-wg-team-walk-1/server/package.json");
const { chromium } = require("playwright");
const D = "/wt/.msw-walks/workgraph-ai/2026-10-25-demo";
const b = await chromium.launch(); const c = await b.newContext({ storageState: `${D}/harness/demo-session.json`, viewport: { width: 1440, height: 900 } });
await c.route("**/*", r => ["GET", "HEAD"].includes(r.request().method()) && new URL(r.request().url()).hostname === "localhost" ? r.continue() : r.abort());
const p = await c.newPage(); await p.goto("http://localhost:3000" + (process.argv[2] || "/dashboard"), { waitUntil: "networkidle" });
console.log("at", new URL(p.url()).pathname);
const links = await p.evaluate(() => [...document.querySelectorAll("nav a, aside a")].map(a => `${a.innerText.trim().replace(/\s+/g, " ")} -> ${a.getAttribute("href")}`));
console.log(links.join("\n")); await b.close();
