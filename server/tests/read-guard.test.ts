import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { installGuard, adminAllowed, type Blocked } from "../src/browser/guard.js";
import { Journey, RunConfig } from "../src/formats/schemas.js";
import { serve } from "./helpers/serve.js";
// Its own server, so the posts each test sees are its own.
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });
const fresh = () => { s.posts.length = 0; };

test("a Firestore read goes through, its write does not", async () => {
  fresh(); const ctx = await browser.newContext(); const blocked: Blocked[] = []; const reads: string[] = [];
  try {
    await installGuard(ctx, { mode: "read-only", origins: [s.url], reads: [{ preset: "firestore-listen", origin: s.otherOrigin }],
      onBlocked: b => blocked.push(b), onRead: r => reads.push(r.url) });
    const p = await ctx.newPage(); await p.goto(`${s.url}firestore.html?fs=${encodeURIComponent(s.otherOrigin)}`);
    await expect.poll(() => p.textContent("#board")).toBe("Players on the board: 3");
    expect(s.posts).toContain("/google.firestore.v1.Firestore/Listen/channel");
    expect(s.posts).not.toContain("/google.firestore.v1.Firestore/Write/channel");
    await expect.poll(() => blocked.some(b => b.why === "background-write" && b.url.includes("/Write/channel"))).toBe(true);
    expect(reads).toHaveLength(1);
  } finally { await ctx.close(); }
});
test("with no read channels, read-only refuses the Firestore read exactly as before", async () => {
  fresh(); const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  try {
    await installGuard(ctx, { mode: "read-only", origins: [s.url], onBlocked: b => blocked.push(b) });
    const p = await ctx.newPage(); await p.goto(`${s.url}firestore.html?fs=${encodeURIComponent(s.otherOrigin)}`);
    await expect.poll(() => p.textContent("#board")).toBe("No data available");
    await expect.poll(() => blocked.filter(b => b.why === "background-write").length).toBe(2);
    expect(s.posts.filter(x => x.includes("Firestore"))).toEqual([]);
  } finally { await ctx.close(); }
});
test("a form submit to a path named as a read channel is still would-submit", async () => {
  fresh(); const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  try {
    await installGuard(ctx, { mode: "read-only", origins: [s.url], reads: [{ origin: s.url.replace(/\/$/, ""), path: "/donate", method: "POST" }], onBlocked: b => blocked.push(b) });
    const p = await ctx.newPage(); await p.goto(s.url);
    await p.fill("#nm", "Test");
    await Promise.all([p.waitForEvent("requestfailed", r => r.method() === "POST"), p.click("text=Donate")]);
    expect(s.posts).toEqual([]); expect(blocked[0]).toMatchObject({ why: "would-submit", method: "POST" });
  } finally { await ctx.close(); }
});
test("a read endpoint that answers 307 is refused, so the body is not carried on", async () => {
  fresh(); const ctx = await browser.newContext(); const blocked: Blocked[] = [];
  try {
    await installGuard(ctx, { mode: "read-only", origins: [s.url], reads: [{ origin: s.url.replace(/\/$/, ""), path: "/redirect-read", method: "POST" }], onBlocked: b => blocked.push(b) });
    const p = await ctx.newPage(); await p.goto(s.url);
    await p.evaluate(() => fetch("/redirect-read", { method: "POST", body: "x" }).catch(() => {}));
    await expect.poll(() => blocked.some(b => b.why === "background-write" && b.redirect_status === 307)).toBe(true);
    expect(s.posts).toEqual(["/redirect-read"]); // the first hop only; /elsewhere never receives the body
  } finally { await ctx.close(); }
});
test("a read-only admin walk needs a recorded permission and masking; transact still needs a seeded test copy", () => {
  const j = (mode: string) => Journey.parse({ id: "j", walker: "w", audience: "admin", goal: "g", start_url: "https://a.test/", arrival: "direct", success: ["s"], step_budget: 5, mode });
  const run = (extra = {}) => RunConfig.parse({ id: "r", out_dir: "o", environment: { name: "staging", kind: "live" }, ...extra });
  const permit = { admin_read_only: { authorized_by: "Owner", authorized_on: "2026-10-23", quote: "walk the admin pages" } };
  expect(adminAllowed(run(), j("read-only")).ok).toBe(false);
  expect(adminAllowed(run(permit), j("read-only")).ok).toBe(true);
  expect(adminAllowed(run({ ...permit, mask_personal_data: false }), j("read-only")).ok).toBe(false);
  expect(adminAllowed(run(permit), j("transact")).ok).toBe(false);
  expect(() => run({ admin_read_only: { authorized_by: "Owner", authorized_on: "yesterday", quote: "x" } })).toThrow();
});
test("names the run hides are masked in text, in URLs and on the page for the screenshot", async () => {
  const { setMaskNames, maskText, maskString, maskPage } = await import("../src/browser/mask.js");
  try {
    setMaskNames(["Acme Trust", "Jo Bloggs", ""]);
    expect(maskText("Welcome to Acme Trust, from Jo  Bloggs")).toBe("Welcome to [name], from [name]");
    expect(maskString("https://staging.acmetrust.org/en/acme-trust?x=jo%20bloggs")).toBe("https://staging.[name].org/en/[name]?x=[name]");
    expect(maskText("Acmes trusted")).toBe("Acmes trusted");
    const ctx = await browser.newContext(); const p = await ctx.newPage();
    await p.setContent("<p id='a'>About ACME TRUST</p>");
    const restore = await maskPage(p); expect(await p.textContent("#a")).toBe("About [name]");
    await restore(); expect(await p.textContent("#a")).toBe("About ACME TRUST");
    await ctx.close();
  } finally { setMaskNames([]); }
});
test("the walk browser takes the box's proxy from the environment, so the server's own fetches go through it too", async () => {
  const { proxyFromEnv } = await import("../src/walk/session.js");
  expect(proxyFromEnv({})).toBeUndefined();
  expect(proxyFromEnv({ HTTPS_PROXY: "http://proxy:8888", NO_PROXY: "localhost,127.0.0.1" })).toEqual({ server: "http://proxy:8888", bypass: "localhost,127.0.0.1" });
  expect(proxyFromEnv({ http_proxy: "http://p:1" })).toEqual({ server: "http://p:1" });
});
