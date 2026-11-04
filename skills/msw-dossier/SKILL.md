---
name: msw-dossier
description: Interview whoever knows a product's users and write Walker dossiers (full people with patience and leave triggers) that validate against the Ministry's formats, including edge Walkers at the margins of who uses the product. Use when a run plan names Walkers to write, or someone asks for personas to walk a site.
---

# msw-dossier: write a Walker

> A Walker is not a tester in a hat. A Walker is a person: a retired teacher on a phone, a volunteer on a Sunday night, someone with twenty minutes and a healthy suspicion of anything labeled "Learn more". The Ministry needs to know them well enough to say when they would give up.

You write one YAML file per Walker. It must pass the `check` command, and it must not describe the product's screens.

For an expert at a kind of organization, or at one named organization, use [`msw-expert-dossier`](../msw-expert-dossier/SKILL.md) instead. It builds on this skill.

## Before you start

- The product's repo is open, and the Ministry folder in it is known (see [`msw-file`](../msw-file/SKILL.md), part 1). This skill calls it `<home>`. Walkers go in `<home>/walkers/`.
- There is a run plan, or at least a brief: what the requester wants to learn and about whom. If [`msw-walk`](../msw-walk/SKILL.md) part 1 has run, its `PLAN.md` lists the Walkers to write, including the edge Walkers and the blind spots each one is aimed at.
- The server is built (`<msw>/server/dist/formats/check.js` exists). If not, build it as `<msw>/server/README.md` says.

## 1. Interview whoever knows the users

Ask the people who know the users: the owner, support staff, whoever answers the phone. Ask about **people**, never about **screens**. Good questions:

1. Who comes to this product? Name three or four kinds of person, in a sentence each.
2. For each: what are they trying to get done, and what is going on in their life when they arrive?
3. How do they arrive? A search, a link from a friend, an email, a letter, typing the address?
4. What device are they on, and where? A phone on a bus, a work laptop, a shared library computer?
5. What do they already know about the organization and the subject? What do they not know?
6. What would make them give up and leave? Ask for concrete moments ("it asked me to make an account before it showed a price"), not feelings.
7. Who uses it that the team rarely thinks about? Who complains? Who used to use it and stopped?
8. What language do they read best? Any needs that change how they read or act: large text, a screen reader, keyboard only, a slow connection?
9. Which kinds of person matter most this time, and why?

Write the answers into `<home>/brief.md` under a heading with today's date and who answered. Keep their words where you can. When the owner answered some questions and not others, quote what they said and mark each answer you had to infer `assumed`.

**When nobody can be asked** (no one is available, or you are running unattended), use what the product's repo already says about its users (its README, docs, any brief), write it into `brief.md`, and mark every answer you inferred as `assumed`. Do not make up facts about real users. Add each assumption to the **Assumptions** list at the end of the run's `PLAN.md`, so the report can say the Walkers rest on them.

**Do not ask** for real users' names, contact details or records. A Walker is a role, never a real person. When a real person will later take the Minister's Walk for that role, the dossier still describes the role.

## 2. Add the people nobody mentioned: edge Walkers

The requester will name the people they already design for. The Ministry's value is in the ones they didn't name. For every run, write at least one **edge Walker**: a person at the edge of who uses the product, or a plainly unusual one (someone who arrived by mistake, someone using the product for a purpose nobody intended). Each is still a real person with a real, sensible reason to be there. Never a vandal, a troll or an attacker.

Read the brief and ask: who was not mentioned? Look across these edges and pick the ones this product plausibly meets:

| Edge | Examples |
|---|---|
| Body and senses | low vision with text at 200%, a screen-reader user, a tremor that makes small targets hard, color blindness |
| Language | reads the site's language as a second language; arrives in the other language of a bilingual site; reading age below the copy's |
| Device and connection | an old small phone, a slow or patchy connection, a shared or public computer, no cookies allowed at work |
| Acting for someone else | a carer, an adult child helping a parent, an assistant booking for a boss, a company rather than a person |
| Life situation | in a hurry, grieving, in a crisis, distrustful after being scammed, between jobs |
| Relationship to the organization | someone who left and is coming back, a critic or journalist checking a claim, a competitor's customer comparing, someone sent the wrong link |
| Expertise | a domain expert who will spot vague claims (see `msw-expert-dossier`), or a complete newcomer to the subject |

Write down, for each edge Walker, which blind spot it is aimed at (from `PLAN.md`, or from the brief if there is no plan). That line goes in the run plan and later in the report, not in the dossier.

