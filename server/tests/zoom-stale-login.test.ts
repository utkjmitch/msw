import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { contextOptions } from "../src/browser/conditions.js";
import { Conditions } from "../src/formats/schemas.js";
import { staleLogin } from "../src/walk/login.js";
import { serve } from "./helpers/serve.js";
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });

test("zoom 200 on a tablet lays the page out at half the width, drawn at twice the pixels, as browser zoom does", async () => {
  expect(contextOptions("tablet", "en-US", { zoom: 200 })).toMatchObject({ viewport: { width: 384, height: 512 }, deviceScaleFactor: 2 });
  const ctx = await browser.newContext(contextOptions("tablet", "en-US", { zoom: 200 })); const p = await ctx.newPage();
  try {
    await p.goto(s.url);
    expect(await p.evaluate(() => [innerWidth, devicePixelRatio, matchMedia("(max-width: 400px)").matches])).toEqual([384, 2, true]);
    // The screenshot is the tablet's own screen: 768 by 1024 pixels.
    const png = await p.screenshot(); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([768, 1024]);
  } finally { await ctx.close(); }
});
test("no zoom leaves the viewport and pixel ratio alone; zoom is checked to browser limits", () => {
  expect(contextOptions("tablet", "en-US", {})).toMatchObject({ viewport: { width: 768, height: 1024 } });
  expect(contextOptions("tablet", "en-US", {}).deviceScaleFactor).toBeUndefined();
  expect(Conditions.safeParse({ zoom: 200 }).success).toBe(true);
  expect(Conditions.safeParse({ zoom: 600 }).success).toBe(false);
  expect(Conditions.safeParse({ zoom: 50 }).success).toBe(false);
});

const login = (cookies: object[]) => { const d = mkdtempSync(join(tmpdir(), "msw-login-")); const f = join(d, "login.json");
  writeFileSync(f, JSON.stringify({ cookies, origins: [] })); return { f, done: () => rmSync(d, { recursive: true, force: true }) }; };
const NOW = Date.parse("2026-11-07T12:00:00Z");
const cookie = (domain: string, expiresIso: string | null) => ({ name: "sid", value: "SECRET-VALUE", domain, path: "/",
  expires: expiresIso ? Date.parse(expiresIso) / 1000 : -1, httpOnly: true, secure: true, sameSite: "Lax" });

test("a saved login whose cookie for a journey host has expired is stale, and the reason never shows the value", () => {
  const l = login([cookie("site.test", "2026-10-30T19:46:13Z"), cookie(".other.test", "2025-01-01T00:00:00Z")]);
  try {
    const why = staleLogin(l.f, ["https://site.test/"], NOW);
    expect(why).toContain("site.test"); expect(why).toContain("2026-10-30");
    expect(why).not.toContain("SECRET-VALUE"); expect(why).not.toContain("other.test");
  } finally { l.done(); }
});
test("a fresh, session-only or parent-domain-fresh login is not stale; a parent-domain expired one is", () => {
  const fresh = login([cookie("site.test", "2027-01-01T00:00:00Z"), cookie("site.test", null)]);
  const parent = login([cookie(".site.test", "2026-11-01T00:00:00Z")]);
  try {
    expect(staleLogin(fresh.f, ["https://site.test/"], NOW)).toBeNull();
    expect(staleLogin(parent.f, ["https://www.site.test/"], NOW)).toContain(".site.test");
  } finally { fresh.done(); parent.done(); }
});
