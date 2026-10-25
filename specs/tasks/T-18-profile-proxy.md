# T-18 · The profile proxy: the read order and every lock

|          |                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                         |
| Serves   | [spec 11](../11-profile-proxy.md), [spec 02](../02-connect.md); [plan 2](../plan/02-architecture.md); BR-38 |
| Waits on | [T-13](T-13-engine.md), [T-17](T-17-store.md)                                                               |

Spec 11 whole: shape, demo, stored, circuit, lock, budget, read, classify, keep, in that order, every lock shared through the store. The demos are the two fixtures. A failed read returns its BR-38 reason, never a sentence: `client.ts` no longer imports `content/failures`.

## What it builds

| File                                                    | Note                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/domain/types/profile.ts`                           | `FailureReason`, the seven reasons of BR-38                      |
| `src/infra/profile/visitor.ts`                          |                                                                  |
| `src/infra/profile/client.ts`                           | Returns the reason; no `content/` import                         |
| `src/infra/profile/cache.ts`, `budget.ts`, `circuit.ts` | On the store; the fixed window; the lock of plan part 2          |
| `src/infra/profile/fixture-source.ts`                   | Two demos only                                                   |
| `src/infra/profile/read.ts`                             | The read order, with React `cache()` per request                 |
| `src/app/api/profile/[accountId]/route.ts`              |                                                                  |
| `tests/client.test.ts`, `resilience.test.ts`            | Against the memory store; a made-up account id, never a real one |
| `tests/demo-fixtures.test.ts`                           | Two demos; their keys checked against `PROFILE_FIELDS` (T-12)    |

## Documents

- `docs/api.md`: the endpoint's verified behaviour
- `docs/equipment-unlock-requirements.md`: its two citations of `api.md`, which no longer records the loading of `Relics.json`
- `docs/business-rules.md`: BR-38 names `FailureReason` in `domain/types/profile.ts`
- Spec 02 and plan parts 2, 4 and 5: `fetchProfile` in `read.ts`, the circuit's value, the one `MGET`, seven commands per new read

## From T-17

- `store()` from `@/infra/store` returns the backend. In a production build reading live with no Upstash variable it throws: `read.ts` turns that into a BR-38 reason, never a 500.
- `storeKeys` in `infra/store/store.ts` names every key; the lifetimes are this task's, from the keys table of plan part 2.
- `flush()` from `infra/store/memory.ts` replaces `resetBudget`, `resetCircuit` and `clearMemoryCache` in the tests.

## Corrections

- `FailureReason` lives in `domain/types/profile.ts`, not in `client.ts`, so `/connect` can read it without importing `infra/`; BR-38 says so.
- `fetchProfile` lives in `read.ts`, which holds the read order, and `client.ts` is the request to DE and its classification; spec 02 and plan part 2 say so.
- Only `WF_PROFILE_SOURCE=live` reads DE: unset, `fixture` or anything else reads a fixture. `WF_FIXTURE` and the third demo are gone, and any other id in fixture mode reads Cy's.
- The circuit key holds the time it closes, since the store reads no key's remaining time; plan part 2's keys table says so.
- One `MGET` reads five keys: the profile, the not-found, the read lock and the circuit's two. A new read costs seven commands; plan part 4 said four to six.
- The circuit is reset only when that `MGET` saw a refusal, which saves a command per read. A success landing during another instance's refusals then leaves the count, so the circuit errs towards opening.
- The in-process map of reads in flight is keyed by id and visitor, so one visitor's `limited` never answers another.
- A request to DE that times out or cannot connect counts as a refusal, as spec 11 asks.
- The read lock is released without checking it is still this instance's: it lives twenty seconds and the request fifteen at most.
- The route drops `runtime` and `force-dynamic` (Node is the default, and plan part 2 forbids the export) and answers with the reason, never a sentence.
- `api.md` covers DE's endpoint only; the other outside sources are written by T-19, which settles Varzia's cache.

## Acceptance

- [x] Every acceptance item of spec 11 holds against the memory store.
- [x] No test reaches DE; with `WF_PROFILE_SOURCE=fixture` no code path can.
- [x] `check.yml` passes on `dev`.
