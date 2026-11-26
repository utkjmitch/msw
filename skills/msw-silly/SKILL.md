---
name: msw-silly
description: Write silly walks, journeys for the situations a product's builders never rehearsed (double taps, a session that expires, text at 200 percent, cookies declined, a link from an old email), each done by a real Walker for a real reason, never vandalism, using only the conditions and moves the walk server supports today. Use on every run, after the ordinary journeys are written.
---

# msw-silly: write silly walks

> Anybody can walk a website the way its designers intended. The Ministry's speciality is the other way: the walk nobody rehearsed, performed by a real person for a perfectly sensible reason. Dana did not double-tap Donate to break anything. Dana double-tapped Donate because the bus went over a pothole.

A silly walk is an ordinary journey ([`msw-journeys`](../msw-journeys/SKILL.md)) with a `silly` block: a category, and the `conditions` and `moves` the server applies. You write two to four per product on every run, each grounded in a Walker's dossier. You write the whole journey file, following `msw-journeys`.

Files go in `<home>`, the Ministry folder in the product's repo ([`msw-file`](../msw-file/SKILL.md), part 1). The run plan is `<home>/runs/<run-id>/PLAN.md` ([`msw-walk`](../msw-walk/SKILL.md), part 1).

**Every run includes silly walks.** Leaving them out needs the owner's stated reason, in their words, recorded in the run plan and the report. "We ran out of time" from you is not a reason; "not this week, the payment test copy is down" from the owner is.

## The rule

Each silly walk is **a real person with a real reason**. Write the reason as one sentence from the Walker's life: "Dana's thumb slips on the bus", "Ruth's eyes are tired after a night shift and her phone is set to large text", "Ola's employer laptop blocks all cookies". Never:

- vandalism, attacks, or trying to break the site for its own sake;
- floods of requests, load tests, or anything that could harm a live site;
- typing junk into forms to see what happens, with no person behind it.

A silly walk is still read-only unless its journey meets every `transact` rule in `msw-journeys` step 5.

## 1. For each Walker, ask what they would plausibly do that nobody planned for

Read each dossier's `story`, `devices`, `frustrations`, `accessibility` and `tech_literacy`. Then go down the catalog and ask, for this person: **would they plausibly do this, and why?** Keep the ones with a good answer.

