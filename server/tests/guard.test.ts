import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { installGuard, transactAllowed, type Blocked } from "../src/browser/guard.js";
import { serve } from "./helpers/serve.js";
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });

test("read-only blocks form posts to the site and records them", async () => {
  const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  await installGuard(ctx, { mode: "read-only", origins: [s.url], onBlocked: b => blocked.push(b) });
  const p = await ctx.newPage(); await p.goto(s.url);
  await p.fill("#nm", "Test"); await p.click("text=Donate"); await p.waitForTimeout(500);
  expect(s.posts).toEqual([]); expect(blocked[0]).toMatchObject({ why: "would-submit", method: "POST" });
  await ctx.close();
});
test("navigation to an origin not on the list is blocked", async () => {
  const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  await installGuard(ctx, { mode: "read-only", origins: [s.url], onBlocked: b => blocked.push(b) });
  const p = await ctx.newPage(); await p.goto(s.url);
  await p.click("text=Partner portal").catch(() => {}); await p.waitForTimeout(500);
  expect(blocked.some(b => b.why === "left-site")).toBe(true);
  await ctx.close();
});
test("transact on an allowed second origin passes", async () => {
  const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  await installGuard(ctx, { mode: "transact", origins: [s.url, s.otherOrigin], onBlocked: b => blocked.push(b) });
  const p = await ctx.newPage(); await p.goto(s.url);
  await p.click("text=Partner portal"); await p.waitForURL(/localhost/);
  await p.goto(s.url); await p.fill("#nm", "Test"); await p.click("text=Donate"); await p.waitForTimeout(500);
  expect(blocked).toEqual([]); expect(s.posts).toContain("/donate");
  await ctx.close();
});
test("transactAllowed needs a test environment and listed origins", () => {
  const j = { mode: "transact", origins: ["https://dev.a.test/"], start_url: "https://dev.a.test/" } as any;
  expect(transactAllowed({ environment: { kind: "live" }, allowed_for_transact: ["https://dev.a.test/"] } as any, j).ok).toBe(false);
  expect(transactAllowed({ environment: { kind: "test" }, allowed_for_transact: [] } as any, j).ok).toBe(false);
  expect(transactAllowed({ environment: { kind: "test" }, allowed_for_transact: ["https://dev.a.test/"] } as any, j).ok).toBe(true);
});
