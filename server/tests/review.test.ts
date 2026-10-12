import { test, expect } from "vitest";
import { chromium } from "playwright";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventLog } from "../src/events/log.js";
import { contextOptions } from "../src/browser/conditions.js";
import { installGuard, type Blocked } from "../src/browser/guard.js";
import { perceive, optionLine } from "../src/browser/perceive.js";
import { serve } from "./helpers/serve.js";

test("verification rejects a removed tail, an empty file, and malformed events", () => {
  const dir = mkdtempSync(join(tmpdir(), "msw-log-review-"));
  try {
    const file = join(dir, "events.jsonl"); const log = new EventLog(file);
    log.append("start", {}); log.append("look", {}, "state");
    const first = readFileSync(file, "utf8").split("\n")[0];
    for (const content of [first + "\n", "", first + "\n{broken\n"]) {
      writeFileSync(file, content);
      expect(log.verify().ok).toBe(false);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("read-only blocks mutating subrequests to an unlisted origin", async () => {
  const site = await serve(); const browser = await chromium.launch();
  try {
    const context = await browser.newContext(contextOptions("desktop", "en-US", {}));
    const blocked: Blocked[] = [];
    await installGuard(context, { mode: "read-only", origins: [site.url], onBlocked: b => blocked.push(b) });
    const page = await context.newPage(); await page.goto(site.url);
    await page.evaluate(async url => {
      await fetch(url, { method: "POST", mode: "no-cors", body: "synthetic" }).catch(() => {});
    }, site.otherOrigin + "/outside");
    expect(site.posts).toEqual([]);
    expect(blocked).toHaveLength(1);
    expect(blocked[0].method).toBe("POST");
  } finally { await browser.close(); await site.close(); }
});

test("walk contexts prevent a page from registering a service worker", async () => {
  const site = await serve(); const browser = await chromium.launch();
  try {
    const context = await browser.newContext(contextOptions("phone", "en-US", {}));
    await context.route("**/worker.js", route => route.fulfill({
      contentType: "application/javascript", body: "self.addEventListener('fetch', () => {});",
    }));
    const page = await context.newPage(); await page.goto(site.url);
    const registered = await page.evaluate(async () => !!await navigator.serviceWorker.register("/worker.js"));
    expect(registered).toBe(false);
    expect(context.serviceWorkers()).toEqual([]);
  } finally { await browser.close(); await site.close(); }
});

test("perception omits horizontal offscreen text and masks accessible names", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.setContent('<p>Visible</p><p style="position:absolute;left:5000px">Offscreen evidence</p><button aria-label="person@example.org">Contact</button>');
    const result = await perceive(page, { mask: true, moves: [], tabCount: 1 });
    expect(result.text).toContain("Visible");
    expect(result.text).not.toContain("Offscreen evidence");
    expect(result.options.map(optionLine).join("\n")).not.toContain("person@example.org");
    expect(result.options[0].name).toBe("[masked]");
  } finally { await browser.close(); }
});

test("payment screenshot masking stays on when personal-data masking is off", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<label>Payment<input autocomplete="cc-number" value="1111111111111111"></label>');
    const before = await perceive(page, { mask: false, moves: [], tabCount: 1 });
    await page.locator("input").evaluate((input: HTMLInputElement) => { input.value = "9999999999999999"; });
    const after = await perceive(page, { mask: false, moves: [], tabCount: 1 });
    expect(after.png.equals(before.png)).toBe(true);
  } finally { await browser.close(); }
});
