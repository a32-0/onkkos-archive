# T-11 · The data, the fixtures and the scripts that refresh them

|          |                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 3. Domain and infra                                                                                                                              |
| Serves   | [spec 00](../00-constitution.md), [spec 11](../11-profile-proxy.md); [plan 1](../plan/01-repository.md), [plan 5](../plan/05-docs-and-readme.md) |
| Waits on | [T-01](T-01-scaffold.md)                                                                                                                         |

The curated files and the vendored snapshots, the four profiles the tests and demos read, and the scripts that refresh the snapshots and cut a fixture. `grafo.yaml` and `systems.yaml` arrive with the tasks that shape them (T-13, T-15).

Corrected on 2026-10-13, when the task was built:

- `tests/helpers.ts` imports the payload's parse, the profile's types and the graph's schema, none of which is here yet. It arrives with T-12, and `testGraph()` joins it in T-13.
- `trim-profile.mjs` has no default source: `--from` is required.
- `refresh-drops.mjs` and `trim-profile.mjs` read `data/grafo.yaml`, so neither runs before T-13.
- The scripts' three packages join `package.json`, and the snapshots join `.prettierignore` as they are written.
- `curated-files.md` leaves the `grafo.yaml` section to T-13, which shapes the file, follows the layers and names each snapshot's source and licence.
- The header, player chip, player menu and sheet stories carried the frames' sample player name; they now read Cy, the demo's name, as the check for a real id or name asked.

## What it builds

| File                                                                                   | Note                                                                             |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data/narrative_spine.yaml`, `quest_evidence.yaml`, `sources.yaml`, `acquisition.yaml` |                                                                                  |
| `data/vendor/*`                                                                        | Every snapshot and `manifest.json`, each with its source and licence named       |
| `fixtures/profile-cy.json`, `profile-ordis.json`                                       | The two demos, output of `pnpm fixture`, checked once more for a real id or name |
| `fixtures/profile-veteran.json`, `profile-new-player.json`                             | Synthetic; the veteran's one real platform name replaced by its display name     |
| `scripts/lua.mjs`, `refresh-drops.mjs`, `refresh-wiki.mjs`                             | `pnpm data:refresh`, `pnpm data:wiki`                                            |
| `scripts/trim-profile.mjs`                                                             | `pnpm fixture`; `--from` is required, with no default naming the real capture    |
| `package.json`, `pnpm-lock.yaml`                                                       | `yaml`, `@wfcd/items` and `warframe-worldstate-data`, pinned; the three scripts  |
| `.prettierignore`                                                                      | `fixtures/*.json` and `data/vendor/`                                             |

## Documents

- `docs/curated-files.md`: every curated file but `grafo.yaml`, which T-13 brings; the paths of the layers; a section naming each vendored snapshot's source and licence, read from the source.

## Acceptance

- [x] No real capture is committed, in the tree or in the history.
- [x] A search of the tree for the real capture's account id and display name finds nothing.
- [x] Each script reads and writes the new tree's paths; none runs in CI, and no refresh is committed in this task.
- [x] `check.yml` passes on `dev`.
