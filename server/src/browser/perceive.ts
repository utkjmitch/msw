import { createHash } from "node:crypto";
import type { Page } from "playwright";
import { collectOptions, NAME_DISPLAY_MAX, type Option } from "./options.js";
import { maskPage, maskLocators, maskText } from "./mask.js";
import type { Move } from "../formats/schemas.js";
export type { Option };
export interface Perception { png: Buffer; text: string; url: string; options: Option[]; state: string }
export const optionLine = (o: Option) => (o.kind === "move" ? `${o.n}. ${o.name}` : `${o.n}. [${o.role}] ${o.name}`);
export async function perceive(page: Page, o: { mask: boolean; moves: Move[]; tabCount: number; maskSelectors?: string[] }): Promise<Perception> {
  // Names are read from the page as it is, so each control keeps its own identity. Masking is for display only.
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
  // The page is masked only for the screenshot, then put back, so the next look reads the same names.
  const restore = o.mask ? await maskPage(page) : undefined;
  let png: Buffer;
  try { png = await page.screenshot({ mask: maskLocators(page, o.maskSelectors) }); }
  finally { await restore?.(); }
  const url = page.url();
  // The state hashes full, unmasked names, so two controls that differ only in masked text are still two pages.
  // Only the hash is written out, never the names.
  const state = createHash("sha256").update([url, text, options.map(x => `${x.role}:${x.key}`).join("|")].join("\n")).digest("hex");
  return { png, text, url, options, state };
}
