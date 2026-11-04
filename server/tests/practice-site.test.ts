import { test, expect } from "vitest";
import { practiceSite } from "../src/practice-site.js";

test("the practice site serves the example pages, refuses paths outside them, and sends writes home", async () => {
  const { url, server } = await practiceSite(0);
  try {
    expect(url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/);
    const home = await fetch(url);
    expect(home.status).toBe(200);
    expect(await home.text()).toContain("Fixture Trust");
    expect((await fetch(url + "about.html")).status).toBe(200);
    expect((await fetch(url + "no-such-page.html")).status).toBe(404);
    expect((await fetch(url + "..%2F..%2Fpackage.json")).status).toBe(404);
    const post = await fetch(url + "donate", { method: "POST", body: "name=x", redirect: "manual" });
    expect(post.status).toBe(303);
    expect(post.headers.get("location")).toBe("/");
  } finally { await new Promise(r => server.close(r)); }
});
