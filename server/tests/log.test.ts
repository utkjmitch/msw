import { test, expect, afterEach } from "vitest";
import { EventLog } from "../src/events/log.js";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path";
let dir = ""; afterEach(() => dir && rmSync(dir, { recursive: true }));
test("append, chain and verify; tampering is detected", () => {
  dir = mkdtempSync(join(tmpdir(), "msw-")); const f = join(dir, "events.jsonl");
  const log = new EventLog(f);
  log.append("start", { a: 1 }); log.append("look", { b: 2 }, "s1"); log.append("act", { option: 1 }, "s1");
  expect(log.all().map(e => e.seq)).toEqual([1, 2, 3]);
  expect(log.verify().ok).toBe(true);
  const lines = readFileSync(f, "utf8").trim().split("\n");
  const e = JSON.parse(lines[1]); e.data.b = 99; lines[1] = JSON.stringify(e);
  writeFileSync(f, lines.join("\n") + "\n");
  expect(log.verify()).toEqual({ ok: false, bad: [2] });
});
