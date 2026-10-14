# T-14 · Items and mastery: the catalog's base and the arsenal

|          |                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                        |
| Serves   | [spec 06](../06-catch-up-summary.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md); [plan 1](../plan/01-repository.md); BR-15 |
| Waits on | [T-12](T-12-profile-reading.md)                                                                                                            |

The part of the catalog that everything else reads: an item's name, category and art, mastery, the odds, an item's dossier, and the player's arsenal read against them. The domain imports nothing outside itself and the profile; the read of `@wfcd/items` is infra's.

## What crosses

| File                                       | Origin   | Note                                                                                                                                      |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/catalog/mastery.ts`, `odds.ts` | Moves    | From `src/lib/catalog/`                                                                                                                   |
| `src/domain/catalog/items.ts`              | Reworked | From `src/lib/catalog/`: builds the catalog from the raw items it is given; `resourceCatalog` crosses with `checks.ts`, its reader (T-16) |
| `src/infra/catalog/items.ts`               | New      | The read of `@wfcd/items`, split out of `items.ts`: the package reads its JSON from disk on every construction                            |
| `src/domain/catalog/dossier.ts`            | Reworked | From `src/lib/catalog/`: takes the catalog as an argument                                                                                 |
| `src/domain/profile/arsenal.ts`            | Reworked | From `src/lib/profile/`: takes the catalog as an argument; `browsableCatalog` stays, as no spec filters the catalog by Mastery Rank       |
| `tests/profile.test.ts`                    | Reworked | The arsenal and the ranks only: Nightwave and syndicates stay, and the Intrinsics goal is deferred (`deferred.md`); read on Cy            |
| `tests/dossier.test.ts`                    | Reworked | The recipe, the odds, and what a weapon is built from and into; the relic and step-plan cases join it with their modules (T-16)           |

## Corrections

- The task said all four catalog modules move unchanged. `items.ts` constructs `@wfcd/items`, which reads its JSON from disk, so under plan part 1's "No file reads in the domain" the read moves to `infra/catalog/items.ts` and the domain builds from what it is handed. `dossier.ts` and `arsenal.ts` read the catalog through that loader, so they take it as an argument.
- Nothing read `odds.ts` or `dossier.ts` in this task, so knip would fail it. The cases of `tests/dossier.test.ts` that need only these modules cross now.
- `isArsenalGroup` has no reader in the private repository and does not cross.

## Acceptance

- [ ] The arsenal reads every item's mastery from `XPInfo`.
- [ ] No module under `domain/` reads a file or the network.
- [ ] `check.yml` passes on `dev`.
