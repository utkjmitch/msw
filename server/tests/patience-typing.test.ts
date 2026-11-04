import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });
const setup = (url: string, o = {}) => { const f = walkFiles(url, o); dirs.push(f.dir); return f; };
const readEvents = (dir: string) => readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const seal = (dir: string) => JSON.parse(readFileSync(join(dir, "seal.json"), "utf8"));
/** Every text file a walk wrote, screenshots aside, by its path inside the walk folder. */
const textFiles = (dir: string) => (readdirSync(dir, { recursive: true, withFileTypes: true }))
  .filter(d => d.isFile() && !d.name.endsWith(".png")).map(d => join(d.parentPath, d.name)).map(p => ({ path: p.slice(dir.length + 1), body: readFileSync(p, "utf8") }));
// A value no fixture page holds and no mask rewrites, so any copy of it is a copy of what the Walker typed.
const TYPED = "Quixotic Zebrafish 4711";

test("typing into a field costs no patience", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "Your name"), text: TYPED, ratings: R(n(r0, "Your name"), 1), wharton: W }) as LookResult;
    expect(r1).toMatchObject({ patienceLeft: 10, stepsLeft: 9 });
    const q = await w.quit("done");
    expect(seal(q.dir).patience_charges).toEqual([]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("an act that changes nothing still costs a point", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    // A tap on the field, with nothing typed, changes nothing visible.
    const r1 = await w.act({ option: n(r0, "Your name"), ratings: R(n(r0, "Your name"), 1), wharton: W }) as LookResult;
    expect(r1.patienceLeft).toBe(9);
    // Typing the same value again changes nothing either.
    const r2 = await w.act({ option: n(r1, "Your name"), text: TYPED, ratings: R(n(r1, "Your name"), 1), wharton: W }) as LookResult;
    expect(r2.patienceLeft).toBe(9);
    const r3 = await w.act({ option: n(r2, "Your name"), text: TYPED, ratings: R(n(r2, "Your name"), 1), wharton: W }) as LookResult;
    expect(r3.patienceLeft).toBe(8);
    const q = await w.quit("done");
    expect(seal(q.dir).patience_charges).toEqual([{ reason: "no-change", n: 1 }, { reason: "no-change", n: 1 }]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("clearing a field back to how it was costs a point for a state already seen", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "Your name"), text: TYPED, ratings: R(n(r0, "Your name"), 1), wharton: W }) as LookResult;
    const r2 = await w.act({ option: n(r1, "Your name"), text: "", ratings: R(n(r1, "Your name"), 1), wharton: W }) as LookResult;
    expect(r2.patienceLeft).toBe(9);
    const q = await w.quit("done");
    expect(seal(q.dir).patience_charges).toEqual([{ reason: "repeat-state", n: 1 }]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a typed value reaches no record, look or result it did not reach before, and the replay still reproduces", async () => {
  const f = setup(s.url); const w = new WalkSession(f.run, true, true);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const before = w.lastState;
    const r1 = await w.act({ option: n(r0, "Your name"), text: TYPED, ratings: R(n(r0, "Your name"), 1), wharton: W }) as LookResult;
    // The page state written to the records is the same before and after typing, so nothing taken from the value is in it.
    expect(w.lastState).toBe(before);
    expect(JSON.stringify({ ...r1, png: undefined })).not.toContain(TYPED);
    w.note({ kind: "usability", severity: 2, title: "The name field gives no hint", what_happened: "No hint", expected: "A hint" });
    const q = await w.quit("done");
    const rp = await w.replay();
    expect(rp.replayed).toEqual([expect.objectContaining({ reproduced: true })]);
    // The one place the value was before this change: the act's own record, which the replay reads back.
    const files = textFiles(q.dir).filter(x => x.body.includes(TYPED));
    expect(files.map(x => x.path).sort()).toEqual(["events.jsonl", join(rp.replayed[0].dir!, "events.jsonl")].sort());
    for (const file of files) for (const line of file.body.trim().split("\n").filter(l => l.includes(TYPED))) {
      const e = JSON.parse(line); expect(e.kind).toBe("act"); expect(e.data.text).toBe(TYPED);
      expect(JSON.stringify({ ...e, data: { ...e.data, text: undefined } })).not.toContain(TYPED);
    }
    expect(readEvents(q.dir).filter(e => e.kind === "look").map(e => e.state)).toContain(before);
  } finally { await w.quit("done").catch(() => {}); }
}, 120_000);
