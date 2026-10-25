# T-25 · Screen: the Summary

|          |                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                                                                              |
| Serves   | [spec 06](../../specs/06-catch-up-summary.md); [plan 1](../plan/01-repository.md); BR-11, BR-12, BR-13, BR-14, BR-15, BR-16, BR-35, BR-36, BR-59, BR-61 |
| Waits on | [T-24](T-24-resume.md)                                                                                                                                  |

What shipped since the month chosen, its groups and tiles, the last-played card and Next, including the empty state when nothing is new.

## What it builds

| File                                                                        | Note                                                                                                                                                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/catch-up/page.tsx`                                                 | Spec 06, with a month chosen and no `step=resume`; the card, the update list, the groups and Next                                                                                  |
| `src/screens/summary/`                                                      | `Summary` inside `Shell`; `SummaryCard`, the card and its list over the veil; `SummaryGroups`, the dividers and the groups; `view.ts` and `lines.ts`, the domain's values in words |
| `src/domain/catalog/whats-new.ts`                                           | `whatsNew()`: each group's tiles in reach and the rest counted (BR-59, BR-61); `bestPlaces()` from the place index                                                                 |
| `src/domain/catalog/updates.ts`                                             | A month folded into a principal update names it (`updateFor`, `updateStanding`)                                                                                                    |
| `src/content/catch-up.ts`                                                   | The Summary's strings                                                                                                                                                              |
| `src/content/reach.ts`                                                      | The More line's words (BR-61)                                                                                                                                                      |
| `src/content/checks.ts`                                                     | The readings a tile shows, the first part of T-29's file                                                                                                                           |
| `src/routes.ts`                                                             | `itemRoute(name, from)`                                                                                                                                                            |
| `src/screens/resume/batches.ts`                                             | Five, then five more below 840 and ten from 840, for Resume and the card's list                                                                                                    |
| `src/ui/FeaturedCard/`                                                      | The chevron points up while the list is open (BR-14)                                                                                                                               |
| `src/ui/LoadingCard/`, `src/content/onboarding.ts`                          | The loading card as `428:743` now draws it (T-22's correction)                                                                                                                     |
| `tests/whats-new.test.ts`, `tests/request.test.ts`, `tests/updates.test.ts` | Which groups render, the tiles' lines, what the More line counts, Ordis, a profile with nothing to measure; both entrances, the card, the empty state, a folded month              |

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

## Corrections

- **The tiles' readings need T-29's words (owner, 2026-10-16).** A tile shows the first line of `briefOf()`, whose readings are phrases, and only T-29's `content/checks.ts` gives phrases words. The eight a tile can show (a drop's runs, a relic, a vendor, a price, the Market, the Market's price, costs, a percentage) are written here, and T-29 completes the file. `content/` cannot import `domain/`, so the file types its own values and `screens/summary/lines.ts` checks them against `Phrase` at compile time.
- **The loading card, in this task (owner, 2026-10-16).** The frame `428:743` was redrawn after T-22: the quill and the line centred, the line "Onkko is reading your archive..." in `.figure`. T-22 records it.
- **The card's list pages like Resume (owner, 2026-10-16).** Five, then five more below 840 and ten from 840. It opens over the page dimmed by `--scrim`, and Escape or a click on the veil closes it, as Date does.
- **Reach needs an item's place.** BR-59 measures an item by its rank and the place of its best route; nothing gave that place before. `bestPlaces()` reads it from the place index, the route with the highest chance; a collectible uses its own best route. An item with no place is measured by its rank alone.
  The two readings of BR-51 agree today: every item Ordis has beyond a place since August 2025 sits in one place of the index, and its tile names a node of that place.
- **The Dojo in a More line.** BR-61's table has no row for what only the Dojo holds; BR-59's Dojo words are used, and BR-61 says so.
- **The foot follows the content.** Onkko's line and Skip sit under the last group or the empty state, as the frames draw them, not at the window's foot.
- **The open card points up.** BR-14 turns a chevron up while what it opens is open, and spec 06 says so of the card, but `Featured card` had no open state and `264:67` drew it down. The set `463:275` gained `State=Open` (`605:5019`), the chevron turned up, and `264:67` uses it, with "Show 5 older updates"; `FeaturedCard` turns its chevron the same way.
- **The owner's review of 2026-10-16, done in this task.**
  - The readings capitalise "Intact" and "Radiant"; the Dojo's words in BR-61 stand.
  - "Show {n} older updates", the small `ShowMore`, is gone: Resume and the card's list end in a text-style `Button`, "Show more", which shows five more below 840 and ten from 840 (owner: the count is not written). `ShowMore` and its stories are deleted.
  - Every screen before the map ends in Skip, secondary (BR-40): Two ways in keeps Back, as `203:140` now names it (it read "Go back"), Resume shows Skip from the tab too (BR-41), and the Summary's Next is Skip (BR-36). Resume's lead reads "Tell Onkko which one was your last played. He'll show you what shipped since."
  - Disconnect is filled red. Only Default was redrawn; the set's Hover, Focus and Disabled were filled to match.
  - The player menu draws Settings: Language, Onkko's Phrases and Tutorial. Only Onkko's Phrases works (BR-64); Language and Tutorial show disabled, as the owner asked, and `Segmented` takes `disabled`. Figma draws them so: Language at 40% and Reset as the disabled secondary button.
  - Figma was brought level: the lead and "Show more" on every Resume frame and the card's list, Skip in place of Next on Summary_Card Opened, Summary — Nothing new and Summary — Beyond reach, the Summary lead of `257:653` on `206:774` and Summary — Beyond reach, and no Show-more under Resume — No match, where nothing is left to show. Skip was added to Resume — No match, Resume — Date open and the four Goal state frames, as their main frames draw it. In the menu the Settings divider sits flush, as `270:1145` draws it: `Divider` takes `flush`.
- **Two more asks of 2026-10-16.** On a phone the page under the player menu no longer scrolls while it is open (`Sheet` locks `html` below 840). The chip and the menu wear the player's glyph: the trim keeps `ActiveAvatarImageType`, and `glyphImages()` reads the glyphs' art from `@wfcd/items`. The field could not be confirmed against a live response from here (development never calls DE, and the fixtures were trimmed before it was kept); a profile without it keeps the square. The demos wear Cephalon Cy's glyph and Conquera Ordis's (owner's choice).
- **`/item` answers 404** until T-28 builds it; a tile already links there with `from=resume`.
- **The local check.** Under `pnpm build` and `pnpm start`. Cy with March 2026: the card names The Shadowgrapher, "Update 42 · Mar, 2026"; Warframes 5, Weapons 12, Relics 24, Mods 4 and Arcanes 4 New, closed; opened, 49 tiles of 200 px, a sideways rail at 390 and a grid in the 1200 area from 840; the list shows five and "Show 5 older updates" at 390, "Show 10 older updates" at 1280, Escape closes it. No width from 360 to 1440 scrolls sideways. Ordis (Mastery Rank 2) with August 2025: every group ends in its More line, "21 more weapons need Mastery Rank 11 or a place past Mars." among them. October 2026: "You're up to date", the empty state and Next. Choosing Vauban Heirloom from the list, from the tab and from `?step=summary`, kept February 2026, stayed on the same entrance (the tab bar, or none) and counted Warframes 6 and Weapons 16 New. Connect, held mid-read, shows the quill and "Onkko is reading your archive..." centred, as `428:743` draws them. January 2014, the oldest the list holds: 1,919 new things, rendered in 0.7 s.

## Acceptance

- [x] Every acceptance item of spec 06 holds.
- [x] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [x] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [x] The screen applies `--scrim` (the veil behind the open card, `264:67`).
- [x] `check.yml` passes on `dev`.
