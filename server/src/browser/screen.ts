// screen.ts: what is on the screen, in page functions. A page function runs in the browser and cannot call out,
// so the helpers it needs are passed in with it (withHelpers).
export interface Box { x: number; y: number; w: number; h: number }
export type Direction = "right" | "left" | "down" | "up";
/**
 * The part of an element a person can see: its box cut to the screen and to every box around it that clips
 * (overflow other than visible). An absolute element is cut only by the boxes it is placed in, a fixed one by none.
 * Null when nothing of it shows.
 */
const shown = (el: Element): Box | null => {
  const r = el.getBoundingClientRect();
  let x1 = Math.max(r.left, 0), y1 = Math.max(r.top, 0), x2 = Math.min(r.right, innerWidth), y2 = Math.min(r.bottom, innerHeight);
  let pos = getComputedStyle(el).position;
  for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
    if (pos === "fixed") break;
    const st = getComputedStyle(a);
    if (pos === "absolute" && st.position === "static" && st.transform === "none") continue;
    pos = st.position;
    const b = a.getBoundingClientRect();
    if (st.overflowX !== "visible") { x1 = Math.max(x1, b.left + a.clientLeft); x2 = Math.min(x2, b.left + a.clientLeft + a.clientWidth); }
    if (st.overflowY !== "visible") { y1 = Math.max(y1, b.top + a.clientTop); y2 = Math.min(y2, b.top + a.clientTop + a.clientHeight); }
  }
  return x2 - x1 >= 1 && y2 - y1 >= 1 ? { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } : null;
};
/** A scroll area: a box that scrolls by itself (overflow auto or scroll) and holds more than it shows. The page is not one. */
const isArea = (el: Element): boolean => {
  // A text box that scrolls is already an option of its own.
  if (el === document.body || el === document.documentElement || el.tagName === "TEXTAREA") return false;
  const st = getComputedStyle(el);
  return st.visibility !== "hidden" && ((["auto", "scroll"].includes(st.overflowX) && el.scrollWidth > el.clientWidth + 1)
    || (["auto", "scroll"].includes(st.overflowY) && el.scrollHeight > el.clientHeight + 1));
};
/** A scroll area's name: its label, else a heading or caption inside it. Read whole, so it stays the same as the area scrolls. */
const areaName = (el: Element): string => {
  const ids = el.getAttribute("aria-labelledby");
  const byIds = ids ? ids.split(/\s+/).map(i => document.getElementById(i)?.textContent ?? "").join(" ") : "";
  const inner = el.querySelector("caption, figcaption, legend, h1, h2, h3, h4, h5, h6")?.textContent ?? "";
  return (el.getAttribute("aria-label") || byIds || el.getAttribute("title") || inner || "").replace(/\s+/g, " ").trim();
};
/** The visible text on the screen (or inside root), one line per text node, in document order. */
const screenText = (root?: Element): string => {
  const out: string[] = []; const w = document.createTreeWalker(root ?? document.body, NodeFilter.SHOW_TEXT); let n: Node | null;
  while ((n = w.nextNode())) {
    const t = (n.textContent ?? "").replace(/\s+/g, " ").trim(); const el = n.parentElement;
    if (!t || !el || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
    const st = getComputedStyle(el); if (st.visibility === "hidden" || st.display === "none") continue;
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0 || !shown(el)) continue;
    out.push(t);
  }
  return out.join("\n");
};
/** Where content runs past the visible area, and what on screen shows the way there. */
export interface Overflow { where: string; scrolls: boolean; past: Partial<Record<Direction, number>>; cues: { scrollbar: Direction[]; cut_off: Direction[]; control: string[] } }
/**
 * For the page, each scroll area on screen and each box on screen that cuts off what it holds (overflow hidden, as a
 * carousel does): how far content runs past each edge of what shows, and the cues a person could see. A scrollbar is a
 * cue when one is drawn (touch: whether the walk is on a touch screen). Cut off is a piece of text, an image or a box with a background or border that crosses the edge.
 * A control is a guess by name: a visible button or link in or beside the box named like next, previous, more or an arrow,
 * or one that names the box in aria-controls.
 */
