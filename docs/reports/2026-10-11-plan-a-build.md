# Plan A build report: the walk server

*Date: 2026-10-11, merged 2026-10-12. Branch: `mfx/msw-walk-server`. Plan: `docs/superpowers/plans/2026-10-11-msw-plan-a-server.md`.*

Evaluators: a says lane a's session lifecycle is the better base, because its close handler and retryable quit avoid strands; b says lane b is the better base, because of its log-completeness check and regression tests — that is the trade-off.

The lanes themselves agreed in their rebuttals: take lane b's safety fixes and its event-driven fixture, and carry lane a's confirmed findings F3, F4 and F6.

Two lanes built this plan from the same base: lane a (branch `mfx/msw-walk-server-a`, head `63bef24`) and lane b (branch `mfx/msw-walk-server-b`, head `4c3e872`). This branch is the merge. Its code is lane b's, plus two pieces of lane a's Task 9 session code: the look retry (D8) and the closed-tab handler (D7). The lanes' rebuttals are in `docs/reviews/mfx-msw-walk-server/pair-rebuttal.json`.

## Result

**DONE, with review gaps.** All twelve tasks are built and committed, one commit per task, with the plan's commit messages. Type checking and compilation pass. The full suite passes all 35 tests in 12 files, with no unhandled errors. No original assertion or severity floor was weakened. The host owns the manual walk.

Both gates pass, run from `server/` on the merged code:

- `npm run typecheck`: exit 0, no errors. Last line: `> tsc -p tsconfig.json --noEmit`.
- `npm test`: exit 0. Last lines: `Test Files  12 passed (12)` and `Tests  35 passed (35)`.

Compilation also passes: `npm run build` exits 0. The suite passed three runs in a row on the merged code.

Done when: `cd server && npm run typecheck && npm test` exits zero and DONE.json validates. These checks pass. `bar: gap` records the unresolved review findings below.

Done when: both required gates exit zero. Met. Compilation also passes.

## How each lane started

Both lanes read the goal and the plan, and the spec sections it names. Lane b also read design section 7. Neither lane read the other's clone, branch, transcript, or output. Neither pushed, opened a PR, or ran a browser download. Playwright and playwright-core stayed pinned to 1.63.0, with the preinstalled Chromium.

Lane a built all twelve tasks in one run on Node 20.20.2.

Lane b's first run stopped at Task 9 with failing session tests. A second session resumed the clean lane b branch at `9a767cc`. All twelve original task commits stayed intact. The earlier report and test logs supplied the prior failure evidence. The resume reused a local Node 22.23.3 runtime. Lane b's report says that session used generation 1. Its DONE.json records generation 2.

The named superpowers skills and the complete REVIEW-LENSES catalog were not available to either lane. The original task steps were followed directly. Each lane reviewed the source with its supplied lens names and did not claim the missing lens definitions were checked.

Done when: the starting revision, branch, generation, prior results, and scope are recorded. Met.

## What was not done

- **Task 12 step 3, the manual walk with a real agent.** The goal reserves it for the host. Lane a ran a scripted stand-in instead. It used no model, so it is not a substitute (see Task 12). No agent quit text was fabricated.
- **CI.** The box does not push, so `.github/workflows/ci.yml` has never run. The merge ran `npm ci` against the merged lockfile with the box's npm 10.8.2 on Node 20, and it installed cleanly. CI's Node 22 run is still untested (see deviation D1).
- **Fixes beyond the small review repairs.** The review found real defects. Several are confirmed by running the code. Lane b's host allowed small review repairs that keep interfaces, and the merge keeps those. The rest are not fixed. They are listed under "Review findings", and the choices are under "Decisions for a human".
- **`npx playwright install`.** Not run, as the box rules say. The preinstalled Chromium 1243 was used.
- **Later plans.** No reports engine, Cheese Shop, skills, release, push, or PR was created. Those are later-plan work or expressly excluded.

## Tasks

