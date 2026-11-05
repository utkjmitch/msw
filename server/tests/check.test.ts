import { test, expect } from "vitest";
import { check } from "../src/formats/check.js";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path";

test("the examples check clean, together", async () => {
  expect(await check(["--walker", "../examples/walkers/first-timer.yaml", "--walker", "../examples/walkers/team-member.yaml",
    "--journey", "../examples/journeys/first-timer-learn.yaml", "--journey", "../examples/journeys/team-member-review.yaml",
    "--journey", "../examples/journeys/first-timer-silly-wide-map.yaml",
    "--run", "../examples/run.json"])).toEqual([]);
});
test("a bad file, a missing Walker and an audience above the role are each reported", async () => {
  const d = mkdtempSync(join(tmpdir(), "msw-check-"));
  try {
    const bad = join(d, "bad.yaml"); writeFileSync(bad, "id: x\n");
    const j = (walker: string, audience: string) => `id: j\nwalker: ${walker}\naudience: ${audience}\ngoal: find out\n` +
      `start_url: http://127.0.0.1:4810/\narrival: direct\nsuccess: [knows]\nstep_budget: 5\n`;
    const orphan = join(d, "orphan.yaml"); writeFileSync(orphan, j("nobody", "public"));
    const above = join(d, "above.yaml"); writeFileSync(above, j("first-timer", "admin"));
    const p = await check(["--walker", "../examples/walkers/first-timer.yaml", "--walker", bad, "--journey", orphan, "--journey", above]);
    expect(p).toHaveLength(3);
    expect(p[0]).toMatch(/bad\.yaml/);
    expect(p[1]).toMatch(/"nobody" is not among/);
    expect(p[2]).toMatch(/audience "admin" is above/);
  } finally { rmSync(d, { recursive: true }); }
});
test("no arguments, or an unknown flag, is a problem", async () => {
  expect(await check([])).toEqual([expect.stringMatching(/^usage/)]);
  expect(await check(["--dossier", "x"])).toEqual(["unknown flag --dossier"]);
});
