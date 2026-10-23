# T-37 · The data at each start

|          |                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                                                            |
| Serves   | [spec 13](../13-desktop.md#the-data-after-each-warframe-update), [spec 00](../00-constitution.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-36](T-36-window.md)                                                                                                                |

An installed app gets each content update the day it is merged, without a new
version of itself: `main` publishes a manifest of `data/`, and the app swaps
in a complete, verified set at its next start.

## What it builds

| File                          | Note                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `scripts/data-manifest.ts`    | `pnpm data:manifest`: the schema and each file's size and SHA-256 into `data/manifest.json`                     |
| `scripts/content-update.ts`   | Runs `pnpm data:manifest` last                                                                                  |
| `data/manifest.json`          | The manifest; the schema starts at 1 and rises when a file's shape changes                                      |
| `desktop/src/data.ts`         | The check of spec 13, thirty seconds at most; the download into a new folder, each hash; the swap by rename     |
| `desktop/src/main.ts`         | Runs the check while **Desktop — Starting** shows, then starts the server on the current set                    |
| `src/infra/*` loaders         | `data/` read from the app's current set, in a shape Turbopack can trace without taking the whole project (T-36) |
| `tests/data-manifest.test.ts` | The manifest matches the files; `check.yml` fails when a data commit forgets it                                 |
| `desktop/tests/data.test.ts`  | A newer set swapped; a wrong hash, another schema, a timeout and no connection each keep the current set        |

## Documents

`content-updates.md`: the manifest as the command's last step, and the schema
to raise when a file's shape changes. `docs/desktop.md`: the data folder.

## Acceptance

- [ ] Spec 13's acceptance 5.
- [ ] A data set from `main` reaches an installed app at its next start, checked once by the owner after a content update.
- [ ] `pnpm check`, `pnpm knip` and `desktop/`'s checks pass; `check.yml` passes on `dev`.
