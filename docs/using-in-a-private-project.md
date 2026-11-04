# Using the Ministry in a private project

The walk server is the shared part. Your Walkers, journeys and findings describe your product and your users, so they stay in your own repo. Nothing in this repo needs to change to walk a private site.

## What goes where

| Thing | Where it lives |
|---|---|
| The walk server, formats and examples | This repo, unchanged |
| Your Walkers and journeys | Your repo |
| `run.json` | Your repo |
| The run's output: screenshots, events, findings | Your repo, or a folder your repo ignores |

Screenshots show whatever the page showed. Treat a run's output as carefully as the site it walked. Don't commit it to a public repo, including this one.

## Set up

1. Get this repo at a pinned commit, and build the server as [`server/README.md`](../server/README.md) says. It needs Node 22, and Playwright stays pinned to the version in `server/package.json`. A machine with no route to Playwright's download site needs that Chromium build already in place; set `PLAYWRIGHT_BROWSERS_PATH` to it.
2. Copy [`examples/run.json`](../examples/run.json), a Walker and a journey into your repo, and edit them. The formats are in [`formats/`](../formats). `out_dir` is resolved from the directory the server starts in.
3. Register the server with your agent, pointing at your run file:

   ```sh
   claude mcp add msw -- node /path/to/msw/server/dist/mcp/server.js --run /path/to/your/run.json
   ```

## Signing in

The server refuses to act on a password field. For a logged-in journey, a person signs in with a test account once and saves the session (`storage_state`), and the journey uses that. Use test accounts on a test environment, and keep the saved session out of git: it works like a password.

## Writing Walkers who are experts

A Walker tells you whether a person like this can use the page. It doesn't tell you whether the page is correct. A Walker written as an expert can sound sure and be wrong, so:

- Write a role, not a real person. Don't use a real employee's name.
- Label what comes back as simulated feedback. It isn't the view of the person or organization the Walker is modeled on.
- Give the Walker sourced facts in its dossier, and check any claim about your numbers against the source.
- Don't describe your own screens in `prior_knowledge`, or the walk can't show whether they explain themselves.

## What's not finished

This is a draft of plan A. Read the open gaps in [`server/README.md`](../server/README.md) and [the build report](reports/2026-10-11-plan-a-build.md) before you rely on it as a safety boundary. One server process runs one walk at a time.
