# T-03 · Deploy the app on Vercel

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 1. Scaffold                                                          |
| Serves   | [spec 00](../00-constitution.md); [plan 4](../plan/04-deployment.md) |
| Waits on | [T-02](T-02-ci.md)                                                   |

The first preview. While it is set up, the two limits plan part 4 leaves open are read from Vercel's own documentation and written down.

## The owner

- Creates the Vercel account and the `onkkos-archive` project, connected to the repository.
- Sets `WF_PROFILE_SOURCE=fixture` for Preview and Development. Production gets `live` only in T-33.

## Documents

- `specs/plan/04-deployment.md`: "Checked when the deployment is set up" answered: Hobby's longest function run, and whether previews sit behind Deployment Protection
- `specs/plan/02-architecture.md`: The lock wait and DE's timeout shrunk to fit, if Hobby's limit is shorter than their sum

## Corrections

- The project is named `onkkos-archive`, and `.vercel`, the local link Vercel's CLI writes, is ignored by git (2026-10-08).
- The owner chose on 2026-10-08 that Vercel deploys `main` alone: `vercel.json` turns deployments off for every other branch, so a push to `dev` or a pull request builds no preview. The acceptance item on a branch's preview held before that day. Plan parts 4 and 6, the tasks README, the screen tasks, T-30 and T-33 follow the choice (2026-10-14).

## Acceptance

- [x] A push to a branch builds a preview that serves the blank root.
- [x] Both limits are recorded with the link to the page of Vercel's documentation that states them.
- [x] No project id, token or URL is committed.
- [x] `check.yml` passes on `dev`.
