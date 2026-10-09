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
- [`474:685` Resume — Date open](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-685): Date open over the cards: "Month you last played", the months newest first, then "Or the exact day" and its field (BR-08).
- [`466:207` Resume (from Two ways in)](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=466-207): the onboarding entrance, with Skip and Go back and no tab bar (BR-41).

## Rules

- [BR-08](../docs/business-rules.md#br-08--pick-a-date-or-type-it): Date, a
  list of months and a typed date.
- [BR-09](../docs/business-rules.md#br-09--main-updates-and-minor-updates-both-count):
  which updates are listed.
- [BR-10](../docs/business-rules.md#br-10--update-card-title-band): the card's
  title band.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  wider than the frame.
- [BR-40](../docs/business-rules.md#br-40--two-ways-in-skip-goes-to-the-map-go-back-to-the-id-form):
  what Skip and Go back mean in onboarding.
- [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances): the two
  entrances.

## What the screen does

Route `/catch-up` with no month chosen. From the top, as `203:231` draws it:

1. The header with the player chip (spec 04).
2. Onkko's line, "Once, long ago, I would look backwards, feeling for the
   fading tendrils of our might-have-beens."
3. **Resume**, and "Tell us which one was your last played. We'll show you what
   shipped since."
4. The search field and **Date**.
5. The update cards, newest first. The newest wears **Newest**. Three show,
   then "Show {n} older updates", which shows the rest.
6. From Two ways in: **Skip** and **Go back**. From the Resume tab: the tab bar
   in their place (BR-41).

### Choosing

- **A card** sets `wf_since` to its update's month and opens the Summary
  (spec 06).
- **The search** filters the cards by name or version as the player types, and
  "Show {n} older updates" counts only what still matches. No match shows the
  line "No update by that name." in place of the cards. The frame draws no empty state; the line is the one already in `src/content/`, set in the same type as the lead.
- **Date** opens the month list and the typed-date field (BR-08). A month or a
  date sets `wf_since` the same way and opens the Summary.
- **Skip** opens the map on the frontier or the focus, as on Two ways in.
- **Go back** returns to `/features`.

Skip and Go back follow BR-40 because they are the same two buttons on the next
screen of the same onboarding: forward to the map, back one step.

## The update card

From `264:388`: the update's art across the card, and over its lower part the
band (BR-10) with the name in the display face and "Update {version} ·
{Mon}, {year}" (BR-43). **Newest** sits at the top left of the newest card. The card
carries no item count. An update with no art shows the band over the card's
surface colour.

## States

| State           | What shows                               |
| --------------- | ---------------------------------------- |
| Three or fewer  | The cards, without "Show older"          |
| More than three | Three cards and "Show {n} older updates" |
| Expanded        | Every card, and no "Show older"          |
| Search, no hit  | "No update by that name."                |

## Data and sources

- The updates: `gameUpdates()` in `src/lib/catalog/updates.ts` (BR-09).
- The art: `data/vendor/update-art.json`, by update name.
- `wf_since`: a cookie, `YYYY-MM`, read by the server.
- Copy lives in `src/content/`.

## Desktop (BR-39)

From 840 the heading, the search and Date stay one centred column; the cards
form a grid at the frame's card width, newest first in reading order, and
"Show older" sits under the grid.

## Components

`UpdateCard` (plain, newest), `Badge` (Newest), `SearchField`, `DateMenu`
(closed, open), `ShowMore`, and the `Button` variants of Skip and Go back, each
with its stories.

## Acceptance

1. At 390 px the screen matches `203:231` and the card matches `264:388`.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut; from 840 the
   cards form a grid.
3. A card, a month or a typed date sets `wf_since` and opens the Summary.
4. The search filters by name and version; no match shows the empty line.
5. Skip, Go back and the tab bar follow the entrance (BR-41).
6. `pnpm check` passes.

## Divergences from the code

| Today                      | The frames and rules                     |
| -------------------------- | ---------------------------------------- |
| Titled "Catch me up"       | "Resume", with the frame's line and lead |
| Cards show an item count   | "Update {version} · {Mon}, {year}" only  |
| One form, inside the shell | Two entrances (BR-41)                    |
| No Skip or Go back         | Both, from Two ways in                   |

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
