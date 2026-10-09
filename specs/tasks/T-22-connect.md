# T-22 · Screen: Connect

|          |                                                                               |
| -------- | ----------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                    |
| Serves   | [spec 02](../02-connect.md); [plan 1](../plan/01-repository.md); BR-03, BR-38 |
| Waits on | [T-21](T-21-onboarding.md), [T-18](T-18-profile-proxy.md)                     |

The id form, its loading card, the five error bands and the demo entrance. A failed read anywhere lands here with its reason.

## What crosses

| File                           | Origin   | Note                                                                                                                                           |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/connect/page.tsx`     | Rebuilt  | Spec 02                                                                                                                                        |
| `src/app/actions.ts`           | Reworked | Connect and demo; no `?step=start`                                                                                                             |
| `src/screens/connect/`         | Rebuilt  |                                                                                                                                                |
| `src/content/failures.ts`      | Reworked | The five band messages (BR-38)                                                                                                                 |
| `src/content/onboarding.ts`    | Reworked | The form's strings and `connectError`; the field's placeholder, a real account id today, becomes `000000000000000000000001` as the frames show |
| `tests/connect-errors.test.ts` | Reworked | The five reasons of BR-38                                                                                                                      |
| `tests/tokens.test.ts`         | Reworked | `.numeral` and `.mono-label` leave the allowance list                                                                                          |

## Acceptance

- [ ] Every acceptance item of spec 02 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The screen applies `.numeral` (the numbered steps) and `.mono-label` (the field's label), and both leave the allowance list of `tests/tokens.test.ts`.
- [ ] `check.yml` passes on `dev`.
