import { test, expect, beforeAll, afterAll, describe } from "vitest";
import { createServer, type Server } from "node:http";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import { chromium, firefox, webkit, type Browser, type BrowserType, type Page } from "playwright";
import { installGuard, type Blocked, type Read, type SocketSend } from "../src/browser/guard.js";
import type { SocketChannel } from "../src/browser/read-channels.js";
import { contextOptions } from "../src/browser/conditions.js";
/**
 * Report D-2: in a read-only walk, a WebSocket to the site opens only when the journey names it in socket_channels.
 * Each case runs on every engine installed here. MSW_ENGINES picks a subset.
 * 127.0.0.1 is the site; localhost on the same port is an origin off the list.
 */
const ENGINES: Record<string, BrowserType> = { chromium, firefox, webkit };
const wanted = (process.env.MSW_ENGINES ?? "chromium,firefox,webkit").split(",").map(x => x.trim()).filter(x => x in ENGINES);
const engines = wanted.filter(e => existsSync(ENGINES[e].executablePath()));

const sockets = new Set<import("node:stream").Duplex>(); let server: Server; let site = ""; let off = ""; let wsSite = ""; let wsOff = "";
const hits: string[] = [];
/** One unmasked text frame from the server: a short message is enough here. */
const frame = (text: string) => Buffer.concat([Buffer.from([0x81, Buffer.byteLength(text)]), Buffer.from(text)]);
beforeAll(async () => {
  server = createServer((_req, res) => res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end("<!doctype html><title>t</title>Hello"));
  // A socket that greets the page and counts the frames it gets. context.route never sees one.
  server.on("upgrade", (req, sock) => {
    const host = (req.headers.host ?? "").startsWith("localhost") ? "off" : "site"; const path = (req.url ?? "/").split("?")[0];
    hits.push(`${host} WEBSOCKET ${path}`);
    const accept = createHash("sha1").update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    sock.write(frame("hello"));
    sock.on("data", () => hits.push(`${host} FRAME ${path}`)); sock.on("error", () => {});
    sockets.add(sock); sock.on("close", () => sockets.delete(sock));
  });
  await new Promise<void>(r => server.listen({ port: 0, host: "::", ipv6Only: false }, r));
  const port = (server.address() as AddressInfo).port;
  site = `http://127.0.0.1:${port}`; off = `http://localhost:${port}`; wsSite = `ws://127.0.0.1:${port}`; wsOff = `ws://localhost:${port}`;
});
afterAll(async () => { for (const k of sockets) k.destroy(); await new Promise<void>(r => server.close(() => r())); });

/** What the page saw: whether its socket opened, the first message it got, and how it ended within 500 ms. */
interface Seen { opened: boolean; message?: string; error: boolean; closed?: number }
const openSocket = (p: Page, url: string) => p.evaluate(u => new Promise<Seen>(r => {
  const seen: Seen = { opened: false, error: false }; const w = new WebSocket(u);
  w.onopen = () => { seen.opened = true; w.send("subscribe:scores"); };
  w.onmessage = m => { seen.message ??= String(m.data); };
  w.onerror = () => { seen.error = true; }; w.onclose = e => { seen.closed = e.code; };
  setTimeout(() => r(seen), 500);
}), url);

for (const name of engines) describe(name, () => {
  let browser: Browser;
  beforeAll(async () => { browser = await ENGINES[name].launch(); });
  afterAll(async () => { await browser?.close(); });
  async function walk(mode: "read-only" | "transact", channels: SocketChannel[], fn: (p: Page, rec: { blocked: Blocked[]; reads: Read[]; sends: SocketSend[] }) => Promise<void>) {
    const ctx = await browser.newContext(contextOptions("desktop", "en", { network: "fast" } as any));
    const rec = { blocked: [] as Blocked[], reads: [] as Read[], sends: [] as SocketSend[] }; hits.length = 0;
    try {
      await installGuard(ctx, { mode, origins: [site], sockets: channels, onBlocked: b => rec.blocked.push(b), onRead: r => rec.reads.push(r), onSocketSend: s => rec.sends.push(s) });
      const p = await ctx.newPage(); await p.goto(site + "/"); await fn(p, rec);
    } finally { await ctx.close(); }
  }

  test("read-only, no socket named: a socket to the site never connects, and the walk records the attempt", async () => {
    await walk("read-only", [], async (p, { blocked, reads }) => {
      const seen = await openSocket(p, wsSite + "/live?token=abc");
      expect(seen.opened).toBe(false);
      expect(hits).toEqual([]);
      expect(blocked).toEqual([{ why: "socket-refused", method: "WEBSOCKET", url: wsSite + "/live?token=abc" }]);
      expect(reads).toEqual([]);
    });
  });
  test("read-only, a socket named on another path is refused all the same", async () => {
    await walk("read-only", [{ origin: wsSite, path: "/other", sends: "forward" }], async (p, { blocked }) => {
      expect((await openSocket(p, wsSite + "/live")).opened).toBe(false);
      expect(hits).toEqual([]);
      expect(blocked).toEqual([expect.objectContaining({ why: "socket-refused", url: wsSite + "/live" })]);
    });
  });
  test("read-only, a named socket connects both ways, and its open and each frame the page sends are recorded", async () => {
    await walk("read-only", [{ origin: wsSite, path: "/live", sends: "forward" }], async (p, { blocked, reads, sends }) => {
      const seen = await openSocket(p, wsSite + "/live?token=abc");
      expect(seen).toMatchObject({ opened: true, message: "hello" });
      await expect.poll(() => hits.includes("site FRAME /live")).toBe(true);
      expect(blocked).toEqual([]);
      expect(reads).toEqual([{ channel: wsSite + "/live", method: "WEBSOCKET", url: wsSite + "/live?token=abc" }]);
      expect(sends).toEqual([{ channel: wsSite + "/live", url: wsSite + "/live?token=abc", bytes: 16, sent: true }]);
    });
  });
  test("read-only, a named socket with sends: drop gets the site's messages but sends nothing, and each dropped frame is recorded", async () => {
    await walk("read-only", [{ origin: wsSite, path: "/live", sends: "drop" }], async (p, { sends }) => {
      const seen = await openSocket(p, wsSite + "/live");
      expect(seen).toMatchObject({ opened: true, message: "hello" });
      expect(hits).toEqual(["site WEBSOCKET /live"]);
      expect(sends).toEqual([{ channel: wsSite + "/live", url: wsSite + "/live", bytes: 16, sent: false }]);
    });
  });
  test("read-only, naming a socket off the list does not open it", async () => {
    await walk("read-only", [{ origin: wsOff, path: "/live", sends: "forward" }], async (p, { blocked }) => {
      expect((await openSocket(p, wsOff + "/live")).opened).toBe(false);
      expect(hits).toEqual([]);
      expect(blocked).toEqual([expect.objectContaining({ why: "background-write", method: "WEBSOCKET", url: wsOff + "/live" })]);
    });
  });
  test("transact: a socket to the site opens without being named, and is not recorded", async () => {
    await walk("transact", [], async (p, { blocked, reads, sends }) => {
      expect(await openSocket(p, wsSite + "/live")).toMatchObject({ opened: true, message: "hello" });
      await expect.poll(() => hits.includes("site FRAME /live")).toBe(true);
      expect([blocked, reads, sends]).toEqual([[], [], []]);
    });
  });
});
