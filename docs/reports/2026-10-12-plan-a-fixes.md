# Plan A fixes: the six rulings (merged)

*Date: 2026-10-12. Branch: `mfx/msw-plan-a-fixes`, from `dev` at `a2ad9cf`. This merges the two pair lanes `mfx/msw-plan-a-fixes-a` (head `7be0ce3`) and `mfx/msw-plan-a-fixes-b` (head `4b9d316`). Merger model: claude-opus-5-5[1m].*

**Split (between the lanes):** a says apply the walk's severity floors now and throttle every page the walk adopts; b says those floors need structured evidence first, and blocks redirects that keep a write — that is the trade-off. The two evaluators split the same way: evaluator-a recommends lane a as the code spine, and evaluator-b recommends lane b.

The evaluators reviewed both frozen lane heads before the merge:

- evaluator-a: claude-opus-5-5[1m], lens 3 (a run can be stranded by its own gate). Its review is `docs/reviews/mfx-msw-plan-a-fixes/pair-evaluator-a.md`.
- evaluator-b: gpt-6-astra, lens 9 (invariant hygiene). Its review is `docs/reviews/mfx-msw-plan-a-fixes/pair-evaluator-b.md`.

Each lane's rebuttal of the other is committed verbatim at `docs/reviews/mfx-msw-plan-a-fixes/pair-rebuttal.json`. In the rebuttal round, lane a applied lenses 1, 3, 5, 7 and 9, and lane b applied lenses 2, 4, 6 and 8.

Jimmy ruled on the six decisions in `docs/reports/2026-10-11-plan-a-build.md` on 2026-10-12: "agree with recommendations for the six." This branch carries out those rulings. Every item was done the same way: write a failing test, see it fail, fix the code, see the test pass, then make one commit. Nothing was pushed, and no PR was opened.

## How the merge was built

Lane a is the spine. Its 21 commits are on this branch unchanged, by fast-forward, so every lane a commit id below is the same here. Lane b's fixes that lane a lacked were then ported on top, one commit each, each with a failing test first. Lane b's commits are not on this branch as they were; each port names the lane b commit it came from.

Why lane a is the spine: it meets more of the rulings. It applies two of the F18 floors, throttles every page the walk adopts, refuses card typing at act time without payment test mode, and records the outcome in the seal and the manifest. Lane b leaves the floors and new-page throttling open. Evaluator-a also found that lane b clears a page's state at the start of every act, so records from a click that navigates lose the old page's state (its L3-4). Evaluator-b preferred lane b's spine; its findings that apply to lane a's code were fixed here instead, and the one that was not is listed under "Still open".

## Orientation and resume

The merge started at `a2ad9cf6c0aa8e0fb5bbcc19b64e1267fb739852`, the expected `dev` base. Generation was 0. There was no earlier merge work to resume. The untracked `.mfx/` directory holds host metadata only. The brief has no separately labeled STEP 0; this check stands in for its orient and resume step.

The lane heads were fetched as `refs/lanes/a` (`7be0ce3`) and `refs/lanes/b` (`4b9d316`). I read both lane reports, both DONE.json files, the rebuttal snapshot, the brief and the DONE contract in full.

Lane b recorded its own start the same way: base `a2ad9cf`, generation 0, no prior work. `npm ci` worked. Tests use the preinstalled Chromium. Playwright and playwright-core stay pinned to 1.63.0. The box runs Node 20.20.2, and vitest warns that it wants Node 22 or newer. No package version was changed to avoid that warning.

Done when: the starting branch, revision, generation, prior work, and runtime are recorded here. Met.

## Result

**DONE, with gaps.** Each ruling has its own commits and tests. These parts are not done:

- Declined cookies do not yet block `Set-Cookie` storage, and saved cookies survive the start (F15, second half). A probe shows it.
- A pop-up a page script opens gets its first response without slow-3g latency (F19). A probe shows it.
- The impossible-journey floor exists as a rule, but nothing applies it yet (F18).
- The run-away floor assumes the final step was one the goal needs. The lanes disagree on whether to apply it before the server knows that. It stays applied here, and it is an open decision for Jimmy.
- Records are tied to a page by its address, not by the page itself (F6). Two tabs at the same address cannot be told apart. See "Still open".

Each gap has a section below. The suite grew from 35 tests at base, to 65 on lane a, to 82 here. No existing assertion or severity floor was weakened. No existing test timeout was raised.

## Gates

All gates were run from `server/` at the final code commit, except `git diff --check`, which was run from the root.

- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `git diff --check a2ad9cf HEAD`: no output, exit 0.
- `npm test`: exit 0, `Tests  82 passed (82)`, in 167 s, with two test files at a time. That full run was made before the last two commits, which only add two assertions and this report. The gate runs recorded for DONE.json are made at the final commit, after this report.

Both lanes saw browser tests time out at 30 seconds when the box was heavily loaded. Lane a's record of that, kept from its report:

