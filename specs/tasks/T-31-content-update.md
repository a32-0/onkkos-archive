# T-31 · The content update command

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 5. Launch                                                            |
| Serves   | [spec 00](../00-constitution.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-16](T-16-catalog.md), [T-24](T-24-resume.md)                      |

`pnpm content:update` as `docs/content-updates.md` sets it: brings every source up to date and wires what is new into the app, then finds the mainlines and updates since the last review, lists what each brought in three levels, runs `pnpm check`, and writes a report for a person to read. What it changed stays in the working tree; the owner reviews it and commits.

Changed by the owner on 2026-10-15: the command wires new content in as well as reporting it. It updates `@wfcd/items` to its latest version and writes its snapshot again (`pnpm data:items`), and refreshes DE's patch notes (`pnpm data:patch-notes`), the drop tables and the update art (`pnpm data:refresh`) and the wiki's modules (`pnpm data:wiki`). The report says what entered on its own and what needs a person: a curated file to extend, a name the sources do not give.

## Brought forward (owner, 2026-10-21)

Phase 4's production build failed on Vercel: Hobby takes at most 12 functions in a deployment, and each route carried `@wfcd/items` and weighed about 122 MB, too much for two routes to share a function. Two pieces of this task were built before it, in `dev`:

- `pnpm data:items` (`scripts/refresh-items.mjs`) writes `data/vendor/items.json`: the package's categories, each item cut to the fields the domain reads, with the package's version. `src/infra/catalog/items.ts` reads it, and no route imports the package any more. `tests/items-snapshot.test.ts` builds every consumer from both and requires the same result, and the snapshot's version to be the installed one.
- `pnpm weight` (`scripts/function-weight.mjs`) weighs each route after `pnpm build` and fails past 80 MB; `check.yml` runs it after the App step. `next.config.ts` names the traced data files exactly and leaves out the package's translations.

Each route now weighs about 28 MB. The command this task builds runs `pnpm data:items` after it updates the package; the snapshot test fails `pnpm check` if it does not.

## The owner

- Runs `pnpm content:update --dry-run` once and reads the report.

## What it builds

| File                          | Note                                                |
| ----------------------------- | --------------------------------------------------- |
| `scripts/content-update.ts`   | Updates the sources, wires them in, checks, reports |
| `scripts/refresh-items.mjs`   | Built before the task (2026-10-21): the snapshot    |
| `data/vendor/items.json`      | Built before the task (2026-10-21)                  |
| `scripts/function-weight.mjs` | Built before the task (2026-10-21): `pnpm weight`   |
| `data/reviewed-update.json`   | Set to the update current at launch                 |
| `docs/updates/`               |                                                     |

## From T-24

- `pnpm data:patch-notes` writes `data/vendor/patch-notes.json` from DE's patch notes: every update with its version, name, date and art. Resume's list and art come from it first, and from the catalog's `introduced` for what it lacks.
- `@wfcd/items` went from 1.1275.72 to 1.1276.21 by hand in T-24, which brought Update 44's items.

## Documents

- `docs/content-updates.md`: how a mainline or an update enters the app

## Acceptance

- [ ] With no new mainline or update, it says so, restores every source and stops.
- [ ] `--dry-run` writes the report only and restores every source and the mark.
- [ ] Without `--dry-run`, the updated sources and what they wire in stay in the working tree, and `pnpm check` passes on them.
- [ ] The report has no file path and no rule id in its findings.
- [ ] `check.yml` passes on `dev`.
