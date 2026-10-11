# Plan A build report — lane b

Result: **DONE, with review gaps.** The resumed work fixes the three session failures. Type checking and compilation pass. The full suite passes all 35 tests in 12 files, with no unhandled errors. No original assertion or severity floor was weakened. The host owns the manual walk.

Split unavailable: lane b has not seen the other draft.

Done when: `cd server && npm run typecheck && npm test` exits zero and DONE.json validates. These checks pass. `bar: gap` records the unresolved review findings below.

## Orientation and resume

Read the entire goal and plan, plus design sections 4, 5, 6.2, 7, and 12. The goal has no section labeled STEP 0; its appended RESUME instructions supply the starting point. This session resumed a clean lane b branch at `9a767cc`. All twelve original task commits remain intact. DONE.json was absent. The lane generation file says 1; this completion uses generation 1. The earlier report and test logs supplied the prior failure evidence.

No sibling clone, branch, transcript, or output was read. No push or PR was made. No browser download ran. Node 22.23.3 and the preinstalled Chromium were reused. Playwright and playwright-core remain pinned to 1.63.0.

The named superpowers skills and the complete REVIEW-LENSES catalog were not available in this clone or session. The original task steps were followed directly. This review covers the source and the four supplied lens names; it does not claim the missing lens definitions were checked.

Done when: the starting revision, branch, generation, prior results, and scope are recorded. Met.

## Tasks and commits

The first run wrote every planned test without changing its assertions. Tasks 2–11 each had a failing test run before implementation. Task 1 used the planned smoke check. Task 12 is documentation and the host's manual check. The original task commits were preserved rather than rewritten.

| Task | Original commit | Tests and current outcome | Done when |
|---|---|---|---|
| 1. Scaffold and CI | `bdde69c` | Chromium smoke test passes; CI exists. | The smoke test passes. Met. |
| 2. Formats | `cbc0da8` | Missing-module failure, then 4 passing format tests; four schemas generated. | Format tests pass and schemas exist. Met. |
| 3. Event log | `3a5c8a5` | Missing-module failure, then tampering test passed. Added truncation coverage on resume. | Log tests pass. Met. |
| 4. Masking and order | `59d0ced` | Missing-module failure, then 3 passing pure tests. | Masking and reading-order tests pass. Met. |
| 5. Budgets and rules | `ad52797` | Missing-module failure, then 3 passing pure tests. | Budget, action, and Dead Parrot tests pass. Met. |
| 6. Guard and fixtures | `3ee1bb0` | Missing-module failure, then 4 passing guard tests. Resume replaces sleep-based waits and adds subrequest coverage. | Guard tests pass. Met. |
| 7. Perception | `2f092e5` | Missing-module failure, then 2 passing perception tests. Resume adds masking and viewport checks. | Perception tests pass. Met for the tested cases. |
| 8. Conditions and instruments | `1161813` | Missing-module failure, then 3 passing tests after compatibility fixes. | Condition and instrument tests pass with the original floors. Met. |
| 9. Walk session | `48bd900` | Original implementation ended with 3 failed and 4 passed tests plus 3 unhandled errors. Resume fixes all three failures: 7 now pass. | All 7 session tests pass without unhandled errors. Met. |
| 10. MCP | `9577274` | Missing-module failure, then 1 passing MCP test. | Exactly five tools, screenshot, markers, duplicate-start refusal, and verified quit assertions pass. Met. |
| 11. Replay | `ebc87b1` | Stub failed the reproduction assertion. Implementation passed replay; the full suite was initially blocked by Task 9. Resume makes the full suite green. | Replay and the full suite pass. Met. |
| 12. README | `6960008` | Build passes. Both READMEs describe the tools, rules, limits, and evidence. Manual step skipped as instructed. | Documentation exists; the host records the real-agent walk. Documentation met; manual step pending. |

Task 9's original commit body recorded its failures. Task 11's original body recorded the red full-suite gate. Task 12 kept the plan's commit subject but explicitly said no real-agent walk occurred. None of those historical results is presented as a pass.

## Resume commits and tests

