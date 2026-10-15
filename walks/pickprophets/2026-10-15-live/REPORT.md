# PickProphets: live site walk, logged out, read-only (2026-10-15)

## Did each Walker reach their goal?

| Walker | Journey | Viewport | Reached goal? | How it ended |
|---|---|---|---|---|
| Marcus, casual predictor | See who is on top of the rankings | phone | **No** | Ran away: the leaderboard said "0 Total Participants, No data available" (likely caused by the walk server, see below) |
| Renee, pool organizer | Can I run a private group for friends, what does it cost, what must they do | desktop | **Partly** | Ran away at the sign-up wall. Learned it is free; never learned whether a private group exists |
| Renee, pool organizer | Same, checked again on her phone | phone | **Partly** | Ran away at the sign-in wall. Same answer; the wall fits the phone |
| Priya, data enthusiast | See the simulations and how they are made | desktop | **Yes, with doubts** | Done: found a 10,000-run NBA simulation and a method panel, but everything dates from June |
| Walt, insights follower | Read recent analysis on an upcoming game; find a way back tomorrow | phone | **Partly** | Ran away: read a dated explainer, found nothing on an upcoming game and no way to follow without an account |
| Marcus *(silly: slow 3G)* | Rankings on a weak signal | phone | **No** | Ran away: the leaderboard spun for over 30 seconds, then showed 0 participants |
| Walt *(silly: text at 200%)* | Read an article with large text | phone | **Partly** | Done, but the page shrank to a half-width strip and the menu ran off the screen |
| Priya *(silly: all cookies declined)* | Simulations with cookies declined | desktop | **Yes** | Done: nothing broke or nagged |

**Wall reached:** the sign-up form asks for a Display Name, an Email and a Password, or "Sign in with Google". Sign in asks for an Email and a Password. Nothing was typed or sent.

## Top 10 findings, by severity

Severity is Nielsen's 0–4 scale. A finding marked *floor* takes its severity from the spec's floors (axe serious or critical: 3). Findings that probably come from the walk server rather than the site are left out of this list and listed under [Not confirmed](#not-confirmed-probably-caused-by-the-walk-server).

| # | Sev | Walker | Screen | What happened | Expected | Screenshot |
|---|---|---|---|---|---|---|
| 1 | 3 | Walt (phone, text 200%) | Home and article | With large text, pages collapse into a column about half the screen wide. On the home page the type gets *smaller*; on an article, three or four words fit on a line. The right half is blank and the top menu runs past the edge. Text scale is the server's approximation (root font size 200%), so confirm on a real phone at the largest text setting. | Large text that fills the width and wraps, with the menu fitting | [home](shots/home-large-text.jpg), [article](shots/article-large-text.jpg) |
| 2 | 3 | Priya (desktop), Marcus (phone) | Play | The only simulation is "NBA Finals 2026, Game 6: SAS @ NYK". The same card says "NYK lead 4–1" and championship odds "NYK 100.0%", so the series was already over, yet it gives Game 6 win odds of 35.5% / 64.5%. Its data line says "Updated Jun 19". In October this makes every number on the page look stale. | Simulations for games coming up, each dated; an archived example labeled as one | [desktop](shots/play-game6-desktop.jpg), [phone](shots/play-game6-phone.jpg) |
| 3 | 3 | Renee (desktop, phone) | Home → Predict → Weekly Pick'em → sign-up | Nowhere, up to and including the sign-up form, does the site say whether you can run a private group or pool, invite friends, or what friends must do to join. The home page says "Free to play, no stakes" and nothing about groups. | A plain line on whether private groups exist and how friends join, before the sign-up | [sign-up](shots/signup-wall-desktop.jpg), [home](shots/home-scrolled-desktop.jpg) |
| 4 | 3 | *(server log; no Walker saw it)* | Every page | After the visitor pressed "Reject All", the site still sent a `POST` to `…cloudfunctions.net/usagePing` on each page (events 64 and 84 of Marcus's walk; events 60, 90, 93, 104 of Priya's cookie-declined walk). The banner says "Nothing but the essentials runs until you choose". The server blocked these, so their content is unknown. It may be an essential ping; the name suggests usage analytics. | No usage analytics after "Reject All", or the banner says the ping is essential | None: a background request is not visible |
| 5 | 3 *floor* | Marcus (phone) | Leaderboard | Four filter tabs are bare icons (target, gauge, calendar, trophy) with no accessible name, and the sport picker has no label. axe: `button-name` (critical, 4 nodes) and `select-name` (critical, 1 node). Marcus could not tell what any tab would change. | Text labels, or at least accessible names, on the tabs and the picker | [leaderboard](shots/leaderboard-empty-phone.jpg) |
| 6 | 3 *floor* | Marcus (phone) | Leaderboard | The leaderboard page has no `<title>` (axe `document-title`, serious). It also drops the site header: no Learn, Predict or Play, and the button reads "Sign In" instead of "Sign in". Marcus felt he had left the site. | A page title and the same header as every other page | [leaderboard](shots/leaderboard-empty-phone.jpg) |
| 7 | 3 *floor* | Priya (desktop) | Play, MONTA CARLO lab | axe `color-contrast` (serious): 11 elements on one look of Play, 1 on others. axe does not say which. Renee separately read the pale "Sign in to join" button as disabled. | Text contrast of at least 4.5:1 | [play](shots/play-game6-desktop.jpg), [weekly](shots/weekly-desktop.jpg) |
| 8 | 2 | Marcus (phone) | Predict footer | The only link to the leaderboard is a small footer link beside Terms and Privacy. On the phone the cookie box covers it until dismissed. Marcus tried Play and Predict first. | The standings in the top menu or on the home page | [leaderboard](shots/leaderboard-empty-phone.jpg) |
| 9 | 2 | Walt (phone) | Explore insights → Learn | "Explore insights" opens a page headed "Learn" with four explainers (NFL vs NCAAF, Reading the line, EPA, NBA Finals recap). The cards carry no dates; none covers a game this week. The article says "Updated Aug 2, 2026". There is no newsletter, follow or email option without an account. | Dated pieces on upcoming games, and a light way to come back | [learn](shots/learn-phone.jpg) |
| 10 | 2 | Priya (desktop) | Home, Play, method panel | The home page claims "16 ML bots to beat" and "213K games modeled"; logged out, neither is visible anywhere. The method panel ("How MONTA CARLO works") explains the 1–20 scale and a possession simulation "calibrated against real NBA data", but shows no track record or calibration. The margin chart has no y-axis. | A sample of the bots' and models' output, a short track record, and labeled axes | [method](shots/method-panel-desktop.jpg), [home](shots/home-scrolled-desktop.jpg) |

Other findings: the sign-in box is set in the browser's default serif font, unlike the rest of the site (Renee, severity 1; the server's run-away floor raised it to 3). Desktop LCP was 5.5 s on the home page and cumulative layout shift reached 0.24 on Learn and the lab. The box reaches the site through a proxy, so treat those timings as indicative only.

