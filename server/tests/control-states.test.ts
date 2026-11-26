import { test, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright";
import { collectOptions } from "../src/browser/options.js";
import { optionLine } from "../src/browser/perceive.js";
/** A screen-reader user hears a control's state after its name. The Walker must too, or a pressed amount sounds unchosen. */
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(); });
afterAll(async () => { await browser.close(); });

test("option lines carry the states a screen reader announces, and a plain control carries none", async () => {
  const p = await browser.newPage();
  try {
    await p.setContent(`<button aria-pressed="true">$50</button><button aria-pressed="false">$100</button>
      <label><input type="checkbox" checked> Cover fees</label><label><input type="radio" name="f"> Monthly</label>
      <div role="tab" aria-selected="true">Overview</div><button aria-expanded="false">Menu</button>
      <a href="/give" aria-current="page">Give</a><button disabled>Next</button><input aria-label="Email" aria-invalid="true">
      <button>Plain</button>`);
    const lines = (await collectOptions(p, [], 1)).filter(o => o.kind !== "move").map(optionLine);
    expect(lines).toEqual([
      "1. [button] $50 (pressed)", "2. [button] $100 (not pressed)", "3. [checkbox] Cover fees (checked)", "4. [radio] Monthly (not checked)",
      "5. [tab] Overview (selected)", "6. [button] Menu (collapsed)", "7. [link] Give (current)", "8. [button] Next (unavailable)",
      "9. [textbox] Email (invalid)", "10. [button] Plain"]);
    // Pressing changes what is heard, so the option line changes with it.
    await p.click("text=$100"); await p.evaluate(() => document.querySelectorAll("button")[1].setAttribute("aria-pressed", "true"));
    expect(optionLine((await collectOptions(p, [], 1))[1])).toBe("2. [button] $100 (pressed)");
  } finally { await p.close(); }
});
