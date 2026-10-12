import { test, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { serve } from "./helpers/serve.js";
import { walkFiles } from "./helpers/walkfiles.js";

// Make the first `failures` axe runs throw, then use the real one.
const control = vi.hoisted(() => ({ failures: 0, calls: 0 }));
vi.mock("../src/instrument/inquisition.js", async importOriginal => {
  const real = await importOriginal<typeof import("../src/instrument/inquisition.js")>();
  return { ...real, inspectPage: async (...a: Parameters<typeof real.inspectPage>) => {
    control.calls += 1;
    if (control.calls <= control.failures) throw new Error("axe broke");
    return real.inspectPage(...a);
  } };
});
const { WalkSession } = await import("../src/walk/session.js");

let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

const walk = async (failures: number) => {
  control.failures = failures; control.calls = 0;
  const f = walkFiles(s.url + "about.html"); dirs.push(f.dir); const w = new WalkSession(f.run, true, false);
  try {
    await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const q = await w.quit("done");
    return readFileSync(join(q.dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
  } finally { await w.quit("done").catch(() => {}); }
};

test("a failed axe run is recorded and retried once", async () => {
  const events = await walk(1);
  const state = events.find(e => e.kind === "look").state;
  const inst = events.filter(e => e.kind === "instrument" && e.state === state).map(e => e.data);
  expect(inst.filter(d => d.type === "inspect-error")).toEqual([expect.objectContaining({ detail: expect.objectContaining({ error: "axe broke" }) })]);
  expect(inst.some(d => d.type === "axe")).toBe(true);
  expect(control.calls).toBe(2);
});
test("an axe run that fails twice is recorded twice and not tried again", async () => {
  const events = await walk(99);
  expect(events.filter(e => e.kind === "instrument" && e.data.type === "inspect-error")).toHaveLength(2);
  expect(control.calls).toBe(2);
});
