// load.ts
import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import type { ZodType } from "zod";
import { Walker, Journey, RunConfig } from "./schemas.js";
async function load<T>(path: string, schema: ZodType<T>): Promise<T> {
  const raw = parse(await readFile(path, "utf8"));
  const r = schema.safeParse(raw);
  if (!r.success) throw new Error(`${path}: ${r.error.message}`);
  return r.data;
}
export const loadWalker = (p: string) => load(p, Walker);
export const loadJourney = (p: string) => load(p, Journey);
export const loadRun = (p: string) => load(p, RunConfig);
