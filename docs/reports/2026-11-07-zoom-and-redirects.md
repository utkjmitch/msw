# Browser zoom, records from pages a redirect passes through, and axe on very large pages

*Date: 2026-11-07. Branch: `mfx/msw-cc-team-walk-3`, from `main` at `54042ce`, then put on top of `mfx/msw-cc-public-walk-3` (which already holds a `zoom` condition). Model: claude-opus-5-5. Playwright 1.63.0, Chromium.*

Three server changes found while walking a signed-in admin with three Walkers. The walk itself, and everything it saw, stays with the product walked; nothing about it is here.

## 1. A `zoom` condition (already in the branch this builds on)

A Walker who reads with the browser zoomed could only be approximated with `text_scale`. This walk also wrote a `zoom` condition, but the same condition had already been written on `mfx/msw-cc-public-walk-3` (100 to 500, the same viewport and `deviceScaleFactor` math). When this branch was put on top of that one, that version was kept and this one dropped. This branch keeps only its test of it: `tests/conditions-inquisition.test.ts`, "zoom lays the page out…": a tablet at 150% sees `innerWidth` 512 and `devicePixelRatio` 1.5, and the screenshot is 768 px wide.

## 2. A client-side redirect no longer fails the Dead Parrot check

**What happened.** An admin sent a signed-in user from its front page to a default page and, about two seconds later, on to the page that user's role may see. The browser's main frame went `/admin` → `/admin/<default>` → `/admin/<allowed>`. The middle page's requests (a 403, a console error) and the first page's background writes were recorded by the instrument pass with their page's address. The Walker never looked at those two addresses, because nobody could: they were gone before the first look. So the records waited for a look that never came, were written at `quit` with no state, and the Dead Parrot check failed the walk (`event N has no observed page state`), for every walk that entered the admin.

The events were read before naming a cause: all the stateless records were written in the same millisecond at `quit`, and each carried the address of one of the two passed-through pages. A GET-only browser on the same address logged the main frame's navigations: `/admin` at 0.7 s, `/admin/<default>` at 2.0 s (and its 403 at 2.3 s), `/admin/<allowed>` at 2.5 s.

**The fix.** The session notes each tab's main-frame navigations since that tab's last look. A look now lists, in `via`, the addresses passed through on the way to it, and records from those addresses are placed on that look's state. A record from a page the walk truly never reached (another tab never looked at) still fails the check.

- `server/src/walk/session.ts`; `server/README.md` (the Dead Parrot row).
- Test: `tests/redirect-chain.test.ts` with fixture `tests/fixtures/site/hop.html` (a page that logs an error and replaces itself). Before the fix it failed with `event 5 has no observed page state`; after, the walk is alive, the look's `via` names the hop, and the hop's console record carries the look's state.

## 3. Axe is not run on very large pages

**What happened.** One Walker opened an editor page of about 152,000 elements on a phone. The server's axe pass on it never came back: after 28 minutes the tab crashed, both attempts were recorded as `inspect-error` (`frame.evaluate: Target crashed`), and the Walker was left stuck with a dead tab. Timed alone, on the same page with a GET-only browser: load 1.2 s, the server's perception 101 s, axe still running when a 10-minute cap stopped the timer.

Upstream axe-core has no element limit and no run timeout. The nearest reports are dequelabs/axe-core#4427 (selector generation slow on 108,000 nodes) and #3923 (the color-contrast grid using enough memory to crash the browser). A call already running inside the page cannot be cancelled from Node, so a timeout around `analyze()` would free the server but leave the tab still busy.

**The fix.** `inspectPage` counts the page's elements first. Over `AXE_MAX_ELEMENTS` (50,000), it does not start axe: it writes an `inspect-skipped` record with the count and the limit, then takes vitals as usual. The page still has an instrument record, so the Dead Parrot check is not hurt, and `instrumentFindings` reports the size as a severity 2 performance finding ("Page too big to check for accessibility").

- `server/src/instrument/inquisition.ts`; `server/README.md` (the Instrument pass row).
- Test: in `tests/conditions-inquisition.test.ts`, a page checked with a limit of 3 gives `inspect-skipped` then `vitals`, no axe records, and one performance finding.

The server's own perception also took 101 s on that page. It is left as it is; the walk report notes it.

## Not changed

The Dead Parrot rule "at least two screenshots per page" (spec 5.8) also fails walks in which a Walker looks at a page once and quits from it. That is the spec's rule and is left alone; the walk's report says which failures came from it.

## Gates

`cd server && npm test`: 27 files, 202 tests pass. `npm run typecheck` is clean.