- Six full runs were made on lane a's final code. Two passed and four had timeouts.
  - Run 1, at load 50 to 57: three timeouts at 30 s. They were in the existing tests "a short walk" and "a walker finding is reproduced by replay", and in the new "a quit that fails still frees the server". All three passed when rerun alone, in 15, 26 and 17 s.
  - Run 2, at load 64 to 69: one timeout, the existing replay test.
  - Run 3, at load about 46: passed, 65 of 65, in 238 s.
  - Runs 4 and 5, recorded as gate evidence, at load 41 to 55: one timeout each, the existing replay test.
  - Run 6, recorded as gate evidence, at load about 19 to 24: passed, 65 of 65, in 190 s.
  - At load 20, the replay test alone took 11.4 s on lane a and 12.3 s on base. Lane a's changes do not make it slower.
- A seventh run at lane a's final head, made after its report was written, passed 65 of 65.
- Base `a2ad9cf` had the same failure in its full suite: `Tests 1 failed | 34 passed (35)`, and the failure was this replay timeout.
- Run alone, the same test passes on both commits: 22.5 s on base and 26.3 s on lane a.

Lane b's first full run had two 30-second timeouts with unrestricted workers. Lane b's commit `8ef2248` limits vitest to two test files at once. This branch takes that limit (`9305242`) in place of lane a's proposal to raise one test's limit, so lane a's first decision is closed. The 30-second test timeout, the 60-second hook timeout, the assertions and the floors are unchanged.

Lane b's final suite passed 56 tests in 16 files, with typecheck, build and `git diff --check` passing.

Done when: all four gates exit zero. Met in the preflight above; DONE.json carries the recorded results at the final commit. The recorded gate evidence for DONE.json is in `.mfx/evidence/`, which is not committed.

## Ruling by ruling

Test files are under `server/tests/`. Commit ids are on this branch. Where lane b proved the same item with its own test, its done-when is kept as "Lane b's done-when".

### Ruling 1: off-site writes (F1, F20)

Every off-origin POST, PUT, PATCH and DELETE is still blocked in both modes.

| Item | Commit | Test that proves it |
| --- | --- | --- |
| A background write is its own kind, and the Walker is not told "That leads off this site". | `2170c25` | `guard.test.ts` "a background write to another origin is blocked as its own kind, not as leaving the site"; `session.test.ts` "a blocked background write is logged but the Walker is not told it left the site" |
| A transact journey may list payment-provider origins. Writes to them pass in transact mode only. | `b22ae3e`, `cf60183` | `guard.test.ts` "a journey's payment origin takes writes in transact mode only", "payment origins need payment_test_mode in the run file" and "payment origins must also be approved in allowed_for_transact" |
| A transact redirect that keeps a write is stopped before the next origin receives it. | `8e620b1`, from lane b `f3375b0` | `guard.test.ts` "transact refuses redirects that preserve a write before the next origin receives it" |

- Background writes are recorded as `blocked` events with `why: "background-write"`. `left-site` is now used only for a main-frame navigation. `would-submit` is unchanged.
- A journey file can now hold `payment_origins`. The run file must also set `payment_test_mode: true`, and each payment origin must be in `allowed_for_transact`, or the walk refuses to start.
- In transact mode, a background write to a listed payment origin goes through. A main-frame navigation to it is still counted as leaving the site.
- In read-only mode, the list has no effect.
- Lane b found that a 307 or 308 could carry an approved transact POST on to an unlisted origin. Playwright routes only the first address in a redirect chain, so the guard never saw the second hop. Approved writes are now fetched with `maxRedirects: 0`. A 307, a 308, or a 301 or 302 for a write other than POST is refused and logged as `blocked` with `why: "background-write"` and its `redirect_status`. Ordinary POST-to-GET confirmation redirects still work. If the fetch itself fails, the request is aborted, so it cannot hang (evaluator-a's L3-3 on lane b's version).

Done when: the tests above pass. They do.

Lane b's done-when for the event kind: both of its tests pass, read-only sends no payment POST, and no off-site navigation note appears for a background block. Met here by lane a's tests above.

Lane b's done-when for the redirect: the unlisted endpoint receives zero POSTs, a block is recorded, and the original POST-to-GET confirmation test still passes. Met.

F20's remaining case is not part of this ruling. A look that finishes on the old page after a slow navigation is still not caught. It is listed under "Still open".

### Ruling 2: second walk into the same folder (F2)

| Commit | Test |
| --- | --- |
| `0a34269` | `session.test.ts` "a second walk into a folder that already holds events is refused, and the old evidence is untouched" |
| `bf07493`, from lane b `c2e99b8` | `session.test.ts` "two walks started at once into the same folder: one starts, the other is refused" and "a start that fails before its first event does not lock the walk folder" |

`start` refuses before it launches a browser or writes an event. The error says `the walk folder <folder> already holds a walk; use a fresh out_dir`. The test checks that the old `events.jsonl` is unchanged afterward.

