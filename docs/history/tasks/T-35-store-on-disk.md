# T-35 · The store on disk, and Upstash removed

|          |                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                                                       |
| Serves   | [spec 11](../../specs/11-profile-proxy.md), [spec 13](../../specs/13-desktop.md); [plan 2](../plan/02-architecture.md#the-store) |
| Waits on | [T-33](T-33-production.md)                                                                                                       |

The locks of spec 11 kept on the player's disk, so a restart never reads DE
again inside the window, and the shared backend no target uses any more taken
out, as the cut rule asks.

## The owner

- Deletes the Upstash database and the two `UPSTASH_REDIS_REST_*` variables in Vercel.

## What it builds

| File                                    | Note                                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/infra/store/file.ts`               | The memory backend's map, loaded from `WF_STORE_FILE` once, written whole after each change by rename   |
| `src/infra/store/memory.ts`             | Its map and expiry shared with the file backend, so both expire alike                                   |
| `src/infra/store/index.ts`              | The file when `WF_STORE_FILE` is set, memory otherwise; live in a production build with no file throws  |
| `src/infra/store/upstash.ts`            | Removed, with `@upstash/redis`                                                                          |
| `.env.example`                          | `WF_PROFILE_SOURCE=fixture` alone                                                                       |
| `tests/store.test.ts`                   | The file backend: expiry across a reload, an increment's window kept, a torn write leaves the last file |
| `tests/client.test.ts`, `resilience.ts` | The read order and every lock, run once more against the file backend                                   |

## Documents

`development.md`'s store section and variables; `api.md`'s locks, which no
longer say "shared".

## Acceptance

- [x] Spec 11's acceptance 2, 3, 4 and 9 hold against the file backend, a restart between reads included.
- [x] No file names Upstash but the history: `git grep -i upstash` finds only the record of its removal: `docs/public-release.md`, the plan's notes that it was removed, and the tasks up to this one.
- [x] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm weight` pass; the demo's build is unchanged.
- [x] `check.yml` passes on `dev`.
