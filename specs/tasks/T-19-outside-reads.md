# T-19 · Outside reads and the request: wiki, Varzia, cookies, the screen read

|          |                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                                                               |
| Serves   | [spec 04](../04-shell.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 2](../plan/02-architecture.md); BR-38, BR-46, BR-48 |
| Waits on | [T-16](T-16-catalog.md), [T-18](T-18-profile-proxy.md)                                                                                                                            |

Everything else that touches the outside: the wiki's prose and icons, Varzia's stock, the cookies, the one read every screen makes (`readScreen()`), and `proxy.ts`, which writes the last place visited. Wiki and worldstate reads stay in Next's data cache (`force-cache` with `revalidate`), and no route exports `force-dynamic`.

## What it builds

| File                                       | Note                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `src/infra/wiki/client.ts`, `icons.ts`     |                                                                                      |
| `src/infra/wiki/prose.ts`                  | BR-48: paragraphs, Mechanics for missions                                            |
| `src/infra/worldstate/client.ts`           | Varzia's stock only; Nightwave is not read (BR-35)                                   |
| `tests/rotations.test.ts`                  | With Varzia's stock                                                                  |
| `src/infra/session.ts`                     | `wf_account`, `wf_since`, `wf_place`; the month from `domain/since.ts`               |
| `src/infra/screen.ts`                      | A failed read redirects to `/connect?reason=…&retry=…` (BR-38); no `content/` import |
| `src/proxy.ts`                             | Writes `wf_place`; skips prefetches                                                  |
| `next.config.ts`                           | `logging.fetches`; `outputFileTracingIncludes` for `data/` and `fixtures/`           |
| `tests/checks.test.ts`, `scenario.test.ts` | They read through the wiki client                                                    |

## Documents

- `docs/api.md`: the other outside sources, beside DE's endpoint: the wiki's prose and icons, and Varzia's stock with its cache; BR-29 cites it for Varzia and says ten minutes where plan part 2 says a minute, so the client and both texts end with one figure

## From T-18

- `readProfile(accountId)` in `infra/profile/read.ts` is the read a request makes: React `cache()`, the visitor from the request. It returns `ProfileResult`; a failure carries a `FailureReason` and, for `limited` and `circuit-open`, `retryAfterSeconds`.
- `FailureReason` is in `domain/types/profile.ts`, so `/connect` can check `?reason=` against it without importing `infra/`.

## From T-16

- The catalog's data is one value, `catalogData()` in `infra/catalog/data.ts`; every catalog function takes it first. The step plan takes `{ now, masteryRank, varzia, done }`: `infra/worldstate/client.ts` returns Varzia's stock in the shape `checks.ts` reads (`location`, `expiry`, `offers` with `uniqueName`, `aya`, `regalAya`).
- `parseRequirements`, `namesItem` and the scenario's inner functions (`layoutOf`, `scenarioOf`, `totalsOf`, `wikiNode`, `hubRequirements`, `companionOf`, `systemOf`) are not exported: no T-16 test read them. Export each one `tests/checks.test.ts` or `scenario.test.ts` reads, with the test.
- A prose ask carries its `source` (mechanics, acquisition or lead, BR-48), so `prose.ts` reads the section it names.

## Acceptance

- [ ] In development, `logging.fetches` shows the wiki and worldstate reads as hits on a second render; the commit message records what it showed.
- [ ] A prefetch of a place does not change `wf_place`.
- [ ] A failed read lands on `/connect` with the reason and the retry time.
- [ ] `check.yml` passes on `dev`.
