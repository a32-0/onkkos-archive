# T-14 · Items and mastery: the catalog's base and the arsenal

|          |                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                        |
| Serves   | [spec 06](../06-catch-up-summary.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md); [plan 1](../plan/01-repository.md); BR-15 |
| Waits on | [T-12](T-12-profile-reading.md)                                                                                                            |

The part of the catalog that everything else reads: an item's name, category and art, mastery, the odds, an item's dossier, and the player's arsenal read against them. The domain imports nothing outside itself and the profile; the read of `@wfcd/items` is infra's.

## What it builds

| File                                       | Note                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/catalog/mastery.ts`, `odds.ts` |                                                                                                                                 |
| `src/domain/catalog/items.ts`              | Builds the catalog from the raw items it is given; `resourceCatalog` arrives with `checks.ts`, its reader (T-16)                |
| `src/infra/catalog/items.ts`               | The read of `@wfcd/items`, split out of `items.ts`: the package reads its JSON from disk on every construction                  |
| `src/domain/catalog/dossier.ts`            | Takes the catalog as an argument                                                                                                |
| `src/domain/profile/arsenal.ts`            | Takes the catalog as an argument; no spec filters the catalog by Mastery Rank, so there is no browsable catalog                 |
| `tests/profile.test.ts`                    | The arsenal and the ranks only: Nightwave and syndicates stay, and the Intrinsics goal is deferred (`deferred.md`); read on Cy  |
| `tests/dossier.test.ts`                    | The recipe, the odds, and what a weapon is built from and into; the relic and step-plan cases join it with their modules (T-16) |

## Corrections

- `@wfcd/items` reads its JSON from disk when it is constructed, so under plan part 1's "No file reads in the domain" the read lives in `infra/catalog/items.ts` and `items.ts` builds from what it is handed. `dossier.ts` and `arsenal.ts` take the catalog as an argument.
- Nothing read `odds.ts` or `dossier.ts` in this task, so knip would fail it. The cases of `tests/dossier.test.ts` that need only these modules arrive now.

## Acceptance

- [x] The arsenal reads every item's mastery from `XPInfo`.
- [x] No module under `domain/` reads a file or the network.
- [x] `check.yml` passes on `dev`.
