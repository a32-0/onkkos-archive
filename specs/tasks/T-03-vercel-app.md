# T-03 · Deploy the app on Vercel

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 1. Scaffold                                                          |
| Serves   | [spec 00](../00-constitution.md); [plan 4](../plan/04-deployment.md) |
| Waits on | [T-02](T-02-ci.md)                                                   |

The first preview. While it is set up, the two limits plan part 4 leaves open are read from Vercel's own documentation and written down.

## The owner

- Creates the Vercel account and the `onkko` project, connected to the repository.
- Sets `WF_PROFILE_SOURCE=fixture` for Preview and Development. Production gets `live` only in T-33.

## Documents that cross

- `specs/plan/04-deployment.md`: "Checked when the deployment is set up" answered: Hobby's longest function run, and whether previews sit behind Deployment Protection
- `specs/plan/02-architecture.md`: The lock wait and DE's timeout shrunk to fit, if Hobby's limit is shorter than their sum

## Acceptance

- [ ] A push to a branch builds a preview that serves the blank root.
- [ ] Both limits are recorded with the link to the page of Vercel's documentation that states them.
- [ ] No project id, token or URL is committed.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-03 · Deploy the app on Vercel` · Milestone: `1. Scaffold`

```markdown
The first preview. While it is set up, the two limits plan part 4 leaves open are read from Vercel's own documentation and written down.

- **Serves:** `specs/00-constitution.md`, `specs/plan/04-deployment.md`
- **Waits on:** T-02
- **Task:** `specs/tasks/T-03-vercel-app.md`

### The owner

- [ ] Creates the Vercel account and the `onkko` project, connected to the repository.
- [ ] Sets `WF_PROFILE_SOURCE=fixture` for Preview and Development. Production gets `live` only in T-33.

### Acceptance

- [ ] A push to a branch builds a preview that serves the blank root.
- [ ] Both limits are recorded with the link to the page of Vercel's documentation that states them.
- [ ] No project id, token or URL is committed.
- [ ] `check.yml` passes on the pull request.
```
