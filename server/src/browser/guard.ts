import type { BrowserContext, Route, WebSocketRoute } from "playwright";
import type { RunConfig, Journey } from "../formats/schemas.js";
import { matchReadChannel, matchSocketChannel, type ReadChannel, type SocketChannel } from "./read-channels.js";
/**
 * left-site: a navigation off the list. background-write: a script's or a widget's write off the list, which the Walker never sees.
 * reached: the write a redirect answered. It reached the site before the guard stopped the next hop.
 */
/** socket-refused: a read-only walk's WebSocket to the site that no socket channel names. It never connects. */
export interface Blocked { why: "would-submit" | "left-site" | "background-write" | "socket-refused"; method: string; url: string; page?: string; redirect_status?: number; reached?: Reached }
/** A request the site has answered. */
export interface Reached { method: string; url: string; status: number }
/** A request the guard could not finish. reached: the site had already answered it, so a write there took effect. */
export interface GuardError { method: string; url: string; page?: string; error: string; reached?: Reached }
/** A POST a read channel let through in read-only mode, or a WebSocket a socket channel let open (method WEBSOCKET). */
export interface Read { channel: string; method: string; url: string; page?: string; status?: number }
/** A frame the page sent over a socket channel: its size only, never its content. sent: false when the channel drops it. */
export interface SocketSend { channel: string; url: string; bytes: number; sent: boolean }
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const MAX_HOPS = 10;
const originOf = (u: string) => new URL(u).origin;
const message = (e: unknown) => String((e as Error)?.message ?? e).split("\n")[0];
/** A 200 page whose meta refresh asks the browser for `url`, so that request goes back through the route (spec 3.3). */
const refreshPage = (url: string) => `<!doctype html><meta http-equiv="refresh" content="0; url='${url.replace(/'/g, "%27")
  .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}'"><title>Redirecting</title>`;
