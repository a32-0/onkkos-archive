# T-17 · The shared store: one interface, Upstash and memory

|          |                                                                         |
| -------- | ----------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                     |
| Serves   | [spec 11](../11-profile-proxy.md); [plan 2](../plan/02-architecture.md) |
| Waits on | [T-01](T-01-scaffold.md)                                                |

The store of plan part 2: `getMany`, `set`, `setIfAbsent`, `increment`, `remove`, behind one interface, with the Upstash backend for production and a memory backend on `globalThis` for tests and development.

## What it builds

| File                         | Note                                            |
| ---------------------------- | ----------------------------------------------- |
| `src/infra/store/store.ts`   | The interface and the keys table of plan part 2 |
| `src/infra/store/upstash.ts` | `@upstash/redis`, from its two variables        |
| `src/infra/store/memory.ts`  | On `globalThis`, with `flush()` for tests       |
| `src/infra/store/index.ts`   | Picks the backend; fails closed in production   |
| `tests/store.test.ts`        | The contract, run against the memory backend    |

## Documents

- `docs/development.md`: The two backends and when each is used

## Corrections

- `src/infra/store/index.ts` joined the table: plan part 2 names it as the file that picks the backend.
- `@upstash/redis` 1.39.0 is installed here, pinned, as the first task that imports it; plan part 1 had listed it with T-01.
- `upstash.ts` reads its two variables by name rather than through `Redis.fromEnv()`, which would also accept Vercel's `KV_*` names, and turns off the client's automatic JSON parsing, so a value comes back as the string that was stored, as it does from memory.
- `store()` refuses the memory backend in production reading live: a missing store is a configuration error and fails closed.
- `storeKeys` names the keys only; their lifetimes belong to the locks, in T-18.
- The commit also carried corrections to T-01, T-13 and T-16 found while it was built; each is recorded in its own task.

## Acceptance

- [ ] A key expires after its time in the memory backend as in Upstash.
- [ ] The memory store survives a hot reload in `pnpm dev`.
- [ ] No Upstash variable is read outside `upstash.ts`, and none is needed to run the tests.
- [ ] `check.yml` passes on `dev`.
