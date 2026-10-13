# T-28 · Screen: the item and its Summary

|          |                                                                                           |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                |
| Serves   | [spec 09](../09-item-summary.md); [plan 1](../plan/01-repository.md); BR-55, BR-56, BR-62 |
| Waits on | [T-27](T-27-goal.md)                                                                      |

An item's page: the hero with its state, the crumb, and the Summary that is Step by step in short form.

## What crosses

| File                               | Origin   | Note    |
| ---------------------------------- | -------- | ------- |
| `src/app/item/page.tsx`            | Rebuilt  | Spec 09 |
| `src/screens/item/`                | Rebuilt  |         |
| `src/content/item.ts`, `states.ts` | Reworked | Spec 09 |

## Acceptance

- [ ] Every acceptance item of spec 09 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
