# Plan A fixes: the six rulings (lane a)

*Date: 2026-10-12. Branch: `mfx/msw-plan-a-fixes-a`, from `dev` at `a2ad9cf`. Lane a of a pair. Model: claude-opus-5-5[1m].*

Split unavailable: lane a has not seen the other draft.

Jimmy ruled on the six decisions in `docs/reports/2026-10-11-plan-a-build.md` on 2026-10-12: "agree with recommendations for the six." This branch carries out those rulings. Every item was done the same way: write a failing test, see it fail, fix the code, see the test pass, then make one commit. Nothing was pushed, and no PR was opened.

## Result

**DONE, with gaps.** Each ruling has its own commits and tests. Three parts are not done:

- Declined cookies do not yet block `Set-Cookie` storage (F15, second half).
- The impossible-journey floor exists as a rule but nothing applies it yet (F18).
- Long walk tests are close to their 30-second limit when the box is heavily loaded. The suite passed, but two of three runs had load timeouts. Base `a2ad9cf` has the same timeout.

Each gap has a section below. The suite grew from 35 tests to 65. No existing assertion or severity floor was weakened. No existing test timeout was raised.

## Gates

All gates were run from `server/` at the final code commit, except `git diff --check`, which was run from the root.

- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `git diff --check a2ad9cf HEAD`: no output, exit 0.
- `npm test`: exit 0, `Tests  65 passed (65)` in 238 s, at load about 46. This was the third full run on the final code.
  - The first run, at load 50 to 57, had three timeouts at 30 s. They were in the existing tests "a short walk", "a walker finding is reproduced by replay" and the new "a quit that fails still frees the server". All three passed when rerun alone, in 15, 26 and 17 s.
  - The second run, at load 64 to 69, had one timeout: the existing replay test.

The box's load average was 50 to 70 on 12 cores during these runs. Other processes on the box caused that load. Under it, `tests/replay.test.ts > a walker finding is reproduced by replay` runs two full walks and takes 22 to 30 seconds alone, against a 30-second limit.

- Base `a2ad9cf` had the same failure in its full suite here: `Tests 1 failed | 34 passed (35)`, and the failure was this replay timeout.
- Run alone, the same test passes on both commits: 22.5 s on base and 26.3 s on this branch.
- Run alone, every test this branch adds passes. The new tests that run long walks have their own 90 or 120 second limits.

Done when: all four gates exit zero. Met on the third test run. The recorded gate evidence for DONE.json is in `.mfx/evidence/`, which is not committed.

## Ruling by ruling

Test files are under `server/tests/`. Commit ids are on this branch.

### Ruling 1: off-site writes (F1, F20)

Every off-origin POST, PUT, PATCH and DELETE is still blocked in both modes.

| Item | Commit | Test that proves it |
| --- | --- | --- |
| A background write is its own kind, and the Walker is not told "That leads off this site". | `2170c25` | `guard.test.ts` "a background write to another origin is blocked as its own kind, not as leaving the site"; `session.test.ts` "a blocked background write is logged but the Walker is not told it left the site" |
| A transact journey may list payment-provider origins. Writes to them pass in transact mode only. | `b22ae3e` | `guard.test.ts` "a journey's payment origin takes writes in transact mode only" and "payment origins need payment_test_mode in the run file" |

- Background writes are recorded as `blocked` events with `why: "background-write"`. `left-site` is now used only for a main-frame navigation. `would-submit` is unchanged.
- A journey file can now hold `payment_origins`. The run file must also set `payment_test_mode: true`, or the walk refuses to start.
- In transact mode, a background write to a listed payment origin goes through. A main-frame navigation to it is still counted as leaving the site.
- In read-only mode, the list has no effect.

Done when: the four tests above pass. They do.

F20's remaining case is not part of this ruling. A look that finishes on the old page after a slow navigation is still not caught. It is listed under "Still open".

### Ruling 2: second walk into the same folder (F2)

| Commit | Test |
| --- | --- |
| `0a34269` | `session.test.ts` "a second walk into a folder that already holds events is refused, and the old evidence is untouched" |

