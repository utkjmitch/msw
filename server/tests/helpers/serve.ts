import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import type { AddressInfo } from "node:net";
const ROOT = join(import.meta.dirname, "../fixtures/site");
export async function serve() {
  const posts: string[] = [];
  const srv = createServer(async (req, res) => {
    const path = (req.url ?? "/").split("?")[0];
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
