import { test, expect, beforeAll, afterAll, describe } from "vitest";
import { createServer, type Server } from "node:http";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import { chromium, firefox, webkit, type Browser, type BrowserType, type Page } from "playwright";
import { installGuard, type Blocked, type GuardError } from "../src/browser/guard.js";
import { contextOptions } from "../src/browser/conditions.js";
/**
 * Slice 0 (browser spec 3.3): the guard's three gaps, and the same class of hole elsewhere.
 * Each case runs on every engine installed here. CI installs Chromium only; MSW_ENGINES picks a subset.
 * 127.0.0.1 is the site; localhost on the same port is an origin off the list.
 */
const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };
const wanted = (process.env.MSW_ENGINES ?? "chromium,firefox,webkit").split(",").map(x => x.trim()).filter(x => x in ENGINES);
const engines = wanted.filter(e => existsSync(ENGINES[e].executablePath()));

const sockets = new Set<import("node:stream").Duplex>(); let server: Server; let site = ""; let off = ""; const hits: string[] = [];
const hit = (x: string) => hits.some(h => h === x);
const page = (body: string) => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;
beforeAll(async () => {
  server = createServer((req, res) => {
    const host = (req.headers.host ?? "").startsWith("localhost") ? "off" : "site";
    const path = (req.url ?? "/").split("?")[0]; hits.push(`${host} ${req.method} ${path}`);
    const html = (b: string, h: Record<string, string> = {}) => res.writeHead(200, { "content-type": "text/html; charset=utf-8", ...h }).end(page(b));
    const go = (status: number, location: string, h: Record<string, string> = {}) => res.writeHead(status, { location, ...h }).end();
    if (path === "/popup-link") return html(`<a href="${off}/offsite-popup" target="_blank">Partner</a>`);
    if (path === "/window-open") return html(`<button onclick="window.open('${off}/offsite-open')">Open</button>`);
    if (path === "/form-blank") return html(`<form action="${off}/offsite-form" target="_blank"><button>Go</button></form>`);
    if (path === "/meta-off") return html(`<meta http-equiv="refresh" content="0; url=${off}/offsite-meta">`);
    if (path === "/frame") return html(`<iframe src="/inner"></iframe>`);
    if (path === "/inner") return html(`<a id="top" href="${off}/offsite-top" target="_top">Top</a>`);
    if (path === "/download") return html(`<a href="${off}/offsite-file" download>Get</a>`);
    if (path === "/post-off-form") return html(`<form method="post" action="/post-off"><button>Send</button></form>`);
    if (path === "/post-on-form") return html(`<form method="post" action="/post-on"><button>Send</button></form>`);
    if (path === "/post-blank-form") return html(`<form method="post" action="/post-on" target="_blank"><button>Send</button></form>`);
    if (path === "/slow-form") return html(`<form method="post" action="/slow-post"><button>Send</button></form>`);
    if (path === "/sw") return html("");
    if (path === "/sw.js") return res.writeHead(200, { "content-type": "text/javascript" }).end("self.addEventListener('fetch', () => {})");
    if (req.method === "POST" && path === "/post-off") return go(303, `${off}/offsite-after-post`);
    if (req.method === "POST" && path === "/post-on") return go(303, "/thanks?a=1&b=2", { "set-cookie": "sent=yes; Path=/" });
    if (req.method === "POST" && path === "/fetch-on") return go(303, "/thanks-data", { "access-control-allow-origin": "*" });
    if (req.method === "POST" && path === "/fetch-off") return go(303, `${off}/thanks-data`);
    if (req.method === "POST" && path === "/fetch-loop") return go(303, "/loop");
    if (path === "/loop") return go(302, "/loop");
    if (req.method === "POST" && path === "/slow-post") { setTimeout(() => { if (!res.destroyed) go(303, "/thanks"); }, 400); return; }
    if (path === "/thanks") return html(`<h1>Thanks</h1><p id="c"></p><script>document.getElementById("c").textContent = document.cookie</script>`);
    if (path === "/thanks-data") return res.writeHead(200, { "content-type": "text/plain", "access-control-allow-origin": "*" }).end("thanks-data");
    return html("Hello");
  });
  // A WebSocket that accepts and counts frames. context.route never sees one.
  server.on("upgrade", (req, sock) => {
    const host = (req.headers.host ?? "").startsWith("localhost") ? "off" : "site"; hits.push(`${host} WEBSOCKET ${req.url}`);
    const accept = createHash("sha1").update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    sock.on("data", () => hits.push(`${host} FRAME ${req.url}`)); sock.on("error", () => {});
    sockets.add(sock); sock.on("close", () => sockets.delete(sock));
  });
  await new Promise<void>(r => server.listen({ port: 0, host: "::", ipv6Only: false }, r));
  const port = (server.address() as AddressInfo).port; site = `http://127.0.0.1:${port}`; off = `http://localhost:${port}`;
});
afterAll(async () => { for (const k of sockets) k.destroy(); await new Promise<void>(r => server.close(() => r())); });