/** Headers that describe the redirect's own body or target, not the refresh page that replaces it. Cookies stay. */
const NOT_CARRIED = new Set(["location", "content-length", "content-type", "content-encoding", "transfer-encoding"]);
export async function installGuard(context: BrowserContext,
  o: { mode: "read-only" | "transact"; origins: string[]; payments?: string[]; reads?: ReadChannel[]; sockets?: SocketChannel[];
    onBlocked: (b: Blocked) => void; onRead?: (r: Read) => void; onSocketSend?: (s: SocketSend) => void; onError?: (e: GuardError) => void }): Promise<void> {
  const allowed = new Set(o.origins.map(originOf));
  // Payment providers take writes in transact mode only. They are never walkable pages.
  const payments = new Set(o.mode === "transact" ? (o.payments ?? []).map(originOf) : []);
  const report = (e: GuardError) => { try { o.onError?.(e); } catch { /* a closed log must not undo the abort */ } };
  await context.route("**/*", async route => {
    // Every error ends here, so none reaches Node as an unhandled rejection, and the request fails closed.
    try { await decide(route); }
    catch (e) {
      const req = route.request(); report({ method: req.method(), url: req.url(), error: message(e) });
      await route.abort("failed").catch(() => {});
    }
  });
  // context.route never sees a WebSocket, and a socket can send anything once open. One to an origin off the list never connects.
  // In read-only mode, one to the site connects only when a socket channel names it (report D-2). In transact mode it is left alone.
  const httpOrigin = (u: URL) => originOf(u.href.replace(/^ws/, "http"));
  const tell = (f: () => void) => { try { f(); } catch { /* a closed log must not keep a socket open */ } };
  const refuse = (ws: WebSocketRoute, b: Blocked) => { tell(() => o.onBlocked(b)); void ws.close({ code: 1008, reason: "blocked by the walk's guard" }).catch(() => {}); };
  await context.routeWebSocket(u => { const to = httpOrigin(u); return o.mode === "read-only" || (!allowed.has(to) && !payments.has(to)); }, ws => {
    const url = ws.url(); const to = httpOrigin(new URL(url));
    if (!allowed.has(to) && !payments.has(to)) return refuse(ws, { why: "background-write", method: "WEBSOCKET", url });
    const named = matchSocketChannel(url, o.sockets ?? []);
    if (!named) return refuse(ws, { why: "socket-refused", method: "WEBSOCKET", url });
    const server = ws.connectToServer(); const forward = named.channel.sends === "forward";
    tell(() => o.onRead?.({ channel: named.name, method: "WEBSOCKET", url }));
    // Once onMessage is set, Playwright forwards nothing by itself: each of the page's frames goes on only from here.
    ws.onMessage(m => {
      tell(() => o.onSocketSend?.({ channel: named.name, url, bytes: typeof m === "string" ? Buffer.byteLength(m) : m.length, sent: forward }));
      if (forward) server.send(m);
    });
  });
  async function decide(route: Route): Promise<void> {
    const req = route.request(); const origin = originOf(req.url());
    let mainNav = false; let page: string | undefined; const nav = req.isNavigationRequest();
    // A pop-up's first navigation has no frame yet, so req.frame() throws. It opens a page, so it is a main-frame navigation: fail closed.
    if (nav) try { const f = req.frame(); mainNav = f === f.page().mainFrame(); } catch { mainNav = true; }
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
  }
  /**
   * Sends a write on, one hop only, and never hands the browser a 3xx (spec 3.3). Playwright routes only the first URL
   * of a redirect chain: after a fulfilled 3xx, Chromium and Firefox follow it without asking the guard, and WebKit
   * refuses to fulfill one. So the guard checks each next hop itself:
   * - a redirect that keeps the write (307, 308, or 301/302 for a method other than POST) is stopped;
   * - a navigation gets a 200 page that refreshes to an allowed Location, so that request is routed and checked again;
   * - a script's request is followed here, a GET at a time, on the journey's origins only.
   * Returns the site's status, or undefined when the request was stopped.
   */
  async function forward(route: Route, page: string | undefined): Promise<number | undefined> {
    const req = route.request();
    let response;
    try { response = await route.fetch({ maxRedirects: 0 }); }
    catch { await route.abort("failed").catch(() => {}); return undefined; } // never leave a write hanging when the fetch itself fails
    const status = response.status(); const location = response.headers().location;
    const reached: Reached = { method: req.method(), url: req.url(), status };
    const deliver = async (answer: Parameters<Route["fulfill"]>[0]) => {
      await route.fulfill(answer);
      // Playwright ignores a fulfill once the page has closed. The site took the write all the same, so record it.
      let closed = false; try { closed = req.frame().page().isClosed(); } catch { /* a pop-up's first request has no frame yet */ }
      if (closed) report({ method: req.method(), url: req.url(), page, error: "the page closed before the site's answer reached it", reached });
      return status;
    };
    const stop = async (b: Omit<Blocked, "page" | "reached">) => { o.onBlocked({ ...b, page, reached }); await route.abort("aborted"); return undefined; };
    try {
      if (status < 300 || status >= 400) return await deliver({ response });
      if (!REDIRECTS.has(status) || !location) throw new Error(`the site answered ${status} with no Location the guard can follow`);
      let next = new URL(location, req.url()).href;
      const preservesWrite = status === 307 || status === 308 || ((status === 301 || status === 302) && req.method() !== "POST");
      if (preservesWrite) return await stop({ why: "background-write", method: req.method(), url: next, redirect_status: status });
      if (req.isNavigationRequest()) {
        if (!allowed.has(originOf(next))) return await stop({ why: "left-site", method: "GET", url: next, redirect_status: status });
        const headers = Object.fromEntries(Object.entries(response.headers()).filter(([k]) => !NOT_CARRIED.has(k)));
        return await deliver({ status: 200, headers, contentType: "text/html; charset=utf-8", body: refreshPage(next) });
      }
      let res = response;
      for (let hop = 1; ; hop++) {
        const to = originOf(next);
        if (!allowed.has(to) && !payments.has(to)) return await stop({ why: "background-write", method: "GET", url: next, redirect_status: res.status() });
        if (hop > MAX_HOPS) throw new Error(`more than ${MAX_HOPS} redirects`);
        res = await context.request.get(next, { maxRedirects: 0, failOnStatusCode: false });
        const loc = res.headers().location;
        if (!REDIRECTS.has(res.status()) || !loc) break;
        next = new URL(loc, next).href;
      }
      if (res.status() >= 300 && res.status() < 400) throw new Error(`the site answered ${res.status()} with no Location the guard can follow`);
      return await deliver({ response: res });
    } catch (e) {
      report({ method: req.method(), url: req.url(), page, error: message(e), reached });
      await route.abort("failed").catch(() => {}); return undefined;
    }
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
