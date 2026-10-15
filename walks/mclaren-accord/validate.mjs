import { loadWalker, loadJourney, loadRun } from "../../server/dist/formats/load.js";
import { readdirSync, readFileSync } from "node:fs";
const root = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
let bad = 0;
const walkers = {};
for (const f of [...readdirSync(`${root}/walkers`), "../inspection/inspector.yaml"]) {
  try { const w = await loadWalker(`${root}/walkers/${f}`); walkers[w.id] = w;
    if (!readFileSync(`${root}/walkers/${f}`, "utf8").startsWith("# provisional: written from the public-journey pattern; not yet approved")) { console.log("no provisional line", f); bad++; }
    console.log("ok walker", f); } catch (e) { console.log("BAD", e.message); bad++; }
}
for (const f of [...readdirSync(`${root}/journeys`), "../inspection/inspect-guide-1.yaml", "../inspection/inspect-guide-2.yaml"]) {
  try { const j = await loadJourney(`${root}/journeys/${f}`);
    if (!walkers[j.walker]) { console.log("unknown walker", f); bad++; }
    if (j.mode !== "read-only" || j.audience !== "public") { console.log("not public read-only", f); bad++; }
    console.log("ok journey", f); } catch (e) { console.log("BAD", e.message); bad++; }
}
const r = await loadRun(`${root}/2026-10-15-live/run.json`);
if (!r.mask_personal_data || r.environment.kind !== "live") bad++;
console.log("ok run"); process.exit(bad ? 1 : 0);
