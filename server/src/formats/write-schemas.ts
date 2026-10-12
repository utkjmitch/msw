// write-schemas.ts — writes formats/*.schema.json
import { writeFileSync, mkdirSync } from "node:fs";
import { z } from "zod";
import { Walker, Journey, RunConfig, Finding } from "./schemas.js";
mkdirSync("../formats", { recursive: true });
for (const [name, s] of Object.entries({ walker: Walker, journey: Journey, run: RunConfig, finding: Finding }))
  writeFileSync(`../formats/${name}.schema.json`, JSON.stringify(z.toJSONSchema(s), null, 2) + "\n");
