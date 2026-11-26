import { readFileSync } from "node:fs";
/**
 * A saved login whose cookie for a journey host has already expired is stale: the site will show its sign-in page or
 * gate, and a Walker never signs in. Returns why, naming the cookie's domain and expiry date but never its name or
 * value, or null when nothing has expired. A session cookie (no expiry) is never stale by date.
 */
export function staleLogin(path: string, origins: string[], now = Date.now()): string | null {
  const state = JSON.parse(readFileSync(path, "utf8")) as { cookies?: { domain: string; expires?: number }[] };
  const hosts = origins.map(o => new URL(o).hostname);
  for (const k of state.cookies ?? []) {
    const domain = k.domain.replace(/^\./, "");
    const covers = hosts.some(h => h === domain || (k.domain.startsWith(".") && h.endsWith(`.${domain}`)));
    if (covers && k.expires !== undefined && k.expires > 0 && k.expires * 1000 < now)
      return `the saved login ${path} is stale: its cookie for ${k.domain} expired on ${new Date(k.expires * 1000).toISOString().slice(0, 10)}. ` +
        "A person must save a fresh login; a Walker never signs in.";
  }
  return null;
}
