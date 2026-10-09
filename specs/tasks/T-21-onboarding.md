# T-21 · Screen: Onboarding

|          |                                                                    |
| -------- | ------------------------------------------------------------------ |
| Phase    | 4. Screens                                                         |
| Serves   | [spec 01](../01-onboarding.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-20](T-20-shell.md)                                              |

The first screen a new visitor sees, as spec 01 sets it.

## What crosses

| File                        | Origin   | Note                                                                     |
| --------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/app/page.tsx`          | Rebuilt  | Spec 01                                                                  |
| `src/screens/onboarding/`   | Rebuilt  |                                                                          |
| `src/content/onboarding.ts` | Reworked | Spec 01's strings; the form's strings and `connectError` cross with T-22 |

## Acceptance

- [ ] Every acceptance item of spec 01 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
