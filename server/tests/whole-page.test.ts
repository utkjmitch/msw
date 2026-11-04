import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "playwright";
import { perceive, optionLine } from "../src/browser/perceive.js";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });
const setup = (url: string, o = {}) => { const f = walkFiles(url, o); dirs.push(f.dir); return f; };
const events = (dir: string) => readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const lines = (dir: string, file: string) => readFileSync(join(dir, file), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l));

test("sideways moves are always offered, scroll areas are options, and text clipped by a box is not seen", async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(s.url + "wide.html");
  const r = await perceive(p, { mask: false, moves: [], tabCount: 1 });
  const names = r.options.map(optionLine).map(l => l.replace(/^\d+\. /, ""));
  expect(names.slice(-5)).toEqual(["scroll down", "scroll up", "scroll right", "scroll left", "back"]);
  expect(names).toContain("[scroll area] Timetable");
  expect(names).toContain("[scroll area] Floor plan");
  expect(r.text).toContain("Stop A"); expect(r.text).not.toContain("Stop C");
  // Inside the screen, but outside the box that holds it: a person cannot see it.
  expect(r.text).toContain("First train 05:10"); expect(r.text).not.toContain("Last train 23:40");
  expect(r.text).toContain("Entrance"); expect(r.text).not.toContain("Room 404");
  expect(names).not.toContain("[link] Timetable help");
  await p.close();
  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } }); await narrow.goto(s.url + "blank.html");
  expect((await perceive(narrow, { mask: false, moves: [], tabCount: 1 })).options.map(o => o.name)).toEqual(["scroll down", "scroll up", "scroll right", "scroll left", "back"]);
  await narrow.close();
});

test("a Walker reaches content past the right edge of the page, and inside a scroll area both ways", async () => {
  const f = setup(s.url + "wide.html", { budget: 20, patience: 20 }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "scroll right"), ratings: R(n(r0, "scroll right"), 1), wharton: W }) as LookResult;
    expect(r1.text).toContain("Stop B");
    const r2 = await w.act({ option: n(r1, "scroll right"), ratings: R(n(r1, "scroll right"), 1), wharton: W }) as LookResult;
    expect(r2.text).toContain("Stop C"); expect(r2.options.some(l => l.endsWith("[link] Far stop details"))).toBe(true);
    const r3 = await w.act({ option: n(r2, "scroll left"), ratings: R(n(r2, "scroll left"), 1), wharton: W }) as LookResult;
    expect(r3.text).not.toContain("Stop C");
    const r4 = await w.act({ option: n(r3, "scroll left"), ratings: R(n(r3, "scroll left"), 1), wharton: W }) as LookResult;
    const tt = n(r4, "[scroll area] Timetable");
    const r5 = await w.act({ option: tt, how: "scroll-right", ratings: R(tt, n(r4, "back")), wharton: W }) as LookResult;
    expect(r5.text).toContain("Last train 23:40"); expect(r5.options.some(l => l.endsWith("[link] Timetable help"))).toBe(true);
    const fp = n(r5, "[scroll area] Floor plan");
    let r: LookResult = r5;
    for (const how of ["scroll-down", "scroll-down", "scroll-down", "scroll-right", "scroll-right", "scroll-right"] as const)
      r = await w.act({ option: n(r, "[scroll area] Floor plan"), how, ratings: R(n(r, "[scroll area] Floor plan"), n(r, "back")), wharton: W }) as LookResult;
    expect(fp).toBeGreaterThan(0); expect(r.text).toContain("Room 404");
    const acts = events(join(f.run.out_dir, "walks", "tester-learn-desktop-en-US")).filter(e => e.kind === "act");
    expect(acts.find(e => e.data.how === "scroll-right")?.data.label).toMatch(/\[scroll area\] Timetable$/);
    const q = await w.quit("done"); expect(q.verified).toBe(true); expect(q.alive).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
});

