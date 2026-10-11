import { test, expect } from "vitest";
import { chromium } from "playwright";
test("chromium launches", async () => {
  const b = await chromium.launch();
  try { expect(b.version()).toMatch(/\d+/); } finally { await b.close(); }
});
