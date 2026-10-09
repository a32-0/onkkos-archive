# T-15 · Places and systems: the place index, item state, the Dojo

|          |                                                                                         |
| -------- | --------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                     |
| Serves   | [spec 07](../07-map.md); [plan 1](../plan/01-repository.md); BR-45, BR-47, BR-56, BR-57 |
| Waits on | [T-13](T-13-engine.md), [T-14](T-14-items.md)                                           |

The map's data: every place in BR-47's order, the Dojo in the Origin System (BR-57), what each place holds and each tile's reading at that place, and an item's state for a player. The move follows plan part 1's "What a move changes": no import of `content/` or of a loader stays in `domain/`. `tile.ts` returns the reading as values, and the map's content words it (T-26).

## What crosses

| File                                                    | Origin   | Note                                                       |
| ------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `data/systems.yaml`                                     | Reworked | BR-47's order, the Dojo, "Soon™" for Tau                   |
| `src/domain/place/catalog.ts`, `resolve.ts`, `state.ts` | Moves    | From `src/lib/place/`                                      |
| `src/domain/place/build.ts`, `proxima.ts`               | Reworked | Take their data as an argument                             |
| `src/domain/place/schema.ts`, `tile.ts`                 | Reworked | BR-47, BR-56, BR-57; no `content/` or `components/` import |
| `src/infra/place/load.ts`, `art.ts`                     | Moves    | File reads and art                                         |
| `tests/place.test.ts`, `place-state.test.ts`            | Move     | Plus the Dojo and BR-47's order                            |

## Documents that cross

- `docs/place-index.md`: Moves
- `docs/system.md`: Moves: the states of an item, a place, a quest and a step

## Acceptance

- [ ] The systems come in BR-47's order and Tau cannot be opened.
- [ ] The Dojo holds everything researched.
- [ ] Each item state is one of `done | ranked | absent | unknown`.
- [ ] `check.yml` passes on `dev`.
