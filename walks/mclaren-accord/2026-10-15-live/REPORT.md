# McLaren Accord: live site walk, 2026-10-15 (logged out, read-only)

**Provisional Walkers.** All three Walkers were written from the spec's public-journey pattern (§4 to §6). The spec says McLaren Accord's Walkers are "proposed in its run notes", and Jimmy has not approved any yet. Treat every result below as provisional until the dossiers are approved.

**Read this before the findings.** The site loads its articles and case studies in the browser from Google Firestore. Firestore reads over a channel that uses `POST`. The walk server's read-only guard blocks every `POST` to an origin outside the journey, so every article showed "Resource Not Found" and Resources showed "No articles published yet". That came from MSW, not from the site. Findings that rest on it are set apart below and are not in the top 10. The Desmond walks and part of Priya's first walk need to be run again once MSW can let those reads through (plan B, item 1).

## Did each Walker reach their goal?

| Walker (provisional) | Journey | Viewport | Result | Why |
|---|---|---|---|---|
| Marisol, runs a 12-person business, sits on a food pantry board | `shop-owner-fit` | phone | **No: ran away** at step 3 | Three phone screens of the home page did not say who the firm helps (a leave trigger) |
| Desmond, arrives from a link to one article | `link-reader-article` | phone | **No: stuck** at step 8 | The article and Resources were empty. **MSW caused this** (Firestore blocked); it says nothing about the site |
| Desmond | `link-reader-article` | desktop | **No: ran away** at step 5 | Same as above. **MSW caused this** |
| Priya, a partner at an accounting practice, sizing up a referral partner | `partner-scout-sizeup` | desktop | **Partly: ran away** at step 12 | Found both principals and that the firm serves mid-market companies. Found no past work: case studies are on Resources, which MSW emptied |
| Marisol, silly walk: one bar of signal (slow 3G) | `shop-owner-one-bar` | phone | **No: ran away** at step 3 | Same leave trigger as the main walk. The first page took 12 s to paint |
| Priya, silly walk: evening, dark mode and reduced motion | `partner-scout-evening` | desktop | **Yes: done** at step 8 | Found who leads the firm and which clients it serves |

**Inspection:** the guide from Priya's evening walk passed on its second Inspection (`## STATUS: PASS`). The first failed at step 4, a guide problem. See [Inspection](#inspection).

## Top 10 findings, by severity

Severity is Nielsen's 0 to 4 scale (3 major, 2 minor, 1 cosmetic). Screenshots are the server's own, with personal data masked. Each finding names the walk folder and the event the server logged.

