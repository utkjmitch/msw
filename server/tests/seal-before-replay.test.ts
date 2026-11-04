import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { WalkSession, type LookResult } from "../src/walk/session.js";
import { createServer } from "../src/mcp/server.js";
import type { Reproduce } from "../src/walk/replay.js";
import { serve } from "./helpers/serve.js";
import { walkFiles, R, W, n } from "./helpers/walkfiles.js";
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => { while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });
const setup = () => { const f = walkFiles(s.url); dirs.push(f.dir); return f; };
const findings = (dir: string) => readFileSync(join(dir, "findings.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
const walker = (dir: string) => findings(dir).filter(f => f.source === "walker");
const NOTE = { kind: "content" as const, severity: 2, title: "About page says nothing about the work", what_happened: "Only a heading", expected: "What they do" };
/** A walk to the About page with one Walker finding, then quit. */
async function walkAndQuit(w: WalkSession, f: ReturnType<typeof setup>) {
  const r0 = await w.start({ walker: f.walker, journey: f.journey, viewport: "desktop" });
  await w.act({ option: n(r0, "About us"), ratings: R(n(r0, "About us"), 2), wharton: W }) as LookResult;
  w.note(NOTE);
  return w.quit("done");
}

test("a quit whose replay would hang still leaves seal.json on disk within the call", async () => {
  const f = setup(); let called = 0;
  const hangs: Reproduce = () => { called += 1; return new Promise(() => {}); };
  const w = new WalkSession(f.run, true, true, hangs);
  try {
    const q = await walkAndQuit(w, f);
    // quit returned, so everything below was written inside the call; replay has not run at all.
    expect(called).toBe(0);
    expect(q.replay).toBe("pending"); expect(q.pending).toHaveLength(1);
    const seal = JSON.parse(readFileSync(join(q.dir, "seal.json"), "utf8"));
    expect(seal.verified).toBe(true); expect(seal.alive).toBe(true); expect(seal.head).toMatch(/^[0-9a-f]{64}$/);
    expect(seal.replay).toBe("pending"); expect(seal.reproduced).toEqual({ [q.pending[0]]: "pending" });
    expect(walker(q.dir).map(x => x.reproduced)).toEqual(["pending"]);
    expect(JSON.parse(readFileSync(join(q.dir, "manifest.json"), "utf8")).times.ended).not.toBeNull();
    expect(existsSync(join(q.dir, "replays.json"))).toBe(false);
    // A replay started now hangs, and the seal stays as it was.
    const before = readFileSync(join(q.dir, "seal.json"), "utf8");
    void w.replay();
    await new Promise(r => setTimeout(r, 200));
    expect(called).toBe(1);
    expect(readFileSync(join(q.dir, "seal.json"), "utf8")).toBe(before);
    await expect(w.replay()).rejects.toThrow("already running");
  } finally { await w.quit("done").catch(() => {}); }
});

test("replay afterwards updates reproduced, writes replays.json and never rewrites the seal", async () => {
  const f = setup(); const seen: string[] = [];
  const fake: Reproduce = async (_run, _args, _acts, _target, dir) => { seen.push(dir); return { reproduced: true }; };
  const w = new WalkSession(f.run, true, true, fake);
  try {
    await expect(w.replay()).rejects.toThrow("quit the walk first");
    const q = await walkAndQuit(w, f);
    const sealBefore = readFileSync(join(q.dir, "seal.json"), "utf8");
    await expect(w.replay("no-such-finding")).rejects.toThrow("no finding no-such-finding");
    const r = await w.replay();
    expect(r.replayed.map(x => [x.finding, x.reproduced])).toEqual([[q.pending[0], true]]);
    expect(r.pending).toEqual([]);
    expect(seen).toEqual([join(q.dir, "replays", q.pending[0])]);
    expect(walker(q.dir).map(x => x.reproduced)).toEqual([true]);
    const replays = JSON.parse(readFileSync(join(q.dir, "replays.json"), "utf8"));
    expect(replays.sealed_head).toBe(JSON.parse(sealBefore).head);
    expect(replays.replays).toHaveLength(1); expect(replays.pending).toEqual([]);
    expect(readFileSync(join(q.dir, "seal.json"), "utf8")).toBe(sealBefore);
    // Nothing is left to replay; a second call replays nothing.
    expect((await w.replay()).replayed).toEqual([]);
  } finally { await w.quit("done").catch(() => {}); }
});

test("a replay that throws records the finding as not reproduced, with the error", async () => {
  const f = setup();
  const w = new WalkSession(f.run, true, true, async () => { throw new Error("browser gone"); });
  try {
    const q = await walkAndQuit(w, f);
    const r = await w.replay();
    expect(r.replayed[0]).toMatchObject({ reproduced: false, error: "browser gone", dir: null, head: null });
    expect(walker(q.dir).map(x => x.reproduced)).toEqual([false]);
  } finally { await w.quit("done").catch(() => {}); }
});

test("a walk with replay off is complete and sealed, and reads not-replayed as a plain state", async () => {
  const f = setup(); const w = new WalkSession(f.run, true, false);
  try {
    const q = await walkAndQuit(w, f);
    expect(q.replay).toBe("off"); expect(q.pending).toEqual([]);
    expect(q.verified).toBe(true); expect(q.alive).toBe(true); expect(q.failures).toEqual([]);
    const seal = JSON.parse(readFileSync(join(q.dir, "seal.json"), "utf8"));
    expect(seal.replay).toBe("off"); expect(seal.alive).toBe(true);
    expect(Object.values(seal.reproduced)).toEqual(["not-replayed"]);
    expect(walker(q.dir).map(x => x.reproduced)).toEqual(["not-replayed"]);
    await expect(w.replay()).rejects.toThrow("replay is off");
  } finally { await w.quit("done").catch(() => {}); }
});

test("over MCP, quit seals and reports findings not replayed as a plain state; replay is a separate, optional call", async () => {
  const f = setup();
  const [a, b] = InMemoryTransport.createLinkedPair();
  const server = createServer(f.run); await server.connect(a);
  const client = new Client({ name: "t", version: "0" }); await client.connect(b);
  const early = await client.callTool({ name: "replay", arguments: {} }) as any;
  expect(early.isError).toBe(true); expect(early.content[0].text).toContain("Call quit first");
  const r0 = await client.callTool({ name: "start_walk", arguments: { walker: f.walker, journey: f.journey, viewport: "desktop" } }) as any;
  const about = Number((r0.content[1].text as string).split("\n").find(l => l.endsWith("About us"))!.split(".")[0]);
  await client.callTool({ name: "act", arguments: { option: about, ratings: [{ option: about, score: 3, why: "x" }, { option: about === 1 ? 2 : 1, score: 2, why: "y" }], wharton: W } });
  await client.callTool({ name: "note", arguments: NOTE });
  const q = await client.callTool({ name: "quit", arguments: { reason: "done" } }) as any;
  const text = q.content[0].text as string;
  expect(q.isError).toBeFalsy();
  expect(text).toMatch(/The walk is sealed\./); expect(text).toMatch(/verified: true\. alive: true\./);
  expect(text).toMatch(/1 Walker finding\(s\) not replayed yet/); expect(text).toMatch(/the walk is complete either way/);
  const dir = /Walk saved in (.+?)\. Findings/.exec(text)![1];
  expect(existsSync(join(dir, "seal.json"))).toBe(true);
  const r = await client.callTool({ name: "replay", arguments: {} }) as any;
  expect(r.isError).toBeFalsy();
  expect(r.content[0].text).toMatch(/: reproduced/); expect(r.content[0].text).toContain("Nothing left to replay.");
  expect(walker(dir).map(x => x.reproduced)).toEqual([true]);
  await client.close();
}, 120_000);