`start` refuses before it launches a browser or writes anything. The error says `the walk folder <folder> already holds a walk; use a fresh out_dir`. The test checks that the old `events.jsonl` is unchanged afterward.

Done when: that test passes. It does.

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
- Commit `8c2aef3` fixes a bug I added in `69e59a2`. Playwright's fake clock for the `wait` move replaces `window.performance`. That made every page in a walk with `wait` read as "never loaded", so each one cost slow-page patience. The fix saves the real `performance` object before the clock is installed.

Done when: those tests pass. They do.

### Ruling 4: the confirmed defects

| Finding | Commit | Test |
| --- | --- | --- |
| F4: MCP `quit` clears its session in a `finally` | `bd6e4dd` | `mcp.test.ts` "a quit that fails still frees the server for the next walk" |
| F6: instrument and blocked records carry their own page's state | `5bb7b4b` | `session.test.ts` "instrument and blocked records carry the state of the page they came from" |
| F9: an act missing `ratings` or `wharton` writes a `refused` event | `4fdf93c` | `mcp.test.ts` "an act without ratings or Wharton answers is refused and the refusal is logged" |

- **F4.** Lane b's `finally` in `WalkSession.quit` is kept. The MCP handler now also sets `session = null` in a `finally`. The test deletes the walk folder so writing the quit event fails, then starts a second walk and quits it cleanly.
- **F6.** Each record remembers its page's address. It waits until the walk has looked at that page, then takes that page's state.
  - A record from a page the walk never looked at is written at quit with no state. It does not borrow another page's state.
  - The blocked-request record carries the page that made the request.
- **F9, the choice made.** I made `ratings` and `wharton` optional in the MCP input schema, so the session sees the act. The session refuses it and logs a `refused` event.
  - Limit: if `ratings` is given but has the wrong shape (for example, a score of 7), the MCP schema still rejects it and nothing is logged. Only the "missing" case in the ruling is logged.

Done when: the three tests pass. They do.

### Ruling 5: safety and spec gaps

| Finding | Commit | Test |
| --- | --- | --- |
| F10: mask values typed into `cc-*` fields by field type | `2645c0f` | `session.test.ts` "values typed into payment fields are masked in events, even with personal-data masking off"; `mask-order.test.ts` "payment and password fields are known by type, including sectioned autocomplete tokens" |
| F14: `payment_test_mode`; admin transact, test copy, seeded data | `b22ae3e`, `1a5e212` | `session.test.ts` "admin journeys run only in transact mode on a seeded test copy" and "a transact walk types card details only in payment test mode"; `guard.test.ts` "payment origins need payment_test_mode in the run file" |
| F11: expire only the journey origins' cookies | `de190d1` | `conditions-inquisition.test.ts` "session expiry drops only the journey origins' cookies" |
| F15: axe failures recorded and retried once | `2359e37` | `inspect-retry.test.ts` "a failed axe run is recorded and retried once" and "an axe run that fails twice is recorded twice and not tried again" |
| F15: declined cookies block `Set-Cookie` | none | **Gap.** See below. |
| F16: masking audit (option names, URLs, finding text, instrument text) | `ec550df` | `session.test.ts` "personal data is masked in addresses, instrument text and finding text"; `mask-order.test.ts` "records are masked string by string, including encoded addresses, and numbers are left alone" |
| F16, F24: the 120-character cut; replay identity apart from display text; ambiguous matches rejected | `ce97c7c` | `review.test.ts` "option names longer than 120 characters still tell page states apart"; `replay.test.ts` "replay tells masked names apart and refuses an ambiguous match" |
| F17: run manifest | `d5e7aff` | `session.test.ts` "each walk writes a manifest of its inputs, versions and times" |
| F18: masked visible field data on blocked submits | `588176e` | `session.test.ts` "a blocked submit records the form's visible fields with masked values" |
| F18: severity floors | `c18f4af` | `walk-pure.test.ts` "severity floors from the walk: phone-blocking and an impossible journey"; `session.test.ts` "running away sets severity 3 at the final step, and the seal records the outcome", "running away with no note adds a severity 3 finding", "on a phone, a note that blocks a step is at least severity 3" |
| F19: `wait` never costs no-change patience | `8c2aef3` | `session.test.ts` "wait never costs no-change patience" |
| F19: slow-3g on every page | `f55ab9c` | `session.test.ts` "slow-3g applies to a page opened in a new tab, not only the first page" |
| F19: the offline-restore timer cannot fire after the walk ends | `be4dfa0` | `session.test.ts` "the offline-restore timer cannot fire after the walk ends" |

