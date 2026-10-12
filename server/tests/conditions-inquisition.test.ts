import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { contextOptions, applyStepConditions } from "../src/browser/conditions.js";
import { attachInquisition, inspectPage, instrumentFindings, VITALS_INIT, type InstrumentRecord } from "../src/instrument/inquisition.js";
import { serve } from "./helpers/serve.js";
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });

test("contextOptions maps viewport, locale and conditions", () => {
  expect(contextOptions("phone", "es-419", { color_scheme: "dark", reduced_motion: true })).toMatchObject({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: "es-419",
    colorScheme: "dark", reducedMotion: "reduce", extraHTTPHeaders: { "Accept-Language": "es-419" } });
});
test("rotate at step swaps the viewport", async () => {
  const ctx = await browser.newContext(contextOptions("phone", "en-US", {})); const p = await ctx.newPage();
  expect(await applyStepConditions(ctx, p, 1, { rotate_at_step: 2 })).toEqual([]);
  expect(await applyStepConditions(ctx, p, 2, { rotate_at_step: 2 })).toEqual(["rotate"]);
  expect(p.viewportSize()).toEqual({ width: 844, height: 390 });
  await ctx.close();
});
test("the inquisition records console errors, 404s, axe violations and vitals", async () => {
  const ctx = await browser.newContext(); await ctx.addInitScript(VITALS_INIT); const p = await ctx.newPage();
  const recs: InstrumentRecord[] = []; attachInquisition(p, r => recs.push(r));
  await p.goto(s.url + "about.html"); await p.waitForLoadState("networkidle");
  await inspectPage(p, r => recs.push(r));
  expect(recs.some(r => r.type === "console")).toBe(true);
  expect(recs.some(r => r.type === "http" && r.detail.status === 404)).toBe(true);
  expect(recs.some(r => r.type === "axe" && r.detail.id === "image-alt")).toBe(true);
  expect(recs.some(r => r.type === "vitals")).toBe(true);
  const f = instrumentFindings(recs.map((r, i) => ({ ...r, step: 1, event: i + 1 })),
    { run: "r", walker: "w", journey: "j", viewport: "desktop", locale: "en-US" });
  expect(f.find(x => x.title.startsWith("Console error"))?.severity).toBe(3);
  expect(f.find(x => x.kind === "accessibility")?.severity).toBe(3);
  expect(f.find(x => x.kind === "content")?.severity).toBe(2);
  await ctx.close();
});
test("session expiry also drops journey-host cookies on deep paths and parent domains", async () => {
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  try {
    await ctx.addCookies([
      { name: "journey", value: "yes", domain: "site.test", path: "/deep" },
      { name: "shared", value: "yes", domain: ".site.test", path: "/" },
      { name: "other", value: "yes", domain: "other.test", path: "/" },
    ]);
    await applyStepConditions(ctx, page, 1, { expire_session_at_step: 1 }, { origins: ["https://site.test/"] });
    expect((await ctx.cookies()).map(c => c.name)).toEqual(["other"]);
  } finally { await ctx.close(); }
});
test("session expiry drops only the journey origins' cookies", async () => {
  const ctx = await browser.newContext(); const p = await ctx.newPage();
  try {
    await ctx.addCookies([{ name: "sid", value: "1", url: s.url }, { name: "elsewhere", value: "2", url: s.otherOrigin }]);
    expect(await applyStepConditions(ctx, p, 2, { expire_session_at_step: 2 }, { origins: [s.url] })).toEqual(["expire-session"]);
    expect((await ctx.cookies()).map(c => c.name)).toEqual(["elsewhere"]);
  } finally { await ctx.close(); }
});
