# Plan A build report — lane b

Result: **FAILED. The build bar is not met.** Type checking and compilation pass. The full test run has 27 passing tests, 3 failing tests, and 3 unhandled errors. Task 9 was stopped under the goal's rule for a test that cannot pass as written. No test or severity floor was weakened.

Split unavailable: lane b has not seen the other draft.

Done when: `cd server && npm run typecheck && npm test` exits zero, the gaps below have been resolved, and the completion record validates. This draft does not meet that condition.

## Orient and resume

Read the complete goal, implementation plan, and required design sections before implementing. The goal did not contain a section labeled STEP 0. Checked this lane's branch, status, recent commits, and generation instead. The lane started at `6209cae`, with no implementation, report, or completion record to resume. Generation is 0. No sibling work was read. No push or pull request was made.

The named superpowers execution skills were not available in this session. The task steps were followed directly. The full review-lens catalog was not present in this clone; the goal supplied only lens names 2, 4, 6, and 8. The review below does not claim coverage of unavailable lens definitions.

Done when: the starting revision, lane, generation, and prior work are recorded. They are recorded here and in DONE.json.

## Tasks and commits

Every planned test file was copied without changing its assertions. A final comparison confirmed all 11 test files still match the plan's code blocks. Each Task 2–11 test was run before its implementation and failed. Task 1 uses the plan's scaffold smoke check rather than an intentionally failing assertion. Task 12 is documentation and the host's manual check.

| Task | Commit | Tests and outcome | Done when |
|---|---|---|---|
| 1. Scaffold and CI | `bdde69c` | `npm test`: 1 passed. Chromium launched. | The smoke test passes and the CI file exists. Met. |
| 2. Formats | `cbc0da8` | Missing-module failure, then `npx vitest run tests/formats.test.ts`: 4 passed. `npm run schemas` wrote four schemas. | The format tests pass and all four schema files exist. Met. |
| 3. Event log | `3a5c8a5` | Missing-module failure, then `npx vitest run tests/log.test.ts`: 1 passed. | The planned chain and tampering test passes. Met; truncation remains a review gap. |
| 4. Masking and order | `59d0ced` | Missing-module failure, then `npx vitest run tests/mask-order.test.ts`: 3 passed. | The planned text and order assertions pass. Met. |
| 5. Budget and rules | `ad52797` | Missing-module failure, then `npx vitest run tests/walk-pure.test.ts`: 3 passed. | The budget, action, and Dead Parrot tests pass. Met. |
| 6. Guard and fixtures | `3ee1bb0` | Missing-module failure, then `npx vitest run tests/guard.test.ts`: 4 passed. | The planned read-only, origin, and transact tests pass. Met. |
| 7. Perception | `2f092e5` | Missing-module failure, then `npx vitest run tests/perceive.test.ts`: 2 passed. | Option order, masking, stable state, and fixed moves pass. Met for the planned cases. |
| 8. Conditions and instruments | `1161813` | Missing-module failure, then `npx vitest run tests/conditions-inquisition.test.ts`: 3 passed. Type checking passed after compatibility fixes. | Conditions and instrument floors pass their tests. Met. |
| 9. Walk session | `48bd900` | Missing-module failure; initial implementation: 6 failed, 1 passed. After the axe compatibility fix: 3 failed, 4 passed, 3 unhandled errors. | `npx vitest run tests/session.test.ts` passes all 7 tests. Not met; task stopped. |
| 10. MCP | `9577274` | Missing-module failure, then `npx vitest run tests/mcp.test.ts`: 1 passed. Type checking passed. | Exactly five tools are listed; screenshot, markers, duplicate-start refusal, and verified quit assertions pass. Met. |
| 11. Replay | `ebc87b1` | The stub failed `reproduced === true`. After implementation the replay test passed in the full suite. Full suite: 27 passed, 3 failed. Type checking passed. | Replay passes and the full suite is green. Not met because Task 9 still fails. |
| 12. README | `6960008` | `npm run build` passed. Both READMEs updated. Manual check skipped for the host. | Documentation exists and the host records the real-agent walk. Documentation met; manual check deferred by instruction. |