test("a scroll area needs a direction, and only a scroll area takes one; refusals are free", async () => {
  const f = setup(s.url + "wide.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const tt = n(r0, "[scroll area] Timetable");
    expect(await w.act({ option: tt, ratings: R(tt, n(r0, "back")), wharton: W })).toEqual({ refused: "a scroll area takes a direction: how scroll-down, scroll-up, scroll-right or scroll-left" });
    expect(await w.act({ option: n(r0, "scroll down"), how: "scroll-right", ratings: R(n(r0, "scroll down"), tt), wharton: W })).toEqual({ refused: "only a scroll area takes a scroll direction; use the scroll moves for the page" });
    expect((await w.look()).stepsLeft).toBe(10);
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});

test("a whole look shows the page's full width in screens, costs nothing, and the next act still stands", async () => {
  const f = setup(s.url + "wide.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const whole = await w.look({ whole: "page" });
    expect(whole.whole!.tiles.length).toBe(3);
    for (const t of whole.whole!.tiles) expect(t.length).toBeGreaterThan(1000);
    expect(whole.whole!.text).toContain("Stop C"); expect(whole.text).not.toContain("Stop C");
    expect(whole.stepsLeft).toBe(r0.stepsLeft); expect(whole.patienceLeft).toBe(r0.patienceLeft);
    // The page is put back where it was, so the Walker can act on what the look showed.
    const a = await w.act({ option: n(whole, "scroll down"), ratings: R(n(whole, "scroll down"), 1), wharton: W });
    expect("refused" in a).toBe(false);
    const area = await w.look({ whole: n(await w.look(), "[scroll area] Floor plan") });
    expect(area.whole!.tiles.length).toBeGreaterThan(4); expect(area.whole!.text).toContain("Room 404");
    const q = await w.quit("done"); expect(q.alive).toBe(true); expect(q.verified).toBe(true);
    const ev = events(q.dir).filter(e => e.kind === "whole");
    expect(ev).toHaveLength(2); expect(ev[0].data).toMatchObject({ target: "page", tiles: 3 });
    expect(existsSync(join(q.dir, "screens", `${ev[0].seq}-1.png`))).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
});

test("a whole look of something that is not a scroll area says so and changes nothing", async () => {
  const f = setup(s.url + "wide.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await expect(w.look({ whole: n(r0, "scroll down") })).rejects.toThrow("is not a scroll area");
    expect((await w.look()).stepsLeft).toBe(r0.stepsLeft);
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});

test("the record says where content runs past the visible area and whether the page shows the way", async () => {
  const f = setup(s.url + "wide.html"); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const q = await w.quit("done");
    const look = events(q.dir).filter(e => e.kind === "look").at(-1);
    const over = look.data.overflow as { where: string; scrolls: boolean; past: Record<string, number>; cues: Record<string, string[]> }[];
    const page = over.find(o => o.where === "page")!;
    expect(page.past.right).toBeGreaterThan(1000); expect(page.scrolls).toBe(true);
    // Desktop walks draw scrollbars, as desktop Chrome does on Windows and Linux.
    expect(page.cues.scrollbar).toContain("right");
    const tt = over.find(o => o.where === "scroll area: Timetable")!;
    expect(tt.past.right).toBeGreaterThan(1000); expect(tt.cues.scrollbar).toContain("right");
    const fp = over.find(o => o.where === "scroll area: Floor plan")!;
    expect(fp.past.down).toBeGreaterThan(300); expect(fp.past.right).toBeGreaterThan(500);
    expect(lines(q.dir, "findings.jsonl").some(x => /nothing on screen/.test(x.title))).toBe(false);
  } finally { await w.quit("done").catch(() => {}); }
});

test("content past the edge with nothing on screen to show it becomes a navigation finding", async () => {
  const f = setup(s.url + "hidden-wide.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(r0.text).not.toContain("Secret stop");
    const q = await w.quit("done");
    const page = (events(q.dir).filter(e => e.kind === "look").at(-1).data.overflow as any[]).find(o => o.where === "page");
    expect(page.past.right).toBeGreaterThan(200);
    expect(page.cues).toEqual({ scrollbar: [], cut_off: [], control: [] });
    const nav = lines(q.dir, "findings.jsonl").filter(x => /nothing on screen/.test(x.title));
    expect(nav).toHaveLength(1);
    expect(nav[0]).toMatchObject({ kind: "usability", source: "instrument", severity: 2, title: "Content runs past the right edge of the page with nothing on screen to show it" });
  } finally { await w.quit("done").catch(() => {}); }
});

test("a walk that scrolls a scroll area still replays", async () => {
  const f = setup(s.url + "wide.html"); const w = new WalkSession(f.run, true, true);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const tt = n(r0, "[scroll area] Timetable");
    const r1 = await w.act({ option: tt, how: "scroll-right", ratings: R(tt, n(r0, "back")), wharton: W }) as LookResult;
    const r2 = await w.act({ option: n(r1, "scroll right"), ratings: R(n(r1, "scroll right"), 1), wharton: W }) as LookResult;
    expect(r2.text).toContain("Stop B");
    w.note({ kind: "usability", severity: 2, title: "The map runs off the screen", what_happened: "Stop C is off to the right", expected: "A sign there is more" });
    const q = await w.quit("done"); expect(q.pending).toHaveLength(1);
    const r = await w.replay();
    expect(r.replayed.map(x => x.reproduced)).toEqual([true]);
  } finally { await w.quit("done").catch(() => {}); }
});

test("over MCP, a whole look returns its screens and an act scrolls a scroll area", async () => {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");
  const { createServer } = await import("../src/mcp/server.js");
  const f = setup(s.url + "wide.html");
  const [a, b] = InMemoryTransport.createLinkedPair();
  const server = createServer(f.run); await server.connect(a);
  const client = new Client({ name: "t", version: "0" }); await client.connect(b);
  try {
    const opts = (r: any) => ({ options: (r.content.at(-1).text as string).split("Options:\n")[1].split("\n") });
    const r0 = await client.callTool({ name: "start_walk", arguments: { walker: f.walker, journey: f.journey, viewport: "desktop" } }) as any;
    const whole = await client.callTool({ name: "look", arguments: { whole: "page" } }) as any;
    expect(whole.content.filter((c: any) => c.type === "image")).toHaveLength(4);
    expect(whole.content.at(-1).text).toContain("Whole look of page"); expect(whole.content.at(-1).text).toContain("Stop C");
    const tt = n(opts(r0), "[scroll area] Timetable");
    const act = await client.callTool({ name: "act", arguments: { option: tt, how: "scroll-right", ratings: R(tt, n(opts(r0), "back")), wharton: W } }) as any;
    expect(act.content.at(-1).text).toContain("Last train 23:40");
    await client.callTool({ name: "quit", arguments: { reason: "done" } });
  } finally { await client.close(); }
});

test("on a phone there is no scrollbar, so the record names what is cut off at the edge, and the example wide-map walk works", async () => {
  const f = setup(s.url + "wide.html", { budget: 15, patience: 15 }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "phone" });
    expect(r0.text).not.toContain("Stop B");
    const whole = await w.look({ whole: "page" });
    expect(whole.whole!.tiles.length).toBeGreaterThan(3); expect(whole.whole!.text).toContain("Stop C");
    const q = await w.quit("done");
    const page = (events(q.dir).filter(e => e.kind === "look").at(-1).data.overflow as any[]).find(o => o.where === "page");
    expect(page.past.right).toBeGreaterThan(2000);
    expect(page.cues.scrollbar).toEqual([]); expect(page.cues.cut_off).toContain("right");
    expect(lines(q.dir, "findings.jsonl").some(x => x.title.includes("right edge of the page"))).toBe(false);
  } finally { await w.quit("done").catch(() => {}); }
});