What each fix does:

- **F10.** A field is a secret field if it is a password or its `autocomplete` has a `cc-` token, sectioned tokens included. Its typed value is stored as `[masked]` even when `mask_personal_data` is off. The screenshot mask now covers every `cc-` field too.
- **F14.** These rules are now enforced:
  - An admin journey needs transact mode, `environment.kind: test`, and the new `environment.seeded_data: true`.
  - Payment origins need `payment_test_mode: true`.
  - In transact mode without `payment_test_mode`, typing into a card field is refused.
- **F11.** Only cookies the journey's own origins would receive are dropped.
- **F15, axe.** A failed axe pass writes an `inspect-error` instrument record and is tried once more, right away. Each failure is recorded. After two failures the page is not tried again in that walk.
- **F16, masking.** Personal-data masking now covers:
  - the address returned by `look` and stored in events;
  - instrument records, string by string, including URL-encoded addresses;
  - the text, title and fields of findings;
  - the quit detail;
  - option names, before the state hash is computed.
- **F16 and F24, identity.** Each option now has two names:
  - a full, unmasked `key` used for the state hash and for replay;
  - a display name that is masked and then cut to 120 characters.

  Replay matches on key and role. It refuses a match unless exactly one control fits.
- **F17.** Each walk folder gets a `manifest.json`. It records the run file, the walker and journey paths with sha256 hashes, the viewport and locale, the versions (server, Node, Playwright, Chromium, axe-core), and the start and end times. It also records the outcome. The seal records the outcome as well.
- **F18, blocked submits.** A blocked form submit records each visible field's label, type and value. Values are masked for personal data, and secret fields are masked by type.
- **F18, floors.** The floors are in `server/src/walk/floors.ts`:
  - A note on a phone that says it blocks a step (`blocks_step: true`, new in the `note` tool) is at least severity 3.
  - Running away makes the finding at the final step at least severity 3. If there is no finding there, the server adds one, marked `by: "server"`.
  - The impossible-journey floor (4) is written and tested as a rule, but nothing calls it yet. See the gaps.
- **F19.** Three fixes:
  - A `wait` costs no patience for an unchanged or already-seen page.
  - Slow-3g emulation is applied to every page the walk adopts, including new tabs and pop-ups.
  - The offline-restore timer is tracked and cleared when the walk quits.

The server README is updated in each commit to match.

Done when: every test named in the table passes. They do, run alone or by file.

### Ruling 6: the manual walk

The manual walk is reserved for the host after this branch lands. I did not run it and did not simulate it. No part of this report is evidence from a manual walk.

Done when: the host has run the manual walk on the merged branch. Not done here, by design.

## Gaps

1. **Declined cookies still let `Set-Cookie` through (F15, second half).** This is bigger than a small, test-backed change, so I stopped it as the ruling says. An experiment, not committed, showed the problem:
   - Playwright's `route.fetch` shares the browser context's cookie jar. A server's `Set-Cookie` is stored even when the handler fulfills the response without that header.
   - Chromium's `Network.setCookieControls` covers only third-party cookies.
   - `Emulation.setDocumentCookieDisabled` covers only script cookies.

   **What it needs:** one of these two approaches.
   - Response-stage interception that strips `Set-Cookie` before Chromium stores it. That means a CDP `Fetch` domain at the Response stage, running beside Playwright's own routing, and covering iframes from other sites and workers.
   - Or fulfill every request from a separate request context. That loses slow-3g throttling and the HTTP cache.

   Either way, it also needs a test that a server `Set-Cookie` never reaches the jar under `cookies: declined`. The README still says that HTTP cookie blocking is incomplete.

   Done when: that test passes.
2. **The impossible-journey floor is not applied (F18).** `journeyFloor` in `server/src/walk/floors.ts` returns 4 when a journey was walked on both phone and desktop and no walk reached its goal. One walk session cannot see the other viewports' walks. The plan B report step, which reads every walk in a run, is the place to call it.

   Done when: plan B's report applies it, with a test.