| Work | Commit | Evidence | Done when |
|---|---|---|---|
| Navigation, fixture, and cleanup | `4446198` | Baseline: 3 failed, 4 passed, 3 unhandled errors. After repair: 7 session tests pass; then all 30 original tests pass. | The phone walk, blocked submit, and stale-option tests pass, with cleanup on failure. Met. |
| Small review fixes | `c8ad2a5` | Five added tests failed before implementation. After repair, all 15 tests in the five affected files pass. The full suite now has 35 tests. | Tail loss, off-origin mutation, service-worker registration, perception leaks, and unconditional screenshot masking have passing checks. Met. |
| Report and README refresh | The documentation commit containing this report | Removes stale claims that the suite fails; keeps the unresolved review findings visible. | The report and READMEs agree with the gate results. Met. |

## Gate evidence

Final code tested: `c8ad2a5ef033a51c168b6076f05963e2efed5ac2`, generation 1. The following documentation commit changes no executable source or tests. DONE.json records the final HEAD and the actual revision that produced each gate result.

`cd server && npm run typecheck` exited 0. Last nonempty lines:

```text
> @msw/server@0.0.1 typecheck
> tsc -p tsconfig.json --noEmit
```

`cd server && npm test` exited 0. Last lines:

```text
 Test Files  12 passed (12)
      Tests  35 passed (35)
   Start at  18:56:59
   Duration  29.78s (tests 80%, import 16%, transform 4%)
```

`cd server && npm run build` exited 0. Last line: `> tsc -p tsconfig.json`.

Done when: both required gates exit zero. Met. Compilation also passes.

## Deviations and reasons

1. The first run's Node 20 npm failed with `Cannot read properties of null (reading 'edgesOut')`. It installed a local Node 22 tool runtime through the registry proxy. This resume reuses it. No application version was relaxed and the runtime is not committed.
2. Added `types: ["node"]` to tsconfig because TypeScript 7 did not include Node declarations automatically (TS2591).
3. Used axe's named `AxeBuilder` export because the default import was not constructable under NodeNext types (TS2351).
4. Added an override pinning playwright-core to 1.63.0. Axe otherwise installed a different core whose Page type required incompatible members (TS2739).
5. The temporary Task 9 replay stub accepted the five declared arguments to satisfy TS2554. Task 11 replaced it as planned.
6. Adopted real popups with an opener and explicitly adopted session-created pages. Axe 4.13 opens and closes a temporary page without an opener; the plan's listener had adopted that closed page as the active page.
7. The first run stopped Task 9 because the fixture removed Vanishing before the initial look returned. The host's resume explicitly permits a separate removal button. The fixture now has one. The test presses it outside the Walker session and waits for detachment. Its stale-state refusal and ten-steps-left assertions are unchanged.
8. Touch taps do not wait for navigation. The session now registers navigation or popup waits before pressing native links and submit controls. Guard cancellations use the `aborted` error code so Chromium keeps the current document instead of racing perception against an error document. Guard tests wait for request failure or the destination URL; no fixed navigation sleeps remain.
9. Session tests and replay cleanup now quit in `finally` before deleting evidence. Guard tests close their contexts in `finally`. Startup failures close the browser, and quit closes it even if appending the quit event fails. The plan's prescribed one-second pause between arrival screenshots remains unchanged.
10. The host authorized small review repairs that preserve interfaces. Verification now checks event order, count, and the remembered final HMAC and rejects malformed lines. Off-origin mutating subrequests are blocked in both modes, and walk contexts block service workers. Password/payment screenshot masks are unconditional. Returned accessible names are masked when enabled, and text collection checks horizontal viewport bounds. Five added regression tests cover these repairs.
11. Original assertions and instrument severity floors were retained. Test changes only add deterministic fixture control, event waits, cleanup, and new review coverage.
12. Skipped Task 12 step 3 as expressly required. No agent quit text was fabricated. The READMEs retain qualifications for unresolved safety findings despite the green test gate.

The plan already substitutes address, visible text, and options for screenshot bytes in the state hash. It uses DOM control collection instead of the spec's accessibility snapshot, approximates text scale with root font size, and records translation as unsupported. Those choices remain documented.

Done when: every change from the plan has a reason recorded here. Met for this draft.

## Review findings for the merger

