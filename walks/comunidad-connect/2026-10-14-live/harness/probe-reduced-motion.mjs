// Does the home page ticker stop when the visitor asks for reduced motion? Read-only: one GET per context, no clicks.
// Usage (from the repository root): PLAYWRIGHT_BROWSERS_PATH=/ms-playwright node walks/comunidad-connect/2026-10-14-live/harness/probe-reduced-motion.mjs
const { chromium } = await import('../../../../server/node_modules/playwright/index.mjs');
const b = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
for (const rm of ['no-preference', 'reduce']) {
  const ctx = await b.newContext({ reducedMotion: rm, viewport: { width: 1440, height: 900 } });
  // Like the walk server's read-only mode: no write leaves the browser.
  await ctx.route('**/*', r => (['GET', 'HEAD', 'OPTIONS'].includes(r.request().method()) ? r.continue() : r.abort()));
  const p = await ctx.newPage();
  await p.goto('https://www.comunidadconnect.org/en', { waitUntil: 'load' });
  const seen = new Set();
  for (let i = 0; i < 12; i++) { const t = await p.evaluate(() => document.body.innerText.match(/(New|Story|Featured Story|Bulletin)[^\n]*\n[^\n]*/g)?.slice(0,2).join(' / ')); seen.add(t); await p.waitForTimeout(1000); }
  console.log(rm, seen.size, [...seen].slice(0, 6));
  await ctx.close();
}
await b.close();
