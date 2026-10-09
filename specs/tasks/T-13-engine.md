# T-13 · The engine and quest evidence: goals, the frontier, the focus

|          |                                                                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                                                                          |
| Serves   | [spec 03](../03-two-ways-in.md), [spec 07](../07-map.md), [spec 08](../08-goals.md), [spec 10](../10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-05, BR-28, BR-37, BR-44, BR-54 |
| Waits on | [T-12](T-12-profile-reading.md)                                                                                                                                                              |

The rules engine over `grafo.yaml`, the star chart with the new focus (spec 07), and quest evidence. The three deferred goals leave `grafo.yaml`, and "Play the Hex Quest" takes its name. The move follows plan part 1's "What a move changes": no import of `content/` or of a loader stays in `domain/`. `resolve` and `suggest` return goal ids, and the cards' titles stay with Goal's content (T-27).

## What crosses

| File                                                                         | Origin          | Note                                                                         |
| ---------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `data/grafo.yaml`                                                            | Reworked        | Three goals; the deferred ones out (`deferred.md`)                           |
| `src/domain/graph/schema.ts`, `predicates.ts`                                | Moves           |                                                                              |
| `src/domain/graph/evaluate.ts`                                               | Reworked        | Returns its readings as values; no `content/engine` import                   |
| `src/domain/graph/resolve.ts`, `suggest.ts`                                  | Reworked        | No `content/` import                                                         |
| `src/domain/graph/star-chart.ts`                                             | Reworked        | The focus, as spec 07 defines it; no `content/` import                       |
| `src/domain/narrative/schema.ts`, `evidence.ts`, `access.ts`                 | Moves           |                                                                              |
| `src/domain/narrative/chain.ts`                                              | Reworked        | Takes the spine as an argument                                               |
| `src/domain/rotations.ts`                                                    | Moves           | From `src/lib/worldstate/rotations.ts`                                       |
| `src/infra/graph/load.ts`, `src/infra/narrative/load.ts`, `evidence-load.ts` | Moves           | File reads                                                                   |
| `tests/stubs/server-only.ts`, `vitest.config.ts`                             | Moves, Reworked | The `server-only` stub and its alias, with the first module that imports it  |
| `src/content/engine.ts`                                                      | Moves           | Read by the screens, no longer by the engine                                 |
| `tests/evaluate`, `predicates`, `resolve`, `rotations` `.test.ts`            | Moves           |                                                                              |
| `tests/star-chart.test.ts`                                                   | Reworked        | Gains the focus's cases                                                      |
| `tests/access`, `evidence`, `content` `.test.ts`                             | Reworked        | Without `placeOnSpine` and the glossary, which stay, and without goal titles |

## Documents that cross

- `docs/engine.md`, `docs/narrative.md`: Reworked as plan part 5 sets
- `docs/deferred.md`, `docs/equipment-unlock-requirements.md`: Move

## Acceptance

- [ ] A player with no frontier gets the focus: the place with the highest share mastered short of all, ties by BR-47 then `star_chart_order`.
- [ ] A player with everything mastered has no focus.
- [ ] A goal the profile proves done is not suggested.
- [ ] `check.yml` passes on `dev`.
