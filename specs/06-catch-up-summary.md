# 06 · Catch me up: Summary

The answer to "what did I miss?": everything added to the arsenal and the
collection since the update the player last played, in groups, each counting
what is new. From here the player opens any item to see how to get it, or
presses Next to go to the map.

## Frames

- [`257:653` Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=257-653):
  the default, every group closed.
- [`206:774` Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-774):
  every group open.
- [`264:67`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=264-67):
  the last-played card open on the update list.
- [`257:1090` Featured card](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=257-1090):
  the card when the player is up to date.

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`474:778` Summary — Nothing new](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-778): the card, then the empty state (hourglass, "Nothing new since {Mon}, {year}", "The arsenal and the collection are as you left them."), Onkko's line and Next; no lead, no divider, no group.

Drawn on 2026-10-08 under **Documented states**, for BR-61:

- [`533:4813` Summary — Beyond reach](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=533-4813): the first open group ends in the More line.

## Rules

- [BR-11](../docs/business-rules.md#br-11--say-plainly-where-the-game-stands-now):
  the up-to-date card.
- [BR-12](../docs/business-rules.md#br-12--everything-new-that-the-sources-record):
  everything new a source dates, and nothing it does not.
- [BR-13](../docs/business-rules.md#br-13--the-last-played-card-opens-the-update-list):
  the card opens the update list.
- [BR-14](../docs/business-rules.md#br-14--groups-start-closed): groups start
  closed; the chevron points down closed and up open.
- [BR-15](../docs/business-rules.md#br-15--no-mastered-or-rank-here-only-new):
  no Mastered or Rank here, only NEW.
- [BR-59](../docs/business-rules.md#br-59--what-the-player-can-reach) and
  [BR-61](../docs/business-rules.md#br-61--a-group-shows-what-is-in-reach-and-counts-the-rest):
  a group's tiles are what the player can reach; the rest is counted.
- [BR-16](../docs/business-rules.md#br-16--what-each-arsenal-group-holds):
  what each Arsenal group holds.
- [BR-35](../docs/business-rules.md#br-35--catch-me-up-is-what-the-summary-draws):
  Arsenal and Collection, and nothing else.
- [BR-36](../docs/business-rules.md#br-36--from-the-summary-an-item-or-next-to-a-place):
  an item, or Next to a place.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances) (the tab
  bar follows the entrance),
  [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons)
  (category icons), [BR-43](../docs/business-rules.md#br-43--one-date-format-mar-2026)
  (the date).

## What the screen does

Route `/catch-up` with a month chosen (`wf_since`). From the top, as `257:653`
draws it:

1. The header with the player chip; the tab bar only after the tab's entrance
   (BR-41).
2. **Summary**, and the lead "This is what shipped since you left off. Pick one
   and go for it." once the frame carries it.
3. The **last-played card**: the update's art, "You last played", its name and
   "Update {version} · {Mon}, {year}", and a chevron.
4. The **Arsenal** divider and its groups: Warframes, Weapons, Companions,
   Vehicles (BR-16).
5. The **Collection** divider and its groups: Resources, Relics, Mods, Arcanes,
   Incarnons, Ephemera, Honoria.
6. Onkko's line, "We are prepared to provide.", and **Next**.

### A group

A row with the category's game icon (BR-42), its name, "{n} NEW" in the accent
colour and a chevron. Closed by default (BR-14). Opening it shows a rail of
tiles that scrolls sideways (`206:774`); closing it hides the rail. Each group
opens and closes on its own.

The rail holds what is new and in the player's reach (BR-59). What is new and
beyond it is not drawn: the open group ends in a More line that says how
many, of what, and what stands in the way, "4 more primary weapons need
Mastery Rank 8 or higher. You are Mastery Rank 5." (BR-61), and opens
nothing.
"{n} NEW" counts both. A group whose new things are all beyond reach renders
with only the More line.

A group with nothing new does not render, and a divider with no group under it
does not render either. The frames draw every group with sample data; which
groups appear is the data's (BR-12, BR-33). Today Resources, Incarnons,
Ephemera and Honoria have no dated source, so they never appear.

### A tile

The item's art, its name in the display face, and under it the first line of
the item's own Summary (`briefOf()`, spec 09): the reading in gold, "~{n} Runs ·
Rotation {x}" (BR-56) and the place under it ("Saya's Visions · Shrine Defense"). A line
the data does not have is left out, never filled with a placeholder; the
collection tiles in the frame show only the place. No Mastered or Rank marker
(BR-15). The tile opens the item's page, with the Resume tab as its origin
(spec 04).

### The last-played card

- The chevron opens the update list over the page (`264:67`): the page dims,
  the chevron points up, and the list shows the other updates newest first,
  five at a time, then "Show {n} older updates". Choosing one sets `wf_since`
  and reloads the Summary from that month. Closing the card, or a click outside,
  dismisses the list.
- When the player is up to date (BR-11) the eyebrow reads "You're up to date"
  in the accent colour (`257:1090`), with the newest update's name and date.

### Next

Opens the map on the frontier, or on the focus when there is no frontier
(BR-36). It is the only way on besides a tile.

## States

| State                        | Frame                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Every group closed (default) | `257:653`                                                                       |
| One or more groups open      | `206:774`                                                                       |
| Update list open             | `264:67`                                                                        |
| Something new beyond reach   | The open group ends in `More line` (`526:117`, BR-61)                           |
| Up to date                   | `257:1090`                                                                      |
| Nothing new since the month  | The card, the empty state, Onkko's line and Next; no lead, no divider, no group |

## Data and sources

- What shipped: `releasesSince()` and `shelfOf()` in
  `src/lib/catalog/releases.ts`, from `releaseDate` and `introduced` in
  `@wfcd/items`, and Prime parts for relics (BR-12).
- The tile's lines: the item's plan through `briefOf()` in
  `src/lib/catalog/summary.ts`, the same answer as its page.
- The card: `updateStanding()` and `bannerUpdates()` in
  `src/lib/catalog/updates.ts`; art from `data/vendor/update-art.json`.
- The frontier and the focus: as on Two ways in (spec 03, spec 07).
- Category icons: the wiki, never rehosted.

## Desktop (BR-39)

The title, the card and Next stay one reading column, at most 640 px wide. The
groups use the wider content area, at most 1200 px: from 840 an open group lays
its tiles out as a grid at the frame's tile width instead of a sideways rail. The update list opens as a panel under the card at the
card's width.

## Components

`FeaturedCard` (last played, up to date, open), `UpdateList`, `Divider`,
`GroupRow` (closed, open), `ItemTile` (plain), `Rail`, `MoreLine`, `EmptyState`,
`OnkkoLine`, and `Button` (primary), each with its stories.

## Acceptance

1. At 390 px the screen matches `257:653`, `206:774`, `264:67` and `257:1090`
   in each state.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut; from 840 open
   groups are grids.
3. Only groups with something new render, and only the dividers above them.
4. A tile opens its item with the Resume tab lit; Next opens the map on the
   frontier or the focus.
5. Choosing an update in the list re-measures from its month.
6. No quests, no Nightwave, no suggested goal anywhere on the screen.
7. With the Ordis fixture (Mastery Rank 2), a group shows only what is in
   reach and ends in its More line, and "{n} NEW" counts both. With no
   `PlayerLevel` and no `Missions[]`, nothing is counted away (BR-59, BR-61).
8. `pnpm check` passes, with tests for which groups render, for the tile's
   lines and for what the More line counts.

## Divergences from the code

| Today                                                    | The frames and rules                             |
| -------------------------------------------------------- | ------------------------------------------------ |
| A Quests rail above the shelves                          | No quests (BR-35)                                |
| `RunningNow` (Nightwave) and `PickUp` (a suggested goal) | Neither (BR-35)                                  |
| A link to the map with no place chosen                   | Next to the frontier or the focus (BR-36)        |
| Titled "Catch me up"                                     | "Summary", with the lead                         |
| Tiles with other lines                                   | The gold reading and the place, from `briefOf()` |
| The banner carries "Clear"                               | No Clear                                         |
| The full month name                                      | "Mar, 2026" (BR-43)                              |
| `gearNone`, "Nothing new in the arsenal since then."     | The empty state of `474:778`                     |
| Always inside the shell                                  | The tab bar follows the entrance (BR-41)         |

## Does not travel

`PickUp`, `RunningNow`, the Quests rail, `pickUpGoal` in
`src/lib/graph/pickup.ts`, and the worldstate's Nightwave read.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
