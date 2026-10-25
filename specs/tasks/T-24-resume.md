# T-24 · Screen: Resume

|          |                                                                                            |
| -------- | ------------------------------------------------------------------------------------------ |
| Phase    | 4. Screens                                                                                 |
| Serves   | [spec 05](../05-resume.md); [plan 1](../plan/01-repository.md); BR-08, BR-09, BR-41, BR-43 |
| Waits on | [T-23](T-23-two-ways-in.md), [T-16](T-16-catalog.md)                                       |

Choosing the update last played: the cards, the search, the date menu, and both entrances.

Settled by the owner on 2026-10-13: a server action sets `wf_since` and opens the Summary, as the connect action sets `wf_account`. `screens/` and `ui/` read and write no cookie.

## What it builds

| File                                           | Note                                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/catch-up/page.tsx`                    | Spec 05, with no month chosen or with `?step=resume`; a kept month without it is the Summary's (T-25)             |
| `src/screens/resume/`                          | The screen inside `Shell`, and `ResumePicker`, the client part: search, Date, the cards' form, Show older         |
| `src/app/actions.ts`                           | `resume`: writes `wf_since` through `infra/session.ts` and opens the Summary of the same entrance                 |
| `src/content/catch-up.ts`                      | Resume's strings; without the quest rail's `Relation`; the page passes the month's wording from `domain/since.ts` |
| `src/domain/since.ts`                          | `shortMonth` ("Mar, 2026", BR-43), `recentMonths`, and `sinceFrom`, which reads a month                           |
| `src/routes.ts`                                | `catchUpAt(step)`: `/catch-up`, `?step=resume` or `?step=summary`                                                 |
| `src/ui/UpdateCard/`                           | Without `href`, a submit button whose `field` names the form value; the story `Choice`                            |
| `src/screens/two-ways-in/`                     | "Pick up where you left off" opens `/catch-up?step=resume`                                                        |
| `tests/since.test.ts`, `tests/request.test.ts` | The months; both entrances, a kept month, the action and a month it cannot read                                   |

## From T-19

- `writeSince()` in `infra/session.ts` keeps only a `YYYY-MM` month, for a year; `readSince()` reads it back or answers null.

## From T-20

- A screen of the shell renders `Shell` from `src/screens/shell/` around itself, with `player={playerOf(screen)}` from `app/screen.ts` (it reads the clock, so no component does), `disconnect` from `app/actions.ts`, its `tab` and whether the tab bar shows. The root layout holds no shell. Resume passes `tab="resume"`, and `tabs` true only from the Resume tab, false from Two ways in (BR-41); the entrance comes through Resume's link.
- This is the first screen that shows the shell: acceptance 1 and 4 of spec 04, the comparison of `212:159`, `312:199` and `270:1145` at 390 px, and the sweep of the shell are checked here (owner, 2026-10-14). `/catch-up` is already in `routes.ts`.

## Corrections

- **The entrance is a `step` in the address (owner, 2026-10-15).** The page cannot know where the player came from, and `/catch-up` is both Resume and the Summary. Two ways in opens `/catch-up?step=resume`, which shows Resume whatever month is kept; choosing from it opens `/catch-up?step=summary`. Any `step` is the onboarding entrance: no tab bar, Skip and Go back. The tab opens `/catch-up`: Resume with no month, the Summary with one. Spec 05 and spec 04's table say so.
- **The cards are a form.** A server action writes `wf_since`, and a link cannot call one, so `UpdateCard` without `href` draws the same card as a submit button and Resume's cards submit their month. A month or a typed day calls the same action from the client.
- **Twelve months in Date.** The frame draws six months back from the current one; the list holds the twelve months back from this one, and an older month is typed as a day. A day that does not exist or a month still to come keeps nothing.
- **`/catch-up` with a kept month and no `step=resume` answers 404** until T-25 builds the Summary, and so does `/system` until T-26.
- **The list and its art come from DE's patch notes (owner, 2026-10-15).** The catalog dated updates only to 43.5 and dropped the numbered ones it could not name (39.1 Caliban Prime, 38.5, 38.6), and 41.1 Vauban Heirloom has no item that dates it; the wiki had no art for 43.5. `pnpm data:patch-notes` now reads DE's index and its JSON feed into `data/vendor/patch-notes.json`: 127 updates from 19 to 44.1, each with DE's name, date and art, hotfixes left out. The catalog fills the updates before 19 and a date the index leaves out (39.1). The version is text, so 19.10 and 19.1 stay apart, and the list is ordered by date. That refresh and the catalog's own update to 1.1276.21 are the data commit before this task's.
- **Several updates share a month.** With the numbered updates, 29 months hold more than one. `wf_since` keeps the month, so two cards of one month measure the same Summary (T-25 notes it).
- **Review of 2026-10-16 (owner).** Resume loses Go back; Skip stays (BR-41). Date keeps only the months, and opens over the page dimmed by `--scrim`; Escape or a click on the veil closes it. The day field went, because the search now takes a date: a year, a month or a day, as "2024", "2024-03" or "Mar 2024", filters the cards (BR-08). Five cards show, then five more at a time below 840 and ten from 840. Updates that share a name keep one card, the principal, the oldest, whose later versions and months still find it in the search (BR-09): the list goes from 133 cards to 84. The player menu's panel dims the page too, so every menu that opens over a page does (spec 04). Spec 05, spec 04 and BR-08, BR-09 and BR-41 say so, and the frames `466:207` and `474:685` and the Date menu set were brought level.
- **The local check.** Under `pnpm build` and `pnpm start`, with the Cy demo: at 390 the cards are 358 wide at x 16 and 202 high, three of them (44.1, 44 and 43.5, each with DE's art), then "Show 130 older updates"; Skip and Go back follow from Two ways in, and the tab bar from the tab. At 600 the column is 568 inside the 600 cap; from 840 the heading, the search and Date share one 640 column and the cards form a grid of 358 columns, two at 840 and three at 1280 and 1440. No width scrolls sideways. A card, a month and the typed day "2025-12-24" each kept their month and opened `/catch-up?step=summary`; "caliban" finds 39.1 and "41.1" finds Vauban Heirloom. Around Resume the player menu opens full screen at 390 and as a panel anchored under the chip at 1280, with the tabs in the header (spec 04, acceptance 1 and 4). Checked again on 2026-10-16: five cards and "Show 5 older updates" at 360, 390 and 600, "Show 10 older updates" from 840, ten cards after one click; no Go back from Two ways in; "2024" finds the updates of 2024, "dec 2024" only WARFRAME: 1999, "feb 2024" Whispers in the Walls through 35.1, "22.4" and "2017-10" Plains of Eidolon; Date's veil covers the header and the Date button, as `474:685` draws it, and Escape or a click on it closes the menu. No width scrolls sideways.

## Acceptance

- [x] Every acceptance item of spec 05 holds.
- [x] Acceptance 1 and 4 of spec 04 hold for the shell around Resume (From T-20).
- [x] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [x] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [x] `check.yml` passes on `dev`.
