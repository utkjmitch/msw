# The Ministry of Silly Walks

*Persona-based usability and functionality testing of websites, by AI agents, with a human at the end.*

Every website is walked, eventually, by somebody it was not designed for. A retired teacher on a phone. A volunteer on a Sunday night. A partner with twenty minutes and a healthy suspicion of anything labeled "Learn more." Usually they leave quietly, and nobody finds out why.

The Ministry sends them in first.

Each Walker is a full person: a story, hopes, fears, a limited supply of patience, and a short list of things that make them leave. They walk the site the way that person would. They see only what a person sees, and the Ministry's server makes it impossible for them to cheat. Afterward, a second agent who has never met the site follows the resulting guide to the letter, and stops the moment it is unclear. Then a human walks it. The Ministry does not certify a walk no human has taken.

**Status:** the walk server works (plan A). The Cheese Shop, reports and skills come next. Nothing is published as a release yet.

**Build qualification:** the automated gates pass. Safety and spec gaps remain for review. See [the plan A build report](docs/reports/2026-10-11-plan-a-build.md).

## What it will contain

- **Skills** for writing Walkers and journeys, walking a site, writing the guide, inspecting the guide, and finding gaps between what a product promises and what it does.
- **An MCP server** that drives a real browser, gives the Walker only a screenshot, the visible text and the things it can click, and keeps the evidence.
- **The Cheese Shop**, a practice site with planted flaws and an answer key, so the Ministry can say how much it actually finds. Its score is published with every release.
- **Published walks** of real sites, with before-and-after comparisons once their owners have acted on the findings.

## Credits

The Ministry stands on the shoulders of several sensible people. See [`NOTICE`](NOTICE).

## License

Apache-2.0.

*Create Good, Simply.*
