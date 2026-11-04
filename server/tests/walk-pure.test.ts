import { test, expect } from "vitest";
import { Budget } from "../src/walk/budget.js";
import { checkAct, whartonNos } from "../src/walk/rules.js";
import { deadParrot } from "../src/walk/parrot.js";
import type { MswEvent } from "../src/events/log.js";
const r = (option: number) => ({ option, score: 3 as const, why: "x" });
test("budget", () => {
  const b = new Budget(2, 2); b.spendStep(); b.charge("back"); expect(b.exhausted()).toBeNull();
  b.charge("wharton-no"); expect(b.exhausted()).toBe("patience");
  const c = new Budget(1, 5); c.spendStep(); expect(c.exhausted()).toBe("steps");
});
test("checkAct", () => {
  const last = { state: "s", optionCount: 5 };
  expect(checkAct({ option: 1, ratings: [r(1), r(2)], state: "s" }, null)).toEqual({ ok: false, reason: "look first" });
  expect(checkAct({ option: 1, ratings: [r(1), r(2)], state: "old" }, last)).toEqual({ ok: false, reason: "the page changed; look again" });
  expect(checkAct({ option: 9, ratings: [r(9), r(2)], state: "s" }, last)).toEqual({ ok: false, reason: "no such option" });
  expect(checkAct({ option: 1, ratings: [r(1)], state: "s" }, last)).toEqual({ ok: false, reason: "rate at least 2 options" });
  expect(checkAct({ option: 1, ratings: [r(2), r(3)], state: "s" }, last)).toEqual({ ok: false, reason: "rate the option you chose" });
  expect(checkAct({ option: 1, ratings: [r(1), r(1)], state: "s" }, last)).toEqual({ ok: false, reason: "rate at least 2 options" });
  expect(checkAct({ option: 1, ratings: [r(1), r(2)], state: "s" }, last)).toEqual({ ok: true });
  expect(checkAct({ option: 1, ratings: [r(1)], state: "s" }, { state: "s", optionCount: 1 })).toEqual({ ok: true });
  expect(whartonNos({ will_try: true, notices: false, associates: false, sees_progress: true })).toBe(2);
});
const ev = (seq: number, kind: MswEvent["kind"], ts: number, state = "s", data: Record<string, unknown> = {}): MswEvent =>
  ({ seq, kind, ts: new Date(ts).toISOString(), state, data, prev: "", hmac: "" });
test("dead parrot", () => {
  const alive = [ev(1, "start", 0), ev(2, "look", 100), ev(3, "instrument", 150, "s"), ev(4, "look", 200),
    ev(5, "act", 1000), ev(6, "look", 1100, "t"), ev(7, "instrument", 1150, "t"), ev(8, "look", 1200, "t")];
  expect(deadParrot(alive, [{ evidence: [2] }])).toEqual({ alive: true, failures: [] });
  const fast = [...alive, ev(9, "act", 1300, "t")];
  expect(deadParrot(fast, []).failures).toContain("two actions 300 ms apart (event 9)");
  expect(deadParrot(alive, [{ evidence: [99] }]).failures).toContain("a finding cites event 99, which is not in this run");
  const noLook = [ev(1, "start", 0), ev(2, "act", 1000, "z")];
  expect(deadParrot(noLook, []).failures).toContain("action at event 2 had no look of the same page");
});
test("severity floors from the walk: phone-blocking and an impossible journey", async () => {
  const { noteFloor, journeyFloor } = await import("../src/walk/floors.js");
  expect(noteFloor(1, "phone", true)).toBe(3); expect(noteFloor(1, "phone-small", true)).toBe(3);
  expect(noteFloor(4, "phone", true)).toBe(4); expect(noteFloor(1, "phone", false)).toBe(1);
  expect(noteFloor(1, "desktop", true)).toBe(1);
  const walk = (viewport: string, outcome: string) => ({ viewport, outcome }) as any;
  expect(journeyFloor([walk("phone", "stuck"), walk("desktop", "run-away")])).toBe(4);
  expect(journeyFloor([walk("phone", "stuck"), walk("desktop", "done")])).toBeNull();
  // One viewport is not "any viewport": phone and desktop must both have been walked.
  expect(journeyFloor([walk("phone", "stuck")])).toBeNull();
});
