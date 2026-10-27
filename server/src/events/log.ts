import { appendFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createHmac, randomBytes } from "node:crypto";
export type EventKind = "start" | "look" | "act" | "refused" | "note" | "quit" | "blocked" | "instrument" | "condition" | "read";
export interface MswEvent { seq: number; ts: string; kind: EventKind; state?: string; data: Record<string, unknown>; prev: string; hmac: string }
export class EventLog {
  private events: MswEvent[] = [];
  constructor(private file: string, private key: Buffer = randomBytes(32)) { mkdirSync(dirname(file), { recursive: true }); }
  private sign(e: Omit<MswEvent, "hmac">): string {
    return createHmac("sha256", this.key).update(JSON.stringify([e.seq, e.ts, e.kind, e.state ?? null, e.data, e.prev])).digest("hex");
  }
  append(kind: EventKind, data: Record<string, unknown>, state?: string): MswEvent {
    const prev = this.events.at(-1)?.hmac ?? "";
    const base = { seq: this.events.length + 1, ts: new Date().toISOString(), kind, state, data, prev };
    const e: MswEvent = { ...base, hmac: this.sign(base) };
    this.events.push(e); appendFileSync(this.file, JSON.stringify(e) + "\n"); return e;
  }
  all(): MswEvent[] { return [...this.events]; }
  verify(): { ok: boolean; bad: number[] } {
    if (!existsSync(this.file)) return { ok: false, bad: [] };
    const bad = new Set<number>(); let prev = "";
    const text = readFileSync(this.file, "utf8").trim();
    const lines = text ? text.split("\n") : [];
    for (const [i, line] of lines.entries()) {
      try {
        const e = JSON.parse(line) as MswEvent; const { hmac, ...rest } = e;
        if (e.seq !== i + 1 || e.prev !== prev || this.sign(rest) !== hmac) bad.add(i + 1);
        prev = hmac;
      } catch { bad.add(i + 1); }
    }
    // A valid prefix is not the complete run. Anchor it to the in-memory tail.
    if (lines.length !== this.events.length) bad.add(Math.min(lines.length, this.events.length) + 1);
    if (prev !== (this.events.at(-1)?.hmac ?? "")) bad.add(this.events.length || 1);
    return { ok: bad.size === 0, bad: [...bad].sort((a, b) => a - b) };
  }
}
