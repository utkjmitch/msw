import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { chromium } from "playwright";
import { setupConditions, contextOptions } from "../dist/browser/conditions.js";
import { installGuard } from "../dist/browser/guard.js";

// Known failing probe for F15. Run after npm run build: npx tsx probes/declined-cookies.ts
{
  const received: string[] = []; let writes = 0;
  const srv = createServer((req, res) => {
    received.push(req.headers.cookie ?? "");
    if (req.method === "POST") writes++;
    if (req.url === "/") { res.writeHead(302, { location: "/page", "set-cookie": "redirect=yes; Path=/" }).end(); return; }
    res.writeHead(200, { "content-type": "text/html", "set-cookie": "server=yes; Path=/" });
    res.end('<p>Cookies declined</p><script>document.cookie="script=yes;path=/"</script>');
  });
  await new Promise<void>(r => srv.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${(srv.address() as AddressInfo).port}/`; const browser = await chromium.launch();
  try {
    const context = await browser.newContext(contextOptions("desktop", "en-US", { cookies: "declined" }));
    await context.addCookies([{ name: "saved", value: "yes", url }]);
    const page = await context.newPage(); await setupConditions(context, page, { cookies: "declined" });
    await installGuard(context, { mode: "read-only", origins: [url], onBlocked: () => {} });
    await page.goto(url); await page.evaluate(() => fetch("/page").then(() => fetch("/write", { method: "POST" }).catch(() => {})));
    assert.deepEqual(await context.cookies(), []);
    assert.equal(received.every(value => value === ""), true); assert.equal(writes, 0);
    assert.equal(await page.evaluate(() => document.cookie), "");
  } finally { await browser.close(); await new Promise<void>(r => srv.close(() => r())); }
}
