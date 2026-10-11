# Plan A build report: the walk server (lane a)

*Date: 2026-10-11. Branch: `mfx/msw-walk-server-a`. Plan: `docs/superpowers/plans/2026-10-11-msw-plan-a-server.md`.*

Split unavailable: lane a has not seen the other draft.

## Result

All twelve tasks are built and committed, one commit per task, with the plan's commit messages.

Both gates pass, run from `server/` on the final code:

- `npm run typecheck`: exit 0, no errors. Last line: `> tsc -p tsconfig.json --noEmit`.
- `npm test`: exit 0. Last lines: `Test Files  11 passed (11)` and `Tests  30 passed (30)`.

No test was weakened. No floor was changed. No test file differs from the plan. One fixture timer does (deviation D9).

## What I did not do

- **Task 12 step 3, the manual walk with a real agent.** The goal reserves it for the host. I ran a scripted stand-in instead. It used no model, so it is not a substitute (see Task 12).
- **CI.** The box does not push, so `.github/workflows/ci.yml` has never run. In particular, `npm ci` with Node 22's bundled npm against this lockfile is untested (see deviation D1).
- **Fixes beyond the plan.** The review found real defects. Several are confirmed by running the code. I did not fix them, because the goal says to build the plan as written. They are listed under "Review findings", and the choices are under "Decisions for a human".
- **`npx playwright install`.** Not run, as the box rules say. The preinstalled Chromium 1243 was used.

## Tasks

Each done-when can be checked from `server/` with the command given.

| # | Task | Commit | Tests | Done when |
|---|---|---|---|---|
| 1 | Scaffold and CI | `70b5b1e` | `tests/smoke.test.ts` (1) | `npx vitest run tests/smoke.test.ts` passes: Chromium launches |
| 2 | Formats | `0ddf952` | `tests/formats.test.ts` (4) | That file passes, and `npm run schemas` writes four files to `formats/` |
| 3 | Signed event log | `9388b76` | `tests/log.test.ts` (1) | That file passes: a tampered line is caught as event 2 |
| 4 | Masking and reading order | `2add80e` | `tests/mask-order.test.ts` (3) | That file passes |
| 5 | Budget, act rules, Dead Parrot | `eb48494` | `tests/walk-pure.test.ts` (3) | That file passes |
| 6 | Guard and fixture site | `1ecd9de` | `tests/guard.test.ts` (4) | That file passes |
| 7 | Perception | `14a2ce6` | `tests/perceive.test.ts` (2) | That file passes |
| 8 | Conditions and instrument pass | `ddc2101` | `tests/conditions-inquisition.test.ts` (3) | That file passes, including axe `image-alt` at severity 3 |
| 9 | Walk session | `a00a7eb` | `tests/session.test.ts` (7) | That file passes |
| 10 | MCP server | `13a3ae8` | `tests/mcp.test.ts` (1) | That file passes |
| 11 | Reproduction | `aad0572` | `tests/replay.test.ts` (1) | That file passes, and `npm test` is 30 of 30 |
| 12 | Server README | `3170dfb` | none (docs) | `server/README.md` exists and covers the seven points. The root README's Status line reads as the plan says |

Extra checks I ran, beyond the plan's steps:

- I ran the full suite three times in a row after Task 11. It was 30 of 30 each time.
- I ran `tests/session.test.ts` three times in a row after the vanish-timer fix. It was 7 of 7 each time.
- I built the server and started it without `--run`. It printed the usage line and exited 2.
- I started the built server with `--run ../examples/run.json` over stdio. It listed exactly `start_walk, look, act, note, quit`.

### Task 12: the scripted stand-in

This is not the manual check. The host still needs to do that.

The stand-in started the built server over stdio. It walked the example walker and journey on `phone`, with the fixture site on port 4810 and a fresh `out_dir`. It saw:

- the page-text markers and the standing line;
- `Refused: rate at least 2 options` for an act with one rating;
- an MCP input error for an act with no ratings or Wharton answers;
- an accepted act to the About page, then `quit`:

```
Walk saved in runs/example-clean/walks/first-timer-first-timer-learn-phone-en-US. Findings: 5. verified: true. alive: true.
```

The commit body for Task 12 says plainly that no agent walked.

**For the host:** start the manual check with an empty `out_dir`. A second walk into the same folder will not verify (finding F2).

## Deviations from the plan

Each one is the smallest change I could find that kept the task's tests and interfaces.

