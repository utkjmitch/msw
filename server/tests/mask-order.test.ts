import { test, expect } from "vitest";
import { maskText, maskDeep, isSecretField } from "../src/browser/mask.js";
import { readingOrder } from "../src/browser/order.js";
test("masks emails, phones and addresses", () => {
  expect(maskText("Write ana.pérez@example.org or call +1 (215) 555-0134")).toBe("Write [masked] or call [masked]");
  expect(maskText("Visit 1200 Market Street today")).toBe("Visit [masked] today");
  expect(maskText("Calle 5 de Mayo 12")).toBe("Calle 5 de Mayo 12");
});
test("leaves accented and non-Latin text intact", () => {
  const s = "Niños y niñas, ¿cómo están? 日本語 2026 donación de $25";
  expect(maskText(s)).toBe(s);
});
test("reading order: rows then left to right", () => {
  const b = [{ x: 300, y: 10, w: 50, h: 20 }, { x: 10, y: 14, w: 50, h: 20 }, { x: 10, y: 200, w: 50, h: 20 }];
  expect(readingOrder(b)).toEqual([1, 0, 2]);
});
test("payment and password fields are known by type, including sectioned autocomplete tokens", () => {
  expect(isSecretField({ autocomplete: "cc-csc" })).toBe(true);
  expect(isSecretField({ autocomplete: "section-gift billing cc-number" })).toBe(true);
  expect(isSecretField({ inputType: "password" })).toBe(true);
  expect(isSecretField({ inputType: "text", autocomplete: "name" })).toBe(false);
});
test("records are masked string by string, including encoded addresses, and numbers are left alone", () => {
  const r = maskDeep({ url: "https://a.test/?from=pat%40example.org", detail: { text: "call 215 555 0134", lcp: 1234.5678901, ok: true } });
  expect(r).toEqual({ url: "https://a.test/?from=[masked]", detail: { text: "call [masked]", lcp: 1234.5678901, ok: true } });
  expect(maskDeep("https://a.test/ni%C3%B1os")).toBe("https://a.test/ni%C3%B1os");
});
