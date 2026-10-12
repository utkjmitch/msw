import { test, expect } from "vitest";
import { loadWalker, loadJourney, loadRun } from "../src/formats/load.js";
import { audienceAllowed, Journey, RunConfig } from "../src/formats/schemas.js";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path";

test("example files load", async () => {
  const w = await loadWalker("../examples/walkers/first-timer.yaml");
  const j = await loadJourney("../examples/journeys/first-timer-learn.yaml");
  const r = await loadRun("../examples/run.json");
  expect(w.role).toBe("visitor"); expect(j.mode).toBe("read-only"); expect(r.mask_personal_data).toBe(true);
});
test("journey goal may not be empty and budget is bounded", () => {
  const base = { id: "x", walker: "w", audience: "public", goal: "find out", start_url: "https://a.test/", arrival: "direct", success: ["s"], step_budget: 10 };
  expect(Journey.safeParse(base).success).toBe(true);
  expect(Journey.safeParse({ ...base, goal: "" }).success).toBe(false);
  expect(Journey.safeParse({ ...base, step_budget: 0 }).success).toBe(false);
});
test("audience must not exceed role", () => {
  expect(audienceAllowed("visitor", "admin")).toBe(false);
  expect(audienceAllowed("admin", "public")).toBe(true);
});
test("invalid file names the file", async () => {
  const d = mkdtempSync(join(tmpdir(), "msw-"));
  try {
    const p = join(d, "bad.yaml"); writeFileSync(p, "id: x\n");
    await expect(loadWalker(p)).rejects.toThrow(/bad\.yaml/);
  } finally { rmSync(d, { recursive: true }); }
});
test("a run names its environment; test_copy and seeded_data default to false", () => {
  const base = { id: "r", out_dir: "walks", environment: { name: "staging", kind: "test" } };
  const parsed = RunConfig.parse(base);
  expect(parsed.environment).toMatchObject({ test_copy: false, seeded_data: false });
  expect(RunConfig.safeParse({ ...base, environment: { name: "  ", kind: "test" } }).success).toBe(false);
});