3. **The suite is sensitive to box load.** See "Gates". It passed, but not on every run. The timeouts are in tests that run whole walks, and base has the same replay timeout. I did not change any existing test's timeout.

   Done when: `npm test` passes several runs in a row on this box, or the decision below is made.
4. **The F9 limit.** An act whose `ratings` or `wharton` has the wrong shape is still rejected by the MCP schema without a `refused` event. Only the missing case was ruled on.

## Choices and deviations

- **Background writes.** These are a new `why` value, `background-write`, on the existing `blocked` event, the same level as `left-site`. I did not add a new top-level event type. This keeps the Dead Parrot check and the event readers unchanged.
- **Payment origins.** These pass only background writes, such as a widget's or script's POST. Moving the whole page to the payment site still counts as leaving the site.
- **The card-typing refusal.** This applies only in transact mode. In read-only mode, the guard already stops the submit, and the typed value is masked by type.
- **The manifest is per walk.** It is `manifest.json` in each walk folder, not one file per run. Each walk is started by its own `start_walk`, and the server has no run-level start.
- **Replay rejects duplicate controls.** If a page has two controls with the same full name and role, such as two "Read more" links, a finding there will not reproduce. This is what the ruling asked for. Plan B may want a position-based tiebreak.
- **The slow-page charge now covers the first page.** Before, a slow start page was never charged.
- **A record from a page the walk never looked at gets no state.** It is not given the state of the page before it (F6).
- **The slow-3g limit on pop-ups.** A pop-up opened by the site gets slow-3g once Playwright reports it, so its first request may already be under way. The README says so.
- **The fake-clock bug.** `8c2aef3` fixes a bug that `69e59a2` added. Both are on this branch, so no released code had it.

## Decisions for a human

```yaml
decision: How should the suite handle a heavily loaded box?
context: The existing replay test runs two walks in 30 seconds. On this box, at load 50 to 70, it timed out in the full suite on base and in two of three runs on this branch. I did not raise its limit, because the brief says never to weaken an existing test.
options:
  a: Give that one test an explicit 120-second limit, as the new long tests have.
  b: Limit vitest to fewer parallel files on shared boxes.
  c: Leave it, and run the gates on a quieter box.
recommendation: a. The test checks a result, not a speed, and two walks in 30 seconds is a timing guess that this box overruns.
```

```yaml
decision: How should declined cookies block Set-Cookie? (F15, second half)
options:
  a: Strip Set-Cookie at the response stage with CDP Fetch, beside Playwright's routing.
  b: Fulfill every request from a separate request context, and lose slow-3g throttling and the HTTP cache for those requests.
  c: Keep only script-cookie blocking, and say so in the README.
recommendation: a, as its own task with its own test. It keeps throttling and caching. It needs care with cross-site iframes and workers.
```

## Still open

These were out of scope by the brief, or are parts of findings the rulings did not cover:

- F7: blocked-request notes can reach the Walker one result late.
- F8: timing values and floors are scattered through the code. This branch adds `SLOW_PAGE_MS` and `FLOOR` as named values, but the wider cleanup is not done.
- F21: a page opened by script with `noopener` may be skipped.
- F23: when the last tab closes, there is no current page.
- F25: no document defines the event log's writer and reader rules.
- F12: the HMAC key is memory-only, so the log cannot be verified on its own after the server exits.
- F16: text that is clipped or covered by other elements is still returned.
- F19: MCP disconnect and concurrent calls are not covered.
- F20: a look that finishes on the old page after a slow navigation is not caught.

## How I worked

- I read the goal, the plan A report, spec sections 5, 6.2 and 12, and the server README.
- I did not read the other lane's clone, branch, transcript or output.
- I did not run `npx playwright install`. Playwright stayed at 1.63.0 with the preinstalled Chromium.
- I did not push.
- To compare timings, I made a temporary worktree of `a2ad9cf` outside the repo. I removed it afterward.
- Nothing in this report or the code names a private client, a person's data, a host path outside the repo, or a secret.
