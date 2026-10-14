# T-12 · Reading a profile: id, payload, nodes, the month, the trim

|          |                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                             |
| Serves   | [spec 02](../02-connect.md), [spec 11](../11-profile-proxy.md); [plan 1](../plan/01-repository.md), [plan 2](../plan/02-architecture.md); BR-38 |
| Waits on | [T-11](T-11-data-and-fixtures.md)                                                                                                               |

The base of the domain, which imports nothing else of it: the account-id check, the payload's parse, the node readings, the month a player last played, and the trim to the eight fields plan part 2 lists. `GuildId` was added on 2026-10-08 for the Dojo's reach (BR-59), and the trim keeps it as `true`.

Corrected on 2026-10-13 by T-11: `tests/helpers.ts` crosses here, with its first tests. `nodes.test.ts` reads the graph through `testGraph()`, whose schema arrives in T-13, so it crosses there.

## What crosses

| File                                                           | Origin   | Note                                                                                                                           |
| -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/domain/profile/account-id.ts`, `payload.ts`, `display.ts` | Moves    | From `src/lib/warframe/`                                                                                                       |
| `src/domain/profile/nodes.ts`                                  | Moves    | From `src/lib/profile/`                                                                                                        |
| `src/domain/profile/fields.ts`, `trim.ts`                      | New      | The eight fields of plan part 2, confirmed against every reading that travels                                                  |
| `src/domain/since.ts`                                          | Reworked | From `src/lib/manual/since.ts`, with `isYearMonth` and the month parsing taken out of `lib/narrative/catch-up.ts`, which stays |
| `src/domain/types/*`                                           | Moves    | From `src/types/`                                                                                                              |
| `scripts/trim-profile.mjs`                                     | Reworked | Imports `fields.ts`, so the fixtures keep the same fields as the store                                                         |
| `tests/helpers.ts`                                             | Reworked | `fixture()` and the profile names, from T-11; without `FULL_PROFILE`, as the real capture does not travel                      |
| `tests/payload.test.ts`                                        | Reworked | Reads Cy where it read the real capture                                                                                        |
| `tests/trim.test.ts`                                           | New      | A trimmed fixture reads the same as the whole one, for every reading                                                           |

## Acceptance

- [ ] Every reading that travels gives the same result on a trimmed profile as on the whole one; the test grows as later tasks add readings.
- [ ] The trimmed Cy fixture, gzipped and base64-encoded, is near the 15 KB plan part 2 measured, and the test states the bound.
- [ ] `check.yml` passes on `dev`.