Task 9's incomplete implementation was committed to preserve a reviewable draft. Its commit body states the failures. Task 11's commit body states the failing full-suite gate. Task 12's required commit subject was kept, but its body explicitly says no real-agent walk occurred.

## Gate output

Commands ran under Node 22.23.3 with the supplied Chromium. No browser download command ran in this box. Dependency installation reported zero vulnerabilities.

`cd server && npm run typecheck` exited 0. Its last nonempty lines were:

```text
> @msw/server@0.0.1 typecheck
> tsc -p tsconfig.json --noEmit
```

`cd server && npm test` exited 1. Its last lines at the Task 11 gate were:

```text
 Test Files  1 failed | 10 passed (11)
      Tests  3 failed | 27 passed (30)
     Errors  3 errors
   Start at  15:28:27
   Duration  25.38s (tests 85%, import 12%, transform 2%)
```

`cd server && npm run build` exited 0. Its last line was `> tsc -p tsconfig.json`.

The final completion record includes the exit codes and revision for the final verification run. Timing and race-related failure counts can vary; no failed test is excluded.

Done when: both required gates exit zero. The test gate remains red.

## Deviations and reasons

1. The shell's Node 20 runtime caused npm to fail with `Cannot read properties of null (reading 'edgesOut')`. Installed a local Node 22 tool runtime through the normal registry proxy and reran successfully. No application dependency version was relaxed. The tool runtime is not committed.
2. Added `types: ["node"]` to `tsconfig.json`. TypeScript 7 did not include the installed Node declarations automatically, causing TS2591 for Node modules and Buffer.
3. Changed axe's default import to its named `AxeBuilder` export. The installed package's NodeNext types rejected construction through the default import with TS2351.
4. Added an npm override pinning `playwright-core` to 1.63.0. Axe's range otherwise installed a different core version whose `Page` type required `getByRef` and `webmcp`, producing TS2739 against the required Playwright version. The override keeps the single pinned browser API.
5. Gave Task 9's temporary replay stub the declared five-argument signature. The zero-argument sample caused TS2554 at its call site. Task 11 then replaced the stub as planned.
6. Changed page adoption to follow real popups with an opener and explicitly adopt pages opened by the session. Axe 4.13 opens and closes a temporary page while analyzing. The original listener adopted that page and left the walk pointed at a closed page. The correction restored the normal page without weakening tests or floors.
7. Stopped Task 9 after confirming its unchanged timing conflict. The fixture removes `Vanishing` at 1,500 ms. Startup waits for network idle, then takes a screenshot, waits 1,000 ms, and takes the returned screenshot. The target is already absent when the test calls `n(r0, "Vanishing")`. That helper throws before the stale-state assertion runs. Altering the test, fixture deadline, or prescribed arrival sequence would depart from the brief's stop rule.
8. Continued the later tasks against the reviewable draft. Tasks 10 and the replay-specific check pass, but Task 11's whole-suite condition remains unmet.
9. Kept the requested root README Status line and added an immediate build qualification so it does not conceal the failures. The server README distinguishes current behavior from the spec where the plan omits an enforcement rule or artifact.
10. Skipped Task 12 step 3 as expressly required. No agent quit text was fabricated or added to the commit body.

The plan itself already changes the state hash from screenshot bytes to address, visible text, and options. It approximates text scale with root font size and records translation as unsupported. Those choices were retained and documented. Options use the plan's DOM-based collection rather than the spec's accessibility snapshot.

Done when: each code difference from the plan has a reason in this list. The source and test comparison found only the compatibility changes listed above.

## Remaining failures

- The short phone walk can call `page.evaluate` while a tap-triggered navigation replaces the document. It fails with “Execution context was destroyed.” Playwright's tap implementation does not wait for navigation.
- The blocked donation submission can replace the current document with an error document while perception runs. It fails with the same execution-context error.
- The vanished-element test cannot find its option in the returned initial look because of the timing conflict above.
- Failed tests can skip `quit`, then remove their temporary directory. Browser event listeners can still try to append evidence, producing unhandled ENOENT errors. These are real gate failures, not suppressed cleanup noise.

