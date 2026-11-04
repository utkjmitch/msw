import { z } from "zod";
/**
 * Read channels (plan B, task 1): the few POST requests a read-only walk lets through because they only read.
 * A Firestore page loads its data over a POST channel; without this, read-only mode shows the page with no data.
 * PUT, PATCH, DELETE and navigations never match. Pure: no browser here.
 */
const FIRESTORE = "https://firestore.googleapis.com";
const Origin = z.url().refine(u => new URL(u).origin === u.replace(/\/$/, ""), "an origin only, no path");
export const ReadChannelZ = z.union([
  z.object({ preset: z.enum(["firestore-listen", "firestore-rest-read"]), origin: Origin.optional() }).strict(),
  z.object({ preset: z.literal("graphql-query"), origin: Origin, path: z.string().startsWith("/") }).strict(),
  z.object({ origin: Origin, path: z.string().startsWith("/"), method: z.literal("POST") }).strict(),
]);
export type ReadChannel = z.infer<typeof ReadChannelZ>;
export interface ReadRequest { method: string; url: string; body: string | null; navigation: boolean }

const LISTEN = /\/google\.firestore\.v1\.Firestore\/Listen\/channel$/;
const REST_READ = /^\/v1\/projects\/[^/]+\/databases\/[^/]+\/documents(\/.*)?:(runQuery|runAggregationQuery|batchGet|listCollectionIds|partitionQuery)$/;
const originOf = (u: string) => new URL(u).origin;

/** GraphQL text with comments and string literals removed, so a field or a string holding a keyword does not count. */
const stripGraphql = (q: string) => q.replace(/"""[\s\S]*?"""/g, " ").replace(/"(?:\\.|[^"\\])*"/g, " ").replace(/#[^\n]*/g, " ");
function graphqlReadOnly(body: string | null): boolean {
  if (body === null) return false;
  let parsed: unknown;
  try { parsed = JSON.parse(body); } catch { return false; }
  const items = Array.isArray(parsed) ? parsed : [parsed];
  if (!items.length) return false;
  return items.every(it => {
    const q = (it as { query?: unknown } | null)?.query;
    if (typeof q !== "string") return false; // a persisted query sent as a hash only: its operation cannot be read
    const t = stripGraphql(q).trim();
    if (/\b(mutation|subscription)\b/.test(t)) return false;
    return /^(query\b|\{)/.test(t);
  });
}

/** The name of the channel that lets this request through, or null. */
export function matchReadChannel(req: ReadRequest, channels: ReadChannel[]): string | null {
  if (req.method !== "POST" || req.navigation) return null;
  let u: URL;
  try { u = new URL(req.url); } catch { return null; }
  for (const c of channels) {
    if (!("preset" in c)) { if (u.origin === originOf(c.origin) && u.pathname === c.path) return u.origin + u.pathname; continue; }
    if (c.preset === "graphql-query") { if (u.origin === originOf(c.origin) && u.pathname === c.path && graphqlReadOnly(req.body)) return c.preset; continue; }
    if (u.origin !== originOf(c.origin ?? FIRESTORE)) continue;
    if (c.preset === "firestore-listen" && LISTEN.test(u.pathname)) return c.preset;
    if (c.preset === "firestore-rest-read" && REST_READ.test(decodeURIComponent(u.pathname))) return c.preset;
  }
  return null;
}
