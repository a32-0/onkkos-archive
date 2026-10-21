# 06 · Catch me up: Summary

The answer to "what did I miss?": everything added to the arsenal and the
collection since the update the player last played. The Summary is a menu of
categories, each counting what is new; a category opens its own page, and
each thing on it opens its item page. Skip goes to the map.

## Frames

- [`662:4885` Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-4885): the menu, from the Resume tab.
- [`679:4789` Summary — From Two Ways In](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=679-4789): the onboarding entrance, with
  Skip and no tab bar (BR-41).
- [`675:5489` Summary — Up to date](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5489): the card when the player is up to
  date.
- [`675:5527` Summary — Nothing new](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5527): the card, then the empty state,
  Onkko's line and Skip.
- [`662:6072` Summary>Updates](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6072): the update list the last-played card
  opens.
- [`662:5040` Summary>Warframes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-5040): a category's page.
- [`675:5570` Summary>Warframes — Beyond reach](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5570): the page ends in the
  More line (BR-61).

Drawn in "App flows" on 2026-10-18 (T-27b). Their texts are sample values.

## Rules

- [BR-11](../docs/business-rules.md#br-11--say-plainly-where-the-game-stands-now):
  the up-to-date card.
- [BR-12](../docs/business-rules.md#br-12--everything-new-that-the-sources-record):
  everything new a source dates, and nothing it does not.
- [BR-13](../docs/business-rules.md#br-13--the-last-played-card-opens-the-update-list):
  the card opens the update list.
- [BR-15](../docs/business-rules.md#br-15--no-mastered-or-rank-here-only-new):
  no Mastered or Rank here, only NEW.
- [BR-59](../docs/business-rules.md#br-59--what-the-player-can-reach) and
  [BR-61](../docs/business-rules.md#br-61--a-group-shows-what-is-in-reach-and-counts-the-rest):
  a category's page lists what the player can reach; the rest is counted.
- [BR-16](../docs/business-rules.md#br-16--what-each-arsenal-group-holds):
  what each Arsenal group holds.
- [BR-35](../docs/business-rules.md#br-35--catch-me-up-is-what-the-summary-draws):
  Arsenal and Collection, and nothing else.
- [BR-36](../docs/business-rules.md#br-36--from-the-summary-an-item-or-skip-to-a-place):
  an item, or Skip to a place.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances) (the tab
  bar follows the entrance),
  [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons)
  (category icons), [BR-43](../docs/business-rules.md#br-43--one-date-format-mar-2026)
  (the date).

## What the screen does

Route `/catch-up` with a month chosen (`wf_since`). From the top, as `662:4885`
draws it:

1. The header with the player chip; the tab bar only after the tab's entrance
   (BR-41).
2. Onkko's line, "We are prepared to provide.", once the player has reached
   Cetus and has not turned the phrases off (BR-64).
3. **Summary**, and the lead "This is what shipped since you left off. Pick one
   and go for it."
4. The **last-played card**: the update's art, "You last played", its name and
   "Update {version} · {Mon}, {year}", and a chevron.
5. The **Arsenal** divider and its categories: Warframes, Weapons, Companions,
   Vehicles (BR-16).
6. The **Collection** divider and its categories: Resources, Relics, Mods,
   Arcanes, Incarnons, Ephemera, Honoria.
7. **Skip**, a secondary button (BR-40).

### A category row

Each divider holds its categories as one grouped list (`List item`): the
category's game icon (BR-42), its name, "{n} New" in the accent colour and a
chevron. The row opens the category's page. "{n} New" counts what is in reach
and what is not.

A category with nothing new does not render, and a divider with no category
under it does not render either. The frames draw every category with sample
data; which appear is the data's (BR-12, BR-33). Today Resources, Incarnons,
Ephemera and Honoria have no dated source, so they never appear.

### A category's page

Route `/catch-up/{category}`, under the top bar titled with the category
(spec 04), as `662:5040` draws it: Onkko's line, the lead "New since you
left off. Pick one to see how to get it.", and what is new and in the
player's reach (BR-59), one `Summary row` each in a grouped list.

A row is the item's art, its name in the display face without the word its
category already says ("Hunhow" under Honoria, "Axi A21" under Relics; owner,
2026-10-16), and under it the first line of the item's own Summary
(`briefOf()`, spec 09): the reading in gold, "~{n} Runs · Rotation {x}"
(BR-56), and the place under it ("Saya's Visions · Shrine Defense"). A line the
data does not have is left out, never filled with a placeholder. The gold line
is the line's phrases in words (a drop's runs, a relic's rarity and chances, a
vendor's price); the place is its `where`, or the names the reading carries
when it has none ("Zariman" for Cephalon Melica's wares). No Mastered or Rank
marker (BR-15). The row opens the item's page, with the Resume tab as its
origin (spec 04).

What is new and beyond reach is not drawn: the page ends in a More line that
says how many, of what, and what stands in the way (`675:5570`, BR-61), and
opens nothing. A category whose new things are all beyond reach shows only the
More line.

### The last-played card

- The chevron opens **Updates** (`662:6072`), a page under the top bar, with
  the lead "Pick the update you last played. The Summary starts again from
  it.": the other updates newest first as update cards (spec 05), the newest
  game update still carrying **Newest** (owner, 2026-10-18), five, then "Show
  more", five more below 840 and ten from 840, as on Resume (owner,
  2026-10-16). Choosing one sets `wf_since` and returns to the Summary from
  that month, keeping the entrance. Back returns without a change.
- When the player is up to date (BR-11) the eyebrow reads "You're up to date"
  in the accent colour (`675:5489`), with the newest update's name and date.

### Skip

Opens the map on the frontier, or on the focus when there is no frontier
(BR-36). It is the only way on besides a category.

## States

| State                       | Frame                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| The menu                    | `662:4885`; from Two ways in, `679:4789`                                      |
| A category's page           | `662:5040`                                                                    |
| Something new beyond reach  | The page ends in `More line` (`675:5570`, BR-61)                              |
| Updates open                | `662:6072`                                                                    |
| Up to date                  | `675:5489`                                                                    |
| Nothing new since the month | The card, the empty state, Onkko's line and Skip; no lead, no divider, no row |

Skip follows the last list, or the empty state, as the frames draw it; it is
not held to the foot of the window.

## Data and sources

- What shipped: `releasesSince()` and `shelfOf()` in
  `src/domain/catalog/releases.ts`, from `releaseDate` and `introduced` in
  `@wfcd/items`, and Prime parts for relics (BR-12); a month counts what
  shipped after it. `whatsNew()` in `src/domain/catalog/whats-new.ts` splits
  each category into what is in reach and what is counted (BR-59, BR-61): an
  item's rank against `PlayerLevel`, and the place of its best route in the
  place index (`bestPlaces()`), or a collectible's best route, against the
  places reached.
- The row's lines: the item's plan through `briefOf()` in
  `src/domain/catalog/summary.ts`, the same answer as its page.
- The card: `updateStanding()` and `bannerUpdates()` in
  `src/domain/catalog/updates.ts`; art from the patch notes, else `data/vendor/update-art.json`.
- The frontier and the focus: as on Two ways in (spec 03, spec 07).
- Category icons: `gameIcons()` in `src/infra/wiki/icons.ts`, the wiki's,
  never rehosted. Incarnons, Ephemera and Honoria have none, and render
  without one.
- A row opens `/item?name=&from=resume` (`itemRoute()`), which T-28 builds.

## Desktop (BR-39)

The menu, a category's page and Updates stay one reading column, at most
640 px wide; from 840 Updates lays its cards out as a grid, as Resume does.

## Components

`FeaturedCard` (last played, up to date), `Divider`, `List` and `ListItem`
(with a badge), `SummaryRow` (compact), `UpdateCard`, `TopBar`,
`MoreLine`, `EmptyState`, `OnkkoLine`, and `Button` (secondary for Skip,
text for "Show more"), each with its stories.

## Acceptance

1. At 390 px each state matches its frame in "App flows".
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut.
3. Only categories with something new render, and only the dividers above
   them.
4. A category opens its page; a row opens its item with the Resume tab lit;
   Skip opens the map on the frontier or the focus.
5. Choosing an update in Updates re-measures from its month.
6. No quests, no Nightwave, no suggested goal anywhere on the screen.
7. With the Ordis fixture (Mastery Rank 2), a category's page shows only what
   is in reach and ends in its More line, and "{n} New" counts both. With no
   `PlayerLevel` and no `Missions[]`, nothing is counted away (BR-59,
   BR-61).
8. `pnpm check` passes, with tests for which categories render, for the
   row's lines and for what the More line counts.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
