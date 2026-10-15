// Holds one MCP stdio client to the msw server; exposes POST /call {tool,args} on 127.0.0.1:4999.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
const R = new URL("../../../../", import.meta.url).pathname.replace(/\/$/, "");
const req = createRequire(`${R}/server/package.json`);
const { Client } = await import(req.resolve("@modelcontextprotocol/sdk/client/index.js"));
const { StdioClientTransport } = await import(req.resolve("@modelcontextprotocol/sdk/client/stdio.js"));
const transport = new StdioClientTransport({ command: "node", args: [`${R}/server/dist/mcp/server.js`, "--run", `${R}/walks/pickprophets/2026-10-15-live/run.json`],
  cwd: `${R}/walks/pickprophets/2026-10-15-live`, env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: "/ms-playwright" }, stderr: "inherit" });
const client = new Client({ name: "msw-bridge", version: "0" });
await client.connect(transport);
const tools = await client.listTools();
console.log("tools:", tools.tools.map(t => t.name).join(","));
let n = 0;
createServer(async (rq, rs) => {
  let body = ""; for await (const c of rq) body += c;
  try {
    const { tool, args } = JSON.parse(body);
    const r = await client.callTool({ name: tool, arguments: args ?? {} }, undefined, { timeout: 600000 });
    const out = [];
    for (const c of r.content) {
      if (c.type === "image") { const p = `/tmp/mswbridge/looks/${String(++n).padStart(3, "0")}.png`; writeFileSync(p, Buffer.from(c.data, "base64")); out.push(`[screenshot: ${p}]`); }
      else out.push(c.text);
    }
    rs.end((r.isError ? "ERROR: " : "") + out.join("\n") + "\n");
  } catch (e) { rs.end("BRIDGE ERROR: " + e.message + "\n"); }
}).listen(4999, "127.0.0.1", () => console.log("listening"));
