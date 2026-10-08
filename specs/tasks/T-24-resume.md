# T-24 · Screen: Resume

|          |                                                                                     |
| -------- | ----------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                          |
| Serves   | [spec 05](../05-resume.md); [plan 1](../plan/01-repository.md); BR-08, BR-41, BR-43 |
| Waits on | [T-23](T-23-two-ways-in.md), [T-16](T-16-catalog.md)                                |

Choosing the update last played: the cards, the search, the date menu, and both entrances.

## What crosses

| File                        | Origin   | Note                                                                                                  |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `src/app/catch-up/page.tsx` | Rebuilt  | Spec 05, with no month chosen                                                                         |
| `src/screens/resume/`       | Rebuilt  |                                                                                                       |
| `src/content/catch-up.ts`   | Reworked | Resume's strings; without the quest rail's `Relation`, and the month's wording from `domain/since.ts` |

## Acceptance

- [ ] Every acceptance item of spec 05 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-24 · Screen: Resume` · Milestone: `4. Screens`

```markdown
Choosing the update last played: the cards, the search, the date menu, and both entrances.

- **Serves:** `specs/05-resume.md`, `specs/plan/01-repository.md`; BR-08, BR-41, BR-43
- **Waits on:** T-23, T-16
- **Task:** `specs/tasks/T-24-resume.md`

### Acceptance

- [ ] Every acceptance item of spec 05 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on the pull request.
```
