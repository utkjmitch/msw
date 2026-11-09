import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
/** A tapped <select> opens the browser's own list, which a screenshot never shows. The Walker is told what the list holds. */
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

for (const viewport of ["phone", "desktop"] as const) test(`tapping a select with no text names its choices and how to pick one (${viewport})`, async () => {
  const f = walkFiles(s.url + "combobox.html"); dirs.push(f.dir); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport }) as LookResult;
    const k = n(r0, "[combobox] Team size");
    const r1 = await w.act({ option: k, ratings: R(k, 1), wharton: W }) as LookResult;
    expect(r1.notes.join(" ")).toContain('The list "Team size" opened with these choices: Small (chosen), Large.');
    expect(r1.notes.join(" ")).toContain("act on it again with the text of the choice");
    const r2 = await w.act({ option: k, text: "Large", ratings: R(k, 1), wharton: W }) as LookResult;
    expect(r2.notes.join(" ")).not.toContain("opened with these choices");
  } finally { await w.quit("done").catch(() => {}); }
});
