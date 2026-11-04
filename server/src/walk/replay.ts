import type { RunConfig } from "../formats/schemas.js";
import type { ViewportName } from "../formats/viewports.js";
import { WalkSession, type ReplayStep } from "./session.js";
/** reproduced: the replay reached the finding's page state. dir: the replay walk's own folder, when it got far enough to have one. */
export interface Replayed { reproduced: boolean; dir?: string }
export type Reproduce = (run: RunConfig, args: { walker: string; journey: string; viewport: ViewportName; locale?: string },
  acts: ReplayStep[], target: { state: string; upToEvent: number }, dir: string) => Promise<Replayed>;
export const reproduce: Reproduce = async (run, args, acts, target, dir) => {
  const s = new WalkSession({ ...run, out_dir: dir }, true, false);
  let reproduced = false;
  try {
    await s.start(args);
    let all = true;
    for (const a of acts.filter(x => x.event < target.upToEvent)) if (!(await s.replayAct(a))) { all = false; break; }
    reproduced = all && s.lastState === target.state;
  } catch { /* a replay that cannot start or act did not reproduce */ }
  const q = await s.quit("done", "replay").catch(() => undefined);
  return { reproduced, ...(q ? { dir: q.dir } : {}) };
};
