# Inspection output

Separate `claude -p` session, model claude-sonnet-5-5, tools limited to the five msw MCP tools, no shared context. Input: `guide.md` only (prompt in `inspection/prompt.txt`). Turns: 9.

## STATUS: PASS

Evidence:
1. The home page at pickprophets.com has the heading "Call every game." and a "Cookie Preferences" box near the bottom.
2. I pressed "Reject All". The cookie box closed and the home page stayed.
3. I pressed "Play" in the top menu. The page is headed "Play" and shows a card for NBA Finals 2026 · MONTA CARLO, "Game 6: SAS @ NYK", with "10,000 simulated games". Win odds are SAS 35.5% and NYK 64.5%.
4. I scrolled down and pressed the "MONTA CARLO" card. The page is /play/monta-carlo, "Play · NBA Matchup Lab", San Antonio Spurs @ New York Knicks, with both rosters listed.
5. I pressed "? how it works". A panel headed "How MONTA CARLO works" opened. It explains the 1–20 rating scale and says a possession-by-possession simulation settles each matchup.

Quit result: Walk saved in inspection/walks/data-enthusiast-data-enthusiast-simulations-desktop-en-US. Findings: 21. verified: true. alive: false (page a41253d2 has 1 screenshot; page 7847ae67 has 1 screenshot; page e9912082 has 1 screenshot; page 7c72631a has 1 screenshot).

Proposed guide diff:
```diff
--- guide.md
+++ guide.md
@@ step 3
-   Expected: a page headed "Play" with a simulation card for NBA Finals 2026, Game 6, SAS @ NYK, showing 10,000 simulated games and win odds for each team.
+   Expected: a page headed "Play" with a simulation panel for NBA Finals 2026 · MONTA CARLO, Game 6: SAS @ NYK, showing 10,000 simulated games and Game 6 win odds for each team (SAS 35.5%, NYK 64.5%). The panel is a results display, not the card to press in step 4.
@@ step 4
-4. Scroll down and press the card titled "MONTA CARLO".
+4. Scroll down, past the results panel, to the card titled "MONTA CARLO" (next to "More experiments, soon"), and press it.
-   Expected: a page for the NBA Matchup Lab, with San Antonio Spurs @ New York Knicks and the two team rosters.
+   Expected: a page for the NBA Matchup Lab (/play/monta-carlo), with San Antonio Spurs @ New York Knicks (the "@" is shown as a badge) and the two team rosters.
@@ step 5
-   Expected: a panel headed "How MONTA CARLO works" that explains a 1 to 20 rating scale and a possession-by-possession simulation.
+   Expected: a panel headed "How MONTA CARLO works" that explains a 1 to 20 rating scale and a possession-by-possession simulation. It opens over the page and has a close (✕) button.
```
