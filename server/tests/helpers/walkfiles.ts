import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os"; import { join } from "node:path";
import type { RunConfig } from "../../src/formats/schemas.js";
export function walkFiles(startUrl: string, opts: { role?: string; audience?: string; moves?: string[]; budget?: number; patience?: number } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "msw-walk-"));
  writeFileSync(join(dir, "w.yaml"), `id: tester
name: Pat
summary: A first-time visitor
role: ${opts.role ?? "visitor"}
story: Pat heard about the trust from a neighbor.
hopes: [understand what they do]
fears: [being asked for money too soon]
background: retired
motivation: curiosity
frustrations: [tiny text]
tech_literacy: { level: low, note: uses a phone for most things }
prior_knowledge: []
devices: [phone]
locale: en-US
patience: ${opts.patience ?? 10}
leave_triggers: [asked to make an account]
`);
  writeFileSync(join(dir, "j.yaml"), `id: learn
walker: tester
audience: ${opts.audience ?? "public"}
goal: Work out what this organization does
start_url: ${startUrl}
arrival: shared-link
success: [can say what they do]
step_budget: ${opts.budget ?? 10}
${opts.moves ? `silly:\n  category: impatient-fingers\n  moves: [${opts.moves.join(", ")}]\n` : ""}`);
  const run: RunConfig = { id: "t", out_dir: join(dir, "run"), environment: { name: "fixture", kind: "test" },
    allowed_for_transact: [], payment_test_mode: false, mask_personal_data: true };
  return { dir, walker: join(dir, "w.yaml"), journey: join(dir, "j.yaml"), run };
}
export const R = (...opts: number[]) => opts.map(option => ({ option, score: 3 as const, why: "seems right" }));
export const W = { will_try: true, notices: true, associates: true, sees_progress: true };
export const n = (r: { options: string[] }, name: string) => Number(r.options.find(l => l.endsWith(name))!.split(".")[0]);
