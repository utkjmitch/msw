import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { perceive, optionLine } from "../src/browser/perceive.js";
import { serve } from "./helpers/serve.js";
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });

test("options in reading order, unlabeled flagged, email masked, stable state", async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); await p.goto(s.url);
  const r = await perceive(p, { mask: true, moves: [], tabCount: 1 });
  const lines = r.options.map(optionLine);
  expect(lines[0]).toBe("1. [link] About us");
  expect(lines).toContain("2. [button] [unlabeled button]");
  expect(lines.some(l => l.endsWith("[textbox] Your name"))).toBe(true);
  expect(lines.slice(-3).map(l => l.replace(/^\d+\. /, ""))).toEqual(["scroll down", "scroll up", "back"]);
  expect(r.text).toContain("[masked]"); expect(r.text).not.toContain("example.org");
  expect(r.png.length).toBeGreaterThan(1000);
  expect((await perceive(p, { mask: true, moves: [], tabCount: 1 })).state).toBe(r.state);
  await p.close();
});
test("a page with nothing visible still offers the fixed moves", async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); await p.goto(s.url + "blank.html");
  const r = await perceive(p, { mask: false, moves: ["reload"], tabCount: 1 });
  expect(r.options.map(o => o.name)).toEqual(["scroll down", "scroll up", "back", "reload"]);
  await p.close();
});
