import type { Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { createHash } from "node:crypto";
import type { Finding } from "../formats/schemas.js";
import type { ViewportName } from "../formats/viewports.js";
export interface InstrumentRecord { type: "console" | "pageerror" | "http" | "requestfailed" | "axe" | "vitals"; url: string; detail: Record<string, unknown> }
export const VITALS_INIT = `(() => { const v = { lcp: null, cls: 0, inp: null }; window.__mswVitals = v; try {
  new PerformanceObserver(l => { for (const e of l.getEntries()) v.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) v.inp = Math.max(v.inp ?? 0, e.duration); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
} catch {} })();`;
export function attachInquisition(page: Page, sink: (r: InstrumentRecord) => void): void {
  page.on("console", m => { if (m.type() === "error") sink({ type: "console", url: page.url(), detail: { text: m.text() } }); });
  page.on("pageerror", e => sink({ type: "pageerror", url: page.url(), detail: { text: e.message } }));
  page.on("response", r => { if (r.status() >= 400) sink({ type: "http", url: r.url(), detail: { status: r.status(), page: page.url() } }); });
  page.on("requestfailed", r => {
    const t = r.failure()?.errorText ?? "";
    if (!t.includes("BLOCKED_BY_CLIENT")) sink({ type: "requestfailed", url: r.url(), detail: { error: t } });
  });
}
export async function inspectPage(page: Page, sink: (r: InstrumentRecord) => void): Promise<void> {
  const res = await new AxeBuilder({ page }).analyze();
  for (const v of res.violations) if (v.impact === "serious" || v.impact === "critical")
    sink({ type: "axe", url: page.url(), detail: { id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length } });
  const vit = await page.evaluate(() => (window as unknown as { __mswVitals?: Record<string, unknown> }).__mswVitals ?? {});
  sink({ type: "vitals", url: page.url(), detail: vit });
}
export function instrumentFindings(records: (InstrumentRecord & { step: number; event: number })[],
  ctx: { run: string; walker: string; journey: string; viewport: ViewportName; locale: string }): Finding[] {
  const out = new Map<string, Finding>();
  const add = (r: InstrumentRecord & { step: number; event: number }, key: string, kind: Finding["kind"], severity: number, title: string) => {
    const k = `${r.type}|${r.url}|${key}`; const prev = out.get(k);
    if (prev) { prev.evidence.push(r.event); return; }
    out.set(k, { id: `${ctx.walker}-${ctx.journey}-i${out.size + 1}`, run: ctx.run, walker: ctx.walker, journey: ctx.journey,
      step: r.step, viewport: ctx.viewport, locale: ctx.locale, kind, source: "instrument", severity, title,
      what_happened: JSON.stringify(r.detail), expected: "No errors, failed requests or serious accessibility problems on a journey step",
      evidence: [r.event], repro: [], reproduced: true,
      fingerprint: createHash("sha1").update(`${ctx.journey}|${kind}|${key}`).digest("hex").slice(0, 12) });
  };
  for (const r of records) {
    const d = r.detail as Record<string, any>; const path = new URL(r.url).pathname;
    if (r.type === "console" || r.type === "pageerror") add(r, String(d.text), "function", 3, `Console error on ${path}`);
    else if (r.type === "http" && d.status >= 500) add(r, String(d.status), "function", 3, `Server error ${d.status} for ${path}`);
    else if (r.type === "http" && d.status === 404) add(r, "404", "content", 2, `Missing file ${path}`);
    else if (r.type === "axe") add(r, String(d.id), "accessibility", 3, `Accessibility: ${d.help}`);
    else if (r.type === "vitals" && ((d.lcp ?? 0) > 4000 || (d.cls ?? 0) > 0.25)) add(r, "vitals", "performance", 2, `Slow or unstable page ${path}`);
  }
  return [...out.values()];
}
