import { test, expect } from "vitest";
import { chromium } from "playwright";
import { perceive } from "../src/browser/perceive.js";

test("full names keep distinct identities behind masked display text, and the page is left as it was", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage(); const prefix = "A".repeat(125);
    await page.setContent(`<button>${prefix} one</button><button>${prefix} two</button><button>one@example.org</button><button>two@example.org</button>`);
    const first = await perceive(page, { mask: true, moves: [], tabCount: 1 });
    const second = await perceive(page, { mask: true, moves: [], tabCount: 1 });
    expect(first.options[0].key).not.toBe(first.options[1].key);
    expect(first.options[2].name).toBe("[masked]"); expect(first.options[3].name).toBe("[masked]");
    expect(first.options[2].key).not.toBe(first.options[3].key);
    expect(first.state).toBe(second.state);
    expect(await page.locator("button").nth(2).innerText()).toBe("one@example.org");
  } finally { await browser.close(); }
});

