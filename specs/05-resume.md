# 05 · Resume

Where a returning player says which game update they last played, by picking
it from the list of updates, choosing a month or typing a date. Catch me up
then measures everything from that day.

## Frames

- [`203:231` Resume](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-231).
- [`264:388` Card Container](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=264-388):
  the update card.

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`474:608` Resume — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-608): the search with no hit.
- [`474:685` Resume — Date open](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-685): Date open over the cards and the dimmed page: "Month you last played" and the months newest first (BR-08).
- [`466:207` Resume (from Two ways in)](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=466-207): the onboarding entrance, with Skip and no tab bar (BR-41).

## Rules

- [BR-08](../docs/business-rules.md#br-08--pick-a-date-or-type-it): Date, a
  list of months; a date is typed in the search.
- [BR-09](../docs/business-rules.md#br-09--main-updates-and-minor-updates-both-count):
  which updates are listed, one card per name.
- [BR-10](../docs/business-rules.md#br-10--update-card-title-band): the card's
  title band.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  wider than the frame.
- [BR-40](../docs/business-rules.md#br-40--before-the-map-skip-goes-to-the-map):
  what Skip means in onboarding.
- [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances): the two
  entrances.

## What the screen does

Route `/catch-up` with no month chosen, or `/catch-up?step=resume` from Two
ways in, whatever month is kept (owner, 2026-10-15). A `step` marks the
onboarding entrance: no tab bar. Choosing from it opens
`/catch-up?step=summary`, the Summary of the same entrance; choosing from the
tab opens `/catch-up`, which shows the Summary once a month is kept. From the
top, as `203:231` draws it:

1. The header with the player chip (spec 04).
2. Onkko's line, "Once, long ago, I would look backwards, feeling for the
   fading tendrils of our might-have-beens.", once the player has reached
   Cetus and has not turned the phrases off (BR-64).
3. **Resume**, and "Tell Onkko which one was your last played. He'll show you
   what shipped since." (owner, 2026-10-16).
4. The search field and **Date**.
5. The update cards, newest first, one per name (BR-09). The newest wears
   **Newest**. Five show, then "Show more", a `Button` in its text style,
   which shows five more below 840 and ten from 840 (owner, 2026-10-16).
6. **Skip**, from both entrances; from the Resume tab, the tab bar under it
   (BR-40, BR-41).

### Choosing

- **A card** sets `wf_since` to its update's month and opens the Summary
  (spec 06).
- **The search** filters the cards by name, version or date as the player
  types: every word is found in the name, at the start of a version, or, for
  the words left, together in one month of the update ("2024", "2024-03",
  "Mar 2024", "March 2024"). A typed search starts again at five cards, and
  "Show more" shows only what still matches. No match shows the
  line "No update by that name or date." in place of the cards. The frame draws no empty state; the line is the one already in `src/content/`, set in the same type as the lead.
- **Date** opens the month list over the page dimmed by `--scrim` (BR-08); a
  click on the veil or Escape closes it. A month sets `wf_since` the same way
  and opens the Summary. The list holds the twelve months back from this one,
  newest first; an older time is typed in the search. A month the action
  cannot read, or one still to come, keeps nothing and leaves the player on
  Resume.
- **Skip** opens the map on the frontier or the focus, as on Two ways in.

Skip follows BR-40: every screen before the map ends in it. Resume has no Go
back (owner, 2026-10-16).

## The update card

From `264:388`: the update's art across the card, and over its lower part the
band (BR-10) with the name in the display face and "Update {version} ·
{Mon}, {year}" (BR-43). **Newest** sits at the top left of the newest card. The card
carries no item count. An update with no art shows the band over the card's
surface colour.

## States

| State          | What shows                        |
| -------------- | --------------------------------- |
| Five or fewer  | The cards, without "Show older"   |
| More than five | Five cards and "Show more"        |
| Expanded       | Every card, and no "Show older"   |
| Search, no hit | "No update by that name or date." |

## Data and sources

- The updates: `gameUpdates()` in `src/domain/catalog/updates.ts` (BR-09), from
  DE's patch notes (`data/vendor/patch-notes.json`, `pnpm data:patch-notes`)
  and, before Update 19, the catalog's `introduced`.
- The art: the patch notes' image, else `data/vendor/update-art.json` by name.
- `wf_since`: a cookie, `YYYY-MM`, read by the server.
- Copy lives in `src/content/`.

## Desktop (BR-39)

From 840 the heading, the search and Date stay one centred column; the cards
form a grid at the frame's card width, newest first in reading order, and
"Show older" sits under the grid.

## Components

`UpdateCard` (plain, newest), `Badge` (Newest), `SearchField`, `DateMenu`
(closed, open), and the `Button` variants of Skip and "Show more", each
with its stories.

## Acceptance

1. At 390 px the screen matches `203:231` and the card matches `264:388`.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut; from 840 the
   cards form a grid.
3. A card or a month sets `wf_since` and opens the Summary.
4. The search filters by name, version and date; no match shows the empty
   line.
5. Skip shows from both entrances; the tab bar follows the entrance (BR-41).
6. `pnpm check` passes.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
