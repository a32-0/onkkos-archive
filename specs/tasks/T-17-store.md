# T-17 · The shared store: one interface, Upstash and memory

|          |                                                                         |
| -------- | ----------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                     |
| Serves   | [spec 11](../11-profile-proxy.md); [plan 2](../plan/02-architecture.md) |
| Waits on | [T-01](T-01-scaffold.md)                                                |

The store of plan part 2: `getMany`, `set`, `setIfAbsent`, `increment`, `remove`, behind one interface, with the Upstash backend for production and a memory backend on `globalThis` for tests and development.

## What crosses

| File                         | Origin | Note                                            |
| ---------------------------- | ------ | ----------------------------------------------- |
| `src/infra/store/store.ts`   | New    | The interface and the keys table of plan part 2 |
| `src/infra/store/upstash.ts` | New    | `@upstash/redis`, from its two variables        |
| `src/infra/store/memory.ts`  | New    | On `globalThis`, with `flush()` for tests       |
| `tests/store.test.ts`        | New    | The contract, run against the memory backend    |

## Documents that cross

- `docs/development.md`: The two backends and when each is used

## Acceptance

- [ ] A key expires after its time in the memory backend as in Upstash.
- [ ] The memory store survives a hot reload in `pnpm dev`.
- [ ] No Upstash variable is read outside `upstash.ts`, and none is needed to run the tests.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-17 · The shared store: one interface, Upstash and memory` · Milestone: `3. Domain and infra`

```markdown
The store of plan part 2: `getMany`, `set`, `setIfAbsent`, `increment`, `remove`, behind one interface, with the Upstash backend for production and a memory backend on `globalThis` for tests and development.

- **Serves:** `specs/11-profile-proxy.md`, `specs/plan/02-architecture.md`
- **Waits on:** T-01
- **Task:** `specs/tasks/T-17-store.md`

### Acceptance

- [ ] A key expires after its time in the memory backend as in Upstash.
- [ ] The memory store survives a hot reload in `pnpm dev`.
- [ ] No Upstash variable is read outside `upstash.ts`, and none is needed to run the tests.
- [ ] `check.yml` passes on the pull request.
```
