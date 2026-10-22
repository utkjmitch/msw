import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });
const setup = (url: string, o = {}) => { const f = walkFiles(url, o); dirs.push(f.dir); return f; };
const events = (dir: string) => readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));

test("a page that moved by itself: the chosen control is still there, so the server looks again and acts", async () => {
  const f = setup(s.url + "ticker.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w["page"]!.evaluate(() => (window as unknown as { tick: () => void }).tick());
    const r1 = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 1), wharton: W }) as LookResult;
    expect(r1.url).toContain("about.html");
    const q = await w.quit("done");
    const ev = events(q.dir); const act = ev.find(e => e.kind === "act");
    expect(act.data.drift_from).toBeGreaterThan(0);
    // The act follows a look the server logged, of the page as it was when the act ran.
    expect(ev.some(e => e.kind === "look" && e.seq < act.seq && e.seq > act.data.drift_from && e.state === act.state)).toBe(true);
    expect(q.verified).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a page that moved by itself: a control whose own name changed is still refused", async () => {
  const f = setup(s.url + "ticker.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w["page"]!.evaluate(() => (window as unknown as { tick: () => void }).tick());
    const r = await w.act({ option: n(r0, "Go to story one"), ratings: R(n(r0, "Go to story one"), 1), wharton: W });
    expect(r).toEqual({ refused: "the page changed; look again" });
    expect((await w.look()).stepsLeft).toBe(10);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a page that moved by itself: an act without ratings is refused before the server looks again", async () => {
  const f = setup(s.url + "ticker.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w["page"]!.evaluate(() => (window as unknown as { tick: () => void }).tick());
    const r = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us")), wharton: W });
    expect(r).toEqual({ refused: "rate at least 2 options" });
  } finally { await w.quit("done").catch(() => {}); }
});
test("a page that moved by itself: of two controls with the same name, the one in the same place is pressed", async () => {
  const f = setup(s.url + "ticker.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const twins = r0.options.filter(l => l.endsWith("About us")).map(l => Number(l.split(".")[0]));
    expect(twins.length).toBe(2);
    await w["page"]!.evaluate(() => (window as unknown as { tick: () => void }).tick());
    // The footer's "About us" goes to the contact page.
    const r1 = await w.act({ option: twins[1], ratings: R(twins[1], twins[0]), wharton: W }) as LookResult;
    expect(r1.url).toContain("contact.html");
  } finally { await w.quit("done").catch(() => {}); }
});
