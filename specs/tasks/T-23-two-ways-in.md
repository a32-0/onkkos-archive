# T-23 · Screen: Two ways in

|          |                                                                                   |
| -------- | --------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                        |
| Serves   | [spec 03](../03-two-ways-in.md); [plan 1](../plan/01-repository.md); BR-34, BR-41 |
| Waits on | [T-22](T-22-connect.md), [T-13](T-13-engine.md)                                   |

The choice between Catch me up and Reach a goal after connecting.

## What crosses

| File                        | Origin   | Note    |
| --------------------------- | -------- | ------- |
| `src/app/features/page.tsx` | Rebuilt  | Spec 03 |
| `src/screens/two-ways-in/`  | Rebuilt  |         |
| `src/content/features.ts`   | Reworked | Spec 03 |

## Acceptance

- [ ] Every acceptance item of spec 03 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
