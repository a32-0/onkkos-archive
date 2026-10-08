# T-14 · Items and mastery: the catalog's base and the arsenal

|          |                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                        |
| Serves   | [spec 06](../06-catch-up-summary.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md); [plan 1](../plan/01-repository.md); BR-15 |
| Waits on | [T-12](T-12-profile-reading.md)                                                                                                            |

The part of the catalog that everything else reads: an item's name, category and art, mastery, the odds, an item's dossier, and the player's arsenal read against them. It imports nothing outside itself and the profile.

## What crosses

| File                                                                 | Origin   | Note                                         |
| -------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `src/domain/catalog/items.ts`, `mastery.ts`, `odds.ts`, `dossier.ts` | Moves    | From `src/lib/catalog/`                      |
| `src/domain/profile/arsenal.ts`                                      | Moves    | From `src/lib/profile/`                      |
| `tests/profile.test.ts`                                              | Reworked | Without Nightwave and syndicates, which stay |

## Acceptance

- [ ] The arsenal reads every item's mastery from `XPInfo`.
- [ ] No module under `domain/` reads a file or the network.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-14 · Items and mastery: the catalog's base and the arsenal` · Milestone: `3. Domain and infra`

```markdown
The part of the catalog that everything else reads: an item's name, category and art, mastery, the odds, an item's dossier, and the player's arsenal read against them. It imports nothing outside itself and the profile.

- **Serves:** `specs/06-catch-up-summary.md`, `specs/07-map.md`, `specs/09-item-summary.md`, `specs/plan/01-repository.md`; BR-15
- **Waits on:** T-12
- **Task:** `specs/tasks/T-14-items.md`

### Acceptance

- [ ] The arsenal reads every item's mastery from `XPInfo`.
- [ ] No module under `domain/` reads a file or the network.
- [ ] `check.yml` passes on the pull request.
```
