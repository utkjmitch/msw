import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { serve } from "./helpers/serve.js";
import { walkFiles } from "./helpers/walkfiles.js";
/** A page the browser only passes through (a client-side redirect) is never looked at; its records belong to where it led. */
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

test("records from a page passed through on a redirect are placed on the page it led to, and the look names the hop", async () => {
  const f = walkFiles(s.url + "hop.html"); dirs.push(f.dir); const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" }) as LookResult;
    expect(r0.url).toBe(s.url + "blank.html");
    const q = await w.quit("done");
    expect(q.failures).toEqual([]); expect(q.alive).toBe(true);
    const all = readFileSync(join(q.dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
    const look = all.find(e => e.kind === "look");
    expect(look.data.via).toEqual([s.url + "hop.html"]);
    const hop = all.find(e => e.kind === "instrument" && e.data.type === "console" && String(e.data.detail.text).includes("hop: data refused"));
    expect(hop.state).toBe(look.state);
  } finally { await w.quit("done").catch(() => {}); }
});
