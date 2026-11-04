// floors.ts: spec 7's severity floors that come from the walk, not from the instruments
import type { ViewportName } from "../formats/viewports.js";
export const FLOOR = { phoneBlocksStep: 3, runAwayAtRequiredStep: 3, journeyImpossible: 4 } as const;
const PHONES: ViewportName[] = ["phone-small", "phone"];
/** A phone layout that prevents completing a step: at least 3. The Walker says a note blocks a step. */
export const noteFloor = (severity: number, viewport: ViewportName, blocksStep: boolean): number =>
  blocksStep && PHONES.includes(viewport) ? Math.max(severity, FLOOR.phoneBlocksStep) : severity;
/**
 * A journey that cannot be completed at all on any viewport: 4. One walk cannot know this, so the
 * reports call it with every walk of a journey. It needs phone and desktop walked (spec 5.5), none of them done.
 */
export function journeyFloor(walks: { viewport: ViewportName; outcome: string }[]): number | null {
  const seen = new Set(walks.map(w => w.viewport));
  if (!seen.has("phone") || !seen.has("desktop")) return null;
  return walks.some(w => w.outcome === "done") ? null : FLOOR.journeyImpossible;
}
