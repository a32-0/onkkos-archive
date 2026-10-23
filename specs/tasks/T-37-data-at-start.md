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

| File                          | Note                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `scripts/data-manifest.ts`    | `pnpm data:manifest`: the schema and each file's size and SHA-256 into `data/manifest.json`                       |
| `scripts/content-update.ts`   | Writes the manifest once the sources are updated, before `pnpm check`                                             |
| `data/manifest.json`          | The manifest; the schema starts at 1 and rises when a file's shape changes                                        |
| `desktop/src/data.ts`         | The check of spec 13, thirty seconds at most; a new server folder with the new set, each hash; the swap by rename |
| `desktop/src/main.ts`         | Runs the check while **Desktop — Starting** shows, then starts the server from the folder in use                  |
| `desktop/scripts/stage.mjs`   | Copies `data/manifest.json` beside the staged server, which the build's tracing leaves out                        |
| `tests/data-manifest.test.ts` | The manifest matches the files; `check.yml` fails when a data commit forgets it                                   |
| `desktop/tests/data.test.ts`  | A newer set swapped; a wrong hash, another schema, a timeout and no connection each keep the current set          |

Changed on 2026-10-23: the loaders were to read a data folder named by a
variable (T-36). A path read from a variable makes Turbopack trace the whole
project, and moving the server's working folder broke Next's own paths. So the
app keeps a whole server folder of its own under `userData`, the program's
code copied beside the downloaded set, and `src/` does not change. Writing the
manifest moved before `pnpm check` in `content:update`, or its own test would
fail every review.

## Documents

`content-updates.md`: the manifest as a step of the command, and the schema
to raise when a file's shape changes. `docs/desktop.md`: the data at each
start.

## Acceptance

- [ ] Spec 13's acceptance 5. Covered by `desktop/tests/data.test.ts`
      (2026-10-23). Started from the tree with `WF_DATA_CHECK=1` and no
      manifest on `main` yet, the app opened normally on the set it carries.
      The first real swap waits for the manifest to reach `main`.
- [ ] A data set from `main` reaches an installed app at its next start, checked once by the owner after a content update.
- [ ] `pnpm check`, `pnpm knip` and `desktop/`'s checks pass; `check.yml` passes on `dev`.
