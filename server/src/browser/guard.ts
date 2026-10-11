import type { BrowserContext } from "playwright";
import type { RunConfig, Journey } from "../formats/schemas.js";
export interface Blocked { why: "would-submit" | "left-site"; method: string; url: string }
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const originOf = (u: string) => new URL(u).origin;
export async function installGuard(context: BrowserContext,
  o: { mode: "read-only" | "transact"; origins: string[]; onBlocked: (b: Blocked) => void }): Promise<void> {
  const allowed = new Set(o.origins.map(originOf));
  await context.route("**/*", async route => {
    const req = route.request(); const origin = originOf(req.url());
    let mainNav = false;
    try { mainNav = req.isNavigationRequest() && req.frame() === req.frame().page().mainFrame(); } catch { mainNav = false; }
    if (mainNav && !allowed.has(origin)) {
      o.onBlocked({ why: "left-site", method: req.method(), url: req.url() }); return route.abort("aborted");
    }
    if (o.mode === "read-only" && MUTATING.has(req.method()) && allowed.has(origin)) {
      o.onBlocked({ why: "would-submit", method: req.method(), url: req.url() }); return route.abort("aborted");
    }
    return route.continue();
  });
}
export function transactAllowed(run: RunConfig, journey: Journey): { ok: true } | { ok: false; reason: string } {
  if (journey.mode !== "transact") return { ok: true };
  if (run.environment.kind !== "test") return { ok: false, reason: "transact walks need a test environment" };
  const listed = new Set(run.allowed_for_transact.map(originOf));
  for (const o of [journey.start_url, ...journey.origins])
    if (!listed.has(originOf(o))) return { ok: false, reason: `origin ${originOf(o)} is not in allowed_for_transact` };
  return { ok: true };
}
