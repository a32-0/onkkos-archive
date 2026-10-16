# T-31 · The content update command

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 5. Launch                                                            |
| Serves   | [spec 00](../00-constitution.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-16](T-16-catalog.md), [T-24](T-24-resume.md)                      |

`pnpm content:update` as `docs/content-updates.md` sets it: brings every source up to date and wires what is new into the app, then finds the mainlines and updates since the last review, lists what each brought in three levels, runs `pnpm check`, and writes a report for a person to read. What it changed stays in the working tree; the owner reviews it and commits.

Changed by the owner on 2026-10-15: the command wires new content in as well as reporting it. It updates `@wfcd/items` to its latest version, and refreshes DE's patch notes (`pnpm data:patch-notes`), the drop tables and the update art (`pnpm data:refresh`) and the wiki's modules (`pnpm data:wiki`). The report says what entered on its own and what needs a person: a curated file to extend, a name the sources do not give.

## The owner

- Runs `pnpm content:update --dry-run` once and reads the report.

## What it builds

| File                        | Note                                                |
| --------------------------- | --------------------------------------------------- |
| `scripts/content-update.ts` | Updates the sources, wires them in, checks, reports |
| `data/reviewed-update.json` | Set to the update current at launch                 |
| `docs/updates/`             |                                                     |

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
