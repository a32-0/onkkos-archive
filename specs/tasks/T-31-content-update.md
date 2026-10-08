# T-31 · The content update command

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 5. Launch                                                            |
| Serves   | [spec 00](../00-constitution.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-16](T-16-catalog.md)                                              |

`pnpm content:update` as `docs/content-updates.md` sets it: finds the mainlines and updates since the last review, lists what each brought in three levels, runs `pnpm check`, and writes a report for a person to read.

## The owner

- Runs `pnpm content:update --dry-run` once and reads the report.

## What crosses

| File                        | Origin | Note                                |
| --------------------------- | ------ | ----------------------------------- |
| `scripts/content-update.ts` | New    |                                     |
| `data/reviewed-update.json` | New    | Set to the update current at launch |
| `docs/updates/`             | New    |                                     |

## Documents that cross

- `docs/content-updates.md`: Moves

## Acceptance

- [ ] With no new mainline or update, it says so, restores every source and stops.
- [ ] `--dry-run` writes the report only and restores every source and the mark.
- [ ] The report has no file path and no rule id in its findings.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-31 · The content update command` · Milestone: `5. Launch`

```markdown
`pnpm content:update` as `docs/content-updates.md` sets it: finds the mainlines and updates since the last review, lists what each brought in three levels, runs `pnpm check`, and writes a report for a person to read.

- **Serves:** `specs/00-constitution.md`, `specs/plan/01-repository.md`
- **Waits on:** T-16
- **Task:** `specs/tasks/T-31-content-update.md`

### The owner

- [ ] Runs `pnpm content:update --dry-run` once and reads the report.

### Acceptance

- [ ] With no new mainline or update, it says so, restores every source and stops.
- [ ] `--dry-run` writes the report only and restores every source and the mark.
- [ ] The report has no file path and no rule id in its findings.
- [ ] `check.yml` passes on the pull request.
```