const overflowScan = (touch = false): Overflow[] => {
  const out: Overflow[] = []; const de = document.documentElement;
  const page = { el: de, where: "page", scrolls: true,
    v: { x1: 0, y1: 0, x2: de.clientWidth, y2: de.clientHeight },
    pos: { x: Math.abs(scrollX), y: scrollY }, size: { w: de.scrollWidth, h: de.scrollHeight }, client: { w: de.clientWidth, h: de.clientHeight },
    // A touch screen draws no page scrollbar until you scroll; its window can also be wider than the page's box when zoomed out.
    bars: { h: !touch && innerHeight - de.clientHeight > 0, v: !touch && innerWidth - de.clientWidth > 0 },
    axes: { x: !["hidden", "clip"].includes(getComputedStyle(de).overflowX) && !["hidden", "clip"].includes(getComputedStyle(document.body).overflowX),
      y: !["hidden", "clip"].includes(getComputedStyle(de).overflowY) && !["hidden", "clip"].includes(getComputedStyle(document.body).overflowY) } };
  const boxes = [page];
  for (const el of document.body.querySelectorAll("*")) {
    if (boxes.length > 20) break;
    const st = getComputedStyle(el); if (st.overflowX === "visible" && st.overflowY === "visible") continue;
    if (el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1) continue;
    const area = isArea(el); const b = shown(el);
    if (!b || (!area && (b.w < 50 || b.h < 50)) || el.tagName === "TEXTAREA") continue;
    const r = el.getBoundingClientRect(); const x0 = r.left + el.clientLeft, y0 = r.top + el.clientTop;
    boxes.push({ el: el as HTMLElement, where: `${area ? "scroll area" : "clipped"}: ${areaName(el) || "[unlabeled]"}`, scrolls: area,
      v: { x1: Math.max(x0, b.x), y1: Math.max(y0, b.y), x2: Math.min(x0 + el.clientWidth, b.x + b.w), y2: Math.min(y0 + el.clientHeight, b.y + b.h) },
      pos: { x: Math.abs(el.scrollLeft), y: el.scrollTop }, size: { w: el.scrollWidth, h: el.scrollHeight }, client: { w: el.clientWidth, h: el.clientHeight },
      bars: { h: (el as HTMLElement).offsetHeight - el.clientHeight - parseFloat(st.borderTopWidth) - parseFloat(st.borderBottomWidth) > 0,
        v: (el as HTMLElement).offsetWidth - el.clientWidth - parseFloat(st.borderLeftWidth) - parseFloat(st.borderRightWidth) > 0 },
      axes: { x: ["auto", "scroll"].includes(st.overflowX), y: ["auto", "scroll"].includes(st.overflowY) } });
  }
  // Pieces of content that could be seen crossing an edge: text, images and the like, and boxes that paint. Only those
  // on screen count. Each belongs to the nearest box around it that clips; the page holds what no box holds.
  const pieces: { owner: Element | null; r: DOMRect }[] = [];
  const onScreen = (r: DOMRect) => r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
  const ownerOf = (start: Element | null) => {
    let o = start;
    while (o && o !== document.body && getComputedStyle(o).overflowX === "visible" && getComputedStyle(o).overflowY === "visible") o = o.parentElement;
    return o === document.body ? null : o;
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t: Node | null;
  while ((t = w.nextNode()) && pieces.length < 4000) {
    if (!(t.textContent ?? "").trim() || !t.parentElement || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(t.parentElement.tagName)) continue;
    const range = document.createRange(); range.selectNodeContents(t); const r = range.getBoundingClientRect();
    if (onScreen(r)) pieces.push({ owner: ownerOf(t.parentElement), r });
  }
  for (const el of document.body.querySelectorAll("*")) {
    if (pieces.length >= 8000) break;
    const r = el.getBoundingClientRect(); if (!onScreen(r)) continue;
    const st = getComputedStyle(el);
    const paints = ["IMG", "SVG", "CANVAS", "VIDEO", "IFRAME", "INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(el.tagName.toUpperCase())
      || st.backgroundImage !== "none" || !/rgba\(.*,\s*0\)$|transparent/.test(st.backgroundColor) || parseFloat(st.borderLeftWidth) > 0 || parseFloat(st.borderTopWidth) > 0;
    if (paints) pieces.push({ owner: ownerOf(el.parentElement), r });
  }
  const controls = [...document.body.querySelectorAll("a[href], button, [role=button]")].filter(c => shown(c));
  for (const b of boxes) {
    const past: Partial<Record<Direction, number>> = {};
    const right = b.size.w - b.client.w - b.pos.x, down = b.size.h - b.client.h - b.pos.y;
    if (b.axes.x && right > 1) past.right = Math.round(right);
    if (b.axes.x && b.pos.x > 1) past.left = Math.round(b.pos.x);
    if (b.axes.y && down > 1) past.down = Math.round(down);
    if (b.axes.y && b.pos.y > 1) past.up = Math.round(b.pos.y);
    if (!b.scrolls) { if (right > 1) past.right = Math.round(right); if (down > 1) past.down = Math.round(down); }
    const dirs = Object.keys(past) as Direction[]; if (!dirs.length) continue;
    const scrollbar = dirs.filter(d => (d === "right" || d === "left" ? b.bars.h : b.bars.v));
    const cut = new Set<Direction>();
    for (const p of pieces) {
      if (p.owner !== (b.el === de ? null : b.el)) continue;
      if (!(p.r.right > b.v.x1 && p.r.left < b.v.x2 && p.r.bottom > b.v.y1 && p.r.top < b.v.y2)) continue;
      if (p.r.right > b.v.x2 + 4) cut.add("right"); if (p.r.left < b.v.x1 - 4) cut.add("left");
      if (p.r.bottom > b.v.y2 + 4) cut.add("down"); if (p.r.top < b.v.y1 - 4) cut.add("up");
    }
    const control = b.el === de ? [] : controls.filter(c => {
      const r = c.getBoundingClientRect(); const near = r.right > b.v.x1 - 60 && r.left < b.v.x2 + 60 && r.bottom > b.v.y1 - 60 && r.top < b.v.y2 + 60;
      const name = (c.getAttribute("aria-label") || (c as HTMLElement).innerText || c.getAttribute("title") || "").trim();
      return (b.el.id && (c.getAttribute("aria-controls") ?? "").split(/\s+/).includes(b.el.id))
        || (near && /\b(next|prev|previous|more|scroll|forward|right|left)\b|[›»→←‹«]/i.test(name));
    }).slice(0, 3).map(c => (c.getAttribute("aria-label") || (c as HTMLElement).innerText || c.getAttribute("title") || "").replace(/\s+/g, " ").trim().slice(0, 60));
    out.push({ where: b.where, scrolls: b.scrolls, past, cues: { scrollbar, cut_off: dirs.filter(d => cut.has(d)), control } });
  }
  return out;
};
export const helpers = { shown, isArea, areaName, screenText, overflowScan };
export type Helpers = typeof helpers;
/**
 * Joins a page function to the helpers, so it can call them in the browser. The join is made here in Node, so it works
 * on a page whose content security policy forbids eval. Playwright sends the function's source and calls it with its argument.
 */
export function withHelpers<A extends unknown[], R>(f: (h: Helpers, ...a: A) => R): (...a: A) => R {
  // Each helper is a const of its own name, so one helper can call another.
  const consts = Object.entries(helpers).map(([k, v]) => `const ${k} = ${v.toString()};`).join("\n");
  // A build that keeps function names wraps them in __name, which the page does not have.
  return new Function(`return (...a) => { const __name = (f) => f; ${consts}\nreturn (${f.toString()})({ ${Object.keys(helpers).join(", ")} }, ...a); };`)() as (...a: A) => R;
}
