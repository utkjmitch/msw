// Replaced with replay in Task 11.
import type { RunConfig } from "../formats/schemas.js";
import type { ViewportName } from "../formats/viewports.js";
import type { ReplayStep } from "./session.js";
export async function reproduce(_run: RunConfig,
  _args: { walker: string; journey: string; viewport: ViewportName; locale?: string },
  _acts: ReplayStep[], _target: { state: string; upToEvent: number }, _dir: string): Promise<boolean> {
  return false;
}
