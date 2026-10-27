# Screenshot and name check

Jimmy's rule for this walk (2026-10-25): "Just use the fake demo Accounts, not Caliber". No masking and no gray bars. If any image shows a name that isn't from a demo profile, the walk is wrong.

**Result: every image in this folder is demo data only. No image is masked, and none was edited.**

## Why the images can only hold demo data

- The app ran on this box only (`http://localhost:3000`), against a new embedded Postgres that held nothing but the repo's Prisma migrations and the five demo profiles (`scripts/seed-demo.mjs acme | northwind | riverpoint | corvane | merfintech`, one profile at a time, never `all`).
- The org check ran before any Walker started (`ORG-CHECK.txt`). The database held 5 organizations, all demo: Acme Industrial Services, Corvane Telematics, Meridian Financial Technologies, Northwind Logistics and Riverpoint Software. The PE firms were Riverbend Capital, Cascade Industrial Partners, Highline Growth Partners and Quillfeather Partners. Every user is `@workgraph.local`.
- The Walkers signed in as `demo@workgraph.local` only. The journeys allow no origin but `http://localhost:3000`.
- The app's source names a client in a few places (code comments, tests, a survey template's internal label "Caliber survey series", and a role list variable called `CALIBER` that holds role titles only). None of these appeared on any page the Walkers saw: "caliber" occurs nowhere in the walks, narrations, harness logs, summary or Inspection. Survey sends, the one page that uses the survey template, shows no template label (people walk, screens 170 and 171; flags-off pass, screen 141; all viewed).
- Every person name on the pages the Walkers read was checked against the 2,427 names in the demo database (`demo-names.txt`: employees, users, orgs, PE firms, engagements, projects). Every first-name-and-surname pair the Walkers saw is in that list. The only pairs not on it are company and role words ("Meridian Financial", "Software Engineer"). No email address appeared on any page.

## Images in the report

Each was viewed at full size (1440 × 900) before it was used.

| Image | Source | Where it's used | Names seen | Status |
|---|---|---|---|---|
| `shots/01-dashboard-sidebar.png` | Walker screen, engagement-sidebar walk, screen 2 | Finding 9 | the five demo engagements, "WorkGraph AI" | demo data only |
| `shots/02-work-evolution-below-fold.png` | Walker screen, work-map walk, screen 63 | Finding 9 | demo engagements, sidebar labels | demo data only |
| `shots/03-star-map-empty.png` | harness capture (`harness/capture.mjs`) | Finding 1 | demo engagement names in the project picker | demo data only |
| `shots/04-transcripts-empty.png` | harness capture | Finding 2 | demo engagement names | demo data only |
| `shots/05-workflows-builder.png` | harness capture | Finding 3 | none (no client named, which is the finding) | demo data only |
| `shots/06-role-page-from-roles-list.png` | Walker screen, people walk, screen 82 | Finding 4 | a demo role title | demo data only |
| `shots/07-roles-page-top.png` | Walker screen, people walk, screen 49 | Finding 11 | Meridian Financial Technologies | demo data only |
| `shots/08-role-evolution.png` | harness capture | Finding 4 | a demo role title | demo data only |
| `shots/09-company-timeline.png` | harness capture | Worth keeping | Meridian Financial Technologies, demo role titles | demo data only |
| `shots/10-clients-and-snapshots.png` | harness capture | Finding 12 | the five demo companies | demo data only |
| `shots/11-readout.png` | harness capture | Finding 5 | Meridian Financial Technologies | demo data only |
| `shots/12-interview-no-answers.png` | harness capture | Finding 6 | none | demo data only |
| `shots/13-send-invite-wall.png` | Walker screen, people walk, screen 100 | Finding 7 | first names "Aisha" and "Jordan" (both in the demo seed) | demo data only |

