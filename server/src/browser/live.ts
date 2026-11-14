// live.ts: every browser this process has open, so the server can close them all however it ends.
import { chromium, type Browser, type LaunchOptions } from "playwright";
import { readdirSync, readFileSync } from "node:fs";

/** Each open browser, with its process ids where they could be learned (Linux). */
const open = new Map<Browser, number[]>();
let turn: Promise<unknown> = Promise.resolve();

/**
 * Linux: this process's children that are Playwright browsers (they talk to it over a pipe). Playwright's Browser does not
 * expose its process, so a launch looks for the child that appeared while it ran. Elsewhere this is empty, and the kill
 * at exit is Playwright's own exit handler.
 */
const browserChildren = (): Set<number> => {
  const out = new Set<number>();
  if (process.platform !== "linux") return out;
  let dirs: string[] = [];
  try { dirs = readdirSync("/proc"); } catch { return out; }
  for (const d of dirs) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = readFileSync(`/proc/${d}/stat`, "utf8");
      if (Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[1]) !== process.pid) continue;
      if (readFileSync(`/proc/${d}/cmdline`, "utf8").split("\0").includes("--remote-debugging-pipe")) out.add(Number(d));
    } catch { /* it ended while we looked */ }
  }
  return out;
};

/**
 * Launches Chromium and keeps it on the open list until it disconnects. Launches take turns, so the new child is this one's.
 * Playwright's own signal handlers stay on: they close the browser on SIGINT, SIGTERM and SIGHUP, and kill it at exit, for any
 * process that uses WalkSession without the server. They never end the process on SIGTERM or SIGHUP, and nothing in them
 * watches stdin; the server's closeOnExit does both.
 */
export function launch(options: LaunchOptions): Promise<Browser> {
  const mine = turn.then(async () => {
    const before = browserChildren();
    const browser = await chromium.launch({ handleSIGINT: true, handleSIGTERM: true, handleSIGHUP: true, ...options });
    open.set(browser, [...browserChildren()].filter(p => !before.has(p)));
    browser.once("disconnected", () => open.delete(browser));
    return browser;
  });
  turn = mine.catch(() => undefined);
  return mine;
}

/** Kills every open browser's process group now. Synchronous, so it also runs in an exit handler. Safe to call twice. */
export function killAll(): void {
  for (const [browser, pids] of open) {
    for (const pid of pids) {
      // Playwright starts each browser as the leader of its own process group, so -pid takes its renderers too.
      try { process.kill(-pid, "SIGKILL"); } catch { try { process.kill(pid, "SIGKILL"); } catch { /* already gone */ } }
    }
    open.delete(browser);
  }
}

/** Closes every open browser, giving each `ms` to close cleanly, then kills whatever is left. Safe to call twice. */
export async function closeAll(ms = 3_000): Promise<void> {
  await Promise.all([...open.keys()].map(b => new Promise<void>(done => {
    const t = setTimeout(done, ms); t.unref();
    b.close().catch(() => undefined).finally(() => { clearTimeout(t); done(); });
  })));
  killAll();
}

/** How many browsers are open, for tests. */
export const openBrowsers = () => open.size;
