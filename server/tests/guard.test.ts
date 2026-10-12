import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { installGuard, transactAllowed, type Blocked } from "../src/browser/guard.js";
import { serve } from "./helpers/serve.js";
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });

test("read-only blocks form posts to the site and records them", async () => {
  const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  try {
    await installGuard(ctx, { mode: "read-only", origins: [s.url], onBlocked: b => blocked.push(b) });
    const p = await ctx.newPage(); await p.goto(s.url);
    await p.fill("#nm", "Test");
    await Promise.all([p.waitForEvent("requestfailed", r => r.method() === "POST"), p.click("text=Donate")]);
    expect(s.posts).toEqual([]); expect(blocked[0]).toMatchObject({ why: "would-submit", method: "POST" });
  } finally { await ctx.close(); }
});
test("navigation to an origin not on the list is blocked", async () => {
  const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  try {
    await installGuard(ctx, { mode: "read-only", origins: [s.url], onBlocked: b => blocked.push(b) });
    const p = await ctx.newPage(); await p.goto(s.url);
    await Promise.all([p.waitForEvent("requestfailed", r => r.url().includes("localhost")), p.click("text=Partner portal")]);
    expect(blocked.some(b => b.why === "left-site")).toBe(true);
  } finally { await ctx.close(); }
});
test("transact on an allowed second origin passes", async () => {
  const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  try {
    await installGuard(ctx, { mode: "transact", origins: [s.url, s.otherOrigin], onBlocked: b => blocked.push(b) });
    const p = await ctx.newPage(); await p.goto(s.url);
    await Promise.all([p.waitForURL(/localhost/), p.click("text=Partner portal")]);
    await p.goto(s.url); await p.fill("#nm", "Test");
    await Promise.all([p.waitForURL(/thanks.html/), p.click("text=Donate")]);
    expect(blocked).toEqual([]); expect(s.posts).toContain("/donate");
  } finally { await ctx.close(); }
});
test("transactAllowed needs a test environment and listed origins", () => {
  const j = { mode: "transact", origins: ["https://dev.a.test/"], start_url: "https://dev.a.test/" } as any;
  expect(transactAllowed({ environment: { kind: "live" }, allowed_for_transact: ["https://dev.a.test/"] } as any, j).ok).toBe(false);
  expect(transactAllowed({ environment: { kind: "test" }, allowed_for_transact: [] } as any, j).ok).toBe(false);
  expect(transactAllowed({ environment: { kind: "test" }, allowed_for_transact: ["https://dev.a.test/"] } as any, j).ok).toBe(true);
});
test("a background write to another origin is blocked as its own kind, not as leaving the site", async () => {
  for (const mode of ["read-only", "transact"] as const) {
    const ctx = await browser.newContext(); const blocked: Blocked[] = [];
    try {
      await installGuard(ctx, { mode, origins: [s.url], onBlocked: b => blocked.push(b) });
      const p = await ctx.newPage(); await p.goto(s.url);
      await p.evaluate(url => fetch(url, { method: "POST", mode: "no-cors", body: "x" }).catch(() => {}), s.otherOrigin + "/beacon");
      expect(s.posts).not.toContain("/beacon");
      expect(blocked).toEqual([expect.objectContaining({ why: "background-write", method: "POST" })]);
    } finally { await ctx.close(); }
  }
});
test("a journey's payment origin takes writes in transact mode only", async () => {
  for (const mode of ["transact", "read-only"] as const) {
    const ctx = await browser.newContext(); const blocked: Blocked[] = [];
    try {
      await installGuard(ctx, { mode, origins: [s.url], payments: [s.otherOrigin], onBlocked: b => blocked.push(b) });
      const p = await ctx.newPage(); await p.goto(s.url);
      const path = `/pay-${mode}`;
      await p.evaluate(url => fetch(url, { method: "POST", mode: "no-cors", body: "x" }).catch(() => {}), s.otherOrigin + path);
      if (mode === "transact") { expect(s.posts).toContain(path); expect(blocked).toEqual([]); }
      else { expect(s.posts).not.toContain(path); expect(blocked[0]).toMatchObject({ why: "background-write" }); }
    } finally { await ctx.close(); }
  }
});
test("payment origins need payment_test_mode in the run file", () => {
  const j = { mode: "transact", origins: [], start_url: "https://dev.a.test/", payment_origins: ["https://pay.test/"] } as any;
  const run = { environment: { kind: "test" }, allowed_for_transact: ["https://dev.a.test/"] };
  expect(transactAllowed({ ...run, payment_test_mode: false } as any, j)).toEqual({ ok: false, reason: "payment origins need payment_test_mode: true in the run file" });
  expect(transactAllowed({ ...run, payment_test_mode: true } as any, j).ok).toBe(true);
});
