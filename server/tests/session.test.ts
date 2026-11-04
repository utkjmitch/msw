import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
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
test("two walks started at once into the same folder: one starts, the other is refused", async () => {
  const f = setup(s.url); const w1 = new WalkSession(f.run, true, false); const w2 = new WalkSession(f.run, true, false);
  try {
    const both = await Promise.allSettled([w1, w2].map(w => w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" })));
    expect(both.filter(r => r.status === "fulfilled")).toHaveLength(1);
    expect(both.find(r => r.status === "rejected")).toMatchObject({ reason: expect.objectContaining({ message: expect.stringContaining("already holds a walk") }) });
  } finally { await w1.quit("done").catch(() => {}); await w2.quit("done").catch(() => {}); }
}, 120_000);
test("a start that fails before its first event does not lock the walk folder", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  const journey = readFileSync(f.journey, "utf8");
  try {
    // A saved login that does not exist makes the browser context fail after the folder is reserved.
    writeFileSync(f.journey, journey + `storage_state: ${join(f.dir, "missing.json")}\n`);
    await expect(w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" })).rejects.toThrow();
    writeFileSync(f.journey, journey);
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect((await w.quit("done")).verified).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
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
    // Looking again at the same document is not another load.
    expect((await w.look()).patienceLeft).toBe(9);
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
test("quitting before a new page look keeps its records without a state and fails health", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await (w as unknown as { page: import("playwright").Page }).page.goto(s.url + "about.html");
    const q = await w.quit("done");
    const errors = readEvents(q.dir).filter(e => e.kind === "instrument" && e.data.type === "console");
    expect(errors.length).toBeGreaterThan(0); expect(errors.every(e => e.state === undefined)).toBe(true);
    expect(q.alive).toBe(false);
    expect(q.failures.some(x => x.includes("no observed page state"))).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a blocked background write is logged but the Walker is not told it left the site", async () => {
  const f = setup(s.url + "links.html"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "News"), ratings: R(n(r0, "News"), n(r0, "About us")), wharton: W }) as LookResult;
    expect(r1.notes.join(" ")).not.toContain("leads off this site");
    const q = await w.quit("done");
    expect(readEvents(q.dir).find(e => e.kind === "blocked")?.data.why).toBe("background-write");
  } finally { await w.quit("done").catch(() => {}); }
});
test("values typed into payment fields are masked in events, even with personal-data masking off", async () => {
  const f = setup(s.url + "pay.html"); f.run.mask_personal_data = false; const w = new WalkSession(f.run, true, false);
  try {
    let r = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    for (const [field, value] of [["Expiry", "12/34"], ["Security code", "123"], ["Card number", "4242424242424242"]]) {
      r = await w.act({ option: n(r, field), text: value, ratings: R(n(r, field), n(r, "Pay")), wharton: W }) as LookResult;
    }
    const q = await w.quit("done");
    const typed = readEvents(q.dir).filter(e => e.kind === "act").map(e => e.data.text);
    expect(typed).toEqual(["[masked]", "[masked]", "[masked]"]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("admin journeys run only in transact mode on a seeded test copy", async () => {
  const readOnly = setup(s.url, { role: "admin", audience: "admin" });
  await expect(new WalkSession(readOnly.run).start({ walker: readOnly.walker, journey: readOnly.journey, viewport: "desktop" }))
    .rejects.toThrow("admin journeys run only in transact mode");
  const unseeded = setup(s.url, { role: "admin", audience: "admin", mode: "transact" });
  unseeded.run.allowed_for_transact = [s.url];
  await expect(new WalkSession(unseeded.run).start({ walker: unseeded.walker, journey: unseeded.journey, viewport: "desktop" }))
    .rejects.toThrow("admin journeys need a test environment with seeded data");
});
test("a transact walk types card details only in payment test mode", async () => {
  for (const testMode of [false, true]) {
    const f = setup(s.url + "pay.html", { mode: "transact" }); f.run.allowed_for_transact = [s.url]; f.run.payment_test_mode = testMode;
    const w = new WalkSession(f.run, true, false);
    try {
      const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
      const r = await w.act({ option: n(r0, "Card number"), text: "4242424242424242", ratings: R(n(r0, "Card number"), n(r0, "Pay")), wharton: W });
      if (testMode) expect(r).not.toHaveProperty("refused");
      else expect(r).toEqual({ refused: "this run is not in payment test mode, so Walkers do not type card details" });
      await w.quit("done");
    } finally { await w.quit("done").catch(() => {}); }
  }
});
test("personal data is masked in addresses, instrument text and finding text", async () => {
  const f = setup(s.url + "contact.html?from=pat%40example.org"); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(r0.url).not.toContain("example.org");
    w.note({ kind: "content", severity: 1, title: "Shows pat@example.org", what_happened: "Saw pat@example.org on the page", expected: "No address for pat@example.org" });
    const q = await w.quit("run-away", "it showed pat@example.org");
    for (const file of ["events.jsonl", "instrument.jsonl", "findings.jsonl"]) {
      const text = readFileSync(join(q.dir, file), "utf8");
      expect(text).not.toMatch(/pat(@|%40)example\.org/);
    }
    expect(readFileSync(join(q.dir, "instrument.jsonl"), "utf8")).toContain("[masked]");
  } finally { await w.quit("done").catch(() => {}); }
});
test("each walk writes a manifest of its inputs, versions and times", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const dir = w["dir"] as string;
    const started = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
    expect(started).toMatchObject({
      run: { id: "t", environment: { name: "fixture", kind: "test" }, mask_personal_data: true },
      inputs: { walker: { path: f.walker, sha256: sha(f.walker) }, journey: { path: f.journey, sha256: sha(f.journey) }, viewport: "desktop", locale: "en-US" },
      versions: { playwright: "1.63.0", node: process.version },
      times: { ended: null },
    });
    expect(started.versions.chromium).toMatch(/^\d+\./); expect(started.versions.msw_server).toMatch(/^\d+\.\d+\.\d+/);
    expect(Date.parse(started.times.started)).not.toBeNaN();
    await w.quit("done");
    const ended = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    expect(Date.parse(ended.times.ended)).toBeGreaterThanOrEqual(Date.parse(ended.times.started));
    expect(ended.outcome).toEqual({ reason: "done", ended: null });
  } finally { await w.quit("done").catch(() => {}); }
});
test("a blocked submit records the form's visible fields with masked values", async () => {
  const f = setup(s.url + "pay.html"); const w = new WalkSession(f.run, true, false);
  try {
    let r = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    r = await w.act({ option: n(r, "Card number"), text: "4242424242424242", ratings: R(n(r, "Card number"), n(r, "Pay")), wharton: W }) as LookResult;
    r = await w.act({ option: n(r, "Pay"), ratings: R(n(r, "Pay"), n(r, "Expiry")), wharton: W }) as LookResult;
    expect(r.notes.join(" ")).toContain("read-only");
    const q = await w.quit("done");
    const blocked = readEvents(q.dir).find(e => e.kind === "blocked");
    expect(blocked.data).toMatchObject({ why: "would-submit", fields: [
      { label: "Card number", type: "text", value: "[masked]" },
      { label: "Expiry", type: "text", value: "" },
      { label: "Security code", type: "text", value: "" },
    ] });
  } finally { await w.quit("done").catch(() => {}); }
}, 90_000);
test("running away sets severity 3 at the final step, and the seal records the outcome", async () => {
  const f = setup(s.url, { patience: 2 }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const no = { will_try: false, notices: false, associates: true, sees_progress: true };
    await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 2), wharton: no });
    w.note({ kind: "content", severity: 1, title: "Nothing about the work", what_happened: "Only a heading", expected: "What they do" });
    const q = await w.quit("run-away", "patience");
    const found = readFileSync(join(q.dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(x => x.source === "walker");
    expect(found.map(x => x.severity)).toEqual([3]);
    expect(JSON.parse(readFileSync(join(q.dir, "seal.json"), "utf8"))).toMatchObject({ outcome: "run-away", ended: "run-away: patience" });
  } finally { await w.quit("done").catch(() => {}); }
}, 90_000);
test("running away with no note adds a severity 3 finding", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const q = await w.quit("run-away", "asked to make an account");
    const found = readFileSync(join(q.dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(x => x.source === "walker");
    expect(found).toEqual([expect.objectContaining({ severity: 3, kind: "usability", title: "Ran away before finishing: asked to make an account" })]);
    expect(q.alive).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
});
test("on a phone, a note that blocks a step is at least severity 3", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "phone" });
    w.note({ kind: "usability", severity: 1, title: "Donate is under the menu", what_happened: "Cannot reach it", expected: "A visible button", blocks_step: true });
    w.note({ kind: "usability", severity: 1, title: "Small text", what_happened: "Hard to read", expected: "Bigger text" });
    const q = await w.quit("done");
    const found = readFileSync(join(q.dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(x => x.source === "walker");
    expect(found.map(x => x.severity)).toEqual([3, 1]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("wait never costs no-change patience", async () => {
  const f = setup(s.url, { moves: ["wait"] }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(r0.patienceLeft).toBe(10);
    const r1 = await w.act({ option: n(r0, "wait"), text: "5", ratings: R(n(r0, "wait"), n(r0, "About us")), wharton: W }) as LookResult;
    expect(r1).toMatchObject({ patienceLeft: 10, stepsLeft: 9 });
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
});
test("slow-3g applies to a page opened in a new tab, not only the first page", async () => {
  const f = setup(s.url, { moves: ["switch-tab"], conditions: "{ network: slow-3g }" }); const w = new WalkSession(f.run, true, false);
  const fetchMs = () => (w as unknown as { page: import("playwright").Page }).page.evaluate(async () => {
    const t = performance.now(); await fetch(`/guide.html?${Math.random()}`, { cache: "no-store" }); return performance.now() - t; });
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(await fetchMs()).toBeGreaterThanOrEqual(350);
    const r1 = await w.act({ option: n(r0, "Open the guide"), ratings: R(n(r0, "Open the guide"), 1), wharton: W }) as LookResult;
    expect(r1.url).toContain("guide.html");
    expect(await fetchMs()).toBeGreaterThanOrEqual(350);
    await w.quit("done");
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
test("a page that slow-3g could not be applied to is recorded and fails run health", async () => {
  const f = setup(s.url, { moves: ["switch-tab"], conditions: "{ network: slow-3g }" }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    (w as unknown as { context: import("playwright").BrowserContext }).context.newCDPSession = async () => { throw new Error("no CDP session for this page"); };
    await w.act({ option: n(r0, "Open the guide"), ratings: R(n(r0, "Open the guide"), 1), wharton: W });
    const q = await w.quit("done");
    expect(readEvents(q.dir).filter(e => e.kind === "condition" && e.data.name === "network-not-emulated")).toHaveLength(1);
    expect(q.alive).toBe(false);
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
test("the offline-restore timer cannot fire after the walk ends", async () => {
  const f = setup(s.url, { moves: ["wait"], conditions: "{ network: { offline_at_step: 1, seconds: 15 } }" }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const went = Date.now();
    await w.act({ option: n(r0, "wait"), text: "1", ratings: R(n(r0, "wait"), n(r0, "About us")), wharton: W });
    const ctx = (w as unknown as { context: import("playwright").BrowserContext }).context;
    const calls: boolean[] = []; const real = ctx.setOffline.bind(ctx);
    ctx.setOffline = (v: boolean) => { calls.push(v); return real(v); };
    await w.quit("done");
    expect(Date.now() - went).toBeLessThan(15_000);
    await new Promise(r => setTimeout(r, Math.max(0, 16_000 - (Date.now() - went))));
    expect(calls).toEqual([]);
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
test("an offline restore cannot run after the walk runs out of steps, before quit", async () => {
  const f = setup(s.url, { moves: ["wait"], budget: 1, conditions: "{ network: { offline_at_step: 1, seconds: 5 } }" }); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const ctx = (w as unknown as { context: import("playwright").BrowserContext }).context;
    const calls: boolean[] = []; const real = ctx.setOffline.bind(ctx);
    ctx.setOffline = (v: boolean) => { calls.push(v); return real(v); };
    const went = Date.now();
    const r1 = await w.act({ option: n(r0, "wait"), text: "1", ratings: R(n(r0, "wait"), n(r0, "About us")), wharton: W });
    expect("ended" in r1 && r1.ended).toBe("out of steps");
    // Wait well past the 5-second restore, so a late timer callback would still be seen.
    await new Promise(r => setTimeout(r, Math.max(0, 8_000 - (Date.now() - went))));
    expect(calls).toEqual([true]);
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
test("a run-away quit that cannot write still closes the browser and frees the session", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    // Losing the walk folder makes every write in quit fail, including the run-away floor's finding.
    rmSync(join(f.run.out_dir, "walks"), { recursive: true, force: true });
    await expect(w.quit("run-away", "too slow")).rejects.toThrow();
    expect((w as unknown as { browser?: unknown }).browser).toBeUndefined();
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect((await w.quit("done")).verified).toBe(true);
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
test("payment fields known only by name or data-payment are masked when typed and when a submit is blocked", async () => {
  const f = setup(s.url); f.run.mask_personal_data = false; const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w["page"]!.setContent('<form method="post" action="/pay"><label>CVV<input name="cvv"></label><label>Long number<input name="cardNumber"></label>'
      + '<label>Code<input data-payment></label><button type="submit">Pay</button></form>');
    let r = await w.look();
    for (const [field, value] of [["CVV", "815"], ["Long number", "4242424242424242"], ["Code", "917"]]) {
      r = await w.act({ option: n(r, field), text: value, ratings: R(n(r, field), n(r, "Pay")), wharton: W }) as LookResult;
    }
    await w.act({ option: n(r, "Pay"), ratings: R(n(r, "Pay"), n(r, "CVV")), wharton: W });
    const q = await w.quit("done"); const events = readEvents(q.dir);
    expect(events.filter(e => e.kind === "act" && e.data.text !== undefined).map(e => e.data.text)).toEqual(["[masked]", "[masked]", "[masked]"]);
    expect(events.find(e => e.kind === "blocked").data.fields.map((x: { value: string }) => x.value)).toEqual(["[masked]", "[masked]", "[masked]"]);
  } finally { await w.quit("done").catch(() => {}); }
}, 90_000);
test("an admin journey on seeded data that is not a test copy is refused", async () => {
  const f = setup(s.url, { role: "admin", audience: "admin", mode: "transact" });
  f.run.allowed_for_transact = [s.url]; f.run.environment.seeded_data = true;
  await expect(new WalkSession(f.run).start({ walker: f.walker, journey: f.journey, viewport: "desktop" }))
    .rejects.toThrow("environment.test_copy: true");
});
test("a blocked submit sent by a script says its fields were not captured", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w["page"]!.setContent('<form method="post" action="/send"><label>Topic<input name="topic"></label></form>'
      + '<button type="button" onclick="document.forms[0].submit()">Send</button>');
    const r = await w.look();
    const after = await w.act({ option: n(r, "Send"), ratings: R(n(r, "Send"), n(r, "Topic")), wharton: W }) as LookResult;
    expect(after.notes.join(" ")).toContain("read-only");
    const q = await w.quit("done"); const blocked = readEvents(q.dir).find(e => e.kind === "blocked");
    expect(blocked.data.why).toBe("would-submit"); expect(blocked.data.fields).toBeUndefined();
    expect(blocked.data.fields_error).toContain("not captured");
  } finally { await w.quit("done").catch(() => {}); }
}, 90_000);
test("the signed note record says when a note blocks a step", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "phone" });
    w.note({ kind: "usability", severity: 1, title: "Donate is under the menu", what_happened: "Cannot reach it", expected: "A visible button", blocks_step: true });
    w.note({ kind: "usability", severity: 1, title: "Small text", what_happened: "Hard to read", expected: "Bigger text" });
    const q = await w.quit("done");
    expect(readEvents(q.dir).filter(e => e.kind === "note").map(e => e.data.blocks_step)).toEqual([true, undefined]);
  } finally { await w.quit("done").catch(() => {}); }
});
