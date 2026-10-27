<!-- model: claude-sonnet-5-5 -->
## STATUS: PASS

## Evidence
1. **Open:** I called `start_walk` and got the home page headed "Transforming Lives Together". A cookie panel covered the lower part of the page. This matches.
2. **Reject all:** I pressed it. The panel closed and the full home page showed, with a bulletin ticker in its place. This matches.
3. **Get Involved (top menu):** The Get Involved page opened. It says "donate, volunteer, partner, or advocate". This matches.
4. **Scroll down to Engagement Opportunities, press Travel:** One scroll reached the Travel card, and pressing it opened the Trips page, headed "Cultural Connections".
   - The group wording ("organize… academic, corporate, faith, or common interest group") is on the Travel card, not on the Trips page's first screen.
   - Further down the Trips page, the "Interested in bringing your group?" section says academic, corporate, faith and common interest groups can partner for a customized experience.
   - I counted this as a match by meaning.
5. **Scroll down to "Interested in bringing your group?", press Get in Touch:** It took two scrolls, then the button opened the contact page.
   - The page shows offices in Atlanta and Managua, an Email field, a Phone field and a form.
   - The email and phone values appear as "[masked]", but the fields are there. This matches.
6. **Open the "What can we help you with?" list:** The list shows Making a Donation, Volunteer Opportunities, Partnership Opportunities, Service Learning Trips, Media & Press Inquiries and Other. I did not choose anything or send the form. This matches.
7. **Where We Work, Nicaragua, scroll to Communities We Serve:** The Nicaragua page opened. It took two scrolls to reach "Communities We Serve", which lists Los Robles, San Esteban, San Juan del Sur and Rural Highlands Region. This matches. I was never asked for an email address.

## Quit
Walk saved in walks/comunidad-connect/2026-10-14-live/inspection/attempt-2/walks/inspector-inspector-partner-seeker-guide-desktop-en-US. Findings: 20. verified: true. alive: false (page f5ed11d5 has 1 screenshot; page 7cb08a87 has 1 screenshot).

## Proposed guide diff
Everything passed, so nothing is needed to fix a failure. The diff below is optional and covers small unclear spots.

```diff
--- a/guide.md
+++ b/guide.md
@@ step 4
 4. Scroll down to **Engagement Opportunities** and press the **Travel** card.
-   **Expected:** the Trips page about the Cultural Connections program. It says trips can be organized for academic, corporate, faith or common-interest groups.
+   **Expected:** the Trips page, headed "Cultural Connections". (The group wording is on the Travel card you just pressed, and again further down this page under "Interested in bringing your group?".)
@@ step 5
-5. Scroll down to **Interested in bringing your group?** and press **Get in Touch**.
+5. Scroll down (about two screens) to **Interested in bringing your group?** and press **Get in Touch**.
-   **Expected:** the contact page, with offices in Atlanta and Managua, an email address, a phone number and a contact form.
+   **Expected:** the contact page, with offices in Atlanta and Managua, an email address, a phone number and a contact form. (The email and phone may display as "[masked]".)
@@ step 7
-7. In the top menu, press **Where We Work**, then **Nicaragua**, and scroll down to **Communities We Serve**.
+7. In the top menu, press **Where We Work**, then **Nicaragua**, and scroll down (about two screens) to **Communities We Serve**.
-   **Expected:** the Nicaragua page names the communities where the organization works, such as Los Robles and San Juan del Sur.
+   **Expected:** the Nicaragua page names the communities where the organization works: Los Robles, San Esteban, San Juan del Sur and Rural Highlands Region.
```