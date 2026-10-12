import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });
const setup = (url: string, o = {}) => { const f = walkFiles(url, o); dirs.push(f.dir); return f; };

test("a short walk: refuse without ratings, act, quit sealed and alive", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "phone" });
    expect(r0.options.some(l => l.endsWith("[unlabeled button]"))).toBe(true);
    const refused = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us")), wharton: W });
    expect(refused).toEqual({ refused: "rate at least 2 options" });
    const r1 = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 2), wharton: W }) as LookResult;
    expect(r1.text).toContain("About"); expect(r1.stepsLeft).toBe(9);
    const q = await w.quit("done");
    expect(q.verified).toBe(true); expect(q.alive).toBe(true);
    expect(existsSync(join(q.dir, "seal.json"))).toBe(true);
    const findings = readFileSync(join(q.dir, "findings.jsonl"), "utf8");
    expect(findings).toContain("Console error"); expect(findings).toContain("Accessibility");
  } finally { await w.quit("done").catch(() => {}); }
});
test("read-only: the donation is not sent and the Walker is told", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "Your name"), text: "Pat Example", ratings: R(n(r0, "Your name"), 1), wharton: W }) as LookResult;
    const r2 = await w.act({ option: n(r1, "Donate"), ratings: R(n(r1, "Donate"), 1), wharton: W }) as LookResult;
    expect(s.posts).toEqual([]); expect(r2.notes.join(" ")).toContain("read-only");
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
test("passwords are refused and cost nothing", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r = await w.act({ option: n(r0, "Password"), text: "x", ratings: R(n(r0, "Password"), 1), wharton: W });
    expect(r).toEqual({ refused: "Walkers never type passwords; this journey needs a saved login" });
    expect((await w.look()).stepsLeft).toBe(10);
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
test("a new tab is followed, and switch tab returns", async () => {
  const f = setup(s.url, { moves: ["switch-tab"] }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "Open the guide"), ratings: R(n(r0, "Open the guide"), 1), wharton: W }) as LookResult;
    expect(r1.url).toContain("guide.html"); expect(r1.options.some(l => l.endsWith("switch tab"))).toBe(true);
    const r2 = await w.act({ option: n(r1, "switch tab"), ratings: R(n(r1, "switch tab"), 1), wharton: W }) as LookResult;
    expect(r2.url).not.toContain("guide.html");
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
test("an element that vanished after the look is refused without spending a step", async () => {
  const f = setup(s.url + "spa.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    // Simulate a site update outside the Walker: do not spend a walk step.
    await w["page"]!.getByRole("button", { name: "Remove vanishing", exact: true }).click();
    await w["page"]!.locator("#gone").waitFor({ state: "detached" });
    const r = await w.act({ option: n(r0, "Vanishing"), ratings: R(n(r0, "Vanishing"), 1), wharton: W });
    expect(r).toEqual({ refused: "the page changed; look again" });
    expect((await w.look()).stepsLeft).toBe(10);
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
test("patience runs out on Wharton noes and the walk ends", async () => {
  const f = setup(s.url, { patience: 2 }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const no = { will_try: false, notices: false, associates: true, sees_progress: true };
    const r1 = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 2), wharton: no }) as LookResult;
    expect(r1.ended).toBe("run-away: patience");
    expect(await w.act({ option: 1, ratings: R(1, 2), wharton: W })).toEqual({ refused: "the walk has ended (run-away: patience)" });
    await w.quit("run-away", "patience");
  } finally { await w.quit("done").catch(() => {}); }
});
test("a visitor cannot walk an admin journey", async () => {
  const f = setup(s.url, { audience: "admin" }); const w = new WalkSession(f.run, true, false);
  try {
    await expect(w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" })).rejects.toThrow("a visitor cannot walk a admin journey");
  } finally { await w.quit("done").catch(() => {}); }
});
test("a second walk into a folder that already holds events is refused, and the old evidence is untouched", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  let dir = "";
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    dir = (await w.quit("done")).dir;
    const before = readFileSync(join(dir, "events.jsonl"), "utf8");
    const again = new WalkSession(f.run, true, false);
    await expect(again.start({ walker: f.walker, journey: f.journey, viewport: "desktop" })).rejects.toThrow(dir);
    expect(readFileSync(join(dir, "events.jsonl"), "utf8")).toBe(before);
    await expect(again.quit("done")).rejects.toThrow("no walk in progress");
  } finally { await w.quit("done").catch(() => {}); }
});
test("a fast page that keeps polling costs no patience", async () => {
  const f = setup(s.url + "poll.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(r0.patienceLeft).toBe(10);
    const r1 = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), n(r0, "scroll down")), wharton: W }) as LookResult;
    expect(r1).toMatchObject({ patienceLeft: 10 });
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
test("a page whose load event takes over 3 seconds costs one patience", async () => {
  const f = setup(s.url + "slow.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(r0.patienceLeft).toBe(9);
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
const readEvents = (dir: string) => readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const lookStates = (events: any[], page: string) => new Set(events.filter(e => e.kind === "look" && e.data.url.endsWith(page)).map(e => e.state));
test("instrument and blocked records carry the state of the page they came from", async () => {
  const f = setup(s.url + "links.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), n(r0, "News")), wharton: W }) as LookResult;
    await w.act({ option: n(r1, "back"), ratings: R(n(r1, "back"), n(r1, "scroll down")), wharton: W });
    const r3 = await w.look();
    await w.act({ option: n(r3, "News"), ratings: R(n(r3, "News"), n(r3, "About us")), wharton: W });
    const q = await w.quit("done");
    const events = readEvents(q.dir);
    const about = lookStates(events, "about.html"); const news = lookStates(events, "beacon.html");
    const consoleErr = events.find(e => e.kind === "instrument" && e.data.type === "console");
    expect(about.has(consoleErr.state)).toBe(true);
    const missing = events.find(e => e.kind === "instrument" && e.data.type === "http" && e.data.detail.status === 404);
    expect(about.has(missing.state)).toBe(true);
    const beacon = events.find(e => e.kind === "blocked" && e.data.url.endsWith("/beacon"));
    expect(news.has(beacon.state)).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
});
