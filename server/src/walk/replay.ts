import type { RunConfig } from "../formats/schemas.js";
import type { ViewportName } from "../formats/viewports.js";
import { WalkSession, type ReplayStep } from "./session.js";
export async function reproduce(run: RunConfig, args: { walker: string; journey: string; viewport: ViewportName; locale?: string },
  acts: ReplayStep[], target: { state: string; upToEvent: number }, dir: string): Promise<boolean> {
  const s = new WalkSession({ ...run, out_dir: dir }, true, false);
  try {
    await s.start(args);
    for (const a of acts.filter(x => x.event < target.upToEvent)) if (!(await s.replayAct(a))) return false;
    return s.lastState === target.state;
  } catch { return false; }
  finally { await s.quit("done", "replay").catch(() => {}); }
}
