import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { inspectPage, instrumentFindings, VITALS_INIT, type InstrumentRecord } from "../src/instrument/inquisition.js";
import { serve } from "./helpers/serve.js";
/** A site that changes address inside the page keeps one LCP and one running CLS. A later address must not inherit the first one's. */
let s: Awaited<ReturnType<typeof serve>>; let browser: Browser;
beforeAll(async () => { s = await serve(); browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); await s.close(); });
const ctx = { run: "r", walker: "w", journey: "j", viewport: "desktop" as const, locale: "en-US" };
const at = (recs: InstrumentRecord[]) => recs.map((r, i) => ({ ...r, step: i, event: i + 1 }));

test("a client-side navigation is not judged by the first page's LCP or its layout shift", () => {
  const recs: InstrumentRecord[] = [
    { type: "vitals", url: "https://site.test/", detail: { lcp: 5000, cls: 0.4, inp: 100, doc: "a", first_page: true } },
    { type: "vitals", url: "https://site.test/about", detail: { lcp: 5000, cls: 0.45, inp: 100, doc: "a", first_page: false } },
    { type: "vitals", url: "https://site.test/give", detail: { lcp: 5000, cls: 0.8, inp: 100, doc: "a", first_page: false } },
    { type: "vitals", url: "https://site.test/team", detail: { lcp: 900, cls: 0.1, inp: 100, doc: "b", first_page: true } },
  ];
  const f = instrumentFindings(at(recs), ctx);
  expect(f.map(x => x.title)).toEqual(["Slow or unstable page /", "Slow or unstable page /give"]);
  expect(JSON.parse(f[0].what_happened)).toEqual({ lcp: 5000, cls: 0.4, inp: 100 });
  // On /give the page itself shifted by 0.35; its LCP is the first page's, so it is not reported.
  expect(JSON.parse(f[1].what_happened)).toEqual({ lcp: null, cls: 0.35, inp: 100 });
});
test("the page says whether the address in front of the Walker is the one the document loaded on", async () => {
  const c = await browser.newContext(); await c.addInitScript(VITALS_INIT); const p = await c.newPage();
  try {
    const recs: InstrumentRecord[] = [];
    await p.goto(s.url + "index.html#top"); await inspectPage(p, r => recs.push(r));
    await p.evaluate(() => history.pushState({}, "", "/elsewhere.html")); await inspectPage(p, r => recs.push(r));
    const v = recs.filter(r => r.type === "vitals").map(r => r.detail);
    expect(v.map(d => d.first_page)).toEqual([true, false]);
    expect(v[0].doc).toBe(v[1].doc);
    expect(v.every(d => !("start" in d))).toBe(true);
  } finally { await c.close(); }
});
