---
name: msw-expert-dossier
description: Write a Walker who is a domain expert at a kind of organization (a small savings bank, a county clinic) or at one named organization, with every fact sourced and dated in a fact sheet, and a check that keeps any claim about numbers from being acted on before it is checked. Use when a run plan names an expert Walker, or someone asks for a persona who knows a particular organization or industry.
---

# msw-expert-dossier: write an expert Walker

> The Ministry is fond of experts, in moderation. An expert Walker notices that the interest rate has no date on it and that the glossary defines "liquidity" wrongly. An expert Walker can also be wrong with tremendous confidence, which is why the Ministry keeps a fact sheet and a rubber stamp marked CHECKED.

An expert Walker is an ordinary Walker (see [`msw-dossier`](../msw-dossier/SKILL.md)) with a profession, a workplace and a fact sheet. Do every step of `msw-dossier` too; this skill adds what an expert needs. The output is:

- `<home>/walkers/<id>.yaml`: the dossier, which passes the `check` command like any Walker.
- `<home>/walkers/<id>.facts.md`: the fact sheet, every fact with its source and date.

`<home>` is the Ministry folder in the product's repo (see [`msw-file`](../msw-file/SKILL.md), part 1).

## What an expert Walker can and cannot tell you

Write this at the top of the fact sheet, and keep it in mind all the way through:

- The Walker tells you **whether an expert can use the page**: whether they find what they came for, trust it, and understand it in their own terms.
- The Walker's view is **simulated feedback**. It is not the view of the organization the Walker is modeled on, nor of anyone who works there.
- A claim the Walker makes about whether the page's **facts or numbers are right** is a lead, not a finding. It is checked against a source before anyone acts on it (step 6).

## 1. Settle who the expert is

Ask the owner, and write the answers in `<home>/brief.md`. Any answer you had to infer is marked `assumed`, as in `msw-dossier`:

1. **A kind of organization, or one named organization?** "A compliance officer at a small savings bank" is a kind. "A compliance officer at [a named bank]" is one organization.
2. **What job?** A role and its seniority: "branch operations manager, eight years in". Never a real person, and never a real employee's name, even with permission. The Walker gets a first name for the role, as any Walker does.
3. **What would this person come to the product to do?** In their words, as for any Walker.
4. **Which sources may the fact sheet use?** Offer exactly these two, and record which the owner chose, who chose it and when:

   | Choice | What it allows | What follows |
   |---|---|---|
   | **Public records only** | Sources anyone can read (see the list in step 2) | The Walker and its fact sheet may be stored wherever the owner's findings are stored |
   | **Public records and the team's own private material** | Also the team's notes, interviews, research, support tickets, internal documents | The Walker and its fact sheet **must stay in private storage**: a private repo or a folder git ignores (options 1 to 3 in [`msw-file`](../msw-file/SKILL.md), never a public repo). Mark the fact sheet's header `private: true` |

   **When nobody can be asked**, use public records only, and say so in the report.

## 2. Gather the facts

The fact sheet holds what this expert knows that an ordinary visitor doesn't: the terms of the trade, the rules they work under, the figures they would expect to see, and the habits of their workplace. Aim for ten to twenty facts that bear on what the Walker will try to do. More is not better.

Kinds of source to use, in rough order of preference:

1. **The regulator's or official register's own pages**: licensing registers, published rules and guidance, official statistics, filings an organization must publish.
2. **The organization's own published material**: annual reports, published rates and fees, terms and conditions, press releases, published policies.
3. **Standards bodies and professional associations**: published standards, glossaries, codes of practice.
4. **Reputable reporting**: news and trade press that names its own sources.
5. **The team's private material**, only if the owner allowed it in step 1.

Do not use: forums, anonymous reviews, AI-generated summaries, or anything you cannot point back to. A fact you remember but cannot source does not go in the sheet.

**When you have no route to the open web,** use what the product's repo, the owner and the team's material (if allowed) can give you, and say in the report which facts could not be sourced. A short sheet with real sources beats a long one without them.

**When the organization is invented** (a practice example, or a demonstration), every fact is invented too. Say so in the sheet's header (`fictional: true`), make the organization's name obviously fictional, and set every fact's source to `fictional, invented for this example` and its source date to `n/a (fictional)`. A reader must never be able to mistake an invented fact for a real one.

