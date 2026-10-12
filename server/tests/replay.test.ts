import { test, expect, beforeAll, afterAll } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>;
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });

test("a walker finding is reproduced by replay", async () => {
  const f = walkFiles(s.url); const w = new WalkSession(f.run);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 2), wharton: W }) as LookResult;
    w.note({ kind: "content", severity: 2, title: "About page says nothing about the work", what_happened: "Only a heading", expected: "What they do" });
    const q = await w.quit("done");
    const found = readFileSync(join(q.dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
    expect(found.find(x => x.source === "walker").reproduced).toBe(true);
  } finally {
    await w.quit("done").catch(() => {});
    rmSync(f.dir, { recursive: true, force: true });
  }
});
test("replay tells masked names apart and refuses an ambiguous match", async () => {
  const f = walkFiles(s.url + "twins.html"); const w = new WalkSession(f.run);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const masked = r0.options.filter(l => l.endsWith("[masked]")).map(l => Number(l.split(".")[0]));
    expect(masked).toHaveLength(2);
    const r1 = await w.act({ option: masked[1], ratings: R(masked[1], masked[0]), wharton: W }) as LookResult;
    expect(r1.text).toContain("Sam chosen");
    w.note({ kind: "usability", severity: 1, title: "Buttons named by email", what_happened: "Two buttons read as addresses", expected: "Plain names" });
    const ambiguous = await w.replayAct({ label: "Same", key: "Same", role: "button", how: "tap", event: 0 });
    expect(ambiguous).toBe(false);
    const q = await w.quit("done");
    const found = readFileSync(join(q.dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
    expect(found.find(x => x.source === "walker").reproduced).toBe(true);
  } finally {
    await w.quit("done").catch(() => {});
    rmSync(f.dir, { recursive: true, force: true });
  }
}, 120_000);
