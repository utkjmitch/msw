import type { BrowserContext, BrowserContextOptions, Page } from "playwright";
import { VIEWPORTS, type ViewportName } from "../formats/viewports.js";
import type { Conditions } from "../formats/schemas.js";
export function contextOptions(vp: ViewportName, locale: string, c: Conditions, storageState?: string): BrowserContextOptions {
  const v = VIEWPORTS[vp];
  return { viewport: { width: v.width, height: v.height }, isMobile: v.touch, hasTouch: v.touch, locale, serviceWorkers: "block",
    extraHTTPHeaders: { "Accept-Language": locale }, colorScheme: c.color_scheme ?? "light",
    reducedMotion: c.reduced_motion ? "reduce" : "no-preference", ...(storageState ? { storageState } : {}) };
}
export async function setupConditions(context: BrowserContext, page: Page, c: Conditions): Promise<string[]> {
  const notes: string[] = [];
  if (c.network === "slow-3g") {
    const cdp = await context.newCDPSession(page); await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: 64_000, uploadThroughput: 64_000 });
  }
  if (c.text_scale) {
    await context.addInitScript(`document.addEventListener("DOMContentLoaded",()=>{document.documentElement.style.fontSize="${c.text_scale}%"})`);
    notes.push(`text scale ${c.text_scale}% is applied as a root font-size change; it matches browser text zoom only for sites sized in rem or em`);
  }
  if (c.cookies === "declined") await context.addInitScript(() => { Object.defineProperty(document, "cookie", { get: () => "", set: () => {} }); });
  if (c.translate) notes.push("browser translation is not emulated; the condition was recorded but not applied");
  return notes;
}
export async function applyStepConditions(context: BrowserContext, page: Page, step: number, c: Conditions): Promise<string[]> {
  const applied: string[] = [];
  if (typeof c.network === "object" && c.network.offline_at_step === step) {
    await context.setOffline(true);
    setTimeout(() => { context.setOffline(false).catch(() => {}); }, c.network.seconds * 1000);
    applied.push("offline");
  }
  if (c.rotate_at_step === step) {
    const v = page.viewportSize(); if (v) await page.setViewportSize({ width: v.height, height: v.width }); applied.push("rotate");
  }
  if (c.expire_session_at_step === step) { await context.clearCookies(); applied.push("expire-session"); }
  if (c.cookies === "declined") await context.clearCookies();
  return applied;
}
