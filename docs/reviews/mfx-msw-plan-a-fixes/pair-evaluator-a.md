Evaluator: evaluator-a. Model: claude-opus-5-5[1m]. Lens: 3, Self-referential gating = strand risk.

Scope: lane a at `7be0ce3aba48`, lane b at `4b9d3169a968`, both from base `a2ad9cf`. I read both diffs, both reports, both DONE.json files, the goal and the rebuttal snapshot. I did not run the suites. One finding (L3-3) also relies on reading the pinned Playwright client code in lane b's `node_modules`.

The lens question: does any job that clears a state depend on that same state? If one beat is missed, does the system get stuck?

## Findings

### L3-1. A failed start can block its own walk folder for good. Both lanes; lane b is wider.

Ruling 2 adds a gate: `start_walk` refuses if `events.jsonl` exists. But `start` is also what creates that file. If `start` fails after the file exists, the retry is refused. Nothing in the server ever clears the gate, and by design nothing should, because the ruling forbids deleting evidence. The only way out is a new `out_dir`. The MCP server takes `run` once at launch (`createServer(run)`), so in practice that means a new run file and a server restart. Both READMEs give that way out, so a human can recover. The agent cannot.

- Lane b reserves the file before it launches the browser:
  - `refs/lanes/b:server/src/walk/session.ts:56` `try { writeFileSync(join(this.dir, "events.jsonl"), "", { flag: "wx" }); }`
  - `refs/lanes/b:server/src/walk/session.ts:63` `this.browser = await chromium.launch({ headless: this.headless });`
  
  Line 63 is outside the `try`/`catch` that starts at line 64. If Chromium fails to launch, for example under the box load both lanes saw, the folder keeps an empty `events.jsonl` and no manifest. Every retry then fails with "walk folder already holds events.jsonl". The empty file is not evidence of a walk, but it still closes the gate. Any later failure in lines 64 to 98 does the same, though line 97 at least writes a `start-failed` manifest.
- Lane a creates the file only on the first `append`, which comes after launch, context, guard and conditions:
  - `refs/lanes/a:server/src/walk/session.ts:63` `if (existsSync(join(this.dir, "events.jsonl"))) throw new Error(\`the walk folder ${this.dir} already holds a walk; use a fresh out_dir\`);`
  - `refs/lanes/a:server/src/walk/session.ts:81` `this.log.append("start", { walker: this.walker.id, ...`
  
  So a launch or setup failure leaves no `events.jsonl`, and the retry works. The strand remains only if `arrive()` throws after line 81, for example if `perceive` fails three times in `snap`. Lane a's error message also names the way out ("use a fresh out_dir").
- Fix for the merge: when a start fails before its first real event, remove the empty file that the same call created. That is not deleting evidence. Or write a `start-failed` event and say in the refusal that the folder holds a failed start. Either way, add a test: inject a launch failure, then retry the start.

### L3-2. Lane a puts new code that can throw ahead of quit's `finally`. The browser is never closed, and the comment says it is.

Ruling 4 says to keep the `finally` in `WalkSession.quit`. Lane a keeps it, but adds three steps before the `try`:

- `refs/lanes/a:server/src/walk/session.ts:155` `for (const t of this.timers) clearTimeout(t); this.timers.clear();`
- `refs/lanes/a:server/src/walk/session.ts:156` `this.placeAll();`
- `refs/lanes/a:server/src/walk/session.ts:157` `if (reason === "run-away" || this.ended?.startsWith("run-away")) this.runAwayFloor(detail);`
- `refs/lanes/a:server/src/walk/session.ts:158-159` `try { this.log.append("quit", ...); } finally { await this.browser.close(); this.browser = undefined; }`

`placeAll` writes the waiting records through `log.append`, which calls `appendFileSync`. `runAwayFloor` calls `addFinding`, which also calls `appendFileSync`. Lane a's own F4 test breaks quit in exactly this way: it deletes the walk folder (`refs/lanes/a:server/tests/mcp.test.ts:40`). That test passes only because it quits with `done` and has no waiting records. With `run-away`, or with any record still waiting, the throw happens before the `try`:

- Chromium stays open.
- `this.browser` stays set, so that `WalkSession` refuses `start` ("a walk is already in progress") until a quit succeeds.
- The MCP layer still frees itself, but the comment there is now wrong: `refs/lanes/a:server/src/mcp/server.ts:61` `// A quit that throws has still closed the browser. Never leave the server locked.`

Lane b does this correctly. Its waiting-record flush is inside the `try`, and the browser is released in a nested `finally`:

- `refs/lanes/b:server/src/walk/session.ts:152-153` `try { this.flushUnobserved(); this.log.append("quit", ...); } finally { if (this.context) disposeConditions(this.context); try { await this.browser.close(); } finally { this.browser = undefined; this.writeManifest(reason); } }`