| Category (`category`) | Situations | What the server gives you |
|---|---|---|
| **Impatient fingers** (`impatient-fingers`) | Double-tapping the button that pays or sends; pressing back in the middle of a form; reloading after an error; pressing twice because nothing seemed to happen | moves `double-tap`, `reload`; `back` is always an option |
| **Wandering attention** (`wandering-attention`) | Leaving a form half filled and coming back later; two tabs on the same thing; the phone locks and the session expires | moves `wait` (advances the page's clock), `new-tab`, `switch-tab`; condition `expire_session_at_step` |
| **Unusual arrivals** (`unusual-arrivals`) | A link from a two-year-old email to a page that has moved; a campaign that has ended; a shared link in the other language | the journey's `start_url` and `arrival`: start where that link goes |
| **Language and text** (`language-and-text`) | Switching language halfway; a name with accents, an apostrophe or sixty characters; pasting from a word processor; browser auto-translate on | the Walker types the text with `act`; condition `translate` is **recorded but not emulated** |
| **The body and the device** (`body-and-device`) | Text at 200 percent; browser zoom at 200 percent; dark mode; reduced motion; rotating the phone mid-task; keyboard only; a slow connection; going offline for ten seconds; a map, timetable or table wider than the phone | conditions `zoom`, `text_scale`, `color_scheme`, `reduced_motion`, `rotate_at_step`, `network: slow-3g`, `network: { offline_at_step, seconds }`; viewport `phone-small`; for wide content, nothing to add: `scroll right`, `scroll left`, `[scroll area]` options and the whole look (`look` with `whole`) are in every walk |
| **Privacy-minded** (`privacy-minded`) | Declining all cookies; private browsing, so nothing is remembered | condition `cookies: declined` (incomplete: see below); a walk with no `storage_state` is already a fresh private window |
| **Unusual intent** (`unusual-intent`) | Giving in memory of someone; acting for a company; a gift for a grandchild; asking for a refund; wanting a tax receipt in March | the journey's `goal` |
| **Admin mishaps** (`admin-mishaps`) | An admin's session expiring mid-edit; publishing with one language empty; filing the same request twice | conditions `expire_session_at_step`; moves `double-tap`, `reload`. Admin silly walks need a test copy, as any admin journey does |

What the server **cannot** do today, so don't write a walk that depends on it (say so in the run plan if the situation matters):

- **Two people at once** (two admins editing the same story): one server process runs one walk at a time.
- **Real auto-translate**: `translate: true` is written into the record and nothing else happens.
- **A real day passing on the server**: `wait` moves the page's clock forward, not the site's server. A session that times out on the server side is better tested with `expire_session_at_step`.
- **Declined cookies, completely**: scripts can't use cookies, and cookies are cleared after every act, but a cookie the site's server sets lives until the next act, and a saved login's cookies are not cleared at the start (`<msw>/server/README.md`, "Conditions").
- **Text zoom on any site**: `text_scale` sets the root font size, which matches browser text zoom only for sites sized in `rem` or `em`.
- **Pinch zoom**: there is no pinch. Browser zoom (`zoom`) lays the page out narrower, as Ctrl + does; it does not magnify one spot. A wide map is seen in screens instead: the whole look returns the screens a person would see scrolling across it.
- **Drag**: a map that pans only by dragging can't be panned. Write the walk for a map that scrolls, or one with its own buttons.
- **Keyboard only, or a screen reader**: the Walker chooses from the server's list of options; it does not press Tab. Write the need in the dossier's `accessibility` and let the Walker judge each option by it, and say in the report that keyboard use itself was not tested.

### How to write each condition and move

```yaml
silly:
  category: body-and-device
  conditions:
    zoom: 200                               # browser zoom, percent, 100 to 500
    text_scale: 200                         # percent, 100 to 400
    color_scheme: dark                      # or light
    reduced_motion: true
    network: slow-3g                        # or, instead: { offline_at_step: 4, seconds: 10 } (1 to 120 seconds)
    cookies: declined
    rotate_at_step: 3
    expire_session_at_step: 5
    translate: true                         # recorded, not emulated
  moves: [reload, double-tap, new-tab, switch-tab, wait]
```

Use only the ones the situation needs. The schema is `<msw>/formats/journey.schema.json`, under `silly`.

## 2. Pick two to four, and spread them

Across the run, choose two to four silly walks that:

- come from **different categories**;
- are **spread across Walkers**, including at least one edge Walker if the run has one ([`msw-dossier`](../msw-dossier/SKILL.md) step 2);
- aim at **a blind spot** in the run plan when there is one ([`msw-walk`](../msw-walk/SKILL.md) part 1): something the requester assumed, someone they did not mention, a situation nobody asked about.

Prefer the ones where getting it wrong would cost the person something: money twice, a lost form, a page they cannot read.

A silly walk needs something on the site to happen to. You may open the site to check there is a form to double-tap or a page to reload; whoever writes silly walks doesn't walk them. If the plan names a silly walk the site can't host (no form at all), say so in the plan and pick another.

## 3. Write each one

A silly walk is a journey file in `<home>/journeys/`, written with `msw-journeys`, with an id ending `-silly-<what>`, and a `silly` block:

```yaml
id: dana-silly-double-tap
walker: first-timer
audience: public
goal: Put my name down to give something, on the bus home, before my stop comes
start_url: https://test.example.org/
arrival: shared-link
success:
  - knows whether the form went through once, twice or not at all
step_budget: 15
mode: read-only
viewports: [phone]
# Why: the bus goes over a pothole as Dana presses the button, and Dana's thumb lands twice.
silly:
  category: impatient-fingers
  conditions: {}
  moves: [double-tap, reload]
```

- Put the Walker's reason in a `# Why:` comment above `silly`. The comment is for people; the report repeats it.
- Write the `goal` in the language the Walker thinks in, if it isn't English; write `success` in the language of the people who will read the report.
- If the walk needs the Walker to type something first (a name with accents, before the double tap), say so in the goal, in the Walker's words: "put my name down, as it's written on my ID".
- `conditions` and `moves` must both be present; use `{}` and `[]` when there are none.
- Conditions that happen at a step (`offline_at_step`, `rotate_at_step`, `expire_session_at_step`) count **accepted acts**: `rotate_at_step: 3` turns the phone after the Walker's third act. Pick a step where the Walker will be in the middle of something, such as a half-filled form, not at the start.
- A move is only an option for this walk. The Walker uses it only when the person would: Dana double-taps once, not on every button.
- Give the success conditions to what the situation tests: "knows whether it went through once or twice", "can still read the price at 200 percent", "the half-filled form is still there after coming back".

A wide map, for a Walker on a phone. The practice site has one at `http://127.0.0.1:4810/wide.html`, and this walk is `<msw>/examples/journeys/first-timer-silly-wide-map.yaml`:

```yaml
id: first-timer-silly-wide-map
walker: first-timer
audience: public
goal: Find the last train home on the route map, on my phone, before the bus gets to my stop
start_url: http://127.0.0.1:4810/wide.html
arrival: shared-link
success:
  - knows the time of the last train
  - knows whether the map goes on past the edge of the phone, and how they found out
step_budget: 15
mode: read-only
viewports: [phone]
# Why: the map was drawn for a wall poster, and Dana holds the phone upright in one hand on the bus.
silly:
  category: body-and-device
  conditions: {}
  moves: []
```

It needs no moves or conditions: the sideways moves, the scroll areas and the whole look are in every walk. What it tests is in `success`: whether the screen showed Dana that there was more, and how Dana got there. The walk record says, for each look, where content ran past the edge and what showed the way (a scrollbar, something cut off at the edge, a control). Content nothing showed becomes a finding of its own.

In `read-only` mode a double-tap on a submit button is stopped each time the page sends the form. Each one is a `blocked` event with `why: would-submit` in the walk's `events.jsonl`; the second often has no field list (`fields_error`), because the page sent it without its own submit control. Two such events from one act are the evidence that the page let a second submission through. On the practice site, a double tap on its one form gives two.

## 4. Check them

```sh
node <msw>/server/dist/formats/check.js --walker <home>/walkers/<walker>.yaml --journey <home>/journeys/<id>.yaml
```

Fix every problem until it prints `ok`. Then read each one and ask: would a stranger, told the `# Why:` line, believe a real person did this? If not, change it or drop it.

## 5. In the run plan

For each silly walk, make sure the run plan's silly-walk list has a line (the planner may have written it already; correct it to match what you wrote): the journey id, the Walker, the category, the reason, and which blind spot it is aimed at (or "none").

Done when: two to four silly walks exist for the run (or the owner's reason for leaving them out is recorded in their words), each from a different category, each with a `# Why:` line from the Walker's life, none relying on something the server cannot do, and each passes `check` with its Walker.
