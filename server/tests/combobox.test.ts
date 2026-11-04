import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

test("typing into an input with role combobox fills it; a real select still takes its option", async () => {
  const f = walkFiles(s.url + "combobox.html"); dirs.push(f.dir); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    const r1 = await w.act({ option: n(r0, "Type a role"), text: "nurse", ratings: R(n(r0, "Type a role"), n(r0, "Team size")), wharton: W }) as LookResult;
    expect(r1.text).toContain("Results for nurse");
    await w.act({ option: n(r1, "Team size"), text: "Large", ratings: R(n(r1, "Team size"), n(r1, "Type a role")), wharton: W });
    expect(await w["page"]!.inputValue("#s")).toBe("Large");
  } finally { await w.quit("done").catch(() => {}); }
});

test("an ARIA listbox option is offered and can be pressed", async () => {
  const f = walkFiles(s.url + "combobox.html"); dirs.push(f.dir); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
    expect(r0.options.some(o => o.endsWith("[option] Registered Nurses"))).toBe(true);
    const r1 = await w.act({ option: n(r0, "Registered Nurses"), ratings: R(n(r0, "Registered Nurses"), n(r0, "Team size")), wharton: W }) as LookResult;
    expect(r1.url).toContain("about.html");
  } finally { await w.quit("done").catch(() => {}); }
});
