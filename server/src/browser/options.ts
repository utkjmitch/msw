import type { Page, ElementHandle } from "playwright";
import { PAYMENT_SELECTOR } from "./mask.js";
import { readingOrder } from "./order.js";
import { withHelpers, type Box } from "./screen.js";
import type { Move } from "../formats/schemas.js";
export type MoveId = "scroll-down" | "scroll-up" | "scroll-right" | "scroll-left" | "back" | "reload" | "switch-tab" | "wait" | "open-link";
/** Names longer than this are cut for display only. Identity and the page state use the full name. */
export const NAME_DISPLAY_MAX = 120;
/** kind "area": a scroll area, a box that scrolls by itself. It takes a direction (how: scroll-right and so on), never a tap.
 * name: what the Walker sees. key: the full, unmasked name, kept in memory for replay and never written out. */
export interface Option { n: number; kind: "element" | "area" | "move"; role: string; name: string; key: string; unlabeled: boolean; inputType?: string; autocomplete?: string; payment?: boolean; move?: MoveId; link?: number; handle?: ElementHandle }
// Cut to the screen and to any box that clips it: a link scrolled out of sight inside a box is not on screen.
const visible = withHelpers((h, el: Element) => {
  const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && h.shown(el) !== null;
});
const areasOnScreen = withHelpers(h => [...document.body.querySelectorAll("*")].filter(el => h.isArea(el) && h.shown(el) !== null)
  .map(el => ({ el, box: h.shown(el)!, name: h.areaName(el) })));
const SELECTOR = "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=checkbox], [role=radio], [role=switch]";
/** links: the labels of the links the person was handed, in the journey's order. */
export async function collectOptions(page: Page, moves: Move[], tabCount: number, links: string[] = []): Promise<Option[]> {
  const found: { h: ElementHandle; kind: "element" | "area"; box: Box; name: string; role: string; type: string; autocomplete: string; payment: boolean }[] = [];
  for (const h of await page.$$(SELECTOR)) {
    if (!(await h.evaluate(visible))) continue;
    const info = await h.evaluate((el: Element, paymentSelector: string) => {
      const r = el.getBoundingClientRect();
      const ids = el.getAttribute("aria-labelledby");
      const byIds = ids ? ids.split(/\s+/).map(i => document.getElementById(i)?.textContent ?? "").join(" ") : "";
      const forLabel = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent ?? "" : "";
      const wrapped = el.closest("label")?.textContent ?? "";
      const html = el as HTMLElement & { value?: string; type?: string };
      const name = (el.getAttribute("aria-label") || byIds || forLabel || wrapped || html.innerText
        || el.querySelector("img")?.getAttribute("alt") || el.getAttribute("title") || el.getAttribute("placeholder")
        || (html.type === "submit" ? html.value : "") || "").replace(/\s+/g, " ").trim();
      const tag = el.tagName.toLowerCase(); const type = (html.type ?? "").toLowerCase();
      const role = el.getAttribute("role") || (tag === "a" ? "link"
        : tag === "button" || (tag === "input" && ["submit", "button"].includes(type)) ? "button"
        : tag === "select" ? "combobox" : tag === "textarea" ? "textbox"
        : tag === "input" ? (["checkbox", "radio"].includes(type) ? type : "textbox") : tag);
      return { box: { x: r.x, y: r.y, w: r.width, h: r.height }, name, role, type, autocomplete: (el.getAttribute("autocomplete") ?? "").toLowerCase(),
        payment: el.matches(paymentSelector) };
    }, PAYMENT_SELECTOR);
    found.push({ h, kind: "element", ...info });
  }
  // Scroll areas are options of their own, so a Walker can scroll a wide table or a map that has no controls.
  const areas = await page.evaluateHandle(areasOnScreen);
  try {
    for (const [i, a] of (await areas.evaluate(list => list.map(x => ({ box: x.box, name: x.name })))).entries()) {
      const h = (await areas.evaluateHandle((list, i) => list[i].el, i)).asElement();
      if (h) found.push({ h, kind: "area", box: a.box, name: a.name, role: "scroll area", type: "", autocomplete: "", payment: false });
    }
  } finally { await areas.dispose(); }
  const opts: Option[] = readingOrder(found.map(f => f.box)).map((i, k) => {
    const f = found[i];
    return { n: k + 1, kind: f.kind, role: f.role, name: f.name.slice(0, NAME_DISPLAY_MAX) || `[unlabeled ${f.role}]`, key: f.name, unlabeled: !f.name, inputType: f.type, autocomplete: f.autocomplete, payment: f.payment, handle: f.h };
  });
  // The sideways moves are always there, like scroll down: a person can always try to swipe or scroll sideways,
  // and offering them only on a wide page would tell the Walker what the screen may not.
  const fixed: MoveId[] = ["scroll-down", "scroll-up", "scroll-right", "scroll-left", "back"];
  if (moves.includes("reload")) fixed.push("reload");
  if (moves.includes("switch-tab") && tabCount > 1) fixed.push("switch-tab");
  if (moves.includes("wait")) fixed.push("wait");
  for (const m of fixed) opts.push({ n: opts.length + 1, kind: "move", role: "move", name: m.replace("-", " "), key: m, unlabeled: false, move: m });
  links.forEach((label, i) => opts.push({ n: opts.length + 1, kind: "move", role: "move", name: `open link: ${label}`, key: `open-link:${label}`, unlabeled: false, move: "open-link", link: i }));
  return opts;
}
