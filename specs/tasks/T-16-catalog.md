# T-16 · The catalog: sources, relics, releases, updates, search

|          |                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                                                                                                                                                |
| Serves   | [spec 05](../05-resume.md), [spec 06](../06-catch-up-summary.md), [spec 08](../08-goals.md), [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-12, BR-35, BR-43, BR-48, BR-49, BR-50, BR-53, BR-55, BR-56 |
| Waits on | [T-15](T-15-places.md)                                                                                                                                                                                                                                             |

Everything else the app knows about where things come from. `releases.ts` loses the quests (BR-35), `updates.ts` takes BR-43's date, `summary.ts` the Summary's densities and readings, `checks.ts` the wiki's paragraphs, and `search.ts` gains places. Plan part 1's "What the layers forbid" holds: no import of `content/` or of a loader stays in `domain/`. The wiki's vendored modules are read in `infra/` and handed in.

## What it builds

| File                                                                                                       | Note                                                                                               |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/domain/catalog/acquisition.ts`, `places.ts`                                                           |                                                                                                    |
| `src/domain/catalog/wiki.ts`                                                                               | The wiki modules' shapes, `NameMap`; read in `infra/wiki/modules.ts` and handed in                 |
| `src/domain/catalog/data.ts`, `src/infra/catalog/data.ts`                                                  | The catalog's data as one value, read once in infra: modules, `sources.yaml`, tables, spine, items |
| `src/domain/place/schema.ts`, `build.ts`                                                                   | `normalizeResearch` carries the whole entry (lab, prerequisite, credits, resources)                |
| `src/domain/catalog/circuit.ts`, `collectibles.ts`, `relics.ts`, `rewards.ts`, `scenario.ts`, `sources.ts` | Their data as arguments: the wiki's modules, the place index and the spine; no `content/` import   |
| `src/domain/catalog/summary.ts`, `checks.ts`, `search.ts`, `updates.ts`, `releases.ts`                     | BR-55 and BR-56; BR-48 to BR-50; places (spec 08); BR-43; no quests (BR-35); no `content/` import  |
| `src/domain/wiki-links.ts`                                                                                 | It builds a URL and reads nothing, so it is domain                                                 |
| `src/domain/narrative/chain.ts`                                                                            | With `checks.ts`, its only reader; takes the spine as an argument (T-13's correction)              |
| `src/infra/wiki/modules.ts`                                                                                | Reads the vendored wiki modules                                                                    |
| `src/infra/catalog/update-art.ts`                                                                          | The file read of `update-art.ts`                                                                   |
| `tests/acquisition`, `coverage`, `updates` `.test.ts`                                                      |                                                                                                    |
| `tests/dossier.test.ts`                                                                                    | The relic, Proxima and step-plan cases join the ones T-14 brought                                  |
| `src/domain/catalog/items.ts`, `src/infra/catalog/items.ts`                                                | Gain `resourceCatalog` and its read, with `checks.ts`, its only reader (T-14's correction)         |
| `tests/releases`, `search`, `places` `.test.ts`                                                            | With their modules                                                                                 |
| `tests/summary.test.ts`                                                                                    | BR-55's sections and BR-56's runs, so `summary.ts` is reached before its screen                    |

## Documents

- `docs/items.md`, `docs/scenario-guidelines.md`, `docs/acquisition-scenarios.md`: paths per plan part 1

## From T-15

- The place index is built once in `infra/place/load.ts` (`placeIndex()`, `placeCatalog()`), and `proximaPlace` takes the drop tables as its first argument: the modules that read `placeView`, `catalogEntries` or `rewardIndex` take them as arguments instead.
- A place named by an item's drop string, as BR-51's "You're on" reads it, goes through `canonicalPlace` with `systems.yaml`'s `aliases`, so `Dark Refractory, Deimos` reads as `Dark Refractory`.
- `infra/wiki/modules.ts` reads `wiki-research.json` through the schema `domain/place/schema.ts` already holds (`normalizeResearch`), extended, not a second one.

## Corrections

- The step plan holds no words. Every title, detail and reading is a typed phrase, `{ say, …values }`, one per sentence `content/checks.ts` will hold (T-29); "(Highest chance)", "Or" and "(Optional)" are the row's `best`, `alternative` and `optional`. Game names and wiki page titles stay in the domain as constants: they are data.
- A part's relics are alternatives after the first (BR-49); the runs are a value beside the odds (BR-56); a prose ask says its source, mechanics, acquisition or lead (BR-48).
- `briefOf()` returns Blueprints and Components, or How to get when an item has neither (BR-55).
- The search returns one list, best first, with every place of the index (spec 08); reach orders it on its screen (T-27).
- `bannerUpdates()` stays, for the last-played card (spec 06).
- `places.ts` holds the place vocabulary only. A place's reach is `place/reach.ts`'s (T-15, BR-59), so `reachedState()` and its `reached_by` reading are out (corrected 2026-10-13).
- The Circuit's week takes `now` as an argument, and Varzia's stock is a value handed in (T-19 reads it).
- Exports only T-19's tests read (`parseRequirements`, `namesItem` and the scenario's inner functions) are not exported yet; T-19 exports them with its tests.

## Acceptance

- [ ] `tests/coverage.test.ts` passes: every arsenal item and collectible answered from data.
- [ ] `releasesSince()` returns no quest.
- [ ] A search for a place's name returns the place.
- [ ] No module under `domain/` reads a file or the network.
- [ ] `check.yml` passes on `dev`.
