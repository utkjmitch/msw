// mask.ts (pure part; Task 7 adds maskPage and maskLocators to this file)
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu;
const PHONE = /\+?\d[\d\s().-]{5,}\d/g;
const STREET = /\b\d{1,6}\s+(?:[\p{L}.'-]+\s+){1,4}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive|Calle|Avenida)\b\.?/gu;
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;
// Names the run asks to hide (a client's name, a partner's, a person's), as one pattern. One walk per process, so one list.
let NAMES: RegExp | null = null;
/**
 * Sets the names masked as [name] in every screenshot and text record. A space in a name also matches no space,
 * a hyphen, a dot or an underscore, so "Acme Trust" also hides "acmetrust.org" and "acme-trust". Case is ignored.
 */
export function setMaskNames(names: string[]): void {
  const parts = names.map(n => n.trim()).filter(n => n.length >= 2).sort((a, b) => b.length - a.length)
    .map(n => n.split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s._-]*"));
  NAMES = parts.length ? new RegExp(parts.join("|"), "giu") : null;
}
const maskNames = (s: string) => (NAMES ? s.replace(NAMES, "[name]") : s);
export function maskText(s: string): string {
  // A user name and password in a URL are dropped; an IPv4 address is not a phone number.
  return maskNames(s).replace(/(https?:\/\/)[^/\s@]+@/gi, "$1[masked]@")
    .replace(EMAIL, "[masked]").replace(STREET, "[masked]")
    .replace(PHONE, m => (IPV4.test(m) && m.split(".").every(part => Number(part) <= 255) ? m
      : m.replace(/\D/g, "").length >= 7 ? "[masked]" : m));
}
/** maskText for any text, including a URL-encoded address such as ?from=pat%40example.org. */
export function maskString(s: string): string {
  // Each run of escapes is decoded on its own, so a bare percent sign elsewhere cannot stop the decoding.
  const d = s.replace(/(?:%[0-9a-f]{2})+/gi, encoded => { try { return decodeURIComponent(encoded); } catch { return encoded; } });
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
/** Masks personal data in the page's text for a screenshot. Call the returned function to put the text back. */
export async function maskPage(page: Page): Promise<() => Promise<void>> {
  const changes = await page.evaluateHandle(([email, phone, street, names]) => {
    const changed: [Node, string, string][] = [];
    const res = [new RegExp(email, "gu"), new RegExp(street, "gu")]; const ph = new RegExp(phone, "g");
    const nm = names ? new RegExp(names, "giu") : null;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n: Node | null;
    while ((n = w.nextNode())) {
      let t = n.textContent ?? ""; const before = t;
      if (nm) t = t.replace(nm, "[name]");
      for (const re of res) t = t.replace(re, "[masked]");
      t = t.replace(ph, m => (m.replace(/\D/g, "").length >= 7 ? "[masked]" : m));
      if (t !== before) { changed.push([n, before, t]); n.textContent = t; }
    }
    return changed;
  }, [EMAIL.source, PHONE.source, STREET.source, NAMES?.source ?? ""]);
  return async () => {
    try { await changes.evaluate(items => { for (const [node, before, masked] of items) if (node.textContent === masked) node.textContent = before; }); }
    finally { await changes.dispose(); }
  };
}
// Payment fields are known by type: an autocomplete token starting cc-, which may follow section or billing tokens,
// a data-payment attribute, or a card, CVV or CVC field name.
export const PAYMENT_SELECTOR = '[autocomplete*="cc-" i], [data-payment], input[name*="card" i], input[name="cvv" i], input[name="cvc" i]';
/** Password and payment fields, and any elements the run names (a logo, a column of names), boxed out in screenshots. */
export const maskLocators = (page: Page, selectors: string[] = []): Locator[] =>
  [page.locator("input[type=password]"), page.locator(PAYMENT_SELECTOR), ...selectors.map(s => page.locator(s))];
/** Password and payment fields. Values typed into them are always masked, whatever their shape. */
export const isSecretField = (o: { inputType?: string; autocomplete?: string; payment?: boolean }): boolean =>
  o.inputType === "password" || o.payment === true || /(^|\s)cc-/.test(o.autocomplete ?? "");
