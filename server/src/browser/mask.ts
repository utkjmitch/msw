// mask.ts (pure part; Task 7 adds maskPage and maskLocators to this file)
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu;
const PHONE = /\+?\d[\d\s().-]{5,}\d/g;
const STREET = /\b\d{1,6}\s+(?:[\p{L}.'-]+\s+){1,4}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive|Calle|Avenida)\b\.?/gu;
export function maskText(s: string): string {
  return s.replace(EMAIL, "[masked]").replace(STREET, "[masked]")
    .replace(PHONE, m => (m.replace(/\D/g, "").length >= 7 ? "[masked]" : m));
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
export const maskLocators = (page: Page): Locator[] =>
  [page.locator("input[type=password]"), page.locator('[autocomplete^="cc-"]')];
