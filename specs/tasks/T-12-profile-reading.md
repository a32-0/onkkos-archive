# T-12 · Reading a profile: id, payload, nodes, the month, the trim

|          |                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                             |
| Serves   | [spec 02](../02-connect.md), [spec 11](../11-profile-proxy.md); [plan 1](../plan/01-repository.md), [plan 2](../plan/02-architecture.md); BR-38 |
| Waits on | [T-11](T-11-data-and-fixtures.md)                                                                                                               |

The base of the domain, which imports nothing else of it: the account-id check, the payload's parse, the node readings, the month a player last played, and the trim to the eight fields plan part 2 lists. `GuildId` was added on 2026-10-08 for the Dojo's reach (BR-59), and the trim keeps it as `true`.

Corrected on 2026-10-13 by T-11: `tests/helpers.ts` arrives here, with its first tests. `nodes.test.ts` reads the graph through `testGraph()`, whose schema arrives in T-13, so it arrives there.

Corrected on 2026-10-13, when the task was built. Each module arrives with something that reads it, as knip requires:

- `types/plan.ts` is first read by `graph/resolve.ts`, so it arrives with T-13; `types/next.ts` arrives with the first screen that reads a query (T-22, T-13's correction). So does `nodesOfType()`, first read by quest evidence.
- `display.ts` cannot import `server-only` from the domain, and it reads only the name and the Mastery Rank. Plan part 2 leaves out the clan's name and the platform names, as no frame draws them. WFCD's profile parser is not used: it throws on a profile without `AccountId` or `ChallengeProgress`, so on a trimmed profile it would always fall back, and the fallback reads the same two fields.
- The cookie's read and write are input and output, which plan part 1 puts in `infra/`, so `since.ts` holds no cookie: the server reads `wf_since` in `infra/session.ts` (T-19), and a server action writes it from Resume (T-24).
- The trim keeps `XPInfo` alone inside `LoadOutInventory`, as `trim-profile.mjs` already did. Nothing the app reads needs the rest.
- `trim-profile.mjs` reads `grafo.yaml` before it cuts, so the fixtures are cut again in T-13.

## What it builds

| File                                      | Note                                                                                                                                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/profile/account-id.ts`        |                                                                                                                                                                                                                      |
| `src/domain/profile/payload.ts`           |                                                                                                                                                                                                                      |
| `src/domain/profile/display.ts`           | No `server-only` and no profile parser; the name and the Mastery Rank, read directly                                                                                                                                 |
| `src/domain/profile/nodes.ts`             | Without `nodesOfType()`, which arrives with quest evidence (T-13)                                                                                                                                                    |
| `src/domain/profile/fields.ts`, `trim.ts` | The eight fields of plan part 2, confirmed against every reading, and `XPInfo` alone in `LoadOutInventory`                                                                                                           |
| `src/domain/since.ts`                     | `isYearMonth`, `toYearMonth` and `describeMonth`; no cookie                                                                                                                                                          |
| `src/domain/types/profile.ts`             | Gains `GuildId`; the types read only inside the file are not exported                                                                                                                                                |
| `scripts/trim-profile.mjs`                | Imports `fields.ts`, so the fixtures keep the same fields as the store, and fails on a field it does not build; no `--intrinsics` and no `--id`, so `AccountId` and `PlatformNames` are removed rather than replaced |
| `tests/helpers.ts`                        | `fixture()` and the names of Cy and the new player, from T-11; no real capture                                                                                                                                       |
| `tests/payload.test.ts`                   | Reads Cy where it read the real capture, without the fields the trim leaves out                                                                                                                                      |
| `tests/account-id.test.ts`                | A malformed id is refused (spec 11, acceptance 1)                                                                                                                                                                    |
| `tests/since.test.ts`                     | The month's cases                                                                                                                                                                                                    |
| `tests/trim.test.ts`                      | A trimmed fixture reads the same as the whole one, for every reading, on Cy, the new player and a synthetic profile with every field                                                                                 |

## Acceptance

- [ ] Every reading gives the same result on a trimmed profile as on the whole one; the test grows as later tasks add readings.
- [ ] The trimmed Cy fixture, gzipped and base64-encoded, is near the 15 KB plan part 2 measured, and the test states the bound.
- [ ] `check.yml` passes on `dev`.
