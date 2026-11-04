# Using the Ministry in a private project

The walk server is the shared part. Your Walkers, journeys and findings describe your product and your users, so they stay in your own repo. Nothing in this repo needs to change to walk a private site.

## The skills

The skills in [`skills/`](../skills/README.md) take an agent through the whole thing, with nothing but this repo and yours. Start with [`skills/README.md`](../skills/README.md), which gives the order:

1. [`msw-file`](../skills/msw-file/SKILL.md), part 1: ask where the findings go, and set up the folder for them.
2. [`msw-walk`](../skills/msw-walk/SKILL.md), part 1: plan the run, including the people and situations nobody asked about.
3. [`msw-dossier`](../skills/msw-dossier/SKILL.md) and [`msw-expert-dossier`](../skills/msw-expert-dossier/SKILL.md): write the Walkers.
4. [`msw-journeys`](../skills/msw-journeys/SKILL.md) and [`msw-silly`](../skills/msw-silly/SKILL.md): write their journeys, silly walks included.
5. [`msw-walk`](../skills/msw-walk/SKILL.md), parts 2 and 3: set up and walk, one walk at a time.
6. [`msw-file`](../skills/msw-file/SKILL.md), part 2: write the report.

To practice first, `node server/dist/practice-site.js` serves the small example site at `http://127.0.0.1:4810/`, the address the [examples](../examples) use.

## What goes where

| Thing | Where it lives |
|---|---|
| The walk server, formats and examples | This repo, unchanged |
| Your Walkers and journeys | Your repo |
| `run.json` | Your repo |
| The run's output: screenshots, events, findings | Your repo, or a folder your repo ignores |

Screenshots show whatever the page showed. Treat a run's output as carefully as the site it walked.

**This repo never holds records of a real site.** It's public, and `walks/` and `runs/` are ignored here.

## Where the findings go

Findings go to the repo of the product that was walked. Before the first walk of a product, ask whoever owns that repo how to store them, give them these options, and record the answer in the run's report. If nobody has answered, keep the output in a folder git ignores until they do.

| Option | Good for | The catch |
|---|---|---|
| **1. A folder in the repo**, such as `docs/walks/msw/` | Findings stay next to the code and get reviewed like any other change | Private repos only. Adds screenshots to the repo's history |
| **2. A folder git ignores** | A quick walk, or anything too sensitive to share | Stays on one machine: not shared, not backed up |
| **3. A separate private repo** | Keeping the product repo small, or giving different people access | One more repo to look after, and findings sit away from the code |
| **4. Reports in the repo, screenshots elsewhere** | Keeping the text with the code without the image weight | Links can go stale, and the storage needs its own access rules |

A public repo can't use option 1, because the output would be public; the same goes for the reports in option 4. An owner may turn real findings into tickets as well, but the record of the walk still needs one of these homes.

Set `out_dir` in `run.json` to match the choice. Add a short `README.md` beside the records saying where they're kept and what the other options are, so the next person doesn't have to ask. [`msw-file`](../skills/msw-file/SKILL.md) walks through all of this, including what to do when nobody can be asked.

## Set up

1. Get this repo at a pinned commit, and build the server as [`server/README.md`](../server/README.md) says. It needs Node 22, and Playwright stays pinned to the version in `server/package.json`. A machine with no route to Playwright's download site needs that Chromium build already in place; set `PLAYWRIGHT_BROWSERS_PATH` to it. With no route to GitHub at all, see [No route to GitHub](#no-route-to-github).
2. Copy [`examples/run.json`](../examples/run.json), a Walker and a journey into your repo, and edit them. The formats are in [`formats/`](../formats). `out_dir` is resolved from the directory the server starts in.
3. Register the server with your agent, pointing at your run file:

   ```sh
   claude mcp add msw -- node /path/to/msw/server/dist/mcp/server.js --run /path/to/your/run.json
   ```

## No route to GitHub

Some environments can't reach GitHub, the npm registry or Playwright's download site. Bring the Ministry in as a pinned copy, built on a machine that can reach them, with Chromium already in place.

On a machine with a route, of the same operating system and processor type as the one without:

```sh
git clone https://github.com/utkjmitch/msw.git && cd msw
git checkout <the commit you have reviewed>
git rev-parse HEAD > PINNED_COMMIT
cd server
npm ci --no-audit --no-fund
PLAYWRIGHT_BROWSERS_PATH=$PWD/../browsers npx playwright install chromium
npm run build
cd ../.. && tar czf msw-pinned.tgz msw
```

`npm ci` installs exactly what `package-lock.json` names, and Playwright's own Chromium (build 1243 for Playwright 1.63.0, in `browsers/chromium-1243` and `browsers/chromium_headless_shell-1243`) lands in `msw/browsers/`. The archive holds the repo, `server/node_modules`, `server/dist` and the browsers.

Move `msw-pinned.tgz` in the way your environment allows, then, on the machine without a route:

```sh
tar xzf msw-pinned.tgz && cd msw/server
export PLAYWRIGHT_BROWSERS_PATH=$PWD/../browsers
node dist/formats/check.js --walker ../examples/walkers/first-timer.yaml   # prints ok
```

Pass `PLAYWRIGHT_BROWSERS_PATH` to the MCP server when you register it (`claude mcp add msw -e PLAYWRIGHT_BROWSERS_PATH=... -- node ...`), because MCP clients don't always pass their environment on. `PINNED_COMMIT` records which version of the Ministry you walked with; put it in each run's report.

If your environment has an internal npm mirror and a Chromium build approved for use, you can instead copy only the repo at the pinned commit, run `npm ci` against the mirror, and point `PLAYWRIGHT_BROWSERS_PATH` at a folder holding `chromium-1243` and `chromium_headless_shell-1243`. Another Chromium build may work, but it isn't what the server was tested with.

## Signing in

The server refuses to act on a password field. For a logged-in journey, a person signs in with a test account once and saves the session (`storage_state`), and the journey uses that. Use test accounts on a test environment, and keep the saved session out of git: it works like a password.

## Writing Walkers who are experts

A Walker tells you whether a person like this can use the page. It doesn't tell you whether the page is correct. A Walker written as an expert can sound sure and be wrong, so:

- Write a role, not a real person. Don't use a real employee's name.
- Label what comes back as simulated feedback. It isn't the view of the person or organization the Walker is modeled on.
- Give the Walker sourced facts in its dossier, and check any claim about your numbers against the source.
- Don't describe your own screens in `prior_knowledge`, or the walk can't show whether they explain themselves.

[`msw-expert-dossier`](../skills/msw-expert-dossier/SKILL.md) does all of this, with a fact sheet of sourced, dated facts beside the Walker, and a "checked / not checked" mark on every claim the Walker makes about your facts.

## What's not finished

This is a draft of plan A. Read the open gaps in [`server/README.md`](../server/README.md) and [the build report](reports/2026-10-11-plan-a-build.md) before you rely on it as a safety boundary. One server process runs one walk at a time.
