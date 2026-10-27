import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import type { AddressInfo } from "node:net";
const ROOT = join(import.meta.dirname, "../fixtures/site");
export async function serve() {
  const posts: string[] = [];
  const srv = createServer(async (req, res) => {
    let path = (req.url ?? "/").split("?")[0];
    // /delay/<ms>/<file> serves <file> after <ms> milliseconds.
    const delay = /^\/delay\/(\d+)(\/.*)$/.exec(path);
    if (delay) { await new Promise(r => setTimeout(r, Number(delay[1]))); path = delay[2]; }
    // A made-up Firestore read channel answers with data; a read endpoint that redirects with 307 carries the body on.
    if (req.method === "POST" && path.endsWith("/google.firestore.v1.Firestore/Listen/channel")) {
      posts.push(path); res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" }).end('{"leaders":3}'); return;
    }
    if (req.method === "POST" && path === "/redirect-read") { posts.push(path); res.writeHead(307, { location: "/elsewhere" }).end(); return; }
    if (req.method !== "GET" && req.method !== "HEAD") { posts.push(path); res.writeHead(303, { location: "/thanks.html" }).end(); return; }
    try {
      const body = await readFile(join(ROOT, path === "/" ? "index.html" : path));
      res.writeHead(200, { "content-type": extname(path) === ".png" ? "image/png" : "text/html; charset=utf-8" }).end(body);
    } catch { res.writeHead(404).end("not found"); }
  });
  await new Promise<void>(r => srv.listen({ port: 0, host: "::", ipv6Only: false }, r));
  const port = (srv.address() as AddressInfo).port;
  return { url: `http://127.0.0.1:${port}/`, otherOrigin: `http://localhost:${port}`, posts,
    close: () => new Promise<void>(r => srv.close(() => r())) };
}
