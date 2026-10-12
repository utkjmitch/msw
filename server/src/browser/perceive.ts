import { createHash } from "node:crypto";
import type { Page } from "playwright";
import { collectOptions, NAME_DISPLAY_MAX, type Option } from "./options.js";
import { maskPage, maskLocators, maskText } from "./mask.js";
import type { Move } from "../formats/schemas.js";
export type { Option };
export interface Perception { png: Buffer; text: string; url: string; options: Option[]; state: string }
export const optionLine = (o: Option) => (o.kind === "move" ? `${o.n}. ${o.name}` : `${o.n}. [${o.role}] ${o.name}`);
export async function perceive(page: Page, o: { mask: boolean; moves: Move[]; tabCount: number }): Promise<Perception> {
  if (o.mask) await maskPage(page);
  const options = await collectOptions(page, o.moves, o.tabCount);
  // Mask the full name before cutting it, so a cut never splits an address out of reach of the mask.
  if (o.mask) for (const option of options) if (option.kind === "element" && !option.unlabeled) option.name = maskText(option.key).slice(0, NAME_DISPLAY_MAX);
  let text = await page.evaluate(() => {
    const out: string[] = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n: Node | null;
    while ((n = w.nextNode())) {
      const t = (n.textContent ?? "").replace(/\s+/g, " ").trim(); const el = n.parentElement;
      if (!t || !el || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
      const st = getComputedStyle(el); if (st.visibility === "hidden" || st.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
      out.push(t);
    }
    return out.join("\n");
  });
  if (o.mask) text = maskText(text);
  const png = await page.screenshot({ mask: maskLocators(page) });
  const url = page.url();
  // The state uses full names (masked when masking is on), so two long names that differ late are still two pages.
  const full = (x: Option) => (x.kind === "element" && o.mask ? maskText(x.key) : x.key);
  const state = createHash("sha256").update([url, text, options.map(x => `${x.role}:${full(x)}`).join("|")].join("\n")).digest("hex");
  return { png, text, url, options, state };
}
