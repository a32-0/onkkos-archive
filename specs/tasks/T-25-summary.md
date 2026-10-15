# T-25 · Screen: the Summary

|          |                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                                                                     |
| Serves   | [spec 06](../06-catch-up-summary.md); [plan 1](../plan/01-repository.md); BR-11, BR-12, BR-13, BR-14, BR-15, BR-16, BR-35, BR-36, BR-59, BR-61 |
| Waits on | [T-24](T-24-resume.md)                                                                                                                         |

What shipped since the month chosen, its groups and tiles, the last-played card and Next, including the empty state when nothing is new.

## What it builds

| File                        | Note                                |
| --------------------------- | ----------------------------------- |
| `src/app/catch-up/page.tsx` | Spec 06, with a month chosen        |
| `src/screens/summary/`      |                                     |
| `src/content/catch-up.ts`   | The Summary's strings               |
| `tests/tokens.test.ts`      | `--scrim` leaves the allowance list |

## From T-15

- A group is the place index's `group` gathered by `summaryGroupOf` into BR-16's: Warframes, Weapons, Companions, Vehicles, and the Collection's as they are (`docs/place-index.md`).

## Acceptance

- [ ] Every acceptance item of spec 06 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The screen applies `--scrim` (the veil behind the open card, `264:67`), and it leaves the allowance list of `tests/tokens.test.ts`.
- [ ] `check.yml` passes on `dev`.
