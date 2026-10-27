// Harness probe (GET only): where the role tab row sits, on a direct load and after clicking the role in the Roles list.
import { createRequire } from "node:module";
const require = createRequire("/wt/msw/msw-mfx-msw-wg-team-walk-1/server/package.json");
const { chromium } = require("playwright");
const D = "/wt/.msw-walks/workgraph-ai/2026-10-25-demo";
const [roleId, roleName] = [process.argv[2], process.argv[3]];
const b = await chromium.launch(); const c = await b.newContext({ storageState: `${D}/harness/demo-session.json`, viewport: { width: 1440, height: 900 } });
await c.route("**/*", r => ["GET", "HEAD"].includes(r.request().method()) && new URL(r.request().url()).hostname === "localhost" ? r.continue() : r.abort());
const p = await c.newPage();
const tabs = () => p.evaluate(() => { const t = [...document.querySelectorAll("a,button,[role=tab]")].find(e => /^Evolution$/.test(e.innerText.trim()));
  return { scrollY: Math.round(scrollY), evolutionTab: t ? { y: Math.round(t.getBoundingClientRect().y), visible: !!t.offsetParent, href: t.getAttribute("href") } : null }; });
await p.goto(`http://localhost:3000/dashboard/roles/${roleId}`, { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
console.log("direct load", JSON.stringify(await tabs()));
await p.goto("http://localhost:3000/dashboard/roles", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
const card = p.locator(`a[href="/dashboard/roles/${roleId}"]`).first(); await card.scrollIntoViewIfNeeded(); await card.click();
await p.waitForFunction(() => /\/dashboard\/roles\/[0-9a-f-]{36}/.test(location.pathname), null, { timeout: 20000 }); await p.waitForLoadState("networkidle"); await p.waitForTimeout(1000);
console.log("from Roles list", new URL(p.url()).pathname, JSON.stringify(await tabs()));
await b.close();
