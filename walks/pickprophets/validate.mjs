// Validates the PickProphets dossiers, journeys and run file against formats/*.schema.json.
// Run from the repo root: node walks/pickprophets/validate.mjs
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
const require = createRequire(new URL("../../server/package.json", import.meta.url));
const { Ajv2020 } = require("ajv/dist/2020.js");
const addFormats = require("ajv-formats");
const YAML = require("yaml");
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const schema = n => ajv.compile(JSON.parse(readFileSync(`formats/${n}.schema.json`, "utf8")));
const site = "walks/pickprophets";
const checks = [
  ...readdirSync(`${site}/walkers`).map(f => [join(site, "walkers", f), schema("walker")]),
  ...readdirSync(`${site}/journeys`).map(f => [join(site, "journeys", f), schema("journey")]),
  [join(site, "2026-10-15-live/run.json"), schema("run")],
];
const walkers = new Set(readdirSync(`${site}/walkers`).map(f => f.replace(/\.yaml$/, "")));
let bad = 0;
for (const [path, validate] of checks) {
  const doc = path.endsWith(".json") ? JSON.parse(readFileSync(path, "utf8")) : YAML.parse(readFileSync(path, "utf8"));
  const ok = validate(doc);
  const extra = path.includes("/journeys/") && !walkers.has(doc.walker) ? [`walker ${doc.walker} has no dossier`] : [];
  if (!ok || extra.length) bad++;
  console.log(`${ok && !extra.length ? "ok  " : "FAIL"} ${path}`, ok ? extra.join("; ") : JSON.stringify(validate.errors), );
}
console.log(`${checks.length - bad}/${checks.length} valid`);
process.exitCode = bad ? 1 : 0;
