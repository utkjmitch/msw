import { createHash } from "node:crypto";
import type { Page } from "playwright";
import { collectOptions, type Option } from "./options.js";
import { maskPage, maskLocators, maskText } from "./mask.js";
import type { Move } from "../formats/schemas.js";
export type { Option };
export interface Perception { png: Buffer; text: string; url: string; options: Option[]; state: string }
export const optionLine = (o: Option) => (o.kind === "move" ? `${o.n}. ${o.name}` : `${o.n}. [${o.role}] ${o.name}`);
export async function perceive(page: Page, o: { mask: boolean; moves: Move[]; tabCount: number }): Promise<Perception> {
  if (o.mask) await maskPage(page);
  const options = await collectOptions(page, o.moves, o.tabCount);
  let text = await page.evaluate(() => {
    const out: string[] = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n: Node | null;
    while ((n = w.nextNode())) {
      const t = (n.textContent ?? "").replace(/\s+/g, " ").trim(); const el = n.parentElement;
      if (!t || !el || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
      const st = getComputedStyle(el); if (st.visibility === "hidden" || st.display === "none") continue;
      const r = el.getBoundingClientRect(); if (r.width === 0 || r.bottom <= 0 || r.top >= innerHeight) continue;
      out.push(t);
    }
    return out.join("\n");
  });
  if (o.mask) text = maskText(text);
  const png = await page.screenshot({ mask: o.mask ? maskLocators(page) : [] });
  const url = page.url();
  const state = createHash("sha256").update([url, text, options.map(x => `${x.role}:${x.name}`).join("|")].join("\n")).digest("hex");
  return { png, text, url, options, state };
}
