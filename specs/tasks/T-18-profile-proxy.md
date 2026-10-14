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

## Acceptance

- [ ] Every acceptance item of spec 11 holds against the memory store.
- [ ] No test reaches DE; with `WF_PROFILE_SOURCE=fixture` no code path can.
- [ ] `check.yml` passes on `dev`.
