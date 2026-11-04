# Slice 0: the guard's three gaps, closed

*Date: 2026-11-04. Branch: `mfx/msw-guard-gaps`, from `main` at `01294ea`. Model: claude-opus-5-5. Playwright 1.63.0: Chromium, Firefox and WebKit all run in this box.*

## What was asked

Slice 0 of the browser spec (`docs/superpowers/specs/2026-11-04-browsers-devices-usage-models-design.md`, sections 3.3 and 11, on `mfx/msw-browsers-spec-land`): pop-ups fail closed, a 3xx `Location` is checked before it is followed, and a 3xx is never fulfilled as-is. Every route handler catches its errors, and a write that reached the site is recorded as having reached it. After that, look for other ways off the list.

## Each cause, checked before the fix

| Gap | Cause in the spec | How it was checked |
|---|---|---|
| Pop-up loads off the list | `req.frame()` throws for a pop-up's first navigation, and `guard.ts:17` treated that as "not a main-frame navigation" | New tests failed on all three engines with an empty `blocked` list. They pass once a navigation with no frame counts as main-frame |
| POST→303 off the list is followed | Playwright routes only the first URL of a chain, and the browser followed the fulfilled 303 unchecked | The test failed on Chromium and Firefox: the off-list server logged the GET. It also failed on WebKit, for gap 3's reason |
| WebKit cannot fulfill a 3xx | Playwright's WebKit backend throws on any status from 300 to 399 (`playwright-core/lib/coreBundle.js:46493`, `:49253`) | The test hit the same `route.fulfill: Cannot fulfill with redirect status: 303` as two unhandled rejections, and allowed redirects timed out |

## What changed

`server/src/browser/guard.ts`:

- A navigation whose frame is not available counts as a main-frame navigation, so the guard fails closed.
- `forward` never gives the browser a 3xx. A redirect that keeps the write is still stopped. For a navigation, the guard checks the `Location`: one off the list is blocked as `left-site`, and one on the list gets a 200 page whose `<meta http-equiv="refresh">` points at it. The browser's next request then goes back through the route. The redirect's cookies are kept. For a script's request, the guard follows the GETs itself, up to 10 hops, on the journey's origins and payment origins only.
- A redirect the guard stops after the site took the write carries `reached: { method, url, status }`.
- Every route handler runs inside a `try`. An error aborts the request and goes to a new `onError` callback. When the site had already taken the write, the error carries `reached`. Playwright ignores a `fulfill` on a closed page without throwing (`_raceWithTargetClose`, `coreBundle.js:59718`), so the guard checks for a closed page after it answers and records that case too.
- A WebSocket to an origin off the list never connects (`context.routeWebSocket`). It is recorded as `background-write` with method `WEBSOCKET`.

`server/src/walk/session.ts` logs guard errors as a signed `guard-error` event. When a form was sent but its next page is off-site, the Walker is told: "The form was sent, but the page after it is on another site, which this walk does not visit." `server/README.md` describes all of this.

A call I made rather than asked about: when a script's POST is answered by a redirect off the list, the guard does not follow it, even though it lets a script GET any origin. It is recorded as `background-write` with `redirect_status`. Following it would mean the guard itself sends a request to an origin the journey never named.

## Other ways off the list (item 4)

Each one is tested in `server/tests/guard-gaps.test.ts` on all three engines:

| Way | Before | Now |
|---|---|---|
| `target="_blank"` link | Loaded | Blocked, `left-site` |
| `window.open` from script | Loaded | Blocked, `left-site` |
| Form with `target="_blank"` | Loaded | Blocked, `left-site`; a transact POST in a pop-up to the site still works |
| Meta refresh | Blocked | Blocked (test added) |
| Link in a frame with `target="_top"` | Blocked | Blocked (test added) |
| `download` link to another origin | Blocked | Blocked (test added) |
| Service workers | Blocked by `serviceWorkers: "block"` | Same. The test checks that no worker becomes ready or controls the page, and it fails with workers allowed |
| WebSocket to another origin | Connected and sent frames, on all three engines | Never connects, `background-write` |
| Link in a frame that navigates only the frame | Loads the off-list page in the frame | Unchanged: D-1 |
| WebSocket frames to the site in a read-only walk | Sent | Unchanged: D-2 |

## Results

- `server/tests/guard-gaps.test.ts`: 15 cases on each of 3 engines, 45 passed. Before the fix, 24 failed and 2 unhandled rejections were raised. The WebSocket case was added later; it failed on all three engines before its fix.
- Two session tests (`server/tests/session.test.ts`): a pop-up off the list, and a transact form whose confirmation is off the list. The pop-up test fails on the old guard.
- Full suite on Chromium: 22 files, 157 tests passed. Typecheck passed.
- The existing `guard.test.ts` and `read-guard.test.ts`, with only the browser swapped, on Firefox and WebKit: the old guard failed 3 tests and raised 2 unhandled rejections; the new guard fails 1 and raises none. The one left is WebKit's: the left-site test waits for a `requestfailed` event that WebKit never fires for an aborted main-frame navigation. The guard does block it. That test belongs to slice 1 (spec 3.1).
- Existing records: this repo has none. Stored walk records elsewhere in this box (2,997 events, not copied here) use only event kinds the new code still knows. Their `blocked` records carry the same fields the new code writes, since this change only adds fields. They were not re-walked: they are of live sites, outside this box's network. The replay tests pass.
- Not done: the whole session suite on Firefox and WebKit. `session.ts` still launches Chromium only, and picking an engine is slice 1.

## Decisions

```yaml decision
id: D-1
question: Should a link inside a frame that navigates only that frame to an origin off the list be blocked?
options:
  - leave it allowed — the rule stays main-frame only, so embeds (maps, videos, payment widgets) keep loading; an off-list page can show inside a frame
  - block off-list frame navigations after the frame's first load — closes the hole, but needs per-frame state and may break embeds that navigate themselves
recommended: leave it allowed
rationale: [Likely] A GET in a frame writes nothing, and the Walker sees it only as part of the site's page. Telling a click from an embed's own navigation needs per-frame state, which is more than slice 0.
evidence:
  - server/src/browser/guard.ts decide(), main-frame rule
  - probe 2026-11-04, all three engines, reached the off-list page with an empty blocked list
disposition: none
private: false
```

```yaml decision
id: D-2
question: Should a read-only walk stop WebSocket frames sent to the site's own origins?
options:
  - leave them — the site's live sockets keep working; a write sent over a socket is not stopped in read-only mode
  - refuse sockets to the site in read-only mode — no socket writes, but live data, chat and realtime pages break
  - add socket read channels like the POST ones — a socket opens only when the journey names it, at the cost of more format and code
recommended: add socket read channels like the POST ones
rationale: [Guessing] Firestore and similar sites read over sockets as well as POST. A named channel follows the pattern read_channels already set, and it keeps read-only honest.
evidence:
  - server/src/browser/guard.ts routeWebSocket, which checks off-list sockets only
  - server/src/browser/read-channels.ts
disposition: none
private: false
```
