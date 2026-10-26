# T-13 · The engine and quest evidence: goals, the frontier, the focus

|          |                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                                                                                                                     |
| Serves   | [spec 03](../../specs/03-two-ways-in.md), [spec 07](../../specs/07-map.md), [spec 08](../../specs/08-goals.md), [spec 10](../../specs/10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-05, BR-28, BR-37, BR-44, BR-54, BR-59 |
| Waits on | [T-12](T-12-profile-reading.md)                                                                                                                                                                                                         |

The rules engine over `grafo.yaml`, the star chart with the new focus (spec 07), and quest evidence. The three deferred goals leave `grafo.yaml`, and "Play the Hex Quest" takes its name. Plan part 1's "What the layers forbid" holds: no import of `content/` or of a loader stays in `domain/`. `resolve` and `suggest` return goal ids, and the cards' titles stay with Goal's content (T-27).

Corrected on 2026-10-13, when the task was built. Each module arrives with something that reads it, as knip requires:

- Varzia's stock is read over the network, so it is infra and arrives with T-19. Nightwave is not read (BR-35). The Circuit's week is computed in `catalog/circuit.ts` (T-16).
- `narrative/chain.ts` is read only by `catalog/checks.ts`, so it arrives with T-16.
- The engine returns values, so nothing here reads `content/engine.ts`. Its words arrive with the first screen that shows one: the junction's, with the map (T-26). The Intrinsics trees' names and the placement's sentences are not needed.
- With the deferred goals gone, no goal takes a parameter from the query, so `resolve.ts` no longer reads `types/next.ts` (T-12's correction is reversed). It arrives with the first screen that reads a query (T-22). The engine still evaluates a check with a placeholder, as `deferred.md` promises.
- The rank title arrives with the shell's content (T-20).
- The focus needs each place's share of mastered items, which T-15 reads. It takes the shares and the systems' order as values, so it is proved here.
- A goal that names a quest is done when quest evidence confirms the quest (spec 08), so `unlock_1999` names The Hex. Whether every Necramech is owned needs the catalog, so the caller passes it in (T-27).
- Sanctuary and Dark Refractory are reached through their `after` (BR-59), as every place off the chart is; `off_chart_places` carries no `reached_by` (corrected 2026-10-13).
- The frontier reads a planet's played nodes as well as its junction tag, so an account older than junctions is not sent back to Venus (corrected 2026-10-13).
- `questAccess()` returns `null` when `Missions[]` cannot be read, so a quest is never out of reach for want of data (BR-59; corrected 2026-10-13).

## What it builds

| File                                                                         | Note                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/grafo.yaml`                                                            | Three goals; the deferred ones out (`deferred.md`); `unlock_1999` reads "Play the Hex Quest" and names The Hex; `off_chart_places` gains Sanctuary (`after: Europa`) and Dark Refractory (`after: Sedna`) |
| `src/domain/graph/schema.ts`                                                 | Without `parameters`, `picker_options` and `trees`; a goal may name its `quest`                                                                                                                           |
| `src/domain/graph/predicates.ts`                                             |                                                                                                                                                                                                           |
| `src/domain/graph/evaluate.ts`                                               | Returns its readings as values; no `content/engine` import                                                                                                                                                |
| `src/domain/graph/resolve.ts`                                                | No `content/` import; the reasons and the junctions' count as values; no `readGoalParams` or `tryResolveGoal`                                                                                             |
| `src/domain/graph/suggest.ts`                                                | Goal ids, without the goals the profile proves done; no plan summary, since no screen reads one                                                                                                           |
| `src/domain/graph/star-chart.ts`                                             | The focus, as spec 07 defines it; the junction as a pair of planets; no `content/` import                                                                                                                 |
| `src/domain/narrative/schema.ts`, `evidence.ts`, `access.ts`                 |                                                                                                                                                                                                           |
| `src/domain/types/plan.ts`                                                   | The reasons as values, no label or notes                                                                                                                                                                  |
| `src/domain/profile/nodes.ts`                                                | Gains `nodesOfType()` and its node type, with `evidence.ts`, their first reader (T-12's correction)                                                                                                       |
| `src/infra/graph/load.ts`, `src/infra/narrative/load.ts`, `evidence-load.ts` | File reads                                                                                                                                                                                                |
| `tests/stubs/server-only.ts`, `vitest.config.ts`                             | The `server-only` stub and its alias, with the first module that imports it                                                                                                                               |
| `package.json`, `pnpm-lock.yaml`                                             | `server-only` and `zod`, pinned                                                                                                                                                                           |
| `fixtures/profile-cy.json`, `profile-ordis.json`                             | Cut again with `pnpm fixture` once `grafo.yaml` is here: the fields of `fields.ts`, and Cy gains `GuildId: true` for the Dojo (BR-59)                                                                     |
| `tests/helpers.ts`                                                           | Gains `testGraph()`, read through the loader, and the veteran (T-11's correction)                                                                                                                         |
| `tests/predicates.test.ts`                                                   |                                                                                                                                                                                                           |
| `tests/evaluate`, `resolve` `.test.ts`                                       | The reasons as values; the deferred goals' checks built in the test                                                                                                                                       |
| `tests/nodes.test.ts`                                                        | From T-12, as it reads the graph; Cy where it read the real capture                                                                                                                                       |
| `tests/star-chart.test.ts`                                                   | Gains the focus's cases and the reach of BR-59                                                                                                                                                            |
| `tests/suggest.test.ts`                                                      | A goal the profile proves done is not suggested                                                                                                                                                           |
| `tests/access`, `evidence` `.test.ts`                                        | Without `placeOnSpine` and the glossary, which stay; Cy where they read the real capture                                                                                                                  |

## Documents

- `docs/engine.md`, `docs/narrative.md`: as plan part 5 sets
- `docs/deferred.md`: the goals a later version adds
- `docs/equipment-unlock-requirements.md`
- `docs/curated-files.md`: gains the `grafo.yaml` section and its invariants, as the file has them, without the deferred goals' `parameters`, `picker_options` and `trees` (T-11 left the section to this task)

## Acceptance

- [x] A player with no frontier gets the focus: the place with the highest share mastered short of all, ties by BR-47 then `star_chart_order`.
- [x] A player with everything mastered has no focus.
- [x] A goal the profile proves done is not suggested.
- [x] `check.yml` passes on `dev`.