for (const name of engines) describe(name, () => {
  let browser: Browser;
  beforeAll(async () => { browser = await ENGINES[name].launch(); });
  afterAll(async () => { await browser?.close(); });
  /** A context like a walk's, the guard on it, and one page at `path`. */
  async function walk(mode: "read-only" | "transact", path: string, fn: (p: Page, blocked: Blocked[], errors: GuardError[]) => Promise<void>) {
    const ctx = await browser.newContext({ ...contextOptions("desktop", "en", { network: "fast" } as any), acceptDownloads: true });
    const blocked: Blocked[] = []; const errors: GuardError[] = []; hits.length = 0;
    try {
      await installGuard(ctx, { mode, origins: [site], onBlocked: b => blocked.push(b), onError: e => errors.push(e) });
      const p = await ctx.newPage(); await p.goto(site + path); await fn(p, blocked, errors);
    } finally { await ctx.close(); }
  }
  const leftFor = (blocked: Blocked[], path: string) => blocked.find(b => b.why === "left-site" && b.url === off + path);

  test("a target=_blank link to an off-list origin is blocked and recorded", async () => {
    await walk("read-only", "/popup-link", async (p, blocked) => {
      await p.click("text=Partner", { noWaitAfter: true }); // Chromium closes a pop-up whose first navigation fails, with no popup event
      await expect.poll(() => leftFor(blocked, "/offsite-popup")).toMatchObject({ method: "GET" });
      expect(hit("off GET /offsite-popup")).toBe(false);
    });
  });
  test("window.open to an off-list origin is blocked and recorded", async () => {
    await walk("read-only", "/window-open", async (p, blocked) => {
      await p.click("text=Open", { noWaitAfter: true }); // Chromium closes a pop-up whose first navigation fails, with no popup event
      await expect.poll(() => leftFor(blocked, "/offsite-open")).toBeTruthy();
      expect(hit("off GET /offsite-open")).toBe(false);
    });
  });
  test("a form with target=_blank to an off-list origin is blocked and recorded", async () => {
    await walk("read-only", "/form-blank", async (p, blocked) => {
      await p.click("text=Go", { noWaitAfter: true }); // Chromium closes a pop-up whose first navigation fails, with no popup event
      await expect.poll(() => blocked.find(b => b.why === "left-site" && b.url.startsWith(off + "/offsite-form"))).toBeTruthy();
      expect(hit("off GET /offsite-form")).toBe(false);
    });
  });
  test("a meta refresh to an off-list origin is blocked", async () => {
    await walk("read-only", "/", async (p, blocked) => {
      await p.goto(site + "/meta-off").catch(() => {});
      await expect.poll(() => leftFor(blocked, "/offsite-meta")).toBeTruthy();
      expect(hit("off GET /offsite-meta")).toBe(false);
    });
  });
  test("a link in a frame that targets the top page is blocked", async () => {
    await walk("read-only", "/frame", async (p, blocked) => {
      await p.frameLocator("iframe").locator("#top").click({ noWaitAfter: true });
      await expect.poll(() => leftFor(blocked, "/offsite-top")).toBeTruthy();
      expect(hit("off GET /offsite-top")).toBe(false);
    });
  });
  test("a download link to an off-list origin does not reach it", async () => {
    await walk("read-only", "/download", async (p, blocked) => {
      await p.click("text=Get", { noWaitAfter: true });
      await expect.poll(() => leftFor(blocked, "/offsite-file")).toBeTruthy();
      expect(hit("off GET /offsite-file")).toBe(false);
    });
  });
  test("a service worker never becomes ready or controls a walk's page", async () => {
    // Spec 3.1: with workers allowed, a WebKit worker's POST skipped the route. contextOptions blocks them.
    await walk("read-only", "/sw", async p => {
      const ready = await p.evaluate(() => Promise.race([
        navigator.serviceWorker ? navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready).then(() => "ready", () => "refused") : Promise.resolve("no api"),
        new Promise(r => setTimeout(() => r("not ready"), 2_000))]));
      expect(ready).not.toBe("ready");
      await p.reload();
      expect(await p.evaluate(() => !!navigator.serviceWorker?.controller)).toBe(false);
    });
  });
  test("a WebSocket to an off-list origin is blocked and recorded; one to the site opens", async () => {
    await walk("transact", "/", async (p, blocked) => {
      const open = (u: string) => p.evaluate(u => new Promise<string>(r => {
        const w = new WebSocket(u); w.onopen = () => { w.send("x"); setTimeout(() => r("open"), 200); }; w.onerror = () => r("error"); w.onclose = () => r("closed");
      }), u);
      expect(await open(off.replace("http", "ws") + "/socket")).not.toBe("open");
      expect(hits.filter(h => h.startsWith("off "))).toEqual([]);
      expect(blocked).toEqual([expect.objectContaining({ why: "background-write", method: "WEBSOCKET", url: off.replace("http", "ws") + "/socket" })]);
      expect(await open(site.replace("http", "ws") + "/socket")).toBe("open");
      await expect.poll(() => hit("site FRAME /socket")).toBe(true);
    });
  });
  test("a POST answered by a redirect to an off-list origin is blocked as left-site, and recorded as having reached the site", async () => {
    await walk("transact", "/post-off-form", async (p, blocked) => {
      await p.click("text=Send", { noWaitAfter: true });
      await expect.poll(() => leftFor(blocked, "/offsite-after-post")).toMatchObject({
        method: "GET", redirect_status: 303, reached: { method: "POST", url: site + "/post-off", status: 303 } });
      expect(hit("site POST /post-off")).toBe(true);
      expect(hit("off GET /offsite-after-post")).toBe(false);
    });
  });
  test("a POST answered by an allowed redirect lands on its page, with its cookie", async () => {
    await walk("transact", "/post-on-form", async (p, blocked, errors) => {
      await p.click("text=Send");
      await p.waitForURL(site + "/thanks?a=1&b=2");
      await expect(p.textContent("h1")).resolves.toBe("Thanks");
      await expect.poll(() => p.textContent("#c")).toContain("sent=yes");
      expect(blocked).toEqual([]); expect(errors).toEqual([]);
    });
  });
  test("a POST from a form with target=_blank to the site still works in transact mode", async () => {
    await walk("transact", "/post-blank-form", async (p, blocked) => {
      const [tab] = await Promise.all([p.waitForEvent("popup"), p.click("text=Send")]);
      await tab.waitForURL(site + "/thanks?a=1&b=2");
      expect(blocked).toEqual([]);
    });
  });
  test("a script's POST answered by an allowed redirect gets the page it leads to", async () => {
    await walk("transact", "/", async (p, blocked, errors) => {
      const body = await p.evaluate(() => fetch("/fetch-on", { method: "POST", body: "x" }).then(r => r.text()));
      expect(body).toBe("thanks-data"); expect(blocked).toEqual([]); expect(errors).toEqual([]);
    });
  });
  test("a script's POST answered by a redirect off the list does not follow it", async () => {
    await walk("transact", "/", async (p, blocked) => {
      await p.evaluate(() => fetch("/fetch-off", { method: "POST", body: "x" }).catch(() => {}));
      expect(hit("site POST /fetch-off")).toBe(true);
      expect(blocked).toEqual([expect.objectContaining({ why: "background-write", method: "GET", url: off + "/thanks-data", redirect_status: 303,
        reached: { method: "POST", url: site + "/fetch-off", status: 303 } })]);
      expect(hits.filter(h => h === "off GET /thanks-data")).toEqual([]);
    });
  });
  test("a script's POST whose redirects never end is recorded as having reached the site", async () => {
    await walk("transact", "/", async (p, blocked, errors) => {
      await p.evaluate(() => fetch("/fetch-loop", { method: "POST", body: "x" }).catch(() => {}));
      expect(blocked).toEqual([]);
      expect(errors).toEqual([expect.objectContaining({ method: "POST", url: site + "/fetch-loop", error: "more than 10 redirects",
        reached: { method: "POST", url: site + "/fetch-loop", status: 303 } })]);
    });
  });
  test("a write that reached the site is recorded when its page then goes away", async () => {
    await walk("transact", "/slow-form", async (p, _b, errors) => {
      await p.click("text=Send", { noWaitAfter: true });
      await expect.poll(() => hit("site POST /slow-post")).toBe(true);
      await p.close();
      await expect.poll(() => errors[0]).toMatchObject({ method: "POST", url: site + "/slow-post", reached: { method: "POST", url: site + "/slow-post", status: 303 } });
    });
  });
});
