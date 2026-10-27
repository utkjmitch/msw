<!-- model: claude-sonnet-5-5 -->
## STATUS: FAIL at step 3

## Evidence
- **Step 1 (open the site):** I started the walk. The home page loaded with the heading "Transforming Lives Together" and a cookie panel over the lower part. This matches the expected result.
- **Step 2 (press Reject all):** I pressed it. The cookie panel closed and the whole home page showed. This matches.
- **Step 3 (press Get Involved in the top menu):** I could not do this.
  - The top menu shows Get Involved (option 6).
  - I tried four times, looking again before each retry, as guide rule 5 says. Each time the tool refused with "the page changed; look again".
  - Each look showed a different slide in the bottom bulletin ticker: "July 2026 Bulletin", then "Featured Story / Reyna Suárez Rizo", then "Where We're Born". The ticker keeps rotating by itself, so the page never stays still long enough for a press to go through.
  - I never reached the Get Involved page, so steps 4 to 7 were not attempted.

## Quit
Walk saved in walks/comunidad-connect/2026-10-14-live/inspection/walks/inspector-inspector-partner-seeker-guide-desktop-en-US. Findings: 5. verified: true. alive: false (page 6523e8b7 has 1 screenshot; page d8aa46a5 has 1 screenshot; page 8b26dc9b has 1 screenshot; page f46ee30c has 1 screenshot; page f46ee30c has no instrument record; page 00baf82b has 1 screenshot; page 1917698a has 1 screenshot).

## Proposed guide diff
This looks like a tool or site problem more than a guide error. The step text is correct, and I cannot tell what would fix it in the guide. The diff below only warns the next reader.

```diff
--- a/guide.md
+++ b/guide.md
@@ step 3
 3. In the top menu, press **Get Involved**.
+   *Note: the home page has a rotating bulletin ticker at the bottom. It can make the press fail with "the page changed; look again". If that keeps happening, the cause is the ticker. Retry, or stop and report it.*
    **Expected:** the Get Involved page, which says you can donate, volunteer, partner or advocate.
```

The real fix is outside the guide. Either the tool should ignore changes to decorative regions like the ticker, or the site should pause the ticker. I filed this as a severity-3 `function` note.