| # | Sev | Walker | Screen | What happened | Expected | Screenshot |
|---|---|---|---|---|---|---|
| 1 | 3 | Marisol (phone, both walks) | Home, first three screens | The headline ("From Strategy to Solution"), the next screen ("Every company has a barrier to growth") and the third ("Strategic Plans. Processes. Products. Analyses.") never say who the firm works with. Marisol, a 12-person business owner, read it as written for big corporations and left. "Mid-market companies" first appears on About and What We Do. | The first screen on a phone says who the firm is for (for example "mid-market companies"), and whether small businesses or nonprofits fit | [shop-owner-fit, event 22](walks/shop-owner-shop-owner-fit-phone-en-US/screens/22.png) |
| 2 | 3 | All desktop and phone walks (instrument) | About | axe-core reports a **serious color-contrast** violation on /about (1 to 2 elements), on every walk that reached the page | All text meets WCAG AA contrast. MSW did not record which element; see plan B, item 5 | [partner-scout-sizeup, event 20](walks/partner-scout-partner-scout-sizeup-desktop-en-US/screens/20.png) |
| 3 | 2 | Desmond (phone and desktop) | Contact form ("Let's Connect") | The form asks for name, email, an optional phone and a message, and says only "We'll get back to you soon". Nothing says who reads it, how soon, or whether it adds you to a mailing list. No plain email address or phone number appears anywhere the Walkers looked. One walk rated this 3. | One line on what happens after sending (who replies, when, no mailing list), and a direct email for people who will not use forms | [link-reader-article phone, event 53](walks/link-reader-link-reader-article-phone-en-US/screens/53.png) |
| 4 | 2 | Desmond, Priya | Article page and Resources, when content cannot load | When the article data could not load, the site said "Resource Not Found" and Resources said "No articles published yet. Check back soon." A visitor whose network blocks Google's data service, or whose connection drops, would believe the article was deleted. **Seen only because MSW blocked the data service**, so the site normally shows the articles; this finding is about the error message, not missing content. | When content fails to load, say so and offer a retry, rather than saying it does not exist | [link-reader-article phone, event 12](walks/link-reader-link-reader-article-phone-en-US/screens/12.png), [event 25](walks/link-reader-link-reader-article-phone-en-US/screens/25.png) |
| 5 | 2 | Marisol (phone), Priya (desktop) | Home on arrival; About, Leadership | The cookie box covers the bottom third of the phone's first screen, over the sentence that says what the firm does. On desktop it sat over the first principal's bio. Every Walker had to dismiss it before reading. | A smaller banner, or one that does not cover the main text | [shop-owner-fit, event 8](walks/shop-owner-shop-owner-fit-phone-en-US/screens/8.png), [partner-scout-evening, event 18](walks/partner-scout-partner-scout-evening-desktop-en-US/screens/18.png) |
| 6 | 2 | Marisol (phone, both walks) | Home, opening paragraph | "Practical AI solutions … cross-functional or cross-industry, structured or unstructured" read as jargon to a business owner with no IT person. Marisol could not tell what the help would look like. | One plain sentence and one example a small business would recognize | [shop-owner-fit, event 13](walks/shop-owner-shop-owner-fit-phone-en-US/screens/13.png) |
| 7 | 2 | Priya (desktop, both walks) | About, Leadership | Both principals are named and pictured with "15+ years" across industries. Neither bio names a past employer, client, date or profile link Priya could check before recommending the firm. | One or two checkable facts per principal (a past employer, a profile link) | [partner-scout-evening, event 29](walks/partner-scout-partner-scout-evening-desktop-en-US/screens/29.png) |
| 8 | 2 | Marisol, slow 3G (instrument) | Home | On a slow 3G phone, the largest content took **12.2 s** to paint (LCP). On desktop it was 5.5 s. The desktop figure went through the box's proxy and is less certain. | LCP under 4 s on a phone | [shop-owner-one-bar, event 9](walks/shop-owner-shop-owner-one-bar-phone-en-US/screens/9.png) |
| 9 | 2 | Priya (desktop) | Home, What We Do, About | Priya found no client names, results, testimonials or numbers on the pages that do not depend on Firestore. **Partly caused by MSW**: the case studies live on Resources, which MSW emptied, so whether they answer this is unknown. | At least one outcome visible outside Resources (a result, a client type, a quote) | [partner-scout-sizeup, event 68](walks/partner-scout-partner-scout-sizeup-desktop-en-US/screens/68.png) |
| 10 | 1 | Priya, evening silly walk | Every page | The computer was in dark mode. The site opened bright white and has its own dark-mode button, but it did not follow the system setting. | Follow `prefers-color-scheme` on first visit | [partner-scout-evening, event 8](walks/partner-scout-partner-scout-evening-desktop-en-US/screens/8.png) |

## Set apart: findings MSW caused

The server recorded these, and the replays reproduced them. They describe MSW, not the site:

- "Shared article link shows Resource Not Found" (Desmond, severity 4 on phone and 3 on desktop) and "Resources says No articles published yet" (Desmond and Priya, severity 3). Cause: the blocked Firestore `POST` (`blocked` / `background-write` at event 3 of every walk), followed by the console error "Could not reach Cloud Firestore backend".
- Every "Console error" instrument finding (severity 3 by the floor). The errors are the Firestore failure above, plus `net::ERR_TUNNEL_CONNECTION_FAILED` for a `www.google.com` tracking pixel that the box's proxy refuses.
- "Slow or unstable page" on /about, /capabilities and /resources in the evening walk: each reports the same LCP (5452 ms) as the first page. After client-side navigation, MSW repeats the first page's value.

## The Walkers and their walks

The dossiers are in [`../walkers/`](../walkers/), the journeys in [`../journeys/`](../journeys/), and each Walker's first-person narration in [`narration/`](narration/).

