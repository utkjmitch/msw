// parrot.ts
import type { MswEvent } from "../events/log.js";
export function deadParrot(events: MswEvent[], findings: { evidence: number[] }[]): { alive: boolean; failures: string[] } {
  const failures: string[] = [];
  const seqs = new Set(events.map(e => e.seq));
  const looked = new Set<string>(); const shots = new Map<string, number>(); const inst = new Set<string>();
  let lastAct: MswEvent | undefined;
  for (const e of events) {
    if (e.kind === "look" && e.state) { looked.add(e.state); shots.set(e.state, (shots.get(e.state) ?? 0) + 1); }
    if (e.kind === "instrument" && e.state) inst.add(e.state);
    // A record from a page the walk never looked at is kept, but it cannot be tied to a page.
    if ((e.kind === "instrument" || e.kind === "blocked") && !e.state) failures.push(`event ${e.seq} has no observed page state`);
    if (e.kind === "condition" && e.data.name === "network-not-emulated") failures.push(`slow-3g was not applied to a page at event ${e.seq}`);
    if (e.kind === "instrument" && e.data.type === "inspect-error" && (e.data.detail as { attempt?: number } | undefined)?.attempt === 2)
      failures.push(`the axe pass failed twice at event ${e.seq}`);
    if (e.kind === "act") {
      if (!e.state || !looked.has(e.state)) failures.push(`action at event ${e.seq} had no look of the same page`);
      if (lastAct) {
        const gap = Date.parse(e.ts) - Date.parse(lastAct.ts);
        if (gap < 500) failures.push(`two actions ${gap} ms apart (event ${e.seq})`);
      }
      lastAct = e;
    }
  }
  for (const [state, n] of shots) {
    if (n < 2) failures.push(`page ${state.slice(0, 8)} has ${n} screenshot`);
    if (!inst.has(state)) failures.push(`page ${state.slice(0, 8)} has no instrument record`);
  }
  for (const f of findings) for (const id of f.evidence)
    if (!seqs.has(id)) failures.push(`a finding cites event ${id}, which is not in this run`);
  return { alive: failures.length === 0, failures };
}
