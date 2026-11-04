# Socket channels: a read-only walk opens a socket to the site only when the journey names it

*Date: 2026-11-04. Branch: `mfx/msw-socket-channels`, from `main` at `7ab5e82`. Model: claude-opus-5-5. Playwright 1.63.0: Chromium, Firefox and WebKit all run in this box.*

## What was asked

Decision D-2 in `2026-11-04-guard-gaps.md`: a read-only walk could send frames over a WebSocket to the site's own origins, so read-only was not airtight. The recommended option was built: socket channels, like the POST `read_channels`.

## The hole, shown before the fix

`server/tests/socket-channels.test.ts` was committed first (`ff80e1a`) and run against the old guard. On all three engines, 12 of 18 cases failed. A read-only page with no socket named opened its socket to the site and sent a frame (`expected true to be false` on `opened`). The new records were missing. The two cases that check the old behavior stays (transact, and a socket off the list) passed. `server/tests/socket-session.test.ts` failed both of its cases on the old code: the page showed "Live scores: 3-1" through a socket the journey never named.

## What changed

- **Journey format.** `socket_channels`, a list of `{ origin, path, sends }`: an exact `ws://` or `wss://` origin, an exact path (the query is ignored, since it often carries a token), and `sends: forward | drop`. `sends` has no default; the author has to choose. The default list is empty. `formats/journey.schema.json` is regenerated.
- **Guard** (`server/src/browser/guard.ts`). In read-only mode every WebSocket goes through `context.routeWebSocket`. A socket off the list is refused as before (`background-write`). A socket to the site that no channel names is refused: it never reaches the server, and it is logged as `blocked` with the new `why: socket-refused`. A named socket is connected with `connectToServer()`. Its opening is reported as a `read` (method `WEBSOCKET`). Each frame the page sends is reported with its size and whether it was sent. With `drop` the frame is not passed on. Frames from the site go to the page unchanged. Transact walks are unchanged.
- **Session** (`server/src/walk/session.ts`). The guard's socket route has no frame, so socket records are placed on the Walker's current page, and carry its page state. A named socket's frames are signed `socket-send` events. The manifest lists `socket_channels`. On the first refused socket, the Walker is told once: "This walk is read-only, so the page's live connection to the site was refused. If part of the page does not load or update, that is the walk's doing, not the site's: do not note it." The Walker still sees the page's own failure (in the test fixture, "Live scores are offline"). The record holds a `blocked` event, never a finding.
- **`check`** reports a socket channel on an origin the journey does not list, since the guard would refuse it.
- **Docs.** `server/README.md` gains "Socket channels", "What a named socket can still write" and "Finding a site's sockets". `skills/msw-journeys/SKILL.md` and `skills/msw-walk/SKILL.md` say the same for the author and the Walker.

## What a named socket can still write

This is the honest limit, and the docs say it in these words. A POST read channel lets through only requests shaped like reads. A socket's frames have no such shape: the server cannot tell a subscribe from a chat message. So:

- With `sends: forward`, anything the page sends over that socket reaches the site, writes included. The record shows how many frames went and their sizes, never what they said.
- With `sends: drop`, no frame from the page reaches the site. But the opening request does reach it, with the page's cookies and the URL's query, and the site may count it as a visit or a presence. Most sockets need a subscribe frame before they send anything, so `drop` often gives no live data.

The small check that could be done was done: `drop`, and a size record of each frame. Checking frame content was not attempted. Every protocol frames its messages differently (Socket.IO, STOMP, Firebase's own), and a check that reads one of them would claim more than it could hold.

## How an author learns which sockets a site uses

Walk the journey read-only with no `socket_channels`. Every socket the page tries is a `socket-refused` event, with its URL, in `events.jsonl`. To decide between `forward` and `drop`, watch the socket's messages in a desktop browser's developer tools (Network, filtered to WebSockets) while doing what the Walker will do.

## A journey with no socket line, and old records

A journey without `socket_channels` loads with an empty list, and every socket to the site is refused. `socket-session.test.ts` walks one. Old records hold none of the new event kinds or the new `why`. The seal check and replay read no event kind added here. The Dead Parrot check still wants every `blocked` event to carry a page state; a refused socket's event gets the state of the page the Walker had in front of them, which the session test checks. The replay, seal-before-replay and drift tests pass unchanged. No real walk records are in this repo, and none were copied in.

## What ran

- `server/tests/socket-channels.test.ts`: 6 cases on each of Chromium, Firefox and WebKit, 18 passed. Before the fix, 12 of the 18 failed (above).
- `server/tests/guard-gaps.test.ts`, the slice 0 guard cases on all three engines: 45 passed, unchanged.
- `server/tests/socket-session.test.ts`: 2 whole walks, Chromium only. `session.ts` still launches Chromium only; picking an engine for a walk is slice 1.
- Full suite (`npm test`): 25 files, 184 tests passed. Typecheck (`npm run typecheck`) passed. `git diff --check` is clean. The final runs at the last commit are the DONE evidence.
- Not run: the whole session suite on Firefox and WebKit, for the same slice 1 reason. On those two engines the socket rule is shown at the guard level only. That is where the rule lives; the session only records what the guard reports.

## Decisions

None for Jimmy. Choices made here, and why:

- `sends` is required rather than defaulting to `forward`. A default would let a journey open a writing socket without its author ever reading this limit. <!-- decision-lint: not-a-decision -->
- The Walker is told about a refused socket, once per walk. Without the note, a Walker would fairly report "live scores are offline" as a site fault. With it, the Walker still sees and can describe the page as it is.
- Frames from the site are not recorded. They are reads, there can be many (a ticker), and the record of what the page *sent* is what read-only needs.
