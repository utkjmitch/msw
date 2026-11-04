import assert from "node:assert/strict";
import { chromium } from "playwright";
import { emulateNetwork } from "../dist/browser/conditions.js";
import { serve } from "../tests/helpers/serve.js";
// Known failing F19 probe. Run after npm run build: npx tsx probes/slow-network.ts
// A pop-up a page script opens is adopted the way the walk adopts it: on the context's page event, after its opener is known.
// Slow-3g then reaches later requests, but the pop-up's first response may already be on its way.
{
  const s = await serve(); const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext(); const first = await ctx.newPage(); const cond = { network: "slow-3g" as const };
    ctx.on("page", async p => { if (await p.opener()) await emulateNetwork(ctx, p, cond); });
    await emulateNetwork(ctx, first, cond); await first.goto(s.url);
    const popup = first.waitForEvent("popup"); await first.evaluate(url => { window.open(url); }, s.url);
    const second = await popup; await second.waitForLoadState("load");
    const load = await second.evaluate(() => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).responseStart);
    assert.ok(load >= 350, `pop-up first response arrived in ${load} ms without slow-3g latency`);
  } finally { await browser.close(); await s.close(); }
}
