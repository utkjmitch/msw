// The Inspection: a separate process with no shared context. For every page a walk reached, open a fresh browser
// context with the journey's saved login, load the page, and run axe-core (WCAG 2.0-2.2 A and AA, every impact)
// plus a few keyboard and screen-reader checks. Desktop and phone. Writes inspection/results.json.
// Usage: node harness/inspect.mjs   (from anywhere)
import { chromium } from '/wt/msw/msw-mfx-msw-wg-team-walk-1/server/node_modules/playwright/index.mjs';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/wt/msw/msw-mfx-msw-wg-team-walk-1/server/package.json');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const D = '/wt/.msw-walks/workgraph-ai/2026-10-25-demo';
const states = { platform: `${D}/harness/demo-session.json` };
const pages = new Map(); const skipped = new Set(); // url -> { login, walkers:Set }
for (const [base, w] of ['walks', 'pass-2/walks'].flatMap(b => existsSync(`${D}/${b}`) ? readdirSync(`${D}/${b}`).map(w => [b, w]) : [])) {
  const f = `${D}/${base}/${w}/events.jsonl`; if (!existsSync(f)) continue;
  const login = 'platform';
  for (const l of readFileSync(f, 'utf8').trim().split('\n')) {
    const e = JSON.parse(l); if (e.kind !== 'look' || !e.data?.url) continue;
    const u = new URL(e.data.url); u.hash = ''; const key = u.toString();
    if (u.origin !== 'http://localhost:3000') continue;
    if (key.includes('[masked]')) { skipped.add(key); continue; } // the walk server over-masked an id in this address
    if (!pages.has(key)) pages.set(key, { login, walkers: new Set() }); pages.get(key).walkers.add(w);
  }
}
const vps = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844, isMobile: true, hasTouch: true } };
const out = []; const b = await chromium.launch();
for (const [url, info] of pages) for (const [vp, size] of Object.entries(vps)) {
  const { isMobile, hasTouch, ...viewport } = size;
  const c = await b.newContext({ storageState: states[info.login], viewport, isMobile: !!isMobile, hasTouch: !!hasTouch });
  await c.route('**/*', r => r.request().method() === 'GET' || r.request().method() === 'HEAD' ? r.continue() : r.abort()); // read-only: nothing is sent
  const p = await c.newPage(); const rec = { url, viewport: vp, login: info.login, walkers: [...info.walkers] };
  try {
    const r = await p.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); await p.waitForTimeout(1500);
    rec.status = r?.status(); rec.landed = p.url(); rec.signin = /\/login\b/.test(new URL(p.url()).pathname);
    await p.addScriptTag({ content: axeSource });
    const ax = await p.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
      return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })); });
    rec.axe = ax;
    rec.page = await p.evaluate(() => ({
      title: document.title, lang: document.documentElement.lang, h1: [...document.querySelectorAll('h1')].map(h => h.innerText.trim().slice(0, 80)),
      main: !!document.querySelector('main,[role=main]'), nav: document.querySelectorAll('nav,[role=navigation]').length,
      clickableDivs: [...document.querySelectorAll('div[onclick],span[onclick],li[onclick],div[class*=cursor-pointer],tr[class*=cursor-pointer],li[class*=cursor-pointer]')].filter(e => !e.closest('a,button') && e.getAttribute('role') == null && !e.hasAttribute('tabindex')).length,
      unnamedButtons: [...document.querySelectorAll('button,[role=button]')].filter(e => e.offsetParent && !(e.innerText.trim() || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.title)).length,
      svgNoText: [...document.querySelectorAll('svg,canvas')].filter(e => e.getBoundingClientRect().width > 300 && !e.getAttribute('aria-label') && !e.querySelector('title') && e.getAttribute('aria-hidden') !== 'true').length,
    }));
    const tabs = []; for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); tabs.push(await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const s = getComputedStyle(a);
      return { tag: a.tagName.toLowerCase(), name: (a.getAttribute('aria-label') || a.innerText || a.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 50), outline: s.outlineStyle !== 'none' && s.outlineWidth !== '0px', ring: s.boxShadow !== 'none' }; })); }
    rec.firstTabs = tabs;
  } catch (e) { rec.error = String(e.message).split('\n')[0]; }
  out.push(rec); await c.close(); process.stdout.write('.');
}
await b.close(); mkdirSync(`${D}/inspection`, { recursive: true });
writeFileSync(`${D}/inspection/results.json`, JSON.stringify({ skipped: [...skipped], checks: out }, null, 1));
console.log(`\n${pages.size} pages, ${out.length} checks`);
