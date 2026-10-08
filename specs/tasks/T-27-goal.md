# T-27 · Screen: Goal

|          |                                                                                           |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                |
| Serves   | [spec 08](../08-goals.md); [plan 1](../plan/01-repository.md); BR-05, BR-37, BR-53, BR-54 |
| Waits on | [T-26](T-26-map.md)                                                                       |

The search with its suggestions, and the curated goal cards.

## What crosses

| File                          | Origin   | Note                  |
| ----------------------------- | -------- | --------------------- |
| `src/app/goals/page.tsx`      | Rebuilt  | Spec 08               |
| `src/app/api/search/route.ts` | Reworked | Places too            |
| `src/screens/goals/`          | Rebuilt  |                       |
| `src/content/goals.ts`        | Reworked | Cards and search only |

## Acceptance

- [ ] Every acceptance item of spec 08 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-27 · Screen: Goal` · Milestone: `4. Screens`

```markdown
The search with its suggestions, and the curated goal cards.

- **Serves:** `specs/08-goals.md`, `specs/plan/01-repository.md`; BR-05, BR-37, BR-53, BR-54
- **Waits on:** T-26
- **Task:** `specs/tasks/T-27-goal.md`

### Acceptance

- [ ] Every acceptance item of spec 08 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on the pull request.
```