Fix for the merge: move lines 155 to 157 inside the `try`, or use lane b's nested `finally`. Add a test that deletes the walk folder and then quits with `run-away`.

### L3-3. Lane b's transact guard can reject inside Playwright's route callback. That rejection is likely unhandled.

- `refs/lanes/b:server/src/browser/guard.ts:26` `const response = await route.fetch({ maxRedirects: 0 });`

Nothing catches errors here. A connection reset, a DNS failure or a context closing mid-request makes the route handler reject. In the pinned Playwright client, `RouteHandler._handleImpl` rethrows the error (`node_modules/playwright-core/lib/coreBundle.js:60149-60162` in lane b's clone). The event emitter's `_callHandler` then does `promise.catch(e => { if (this._rejectionHandler) ...; else throw e; })` (lines 10971-10974). Neither lane's `server/src` registers an `unhandledRejection` handler. On Node 20, which the box runs, an unhandled rejection exits the process by default. I did not run this, so treat the crash as likely, not proven.

If the process does die, L3-1 makes it worse. The walk has no quit event, seal or manifest end time. After a restart, the same walker, journey, viewport and locale is refused, because `events.jsonl` exists. So one bad network response mid-walk strands both the walk and its folder.

Lane a adds no network call inside the route handler. Both lanes keep the base pattern where a synchronous `onBlocked` log write runs inside the handler. That carries the same risk but is much less likely to throw.

Fix for the merge: keep lane b's redirect block, but wrap it: `try { ... } catch { return route.abort("failed").catch(() => {}); }`. Record that the write was not sent. Lane a's rebuttal makes the same point.

### L3-4. Lane b clears a page's state at the start of an act. The one job that sets it again runs too late.

- `refs/lanes/b:server/src/walk/session.ts:128` `this.pageStates.delete(this.page!);` (before `perform`)
- `refs/lanes/b:server/src/walk/session.ts:187` `p.on("framenavigated", frame => { if (frame === p.mainFrame()) { this.flushUnobserved(p); this.pageStates.delete(p); ...`
- `refs/lanes/b:server/src/walk/parrot.ts:11` `if (["instrument", "blocked", "blocked-write"].includes(e.kind) && !e.state) failures.push(\`event ${e.seq} has no observed page state\`);`

Only `snap()` restores the state, at line 252, and it runs after `arrive()`. Take a click that fires a beacon or a background write from the old page, then navigates. The beacon's record waits for a state, because line 128 removed it. The navigation then flushes the record with no state, at line 187. At quit, `deadParrot` marks the run not alive. The old page was looked at, so the right state existed. The act cleared it before the records the act triggered could use it. A common real-site pattern, analytics on link click, would fail run health on every such walk.

Lane a avoids this. It reads the source page's address when the request is made, before the navigation commits, and matches it to the last look:

- `refs/lanes/a:server/src/browser/guard.ts:17` `try { page = req.frame().page().url(); } catch { page = undefined; }`
- `refs/lanes/a:server/src/walk/session.ts:216` `if (page === undefined || page === this.last?.url) write(this.last?.state);`

Lane a's version is weaker in two smaller ways:

- Waiting records are keyed by address string (`refs/lanes/a:server/src/walk/session.ts:217` `else this.unplaced.push({ page, write });`). Only `snap` and quit's `placeAll` clear the queue (line 227). If a page changes its own address before the walk looks, its records wait until quit.
- Lane a did not change `parrot.ts`, so records written at quit with no state do not fail health.

Neither gap strands the walk, because quit always clears the queue. But nothing clears it if quit never comes, such as an MCP disconnect. That case is F19's open lifecycle item in both lanes.

### L3-5. Offline-restore timers: clean in both lanes, and lane b is more thorough.

The restore timer turns offline mode back off, and nothing else controls it, so there is no self-gating. Lane a clears timers only at quit (`refs/lanes/a:server/src/walk/session.ts:155`). Lane b also clears them when the budget runs out and when the context closes:

- `refs/lanes/b:server/src/walk/session.ts:274` `if (ex && !this.ended) { disposeConditions(this.context!); ...`
- `refs/lanes/b:server/src/browser/conditions.ts:17` `context.once("close", () => disposeConditions(context));`

Lane b leaves the context offline after the walk ends. Nothing reads that context afterward, because replays launch fresh sessions. Clean.

### L3-6. MCP session gate: clean in both lanes.

`start_walk` sets `session` only when the start succeeds, and `quit` clears it in a `finally`. That is the outside way out of the gate, since `guard` and `start_walk` both read `session`:

- `refs/lanes/a:server/src/mcp/server.ts:62` `const q = await s.quit(a.reason, a.detail).finally(() => { session = null; });`
- `refs/lanes/b:server/src/mcp/server.ts:61` `finally { session = null; }`

Lane b's test fails quit after a real quit has run. Lane a's test breaks the folder so the real quit throws. Lane a's test is closer to a real failure, but see L3-2 for what it does not cover.

## Acceptance criteria, per ruling

| Ruling / item | Lane a | Lane b |
| --- | --- | --- |
| 1. Off-origin writes stay blocked in both modes | Meets. Does not stop a 307 or 308 redirect of an approved transact write to an unlisted origin. That hole is in the base and in both lanes' scope. | Meets. Also closes the redirect hole (`guard.ts:26-33`), but see L3-3. |
| 1. Background write is its own kind; no "leads off this site" | Meets: `blocked` with `why: "background-write"`. | Meets: new top-level kind `blocked-write`. |
| 1. Payment origins pass in transact only | Meets. | Meets. Also requires them in `allowed_for_transact`. |
| 2. Refuse when the folder holds `events.jsonl`; name the folder | Meets. Failed-start strand is narrow (L3-1). | Meets. Failed-start strand is wide (L3-1). |
| 3. Slow page from load event > 3 s; polling costs nothing | Meets, and also charges a slow start page. | Meets. |
| 4. F4 MCP `finally`, keep `WalkSession.quit` `finally` | MCP part meets. `WalkSession.quit` part only partly meets: new work runs before the `finally` (L3-2). | Meets. |
| 4. F6 records carry their own page's state | Meets. | Meets in the narrow sense, but clicks that navigate lose the old page's state (L3-4). |
| 4. F9 missing ratings or Wharton writes `refused` | Meets; schema relaxed, choice recorded. | Meets; schema relaxed, choice recorded. |
| 5. F10 mask `cc-*` / payment values by field type | Meets. | Meets. Also uses a name-based selector. |
| 5. F14 honor `payment_test_mode`; admin transact, test copy, seeded data | Meets. Refuses card typing at act time; treats `kind: test` as the test copy. | Meets at startup. Adds an explicit `test_copy`. Does not refuse card typing at act time. |
| 5. F15 axe failures recorded and retried once | Meets. | Meets. Two failures also fail health. |
| 5. F15 declined cookies block `Set-Cookie` | Gap, stopped and recorded as the ruling allows. | Gap, stopped and recorded, with a failing probe. |
| 5. F16 masking audit and the 120-character cut | Meets. | Meets. |
| 5. F17 run manifest | Meets (per walk). | Meets (per walk). |
| 5. F18 floors | Partial. Phone-blocking 3 and run-away 3 are applied. Impossible-journey 4 is written and tested but not applied (gap). | Not met. All three are recorded as gaps. |
| 5. F18 masked fields on blocked submits | Meets, with masked real values. | Meets. Every value is `[masked]`; script submits get an "unavailable" marker. |
| 5. F19 `wait` costs no patience | Meets. | Meets. |
| 5. F19 slow-3g on every page | Meets for adopted pages. A pop-up's first request may start before emulation; disclosed. | Not met. Gap, with a failing probe. |
| 5. F19 offline timer cannot fire after the walk | Meets (cleared at quit). | Meets (budget end, quit, close). |
| 5. F11 expire only journey origins' cookies | Meets. | Meets. |
| 5. F24 replay identity separate; reject ambiguous matches | Meets. | Meets. |
| 6. Manual walk reserved, not simulated | Meets. | Meets. |
| Out of scope F7, F8, F21, F23 last tab, F25 listed open | Meets. | Meets. |
| Gates green at final commit | Meets per DONE evidence (65/65). Suite flaky under load, 4 of 7 runs. | Meets per DONE evidence (56/56). `maxWorkers: 2` steadies it. |

## Better approach

Use lane a as the code spine. It meets more of the rulings: two F18 floors applied, slow-3g on adopted pages, and act-time `payment_test_mode` refusal. On my lens, its strands are narrower. It makes no network call inside the route handler (L3-3). Its gate file appears only after setup succeeds (L3-1). It keeps the old page's state across a navigating click (L3-4).

Port these from lane b, with fixes:

1. Lane b's nested quit `finally`, with all of quit's work moved inside the `try` (L3-2).
2. The transact redirect block, with a `catch` that aborts the request (L3-3).
3. Timer cleanup when the budget runs out and when the context closes.
4. `maxWorkers: 2` in place of decision D1.
5. Health failure for records with no state.

Fix the failed-start strand in both lanes (L3-1).

## Strongest counterargument

Lane b closes a real safety hole that lane a leaves open. In transact mode, a 307 or 308 can carry an approved write on to an origin that is not listed, and lane a's guard never sees the second hop. Ruling 1's core promise is "keep blocking every off-origin write". Lane b keeps that promise and lane a does not. Lane b's `WalkSession.quit` is also the one that actually keeps Ruling 4's `finally`, and it fails closed on records with no state. A merger who weighs safety above coverage could start from lane b and port lane a's floors and slow-3g work instead. My answer: those safety pieces are small and easy to move. Lane a's F18 and F19 work is larger. Lane b's redirect fix also adds a new crash path, L3-3, which must be fixed before it is safe on either spine.
