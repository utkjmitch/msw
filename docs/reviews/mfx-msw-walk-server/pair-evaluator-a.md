Evaluator: evaluator-a. Model: claude-opus-5-5[1m]. Lens: lens 3 (Self-referential gating = strand risk).

# Pair review: plan A walk server, lane a (63bef24a028b) vs lane b (4c3e8725d0ce)

I read both lane trees, reports, DONE files, the code diff and the rebuttal. I ran no code.

## Lens 3 findings

### L3-1. The MCP walk gate strands when `quit` throws after the browser closes (both lanes, high)

The MCP server's `session` is the gate. Only a successful `quit` clears it. Both lanes have:

> `const q = await s.quit(a.reason, a.detail); session = null;`

`refs/lanes/a:server/src/mcp/server.ts:59` and `refs/lanes/b:server/src/mcp/server.ts:59`.
`start_walk` refuses while the gate is set:

> `if (session) return say("A walk is already in progress. Call quit first.", true);`

`refs/lanes/a:server/src/mcp/server.ts:32` and `refs/lanes/b:server/src/mcp/server.ts:32`.
`WalkSession.quit` checks its own gate first:

> `if (!this.browser) throw new Error("no walk in progress");`

`refs/lanes/a:server/src/walk/session.ts:108` and `refs/lanes/b:server/src/walk/session.ts:114`.
Then it clears `this.browser` before its file writes (`findings.jsonl`, `seal.json`).
If one of those writes throws, `session = null` never runs.
A retry of `quit` now fails on `this.browser`, which the failed attempt already cleared.
So the clearer is gated by state that its own failed attempt destroyed.
No tool resets the gate. Only a process restart frees it.

Lane a found it: F4 in `lane-a-report.md:101`, and the fix is right: clear `session` in a `finally`.
Lane a did not fix it, because its brief said to build the plan as written.
Lane b does not list it.
`lane-b-report.md:106` says only "MCP disconnect/concurrent-call lifecycle is not covered."
Lane a's rebuttal raises it against lane b (docs/reviews/mfx-msw-walk-server/pair-rebuttal.json, lanes.a).

### L3-2. Lane b's `quit` fix makes the strand more likely (lane b, medium)

Lane b wraps the first log write (`refs/lanes/b:server/src/walk/session.ts:115-116`):

> `try { this.log.append("quit", { reason, detail: detail ?? null, ended: this.ended ?? null }); }`
> `finally { await this.browser.close(); this.browser = undefined; }`

This frees Chromium. But if `append` throws, the browser is now gone, and the error still reaches the MCP layer.
`session` stays set, so the MCP gate strands as in L3-1.
In lane a, the same failure leaves `this.browser` set (`refs/lanes/a:server/src/walk/session.ts:109-110`).
So a retry of `quit` can still succeed in lane a once the disk recovers.
Lane b turned a retryable failure into a strand.
Lane b's report calls this a fix: "quit closes even when its event write fails" (`lane-b-report.md:82`).
The real fix needs both parts: lane b's `finally` in `WalkSession.quit` and `session = null` in a `finally` in `server.ts`.

### L3-3. A closed current tab strands the walk (lane b, medium; lane a mostly clean)

Lane b adopts pages without any close handling (`refs/lanes/b:server/src/walk/session.ts:144`):

> `this.pages.push(p); this.page = p; attachInquisition(p, r => this.record(r));`

Every `act` perceives the current page first (`refs/lanes/b:server/src/walk/session.ts:81`):

> `const now = await perceive(this.page!, { mask: this.run.mask_personal_data, moves: this.moves, tabCount: this.pages.length });`

The only move that changes tabs is `switch-tab`, inside `perform()`, after that perceive.
If a popup closes itself, `this.page` points at a closed page.
Then every `look` and `act` throws, and the Walker can never reach `switch-tab`.
The way out of the closed tab is gated on reading the closed tab.
`quit` still works, so the walk can end, but it cannot go on.
`switch-tab` can also rotate onto a closed page that stays in `this.pages`, with the same result.
No lane b test closes a page.
Lane a drops closed pages and falls back (`refs/lanes/a:server/src/walk/session.ts:140`, D7 at `lane-a-report.md:82`):

> `p.on("close", () => { this.pages = this.pages.filter(x => x !== p); if (this.page === p) this.page = this.pages.at(-1); });`

One gap is left in lane a. If the last page closes, `this.page` becomes `undefined`, and `this.page!` fails the same way.
That needs the page itself to close its last tab, so it is low.

