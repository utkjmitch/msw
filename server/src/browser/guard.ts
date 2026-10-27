import type { BrowserContext, Route } from "playwright";
import type { RunConfig, Journey } from "../formats/schemas.js";
import { matchReadChannel, type ReadChannel } from "./read-channels.js";
/** left-site: a navigation off the list. background-write: a script's or a widget's write off the list, which the Walker never sees. */
export interface Blocked { why: "would-submit" | "left-site" | "background-write"; method: string; url: string; page?: string; redirect_status?: number }
/** A POST a read channel let through in read-only mode. */
export interface Read { channel: string; method: string; url: string; page?: string; status?: number }
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const originOf = (u: string) => new URL(u).origin;
export async function installGuard(context: BrowserContext,
  o: { mode: "read-only" | "transact"; origins: string[]; payments?: string[]; reads?: ReadChannel[]; onBlocked: (b: Blocked) => void; onRead?: (r: Read) => void }): Promise<void> {
  const allowed = new Set(o.origins.map(originOf));
  // Payment providers take writes in transact mode only. They are never walkable pages.
  const payments = new Set(o.mode === "transact" ? (o.payments ?? []).map(originOf) : []);
  await context.route("**/*", async route => {
    const req = route.request(); const origin = originOf(req.url());
    let mainNav = false; let page: string | undefined; const nav = req.isNavigationRequest();
    try { mainNav = nav && req.frame() === req.frame().page().mainFrame(); } catch { mainNav = false; }
    // The page the request came from. A navigation has not committed yet, so this is still the old page.
    try { page = req.frame().page().url(); } catch { page = undefined; }
    if (!mainNav && MUTATING.has(req.method()) && payments.has(origin)) return void await forward(route, page);
    // Plan B task 2: in read-only mode a POST that a read channel names goes through (never a navigation, never another method).
    if (o.mode === "read-only" && o.reads?.length && MUTATING.has(req.method())) {
      const channel = matchReadChannel({ method: req.method(), url: req.url(), body: req.postData(), navigation: nav }, o.reads);
      if (channel) {
        const status = await forward(route, page);
        if (status !== undefined) o.onRead?.({ channel, method: req.method(), url: req.url(), page, status });
        return;
      }
    }
    if ((mainNav || MUTATING.has(req.method())) && !allowed.has(origin)) {
      o.onBlocked({ why: nav ? "left-site" : "background-write", method: req.method(), url: req.url(), page }); return route.abort("aborted");
    }
    if (o.mode === "read-only" && MUTATING.has(req.method()) && allowed.has(origin)) {
      o.onBlocked({ why: "would-submit", method: req.method(), url: req.url(), page }); return route.abort("aborted");
    }
    if (o.mode === "transact" && MUTATING.has(req.method())) return void await forward(route, page);
    return route.continue();
  });
  // Playwright routes only the first URL in a redirect chain. Stop write-preserving
  // redirects before the browser can forward the body without another guard check.
  /** Sends the request on, one hop only. Returns the response status, or undefined when it was stopped. */
  async function forward(route: Route, page: string | undefined): Promise<number | undefined> {
    const req = route.request();
    let response;
    try { response = await route.fetch({ maxRedirects: 0 }); }
    catch { await route.abort("failed"); return undefined; } // never leave a write hanging when the fetch itself fails
    const status = response.status(); const location = response.headers().location;
    const preservesWrite = status === 307 || status === 308 || ((status === 301 || status === 302) && req.method() !== "POST");
    if (location && preservesWrite) {
      o.onBlocked({ why: "background-write", method: req.method(), url: new URL(location, req.url()).href, page, redirect_status: status });
      await route.abort("aborted"); return undefined;
    }
    await route.fulfill({ response }); return status;
  }
}
export function transactAllowed(run: RunConfig, journey: Journey): { ok: true } | { ok: false; reason: string } {
  if (journey.mode !== "transact") return { ok: true };
  if (run.environment.kind !== "test") return { ok: false, reason: "transact walks need a test environment" };
  const listed = new Set(run.allowed_for_transact.map(originOf));
  // A payment provider takes real writes, so the run file must approve it like any other origin.
  for (const o of [journey.start_url, ...journey.origins, ...(journey.payment_origins ?? [])])
    if (!listed.has(originOf(o))) return { ok: false, reason: `origin ${originOf(o)} is not in allowed_for_transact` };
  // Spec 5.6: a payment provider is allowed only in test mode, and the run file states that.
  if ((journey.payment_origins ?? []).length && !run.payment_test_mode) return { ok: false, reason: "payment origins need payment_test_mode: true in the run file" };
  return { ok: true };
}
/**
 * Spec 12: admin journeys run only on test copies with seeded data, and their mode is transact.
 * One exception: a read-only admin walk, when the run file records who allowed it (admin_read_only) and masks personal data.
 * Read-only stops every write, so the walk can look at an admin area but change nothing in it.
 */
export function adminAllowed(run: RunConfig, journey: Journey): { ok: true } | { ok: false; reason: string } {
  if (journey.audience !== "admin") return { ok: true };
  if (journey.mode === "read-only" && run.admin_read_only) {
    if (!run.mask_personal_data) return { ok: false, reason: "read-only admin walks need mask_personal_data: true" };
    return { ok: true };
  }
  if (journey.mode !== "transact") return { ok: false, reason: "admin journeys run only in transact mode, or read-only with admin_read_only in the run file" };
  if (run.environment.kind !== "test" || !run.environment.test_copy || !run.environment.seeded_data)
    return { ok: false, reason: "admin journeys need a test environment with seeded data on a test copy (environment.test_copy: true and environment.seeded_data: true)" };
  return { ok: true };
}
