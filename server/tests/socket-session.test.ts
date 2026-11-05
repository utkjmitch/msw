import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles } from "./helpers/walkfiles.js";
/** Report D-2 in a whole walk: a read-only journey's sockets to the site, with and without socket_channels. */
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); s.sockets.length = 0; });
const setup = (url: string, o = {}) => { const f = walkFiles(url, o); dirs.push(f.dir); return f; };
const events = (dir: string) => readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));

test("a journey with no socket line: the page's socket is refused, the Walker sees the page's own failure and is told why", async () => {
  const f = setup(s.url + "live.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" }) as LookResult;
    expect(r0.text).toContain("Live scores are offline");
    expect(r0.notes.join(" ")).toContain("live connection to the site was refused");
    expect(s.sockets).toEqual([]);
    const q = await w.quit("done");
    expect(q.alive).toBe(true); expect(q.failures).toEqual([]);
    const blocked = events(q.dir).filter(e => e.kind === "blocked");
    expect(blocked).toEqual([expect.objectContaining({ data: expect.objectContaining({ why: "socket-refused", method: "WEBSOCKET", url: s.url.replace("http", "ws") + "live" }) })]);
    expect(blocked[0].state).toEqual(expect.any(String)); // placed on the page the Walker looked at
    // Recorded as a blocked event, never as a finding about the site.
    expect(readFileSync(join(q.dir, "findings.jsonl"), "utf8")).not.toMatch(/socket|offline/i);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a named socket channel: the page gets its live data, and the open and the page's frame are signed events", async () => {
  const origin = s.url.replace("http", "ws").replace(/\/$/, "");
  const f = setup(s.url + "live.html", { journeyExtra: `socket_channels:\n  - { origin: "${origin}", path: /live, sends: forward }\n` });
  const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" }) as LookResult;
    expect(r0.text).toContain("Live scores: 3-1");
    expect(r0.notes.join(" ")).not.toContain("live connection");
    expect(s.sockets).toEqual(["OPEN /live", "FRAME /live"]);
    const q = await w.quit("done");
    expect(q.alive).toBe(true);
    const all = events(q.dir);
    expect(all.filter(e => e.kind === "blocked")).toEqual([]);
    expect(all.find(e => e.kind === "read")).toMatchObject({ data: { channel: origin + "/live", method: "WEBSOCKET", url: origin + "/live" }, state: expect.any(String) });
    expect(all.find(e => e.kind === "socket-send")).toMatchObject({ data: { channel: origin + "/live", bytes: 16, sent: true }, state: expect.any(String) });
    const manifest = JSON.parse(readFileSync(join(q.dir, "manifest.json"), "utf8"));
    expect(manifest.inputs.socket_channels).toEqual([{ origin, path: "/live", sends: "forward" }]);
  } finally { await w.quit("done").catch(() => {}); }
});

// A whole look scrolls the page, so a socket a scroll handler opens meets the socket rules the same as one opened by a tap.
test("a whole look that sets off a socket to the site: refused with no socket line, and still costs nothing", async () => {
  const f = setup(s.url + "scroll-live.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" }) as LookResult;
    expect(r0.notes.join(" ")).not.toContain("live connection");
    const whole = await w.look({ whole: "page" });
    expect(whole.whole!.tiles.length).toBeGreaterThan(1);
    await expect.poll(() => events(join(f.run.out_dir, "walks", "tester-learn-desktop-en-US")).some(e => e.kind === "blocked")).toBe(true);
    const after = await w.look();
    expect([...whole.notes, ...after.notes].join(" ")).toContain("live connection to the site was refused");
    expect(after.stepsLeft).toBe(r0.stepsLeft); expect(after.patienceLeft).toBe(r0.patienceLeft);
    expect(s.sockets).toEqual([]);
    const q = await w.quit("done"); expect(q.verified).toBe(true);
    const blocked = events(q.dir).filter(e => e.kind === "blocked");
    expect(blocked).toEqual([expect.objectContaining({ data: expect.objectContaining({ why: "socket-refused", method: "WEBSOCKET", url: s.url.replace("http", "ws") + "scroll-live" }), state: expect.any(String) })]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a whole look that sets off a named socket: it opens, and the open and the page's frame are signed events", async () => {
  const origin = s.url.replace("http", "ws").replace(/\/$/, "");
  const f = setup(s.url + "scroll-live.html", { journeyExtra: `socket_channels:\n  - { origin: "${origin}", path: /scroll-live, sends: forward }\n` });
  const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" }) as LookResult;
    await w.look({ whole: "page" });
    await expect.poll(() => s.sockets).toEqual(["OPEN /scroll-live", "FRAME /scroll-live"]);
    const after = await w.look();
    expect(after.notes.join(" ")).not.toContain("live connection");
    expect(after.stepsLeft).toBe(r0.stepsLeft); expect(after.patienceLeft).toBe(r0.patienceLeft);
    const q = await w.quit("done"); expect(q.verified).toBe(true);
    const all = events(q.dir);
    expect(all.filter(e => e.kind === "blocked")).toEqual([]);
    expect(all.find(e => e.kind === "read")).toMatchObject({ data: { channel: origin + "/scroll-live", method: "WEBSOCKET" }, state: expect.any(String) });
    expect(all.find(e => e.kind === "socket-send")).toMatchObject({ data: { channel: origin + "/scroll-live", bytes: 16, sent: true }, state: expect.any(String) });
  } finally { await w.quit("done").catch(() => {}); }
});
