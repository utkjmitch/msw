# Comunidad Connect, live site: walk report, 2026-10-14

**Did each Walker reach their goal?** No Walker walked. The build box cannot reach `www.comunidadconnect.org`: its egress proxy refuses the host (`403 Filtered`, `net::ERR_TUNNEL_CONNECTION_FAILED` in Chromium). The box has no DNS of its own, so it cannot go around the proxy. The site's pages were never loaded, so this report has no findings about the site.

**Top 10 findings by severity:** none. The walk never reached the site, so there is nothing to rank. The only screen any Walker saw is Chromium's own error page (below). Its two instrument "findings" are about Chrome's error page, not about Comunidad Connect, and are listed as an MSW bug in section 5 (item 2), not as site findings.

| Walker | Journey | Viewport | Locale | Reached goal? |
|---|---|---|---|---|
| First-time learner (Marisol) | `first-time-learner-learn` | phone | en-US | Not walked: site unreachable from the box |
| First-time learner (Marisol) | `first-time-learner-learn` | phone | es-419 | Not walked |
| Slightly motivated giver (Ruth) | `slightly-motivated-giver-give` | desktop | en-US | Not walked |
| Trip invitee (Daniel) | `trip-invitee-plan` | desktop | en-US | Not walked |
| Trip invitee (Daniel) | `trip-invitee-plan` | desktop | es-419 | Not walked |
| Existing donor (Teresa) | `existing-donor-manage` | phone | en-US | Not walked |
| Partner seeker (Ana) | `partner-seeker-partner` | desktop | en-US | Not walked |

## 1. What was done

- **Server built and tested.** `npm ci`, `npm run build`, `npm run typecheck` and `npm test` (14 files, 82 tests) pass, with Playwright 1.63.0 and the box's baked Chromium 1243 (`PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`). The box runs Node 20.20.2, not the Node 22 the README asks for. Only vitest warned about it, and everything passed.
- **Server registered with Claude Code** as `msw`, with this run file:
  `claude mcp add msw -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright -- node <repo>/server/dist/mcp/server.js --run <repo>/walks/comunidad-connect/2026-10-14-live/run.json`.
  `claude mcp list` shows it connected, and an MCP client lists exactly the five tools.
- **Five Walkers and five journeys written** in `walks/comunidad-connect/walkers/` and `journeys/`. All load against the schemas. The first-time learner and the trip invitee list `es-419` as well as `en-US`.
- **The MCP chain works end to end** on the local fixture site: `start_walk`, `act` with ratings and Wharton answers, `note`, then `quit` returned `verified: true`, `alive: true`. That fixture run lived in `/tmp` and is not committed.
- **One live attempt** (first-time learner, phone, en-US) through the registered server. The browser could not load the start page. The walk was quit as `stuck`. Its evidence is kept in `egress-blocked-attempt/`: signed events, two screenshots of the Chromium error page, and the seal (`verified: true`, `alive: false`).

![The only screen the Walker saw: Chromium's tunnel error](egress-blocked-attempt/first-time-learner-first-time-learner-learn-phone-en-US/screens/3.png)

## 2. What unblocks the walk

The host widens the box's egress allowlist. Then the walk runs as written:

1. Add `(^|\.)comunidadconnect\.org$` to the `mac` profile's `DEV_TARGETS`, then `docker restart mf-proxy-mac` (see `macfactorybox/docs/OPERATIONS.md`, "Egress"). Also allow any host the site loads its scripts, fonts and images from. The walk itself is pinned to the site's origins, but missing assets would distort the instrument pass. `mfbox proxy-logs` lists what is refused.
2. Check from the box: `curl -sS -o /dev/null -w '%{http_code}\n' https://www.comunidadconnect.org/` prints `200`.
3. Start a **new** Claude Code session in the repo. A server added with `claude mcp add` only appears in sessions started after it was added. Walk each row of the table above with `start_walk(walker, journey, viewport, locale)`.

## 3. The Inspection

It cannot run yet. The spec's Inspection (section 3, walk 2) takes **the draft guide only**, and plan A built neither:

- no guide exists, because the guide is compiled from successful Survey walks and there were none;
- no `msw-guide` skill to compile one, and no `msw-inspect` skill to give a fresh agent the Drasi-style literal walk and `## STATUS:` contract.

A separate session could improvise both by hand. But with no successful walk there is nothing to compile and nothing to inspect.

## 4. Read-only

No form was submitted, no account was made and no payment was started. The site was never reached. The journeys are all `read-only`. Their origins are only `https://www.comunidadconnect.org/` and `https://comunidadconnect.org/`, so a payment page on another origin is blocked as "left the site". That is where the giver is meant to stop.

## 5. What in MSW got in the way (for plan B)

1. **`start_walk` succeeds when the start page does not load.** It opens the walk on `chrome-error://chromewebdata/`, returns a look with only scroll and back, and puts the failure in a note. It should fail the start, remove the reserved folder, and say the site is unreachable.
2. **The instrument pass inspects Chrome's own error page.** Axe ran on `chrome-error://chromewebdata/` and raised two severity-3 accessibility findings (`document-title`, `html-has-lang`). A report would blame them on the site. Both are marked `reproduced: true` with an empty `repro`. Pages outside the journey's origins, and browser-internal pages, should never become findings.
3. **A failed start uses up the walk folder.** The blocked attempt left `events.jsonl` behind, so the same Walker, journey, viewport and locale cannot be walked again from the same `run.json` until the folder is moved. The folder was renamed to `egress-blocked-attempt/` so the real walk can reuse this run file.
4. **The Dead Parrot failure message is opaque.** It says "event 7 has no observed page state". The cause was a failed request for the start page before any look. It should name the request and the reason.
5. **No preflight.** Nothing checks that `start_url` is reachable, or that the browser has a route out, before a walk starts. A `msw doctor <run.json>` command would have caught the egress wall in one line.
6. **`start_walk` ignores the journey's `viewports` and `locales`.** It accepts any viewport and locale, so a walk can run on a combination the journey never planned.
7. **No skills yet.** `msw-dossier`, `msw-journeys`, `msw-walk`, `msw-guide`, `msw-inspect` and `msw report` are all missing. Dossiers, journeys and this report were written by hand. The Inspection cannot run without `msw-guide` and `msw-inspect`.
8. **No runner for a set of walks.** One server process serves one walk, and a newly registered server only appears in a new Claude Code session. Seven walks (five Walkers, two in two languages) need seven sequential starts with nothing to schedule them, and nothing pairs phone with desktop as the spec asks.
9. **Run-level `run.json` and the narration files are not produced.** Spec 4.4 names a run-level `run.json`, `walks/<walker>-<journey>.md` and `guide.md`. The server writes only a per-walk manifest, under `<out_dir>/walks/`.
10. **Box runtime.** The README asks for Node 22. The factory box has Node 20.20.2. Everything passed, but the engine check warns, and a box image with Node 22 would match the README.
