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
  expect(lines.slice(-5).map(l => l.replace(/^\d+\. /, ""))).toEqual(["scroll down", "scroll up", "scroll right", "scroll left", "back"]);
  expect(r.text).toContain("[masked]"); expect(r.text).not.toContain("example.org");
  expect(r.png.length).toBeGreaterThan(1000);
  expect((await perceive(p, { mask: true, moves: [], tabCount: 1 })).state).toBe(r.state);
  await p.close();
});
test("a page with nothing visible still offers the fixed moves", async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); await p.goto(s.url + "blank.html");
  const r = await perceive(p, { mask: false, moves: ["reload"], tabCount: 1 });
  expect(r.options.map(o => o.name)).toEqual(["scroll down", "scroll up", "scroll right", "scroll left", "back", "reload"]);
  await p.close();
});
test("a typed value changes the fields digest, never the state; a password value changes neither", async () => {
  const p = await browser.newPage({ viewport: { width: 1280, height: 800 } }); await p.goto(s.url);
  const look = () => perceive(p, { mask: true, moves: [], tabCount: 1 });
  const r0 = await look();
  await p.fill("#pw", "Quixotic Zebrafish 4711"); const r1 = await look();
  expect([r1.state, r1.fields]).toEqual([r0.state, r0.fields]);
  await p.fill("#nm", "Quixotic Zebrafish 4711"); const r2 = await look();
  expect(r2.state).toBe(r0.state); expect(r2.fields).not.toBe(r0.fields);
  expect(JSON.stringify({ ...r2, png: undefined })).not.toContain("Quixotic");
  await p.close();
});
test("a field cut off by the box that holds it is not seen, so its value is not part of the fields digest", async () => {
  const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await p.setContent(`<div style="width: 300px; overflow: auto"><div style="width: 1500px"><input id="near" aria-label="Near"><input id="far" aria-label="Far" style="margin-left: 900px"></div></div>`);
  const look = () => perceive(p, { mask: false, moves: [], tabCount: 1 });
  const r0 = await look();
  // Set by a script: fill would scroll the field into view first.
  await p.$eval("#far", el => { (el as HTMLInputElement).value = "out of sight"; }); const r1 = await look();
  expect(r1.fields).toBe(r0.fields);
  await p.$eval("#near", el => { (el as HTMLInputElement).value = "in sight"; }); const r2 = await look();
  expect(r2.fields).not.toBe(r0.fields);
  await p.close();
});
