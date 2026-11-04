#!/usr/bin/env node
// check.ts: validates Walkers, journeys and run files against formats/, for the skills.
// Usage: node dist/formats/check.js --walker a.yaml --journey b.yaml --run run.json  (each flag may repeat)
import { pathToFileURL } from "node:url";
import { loadWalker, loadJourney, loadRun } from "./load.js";
import { audienceAllowed } from "./schemas.js";

export async function check(args: string[]): Promise<string[]> {
  const problems: string[] = [];
  const walkers = new Map<string, Awaited<ReturnType<typeof loadWalker>>>();
  const journeys: { path: string; j: Awaited<ReturnType<typeof loadJourney>> }[] = [];
  if (args.length === 0 || args.length % 2) return ["usage: check --walker <file> --journey <file> --run <file> (each may repeat)"];
  for (let i = 0; i < args.length; i += 2) {
    const [flag, path] = [args[i], args[i + 1]];
    try {
      if (flag === "--walker") { const w = await loadWalker(path); walkers.set(w.id, w); }
      else if (flag === "--journey") journeys.push({ path, j: await loadJourney(path) });
      else if (flag === "--run") await loadRun(path);
      else problems.push(`unknown flag ${flag}`);
    } catch (e) { problems.push((e as Error).message); }
  }
  // A journey names its Walker by id; when that Walker was checked too, its role must allow the journey's audience.
  for (const { path, j } of journeys) {
    const w = walkers.get(j.walker);
    if (!w) { if (walkers.size) problems.push(`${path}: walker "${j.walker}" is not among the Walkers checked`); continue; }
    if (!audienceAllowed(w.role, j.audience)) problems.push(`${path}: audience "${j.audience}" is above walker "${w.id}"'s role "${w.role}"`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = await check(process.argv.slice(2));
  for (const p of problems) console.error(p);
  console.log(problems.length ? `${problems.length} problem(s)` : "ok");
  process.exitCode = problems.length ? 1 : 0;
}
