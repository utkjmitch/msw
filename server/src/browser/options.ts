import type { Page, ElementHandle } from "playwright";
import { readingOrder } from "./order.js";
import type { Move } from "../formats/schemas.js";
export type MoveId = "scroll-down" | "scroll-up" | "back" | "reload" | "switch-tab" | "wait";
/** Names longer than this are cut for display only. Identity and the page state use the full name. */
export const NAME_DISPLAY_MAX = 120;
/** name: what the Walker sees. key: the full, unmasked name, kept in memory for replay and never written out. */
export interface Option { n: number; kind: "element" | "move"; role: string; name: string; key: string; unlabeled: boolean; inputType?: string; autocomplete?: string; move?: MoveId; handle?: ElementHandle }
const SELECTOR = "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=menuitem], [role=checkbox], [role=radio], [role=switch]";
export async function collectOptions(page: Page, moves: Move[], tabCount: number): Promise<Option[]> {
  const found: { h: ElementHandle; box: { x: number; y: number; w: number; h: number }; name: string; role: string; type: string; autocomplete: string }[] = [];
  for (const h of await page.$$(SELECTOR)) {
    const info = await h.evaluate((el: Element) => {
      const r = el.getBoundingClientRect(); const st = getComputedStyle(el);
      const vis = r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none"
        && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
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
      return { vis, box: { x: r.x, y: r.y, w: r.width, h: r.height }, name, role, type, autocomplete: (el.getAttribute("autocomplete") ?? "").toLowerCase() };
    });
    if (info.vis) found.push({ h, ...info });
  }
  const opts: Option[] = readingOrder(found.map(f => f.box)).map((i, k) => {
    const f = found[i];
    return { n: k + 1, kind: "element", role: f.role, name: f.name.slice(0, NAME_DISPLAY_MAX) || `[unlabeled ${f.role}]`, key: f.name, unlabeled: !f.name, inputType: f.type, autocomplete: f.autocomplete, handle: f.h };
  });
  const fixed: MoveId[] = ["scroll-down", "scroll-up", "back"];
  if (moves.includes("reload")) fixed.push("reload");
  if (moves.includes("switch-tab") && tabCount > 1) fixed.push("switch-tab");
  if (moves.includes("wait")) fixed.push("wait");
  for (const m of fixed) opts.push({ n: opts.length + 1, kind: "move", role: "move", name: m.replace("-", " "), key: m, unlabeled: false, move: m });
  return opts;
}
