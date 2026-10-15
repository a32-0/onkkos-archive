# T-27 · Screen: Goal

|          |                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                              |
| Serves   | [spec 08](../08-goals.md); [plan 1](../plan/01-repository.md); BR-05, BR-37, BR-53, BR-54, BR-59, BR-62 |
| Waits on | [T-26](T-26-map.md)                                                                                     |

The search with its suggestions, and the curated goal cards.

## What it builds

| File                          | Note                                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/goals/page.tsx`      | Spec 08                                                                                                                                                     |
| `src/app/api/search/route.ts` | Places too                                                                                                                                                  |
| `src/screens/goals/`          | `suggestedGoals()` takes, with the goals the engine proves done, `build_necramech` once every Necramech is owned, read from the catalog (T-13's correction) |
| `src/content/goals.ts`        | Cards and search only                                                                                                                                       |

## From T-16

- `searchCatalog(data, placeIndex(), term)` returns every match, best first, places among them: each hit with its `kind`, `group`, `name`, `type` and `family`. The route orders it by reach (spec 08, BR-62) and keeps eight.

## From T-20

- Goal renders `Shell` with `tab="goal"` and the tab bar. `/goals` is already in `routes.ts`. A link into an item carries `from=goal`.

## Acceptance

- [ ] Every acceptance item of spec 08 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