Withdrawn: Marcus and Priya both noted "MONTA CARLO" as a typo of Monte Carlo. The bottom of the Play page explains it is a deliberate backronym. It still read as a typo to both until then, which is worth knowing, but it is not a defect.

## Not confirmed: probably caused by the walk server

The site loads its data from Firestore. Firestore reads travel as `POST` requests, and the walk server blocks every `POST` in read-only mode. It blocked 73 Firestore read requests, 56 Firestore write requests and 12 usage pings across the run. The console then logged "Could not reach Cloud Firestore backend" and Content Security Policy errors for `www.google.com/images/cleardot.gif`, which Firestore loads while retrying. So these Walker findings are **not** reported as site defects until a walk can let Firestore reads through:

- Leaderboard: "0 Total Participants, No data available" (Marcus; [screenshot](shots/leaderboard-empty-phone.jpg)).
- Leaderboard on slow 3G: a spinner for over 30 seconds before the empty board (Marcus; [screenshot](shots/leaderboard-spinner-slow3g.jpg)).
- Predict: "No games on the board right now"; Weekly Pick'em: "No NFL games scheduled yet", a dash where the week should be, next-week arrow inert, "Sign in to join" inert (Renee; [desktop](shots/weekly-desktop.jpg), [phone](shots/weekly-phone-next-week.jpg)).
- Console errors on every page (spec floor 3): all are Firestore connection failures or the CSP errors above.

Whether the site writes to Firestore for a logged-out visitor (56 blocked `Write/channel` requests) is worth a look by the owner. This walk cannot tell what those writes were.

## Each Walker's story

**Marcus**, 34, tire-shop manager, on a ten-minute break, on his work phone. His cousin claims to be "top of the board". He cleared the cookie box, tried Play (a simulation of a finished NBA series) and Predict (no games), found "Leaderboard" in the footer, and got an empty board. On slow 3G he had to dismiss the cookie box before the footer link would respond, then watched a spinner for half a minute. He would tell a friend: "Couldn't even find the standings."

**Renee**, 41, office manager, organizes the friends' pool every year. On her desktop she read the whole home page (free to play, nothing about groups), went to Weekly Pick'em & Survivor (survivor rules explained clearly, but no games), pressed "Sign in to join" (nothing happened), then the header "Sign in" and the "Sign Up" tab: Display Name, Email, Password, or Google. On her phone that evening: same route, same answer. She would tell a friend: "It's free, but I couldn't tell if we can have our own group."

**Priya**, 29, data analyst, invited by a friend. She went straight to Play and found a 10,000-run simulation of an NBA Finals game from June. She opened the MONTA CARLO lab and its "how it works" panel, which she found genuinely informative. She found no predictions for any upcoming game and no track record. With all cookies declined, the lab still ran and showed results. She would tell a friend: "Nice toy, but nothing current, and no way to tell whether it's any good."

