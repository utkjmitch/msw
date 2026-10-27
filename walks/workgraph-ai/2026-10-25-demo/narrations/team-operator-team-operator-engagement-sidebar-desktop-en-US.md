# Marcus — team-operator-engagement-sidebar (desktop, en-US)

**Reached my goal:** no. The new Work Evolution links are in the sidebar and they work, but every page behind them was empty or an editing tool, so I had nothing to show a client.

## What I tried
I started on the dashboard and opened the Northwind Logistics engagement card. The sidebar looked the same as before, with no map, transcripts or workflows in view. When I scrolled down I found a **Work Evolution** group at the very bottom with Star map, Workflows, Company timeline and Transcripts.

- **Star map:** the page said "No synthetic project to map yet… until the group-floor policy is settled." The Project dropdown only offered "No projects".
- **Transcripts:** this was mostly an upload form. I switched the Project dropdown through four companies (Northwind, Acme, Meridian, Riverpoint), and each said "No transcript uploaded for this project yet." Each switch also quietly changed my active engagement in the sidebar.
- **Workflows:** "0 named workflows", plus a builder with a "Save workflow" button. Picking a role showed a generic step list, but there was nothing saved to read and no timeline.
- **Roles:** this opened "Role Analysis" (HRIS stats and an employee directory). Even after scrolling I saw no role evolution timeline. By then I was out of patience.

## Where I struggled
- **The Work Evolution links sit below the fold.** On a 1440×900 screen I have to scroll past Future State and Implement & Measure to reach them.
- **Empty star map.** The message uses internal terms ("synthetic project", "group-floor policy") and doesn't tell me who can fix it. This was the thing I feared most going into a client call.
- **No transcripts in any demo engagement.** The page leads with Upload, not reading.
- **Workflows is built for authoring.** It doesn't name the project, has nothing saved to read, has no evolution timeline, and shows a Save button next to a read view.
- **I couldn't find a role timeline.** Neither Roles nor Work Evolution has a visible link to one.
- **The Transcripts project dropdown switches my engagement everywhere.** Nothing tells you it does. In front of a client I could end up showing the wrong company.
- **Meridian Financial Technologies** shows up in the dropdowns but wasn't among the engagement cards I saw on the dashboard.
- **One note was probably wrong.** I filed a note (w3) saying the sidebar highlighted "Survey sends" on the Star map page. When I scrolled, Star map was highlighted correctly, so that was most likely a hover highlight where my pointer sat, not a bug.

## What I'd tell a friend
The sidebar links from PR #387 are there; scroll to the bottom for "Work Evolution". But in this demo they open empty pages. Don't plan to show the star map, transcripts or workflows to a client until someone loads demo data, and don't use the Project dropdowns mid-call.

## The path
1. **Open Northwind Logistics · Q2 2026 journey** (dashboard card): engagement page "You are here on the journey" at 38%. The sidebar was unchanged.
2. **scroll down:** the Work Evolution group (Star map, Workflows, Company timeline, Transcripts) came into view at the bottom of the sidebar.
3. **Star map:** "No synthetic project to map yet…". Empty.
4. **Project dropdown** (Star map): its only option was "No projects".
5. **scroll down:** the sidebar Work Evolution group again, with Star map highlighted.
6. **Transcripts:** "Meeting transcripts" with an upload form. Northwind had no transcripts.
7. **Project → Acme Industrial Services:** no transcripts. The journey widget switched to Acme at 26%.
8. **Project → Meridian Financial Technologies:** no transcripts. The widget showed Implement & Measure at 79%.
9. **Project → Riverpoint Software:** no transcripts. The widget showed Future State at 48%.
10. **scroll down:** the sidebar bottom again.
11. **Workflows:** "0 named workflows", a handoff walk picker, and a Save workflow button (I didn't press it).
12. **Start from** (opened the role list): Customer Insights Analyst, Customer Success Manager, and others.
13. **Start from → Customer Success Manager:** a generic step checklist marked "read not mapped yet".
14. **Roles:** "Role Analysis" with HRIS data for Riverpoint.
15. **scroll down:** employee directory, value rollup and role filters. No timeline. I left.

## Success conditions
- Opened a demo engagement from the dashboard: **met** (step 1).
- Opened the star map for that engagement: **not met**. The page opened at step 3, but there was no map.
- Opened the transcripts and read one: **not met**. The page opened at step 6, but no project had a transcript.
- Opened one role's evolution timeline: **not met**. I didn't find one.
- Opened one project's workflows and read one: **not met**. The page opened at step 11, but there were 0 workflows to read.

## Quit
```
Walk saved in /wt/.msw-walks/workgraph-ai/2026-10-25-demo/walks/team-operator-team-operator-engagement-sidebar-desktop-en-US. Findings: 16. verified: true. alive: false (page ddf977f1 has 1 screenshot; page ddf977f1 has no instrument record; page 4efd1787 has 1 screenshot; page 004d6285 has 1 screenshot; page 004d6285 has no instrument record; page 0f39d9c1 has 1 screenshot; page 0f39d9c1 has no instrument record; page cebf302f has 1 screenshot; page 816e242d has 1 screenshot; page 816e242d has no instrument record; page eda5f62f has 1 screenshot; page eda5f62f has no instrument record; page c8177699 has 1 screenshot; page c717c09d has 1 screenshot; page 6feaced5 has 1 screenshot).
```

The harness reported `alive: false` because several pages have a screenshot but no instrument record. Check the walk record before relying on it.