| # | Task | What changed | Why |
|---|---|---|---|
| D1 | 1 | Installed with `npx npm@11 install` instead of `npm install`. No package version changed. | The box's npm 10.8.2 crashed building vitest 5's peer set: `Cannot read properties of null (reading 'edgesOut')`. npm 11 installed the same versions cleanly. The lockfile is version 3. |
| D2 | 1 | Ran on Node 20.20.2. The plan says Node 22. | The box has only Node 20. vitest 5 declares `node ^22.12.0` and warns, but it runs, and every gate passes on Node 20. CI is set to Node 22. The server README says Node 22. |
| D3 | 2 | Added `"types": ["node"]` to `server/tsconfig.json`. | TypeScript 7 no longer loads `@types/*` by default. Without this, `node:fs` and the other Node imports did not typecheck (TS2591). |
| D4 | 8 | Added `"playwright-core": "1.63.0"` (exact) to `dependencies`. | `@axe-core/playwright` has a peer dependency `playwright-core >= 1.0.0`, so npm put 1.64.0 at the top level. `playwright` 1.63.0 kept its own 1.63.0. Two copies broke the exact pin, and their `Page` types did not match (TS2739). With the direct pin, `npm ls` shows one deduped 1.63.0. |
| D5 | 8 | `import { AxeBuilder } from "@axe-core/playwright"` instead of the default import. | The package's `types` entry points at its CommonJS declarations. Under `NodeNext`, the default import is the whole module, which cannot be constructed (TS2351). Both the types and the ESM build export `AxeBuilder` by name. |
| D6 | 9 | The `replay.ts` stub takes `(..._args: unknown[])`. | The plan's stub took no arguments, and `session.ts` calls it with five (TS2554). Task 11 replaced the stub as planned. |
| D7 | 9 | In `session.ts`, `adopt()` listens for a page's `close` event. A closed page is dropped from the tab list, and the current tab falls back to the last open one. | `AxeBuilder.analyze()` opens a blank page in the same context and closes it (`dist/index.mjs`, lines 313 and 334). The session's `context.on("page")` adopted it as the current tab, so every later look hit a closed page. Six of the seven session tests failed with "Target page, context or browser has been closed". |
| D8 | 9 | In `session.ts`, `snap()` retries the look after `settle()` when the error is "Execution context was destroyed" or another navigation error. It tries at most 3 times. | A tap or click can return before its navigation commits. Then `settle()`'s `waitForLoadState("load")` resolves on the old page, and the look runs mid-navigation. Two session tests failed this way. |
| D9 | 9 | In `tests/fixtures/site/spa.html`, the "Vanishing" button's timer went from 1500 ms to 3000 ms. The test file is unchanged. | Every arrival settles, looks, waits 1 second and looks again. I measured the second look at about 1.64 s after start, so the button was already gone from the Walker's first look, and the test could not find it. At 3000 ms the button is there in that look. It is gone before the act, because the test's 1.6 s wait starts only after `start` returns (at least about 3.1 s after load). The test still checks the same thing: an element that vanished between look and act is refused and costs no step. |
| D10 | 7 | The `import type { Page, Locator }` added to `mask.ts` went at the top of the file, not the middle. | Tidiness only. ESM hoists imports either way. |
| D11 | 1 | `.mfx/` and `DONE.json` went into `.git/info/exclude`, not `.gitignore`. | The plan's commit step is `git add -A`, which would have committed the host's lane files. A local exclude keeps them out without changing the plan's `.gitignore`. |
| D12 | 2 | Wrote the example walker's content. | The plan gives only the fields (visitor, phone, en-US, patience 8, three leave triggers). |
| D13 | 12 | The server README has two notes beyond the seven required points: pass `PLAYWRIGHT_BROWSERS_PATH` to the server when Chromium is in a custom place, and use a fresh `out_dir` for each walk. | The MCP SDK's stdio client gives the server only a small default environment, so the stand-in could not find Chromium until I passed it through. The fresh-folder note documents finding F2. |

## Review findings (not fixed)

I ran all five of my lenses (1, 3, 5, 7, 9). The lens file was not available to me, so I could not read the other lenses' names. I ran a general correctness and safety pass in their place.

"Confirmed" means I ran code that showed it. "Code reading" means I found it by reading and did not reproduce it.