All findings from the earlier failed draft remain in this table, including repaired ones. Review covered validation, lifecycle, signing, mutation guards, masking, viewport visibility, condition handling, severity rules, and prose.

| Area | Status and evidence | Done when |
|---|---|---|
| Read-only subrequests | **Fixed for the reported path.** Off-origin mutating requests are blocked in both modes. A real cross-origin POST probe now reaches no server mutation endpoint. | The subrequest regression passes. Met. |
| Service workers | **Fixed for walk contexts.** Context creation blocks them. The regression attempts a real registration and confirms no worker exists. | The registration regression passes. Met. |
| Truncated-log verification | **Fixed during the live session.** A valid prefix, empty file, and malformed event all fail verification. The HMAC key is still memory-only; independent report-time verification remains open. | Truncation tests pass, and a future report can verify after process exit. First part met; second open. |
| Safety flags; supplied lens 2 | **Partly fixed.** Password/payment screenshot masks no longer depend on `mask_personal_data`. Payment values in action events can still escape masking. `payment_test_mode` is unused. Admin transact/test-copy/seeded-data requirements are not fully enforced. | Credential/payment records are always masked and unsafe payment/admin configurations are rejected. Open. |
| Fail-open behavior; supplied lens 4 | **Partly fixed.** Log tail loss, off-origin mutations, and service workers are addressed above. Axe failures are still swallowed. Declined cookies do not block HTTP Set-Cookie storage. | Instrument failures are recorded and declined cookies cannot persist or be sent. Open. |
| Invisible input and masking; supplied lens 6 | **Partly fixed.** Horizontal offscreen text is excluded; aria-label email addresses are masked in returned options. Full clipping/occlusion handling and masking of every text record remain incomplete. Payment action values, URLs, finding text, and instrument text need a broader audit. | Returned content is limited to visible content, and all saved records satisfy the masking rules. Open. |
| House voice; supplied lens 8 | **Checked.** Read both READMEs and this report. Humor is confined to the server README opening. Failures and limits are stated directly. | Deliverables use plain steps and observable done-when lines. Met. |
| Run evidence | **Open.** No run manifest records inputs, versions, and times. Repeated walks reuse a folder and can mix evidence. No independent report-time verification is supplied. | Each walk preserves a manifest and distinct evidence, with a verifiable report input. Open. |
| Missing rules and floors | **Open.** MCP rejects malformed Wharton/ratings before the session can log a refusal. Phone-blocking, required-step run-away, and impossible-journey severity floors are not implemented. Blocked submits lack masked visible field data. | These rules have passing checks without reducing any floor. Open. |
| Conditions and lifecycle | **Partly fixed.** Failed starts and test cleanup now close browsers; quit closes even when its event write fails. Wait still incurs no-change patience. Slow-network emulation applies only to the initial page. Declined cookies are incomplete. MCP disconnect/concurrent-call lifecycle is not covered. | Conditions hold across tabs, wait does not charge patience, and all lifecycle paths release resources. Open. |
| Full named lens pass | **Unavailable.** The full REVIEW-LENSES catalog was absent. The four supplied names were used; unavailable definitions were not invented. | The host supplies the catalog and remaining named lenses are checked. Open. |

The earlier probes reported truncated logs accepted, payment flags ignored, offscreen text exposed, and option emails unmasked. Resume regressions now cover and correct three of those results. The payment flag remains a review gap. All probes use synthetic local fixtures.

## Host decisions and exclusions

**Choice: resolve the remaining safety and spec findings.** Options: add corrective tasks before use on real data; or merge as a draft with these limits. Recommendation: add corrective tasks before use on real data. The green suite covers the planned cases and five added checks; it does not establish the missing rules.

**Choice: finish the manual walk.** The host owns Task 12 step 3. Recommendation: run it after the safety repairs and record the actual final quit text. The automated MCP test is not that manual walk.

The timing choice is resolved by the host's resume instruction; no further approval is needed for this draft. No reports engine, Cheese Shop, skills, release, push, or PR was created. Those are later-plan work or expressly excluded. The completion uses `bar: gap` so the open review work stays visible.

Done when: the merger has this committed report and a valid DONE.json, and the host can send the optional rebuttal prompt. This lane parks after writing DONE.json.
