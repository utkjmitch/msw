import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { Journey } from "../src/formats/schemas.js";
import { check } from "../src/formats/check.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
/** A link a person was handed (a text from a friend, a letter, an email) is opened the way a person opens it: as a move, logged. */
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });
const setup = (url: string, o = {}) => { const f = walkFiles(url, o); dirs.push(f.dir); return f; };
const events = (dir: string) => readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));

test("each link in hand is a move at every step, opens its address, and the act says which link was opened", async () => {
  const f = setup(s.url + "index.html", { journeyExtra: `links:\n  - { label: the trip link from a friend, url: "${s.url}contact.html" }\n` });
  const w = new WalkSession(f.run, true, false);
  try {
    const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "phone" }) as LookResult;
    expect(r0.options.at(-1)).toMatch(/^\d+\. open link: the trip link from a friend$/);
    const k = n(r0, "open link: the trip link from a friend");
    const r1 = await w.act({ option: k, ratings: R(k, 1), wharton: W }) as LookResult;
    expect(r1.url).toBe(s.url + "contact.html");
    // Still offered on the next page: the message is still in the person's hand.
    expect(r1.options.at(-1)).toMatch(/open link: the trip link from a friend$/);
    const q = await w.quit("done");
    expect(q.verified).toBe(true);
    expect(events(q.dir).filter(e => e.kind === "act").map(e => e.data.label)).toEqual([`${k}. open link: the trip link from a friend`]);
  } finally { await w.quit("done").catch(() => {}); }
});
test("a journey with no links offers no link move; a link needs a label and an address", () => {
  const base = { id: "j", walker: "w", audience: "public", goal: "g", start_url: "https://site.test/", arrival: "direct", success: ["s"], step_budget: 5 };
  expect(Journey.parse(base).links).toEqual([]);
  expect(Journey.safeParse({ ...base, links: [{ label: "a letter", url: "https://site.test/give" }] }).success).toBe(true);
  expect(Journey.safeParse({ ...base, links: [{ label: "", url: "https://site.test/give" }] }).success).toBe(false);
  expect(Journey.safeParse({ ...base, links: [{ label: "a letter" }] }).success).toBe(false);
});
test("check: a link on an origin the journey does not list is a problem, since the guard would stop it", async () => {
  const f = setup("https://site.test/", { journeyExtra: `links:\n  - { label: a flyer, url: "https://elsewhere.test/event" }\n  - { label: a letter, url: "https://site.test/give" }\n` });
  const p = await check(["--journey", f.journey]);
  expect(p).toEqual([expect.stringContaining("link \"a flyer\" (https://elsewhere.test/event) is on an origin not in the journey's origins")]);
  writeFileSync(f.journey, readFileSync(f.journey, "utf8").replace(/  - \{ label: a flyer.*\n/, ""));
  expect(await check(["--journey", f.journey])).toEqual([]);
});