Looked at and not used: people walk screen 106 (the CTO role's evidence coverage and job description, role titles only). It was dropped from `shots/`.

## Every other image

The Walkers' own screenshots and the walk server's replay frames stay in the raw walk folders. They show the same pages from the same demo database. Every one is **demo data only**, on the grounds above. Viewed at full size: the screens copied into `shots/` and the three Survey sends screens. The rest were covered by the text check, not viewed one by one.

### `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/`

31 Walker screens and 1 replay frames, all demo data only.

- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/47.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/51.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/52.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/56.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/57.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/63.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/64.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/68.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/69.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/73.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/115.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/119.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/130.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/135.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/139.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/143.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/152.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/158.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/159.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/164.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/165.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/170.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/171.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/177.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/178.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/180.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/181.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/184.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/189.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/195.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only

### `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/`

28 Walker screens and 0 replay frames, all demo data only.

- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/2.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/50.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/54.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/56.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/63.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/64.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/72.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/73.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/81.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/88.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/93.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/94.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/99.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/100.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/105.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/106.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/111.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/112.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/117.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/118.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/124.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/125.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/130.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/135.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/137.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/138.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/140.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-people-desktop-en-US/screens/141.png`: demo data only

### `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/`

27 Walker screens and 11 replay frames, all demo data only.

- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/42.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/46.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/47.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/52.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/53.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/56.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/61.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/72.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/82.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/83.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/87.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/88.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/90.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/91.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/98.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/110.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/114.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/115.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/119.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/126.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/131.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/132.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/138.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/139.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/141.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/screens/142.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/41.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/45.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/46.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/44.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/48.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/49.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/53.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/54.png`: demo data only
- `pass-0-flags-off/walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/57.png`: demo data only

### `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/`

32 Walker screens and 118 replay frames, all demo data only.

- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/50.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/54.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/55.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/69.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/75.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/76.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/83.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/85.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/86.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/91.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/92.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/96.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/97.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/101.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/102.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/108.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/109.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/115.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/116.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/121.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/122.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/126.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/127.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/129.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/130.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/135.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/137.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/144.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/145.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/41.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/46.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/57.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w1/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/58.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/44.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/48.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/49.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/62.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/63.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w2/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/69.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/40.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/44.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w3/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/66.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/43.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/47.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/48.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/58.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/64.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/69.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/70.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/72.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/73.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/77.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/78.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/83.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/88.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w4/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/89.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/37.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/41.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/42.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/56.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/57.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/62.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/63.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/67.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/70.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/71.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/75.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/76.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/80.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/81.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/86.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w5/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/87.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/100.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/101.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/106.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/111.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/112.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/114.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/115.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/44.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/48.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/49.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/61.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/66.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/67.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/71.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/72.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/75.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/79.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/80.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/84.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/85.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/89.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/90.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/94.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w6/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/95.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/101.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/102.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/108.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/112.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/113.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/115.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/116.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/120.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/121.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/129.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/130.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/42.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/46.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/47.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/61.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/66.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/67.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/71.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/72.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/75.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/79.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/80.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/84.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/85.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/89.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/90.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/94.png`: demo data only
- `walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/replays/team-operator-team-operator-engagement-sidebar-w7/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US/screens/95.png`: demo data only

### `walks/team-operator-team-operator-people-desktop-en-US/`

37 Walker screens and 96 replay frames, all demo data only.

- `walks/team-operator-team-operator-people-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/49.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/52.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/64.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/73.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/89.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/94.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/95.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/100.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/101.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/106.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/112.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/113.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/118.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/119.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/124.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/126.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/127.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/132.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/133.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/138.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/139.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/145.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/148.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/152.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/154.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/158.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/165.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/170.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/171.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/175.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/screens/177.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/39.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/43.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/56.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/57.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/64.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w1/walks/team-operator-team-operator-people-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/101.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/102.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/108.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/113.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/114.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/38.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/42.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/46.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/61.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/69.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/76.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/84.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/89.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/90.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/95.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w2/walks/team-operator-team-operator-people-desktop-en-US/screens/96.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/101.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/102.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/108.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/113.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/114.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/119.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/120.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/125.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/126.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/131.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/132.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/138.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/141.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/146.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/151.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/155.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/160.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/41.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/46.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/57.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/58.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/66.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/84.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/89.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/90.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/95.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w3/walks/team-operator-team-operator-people-desktop-en-US/screens/96.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/100.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/105.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/106.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/111.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/112.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/117.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/118.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/123.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/124.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/129.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/130.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/136.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/140.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/145.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/147.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/151.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/158.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/162.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/163.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/167.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/169.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/41.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/48.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/58.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/66.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/67.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/87.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/88.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/93.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/94.png`: demo data only
- `walks/team-operator-team-operator-people-desktop-en-US/replays/team-operator-team-operator-people-w4/walks/team-operator-team-operator-people-desktop-en-US/screens/99.png`: demo data only

### `walks/team-operator-team-operator-work-map-desktop-en-US/`

34 Walker screens and 108 replay frames, all demo data only.

- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/49.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/62.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/63.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/69.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/75.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/77.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/78.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/83.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/87.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/88.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/92.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/93.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/98.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/112.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/116.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/117.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/121.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/133.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/140.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/141.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/146.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/147.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/151.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/152.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/154.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/155.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/160.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/161.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/166.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/screens/171.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/43.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/53.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/54.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w1/walks/team-operator-team-operator-work-map-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/35.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/45.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/46.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/51.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/52.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/56.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/57.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/64.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/69.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/70.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/74.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w2/walks/team-operator-team-operator-work-map-desktop-en-US/screens/75.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/102.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/110.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/114.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/125.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/40.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/53.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/54.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/64.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/67.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/72.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/73.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/77.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/78.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/83.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w3/walks/team-operator-team-operator-work-map-desktop-en-US/screens/87.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/102.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/103.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/107.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/119.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/124.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/125.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/130.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/131.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/135.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/136.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/138.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/139.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/36.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/51.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/52.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/57.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/58.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/62.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/63.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/66.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/71.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/72.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/76.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/77.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/81.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/86.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w4/walks/team-operator-team-operator-work-map-desktop-en-US/screens/98.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/100.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/104.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/105.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/109.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/120.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/126.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/127.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/131.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/132.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/136.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/137.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/139.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/140.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/144.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/145.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/150.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/154.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/2.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/44.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/53.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/54.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/59.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/60.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/64.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/65.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/67.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/68.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/72.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/73.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/77.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/78.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/82.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/83.png`: demo data only
- `walks/team-operator-team-operator-work-map-desktop-en-US/replays/team-operator-team-operator-work-map-w5/walks/team-operator-team-operator-work-map-desktop-en-US/screens/87.png`: demo data only

