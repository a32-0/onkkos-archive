# T-16 · The catalog: sources, relics, releases, updates, search

|          |                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                                                                                                                                                |
| Serves   | [spec 05](../05-resume.md), [spec 06](../06-catch-up-summary.md), [spec 08](../08-goals.md), [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-12, BR-35, BR-43, BR-48, BR-49, BR-50, BR-53, BR-55, BR-56 |
| Waits on | [T-15](T-15-places.md)                                                                                                                                                                                                                                             |

Everything else the app knows about where things come from. `releases.ts` loses the quests (BR-35), `updates.ts` takes BR-43's date, `summary.ts` the Summary's densities and readings, `checks.ts` the wiki's paragraphs, and `search.ts` gains places. The move follows plan part 1's "What a move changes": no import of `content/` or of a loader stays in `domain/`. The wiki's vendored modules are read in `infra/` and handed in.

## What crosses

| File                                                                                                       | Origin   | Note                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `src/domain/catalog/acquisition.ts`, `places.ts`                                                           | Moves    | From `src/lib/catalog/`                                                                           |
| `src/domain/catalog/circuit.ts`, `collectibles.ts`, `relics.ts`, `rewards.ts`, `scenario.ts`, `sources.ts` | Reworked | Their data as arguments: the wiki's modules, the place index and the spine; no `content/` import  |
| `src/domain/catalog/summary.ts`, `checks.ts`, `search.ts`, `updates.ts`, `releases.ts`                     | Reworked | BR-55 and BR-56; BR-48 to BR-50; places (spec 08); BR-43; no quests (BR-35); no `content/` import |
| `src/domain/wiki-links.ts`                                                                                 | Moves    | From `src/lib/wiki/links.ts`: it builds a URL and reads nothing, so it is domain                  |
| `src/infra/wiki/modules.ts`                                                                                | Moves    | Reads the vendored wiki modules                                                                   |
| `src/infra/catalog/update-art.ts`                                                                          | Moves    | The file read of `update-art.ts`                                                                  |
| `tests/acquisition`, `coverage`, `updates`, `dossier` `.test.ts`                                           | Moves    |                                                                                                   |
| `tests/releases`, `search`, `places` `.test.ts`                                                            | Reworked | With their modules                                                                                |

## Documents that cross

- `docs/items.md`, `docs/scenario-guidelines.md`, `docs/acquisition-scenarios.md`: Move, paths per plan part 1

## Acceptance

- [ ] `tests/coverage.test.ts` passes: every arsenal item and collectible answered from data.
- [ ] `releasesSince()` returns no quest.
- [ ] A search for a place's name returns the place.
- [ ] No module under `domain/` reads a file or the network.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-16 · The catalog: sources, relics, releases, updates, search` · Milestone: `3. Domain and infra`

```markdown
Everything else the app knows about where things come from. `releases.ts` loses the quests (BR-35), `updates.ts` takes BR-43's date, `summary.ts` the Summary's densities and readings, `checks.ts` the wiki's paragraphs, and `search.ts` gains places. The move follows plan part 1's "What a move changes": no import of `content/` or of a loader stays in `domain/`. The wiki's vendored modules are read in `infra/` and handed in.

- **Serves:** `specs/05-resume.md`, `specs/06-catch-up-summary.md`, `specs/08-goals.md`, `specs/09-item-summary.md`, `specs/10-step-by-step.md`, `specs/plan/01-repository.md`; BR-12, BR-35, BR-43, BR-48, BR-49, BR-50, BR-53, BR-55, BR-56
- **Waits on:** T-15
- **Task:** `specs/tasks/T-16-catalog.md`

### Acceptance

- [ ] `tests/coverage.test.ts` passes: every arsenal item and collectible answered from data.
- [ ] `releasesSince()` returns no quest.
- [ ] A search for a place's name returns the place.
- [ ] No module under `domain/` reads a file or the network.
- [ ] `check.yml` passes on the pull request.
```