Lane a only checked that the file existed, so two starts at once could both pass the check (evaluator-b's finding 5). The folder is now reserved by creating `events.jsonl` exclusively, as lane b did. Both lanes could also lock a folder for good if the start failed after the reservation (evaluator-a's L3-1). Now a start that fails before its first event closes its browser and removes the empty file, so the walk can be retried.

Done when: those tests pass. They do.

Lane b's done-when: the second start fails and the old event bytes are unchanged. Met.

### Ruling 3: slow page (F3)

| Commit | Tests |
| --- | --- |
| `69e59a2` | `session.test.ts` "a fast page that keeps polling costs no patience" and "a page whose load event takes over 3 seconds costs one patience" |
| `8c2aef3` | `session.test.ts` "wait never costs no-change patience" (also checks the start costs nothing) |

- The charge now uses the page's own Navigation Timing: load event end minus start. It is counted once per page load.
- The network-idle wait before screenshots is kept, but it is not counted.
- The polling test page polls every 200 ms and costs no patience.
- The slow test page delays its load event by 3.5 s and costs one.
- Before this fix, a slow *start* page was never charged, because `goto` already waited for load. Now it is.
- Commit `8c2aef3` fixes a bug lane a added in `69e59a2`. Playwright's fake clock for the `wait` move replaces `window.performance`. That made every page in a walk with `wait` read as "never loaded", so each one cost slow-page patience. The fix saves the real `performance` object before the clock is installed.

Done when: those tests pass. They do.

Lane b's done-when (its `timing.test.ts` is not on this branch): polling costs zero, a 3.2-second load costs one, another look adds none, and the wait test passes. Met by lane a's tests: polling costs zero, a 3.5-second load costs one, another look adds none, and the wait test passes. The check for another look was added in the merge (`3722cfb`).

### Ruling 4: the confirmed defects

| Finding | Commit | Test |
| --- | --- | --- |
| F4: MCP `quit` clears its session in a `finally` | `bd6e4dd`, `056a1eb` | `mcp.test.ts` "a quit that fails still frees the server for the next walk"; `session.test.ts` "a run-away quit that cannot write still closes the browser and frees the session" |
| F6: instrument and blocked records carry their own page's state | `5bb7b4b`, `bb6a601` | `session.test.ts` "instrument and blocked records carry the state of the page they came from" and "quitting before a new page look keeps its records without a state and fails health" |
| F9: an act missing `ratings` or `wharton` writes a `refused` event | `4fdf93c` | `mcp.test.ts` "an act without ratings or Wharton answers is refused and the refusal is logged" |

- **F4.** Lane b's `finally` in `WalkSession.quit` is kept. The MCP handler now also sets `session = null` in a `finally`. The test deletes the walk folder so writing the quit event fails, then starts a second walk and quits it cleanly.
  - Lane a's report said the `finally` was kept, but lane a had put new work that can throw (placing records, the run-away floor) ahead of it. A failure there left the browser open (evaluator-a's L3-2). Fixed in `056a1eb`: every write in quit now runs inside the `try`, and the browser close has its own nested `finally`, as in lane b.
- **F6.** Each record remembers its page's address. It waits until the walk has looked at that page, then takes that page's state.
  - A record from a page the walk never looked at is written at quit with no state. It does not borrow another page's state. Such a record now fails run health, as lane b's did (`bb6a601`, from lane b `da418b8`).
  - The blocked-request record carries the page that made the request.
  - The limit: records are tied by address. See "Still open".
- **F9, the choice made.** Lane a made `ratings` and `wharton` optional in the MCP input schema, so the session sees the act. The session refuses it and logs a `refused` event. Lane b made the same choice.
  - Limit: if `ratings` is given but has the wrong shape (for example, a score of 7), the MCP schema still rejects it and nothing is logged. Only the "missing" case in the ruling is logged.

Done when: the tests above pass. They do.

Lane b's done-whens: an injected quit failure is followed by a successful new start (met by `mcp.test.ts` above); arrival errors and blocks cite the new state, and unobserved evidence survives with failed health (met); two incomplete acts leave two `refused` events and zero accepted acts (met by lane a's F9 test; the check for zero accepted acts was added in the merge, `3722cfb`).

### Ruling 5: safety and spec gaps

