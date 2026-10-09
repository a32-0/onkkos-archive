# T-29 · Screen: Step by step

|          |                                                                                           |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                |
| Serves   | [spec 10](../10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-28, BR-37, BR-48 |
| Waits on | [T-28](T-28-item.md)                                                                      |

The plan of an item or a quest, section by section, with the wiki's prose and the ticks the player keeps in the browser.

## What crosses

| File                    | Origin   | Note                             |
| ----------------------- | -------- | -------------------------------- |
| `src/app/item/page.tsx` | Reworked | Spec 10's view                   |
| `src/screens/steps/`    | Rebuilt  |                                  |
| `src/infra/ticks.ts`    | Moves    | From `src/lib/manual/storage.ts` |
| `src/content/checks.ts` | Reworked | Spec 10                          |

## Documents that cross

- `docs/step-by-step.md`: Moves

## Acceptance

- [ ] Every acceptance item of spec 10 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
