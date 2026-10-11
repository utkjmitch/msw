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
  const f = walkFiles(s.url);
  try {
    const w = new WalkSession(f.run);
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 2), wharton: W }) as LookResult;
    w.note({ kind: "content", severity: 2, title: "About page says nothing about the work", what_happened: "Only a heading", expected: "What they do" });
    const q = await w.quit("done");
    const found = readFileSync(join(q.dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
    expect(found.find(x => x.source === "walker").reproduced).toBe(true);
  } finally { rmSync(f.dir, { recursive: true, force: true }); }
});
