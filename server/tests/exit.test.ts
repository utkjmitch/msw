import { test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { serve } from "./helpers/serve.js";
import { walkFiles } from "./helpers/walkfiles.js";

// The server as an MCP client runs it: its own process, speaking JSON-RPC over stdio. A Walker whose client dies, or
// that is killed, ends this way, never with quit. The browser it opened must end with it.
const SERVER = join(import.meta.dirname, "../src/mcp/server.ts");
let s: Awaited<ReturnType<typeof serve>>; const dirs: string[] = []; const procs: ChildProcess[] = []; const strays: number[] = [];
beforeAll(async () => { s = await serve(); });
afterAll(async () => { await s.close(); });
afterEach(() => {
  // A failed test must not leave its browser behind either.
  for (const p of procs.splice(0)) if (p.exitCode === null && p.signalCode === null) p.kill("SIGKILL");
  for (const pid of strays.splice(0)) { try { process.kill(-pid, "SIGKILL"); } catch { /* gone */ } try { process.kill(pid, "SIGKILL"); } catch { /* gone */ } }
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

/** Linux: every live process, as pid → parent pid. A zombie has ended; it only waits for its parent to collect it. */
const table = () => {
  const t = new Map<number, number>();
  for (const d of readdirSync("/proc")) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = readFileSync(`/proc/${d}/stat`, "utf8"); const after = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
      if (after[0] !== "Z") t.set(Number(d), Number(after[1]));
    } catch { /* it ended while we looked */ }
  }
  return t;
};
const descendants = (root: number) => {
  const t = table(); const out: number[] = []; const todo = [root];
  while (todo.length) { const p = todo.pop()!; for (const [pid, ppid] of t) if (ppid === p) { out.push(pid); todo.push(pid); } }
  return out;
};
const alive = (pids: number[]) => { const t = table(); return pids.filter(p => t.has(p)); };
const until = async (f: () => boolean, ms: number) => { const end = Date.now() + ms; while (!f() && Date.now() < end) await new Promise(r => setTimeout(r, 100)); return f(); };

/** Starts the server on a fresh run and opens a walk on the local fixture site. Returns the server and its browser's processes. */
async function startWalk() {
  const f = walkFiles(s.url); dirs.push(f.dir);
  const runFile = join(f.dir, "run.json"); writeFileSync(runFile, JSON.stringify(f.run));
  const p = spawn(process.execPath, ["--import", "tsx", SERVER, "--run", runFile], { cwd: join(import.meta.dirname, ".."), stdio: ["pipe", "pipe", "pipe"] });
  procs.push(p);
  let out = ""; let err = ""; const waiting = new Map<number, (m: any) => void>();
  p.stderr!.on("data", d => { err += d; });
  p.stdout!.on("data", d => {
    out += d; let i;
    while ((i = out.indexOf("\n")) >= 0) { const line = out.slice(0, i); out = out.slice(i + 1); try { const m = JSON.parse(line); waiting.get(m.id)?.(m); } catch { /* not ours */ } }
  });
  let id = 0;
  const ask = (method: string, params: object) => new Promise<any>((resolve, reject) => {
    const n = ++id; waiting.set(n, resolve);
    p.once("exit", c => reject(new Error(`the server exited (${c}) before answering ${method}: ${err}`)));
    p.stdin!.write(JSON.stringify({ jsonrpc: "2.0", id: n, method, params }) + "\n");
  });
  await ask("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "exit-test", version: "0" } });
  p.stdin!.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  const r = await ask("tools/call", { name: "start_walk", arguments: { walker: f.walker, journey: f.journey, viewport: "phone" } });
  expect(r.result?.isError, JSON.stringify(r)).toBeFalsy();
  const browser = descendants(p.pid!); strays.push(...browser);
  expect(browser.length).toBeGreaterThan(0);
  const exited = new Promise<{ code: number | null; signal: string | null }>(res => p.once("exit", (code, signal) => res({ code, signal })));
  return { p, browser, exited };
}

test.skipIf(process.platform !== "linux")("closing the server's stdin closes its browser and ends the server", async () => {
  const { p, browser, exited } = await startWalk();
  p.stdin!.end();
  expect(await until(() => alive(browser).length === 0, 5_000), `browser processes still running: ${alive(browser).join(", ")}`).toBe(true);
  expect(await until(() => p.exitCode !== null || p.signalCode !== null, 5_000), "the server is still running").toBe(true);
  expect((await exited).code).toBe(0);
});

test.skipIf(process.platform !== "linux")("SIGTERM to the server closes its browser and ends the server", async () => {
  const { p, browser, exited } = await startWalk();
  p.kill("SIGTERM");
  expect(await until(() => alive(browser).length === 0, 5_000), `browser processes still running: ${alive(browser).join(", ")}`).toBe(true);
  expect(await until(() => p.exitCode !== null || p.signalCode !== null, 5_000), "the server is still running").toBe(true);
  expect((await exited).code).toBe(143);
});