Each done-when can be checked from `server/` with the command given. The commit column is the commit on this branch (lane b's original task commit). Lane a's commit for the same task is listed for comparison. Tasks 2–11 each had a failing test run before implementation in both lanes. Task 1 used the planned smoke check.

| # | Task | Commit | Lane a | Tests | Done when |
|---|---|---|---|---|---|
| 1 | Scaffold and CI | `bdde69c` | `70b5b1e` | `tests/smoke.test.ts` (1) | `npx vitest run tests/smoke.test.ts` passes: Chromium launches. CI exists. |
| 2 | Formats | `cbc0da8` | `0ddf952` | `tests/formats.test.ts` (4) | That file passes, and `npm run schemas` writes four files to `formats/` |
| 3 | Signed event log | `3a5c8a5` | `9388b76` | `tests/log.test.ts` (1), plus truncation coverage in `tests/review.test.ts` | That file passes: a tampered line is caught as event 2 |
| 4 | Masking and reading order | `59d0ced` | `2add80e` | `tests/mask-order.test.ts` (3) | That file passes: masking and reading-order tests |
| 5 | Budget, act rules, Dead Parrot | `ad52797` | `eb48494` | `tests/walk-pure.test.ts` (3) | That file passes: budget, action, and Dead Parrot tests |
| 6 | Guard and fixture site | `3ee1bb0` | `1ecd9de` | `tests/guard.test.ts` (4), plus subrequest coverage in `tests/review.test.ts` | That file passes |
| 7 | Perception | `2f092e5` | `14a2ce6` | `tests/perceive.test.ts` (2), plus masking and viewport checks in `tests/review.test.ts` | That file passes. Met for the tested cases. |
| 8 | Conditions and instrument pass | `1161813` | `ddc2101` | `tests/conditions-inquisition.test.ts` (3) | That file passes with the original floors, including axe `image-alt` at severity 3 |
| 9 | Walk session | `48bd900` | `a00a7eb` | `tests/session.test.ts` (7) | All 7 session tests pass without unhandled errors |
| 10 | MCP server | `9577274` | `13a3ae8` | `tests/mcp.test.ts` (1) | That file passes: exactly five tools, screenshot, markers, duplicate-start refusal, and verified quit |
| 11 | Reproduction | `ebc87b1` | `aad0572` | `tests/replay.test.ts` (1) | That file passes, and the full suite passes |
| 12 | Server README | `6960008` | `3170dfb` | none (docs) | `server/README.md` exists and covers the seven points. The root README's Status line reads as the plan says. The host records the real-agent walk. Documentation met; manual step pending. |

Lane b's Task 9 commit body records its original failures: 3 failed and 4 passed tests, plus 3 unhandled errors. Its Task 11 body records the red full-suite gate. Its Task 12 commit kept the plan's subject but says no real-agent walk occurred. None of those historical results is presented as a pass. Lane b's resume commits below made them green. Lane a's Task 9 passed at its own commit, using deviations D7 to D9. Both evaluators note that committing a red task broke the goal's rule to stop that task and record a gap. The history is kept as it is, because the commit bodies say what failed.

### Commits after the task commits

| Work | Commit | Evidence | Done when |
|---|---|---|---|
| Navigation, fixture, and cleanup (lane b) | `4446198` | Baseline: 3 failed, 4 passed, 3 unhandled errors. After repair: 7 session tests pass; then all 30 original tests pass. | The phone walk, blocked submit, and stale-option tests pass, with cleanup on failure. Met. |
| Small review fixes (lane b) | `c8ad2a5` | Five added tests failed before implementation. After repair, all 15 tests in the five affected files pass. The full suite now has 35 tests. | Tail loss, off-origin mutation, service-worker registration, perception leaks, and unconditional screenshot masking have passing checks. Met. |
| Report refresh (lane b) | `9a767cc`, `4c3e872` | Lane b's report and README updates. Replaced by this merged report. | The report and READMEs agree with the gate results. Met. |
| Merge | The merge commit that adds this report | Lane a's look retry (D8) as a fallback; lane a's closed-tab handler (D7); lane a's example Walker and journey (D12); merged server README and this report. Gates rerun above. | Both gates exit zero on the merged code, and every done-when from both lanes appears in this report. Met. |

### Extra checks

Lane a ran these on its own code, beyond the plan's steps:

- The full suite three times in a row after Task 11. It was 30 of 30 each time.
- `tests/session.test.ts` three times in a row after the vanish-timer fix. It was 7 of 7 each time.
- The built server started without `--run`. It printed the usage line and exited 2.
- The built server started with `--run ../examples/run.json` over stdio. It listed exactly `start_walk, look, act, note, quit`.

The merge ran these on the merged code:

- `npm ci` with npm 10.8.2 on Node 20.20.2 installed the lockfile cleanly.
- `npm ls playwright playwright-core` shows `playwright@1.63.0` and one `playwright-core@1.63.0` (overridden, deduped).
- The full suite three times in a row. It was 35 of 35 each time.
- The built server started without `--run`. It printed `usage: msw-server --run <run.json>` and exited 2.

### Task 12: the scripted stand-in

This is not the manual check. The host still needs to do that. Lane a ran it on lane a's code, before the merge.

The stand-in started the built server over stdio. It walked the example walker and journey on `phone`, with the fixture site on port 4810 and a fresh `out_dir`. It saw:

- the page-text markers and the standing line;
- `Refused: rate at least 2 options` for an act with one rating;
- an MCP input error for an act with no ratings or Wharton answers;
- an accepted act to the About page, then `quit`:

```
Walk saved in runs/example-clean/walks/first-timer-first-timer-learn-phone-en-US. Findings: 5. verified: true. alive: true.
```

Lane a's Task 12 commit body says plainly that no agent walked.

**For the host:** run the manual walk after the safety repairs, and record the actual final quit text. Start it with an empty `out_dir`. A second walk into the same folder will not verify (finding F2). The automated MCP test is not that manual walk.

## Deviations from the plan

Each one is the smallest change the lane could find that kept the task's tests and interfaces. Where the lanes solved the same problem differently, the last column says which one this branch keeps, and why.

| # | Task | What changed | Why | On this branch |
|---|---|---|---|---|
| D1 | 1 | Lane a installed with `npx npm@11 install` and ran on Node 20.20.2. Lane b installed a local Node 22 tool runtime through the registry proxy. Neither commits a runtime. No package version changed. | The box's npm 10.8.2 crashed building vitest 5's peer set: `Cannot read properties of null (reading 'edgesOut')`. | Lane b's lockfile. The merge's `npm ci` with npm 10.8.2 on Node 20 installed it cleanly. |
| D2 | 1 | Lane a ran on Node 20.20.2. The plan says Node 22. | The box had only Node 20. vitest 5 declares `node ^22.12.0` and warns, but it runs, and every gate passes on Node 20. CI is set to Node 22. The server README says Node 22. | The merge's gates ran on Node 20.20.2. Lane b's ran on Node 22.23.3. Both pass. |
| D3 | 2 | Added `"types": ["node"]` to `server/tsconfig.json`. | TypeScript 7 no longer loads `@types/*` by default. Without this, `node:fs` and the other Node imports did not typecheck (TS2591). | Both lanes did this. |
| D4 | 8 | Lane a added `"playwright-core": "1.63.0"` to `dependencies`. Lane b added an `overrides` entry pinning `playwright-core` to `1.63.0`. | `@axe-core/playwright` has a peer dependency `playwright-core >= 1.0.0`, so npm put 1.64.0 at the top level. Two copies broke the exact pin, and their `Page` types did not match (TS2739). | Lane b's override. It forces every copy to 1.63.0, not only the top-level one. `npm ls` shows one 1.63.0. |
| D5 | 8 | `import { AxeBuilder } from "@axe-core/playwright"` instead of the default import. | The package's `types` entry points at its CommonJS declarations. Under `NodeNext`, the default import is the whole module, which cannot be constructed (TS2351). Both the types and the ESM build export `AxeBuilder` by name. | Both lanes did this. |
| D6 | 9 | The `replay.ts` stub accepts the five declared arguments. | The plan's stub took no arguments, and `session.ts` calls it with five (TS2554). Task 11 replaced the stub as planned. | Both lanes did this. |
| D7 | 9 | Lane a: `adopt()` listens for a page's `close` event, drops a closed page and falls back to the last open tab. Lane b: the context's `page` listener adopts only pages with an opener, and the session adopts the pages it opens itself. | Axe 4.13 opens and closes a temporary page without an opener during `analyze()`. The plan's listener adopted it as the current tab, so every later look hit a closed page. In lane a, six of the seven session tests failed with "Target page, context or browser has been closed". | Both. Lane b's opener check keeps the axe page out. Lane a's close handler stays, because evaluator-a found that without it a popup that closes itself leaves the walk on a closed tab (finding F23). Its comment now says so, since the axe page no longer reaches it. Lane a's rebuttal notes a script-opened page with `noopener` may be skipped; that is not confirmed and is kept as finding F21. |
| D8 | 9 | Lane a: `snap()` retries the look after `settle()` when the error is "Execution context was destroyed" or another navigation error, at most 3 times. Lane b: the session registers navigation or popup waits before pressing native links and submit controls. Guard cancellations use the `aborted` error code so Chromium keeps the current document. | A touch tap can return before its navigation commits. Then `settle()` resolves on the old page, and the look runs mid-navigation. | Both. Lane b's wait prevents the race. Lane a's retry stays as a fallback for a navigation that outlasts lane b's 5-second wait. Both rebuttals asked for this. |
| D9 | 9 | Lane a moved the "Vanishing" timer from 1500 ms to 3000 ms. Lane b removed the timer and added a "Remove vanishing" button. The test presses it outside the Walker session and waits for the button to detach. | Every arrival settles, looks, waits 1 second and looks again. The second look came about 1.64 s after start, so the button was already gone from the Walker's first look. | Lane b's button. A timer only moves the timing assumption. The test's stale-state refusal and ten-steps-left assertions are unchanged. Both rebuttals agree. |
| D10 | 7 | Lane a moved the `import type { Page, Locator }` in `mask.ts` to the top of the file. | Tidiness only. ESM hoists imports either way. | Not kept. Lane b left it where the plan puts it. |
| D11 | 1 | Lane a put `.mfx/` and `DONE.json` into `.git/info/exclude`, not `.gitignore`. | The plan's commit step is `git add -A`, which would have committed the host's lane files. | Nothing in the repo changes. |
| D12 | 2 | Wrote the example walker's content. | The plan gives only the fields (visitor, phone, en-US, patience 8, three leave triggers). | Lane a's Walker and journey. They are the fuller person the spec asks for. |
| D13 | 12 | The server README has notes beyond the seven required points: pass `PLAYWRIGHT_BROWSERS_PATH` to the server when Chromium is in a custom place; use a fresh `out_dir` for each walk; the draft's open safety limits. | The MCP SDK's stdio client gives the server only a small default environment, so lane a's stand-in could not find Chromium until the path was passed through. The fresh-folder note documents finding F2. | Kept, with lane b's limits added. |
| D14 | 9, 11 | Session tests and replay cleanup quit in `finally` before deleting evidence. Guard tests close their contexts in `finally` and wait for request failure or the destination URL instead of fixed sleeps. Startup failures close the browser. `quit` closes it even if appending the quit event fails. | Lane b's original Task 9 run left browsers open after failures. The plan's one-second pause between arrival screenshots is unchanged. | Lane b's. |
| D15 | 3, 6, 7 | Lane b's small review repairs. Verification checks event order, count, and the remembered final HMAC, and rejects malformed lines. Off-origin mutating subrequests are blocked in both modes. Walk contexts block service workers. Password and payment screenshot masks are unconditional. Returned accessible names are masked when masking is on. Text collection checks horizontal viewport bounds. | Lane b's host authorized small review repairs that keep interfaces. Five added regression tests cover them. | Kept. |

Test files: lane a changed no test file. Lane b's test changes, kept here, only add deterministic fixture control, event waits, cleanup, and new review coverage. Original assertions and instrument severity floors are retained.

The plan already substitutes address, visible text, and options for screenshot bytes in the state hash. It uses DOM control collection instead of the spec's accessibility snapshot, approximates text scale with root font size, and records translation as unsupported. Those choices remain documented in the server README.

Done when: every change from the plan has a reason recorded here. Met.

## Review findings

Lane a ran lenses 1, 3, 5, 7 and 9. Lane b ran lenses 2, 4, 6 and 8. Neither lane had the lens catalog during its build, so each ran its supplied lens names plus a general correctness and safety pass. The rebuttals then applied each lane's lenses to the other lane's code. The two evaluators applied lenses 3 and 9 (see "Evaluator reviews").

"Confirmed" means a lane ran code that showed it. "Code reading" means it was found by reading and not reproduced. The status column is for this branch.

| # | Source | Severity | Finding | How known | Status on this branch |
|---|---|---|---|---|---|
| F1 | a, lens 9 | high (safety) | Read-only stopped mutating requests only to the journey's origins. A script on the page could still `POST` to another origin, and so could a cross-origin iframe, such as an embedded donation widget or a third-party form service. A probe page on `127.0.0.1` sent a `fetch` POST to `localhost`, and nothing was recorded as blocked. Spec 5.6 says "to the journey's origins", so the plan matches the spec's words. It breaks spec 12's promise that read-only is safe by default. | Confirmed | **Fixed for the reported path** (lane b). Off-origin mutating requests are blocked in both modes. A real cross-origin POST probe now reaches no server mutation endpoint. Two side effects remain open. A third-party payment POST in a transact walk is blocked unless its origin is on the journey's list. Every such block is recorded as `left-site`, so a background analytics POST tells the Walker "That leads off this site". |
| F2 | a, lens 9; b, run evidence | medium | A second walk with the same Walker, journey, viewport and locale in the same `out_dir` appends to the old `events.jsonl`. Sequence numbers restart at 1, the key is new, and the log never verifies. `findings.jsonl` and `instrument.jsonl` are appended too, and screenshots are overwritten. Lane a's stand-in's first try showed three `start` events in one file and `verified: false`. | Confirmed | Open. Lane b's tail check makes the second walk fail to verify loudly, but the two walks still share one log. |
| F3 | a, lens 1 | medium | A page that never goes network-idle is charged "slow page" on every arrival, even when it loads fast. Polling, analytics beacons and live chat all do this. `settle()` caps the network-idle wait at 3000 ms, and the charge is for anything over 3000 ms, so the cap itself trips the charge. A fast page polling every 200 ms took 4.6 s to arrive and cost 1 patience. A Walker with patience 10 would run away after about 10 acts on such a site. | Confirmed | Open. Both lanes' code has it. |
| F4 | a, lens 3; evaluator-a | medium | Suppose the MCP `quit` throws after the browser has closed (for example, a disk error writing `findings.jsonl` or `seal.json`, or a replay error). The server never clears `session`. Every later `start_walk` says "A walk is already in progress". Every `quit` says "no walk in progress". Only a restart frees it. The fix is to clear `session` in a `finally`. | Code reading | Open. Lane b's `finally` in `WalkSession.quit` frees the browser, but the MCP gate stays shut until a restart. Evaluator-a adds that lane b's `finally` makes this more likely: if the quit event cannot be written, the browser is already gone, so a second `quit` cannot succeed. In lane a's code that retry could still work. The fix needs both parts: lane b's `finally` and `session = null` in a `finally` in the MCP `quit` handler. |
| F5 | a, lens 3 | low | If `start` fails after Chromium has launched (for example, `setupConditions` throws), the MCP server drops the session without closing the browser. Chromium keeps running. | Code reading | **Fixed** (lane b). Startup failures close the browser. |
| F6 | a, lens 5 | medium | Instrument records made while a new page loads carry the previous page's state hash. In lane a's stand-in log, events 8 to 10 (the About page's console errors and its missing image) carry the home page's state. A report that groups instrument records by page will file them under the wrong page. The Dead Parrot check passes only because the axe and vitals records carry the right state. `onBlocked` has the same lag. | Confirmed | Open. Both lanes' code has it. |
| F7 | a, lens 5 | low | The route handler adds blocked-request notes on its own schedule. A block that lands after the arrival's second look shows up one result late. | Code reading | Open. |
| F8 | a, lens 7 | low | Timing values and floors are written as numbers inside the code that uses them, in several files. In `session.ts`: the 3000 ms slow page, the 10 s and 3 s settle waits, the 1000 ms second look, the 0.8 scroll and the 5 s tap timeout. Elsewhere: the 500 ms act gap (`parrot.ts`), the 12 px row band (`order.ts`), the slow-3g numbers (`conditions.ts`), and the severity floors with LCP 4000 and CLS 0.25 (`inquisition.ts`). The viewport names are typed out three times (`viewports.ts`, `schemas.ts`, `server.ts`), and the finding kinds twice (`schemas.ts`, `server.ts`). Plan B's reports will need the same floors. | Code reading | Open. Lane b's navigation wait adds another 5-second timeout. |
| F9 | a, lens 9; b, missing rules | medium | Spec 5.3 rule 1 says a refused act is logged. Through MCP, an act missing `ratings` or `wharton` fails the tool's input schema and never reaches the session, so no `refused` event is written. Lane a's stand-in got an MCP error (-32602) for such an act, and its log has only one `refused` event (for the one-rating act). | Confirmed | Open. |
| F10 | a, lens 9; b, lens 2 | low | Spec 12 says typed values in payment fields are masked in events. Card numbers are masked, but only because they look like phone numbers. A security code or expiry typed into a `cc-` field is stored as typed in `events.jsonl`. | Code reading | Open. |
| F11 | a, lens 9 | low | `expire_session_at_step` clears every cookie in the browser. Spec 6.2 says only cookies for the journey's origins. The README says what the code does. | Code reading | Open. |
| F12 | b, truncated log | high | `verify()` accepted a valid prefix of the log: a removed tail, an empty file, or a malformed event passed. | Confirmed | **Fixed during the live session** (lane b). A valid prefix, empty file, and malformed event all fail verification. The HMAC key is still memory-only, so independent report-time verification after process exit remains open. |
| F13 | b, service workers | medium | `context.route` does not see requests a service worker makes, so a worker could send what the guard would block. | Code reading | **Fixed for walk contexts** (lane b). Context creation blocks service workers. The regression attempts a real registration and confirms no worker exists. |
| F14 | b, lens 2 | medium | Mandatory password and payment screenshot masking turned off when `mask_personal_data` was off. `payment_test_mode` is declared but never consulted. Admin transact, test-copy and seeded-data requirements are not fully enforced. | Confirmed (payment flag) | **Partly fixed** (lane b). Password and payment screenshot masks no longer depend on `mask_personal_data`. Payment values in action events can still escape masking. `payment_test_mode` is unused. Admin requirements are open. |
| F15 | b, lens 4; evaluator-a | medium | Axe inspection failures are swallowed: `inspectPage(...).catch(() => {})`. The state is marked inspected before the run, so one failed axe run is never retried for that page, and the Dead Parrot check may then report no instrument record for it. Declined cookies do not block HTTP `Set-Cookie` storage. | Code reading | Open. Both lanes' code has it. |
| F16 | b, lens 6 | medium | Perception returned horizontally offscreen text, and option accessible names were not masked (an email in an `aria-label` came through). Full clipping and occlusion handling and masking of every text record are incomplete. Payment action values, URLs, finding text, and instrument text need a broader audit. Option names are cut to 120 characters before hashing and replay matching, so two distinct long names can look the same. | Confirmed (offscreen text, option emails) | **Partly fixed** (lane b). Horizontal offscreen text is excluded, and `aria-label` email addresses are masked in returned options. Clipping, occlusion, the wider masking audit and the 120-character cut are open. |
| F17 | b, run evidence | medium | No run manifest records inputs, versions, and times. Repeated walks reuse a folder and can mix evidence (F2). No independent report-time verification is supplied (F12). | Code reading | Open. |
| F18 | b, missing rules | medium | Phone-blocking, required-step run-away, and impossible-journey severity floors are not implemented. Blocked submits lack masked visible field data. | Code reading | Open. |
| F19 | b, lifecycle; a, lens 1 | medium | `wait` can incur a no-change patience charge. Slow-network emulation applies only to the first page. MCP disconnect and concurrent-call lifecycle are not covered. The offline-restore `setTimeout` can fire after the walk has ended. | Code reading | Open. |
| F20 | a, lens 1 (rebuttal) | medium | Lane b's navigation wait has a 5-second timeout, and its error is swallowed. Under slow-3g a navigation longer than 5 s falls through to `settle()`, which can resolve on the old page. | Code reading | **Partly addressed** by the merge. Lane a's look retry now catches a look that hits a navigation mid-flight. A look that completes on the old page is not caught. |
| F21 | a, lens 9 (rebuttal) | low | `context.on("page", ...)` adopts only pages with an opener, so a page opened by script with `noopener` may be skipped. | Code reading, not confirmed | Open. |
| F22 | b, lens 8 | low | The house voice check. Humor is confined to the server README opening. Failures and limits are stated directly. Lane b asked to delete the README line "The rest of this page is plain." | Checked | Done. The line is removed. |
| F23 | evaluator-a, lens 3 | medium | In lane b's code a closed current tab strands the walk. If a popup closes itself, `this.page` points at a closed page, every `look` and `act` throws, and the Walker can never reach `switch tab`. | Code reading | **Fixed** by taking lane a's close handler (D7). One gap is left: if the last page closes, there is no current page. That needs a page to close its last tab, so it is low. |
| F24 | evaluator-b, lens 9 | medium | Replay matches options by display name and role. Duplicate names select the first match. Names are cut to 120 characters. Lane b's name masking means two different email `aria-label`s both become `[masked]`, so replay can pick the wrong control. | Code reading | Open. Keep the masking, but separate display text from the identity replay uses, and reject ambiguous matches. |
| F25 | evaluator-b, lens 9 | medium | The event log, its sequence numbers, the signing chain, the state binding and the finding derivation form a data contract. No document in either tree defines its writer and reader rules. | Code reading | Open. |

The probes all used synthetic local fixtures.

Done when: each finding has a status on this branch, and no open finding is described as fixed. Met.

## Evaluator reviews

Two evaluators reviewed both frozen drafts and the rebuttal snapshot independently. Each got only its own lens. The shared rubric was the original goal's acceptance criteria.

- **evaluator-a**, model claude-opus-5-5[1m], lens 3 (self-referential gating = strand risk): `docs/reviews/mfx-msw-walk-server/pair-evaluator-a.md`. It prefers lane a. Lane a found the main strand (F4), its close handler keeps a closed popup from stranding the walk, and its `quit` keeps a failed log write retryable. Its strongest counterargument is that lane b fixed real safety holes that lane a only reported. It recommends lane b's safety fixes plus lane a's close handler. New findings: F23, and the additions to F4 and F15.
- **evaluator-b**, model gpt-6-astra, lens 9 (invariant hygiene): `docs/reviews/mfx-msw-walk-server/pair-evaluator-b.md`. It prefers lane b, for its log-completeness invariant and regression coverage. Its strongest counterargument is lane a's better diagnosis of state attribution (F6), backed by a stdio reproduction. New findings: F24 and F25. It also corrected lane a's rebuttal: an allowed payment origin passes lane b's guard in transact mode.

Evaluator-b's first run could not start: the box's kernel does not allow codex's sandbox to create a namespace. It ran again without that sandbox, on the same model, prompt and packet.

The merge follows both recommendations where they overlap: lane b's code and safety fixes as the base, with lane a's close handler and look retry added.

### Corrections made during the merge

- Lane a's server README said the `wait` move is not charged patience. The code charges the ordinary no-change patience when the page does not change. The README now says so, as lane b's did.
- Lane a's report said `npm ci` against the lockfile was untested. The merge ran it with the box's npm 10.8.2, and it installed cleanly.
- Lane b's report says it used generation 1 and tested code head `c8ad2a5`. Its DONE.json records generation 2 at head `4c3e872`. This report's gate lines are from the merge's own runs.
- Lane a's rebuttal said lane b's guard blocks a legitimate third-party payment POST in transact mode. That is true only when the payment origin is not on the journey's list (evaluator-b). F1 now says so.

## Decisions for a human

```yaml
decision: What should the blocking of off-origin writes look like now? (findings F1, F20)
context: This branch already blocks every POST, PUT, PATCH and DELETE to an origin outside the journey's list, in both modes (lane b's fix, close to option a below).
options:
  a: Keep it. Block every off-origin write in both modes, record each one, and tell the Walker.
  b: Keep the spec's words. Block only requests to the journey's origins, and say in the README that third-party requests go through.
  c: Block requests to the journey's origins plus any origin on a new per-run list.
recommendation: a, with two follow-ups. Record a background write as its own kind instead of "left-site", and let a transact walk list its payment provider. A read-only walk should never send a donation through an embedded widget. Analytics beacons get blocked too, which is harmless.
```

```yaml
decision: What should a second walk into the same folder do? (finding F2)
options:
  a: start_walk refuses when the walk folder already has an events.jsonl, and the error names the folder.
  b: Each walk gets a new folder with a time or counter suffix.
  c: Leave it as is. The README now tells people to use a fresh out_dir.
recommendation: a. It never mixes two walks in one log, and it never deletes evidence. Both lanes' rebuttals agree.
```

```yaml
decision: How should "slow page" be measured? (finding F3)
options:
  a: Charge when the load event takes over 3 seconds. Keep the network-idle wait before screenshots, but do not count it.
  b: Keep the current rule (load plus network idle, capped at 3 seconds).
recommendation: a. Spec 5.4 charges for a slow page, not for a page that keeps polling. Lane b's rebuttal also asks to measure load time separately from network-idle settling.
```

```yaml
decision: When should the confirmed defects (F2, F3, F6, F9) and the quit strand (F4) be fixed?
options:
  a: In a short follow-up on this branch, after the merge and before plan B starts.
  b: Inside plan B.
  c: Leave them, and record them as known issues.
recommendation: a. Plan B's reports read these logs. F6 would put errors under the wrong page in the first report.
```

```yaml
decision: Resolve the remaining safety and spec findings (F10, F14 to F19) before real use?
options:
  a: Add corrective tasks before use on real data.
  b: Merge as a draft with these limits.
recommendation: a. The green suite covers the planned cases and five added checks; it does not establish the missing rules.
```

```yaml
decision: When should the host do the manual walk (Task 12 step 3)?
recommendation: After the safety repairs. Record the actual final quit text. The automated MCP test is not that manual walk.
```

Done when: the merge has this committed report and a valid DONE.json, and the host has the rebuttal snapshot and both evaluator reviews. Met.

## What came from where

Lane b gave the code spine. This branch is lane b's commits as they are, because its small safety repairs closed holes that lane a only reported, and both lanes' rebuttals asked for them. From lane a the merge took two pieces of Task 9 session code: the look retry, kept as a fallback behind lane b's navigation wait, and the closed-tab handler, kept because evaluator-a showed a self-closing popup strands lane b's walk. It also took lane a's example Walker and journey, which are the fuller person the plan asks for. Lane a also gave the report's structure: the task table, the deviation table, the findings table with confirmed or code-reading evidence, and the decision blocks. Lane b gave the resume-commit table, the done-when lines, and findings F12 to F19 and F22. Lane a gave F1 to F11, F20 and F21. The server README is lane a's concrete text with lane b's current limits and done-when lines. Left out from lane a: the longer Vanishing timer (lane b's remove button tests the same thing without a timing guess), the direct `playwright-core` dependency (lane b's override pins every copy), the moved import in `mask.ts` (lane b's follows the plan) and the fixture pages' extra viewport tags and wording (trivia), and the sentence "The rest of this page is plain." (lane b's voice check asked to cut it). Left out from lane b: its example Walker and journey, and its report text where lane a's said the same thing more concretely. The lanes disagreed on whether `wait` costs patience; the code shows it can, so lane b was right. The evaluators disagreed on the base, lane a for lifecycle and lane b for evidence integrity. The merge took lane b's base with lane a's lifecycle pieces, which is what both evaluators' merge advice comes to. Lane a's argument that its findings should be fixed before plan B is kept as a decision for a human, not done here.
