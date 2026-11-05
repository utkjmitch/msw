import type { Page, ElementHandle } from "playwright";
import { maskPage, maskLocators, maskText } from "./mask.js";
import { withHelpers, type Box } from "./screen.js";
/** At most this many screens in one whole look. A bigger area says how many it has, and the Walker scrolls for the rest. */
export const WHOLE_MAX = 24;
export interface Whole { tiles: Buffer[]; text: string; of: number }
type Spot = { left: number; top: number };
/** Every scroll position, one screen apart, that together show all of it. The last in each row and column is the far end. */
const spots = (size: number, client: number) => {
  const out: number[] = []; const max = Math.max(0, size - client);
  for (let p = 0; p < max; p += client) out.push(p);
  out.push(max); return out;
};
const where = withHelpers((h, el: Element | null) => {
  const s = el ?? document.scrollingElement ?? document.documentElement;
  return { left: s.scrollLeft, top: s.scrollTop, w: s.scrollWidth, h: s.scrollHeight, cw: s.clientWidth, ch: s.clientHeight, box: el ? h.shown(el) : null };
});
const scrollTo = withHelpers((_h, a: { el: Element | null; spot: Spot }) => {
  (a.el ?? document.scrollingElement ?? document.documentElement).scrollTo({ left: a.spot.left, top: a.spot.top, behavior: "instant" });
});
const textIn = withHelpers((h, el: Element | null) => h.screenText(el ?? undefined));
/**
 * A whole look: the screens a person would see by scrolling the page all the way across, at the height it is at now,
 * or by scrolling a scroll area to every corner. Each screen is a real screenshot at a real scroll position, masked the
 * way every look is. The scroll position is put back afterward, so the page is left as the Walker saw it.
 */
export async function wholeLook(page: Page, area: ElementHandle | null, o: { mask: boolean; maskSelectors?: string[] }): Promise<Whole> {
  const el = area as ElementHandle<Element> | null;
  const start = await page.evaluate(where, el);
  const xs = spots(start.w, start.cw);
  // The page is panned across only: down is the Walker's own reading. A scroll area is covered both ways.
  const ys = el ? spots(start.h, start.ch) : [start.top];
  const all: Spot[] = ys.flatMap(top => xs.map(left => ({ left, top })));
  const tiles: Buffer[] = []; const lines: string[] = []; const had = new Set<string>();
  try {
    for (const spot of all.slice(0, WHOLE_MAX)) {
      await page.evaluate(scrollTo, { el, spot });
      // Two frames, so what scrolled into view is painted.
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const box: Box | null = el ? (await page.evaluate(where, el)).box : null;
      if (el && !box) break;
      for (const line of (await page.evaluate(textIn, el)).split("\n")) if (line && !had.has(line)) { had.add(line); lines.push(line); }
      const restore = o.mask ? await maskPage(page) : undefined;
      try { tiles.push(await page.screenshot({ mask: maskLocators(page, o.maskSelectors), ...(box ? { clip: { x: box.x, y: box.y, width: box.w, height: box.h } } : {}) })); }
      finally { await restore?.(); }
    }
  } finally { await page.evaluate(scrollTo, { el, spot: { left: start.left, top: start.top } }).catch(() => {}); }
  const text = lines.join("\n");
  return { tiles, text: o.mask ? maskText(text) : text, of: all.length };
}
