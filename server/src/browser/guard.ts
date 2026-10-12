import type { BrowserContext, Route } from "playwright";
import type { RunConfig, Journey } from "../formats/schemas.js";
/** left-site: a navigation off the list. background-write: a script's or a widget's write off the list, which the Walker never sees. */
export interface Blocked { why: "would-submit" | "left-site" | "background-write"; method: string; url: string; page?: string; redirect_status?: number }
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const originOf = (u: string) => new URL(u).origin;
export async function installGuard(context: BrowserContext,
  o: { mode: "read-only" | "transact"; origins: string[]; payments?: string[]; onBlocked: (b: Blocked) => void }): Promise<void> {
  const allowed = new Set(o.origins.map(originOf));
  // Payment providers take writes in transact mode only. They are never walkable pages.
  const payments = new Set(o.mode === "transact" ? (o.payments ?? []).map(originOf) : []);
  await context.route("**/*", async route => {
    const req = route.request(); const origin = originOf(req.url());
    let mainNav = false; let page: string | undefined; const nav = req.isNavigationRequest();
    try { mainNav = nav && req.frame() === req.frame().page().mainFrame(); } catch { mainNav = false; }
    // The page the request came from. A navigation has not committed yet, so this is still the old page.
    try { page = req.frame().page().url(); } catch { page = undefined; }
    if (!mainNav && MUTATING.has(req.method()) && payments.has(origin)) return forward(route, page);
    if ((mainNav || MUTATING.has(req.method())) && !allowed.has(origin)) {
      o.onBlocked({ why: nav ? "left-site" : "background-write", method: req.method(), url: req.url(), page }); return route.abort("aborted");
    }
    if (o.mode === "read-only" && MUTATING.has(req.method()) && allowed.has(origin)) {
      o.onBlocked({ why: "would-submit", method: req.method(), url: req.url(), page }); return route.abort("aborted");
    }
    if (o.mode === "transact" && MUTATING.has(req.method())) return forward(route, page);
    return route.continue();
  });
  // Playwright routes only the first URL in a redirect chain. Stop write-preserving
  // redirects before the browser can forward the body without another guard check.
  async function forward(route: Route, page: string | undefined) {
    const req = route.request();
    let response;
    try { response = await route.fetch({ maxRedirects: 0 }); }
    catch { return route.abort("failed"); } // never leave a write hanging when the fetch itself fails
    const status = response.status(); const location = response.headers().location;
    const preservesWrite = status === 307 || status === 308 || ((status === 301 || status === 302) && req.method() !== "POST");
    if (location && preservesWrite) {
      o.onBlocked({ why: "background-write", method: req.method(), url: new URL(location, req.url()).href, page, redirect_status: status });
      return route.abort("aborted");
    }
    return route.fulfill({ response });
  }
}
export function transactAllowed(run: RunConfig, journey: Journey): { ok: true } | { ok: false; reason: string } {
  if (journey.mode !== "transact") return { ok: true };
  if (run.environment.kind !== "test") return { ok: false, reason: "transact walks need a test environment" };
  const listed = new Set(run.allowed_for_transact.map(originOf));
  for (const o of [journey.start_url, ...journey.origins])
    if (!listed.has(originOf(o))) return { ok: false, reason: `origin ${originOf(o)} is not in allowed_for_transact` };
  // Spec 5.6: a payment provider is allowed only in test mode, and the run file states that.
  if ((journey.payment_origins ?? []).length && !run.payment_test_mode) return { ok: false, reason: "payment origins need payment_test_mode: true in the run file" };
  return { ok: true };
}
/** Spec 12: admin journeys run only on test copies with seeded data, and their mode is transact. */
export function adminAllowed(run: RunConfig, journey: Journey): { ok: true } | { ok: false; reason: string } {
  if (journey.audience !== "admin") return { ok: true };
  if (journey.mode !== "transact") return { ok: false, reason: "admin journeys run only in transact mode" };
  if (run.environment.kind !== "test" || !run.environment.seeded_data)
    return { ok: false, reason: "admin journeys need a test environment with seeded data (environment.seeded_data: true)" };
  return { ok: true };
}
