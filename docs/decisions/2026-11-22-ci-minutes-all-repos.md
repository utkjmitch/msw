# Cut CI minutes in every repo, this one included

- **Date:** 2026-11-22
- **Source:** PC chat (the factory's MFX thread)
- **Brought by:** factory goal `msw-mfx-msw-ci-minutes` (branch `mfx/msw-ci-minutes`)

## Jimmy's words

> "yes, but i want you to do them all for ALL repos / deploys, all projects."

He said it after the host proposed CI-minute savings across his repos and offered a lane for each. Only the words above are quoted here: the rest of that chat is about private repos and billing, and this repo is public.

## Covers

For msw: change `.github/workflows/ci.yml` so a PR commit runs CI once, not twice; push CI runs only on `main`; a newer PR commit cancels the older PR run; every job has a `timeout-minutes`; and a push to `main` whose tree already passed `test` as its PR head skips the rerun. The `test` check that `main` requires keeps its name and still reports on every PR.

## Doesn't cover

- No change to branch protection or rulesets. `main` still requires `test`.
- Nothing about deploys: msw has none.
- Other repos: their CI work is recorded in those repos and in the factory, not here.

## Changes

None.
