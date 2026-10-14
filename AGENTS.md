# AGENTS.md — The Ministry of Silly Walks

## Git and approvals (Jimmy, 2026-10-14)

- Factory lanes: branch, commit, fetch, push your own branch, and open PRs to `main` freely. Never merge, never force-push. The two halves of a pair open no PR; the merge lane does.
- Host sessions: pushing your own feature branch is free. Pushes to `main`/`dev`/the default branch, force pushes and merges need Jimmy's own words with the PR number. No direct commits to `main`; always a PR.
- `mfx/*` is the factory lane branch prefix and is valid here.
- Prod deploys, messages to people, and secret changes need Jimmy's words.
- gcloud: use the shared automation config with `--account` and `--project` on every command (Jimmy's host `credentials.md`); never `gcloud auth login` or `gcloud config set`.

## This repo

- Public Apache-2.0 repo: nothing private goes in it.
- Tests: none yet. The README says the project is at design stage and nothing is runnable. The design is in `docs/superpowers/specs/`, the plans in `docs/superpowers/plans/`. Once plan A's server exists, its tests run with `cd server && npm install && npm test` (see the plan for the build-box Playwright note).
