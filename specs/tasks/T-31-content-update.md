# T-31 · The content update command

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 5. Launch                                                            |
| Serves   | [spec 00](../00-constitution.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-16](T-16-catalog.md)                                              |

`pnpm content:update` as `docs/content-updates.md` sets it: finds the mainlines and updates since the last review, lists what each brought in three levels, runs `pnpm check`, and writes a report for a person to read.

## The owner

- Runs `pnpm content:update --dry-run` once and reads the report.

## What it builds

| File                        | Note                                |
| --------------------------- | ----------------------------------- |
| `scripts/content-update.ts` |                                     |
| `data/reviewed-update.json` | Set to the update current at launch |
| `docs/updates/`             |                                     |

## Documents

- `docs/content-updates.md`: how a mainline or an update enters the app

## Acceptance

- [ ] With no new mainline or update, it says so, restores every source and stops.
- [ ] `--dry-run` writes the report only and restores every source and the mark.
- [ ] The report has no file path and no rule id in its findings.
- [ ] `check.yml` passes on `dev`.
