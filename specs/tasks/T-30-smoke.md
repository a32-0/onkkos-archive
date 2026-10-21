# T-30 · Check every deployment

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 4. Screens                                                           |
| Serves   | [spec 00](../00-constitution.md); [plan 4](../plan/04-deployment.md) |
| Waits on | [T-22](T-22-connect.md), [T-26](T-26-map.md)                         |

`smoke.yml` as plan part 4 sets it: on each finished deployment, three requests with the demo id prove the function carries `data/` and `fixtures/`. Only `main` deploys, so each deployment is production's, after a phase's merge.

## The owner

- If Deployment Protection is on, which puts a production deployment's own URL behind Vercel's login, creates the bypass for automation and holds its secret in the repository's Actions secrets as `VERCEL_AUTOMATION_BYPASS_SECRET`.
- After the first production deployment, opens the run and confirms it ran for `onkkos-archive` and not for `onkkos-archive-storybook`: Vercel names the environment it reports to GitHub, and the workflow runs only on one that starts with "Production" and does not name the Storybook project.

## What it builds

| File                          | Note                                                                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/smoke.yml` | On a successful production `deployment_status`: the three requests with `curl`, the bypass header only when the secret is set, and `/system` followed through its redirect to prove it stays on the map |

## Acceptance

- [ ] The production deployment of phase 4's merge turns the merge commit green after `/connect`, `/api/profile/000000000000000000000002` and `/system` answer 200.
- [ ] The workflow never reaches DE.
- [ ] `check.yml` passes on `dev`.
