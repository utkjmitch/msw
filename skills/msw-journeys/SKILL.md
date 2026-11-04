---
name: msw-journeys
description: Write Ministry journeys, one goal for one Walker, in the Walker's own words, with observable success conditions, a step budget, read-only or transact mode, allowed origins and a saved login when one is needed, all checked against the formats. Use when a run plan names journeys to write, or after writing Walkers.
---

# msw-journeys: write a journey

> A journey is a reason to visit. "Click Donate, enter 20, press Submit" is not a journey; it is a script, and the Ministry already has a server for that. "Find out whether my twenty dollars will do anything" is a journey.

You write one YAML file per journey, for one Walker. It must pass the `check` command together with its Walker.

Silly walks (the situations nobody rehearsed) are journeys too. [`msw-silly`](../msw-silly/SKILL.md) writes them whole, following this skill's steps and adding a `silly` block.

## Before you start

- The Walkers exist in `<home>/walkers/` and pass `check` ([`msw-dossier`](../msw-dossier/SKILL.md)). `<home>` is the Ministry folder in the product's repo ([`msw-file`](../msw-file/SKILL.md), part 1).
- You know the address of the environment you will walk, and whether it is the live site or a test copy. Ask the owner if you don't. Write it in `<home>/brief.md`.
- The product's own words (labels, menus, page names) are in `<home>/product-words.md`, from `msw-dossier` step 3. The journey's `goal` must not use them either.
- You may open the site to confirm a start address and that the site is up. Whoever writes journeys doesn't walk them ([`msw-walk`](../msw-walk/SKILL.md) 3.1).

## 1. Pick the goal

For each Walker, ask: what did this person come to do today? Take it from their dossier's `story`, `hopes` and `motivation`. One journey, one goal. A Walker may have more than one journey.

Write the goal **as the Walker would say it to a friend**, in the first person:

| Good | Not a journey goal |
|---|---|
| Work out whether this place takes walk-ins on a Saturday | Open the Hours page |
| Find out what my money would actually pay for | Click Donate and read the impact section |
| Check whether my account shows last month's payment | Go to My Account → Payments |

If the goal names a button, menu, page or product name from the product, rewrite it.

For an admin Walker, the journeys cover three areas: **content** (publish or correct something), **reporting and stats** (read who signed up or gave last month), and **site requests** (ask whoever builds the site for a change, or follow one up).

## 2. Write the success conditions

`success` is a list of things an observer could check at the end of the walk, from the walk's own evidence:

- "can say in one sentence what the organization does"
- "has seen the price of a one-year membership"
- "reached a page that confirms the change was saved" (only in `transact` mode)

Each condition is about what the Walker knows or has seen, never about which page they ended on. Two or three conditions is usual. Finding out that the site doesn't say something is a fair outcome when the question is whether it does: "knows the savings rate, or knows the site doesn't give one".

## 3. Choose the arrival and start

