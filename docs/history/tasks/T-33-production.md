# T-33 · Production reads DE

|          |                                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 5. Launch                                                                                                                                                  |
| Serves   | [spec 11](../../specs/11-profile-proxy.md), [spec 00](../../specs/00-constitution.md); [plan 4](../plan/04-deployment.md), [plan 6](../plan/06-roadmap.md) |
| Waits on | [T-30](T-30-smoke.md), [T-32](T-32-readme.md)                                                                                                              |

The launch was to have production read a real account through the locks.
DE's CDN refused it, and this task now records why and closes with production
as the demo; reading a real account moved to phase 6 (spec 13).

## The owner

- Created the Upstash database and its two variables in Vercel for Production, and set `WF_PROFILE_SOURCE=live` (2026-10-21).
- Protects `main` so a pull request merges only when `check.yml` passes.
- Set `WF_PROFILE_SOURCE=fixture` again for Production after the three reads below (2026-10-21).

## What happened

On 2026-10-21 the owner set the three variables and redeployed. The first
read of the owner's account answered `throttled`: DE refused production's
very first request, so Upstash and the locks worked (one lookup spent, one
refusal counted) and the cause is the address or the request, not the app's
volume. Nothing recorded DE's status, so the client now logs every refusal
(spec 11, `api.md`). Nothing that hides the app from DE's refusal is on the
table.

Three single reads, each of the owner's own account, settled the cause:

| Read                                             | Answer                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Production, `/api/profile/{id}`, with the log    | `403` from `AkamaiGHost`, empty body, no `retry-after`: DE's edge refuses Vercel's address |
| The owner's browser, `fetch` from the app's page | DE answered, without `Access-Control-Allow-Origin`: a page cannot read the profile         |
| The owner's machine, `pnpm dev` with `live`      | The profile, through the memory store                                                      |

So a server on Vercel cannot read DE, a web page cannot either, and the
player's own machine can. Production went back to `WF_PROFILE_SOURCE=fixture`
the same day and serves the two demos. The owner chose on 2026-10-22 to read
a player's account from an app on their own machine, with the website kept as
the demo
([`public-release.md`](../public-release.md#why-the-app-moved-to-the-players-machine)).
That read, once and then from the store across a restart, is spec 13's
acceptance, built in phase 6 (T-35 to T-42).

## Acceptance

- [x] Production's read of a real account was tried once, through every lock, and its refusal is recorded with DE's status and who sent it, never the id.
- [x] Production serves the two demos and calls DE no more.
- [x] `pnpm dev` with no `WF_PROFILE_SOURCE` set still reads fixtures (`tests/resilience.test.ts`).
- [x] No secret is in the tree or the history: no Upstash address or token, no bypass secret (searched on 2026-10-21).
- [x] `check.yml` passes on `dev`.