| Finding | Commit | Test |
| --- | --- | --- |
| F10: mask values typed into `cc-*` fields by field type | `2645c0f` | `session.test.ts` "values typed into payment fields are masked in events, even with personal-data masking off"; `mask-order.test.ts` "payment and password fields are known by type, including sectioned autocomplete tokens" |
| F10: payment fields known by name or `data-payment` | `7bf0136`, from lane b `c30b44d` | `session.test.ts` "payment fields known only by name or data-payment are masked when typed and when a submit is blocked" |
| F14: `payment_test_mode`; admin transact, test copy, seeded data | `b22ae3e`, `1a5e212`, `cf60183`, `07c6244` | `session.test.ts` "admin journeys run only in transact mode on a seeded test copy", "an admin journey on seeded data that is not a test copy is refused" and "a transact walk types card details only in payment test mode"; `guard.test.ts` "payment origins need payment_test_mode in the run file"; `formats.test.ts` "a run names its environment; test_copy and seeded_data default to false" |
| F11: expire only the journey hosts' cookies | `de190d1`, `1682bbe` | `conditions-inquisition.test.ts` "session expiry drops only the journey origins' cookies" and "session expiry also drops journey-host cookies on deep paths and parent domains" |
| F15: axe failures recorded and retried once | `2359e37`, `bb6a601` | `inspect-retry.test.ts` "a failed axe run is recorded and retried once" and "an axe run that fails twice is recorded twice and not tried again" (now also checks run health) |
| F15: declined cookies block `Set-Cookie` | `223cdc2` adds a failing probe | **Gap.** See below. |
| F16: masking audit (option names, URLs, finding text, instrument text, ratings, Wharton notes) | `ec550df`, `931b199` | `session.test.ts` "personal data is masked in addresses, instrument text and finding text"; `masking-identity.test.ts` "URLs, finding text, instrument text, ratings, Wharton notes and quit details are masked"; `mask-order.test.ts` "records are masked string by string, including encoded addresses, and numbers are left alone" and "URL masking preserves valid IP hosts and handles encoded data beside a percent sign" |
| F16, F24: the 120-character cut; replay identity apart from display text; ambiguous matches rejected | `ce97c7c`, `fc676a9` | `review.test.ts` "option names longer than 120 characters still tell page states apart"; `replay.test.ts` "replay tells masked names apart and refuses an ambiguous match"; `masking-identity.test.ts` "full names keep distinct identities behind masked display text, and the page is left as it was" |
| F17: run manifest | `d5e7aff` | `session.test.ts` "each walk writes a manifest of its inputs, versions and times" |
| F18: masked visible field data on blocked submits | `588176e`, `b89a239` | `session.test.ts` "a blocked submit records the form's visible fields with masked values" and "a blocked submit sent by a script says its fields were not captured" |
| F18: severity floors | `c18f4af`, `9637289` | `walk-pure.test.ts` "severity floors from the walk: phone-blocking and an impossible journey"; `session.test.ts` "running away sets severity 3 at the final step, and the seal records the outcome", "running away with no note adds a severity 3 finding", "on a phone, a note that blocks a step is at least severity 3" and "the signed note record says when a note blocks a step" |
| F19: `wait` never costs no-change patience | `8c2aef3` | `session.test.ts` "wait never costs no-change patience" |
| F19: slow-3g on every page | `f55ab9c`, `e33c17e`; `223cdc2` adds a failing probe | `session.test.ts` "slow-3g applies to a page opened in a new tab, not only the first page" and "a page that slow-3g could not be applied to is recorded and fails run health" |
| F19: the offline-restore timer cannot fire after the walk ends | `be4dfa0`, `68629e0` | `session.test.ts` "the offline-restore timer cannot fire after the walk ends" and "an offline restore cannot run after the walk runs out of steps, before quit" |

What each fix does:

- **F10.** A field is a secret field if it is a password or a payment field. A payment field has an `autocomplete` token starting `cc-` (sectioned tokens included), a `data-payment` attribute, a `name` containing `card`, or the name `cvv` or `cvc`. Its typed value is stored as `[masked]` even when `mask_personal_data` is off, and so is its value in a blocked submit's field list. The screenshot mask covers the same fields. The wider selector is lane b's.
- **F14.** These rules are now enforced:
  - An admin journey needs transact mode, `environment.kind: test`, `environment.test_copy: true` and `environment.seeded_data: true`. Both new flags default to false. Lane a's report listed the test copy as done, but lane a checked only `seeded_data` (evaluator-b's acceptance check). The test-copy flag is lane b's.
  - The environment name may not be blank, as in lane b.
  - Payment origins need `payment_test_mode: true`, and each must also be in `allowed_for_transact`.
  - In transact mode without `payment_test_mode`, typing into a card field is refused.
- **F11.** Only cookies whose domain covers a journey host are dropped, on any path, including a cookie shared from a parent domain. Lane a matched cookies by the origin's address, so a journey-host cookie scoped to `/account` survived (evaluator-b's acceptance check). The host matching is lane b's.
- **F15, axe.** A failed axe pass writes an `inspect-error` instrument record and is tried once more, right away. Each failure is recorded. After two failures the page is not tried again in that walk, and run health fails, as in lane b.
- **F16, masking.** Personal-data masking now covers:
  - the address returned by `look` and stored in events;
  - instrument records, string by string, including URL-encoded addresses. Each run of escapes is decoded on its own, so a bare percent sign elsewhere no longer stops the decoding;
  - the text, title and fields of findings;
  - the Walker's ratings and Wharton note, and the notes returned with each look. Lane a wrote ratings and the Wharton note to the event log unmasked (lane b's rebuttal, lens 6);
  - the quit detail;
  - option names, for display.
  
  A user name and password in a URL are always dropped. An IPv4 address is no longer read as a phone number, so a masked URL still names its host. Both are lane b's (`6e92d6a`).
