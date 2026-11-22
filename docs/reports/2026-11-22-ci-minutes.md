# CI minutes: one run per PR commit, not two

*Date: 2026-11-22. Branch: `mfx/msw-ci-minutes`, from `main` at `986b18d`. Model: claude-opus-5-5. Ruling: `docs/decisions/2026-11-22-ci-minutes-all-repos.md`.*

## What was asked

1. `on: [push, pull_request]` ran every PR commit twice. Run push CI on `main` only, and PR CI on `pull_request`. `main` requires the `test` check, so `test` must still report on every PR to `main`.
2. Cancel an older PR run when a newer commit arrives, and give every job a `timeout-minutes`.

The factory's reference pattern for this work also skips a push whose tree already passed as a PR. msw squash-merges, so the squash version is used here. That is item 3 below.

## What changed

`.github/workflows/ci.yml`:

1. **Triggers.** `push` runs only on `branches: [main]`. `pull_request` runs for every PR, with no branch or path filter, so `test` reports on every PR to `main` as before.
2. **Concurrency.** The group is the workflow plus the PR number, or the ref for a push. `cancel-in-progress` is true only for `pull_request`, so a newer commit on a PR cancels the older run, and pushes to `main` never cancel each other.
3. **Timeout.** `test` has `timeout-minutes: 30`. The longest November run was 17 min, measured. 13.5 min of that was `npx playwright install --with-deps chromium` (812 s in run 42065679628; the same step usually takes 17 s). Without a timeout, a hung job could run for up to 6 hours.
4. **Push skip on `main`.** A first step, `tested`, runs on push only. It reads the pushed commit's tree, finds the PR whose `merge_commit_sha` is that commit (`commits/<sha>/pulls`), reads the PR head's tree, and counts green `test` check runs on the PR head. It skips only when both trees match and the head has at least one green run. In every other case, including a direct commit, a squash that combined newer `main` work, or any API error, `skip` stays `false` and the full job runs. When the step skips, every later step is skipped, but the job still reports `test` as passed on the `main` commit. The job needs `pull-requests: read` and `checks: read` for this, and the workflow default is `contents: read`.
5. **A test for item 4.** `.github/tests/push-skip.test.sh` takes the step's script out of the workflow and runs it against a fake `gh`. It covers six cases: same tree and passed (skip), tree differs, head never passed, no PR, API error, and unreadable commit (all run). CI runs it after checkout. It takes under a second.

I also ran the step against the live public API for two November `main` pushes. `986b18d` skipped ("Tree fef20576… already passed test as PR head 0a105ad5…", PR #10). `f11d293` ran, because its tree differs from PR #3's head. With a forced API error, `986b18d` ran.

## Minutes, before and after

Source: the Actions API for `utkjmitch/msw`, all 35 runs created 2026-11-01 to 2026-11-22, with every job (`jobs?filter=all`), read unauthenticated from this box on 2026-11-22. Each job is rounded up to whole minutes, the way GitHub bills.

| Runs in November | Runs | Billed min | After this change |
|---|---:|---:|---|
| `pull_request` | 10 | 53 | unchanged: 53 min |
| push to a branch whose commit also had a PR run | 10 | 51 | gone (duplicates) |
| push to a branch with no PR run for that commit | 7 | 37 | gone: the PR runs when it opens |
| push to `main`, tree equals a passed PR head | 5 | 25 | skip: about 5 min (1-minute billing floor) |
| push to `main`, other | 3 | 12 | unchanged: 12 min |
| **Total** | **35** | **178** | **about 70 min** |

- **Saved, November 1-22: 108 of 178 min (61%).** 88 min is measured: those branch push runs would not start under the new triggers. 20 min is an estimate: the 5 skipped `main` runs would each still bill the 1-minute floor.
- **Per month: about 150 min** (estimate: 108 × 30/21.5).
- **Dollars: $0.** msw is public, so its Actions minutes are free (measured: $0.00 net in November on the billing API, from the host's measurements). The change stops wasted runs and frees runner slots. It saves no money.
- **Concurrency cancel: 0 min in November** (measured). No PR had two runs at the same time. It saves time only when commits land on a PR faster than about 4 minutes apart.
- **Timeout: no minutes saved in November** (measured; no job hung). It is a cap on risk.
- The host's sweep counted the duplicates as "10 extra runs, 53 min". I count the same 10 runs at 51 min. The 2-minute gap comes from per-run rounding versus per-job rounding.

The 37 min on branch pushes with no PR is a change in behavior, not a loss of protection. Lanes in this repo commit and push branches. The host opens the PR, and `test` runs when the PR opens. A branch that never gets a PR now gets no CI run.

`npm ci` takes 2-4 s here (step timings, 3 runs), so a `node_modules` cache would save nothing, and none was added. The slow part of a run is the Playwright browser install, which usually takes 17 s but took 322 s and 812 s on two November runs. It is left alone: one cached browser does not cover `--with-deps`, which installs system packages with apt.

## What is unchanged for protection

- **Branch protection on `main`.** `GET repos/utkjmitch/msw/branches/main` (unauthenticated) shows `protected: true` and required status checks `["test"]`, with `enforcement_level: non_admins`. The full `…/branches/main/protection` endpoint needs a token, and this box has none (401). `GET …/rulesets` returns `[]`. Nothing about protection was changed.
- **The required check.** The job is still named `test`. It still runs on every PR with no branch or path filter, and it still fails when typecheck or tests fail. It is still the workflow's only job, so its result is the overall result.
- **Pushes to `main`.** No check is required on push. A skipped push still reports `test` as green, and only when that exact tree has already passed `test` on its PR.

## How to check it after it lands

- This branch's PR runs `test` on `pull_request` once, with no second run for the branch push.
- After the squash-merge, the `main` push run logs "already passed test as PR head …" in the `tested` step and skips the rest. This happens only if no other PR merged first, which would make the trees differ.

## Files read

- The goal, and the partials it names: NO-PROMPTS, DECISIONS-RULE, GOAL-RULES, THOROUGH-SOURCES, DONE-CONTRACT, DECISION-BLOCK (6 of 6, in full).
- `jimmy-words.md` (in full) and `measurements.md` (in full, including the msw rows and "Changes that apply everywhere").
- The reference PR's merge diff: `.github/workflows/ci.yml` and `.github/actions/npm-ci-cached/action.yml` (2 of 2 files, in full).
- Run data: 35 of 35 November runs, and the jobs of all 35. Step timings from 3 runs.

## Decisions for Jimmy

None. Nothing here changes protection, cost or deploys, so nothing needs his ruling.
