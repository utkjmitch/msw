export interface Rating { option: number; score: 1 | 2 | 3 | 4 | 5; why: string }
export interface Wharton { will_try: boolean; notices: boolean; associates: boolean; sees_progress: boolean; note?: string }
export function checkAct(input: { option: number; ratings: Rating[]; state: string },
  last: { state: string; optionCount: number } | null): { ok: true } | { ok: false; reason: string } {
  if (!last) return { ok: false, reason: "look first" };
  if (input.state !== last.state) return { ok: false, reason: "the page changed; look again" };
  if (input.option < 1 || input.option > last.optionCount) return { ok: false, reason: "no such option" };
  const rated = new Set(input.ratings.filter(r => r.option >= 1 && r.option <= last.optionCount).map(r => r.option));
  if (rated.size < Math.min(2, last.optionCount)) return { ok: false, reason: `rate at least ${Math.min(2, last.optionCount)} options` };
  if (!rated.has(input.option)) return { ok: false, reason: "rate the option you chose" };
  return { ok: true };
}
export const whartonNos = (w: Wharton) => [w.will_try, w.notices, w.associates, w.sees_progress].filter(v => !v).length;
