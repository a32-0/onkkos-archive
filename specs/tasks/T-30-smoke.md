# T-30 · Check every deployment

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 4. Screens                                                           |
| Serves   | [spec 00](../00-constitution.md); [plan 4](../plan/04-deployment.md) |
| Waits on | [T-22](T-22-connect.md), [T-26](T-26-map.md)                         |

`smoke.yml` as plan part 4 sets it: on each finished deployment, three requests with the demo id prove the function carries `data/` and `fixtures/`.

## The owner

- If T-03 found previews behind a login wall, sets Vercel's bypass for automation where Hobby offers it.

## What crosses

| File                          | Origin | Note |
| ----------------------------- | ------ | ---- |
| `.github/workflows/smoke.yml` | New    |      |

## Acceptance

- [ ] A preview deployment turns the commit green after `/connect`, `/api/profile/000000000000000000000002` and `/system` answer 200.
- [ ] The workflow never reaches DE.
- [ ] `check.yml` passes on `dev`.
