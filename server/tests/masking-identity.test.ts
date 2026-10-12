import { test, expect } from "vitest";
import { chromium } from "playwright";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { perceive } from "../src/browser/perceive.js";
import { WalkSession } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";

test("full names keep distinct identities behind masked display text, and the page is left as it was", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage(); const prefix = "A".repeat(125);
    await page.setContent(`<button>${prefix} one</button><button>${prefix} two</button><button>one@example.org</button><button>two@example.org</button>`);
    const first = await perceive(page, { mask: true, moves: [], tabCount: 1 });
    const second = await perceive(page, { mask: true, moves: [], tabCount: 1 });
    expect(first.options[0].key).not.toBe(first.options[1].key);
    expect(first.options[2].name).toBe("[masked]"); expect(first.options[3].name).toBe("[masked]");
    expect(first.options[2].key).not.toBe(first.options[3].key);
    expect(first.state).toBe(second.state);
    expect(await page.locator("button").nth(2).innerText()).toBe("one@example.org");
  } finally { await browser.close(); }
});

test("URLs, finding text, instrument text, ratings, Wharton notes and quit details are masked", async () => {
  const site = await serve(); const email = "synthetic@example.org"; const f = walkFiles(site.url + "?email=" + encodeURIComponent(email));
  const w = new WalkSession(f.run, true, false);
  try {
    const look = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(look.url).not.toContain("synthetic");
    await (w as unknown as { page: import("playwright").Page }).page.evaluate(email => console.error(email), email);
    w.note({ kind: "content", severity: 1, title: email, what_happened: email, expected: email });
    await w.act({ option: n(look, "Your name"), text: email, ratings: R(n(look, "Your name"), 1).map(r => ({ ...r, why: email })), wharton: { ...W, note: email } });
    const q = await w.quit("done", email);
    for (const file of ["events.jsonl", "findings.jsonl", "instrument.jsonl"]) expect(readFileSync(join(q.dir, file), "utf8")).not.toContain("synthetic");
  } finally { await w.quit("done").catch(() => {}); rmSync(f.dir, { recursive: true, force: true }); await site.close(); }
}, 120_000);
