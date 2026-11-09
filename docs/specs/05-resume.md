# 05 · Catch up

Where a returning player says which game update they last played, by picking
it from the list of updates, choosing a month or typing a date. Catch up
then measures everything from that day.

## Frames

- [`662:4709` Catch up](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-4709).
- [`463:256` Update card](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=463-256):
  the update card.

- [`675:5461` Catch up — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5461): the search with no hit.
- [`679:4734` Catch up — From Where to start](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=679-4734): the onboarding entrance, with Skip and no tab bar (BR-41).

## Rules

- [BR-08](../business-rules.md#br-08--type-a-date-in-the-search): a date
  is typed in the search.
- [BR-09](../business-rules.md#br-09--main-updates-and-minor-updates-both-count):
  which updates are listed, one card per name.
- [BR-10](../business-rules.md#br-10--update-card-title-band): the card's
  title band.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  wider than the frame.
- [BR-40](../business-rules.md#br-40--before-the-map-skip-goes-to-the-map):
  what Skip means in onboarding.
- [BR-41](../business-rules.md#br-41--catch-up-has-two-entrances): the two
  entrances.

## What the screen does

Route `/catch-up` with no month chosen, or `/catch-up?step=resume` from Two
ways in, whatever month is kept. A `step` marks the
onboarding entrance: no tab bar. Choosing from it opens
`/catch-up?step=summary`, What's new of the same entrance; choosing from the
tab opens `/catch-up`, which shows What's new once a month is kept. From the
top, as `662:4709` draws it:

1. The header with the player chip (spec 04).
2. Onkko's line, "Once, long ago, I would look backwards, feeling for the
   fading tendrils of our might-have-beens.", once the player has reached
   Cetus and has not turned the phrases off (BR-64).
3. **Catch up**, and "Pick the last update you played. Onkko shows what came
   out since then.".
4. The search field, "Search an update or a date...", alone (`Search field`, `463:79`).
5. The update cards, newest first, one per name (BR-09). The newest wears
   **Newest**, and the one the player already chose wears **Selected**
   (BR-75). Five show, then "Show more", a `Button` in its text style,
   which shows five more.
6. **Skip**, from both entrances; from the Catch up tab, the tab bar under it
   (BR-40, BR-41).

### Choosing

- **A card** sets `wf_since` to its update's month and opens What's new
  (spec 06).
- **The search** filters the cards by name, version or date as the player
  types: every word is found in the name, at the start of a version, or, for the
  words left, together in one month of the update ("2024", "2024-03", "Mar 2024",
  "March 2024"). A typed search starts again at five cards, and "Show more" shows
  only what still matches. No match shows the `Empty state` card in place of the
  cards, "No update by that name or date." and "Try its number, like 43, or a
  month and a year." (`675:5461`).
- A month the action cannot read, or one still to come, keeps nothing and
  leaves the player on Catch up.
- **Skip** opens the map on the frontier or the focus, as on Where to start.

Skip follows BR-40: every screen before the map ends in it. Catch up has no Go
back.

## The update card

From `463:256`: the update's art across the card, and over its lower part the
band (BR-10) with the name in the display face and "Update {version} ·
{Mon} {year}" (BR-43). Above the band, a mark can tint the art and centre a
badge (BR-75): **Newest** on the newest card, over the accent at 20%;
**Selected** on the update already chosen, over slate at 50%, and it wins
when the newest is the one chosen. The card
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

## Components

`UpdateCard` (plain, newest, selected), `Badge` (Newest, Selected), `SearchField`, and the `Button` variants of Skip and "Show more", each
with its stories.

## Acceptance

1. At 390 px the screen matches `662:4709` and the card matches `463:256`.
2. At 360 and 600 nothing overlaps or is cut, and wider than 600 the page stays a centred 600 px column (BR-39).
3. A card or a month sets `wf_since` and opens What's new.
4. The search filters by name, version and date; no match shows the empty
   line.
5. Skip shows from both entrances; the tab bar follows the entrance (BR-41).
6. `pnpm check` passes.

## Frame corrections

The frames linked above are the design as it stands.
