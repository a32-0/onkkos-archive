# T-15 · Places and systems: the place index, item state, the Dojo

|          |                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                     |
| Serves   | [spec 07](../../specs/07-map.md); [plan 1](../plan/01-repository.md); BR-45, BR-47, BR-56, BR-57, BR-59 |
| Waits on | [T-13](T-13-engine.md), [T-14](T-14-items.md)                                                           |

The map's data: every place in BR-47's order, the Dojo in the Origin System (BR-57), what each place holds and each tile's reading at that place, and an item's state for a player. Plan part 1's "What the layers forbid" holds: no import of `content/` or of a loader stays in `domain/`. `tile.ts` returns the reading as values, and the map's content words it (T-26).

## What it builds

| File                                                  | Note                                                                                                                                                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/systems.yaml`                                   | BR-47's order, the Dojo, the Origin System's places in `star_chart_order`; `aliases` for the two places the sources spell otherwise. "Soon™" is the map's word (T-26); the data says `released: false`           |
| `src/domain/place/resolve.ts`                         |                                                                                                                                                                                                                  |
| `src/domain/place/catalog.ts`                         | Builds from the raw items it is given, the read of `@wfcd/items` moved to infra, as in T-14; each item filed under the map's catalogue groups (spec 07), gathered into the Summary's by `summaryGroupOf` (BR-16) |
| `src/domain/place/build.ts`, `proxima.ts`, `state.ts` | Take their data as an argument; `build.ts` fills the Dojo from the research table                                                                                                                                |
| `src/domain/place/schema.ts`, `tile.ts`               | BR-47, BR-56, BR-57, the research table and the aliases; `tile.ts` returns values, with no `content/` or `components/` import                                                                                    |
| `src/domain/graph/star-chart.ts`                      | The focus leaves out a place on no chart, so the Dojo never carries Start here (BR-57)                                                                                                                           |
| `src/infra/place/load.ts`                             | The file reads, the read of `@wfcd/items` and the research table; the index built once                                                                                                                           |
| `tests/place.test.ts`, `place-state.test.ts`          | Plus the Dojo, BR-47's order, the aliases and the state of related items                                                                                                                                         |
| `src/domain/place/reach.ts`                           | BR-59: a place's reach and an item's, and the gap of each. It takes an item's place and `masteryReq` as values and imports nothing from the catalog, which T-16 brings; the screens pass them in                 |
| `tests/reach.test.ts`                                 | Beside it                                                                                                                                                                                                        |

## Documents

- `docs/place-index.md`: the sources, the systems and their names, the Dojo, measured again
- `docs/system.md`: the states of an item, a place, a quest and a step; "Two lenses" holds the focus and reach (BR-59), and Mastery Rank is both an ordering of goals and a measure of reach

## Corrections

- `@wfcd/items` reads its JSON from disk, so the place catalog's read lives in `infra/place/load.ts` (plan part 1, "No file reads in the domain"), and `state.ts` takes the catalog as an argument.
- There is no table of system art: the place art comes from the wiki with the map (T-26).
- The Dojo had no source. It is filled from the wiki's research table, already vendored by T-11: 144 of its 188 names resolve to an item the index holds; the 44 that do not (gear, segments, decorations) are pinned by a test.
- `systems.yaml` named Dark Refractory as the drop tables do, `Dark Refractory, Deimos`, and `grafo.yaml` names it `Dark Refractory`, so reach could not measure it. The place takes `grafo.yaml`'s name, and `aliases` reads the sources' spelling under it, with the wiki's `Zariman Ten Zero`: Zariman gains its region resources, which it never had.
- The focus came with T-13, and nothing kept it off the Dojo, which BR-57 forbids.
- The owner settled on 2026-10-13 that the index's groups follow the frames: one group per catalogue as spec 07 draws them, gathered into BR-16's for the Summary, and nothing a frame draws no group for.
- `Dossier` is exported from `catalog/dossier.ts`, since `place/state.ts` and `catalog/checks.ts` take it as a type.

## Acceptance

- [x] The systems come in BR-47's order and Tau cannot be opened.
- [x] The Dojo holds everything researched.
- [x] Each item state is one of `done | ranked | absent | unknown`.
- [x] Reach follows BR-59: a place up to the frontier, or off the chart after a place in reach, or with no `after`; an item whose `masteryReq` the player meets and whose place is in reach; everything when `Missions[]` or `PlayerLevel` cannot be read. Each gap reads as BR-59 words it, as values the screens word.
- [x] `check.yml` passes on `dev`.
