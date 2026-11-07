import { createHash } from "node:crypto";
import type { Page } from "playwright";
import { collectOptions, NAME_DISPLAY_MAX, type Option } from "./options.js";
import { maskPage, maskLocators, maskText } from "./mask.js";
import type { Move } from "../formats/schemas.js";
import { withHelpers } from "./screen.js";
const SCREEN_TEXT = withHelpers(h => h.screenText());
// A field counts when some of it shows: on the screen, and inside every box that clips it, as for the text.
const FIELD_VALUES = withHelpers(h => [...document.querySelectorAll("input, textarea, select")].flatMap(el => {
  const f = el as HTMLInputElement; if (f.type === "hidden" || f.type === "password") return [];
  const st = getComputedStyle(f); if (st.visibility === "hidden" || st.display === "none" || !h.shown(f)) return [];
  return [["checkbox", "radio"].includes(f.type) ? String(f.checked)
    : f.tagName === "SELECT" ? [...(f as unknown as HTMLSelectElement).selectedOptions].map(x => x.value).join("\u0000") : f.value];
}));
export type { Option };
/**
 * fields: a digest of what the visible fields hold, for the patience check only (spec 5.4: typed text is visible).
 * It stays in memory: no record, log or result carries it, and the state is the same before and after typing.
 */
export interface Perception { png: Buffer; text: string; url: string; options: Option[]; state: string; fields: string }
export const optionLine = (o: Option) => (o.kind === "move" ? `${o.n}. ${o.name}` : `${o.n}. [${o.role}] ${o.name}`);
export async function perceive(page: Page, o: { mask: boolean; moves: Move[]; tabCount: number; maskSelectors?: string[]; links?: string[] }): Promise<Perception> {
  // Names are read from the page as it is, so each control keeps its own identity. Masking is for display only.
  const options = await collectOptions(page, o.moves, o.tabCount, o.links);
  // Mask the full name before cutting it, so a cut never splits an address out of reach of the mask.
  if (o.mask) for (const option of options) if (option.kind !== "move" && !option.unlabeled) option.name = maskText(option.key).slice(0, NAME_DISPLAY_MAX);
  // Text cut off by the screen's edge, or by the edge of a box that clips it, is not on screen.
  let text = await page.evaluate(SCREEN_TEXT);
  if (o.mask) text = maskText(text);
  // What the visible fields hold, read the same way as the text. A password field is left out, as it always was.
  const values = await page.evaluate(FIELD_VALUES);
  const fields = createHash("sha256").update(JSON.stringify(values)).digest("hex");
  // The page is masked only for the screenshot, then put back, so the next look reads the same names.
  const restore = o.mask ? await maskPage(page) : undefined;
  let png: Buffer;
  try { png = await page.screenshot({ mask: maskLocators(page, o.maskSelectors) }); }
  finally { await restore?.(); }
  const url = page.url();
  // The state hashes full, unmasked names, so two controls that differ only in masked text are still two pages.
  // Only the hash is written out, never the names.
  const state = createHash("sha256").update([url, text, options.map(x => `${x.role}:${x.key}`).join("|")].join("\n")).digest("hex");
  return { png, text, url, options, state, fields };
}
