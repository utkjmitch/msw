import { test, expect } from "vitest";
import { matchReadChannel, ReadChannelZ } from "../src/browser/read-channels.js";
import { Journey } from "../src/formats/schemas.js";
const FS = "https://firestore.googleapis.com";
const req = (url: string, body: string | null = null, method = "POST", navigation = false) => ({ method, url, body, navigation });
const listen = `${FS}/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Fp%2Fdatabases%2F(default)&RID=1`;
const write = `${FS}/google.firestore.v1.Firestore/Write/channel?VER=8&database=projects%2Fp%2Fdatabases%2F(default)&RID=1`;

test("firestore-listen lets the Listen channel through and nothing else", () => {
  const ch = [{ preset: "firestore-listen" as const }];
  expect(matchReadChannel(req(listen, "count=1&ofs=0&req0___data__=%7B%22addTarget%22"), ch)).toBe("firestore-listen");
  expect(matchReadChannel(req(write, "count=1&ofs=0&req0___data__=%7B%22writes%22"), ch)).toBeNull();
  expect(matchReadChannel(req(`${FS}/v1/projects/p/databases/(default)/documents:commit`, "{}"), ch)).toBeNull();
});
test("firestore-rest-read lets queries through and refuses commits and transactions", () => {
  const ch = [{ preset: "firestore-rest-read" as const }];
  const doc = `${FS}/v1/projects/p/databases/(default)/documents`;
  for (const ok of [":runQuery", ":runAggregationQuery", ":batchGet", "/leagues:listCollectionIds", ":partitionQuery"])
    expect(matchReadChannel(req(doc + ok, "{}"), ch)).toBe("firestore-rest-read");
  for (const no of [":commit", ":batchWrite", ":beginTransaction", ":rollback", ":write", ":listen"])
    expect(matchReadChannel(req(doc + no, "{}"), ch)).toBeNull();
});
test("only POST, never a navigation, never another method", () => {
  const ch = [{ origin: "https://search.example.org", path: "/api/search", method: "POST" as const }];
  expect(matchReadChannel(req("https://search.example.org/api/search", "{}"), ch)).toBe("https://search.example.org/api/search");
  expect(matchReadChannel(req("https://search.example.org/api/search", "q=x", "POST", true), ch)).toBeNull();
  for (const m of ["PUT", "PATCH", "DELETE"]) expect(matchReadChannel(req("https://search.example.org/api/search", "{}", m), ch)).toBeNull();
  expect(matchReadChannel(req("https://search.example.org/api/search/admin", "{}"), ch)).toBeNull();
  expect(matchReadChannel(req("https://evil.example.org/api/search", "{}"), ch)).toBeNull();
});
test("graphql-query: queries pass; mutations, subscriptions and unreadable bodies do not", () => {
  const ch = [{ preset: "graphql-query" as const, origin: "https://api.example.org", path: "/graphql" }];
  const g = (body: unknown) => req("https://api.example.org/graphql", typeof body === "string" ? body : JSON.stringify(body));
  expect(matchReadChannel(g({ query: "query Board { leaders { name } }" }), ch)).toBe("graphql-query");
  expect(matchReadChannel(g({ query: "{ leaders { name } }" }), ch)).toBe("graphql-query");
  expect(matchReadChannel(g({ query: "{ leaders { mutationCount } }" }), ch)).toBe("graphql-query");
  expect(matchReadChannel(g([{ query: "{ a }" }, { query: "{ b }" }]), ch)).toBe("graphql-query");
  expect(matchReadChannel(g({ query: "mutation Join { join(pool: 1) }" }), ch)).toBeNull();
  expect(matchReadChannel(g({ query: "query A { a } mutation B { b }" }), ch)).toBeNull();
  expect(matchReadChannel(g({ query: "subscription S { s }" }), ch)).toBeNull();
  expect(matchReadChannel(g([{ query: "{ a }" }, { query: "mutation M { m }" }]), ch)).toBeNull();
  expect(matchReadChannel(g({ extensions: { persistedQuery: { sha256Hash: "abc" } } }), ch)).toBeNull();
  expect(matchReadChannel(g("not json"), ch)).toBeNull();
});
test("the journey format: read_channels defaults to none and refuses unknown presets and methods", () => {
  const base = { id: "j", walker: "w", audience: "public", goal: "g", start_url: "https://a.test/", arrival: "direct", success: ["s"], step_budget: 5 };
  expect(Journey.parse(base).read_channels).toEqual([]);
  expect(() => ReadChannelZ.parse({ preset: "firestore-write" })).toThrow();
  expect(() => ReadChannelZ.parse({ origin: "https://a.test", path: "/x", method: "PUT" })).toThrow();
  expect(() => ReadChannelZ.parse({ preset: "graphql-query" })).toThrow(); // graphql needs an origin and a path
});