- **Marisol** ([dossier](../walkers/shop-owner.yaml)) runs a family cleaning company and wants to know if AI help is worth a call. On both walks Marisol scrolled the home page three times and left. Marisol never reached What We Do or Contact Us. Marisol to a friend: "the site never said whether they'd take on a twelve-person cleaning company or a food pantry." The leave trigger fired on three scrolls of one page. A person might have opened the menu first, so the dossier's "three screens" wording needs care (plan B, item 12).
- **Desmond** ([dossier](../walkers/link-reader.yaml)) arrived from a link to "Measure twice, cut once". Under MSW the article was missing, so these walks tested only About and the contact form. Run them again.
- **Priya** ([dossier](../walkers/partner-scout.yaml)) checked the firm before a referral call. Priya found both principals and the mid-market focus, and found nothing that showed delivered work. Priya would go to the call "with a list of show-me questions".

Silly walks (spec §6.2), each grounded in a dossier:

- `shop-owner-one-bar`, **body-and-device**, slow 3G: Marisol searches from the truck outside a client's office. The first page took 12 s to paint. The Walker was charged one patience point, but never saw the wait (plan B, item 13).
- `partner-scout-evening`, **body-and-device**, dark mode and reduced motion: Priya does this homework at night. This walk reached its goal and produced the guide.
- Two other silly walks were written and then dropped before running, because both depended on Firestore content: a link cut short when pasted into chat (unusual arrivals) and comparing case studies in tabs (wandering attention). They are worth running once plan B item 1 is fixed.

## Inspection

The Inspection ran as a **separate** headless Claude Code session, on a different model (Sonnet; the Walkers ran on Opus). It had no shared context and only the five msw tools, so its only route to the web was the site, through the server. It got the guide and nothing else ([brief](../inspection/inspect-brief.md)).