Done when: all seven original session tests pass without unhandled errors. They currently do not.

## Review of the draft

Reviewed the full source for action validation, browser lifecycle, signing, read-only coverage, privacy, viewport visibility, condition behavior, and wording. This is broader than the four supplied lens names, but it is not a substitute for the missing full lens catalog.

| Review area | Evidence and unresolved gap | Done when |
|---|---|---|
| Safety flags, including supplied lens 2 | `mask_personal_data: false` disables screenshot masking of password/payment locators too. Payment values are not always masked in action events. `payment_test_mode` is never consulted. Admin mode, test-copy, and seeded-data requirements are not fully enforced. | Credential masking is unconditional and unsafe payment/admin configurations are refused. |
| Fail-open behavior, including supplied lens 4 | A probe truncated a two-event signed log to its valid first event; `verify().ok` still returned true. The guard permits off-origin mutating subrequests and does not block service workers. An axe failure is swallowed, and default cookie handling does not prevent HTTP Set-Cookie storage. | Tail loss and each unauthorized mutation path fail verification or are blocked; instrument errors are recorded. |
| Invisible inputs, including supplied lens 6 | A browser probe found text positioned at x=5000 in `perceive().text`. Another found an email in an aria-label returned unmasked in the options. Text collection lacks full viewport/occlusion handling. | Offscreen text is absent and personal data is masked in every returned option and saved text record. |
| House voice, including supplied lens 8 | Read the READMEs and report. Humor is confined to the opening server README paragraph. Task results, limits, and done-when lines use plain language. | The public draft states failures directly and uses plain steps. Met for the written deliverables. |
| Run evidence | The session does not write `run.json` with inputs, versions, and times. Repeated walks reuse the same folder. The HMAC key is ephemeral; report-time independent verification is not implemented here. | Each walk preserves its manifest and cannot silently mix with another walk. |
| Rule and floor coverage | Missing Wharton/ratings rejected by MCP are not logged as refused. Required-step run-away and journey-completion severity floors are not implemented. The blocked-submit event lacks masked visible field data. | These spec rules have passing evidence checks without reducing floors. |
| Conditions and lifecycle | Wait still incurs the generic no-change patience cost. Slow-network emulation is initial-page-only. Declined cookies are not fully blocked. Failure paths can leave browsers alive. | The documented conditions hold across tabs and failure paths close resources. |
| Full named lens pass | The complete REVIEW-LENSES file is not in this clone. No outside search was made under the pair fence. | The host provides the catalog and the remaining named lenses are checked. |

Four targeted probes returned `true`: `truncated_log_accepted`, `transact_payment_flag_not_checked`, `offscreen_text_exposed`, and `option_email_unmasked`. They used synthetic local data and deleted their temporary artifacts. These observations confirm gaps in the plan's code; they are not claims that the safety bar passed. No additional implementation changes were made after the instructed Task 9 stop.

## Host decisions and handoff

**Choice: resolve Task 9's timing conflict.** Options: approve a deterministic fixture that disappears after the initial look; or revise the two-look arrival contract. Recommendation: make the fixture deterministic while preserving the stale-state refusal and zero-step assertions.

**Choice: repair the safety gaps in the supplied plan.** Options: add corrective tasks before merge; or keep this as an explicitly failed draft. Recommendation: add corrective tasks and require the original suite plus focused checks for the listed gaps before treating the server as usable on real data.

**Choice: finish the manual check.** The host owns Task 12 step 3. Perform it after the test and safety gaps are fixed. The automated MCP test is not the manual walk.

Done when: the host records the decisions, both gates pass, and the manual walk has a real quit result.

No reports engine, Cheese Shop, skills, release, push, or PR was created. Those are later-plan work or expressly excluded from this lane. After writing and validating DONE.json, this lane waits for a possible rebuttal prompt.
