# T-25 · Screen: the Summary

|          |                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                                                                     |
| Serves   | [spec 06](../06-catch-up-summary.md); [plan 1](../plan/01-repository.md); BR-11, BR-12, BR-13, BR-14, BR-15, BR-16, BR-35, BR-36, BR-59, BR-61 |
| Waits on | [T-24](T-24-resume.md)                                                                                                                         |

What shipped since the month chosen, its groups and tiles, the last-played card and Next, including the empty state when nothing is new.

## What it builds

| File                        | Note                         |
| --------------------------- | ---------------------------- |
| `src/app/catch-up/page.tsx` | Spec 06, with a month chosen |
| `src/screens/summary/`      |                              |
| `src/content/catch-up.ts`   | The Summary's strings        |

## From T-15

- A group is the place index's `group` gathered by `summaryGroupOf` into BR-16's: Warframes, Weapons, Companions, Vehicles, and the Collection's as they are (`docs/place-index.md`).

## From T-20

- The Summary keeps Resume's entrance: `Shell` with `tab="resume"`, and `tabs` as Resume had it (BR-41).

## From T-21

- `--scrim` left the allowance list of `tests/tokens.test.ts` in T-21: the splash's veil over the art applies it, and the frame `206:903` is bound to the `scrim` variable at 60%.

## From T-23

- Next opens `startHereOf(screen)` from `app/screen.ts`, the address Skip opens on Two ways in: the frontier, or the focus, or the Origin System's first place (BR-36, BR-46).

## From T-24

- `app/catch-up/page.tsx` calls `notFound()` where the Summary goes: a kept month (`readSince()`) with no `step` or with `step=summary`. The Summary renders there, inside `Shell` with `tab="resume"` and `tabs` false when a `step` is in the address (BR-41).
- `resume` in `app/actions.ts` writes `wf_since` and opens `catchUpAt("summary")` from Two ways in, or `catchUpAt(null)` from the tab; the update list over the page (`264:67`) can call it the same way.
- `wf_since` keeps a month, and some months hold more than one update since the list reads DE's patch notes; `updateFor(yearMonth)` answers the newest of that month, which is what the last-played card shows.
- Updates that share a name are one `GameUpdate`, the principal, with `versions` and `yearMonths` for the rest (BR-09). A month kept before 2026-10-16 can be one of those later months, where no update starts: `updateFor` answers null there, and the Summary has to name the update whose `yearMonths` hold it.
- `shortMonth()` in `domain/since.ts` writes "Mar, 2026" (BR-43), and `RESUME.meta` in `content/catch-up.ts` "Update {version} · {Mon}, {year}".

## Acceptance

- [ ] Every acceptance item of spec 06 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The screen applies `--scrim` (the veil behind the open card, `264:67`).
- [ ] `check.yml` passes on `dev`.