## 3. Write the fact sheet

`<home>/walkers/<id>.facts.md`:

```markdown
# Fact sheet: <id>

- Walker: <id>, <role at kind of organization>
- Modeled on: <the kind of organization, or the named organization>
- Sources allowed: public only | public and private (chosen by <who>, <date>)
- private: false            # true if any fact uses private material
- fictional: false          # true if the organization and facts are invented
- Written: <date>, by <who or which agent>

This Walker gives simulated feedback. It is not the view of <the organization> or anyone who works there.
It can say whether an expert can use the page. Whether the page's facts are right is checked against the sources below.

| # | Fact | Source | Source date | Checked on |
|---|---|---|---|---|
| F1 | The plain statement of one fact | Where it comes from: a title and a link, or a document name and section | The date the source was published or last updated | The date you read it |
```

Rules:

- One fact per row. "Rates must be shown as an annual percentage" is one fact.
- **Source date** is the source's own date. **Checked on** is when you read it. A fact older than a year about anything that changes (rates, fees, rules, people's roles) gets `(may be stale)` after the date.
- Never paste in personal data, and never a real person's name. Roles only: "the bank's published complaints officer", not their name.
- The Walker's dossier is the person; the fact sheet is the reference. Keep them separate.

## 4. Write the dossier

Write the YAML as in [`msw-dossier`](../msw-dossier/SKILL.md) step 4, with these additions:

- **`summary`** starts with the role and the kind of workplace, and ends `(simulated)`: "A compliance officer at a small savings bank, checking how the product explains fees (simulated)".
- **`background`** gives the job, the years in it, and what that trains a person to notice.
- **`prior_knowledge`** holds what the expert knows **about the subject**, as short lines that point at the fact sheet: `"how savings rates must be quoted (F1, F2)"`. Quote each line, as `msw-dossier` step 4 says, since these often hold colons. Never the product's own labels or screens. Knowing the subject is not knowing the product. Terms of the trade ("register number", "complaints procedure") are the expert's words, not product labels.
- **`frustrations`** and **`leave_triggers`** include the expert's own: "a figure with no date on it", "a term of art used loosely", "a claim with no source". Keep them concrete enough to see on a page.
- **`patience`**: experts are often short on time and long on doubt. 6 to 10 unless they must get it done.
- **`tech_literacy`** is about computers, not the subject. A senior banker may be `low`.

The `check` command does not know about fact sheets. Keep the sheet's file name `<id>.facts.md` so the next person finds it.

## 5. Check it

1. Run the check:

   ```sh
   node <msw>/server/dist/formats/check.js --walker <home>/walkers/<id>.yaml
   ```

   Fix every problem until it prints `ok`.
2. Every line in `prior_knowledge` that states a fact points at a row in the fact sheet. Every row has a source and two dates.
3. No real person's name appears in the dossier or the sheet.
4. If the sheet is `private: true`, the place you are about to save it is private storage. If it is not, stop and ask the owner where it should go.
5. If the sheet is `fictional: true`, every source says `fictional, invented for this example`, every source date says `n/a (fictional)`, and the organization's name could not be mistaken for a real one.

## 6. After a walk: checking the expert's claims

An expert Walker will say things like "this rate is wrong" or "that is not what the rule says". Those are claims about facts, and the Walker can be wrong. When [`msw-file`](../msw-file/SKILL.md) writes the report, every such claim goes in a table of its own:

| Claim | Walker's words | Fact sheet row | Status |
|---|---|---|---|
| C1 | "The savings rate has no date on it" | F2 | checked: true, the page shows no date |
| C2 | "That fee is higher than the published one" | F5 | not checked |

- **`checked`** means a person or agent compared the claim with the fact sheet's source, read on a stated date, and wrote what they found.
- **`not checked`** means nobody has yet. It is the default. Nobody acts on a claim that is `not checked`.
- A claim that has no row in the fact sheet stays `not checked` until a source is found. Add the source as a new row when it is.

A usability finding ("I could not find the fee table") is a normal finding and needs no check: the walk's evidence proves it.

Done when: the dossier passes `check`, the fact sheet exists with a source and two dates for every fact, the source choice and who made it are recorded in `brief.md`, private material sits only in private storage, the summary says `(simulated)`, and no real person is named.