### L3-4. A failed inspection is never retried for that page (both lanes, low)

> `this.inspected.add(state);`
> `await inspectPage(this.page!, r => this.record(r, state)).catch(() => {});`

`refs/lanes/a:server/src/walk/session.ts:180-181` and `refs/lanes/b:server/src/walk/session.ts:176-177`.
The "already inspected" mark is set before the work, and failures are swallowed.
One failed axe run closes the gate for that state for the rest of the walk.
The Dead Parrot check may then report "no instrument record" for that page, and nothing can rerun it.
Neither lane lists this under lens 3.
Lane b's rebuttal raises the swallowed error under lens 4 (docs/reviews/mfx-msw-walk-server/pair-rebuttal.json, lanes.b).
The fix is to mark the state only after `inspectPage` succeeds, and to log the failure.

### Checked and clean under lens 3

- The `ended` state. `act` refuses after the walk ends, but `quit` does not check `ended`. The way out is still open. Both lanes.
- The offline condition. A plain timer clears it (`setTimeout(() => { context.setOffline(false)...`, `server/src/browser/conditions.ts:28`), not a step that offline itself blocks. Both lanes.
- Lane a's look retry (`if (tries >= 3 || ...) throw e;`, `refs/lanes/a:server/src/walk/session.ts:170`) is capped. It cannot loop.
- Lane b's navigation wait has a 5 s timeout, and its error is caught (`refs/lanes/b:server/src/walk/session.ts:231-235`). It cannot hang.
- A failed `start` does not set `session`, so it cannot strand the MCP gate. Lane a leaks Chromium in that case (F5, `lane-a-report.md:102`). Lane b closes it (`refs/lanes/b:server/src/walk/session.ts:65-67`).

Lens 3 result: lane a has L3-1 (reported, not fixed) and L3-4. Lane b has L3-1 (not reported), L3-2, L3-3 and L3-4.

## Shared rubric (original-goal.md)

| Criterion | Lane a | Lane b |
|---|---|---|
| Every plan task built | Yes. 12 tasks, one commit each. | Yes. 12 task commits, plus two resume fix commits. The Task 9 commit (`48bd900`) went in with 3 tests failing. The goal says to stop and record a gap instead. |
| Typecheck clean | Yes, exit 0 (`lane-a-DONE.json`). | Yes, exit 0 (`lane-b-DONE.json`). |
| Tests green | 30/30, 11 files. | 35/35, 12 files. Five tests were added. |
| Deviations recorded with reasons | Yes, D1-D13 (`lane-a-report.md:76-88`). | Yes, items 1-12 (`lane-b-report.md:74-85`). |
| No test or floor weakened | No assertion was changed. D9 moves a fixture timer from 1500 ms to 3000 ms, which shifts a timing assumption. | No assertion was changed. I diffed the session, guard and replay tests: the `expect` lines differ only in indentation. The fixture got a removal button. |
| Task 12 step 3 skipped | Yes. The no-model stand-in is clearly labeled. | Yes. |
| Nothing private in the repo | Clean. I found no host paths in either tree. DONE.json is not committed. | Clean in the tree. `lane-b-DONE.json` has a host path in `output_tail`, but that file is not committed. |
| Report at the required path | Yes. | Yes. Its generation is 1 in the report (`lane-b-report.md:11`, `lane-b-report.md:50`) but 2 in DONE.json. |

## Verdict

Lane a has the better approach under lens 3. It found the main strand (F4) and proposed the right fix.
Its close handler keeps a closed popup from stranding the walk.
Its `quit` keeps a failed log write retryable.
It also met the brief more strictly, with one green commit per task and no work beyond the plan.

The strongest counterargument is that lane b fixed real safety holes that lane a only reported.
It closed the high-severity read-only hole (lane a's F1), the undetected loss of the log's tail, and service-worker bypass.
It added tests for each fix, and its fixture uses an event, not a longer timer.
The lane a rebuttal concedes all of this (docs/reviews/mfx-msw-walk-server/pair-rebuttal.json, lanes.a).

For the merge, I recommend:
- Start from lane a's session lifecycle (the close handler).
- Take lane b's safety fixes and their tests.
- Take lane b's `finally` in `WalkSession.quit`, but only together with `session = null` in a `finally` in the MCP `quit` handler.
- Mark a state inspected only after `inspectPage` succeeds.
- Add one test where `quit` fails and the next `start_walk` still works.
- Add one test where a popup closes itself.
