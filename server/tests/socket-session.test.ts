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
