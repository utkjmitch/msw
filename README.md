# The Ministry of Silly Walks

*Persona-based usability and functionality testing of websites, by AI agents, with a human at the end.*

Every website is walked, eventually, by somebody it was not designed for. A retired teacher on a phone. A volunteer on a Sunday night. A partner with twenty minutes and a healthy suspicion of anything labeled "Learn more." Usually they leave quietly, and nobody finds out why.

The Ministry sends them in first.

Each Walker is a full person: a story, hopes, fears, a limited supply of patience, and a short list of things that make them leave. They walk the site the way that person would. They see only what a person sees, and the Ministry's server makes it impossible for them to cheat. Afterward, a second agent who has never met the site follows the resulting guide to the letter, and stops the moment it is unclear. Then a human walks it. The Ministry does not certify a walk no human has taken.

**Status:** the walk server works (plan A), and the skills for writing Walkers and journeys, walking a site, and filing the findings are written (see [`skills/`](skills/README.md)). The Cheese Shop, the HTML reports, the guide and the Inspection come next. Nothing is published as a release yet.

**Build qualification:** the automated gates pass. Safety and spec gaps remain for review. See [the plan A build report](docs/reports/2026-10-11-plan-a-build.md).

## Use it

The walk server is in [`server/`](server/README.md). The skills an agent follows to write Walkers, plan and walk a run, and file what it found are in [`skills/`](skills/README.md). To walk your own site and keep your Walkers and findings private, see [Using the Ministry in a private project](docs/using-in-a-private-project.md).

## What it will contain

- **Skills** for writing Walkers and journeys, writing silly walks, walking a site, and filing the findings (written), and for writing the guide, inspecting the guide, and finding gaps between what a product promises and what it does (to come).
- **An MCP server** that drives a real browser, gives the Walker only a screenshot, the visible text and the things it can click, and keeps the evidence.
- **The Cheese Shop**, a practice site with planted flaws and an answer key, so the Ministry can say how much it actually finds. Its score is published with every release.
- **Findings that go home.** A walk's findings go to the repo of the product that was walked, stored the way that repo's owner chooses. See [where the findings go](docs/using-in-a-private-project.md#where-the-findings-go).

## Credits

The Ministry stands on the shoulders of several sensible people. See [`NOTICE`](NOTICE).

## License

Apache-2.0.

*Create Good, Simply.*
