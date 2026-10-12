// mask.ts (pure part; Task 7 adds maskPage and maskLocators to this file)
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu;
const PHONE = /\+?\d[\d\s().-]{5,}\d/g;
const STREET = /\b\d{1,6}\s+(?:[\p{L}.'-]+\s+){1,4}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive|Calle|Avenida)\b\.?/gu;
export function maskText(s: string): string {
  return s.replace(EMAIL, "[masked]").replace(STREET, "[masked]")
    .replace(PHONE, m => (m.replace(/\D/g, "").length >= 7 ? "[masked]" : m));
}
/** maskText for any text, including a URL-encoded address such as ?from=pat%40example.org. */
export function maskString(s: string): string {
  let d = s; try { d = decodeURIComponent(s); } catch { d = s; }
  const m = maskText(d); return m === d ? s : m;
}
/** Masks every string inside a record; numbers and other values are left alone. */
export function maskDeep<T>(v: T): T {
  if (typeof v === "string") return maskString(v) as T;
  if (Array.isArray(v)) return v.map(maskDeep) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, maskDeep(x)])) as T;
  return v;
}
import type { Page, Locator } from "playwright";
export async function maskPage(page: Page): Promise<void> {
  await page.evaluate(([email, phone, street]) => {
    const res = [new RegExp(email, "gu"), new RegExp(street, "gu")]; const ph = new RegExp(phone, "g");
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n: Node | null;
    while ((n = w.nextNode())) {
      let t = n.textContent ?? ""; const before = t;
      for (const re of res) t = t.replace(re, "[masked]");
      t = t.replace(ph, m => (m.replace(/\D/g, "").length >= 7 ? "[masked]" : m));
      if (t !== before) n.textContent = t;
    }
  }, [EMAIL.source, PHONE.source, STREET.source]);
}
// Payment fields are known by type: an autocomplete token starting cc-, which may follow section or billing tokens.
export const maskLocators = (page: Page): Locator[] =>
  [page.locator("input[type=password]"), page.locator('[autocomplete*="cc-"]')];
/** Password and payment fields. Values typed into them are always masked, whatever their shape. */
export const isSecretField = (o: { inputType?: string; autocomplete?: string }): boolean =>
  o.inputType === "password" || /(^|\s)cc-/.test(o.autocomplete ?? "");