| # | Lens | Severity | Finding | How known |
|---|---|---|---|---|
| F1 | 9 | high (safety) | Read-only stops mutating requests only to the journey's origins. A script on the page can still `POST` to another origin, and so can a cross-origin iframe. Examples: an embedded donation widget, or a third-party form service. A probe page on `127.0.0.1` sent a `fetch` POST to `localhost`. The server received it, and nothing was recorded as blocked. Spec 5.6 says "to the journey's origins", so the plan matches the spec's words. It breaks spec 12's promise that read-only is safe by default. | Confirmed |
| F2 | 9 | medium | A second walk with the same Walker, journey, viewport and locale in the same `out_dir` appends to the old `events.jsonl`. Sequence numbers restart at 1, the key is new, and the log never verifies. `findings.jsonl` and `instrument.jsonl` are appended too, and screenshots are overwritten. The stand-in's first try showed three `start` events in one file and `verified: false`. | Confirmed |
| F3 | 1 | medium | A page that never goes network-idle is charged "slow page" on every arrival, even when it loads fast. Polling, analytics beacons and live chat all do this. `settle()` caps the network-idle wait at 3000 ms, and the charge is for anything over 3000 ms, so the cap itself trips the charge. A fast page polling every 200 ms took 4.6 s to arrive and cost 1 patience. A Walker with patience 10 would run away after about 10 acts on such a site. | Confirmed |
| F4 | 3 | medium | Suppose the MCP `quit` throws after the browser has closed (for example, a disk error writing `seal.json`). The server never clears `session`. Every later `start_walk` says "A walk is already in progress". Every `quit` says "no walk in progress". Only a restart frees it. The fix is to clear `session` in a `finally`. | Code reading |
| F5 | 3 | low | If `start` fails after Chromium has launched (for example, `setupConditions` throws), the MCP server drops the session without closing the browser. Chromium keeps running. | Code reading |
| F6 | 5 | medium | Instrument records made while a new page loads carry the previous page's state hash. In the stand-in's log, events 8 to 10 (the About page's console errors and its missing image) carry the home page's state. A report that groups instrument records by page will file them under the wrong page. The Dead Parrot check passes only because the axe and vitals records carry the right state. | Confirmed |
| F7 | 5 | low | The route handler adds blocked-request notes on its own schedule. A block that lands after the arrival's second look shows up one result late. | Code reading |
| F8 | 7 | low | Timing values and floors are written as numbers inside the code that uses them, in several files. In `session.ts`: the 3000 ms slow page, the 10 s and 3 s settle waits, the 1000 ms second look, the 0.8 scroll and the 5 s tap timeout. Elsewhere: the 500 ms act gap (`parrot.ts`), the 12 px row band (`order.ts`), the slow-3g numbers (`conditions.ts`), and the severity floors with LCP 4000 and CLS 0.25 (`inquisition.ts`). The viewport names are typed out three times (`viewports.ts`, `schemas.ts`, `server.ts`), and the finding kinds twice (`schemas.ts`, `server.ts`). Plan B's reports will need the same floors. | Code reading |
| F9 | 9 | medium | Spec 5.3 rule 1 says a refused act is logged. Through MCP, an act missing `ratings` or `wharton` fails the tool's input schema and never reaches the session, so no `refused` event is written. The stand-in got an MCP error (-32602) for such an act, and its log has only one `refused` event (for the one-rating act). | Confirmed |
| F10 | 9 | low | Spec 12 says typed values in payment fields are masked in events. Card numbers are masked, but only because they look like phone numbers. A security code or expiry typed into a `cc-` field is stored as typed in `events.jsonl`. | Code reading |
| F11 | 9 | low | `expire_session_at_step` clears every cookie in the browser. Spec 6.2 says only cookies for the journey's origins. The README says what the code does. | Code reading |

## Decisions for a human

```yaml
decision: What should read-only block? (finding F1)
options:
  a: Block every POST, PUT, PATCH and DELETE from any origin, record each as would-submit, and tell the Walker.
  b: Keep the spec's words. Block only requests to the journey's origins, and say in the README that third-party requests go through.
  c: Block requests to the journey's origins plus any origin on a new per-run list.
recommendation: a. A read-only walk should never send a donation through an embedded widget. Analytics beacons get blocked too, which is harmless.
```

```yaml
decision: What should a second walk into the same folder do? (finding F2)
options:
  a: start_walk refuses when the walk folder already has an events.jsonl, and the error names the folder.
  b: Each walk gets a new folder with a time or counter suffix.
  c: Leave it as is. The README now tells people to use a fresh out_dir.
recommendation: a. It never mixes two walks in one log, and it never deletes evidence.
```

```yaml
decision: How should "slow page" be measured? (finding F3)
options:
  a: Charge when the load event takes over 3 seconds. Keep the network-idle wait before screenshots, but do not count it.
  b: Keep the current rule (load plus network idle, capped at 3 seconds).
recommendation: a. Spec 5.4 charges for a slow page, not for a page that keeps polling.
```

```yaml
decision: When should the confirmed defects (F2, F3, F6, F9) and the quit strand (F4) be fixed?
options:
  a: In a short follow-up on this branch, after the merge and before plan B starts.
  b: Inside plan B.
  c: Leave them, and record them as known issues.
recommendation: a. Plan B's reports read these logs. F6 would put errors under the wrong page in the first report.
```
