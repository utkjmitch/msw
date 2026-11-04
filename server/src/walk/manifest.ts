// manifest.ts: what a walk was given and what it ran on (spec 4.4: inputs, versions, times)
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Browser } from "playwright";
import type { RunConfig } from "../formats/schemas.js";

const req = createRequire(import.meta.url);
const version = (load: () => { version?: string }) => { try { return load().version ?? "unknown"; } catch { return "unknown"; } };
export interface Manifest {
  run: RunConfig;
  inputs: { walker: { path: string; sha256: string }; journey: { path: string; sha256: string }; viewport: string; locale: string; read_channels?: unknown[] };
  versions: Record<string, string>;
  times: { started: string; ended: string | null };
  outcome: { reason: string; ended: string | null } | null;
}
export function versions(browser: Browser): Record<string, string> {
  return {
    msw_server: version(() => JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"))),
    node: process.version, playwright: version(() => req("playwright/package.json")),
    chromium: browser.version(), axe_core: version(() => req("axe-core/package.json")),
  };
}
export const fileInput = (path: string) => ({ path, sha256: createHash("sha256").update(readFileSync(path)).digest("hex") });
export const writeManifest = (file: string, m: Manifest) => writeFileSync(file, JSON.stringify(m, null, 2) + "\n");
