# T-33 · Production reads DE

|          |                                                                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 5. Launch                                                                                                                                |
| Serves   | [spec 11](../11-profile-proxy.md), [spec 00](../00-constitution.md); [plan 4](../plan/04-deployment.md), [plan 6](../plan/06-roadmap.md) |
| Waits on | [T-30](T-30-smoke.md), [T-32](T-32-readme.md)                                                                                            |

The launch: production reads a real account through the locks, once.

## The owner

- Creates the Upstash database in the functions' region and enters its two variables in Vercel for Production only.
- Sets `WF_PROFILE_SOURCE=live` for Production, protects `main`, and sets Upstash's alert at 80 % of the monthly commands.

## Acceptance

- [ ] The owner's own account reads once in production; a second visit in the window costs no lookup (the store holds it).
- [ ] A preview still reads fixtures.
- [ ] No secret is in the tree or the history.
- [ ] `check.yml` passes on `dev`.
