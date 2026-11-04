# See the whole page: build report, 2026-11-04

Asked for: "The silly walk concept should be able to look at an entire website in its entirety, and if we're having to sideways scroll for something, because workflow is larger, that's totally fine. We just need to know kind of what we're doing from a navigation perspective" (Jimmy, 2026-11-04, relayed by the WorkGraph AI thread).

## What the code did before

Read from `server/src/walk/session.ts` and `server/src/browser/`, before any change:

- The only scroll moves were `scroll down` and `scroll up`, each `window.scrollBy(0, ±y)`. Nothing scrolled sideways, and nothing scrolled inside a box on the page, either way.
- Options and page text dropped anything whose box started past the right edge of the window (`r.left >= innerWidth`), so content past the edge could not be reached or read.
- Visibility ignored boxes that clip. Text scrolled out of sight inside a box that scrolls still counted as on screen. Scrolling that box would not have changed the page state, and would have cost patience as "no change".
- Headless Playwright starts Chromium with `--hide-scrollbars` (`playwright-core/lib/coreBundle.js`, the Chromium launcher's headless arguments). No walk's screenshot ever showed a scrollbar, on any viewport.

## What changed

All of it is in `server/README.md`, "Wide pages, scroll areas and the whole look".

1. **Reach everything.** `scroll right` and `scroll left` are on every look. A box that scrolls and holds more than it shows is a `[scroll area]` option, scrolled with `how: scroll-down | scroll-up | scroll-right | scroll-left`. Visibility now cuts each element to every box around it that clips.
2. **See a wide element whole.** `look` takes `whole: "page"` or `whole: <scroll area option>`. It returns the screens a person would see scrolling across, each a real screenshot at a real scroll position, then scrolls back. It is a look: no ratings, no step, no patience. The README gives the reasons for screens over zooming out or a full-page screenshot.
3. **Say so in the record.** Every `look` event carries `overflow`: where content runs past what shows, by how much, and what showed the way (a drawn scrollbar, something cut off at the edge, a control named like one). Content past the right or bottom edge that no look showed a way to becomes a severity 2 usability finding at `quit`. Desktop walks now draw scrollbars, so the scrollbar cue is real there.
4. **Keep the rules.** Every image is still the screen. A whole look adds a `whole` event and no page state, so the act rule, the Dead Parrot check, the seal and replay are unchanged. Records only gained fields, and the earlier 110 tests pass unchanged except two in `perceive.test.ts`, whose fixed-move lists gained the two sideways moves. `check.test.ts` also checks the new example. Replay of a walk that scrolls an area is tested.

## Tests

`server/tests/whole-page.test.ts`, on the fixtures `wide.html` (a 3000 px map, a wide timetable box, a floor plan that scrolls both ways) and `hidden-wide.html` (content off to the right with nothing to show it). They were written first and all failed before the change. They cover:

- the options and clipped text;
- reaching the page's right edge and both directions inside an area;
- refusals;
- the whole look of the page and of an area, on desktop and phone;
- the overflow record and its cues, and the navigation finding;
- replay;
- the MCP tools.

`npm run typecheck`, `npm test` (120 tests) and `git diff --check` pass.

## Firefox and WebKit

The server launches Chromium only. The browsers-and-devices design on `origin/mfx/msw-browsers-devices-design` was not built. One check was run by hand, outside `npm test`, in Playwright's Firefox and WebKit. It loaded the two fixtures at 1440 by 900 and ran the new page functions on them: options, page text, scroll areas, the overflow scan and the whole look. They gave the same scroll areas, the same visible and hidden text, the same overflow entries and the same screen counts (3 for the page, 9 for the floor plan) as Chromium. No walk ran in either browser.

## Not tested

- Real sites: how long the overflow scan takes on a large page is a guess (the fixtures add no measurable time to the suite).
- The control cue is a guess by name and was tested only for its absence.
- A right-to-left page: the scan reads scroll positions as distances, but no fixture is right-to-left.
- No real agent has walked the new example, `examples/journeys/first-timer-silly-wide-map.yaml`. It passes `check`, and the phone test walks the same page.