## 3. Find out what the Walker must not know

A Walker who knows the product's labels will find them, and the walk will prove nothing. Before you write, make a short list of the product's own words: its menu items, button labels, page titles and product names. Get them from the product's repo (templates, route names, translation files) or from the brief. Keep the list in `<home>/product-words.md`, never in a dossier, and never give it to the agent that walks.

The list is of the product's **own** labels: "Partner portal", "My Gift", "Impact Hub". Ordinary words the person would use anyway ("password", "give", "contact") may stay in a dossier when they are the person's words, not a hint about where to click.

You may read the product's code to build that list. The Walker never sees it.

## 4. Write the dossier

One file per Walker: `<home>/walkers/<id>.yaml` (make the `walkers/` folder if it isn't there). The `id` is lowercase letters, digits and hyphens. Every field below is required unless marked optional.

YAML: put a list item or value in double quotes when it contains `: `, starts with a quote, or has a `#` in it. Otherwise YAML reads it as something else, and the check's complaint (`expected string, received object`) won't name the line.

```yaml
id: night-shift-sister              # lowercase, digits, hyphens
name: Dana                           # a first name for the role; never a real person's name
summary: One line saying who they are and why they are here
role: visitor                        # visitor (logged out), member (has an account) or admin (runs the site)
story: >-
  A paragraph: their life, their situation today, how they got here, what time it is,
  what device, how much time and attention they have.
hopes:                               # what a good visit gives them; at least one
  - ...
fears:                               # what would make them regret coming; at least one
  - ...
background: Work, schooling, the life that shapes how they read
motivation: Why they bother today
frustrations:                        # general habits of the web that wear them down
  - ...
tech_literacy:
  level: low                         # low, medium or high
  note: One line of what that means for them in practice
prior_knowledge:                     # what they already know; everything else is unknown to them
  - ...
devices: [phone]                     # phone-small, phone, tablet, desktop
locale: en-US
patience: 8                          # an integer from 1 to 50; see below
leave_triggers:                      # concrete moments that make them leave; at least one
  - ...
accessibility:                       # optional: needs that change how they read or act
  - ...
```

How to fill the hard parts:

- **`story`.** Specific beats general. "Opened the link on the bus home, phone at twenty percent" tells the Walker how to behave; "busy professional" doesn't.
- **`patience`.** The server takes one point for each slow page (over 3 seconds), each action that changes nothing, each `back`, each return to a page already seen, and each "no" in the Walker's four questions. At zero the Walker leaves. As a guide: 5 to 9 for someone hurried or doubtful, 10 to 14 for someone who must get it done, 15 or more only for someone with a strong reason to persist. Most people are nearer 8 than 20.
- **`leave_triggers`.** Concrete and checkable on a page: "asked to create an account before seeing a price", "a pop-up asking for my email in the first minute", "three pages in a row that don't say what they actually do". Not "bad UX".
- **`prior_knowledge`.** What they know about the organization and the subject, in their terms. Never the product's own labels or screens. "Knows the organization runs trips abroad" is fine. "Knows the Trips page is under Programs" is not.
- **`role`.** `admin` is for people who run the site. Admin walks need a test copy with seeded data, or a person's written permission for a read-only look (see [`msw-journeys`](../msw-journeys/SKILL.md)).
- **Labels.** Write `summary` and `story` in plain words. If this Walker is an edge Walker, say so in `summary` only if it helps a reader; the Walker is a person first.

## 5. Check it

1. Run the check, with absolute paths (the commands in these skills are easiest to get right that way):

   ```sh
   node <msw>/server/dist/formats/check.js --walker <home>/walkers/<id>.yaml
   ```

   Fix every problem it prints until it prints `ok`.
2. Compare the dossier against `<home>/product-words.md` from step 3. If any label, menu item or page name appears, rewrite that line in the Walker's own words.
3. Read it as a stranger. Could you say what this person would do first on arrival, and what would make them leave? If not, the story is too vague.

## 6. Check the Walkers against each other

When there is more than one Walker, read them side by side. If two of them would plausibly take the same path through the product for the same reason, they are one Walker twice: change who they are (device, arrival, prior knowledge, patience, goal) until they would part ways early. Make sure the run plan has one line per Walker saying how each differs; if the planner already wrote those lines, check them against the dossiers you wrote and correct them.

Done when: every Walker the plan names exists, the check prints `ok` for all of them together, no dossier uses the product's own labels, at least one edge Walker exists with the blind spot it targets written in the plan, and no two Walkers would take the same path.
