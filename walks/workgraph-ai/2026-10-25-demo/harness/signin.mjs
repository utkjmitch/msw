// Harness sign-in (walkers never type a password): the app's own precheck form
// sign-in as the demo internal user, saved as the walk's storage state.
// The password is read from the demo profile at run time, never written here.
import { createRequire } from "node:module";
const require = createRequire("/wt/msw/msw-mfx-msw-wg-team-walk-1/server/package.json");
const { chromium } = require("playwright");
const D = "/wt/.msw-walks/workgraph-ai/2026-10-25-demo";
const { acmeProfile } = await import(`${D}/app/scripts/demo/profiles/acme.mjs`);
const who = acmeProfile.adminUser;
if (who.email !== "demo@workgraph.local") throw new Error("not the demo internal user");
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.route("**/*", (r) => (new URL(r.request().url()).hostname === "localhost" ? r.continue() : r.abort()));
await page.goto("http://localhost:3000/login");
await page.locator('input[type="email"]').fill(who.email);
await page.locator('input[type="password"]').fill(who.password);
const [res] = await Promise.all([
  page.waitForResponse((r) => r.url().includes("/api/auth/login") && r.request().method() === "POST"),
  page.getByRole("button", { name: "Sign In" }).click(),
]);
console.log("login status", res.status());
await page.waitForURL((u) => u.pathname.startsWith("/dashboard"), { timeout: 30000 });
console.log("landed on", new URL(page.url()).pathname);
await ctx.storageState({ path: `${D}/harness/demo-session.json` });
await browser.close();