- **F16 and F24, identity.** Each option has two names:
  - a full, unmasked `key` used for the state hash and for replay;
  - a display name that is masked and then cut to 120 characters.

  Replay matches on key and role. It refuses a match unless exactly one control fits.

  Lane a masked the live page before reading option names, so two buttons that differ only in an email had the same key, and it hashed a masked key into the state (evaluator-b's finding 3). Now names and the state are read from the page as it is. The page is masked only for the screenshot, then put back, as in lane b.
- **F17.** Each walk folder gets a `manifest.json`. It records the run file, the walker and journey paths with sha256 hashes, the viewport and locale, the versions (server, Node, Playwright, Chromium, axe-core), and the start and end times. It also records the outcome. The seal records the outcome as well.
- **F18, blocked submits.** A blocked form submit records each visible field's label, type and value. Values are masked for personal data, and secret fields are masked by type. A form sent by a script, not by its own submit control, has no captured fields; its record now says so in `fields_error`, as lane b's did.
- **F18, floors.** The floors are in `server/src/walk/floors.ts`:
  - A note on a phone that says it blocks a step (`blocks_step: true`, new in the `note` tool) is at least severity 3. The signed `note` record now keeps `blocks_step: true`, so the raised severity can be traced (evaluator-b's finding 4 and lane b's rebuttal).
  - Running away makes the finding at the final step at least severity 3. If there is no finding there, the server adds one, marked `by: "server"`. This is an open decision; see "Decisions for a human".
  - The impossible-journey floor (4) is written and tested as a rule, but nothing calls it yet. See the gaps.
- **F19.** These fixes:
  - A `wait` costs no patience for an unchanged or already-seen page.
  - Slow-3g emulation is applied to every page the walk adopts, including new tabs and pop-ups. If it cannot be set on a later page, the walk records a `network-not-emulated` condition and run health fails; on the first page, the start fails. Lane a swallowed that failure (lane b's rebuttal, lens 4).
  - The offline-restore timer is tracked and cleared when the walk quits, when its budget runs out, and when its browser context closes. Lane a cleared it only at quit, which left a window after the budget ran out (evaluator-b's acceptance check; lane b's `b4b7320`).

The server README is updated in each commit to match.

Done when: every test named in the table passes. They do, in the full suite.

Lane b's done-whens for Ruling 5, each checked here:

- Payment fields: the security code, expiry and CVV values are all `[masked]`. Met.
- Authorization: missing prerequisites refuse the walk and the complete test configuration passes. Met.
- F15 axe: both the recovered and twice-failed cases pass, with the expected error records and health result. Met.
- F11: the unrelated host's cookie remains. Met.
- F16, F24: text is masked, distinct controls keep distinct identities, identical controls refuse replay, and normal replay still succeeds. Met for these text and identity repairs. Clipping remains open.
- F17: the manifest exists at start and has an end time after quit. Met. Independent signature verification remains open.
- F18 blocked fields: the blocked action includes the visible name field and no typed value. Met for native submits. A form a script sends records that its fields were not captured.
- F19 wait and timer: wait keeps patience and no restore runs after the end. Met. First-request throttling in new pages remains open.

### Ruling 6: the manual walk

The manual walk is reserved for the host after this branch lands. Neither lane nor the merge ran it or simulated it, and no final agent quit text was invented. No part of this report is evidence from a manual walk.

Done when: the host has run the manual walk on the merged branch and recorded its actual quit result. Not done here, by design. Lane b adds that the remaining safety work should land first; that is the host's call.

## Gaps

1. **Declined cookies still let `Set-Cookie` through, and saved cookies survive (F15, second half).** This is bigger than a small, test-backed change, so both lanes stopped it as the ruling says.
   - Lane a's experiment, not committed: Playwright's `route.fetch` shares the browser context's cookie jar. A server's `Set-Cookie` is stored even when the handler fulfills the response without that header. Chromium's `Network.setCookieControls` covers only third-party cookies. `Emulation.setDocumentCookieDisabled` covers only script cookies.
   - Lane b's experiment, not committed: a response-route repair using a separate request context still left a server cookie after a redirect.
   - `probes/declined-cookies.ts` (`223cdc2`, lane b's probe as written) sets a saved cookie, follows a server redirect with `Set-Cookie`, receives another response cookie, and tries a script cookie. It expects no cookies in the browser and no cookie header on the server. On this branch it fails: the saved cookie is still in the jar.

   **What it needs:** a browser-wide cookie policy that covers redirects, subframes, browser-generated requests and saved cookies, without moving requests around the write guard. Lane a named two ways to get there:
   - Response-stage interception that strips `Set-Cookie` before Chromium stores it: a CDP `Fetch` domain at the Response stage, running beside Playwright's own routing, and covering iframes from other sites and workers.
   - Or fulfill every request from a separate request context. That loses slow-3g throttling and the HTTP cache, and lane b's experiment shows it still misses a redirect.

   The README still says that HTTP cookie blocking is incomplete.

   Done when (lane a): a test that a server `Set-Cookie` never reaches the jar under `cookies: declined` passes.
   Done when (lane b): `npx tsx probes/declined-cookies.ts` exits zero, with added coverage for subframes and browser-generated requests, while the write-guard suite remains green. Not met.
2. **The impossible-journey floor is not applied (F18).** `journeyFloor` in `server/src/walk/floors.ts` returns 4 when a journey was walked on both phone and desktop and no walk reached its goal. One walk session cannot see the other viewports' walks. The plan B report step, which reads every walk in a run, is the place to call it. Lane b and evaluator-b add that two walks that did not finish do not prove a journey impossible; the rule's input needs that fact, not just the outcomes.

   Done when (lane a): plan B's report applies it, with a test.
3. **The floors need facts the server does not have (F18).** This is lane b's gap, and the reason the run-away floor is an open decision. In lane b's words: "The server does not know which goal steps are required. It has no structured phone-blocking evidence and no cross-viewport result aggregation. Setting a floor from prose guesses would invent facts." Since then, phone-blocking evidence is structured here (`blocks_step` on the note, signed in the log). A run-away at a required step and an impossible journey still need someone to supply the fact.

   This needs explicit evidence for a phone-blocking step, a run-away at a required step, and an impossible journey across viewports. Define who supplies each fact. Then enforce floors 3, 3, and 4 in the finding writer and test them through MCP and report aggregation.

   Done when (lane b): those three lower-severity inputs become findings at 3, 3, and 4 with supporting evidence. Partly met: the phone floor has its evidence; the run-away floor is applied without the required-step fact; the journey floor is not applied.
4. **Slow-3g misses the first response of a script-opened pop-up (F19).** `probes/slow-network.ts` (`223cdc2`) adopts a pop-up the way the walk does, on the context's page event after its opener is known. On this branch the pop-up's first response arrived in 5.8 to 10.1 ms over three runs, not the 350 ms or more slow-3g needs. Later requests on that page are throttled (the session test above). Lane b's version of the probe, which opens a second page directly, found about 17 ms on lane b. Lane b also tried holding the first request while attaching emulation; it timed out.

   This needs page creation that waits for emulation before the first request, including script-created pop-ups and frames. It must also coexist with the guard and axe's temporary pages.

   Done when (lane b): `npx tsx probes/slow-network.ts` exits zero and equivalent pop-up coverage passes without bypassing the guard. Not met.
5. **The suite is sensitive to box load.** See "Gates". The two-worker limit addresses it without changing any test.

   Done when (lane a): `npm test` passes several runs in a row on this box, or the decision is made. The decision is made: vitest runs at most two files at once.
6. **The F9 limit.** An act whose `ratings` or `wharton` has the wrong shape is still rejected by the MCP schema without a `refused` event. Only the missing case was ruled on. Lane b has the same limit.

The two probes are not part of `npm test`. Their assertions are lane b's and were kept. They are not passing evidence.

## Choices and deviations

Where the lanes disagreed:

- **Background writes.** Lane a uses a new `why` value, `background-write`, on the existing `blocked` event, the same level as `left-site`. Lane b adds a new top-level event kind, `blocked-write`. Kept lane a's, because `left-site` is itself a `why` value, so the ruling's "not `left-site`" contrasts values of one field, and readers that count `blocked` events stay correct. This keeps the Dead Parrot check and the event readers unchanged. Evaluator-b reads the ruling the other way.
- **The run-away floor.** Lane a applies it; lane b says it needs the required-step fact first. Kept lane a's, and made it an open decision for Jimmy, because removing a floor that the brief rules is in scope would weaken it, and applying it may overstate some findings. Lane b's dissent is kept in its own words in "Gaps" and in the decision below.
- **Blocked-submit fields.** Lane a records the form's own fields at submit time, with personal-data and secret-field masking. Lane b records the fields from the preceding look and masks every value. Kept lane a's, because it records the form that was actually sent and masks it the same way typed text is masked; lane b's marker for missing fields is taken.
- **Binding records to pages (F6).** Lane a ties records to a page's address. Lane b ties them to the Playwright page and clears its state at the start of each act. Kept lane a's, because lane b's version loses the old page's state for records from a click that navigates (evaluator-a's L3-4). Evaluator-b's point that an address cannot tell two tabs apart stays open.
- **The manifest.** Lane a stores the input paths with sha256 hashes and the outcome. Lane b stores masked, normalized inputs and leaves out saved-login contents and output paths. Kept lane a's, because it already records the outcome in the manifest and the seal, and its hashes name the inputs without copying them.
- **Slow page (F3).** Both lanes charge the load event once. Lane b also counts documents so that a moved page clock cannot look like another load. Kept lane a's, because its fix saves the real `performance` object before the clock is installed, which covers the same case.
- **Write-preserving redirects.** Taken from lane b. In lane b's words: "Write-preserving redirects are refused even when their target is approved. They require a separate action. Ordinary POST-to-GET confirmation redirects still work. This is a deliberate fail-closed restriction after the redirect probe showed an off-origin POST bypass."

Kept from lane a:

- **Payment origins.** These pass only background writes, such as a widget's or script's POST. Moving the whole page to the payment site still counts as leaving the site.
- **The card-typing refusal.** This applies only in transact mode. In read-only mode, the guard already stops the submit, and the typed value is masked by type.
- **The manifest is per walk.** It is `manifest.json` in each walk folder, not one file per run. Each walk is started by its own `start_walk`, and the server has no run-level start.
- **Replay rejects duplicate controls.** If a page has two controls with the same full name and role, such as two "Read more" links, a finding there will not reproduce. This is what the ruling asked for. Plan B may want a position-based tiebreak.
- **The slow-page charge now covers the first page.** Before, a slow start page was never charged.
- **A record from a page the walk never looked at gets no state.** It is not given the state of the page before it (F6). Run health now fails on it.
- **The slow-3g limit on pop-ups.** A pop-up opened by the site gets slow-3g once Playwright reports it, so its first request may already be under way. The README says so, and now names the probe.
- **The fake-clock bug.** `8c2aef3` fixes a bug that `69e59a2` added. Both are on this branch, so no released code had it.

Kept from lane b:

- Missing MCP fields are relaxed only enough to reach the session's refusal path. Malformed field types still fail MCP schema validation. This follows the brief's allowed session-level choice for F9.
- Lane b first committed an incomplete cookie attempt before reading its failed result, then corrected that commit to hold only the failing probe and the gap explanation. Its blocked-field attempt also showed that reading the page inside a paused navigation can deadlock. Neither failed attempt is claimed as passing evidence.

Lane mistakes fixed in the merge, each checked with a failing test first:

- Lane a's report said `WalkSession.quit` kept its `finally`, but new work ran ahead of it (`056a1eb`).
- Lane a's report listed the F14 test copy as enforced; only `seeded_data` was checked (`07c6244`).
- Lane a's report said F11 dropped only the cookies the journey would receive; deep-path cookies survived (`1682bbe`).
- Lane a's F16 identity was lost behind masked text and the page stayed rewritten (`fc676a9`); ratings and the Wharton note were not masked (`931b199`).
- Lane a's offline timer was cleared only at quit (`68629e0`).
- Lane b's redirect guard could leave a request hanging if `route.fetch` threw; the port aborts it (`8e620b1`).

## Review lenses

Lane b's final lens pass, on its own draft, is kept as written. Where a result changed in the merge, the merged state follows in brackets.

| Lens | Result |
|---|---|
| 1, durations | `waitForNavigation({ waitUntil: "domcontentloaded", timeout: 5_000 })` still leaves F20. Load timing and offline timer regressions pass. |
| 2, safety flags | `journey.payment_origins` and `run.payment_test_mode` are checked before startup. Admin requirements apply even to a requested read-only admin walk. Payment value masking is independent of personal masking. Clean for repaired paths; declarations remain operator attestations. |
| 3, strands | `finally { session = null; }` releases failed quits. The final-tab and concurrent-call limits remain open. [Merged: a failed start also releases its folder.] |
| 4, fail-open granularity | `attempt <= 2` bounds axe retry; twice-failed inspection fails health. The redirect regression closes a write-boundary bypass. HTTP cookies remain an explicit gap. [Merged: a page slow-3g cannot reach now fails health.] |
| 5, writer lag | `pageStates` binds records to the source page. Unobserved records survive without a false state and fail health. F7 remains open. [Merged: records bind by address, not `pageStates`; unobserved records still fail health.] |
| 6, invisible drops | `flushUnobserved` preserves queued evidence at navigation, close, and quit. `matches.length !== 1` refuses ambiguous replay rather than silently selecting a control. [Merged: `placeAll` writes unplaced records at quit.] |
| 7, constants | F8 remains open. This draft retains existing timing and severity values. |
| 8, house voice | Clean in the new report and changed README text. Findings, failures, and gaps use plain language. |
| 9, invariants | Exclusive log creation prevents evidence reuse. Full identities stay separate from masked display labels. New event and manifest fields are described here and in the README. The missing full data contract remains F25. |

Done when (lane b): every lens has an explicit result, and open findings are not described as fixed. Met.

The evaluators' findings and what the merge did with them:

- evaluator-a (lens 3): L3-1, a failed start strands its folder: fixed (`bf07493`). L3-2, quit's `finally` came too late: fixed (`056a1eb`). L3-3, lane b's guard could reject inside the route callback: fixed in the port (`8e620b1`). L3-4, lane b loses state on a navigating click: avoided by keeping lane a's binding. L3-5, offline timers: lane b's fuller cleanup taken (`68629e0`). L3-6, the MCP session gate: clean in both.
- evaluator-b (lens 9): 1, no data-truth document: still open as F25. 2, address-based binding: still open. 3, identity behind destructive masking: fixed (`fc676a9`). 4, the run-away floor's missing fact and the unsaved `blocks_step`: the input is now saved (`9637289`); the floor is an open decision. 5, no exclusive reservation: fixed (`bf07493`). 6, lane b's deferred step capture: not on this branch, since lane a captures the step when the record arrives.

## Decisions for a human

Lane a's first decision, about suite timing, is closed: vitest runs at most two files at once (`9305242`), and no test's limit was raised.

```yaml
decision: How should declined cookies block Set-Cookie? (F15, second half)
options:
  a: Strip Set-Cookie at the response stage with CDP Fetch, beside Playwright's routing.
  b: Fulfill every request from a separate request context, and lose slow-3g throttling and the HTTP cache for those requests.
  c: Keep only script-cookie blocking, and say so in the README.
recommendation: a, as its own task with its own test. It keeps throttling and caching. It needs care with cross-site iframes and workers. Lane b's probe found that b still leaves a cookie after a redirect.
```

```yaml
decision: Should the run-away floor (severity 3 at the final step) stay applied before the server knows the step was required?
context: Lane a applies it on every run-away. Lane b and evaluator-b say a run-away may happen during optional exploration, so the floor can overstate a finding. The server has no list of required steps.
options:
  a: Keep it applied, and add a required-step fact (for example, a journey's list of required steps) in plan B to narrow it.
  b: Apply it only when the Walker marks the step as blocking, as the phone floor does with blocks_step.
  c: Remove it until plan B supplies the fact.
recommendation: b. It uses evidence the server already signs, and it keeps the floor for the case the ruling describes without guessing.
```

## Still open

These were out of scope by the brief, or are parts of findings the rulings did not cover:

- F6: records are tied to a page by its address. Two tabs at the same address, or a reload, cannot be told apart, and a same-address change takes the last look's state until the next look (evaluator-b's finding 2).
- F7: blocked-request notes can reach the Walker one result late.
- F8: timing values and floors are scattered through the code. Lane a adds `SLOW_PAGE_MS` and `FLOOR` as named values, but the wider cleanup is not done. The redirect rules and the list of write methods are still written inline.
- F12 / F17: the HMAC key is memory-only, so a later independent report process cannot verify the original signatures. A manifest does not solve that.
- F16: text that is clipped or covered by other elements is still returned. Masking uses known text patterns and field metadata; it is not a general personal-data detector. A payment control with no recognizable metadata still needs explicit site support.
- F19: MCP disconnect and concurrent calls are not covered. They were outside this brief's three named F19 repairs.
- F20: the five-second navigation wait can still return an old-page look before a slow navigation commits. Ruling 1 used F20 as a label for the off-site-write decision; it did not remove this separate finding. It needs a navigation lifecycle repair.
- F21: a page opened by script with `noopener` may be skipped.
- F23: when the last tab closes, there is no current page.
- F25: no document defines the event log's writer and reader rules. This report describes the changes but does not replace that document.

F5, F12's tail check, F13, F14's unconditional screenshot mask, F22, and F23's ordinary pop-up-close repair remain as supplied by the base. No prior assertion or instrument severity floor was lowered.

Done when (lane b): every unresolved finding above has its own tested repair or an explicit future scope decision. Not met; these are the handoff limits.

## How I worked

- I read the goal, both lane reports and DONE.json files, the rebuttal snapshot, and the DONE contract.
- Both lanes worked without seeing each other's branch. Lane a made a temporary worktree of `a2ad9cf` outside the repo to compare timings, and removed it afterward.
- I ran the two evaluators on the frozen lane heads and committed their reviews unchanged.
- I did not run `npx playwright install`. Playwright stayed at 1.63.0 with the preinstalled Chromium.
- I did not push or open a PR. The host lands the branch.
- Nothing in this report or the code names a private client, a person's data, a host path outside the repo, or a secret.

Done when: all four final gates exit zero at the final commit, the report is committed, and DONE.json validates. DONE.json records the final gate evidence.

## What came from where

The spine, structure and most of the text are lane a's: all 21 of its commits, its sections from "Result" through "How I worked", its event-kind choice, its floors, its throttling of adopted pages, its manifest, its card-typing refusal, and its decision on `Set-Cookie`. From lane b came the transact redirect block, the payment-origin approval check, the test-copy flag and the non-blank environment name, timer cleanup when the budget ends or the context closes, the two-worker suite limit that replaced lane a's timing decision, the run-health failures for unplaced records and twice-failed axe passes, the exclusive folder reservation, host-based session expiry, identity read before masking with the page restored after the screenshot, URL masking that keeps IP hosts and drops credentials, the wider payment-field selector, the `fields_error` marker, the two failing probes, its orientation section, its lens table, its F18 floor gap and every one of its done-whens. Evaluator-a supplied the quit `finally` fix, the failed-start release and the `catch` around the redirect fetch; evaluator-b supplied the case for masking ratings, saving `blocks_step`, and the open F6 binding item. Lane b's rebuttal supplied the health failure for a page slow-3g cannot reach. The merge itself added the run-away floor decision and the corrections of lane mistakes listed above.
