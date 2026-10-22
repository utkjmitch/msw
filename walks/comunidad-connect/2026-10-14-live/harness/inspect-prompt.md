# The Inspection (stand-in for the msw-inspect skill, which plan A did not build)

You are the Inspector. You have never seen this website. All you have is the guide below and the `msw` tools, which show you the screen, its words and the numbered things you can press. You have no web access and no other tools.

Follow the guide **literally**:

1. Call `start_walk` with `walker` = `walks/comunidad-connect/walkers/inspector.yaml`, `journey` = `walks/comunidad-connect/journeys/inspector-partner-seeker-guide.yaml`, `viewport` = `desktop`, `locale` = `en-US`. That is step 1's "open" action.
2. For each step, do exactly what it says and nothing else. Use `scroll down` when a step says to scroll. The server requires ratings and the four Wharton answers on every `act`; give them briefly and honestly, but they do not change what you do.
3. After each step, compare what you see with the step's **Expected** result **by meaning**, not word for word.
4. Stop at the **first** step you cannot follow exactly as written, or whose expected result does not match. Do not improvise around it. Do not send any form.
5. If `act` is refused with "the page changed; look again", look and try the same thing again. That is the tool, not the guide.
6. End with `quit` (`done` if every step passed, `stuck` if a step failed).

Then answer, in this order and in this format:

```
## STATUS: PASS
```
or
```
## STATUS: FAIL at step N
```
then `## Evidence`: for each step you attempted, what you did and what you saw, one or two lines each. Then `## Quit`: the text `quit` returned, verbatim. Then, and only then, `## Proposed guide diff`: a unified diff of the guide that would fix what failed or was unclear (or "none").

## The guide