1. [Guide draft 1](../inspection/guide-draft-1.md) (from Priya's evening walk): **`## STATUS: FAIL at step 4`**. Step 4 quoted a past role that was not on the screen after one scroll. The Inspector called it a guide problem and proposed a diff ([result](../inspection/guide-draft-1-desktop-result.md)).
2. [Guide draft 2](../inspection/guide-draft-2.md) (the diff applied, nothing else changed): **`## STATUS: PASS`**, all six steps matched ([result](../inspection/guide-draft-2-desktop-result.md)).

Plan A does not support the Inspection as a first-class walk. There is no `msw-inspect` skill and no `msw-guide` skill, and the server needs a dossier for every walk. So the Inspector has a [dossier](../inspection/inspector.yaml) and one journey file per guide draft (plan B, item 8). No guide exists for the other journeys, because none of them reached its goal.

The Minister's Walk (a person walks the guide) has not happened. Nothing here is certified.

## Run health

| Walk | `verified` | `alive` | Dead Parrot failures | Steps | Findings (walker + instrument) |
|---|---|---|---|---|---|
| shop-owner-fit, phone | true | true | none | 3 | 3 + 2 |
| shop-owner-one-bar, phone | true | true | none | 3 | 3 + 3 |
| link-reader-article, phone | true | **false** | page 1095b283 and page 98638643 have 1 screenshot | 8 | 3 + 4 |
| link-reader-article, desktop | true | true | none | 5 | 3 + 4 |
| partner-scout-sizeup, desktop | true | true | none | 12 | 3 + 4 |
| partner-scout-evening, desktop | true | **false** | page 8a3b97aa and page 5241cc2f have 1 screenshot | 8 | 4 + 8 |
| Inspection 1 (inspector), desktop | true | true | none | 3 | 1 + 3 |
| Inspection 2 (inspector), desktop | true | true | none | 5 | 0 + 3 |

The two `alive: false` results are not signs of a fake walk. On arrival, the server took its two looks one second apart, while the client-rendered page was still changing. Each look therefore got a different page state, with one screenshot each (plan B, item 4). Every walk ended with `quit`. All but two Walker findings were reproduced by replay. The two that were not are `partner-scout-sizeup` w2 and w3, and MSW did not say why.

"We are all individuals": `msw individuals` does not exist yet. By hand: no two Walkers shared a journey, so the check does not apply. The two Marisol walks took the same three scrolls, which says the home page gives a phone reader little choice.

Personal data: `mask_personal_data: true`. I checked every committed text record for email addresses, phone numbers and street addresses and found none. The masker did mask one false positive: the date in a console timestamp (plan B, item 3). The screenshots show the principals' names and photos from the public About page. No form was filled or sent, no account was made, and no sign-in or admin page was opened. The Walkers saw no sign-in link.

## What in MSW got in the way (for plan B)

1. **The read-only guard blocks the site's own reads.** Firestore's Listen channel is a `POST` to `firestore.googleapis.com`. The server blocks it as a `background-write`, and any site that reads through `POST` renders empty: Firestore, GraphQL, search APIs, Supabase RPC. On this run, two of three Walkers' main journeys were void. Needed: a journey or run allowlist of read-only `POST` endpoints, and a run-health warning when a blocked background write is followed by a console error.
2. **Floors promote MSW's own noise.** Console errors caused by MSW's blocks, and by the box's proxy (`ERR_TUNNEL_CONNECTION_FAILED`), became severity-3 findings. Instrument records should mark errors that follow a request MSW or the network refused.
3. **The masker eats dates.** `2026-10-15T15:02:29Z` became `[masked]T15:02:29Z` in console text, because the phone pattern matches the date.
4. **Dead Parrot fails client-rendered arrivals.** The two arrival looks hash different page states while the page is still rendering, so `alive` goes false with no cheating. The arrival pair should wait for the state to settle, or count per arrival.
5. **axe records carry no selector or snippet**, so a contrast finding cannot say which element.
6. **LCP repeats after client-side navigation.** Every SPA page reports the first page's LCP and gets a "slow page" finding.
7. **`quit` is slow and confusing.** Replay took up to 7 minutes (3 findings on `partner-scout-sizeup`). Its result counts instrument findings, so three sessions (two Walkers and the second Inspector) asked why there were more findings than they had written.
8. **No Inspection path.** There is no `msw-inspect` skill, and `start_walk` needs a Walker dossier, so the Inspector needs a fake dossier and a new journey file for every guide draft (the folder name comes from the journey id).
9. **No skills, no `msw report`, no `msw individuals`.** I wrote a [walk brief](walk-brief.md) in place of `msw-walk`, took the guide from the Walker's own draft in place of `msw-guide`, and wrote this report by hand.
10. **Node 22 is required; the box has Node 20.20.2.** `npm ci` warns `EBADENGINE`, but typecheck and all 82 tests pass.
11. **Registering the server does not give tools to the running session.** `claude mcp add` connected (`claude mcp list`: ✔), but the running session cannot call new MCP tools. Each walk ran as a headless session instead ([`run-walk.sh`](run-walk.sh): `claude -p --mcp-config … --strict-mcp-config --tools "" --allowedTools mcp__msw`). That is worth a line in `server/README.md`.
12. **"Screens" in leave triggers are read as scrolls.** Both Marisol walks ended after three scrolls. Dossier guidance should define a screen, or count pages or minutes.
13. **Slow networks are invisible to the Walker.** Under slow 3G, a 12 s first paint cost one patience point, but the Walker never saw the wait. A look could say how long the page took to appear.
14. **No `origin/mfx/msw-cc-walk-1` branch existed**, so this walk had no CC trap list to learn from.

## Cost and budget

The eight headless sessions (six walks and two Inspections) used about 1.17 M tokens, mostly cached reads, and cost $1.78. This orchestrating session stayed well under 400 K. Counted together, the run went over the goal's 400 K-token line, because of cache reads in the child sessions. Wall time was about 1 h 15 min.

## Files

- `run.json`: the run file (live environment, read-only, `mask_personal_data: true`).
- `walks/<walker>-<journey>-<viewport>-en-US/`: the server's evidence for each walk: manifest, signed events, screenshots, instrument records, findings and seal. Replay screenshots stay on the box (`.gitignore`); replay events and seals are committed.
- `narration/`: each Walker's first-person account.
- `walk-brief.md`, `run-walk.sh`: how each Walker was run.
- `../inspection/`: the Inspector's dossier, brief, guides, journeys and results.