- **`arrival`**: how they came: `search` (from a search engine), `shared-link` (a friend's message), `email` (a newsletter or a receipt), or `direct` (typed the address or used a bookmark). If the brief doesn't say, choose from the dossier's story and add it to the plan's Assumptions.
- **`start_url`**: the page they would land on. A shared link often lands deep in the site, not on the home page. Use the address of the environment you will walk.

## 4. Set the budget

`step_budget` is the most actions the Walker gets (1 to 200). Each `act` costs one. Count how many actions a person who knows the site would need, then double it, and add a few for scrolling. 15 to 30 is usual for a public journey; give more to a slow reader or an expert reading closely, fewer to a silly walk aimed at one moment.

The budget is not patience. Patience is the Walker's and runs out on its own (see the dossier).

## 5. Read-only rules, and when to transact

Every journey is `mode: read-only` unless all of these are true:

1. The run walks a **test environment**: a copy of the site, not the live one.
2. The owner has said, in words you can quote, that this journey may submit, buy, send or delete there.
3. Every origin the journey writes to is on the run's `allowed_for_transact` list ([`msw-walk`](../msw-walk/SKILL.md) sets up the run file).
4. A payment provider, if any, is in test mode, and the run file says `payment_test_mode: true`.

In `read-only` mode the server stops every form submission and records what would have been sent. The Walker is told the form was not sent, and the walk carries on. That is not a failure: the report says the journey stopped at submit by rule. Write the goal so it can still be met by finding out, not doing: "find out what I'd need to sign up", not "sign up".

Then fill in:

- **`origins`**: every other site the walk may go to: a booking widget, a payments page, the organization's other domain. The start address's origin is always included. Anything else the Walker clicks into is blocked and recorded as "left the site", which is often a finding in itself.
- **`payment_origins`**: only in `transact` mode, payment providers that take writes from an embedded widget.
- **`read_channels`**: only for a site whose pages read their data through `POST` requests (some single-page apps and Firestore-backed sites). See `<msw>/server/README.md`, "Read channels". Leave it out otherwise.
- **`socket_channels`**: only for a read-only journey on a site whose pages need a live WebSocket to the site itself (live scores, chat, a realtime database). Without it, every socket to the site is refused, the page shows whatever it shows without one, and the walk records each refused socket with its address. To find a site's sockets, walk once without this line and read the `socket-refused` events, or watch the browser's developer tools (Network, WebSockets) while you do what the Walker will do. Each entry is `{ origin: wss://…, path: /…, sends: forward | drop }`. **Read-only is weaker for a socket than for a POST:** with `forward`, anything the page sends over it reaches the site, writes included, and the record shows only how many frames went and their sizes. Use `drop` when the page sends anything a person does (a message, a like, a "seen"); the page then hears the site but sends nothing, though opening the socket still reaches the site. Write in the run plan which sockets are named, with which `sends`, and why. See `<msw>/server/README.md`, "Socket channels".

**Admin journeys** (`audience: admin`) need either a test copy with seeded, made-up data and `mode: transact`, or a person's written permission for a read-only look, recorded in the run file's `admin_read_only` (who, the date, their words). Never walk a live admin with real people's records in `transact`.

## 6. A saved login, when the journey needs one

A Walker never types a password; the server refuses. When the journey needs a signed-in account (`audience: member` or `admin`):

1. Ask the owner for a **test account** on a **test environment**. Never a real person's account.
2. A person, not the agent, signs in once and saves the browser session to a file. With Playwright installed (the server has it), from `<msw>/server`:

   ```sh
   npx playwright open --save-storage=<path outside git>/<account>.json <address of the sign-in page>
   ```

   They sign in in the window that opens, then close it. The session is saved to the file.
3. Put the file's path in `storage_state`. Keep the file out of git: it works like a password. Saved sessions expire; when a walk starts signed out, a person saves a new one.

**When nobody can do this** (you are unattended), do not write a member or admin journey that depends on it. Note it in the run plan as a journey that is waiting for a saved login.

## 7. Write the file

One file per journey: `<home>/journeys/<id>.yaml`.

```yaml
id: dana-learn                        # lowercase, digits, hyphens
walker: first-timer                   # the Walker's id
audience: public                      # public, member or admin; no higher than the Walker's role
goal: Work out what this organization actually does, and whether I'd tell my sister about it
start_url: https://test.example.org/
arrival: shared-link                  # search, shared-link, email or direct
success:
  - can say in one sentence what the organization does
  - knows one way a person could help, without having given anything
step_budget: 25
mode: read-only                       # the default; transact only under step 5's rules
origins: []                           # other origins the walk may visit
viewports: [phone, desktop]           # which viewports msw-walk walks this journey on
locales: [en-US]                      # optional; which locales; the server's default is the Walker's locale
# storage_state: /path/outside/git/test-member.json   # optional, step 6
# planned: true                       # optional: a journey the product is meant to support, perhaps not built yet
```

Viewports: every journey is walked on at least `phone` and `desktop`, whatever the Walker's own devices, because the people the Walker stands for use both. List them in `viewports`. Each viewport, and each locale, is a separate walk. The server does not read these two lists: `start_walk` is told the viewport and locale each time, and [`msw-walk`](../msw-walk/SKILL.md) plans one walk per pair from them.

**`planned: true`** marks a journey for something the product is meant to do but may not do yet (a vision gap). Use it only when the owner says the feature is promised or planned.

## 8. Check it

1. Check each journey together with its Walker:

   ```sh
   node <msw>/server/dist/formats/check.js --walker <home>/walkers/<walker>.yaml --journey <home>/journeys/<id>.yaml
   ```

   It prints `ok`, or one line per problem. It also checks that the journey's Walker is among those given and that the Walker's role allows the audience. Fix everything until it prints `ok`.
2. Read the goal against `<home>/product-words.md`. No label, menu item or page name.
3. Read each success condition and ask: could someone tell, from the walk's screenshots and narration alone, whether it was met? If not, rewrite it.

Done when: every journey the plan names exists in `<home>/journeys/`, the check prints `ok` for all of them together with their Walkers, every goal is in the Walker's words with no product labels, every journey is `read-only` unless step 5's four conditions hold, and any saved login is a test account kept out of git.
