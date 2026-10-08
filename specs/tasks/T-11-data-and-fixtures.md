# T-11 · The data, the fixtures and the scripts that refresh them

|          |                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                              |
| Serves   | [spec 00](../00-constitution.md), [spec 11](../11-profile-proxy.md); [plan 1](../plan/01-repository.md), [plan 5](../plan/05-docs-and-readme.md) |
| Waits on | [T-01](T-01-scaffold.md)                                                                                                                         |

The curated files and the vendored snapshots that cross unchanged, the four profiles the tests and demos read, and the scripts that refresh the snapshots and cut a fixture. The reworked curated files (`grafo.yaml`, `systems.yaml`) cross with the tasks that change them.

## What crosses

| File                                                                                   | Origin | Note                                                                             |
| -------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `data/narrative_spine.yaml`, `quest_evidence.yaml`, `sources.yaml`, `acquisition.yaml` | Moves  |                                                                                  |
| `data/vendor/*`                                                                        | Moves  | Every snapshot and `manifest.json`, each with its source and licence named       |
| `fixtures/profile-cy.json`, `profile-ordis.json`                                       | Moves  | The two demos, output of `pnpm fixture`, checked once more for a real id or name |
| `fixtures/profile-veteran.json`, `profile-new-player.json`                             | Moves  | Synthetic                                                                        |
| `scripts/lua.mjs`, `refresh-drops.mjs`, `refresh-wiki.mjs`, `trim-profile.mjs`         | Moves  | `pnpm data:refresh`, `pnpm data:wiki`, `pnpm fixture`                            |
| `tests/helpers.ts`                                                                     | Moves  |                                                                                  |

## Documents that cross

- `docs/curated-files.md`: Moves

## Acceptance

- [ ] `profile-full.json` does not cross, in the tree or in the history.
- [ ] A search of the tree for the real capture's account id and display name finds nothing.
- [ ] Each script reads and writes the new tree's paths; none runs in CI, and no refresh is committed in this task.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-11 · The data, the fixtures and the scripts that refresh them` · Milestone: `3. Domain and infra`

```markdown
The curated files and the vendored snapshots that cross unchanged, the four profiles the tests and demos read, and the scripts that refresh the snapshots and cut a fixture. The reworked curated files (`grafo.yaml`, `systems.yaml`) cross with the tasks that change them.

- **Serves:** `specs/00-constitution.md`, `specs/11-profile-proxy.md`, `specs/plan/01-repository.md`, `specs/plan/05-docs-and-readme.md`
- **Waits on:** T-01
- **Task:** `specs/tasks/T-11-data-and-fixtures.md`

### Acceptance

- [ ] `profile-full.json` does not cross, in the tree or in the history.
- [ ] A search of the tree for the real capture's account id and display name finds nothing.
- [ ] Each script reads and writes the new tree's paths; none runs in CI, and no refresh is committed in this task.
- [ ] `check.yml` passes on the pull request.
```
