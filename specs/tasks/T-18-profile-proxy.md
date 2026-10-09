# T-18 · The profile proxy: the read order and every lock

|          |                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                         |
| Serves   | [spec 11](../11-profile-proxy.md), [spec 02](../02-connect.md); [plan 2](../plan/02-architecture.md); BR-38 |
| Waits on | [T-13](T-13-engine.md), [T-17](T-17-store.md)                                                               |

Spec 11 whole: shape, demo, stored, circuit, lock, budget, read, classify, keep, in that order, every lock shared through the store. The demos are the two fixtures. A failed read returns its BR-38 reason, never a sentence: `client.ts` no longer imports `content/failures`.

## What crosses

| File                                                    | Origin   | Note                                                                                      |
| ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `src/infra/profile/visitor.ts`                          | Moves    | From `src/lib/warframe/`                                                                  |
| `src/infra/profile/client.ts`                           | Reworked | Returns the reason; no `content/` import                                                  |
| `src/infra/profile/cache.ts`, `budget.ts`, `circuit.ts` | Reworked | On the store; the fixed window; the lock of plan part 2                                   |
| `src/infra/profile/fixture-source.ts`                   | Reworked | Two demos only                                                                            |
| `src/infra/profile/read.ts`                             | New      | The read order, with React `cache()` per request                                          |
| `src/app/api/profile/[accountId]/route.ts`              | Moves    |                                                                                           |
| `tests/client.test.ts`, `resilience.test.ts`            | Reworked | Against the memory store; the real account id they use today is replaced by a made-up one |
| `tests/demo-fixtures.test.ts`                           | Reworked | Two demos                                                                                 |

## Documents that cross

- `docs/api.md`: Moves

## Acceptance

- [ ] Every acceptance item of spec 11 holds against the memory store.
- [ ] No test reaches DE; with `WF_PROFILE_SOURCE=fixture` no code path can.
- [ ] `check.yml` passes on `dev`.
