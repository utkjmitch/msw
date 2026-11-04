#!/usr/bin/env node
// practice-site.ts: serves the small example site in tests/fixtures/site, so the skills can be practiced
// without walking a real product. Usage: node dist/practice-site.js [--port 4810]
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { pathToFileURL } from "node:url";
import type { AddressInfo } from "node:net";

const ROOT = join(import.meta.dirname, "../tests/fixtures/site");

export async function practiceSite(port = 4810): Promise<{ url: string; server: Server }> {
  const server = createServer(async (req, res) => {
    // Writes are answered as a plain site would: back to the home page. A read-only walk never sends them.
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(303, { location: "/" }).end(); return; }
    const path = normalize((req.url ?? "/").split("?")[0]).replace(/^(\.\.[/\\])+/, "");
    try {
      const body = await readFile(join(ROOT, path === "/" ? "index.html" : path));
      res.writeHead(200, { "content-type": extname(path) === ".png" ? "image/png" : "text/html; charset=utf-8" }).end(body);
    } catch { res.writeHead(404).end("not found"); }
  });
  await new Promise<void>((ok, fail) => { server.once("error", fail); server.listen({ port, host: "127.0.0.1" }, ok); });
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/`, server };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf("--port");
  const { url } = await practiceSite(i >= 0 ? Number(process.argv[i + 1]) : 4810);
  console.log(`practice site at ${url} (Ctrl-C to stop)`);
}
