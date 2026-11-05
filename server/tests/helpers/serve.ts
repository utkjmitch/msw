import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import type { AddressInfo } from "node:net";
import { createHash } from "node:crypto";
const ROOT = join(import.meta.dirname, "../fixtures/site");
export async function serve() {
  let port = 0; const posts: string[] = []; const offsite: string[] = [];
  const srv = createServer(async (req, res) => {
    let path = (req.url ?? "/").split("?")[0];
    // Requests that reached the origin off the list (localhost on the same port).
    if ((req.headers.host ?? "").startsWith("localhost")) offsite.push(`${req.method} ${path}`);
    // /delay/<ms>/<file> serves <file> after <ms> milliseconds.
    const delay = /^\/delay\/(\d+)(\/.*)$/.exec(path);
    if (delay) { await new Promise(r => setTimeout(r, Number(delay[1]))); path = delay[2]; }
    // A made-up Firestore read channel answers with data; a read endpoint that redirects with 307 carries the body on.
    if (req.method === "POST" && path.endsWith("/google.firestore.v1.Firestore/Listen/channel")) {
      posts.push(path); res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" }).end('{"leaders":3}'); return;
    }
    if (req.method === "POST" && path === "/redirect-read") { posts.push(path); res.writeHead(307, { location: "/elsewhere" }).end(); return; }
    // A form whose confirmation page is on another origin (browser spec 3.3, gap 2).
    if (req.method === "POST" && path === "/send-offsite") { posts.push(path); res.writeHead(303, { location: `http://localhost:${port}/offsite-after-post` }).end(); return; }
    if (req.method !== "GET" && req.method !== "HEAD") { posts.push(path); res.writeHead(303, { location: "/thanks.html" }).end(); return; }
    try {
      const body = await readFile(join(ROOT, path === "/" ? "index.html" : path));
      res.writeHead(200, { "content-type": extname(path) === ".png" ? "image/png" : "text/html; charset=utf-8" }).end(body);
    } catch { res.writeHead(404).end("not found"); }
  });
  // A WebSocket that greets the page with "3-1" and counts the frames it gets (socket channels, report D-2).
  const sockets: string[] = []; const open = new Set<import("node:stream").Duplex>();
  srv.on("upgrade", (req, sock) => {
    const path = (req.url ?? "/").split("?")[0]; sockets.push(`OPEN ${path}`);
    const accept = createHash("sha1").update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    sock.write(Buffer.from([0x81, 3, ...Buffer.from("3-1")]));
    sock.on("data", () => sockets.push(`FRAME ${path}`)); sock.on("error", () => {});
    open.add(sock); sock.on("close", () => open.delete(sock));
  });
  await new Promise<void>(r => srv.listen({ port: 0, host: "::", ipv6Only: false }, r));
  port = (srv.address() as AddressInfo).port;
  return { url: `http://127.0.0.1:${port}/`, otherOrigin: `http://localhost:${port}`, posts, offsite, sockets,
    close: () => new Promise<void>(r => { for (const k of open) k.destroy(); srv.close(() => r()); }) };
}
