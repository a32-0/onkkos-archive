# T-02 · Run the gates on every push

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 1. Scaffold                                                          |
| Serves   | [spec 00](../00-constitution.md); [plan 4](../plan/04-deployment.md) |
| Waits on | [T-01](T-01-scaffold.md)                                             |

`check.yml` as plan part 4 sets it, with the steps that exist so far: install, check, dead code, app build. T-05 adds the two Storybook steps.

## The owner

- Protects `main` so a pull request merges only when `check.yml` passes (may wait until T-33, as plan part 6 sets).

## What crosses

| File                          | Origin | Note                           |
| ----------------------------- | ------ | ------------------------------ |
| `.github/workflows/check.yml` | New    | On every push and pull request |

## Documents that cross

- `docs/development.md`: Adds what CI runs and why

## Acceptance

- [ ] A push runs install (`--frozen-lockfile`), `pnpm check`, `pnpm knip` and `pnpm build` with `WF_PROFILE_SOURCE=fixture`.
- [ ] The workflow holds no secret and reads nothing outside the repository.
- [ ] A pull request with a format error fails, and the failure names the step.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-02 · Run the gates on every push` · Milestone: `1. Scaffold`

```markdown
`check.yml` as plan part 4 sets it, with the steps that exist so far: install, check, dead code, app build. T-05 adds the two Storybook steps.

- **Serves:** `specs/00-constitution.md`, `specs/plan/04-deployment.md`
- **Waits on:** T-01
- **Task:** `specs/tasks/T-02-ci.md`

### The owner

- [ ] Protects `main` so a pull request merges only when `check.yml` passes (may wait until T-33, as plan part 6 sets).

### Acceptance

- [ ] A push runs install (`--frozen-lockfile`), `pnpm check`, `pnpm knip` and `pnpm build` with `WF_PROFILE_SOURCE=fixture`.
- [ ] The workflow holds no secret and reads nothing outside the repository.
- [ ] A pull request with a format error fails, and the failure names the step.
- [ ] `check.yml` passes on the pull request.
```