**Walt**, 66, retired mail carrier, reads sports over coffee. "Explore insights" took him to a page called Learn with four explainers. He read one comfortably on the phone ("Updated Aug 2, 2026"), but found nothing about this week's games and no way to follow. With text at 200%, the article squeezed into half the screen. He would tell a friend: "Some decent reading, nothing new."

## The Inspection

A separate `claude -p` session on a different model (Claude Sonnet 5.5) got only `guide.md`, a five-step route to Priya's simulation and method panel, and only the five walk-server tools. **Result: `## STATUS: PASS`**, all five steps confirmed. Its proposed changes: say the Play card is a results display, not the thing to press in step 4, and that the MONTA CARLO card sits next to "More experiments, soon". Output: [`inspection/INSPECTION.md`](inspection/INSPECTION.md). Plan A has no guide or inspect skill; the guide was written by hand, and the Inspector had to start as a Walker (see [MSW-PLAN-B.md](MSW-PLAN-B.md), item 6).

No human has walked this guide. The Minister's Walk is still owed.

## Instrument summary

| Instrument | What it found |
|---|---|
| Console errors | On every page; all traced to the blocked Firestore channel (above) |
| axe, serious or critical | `button-name` (4), `select-name` (1), `document-title` (1) on the leaderboard; `color-contrast` (1–11) on Play and the lab; `scrollable-region-focusable` (1) on the lab |
| Web vitals | Desktop LCP 5.5 s; CLS up to 0.24 on Learn and the lab; phone LCP 8.2 s on slow 3G. Vitals repeat across client-side routes (MSW-PLAN-B item 9) |
| Blocked requests | 73 Firestore Listen, 56 Firestore Write, 12 usagePing; no form was submitted |

## Run health

| Check | Result |
|---|---|
| Signed event chain (`verified`) | **true** on all 8 Survey walks and the Inspection walk |
| Dead Parrot (`alive`) | **false** on all 9. Every failure is "page has 1 screenshot" (and 2 × "no instrument record"): the site's pages change between the two arrival looks. See MSW-PLAN-B item 2. Treat the evidence as signed but not certified |
| Reproduction | 13 of the 24 Walker findings (23 notes plus 1 the server added at a run-away) replayed to the same final state (`reproduced: true`). Most that did not are on pages that fill in late from Firestore |
| "We are all individuals!" | Not run (no tool in plan A). By hand: the four Walkers took four different first moves (Play; scroll the home page; Play then the lab; Explore insights). Marcus and Renee converged on the Predict page because the menu offers little else |
| Operator error | On Walt's reading walk I sent an option number from the previous page; it opened Learn again and cost two patience. Walt's run-away came one step later than it would have |

## Decisions

```yaml decision
id: D-1
question: Should read-only walks let a site's own data-read channels (such as Firestore Listen POSTs) through?
options:
  - allow named read channels — journeys list method and URL pattern; real data, small new safety surface
  - keep blocking all POSTs — safest; Firestore and GraphQL sites stay unwalkable in read-only mode
recommended: allow named read channels
rationale: [Likely] This run could not confirm its leaderboard and slate findings because every Firestore read was blocked; the same will hit any Firebase or GraphQL site.
evidence:
  - walks/pickprophets/2026-10-15-live/MSW-PLAN-B.md item 1
  - 73 blocked POSTs to firestore.googleapis.com Listen/channel across the 8 walks
disposition: none
private: false
```

```yaml decision
id: D-2
question: Should published walks commit every raw screenshot and replay, or only hand-checked report screenshots?
options:
  - report screenshots only — 1.5 MB per run; every committed image checked by hand
  - all raw evidence — 86 MB per run; every screenshot must be checked for names before commit
recommended: report screenshots only
rationale: [Likely] The raw folder is 86 MB for one night; checking every frame by hand does not scale until msw publish exists.
evidence:
  - walks/pickprophets/2026-10-15-live/.gitignore
  - du of walks/ before ignore was 86 MB
disposition: none
private: false
```

## What is here

- `run.json`: the run file (live, read-only, `mask_personal_data: true`).
- `walks/<walker>-<journey>-<viewport>-en-US/`: per walk, `manifest.json`, `events.jsonl`, `instrument.jsonl`, `findings.jsonl`, `seal.json`. Raw `screens/` and `replays/` stay on the box (`.gitignore`).
- `shots/`: the 12 screenshots used in this report, resized, each checked by hand. No player names appear anywhere: the public leaderboard was empty, and the only names on the site are NBA players on public rosters.
- `guide.md`, `inspection/`: the hand-written guide and the Inspection.
- `REPORT.html`: this report, self-contained.
- `MSW-PLAN-B.md`: what in MSW got in the way.
- `tools/`: the MCP client bridge used to drive the server from a running session.
- Dossiers: `../walkers/`. Journeys: `../journeys/`. Format check: `node walks/pickprophets/validate.mjs`.
