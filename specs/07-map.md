# 07 · Map

The game's map, one place at a time, and what each place holds for this
player. By default it shows what they still have left to get there; they can
switch to what they have already mastered, or to what is new since they last
played. It opens where the player left it, or where they should start.

## Frames

- [`312:199` Navigation](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=312-199):
  the default, every group closed.
- [`212:159` Navigation](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=212-159):
  every group open.
- [`299:597` Planet Details](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=299-597):
  the place card when everything here is mastered.
- [`215:610`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=215-610):
  the place list, a full-screen sheet.
- [`270:786`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-786):
  the system list, a full-screen sheet.
- [`257:1124`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=257-1124)
  and [`269:364`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=269-364):
  the item tile, Mastered and Rank.

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`474:1160` Navigation — Mastered chosen](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-1160): Show with Mastered chosen.
- [`474:1404` Navigation — No month](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-1404): no New option and no "{n} New" counts.
- [`474:1648` Navigation — Everything mastered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-1648): the mastered card, then the empty state (explore, "Nothing left on {place}", "Every item it gives is mastered. Choose another place from the card above."); no Show, no group.
- [`474:1927` Navigation Menu — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-1927): the place list's search with no hit: the empty state (explore, "No place by that name", "None of the {system}'s places is called “{query}”. Try another system."). The sample query is a place of another system.

## Rules

- [BR-05](../docs/business-rules.md#br-05--set-a-goal-runs-on-frontier-and-focus)
  and [BR-44](../docs/business-rules.md#br-44--start-here-marks-the-frontier-or-the-focus):
  the frontier, the focus and Start here.
- [BR-11](../docs/business-rules.md#br-11--say-plainly-where-the-game-stands-now)
  and [BR-13](../docs/business-rules.md#br-13--the-last-played-card-opens-the-update-list):
  the last-played card, shared with the Summary.
- [BR-14](../docs/business-rules.md#br-14--groups-start-closed): groups start
  closed.
- [BR-36](../docs/business-rules.md#br-36--from-the-summary-an-item-or-next-to-a-place):
  the map is where both features end.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons),
  [BR-43](../docs/business-rules.md#br-43--one-date-format-mar-2026).
- [BR-45](../docs/business-rules.md#br-45--the-map-shows-what-is-left-mastered-and-new-are-the-two-lenses):
  what is left by default; Mastered and New.
- [BR-46](../docs/business-rules.md#br-46--the-map-reopens-where-the-player-left-it):
  where the map opens.
- [BR-57](../docs/business-rules.md#br-57--the-dojo-is-a-place-in-the-origin-system):
  the Dojo, a place in the Origin System for everything researched.
- [BR-47](../docs/business-rules.md#br-47--the-systems-in-the-frames-order):
  the systems and their order.
- Threads `1933693172` (the system is chosen here, not from the tab bar) and
  `1933718008` (every catalogue: primaries, secondaries, melee…).

## The frontier and the focus

- **The frontier** is the first planet on `star_chart_order` whose junction the
  profile cannot prove (`findNextPlanet`).
- **The focus** is for a player with no frontier: the place, in any system,
  with the highest share of its readable arsenal items mastered, short of all
  of them. A tie goes to the earlier place in system order (BR-47), then in
  `star_chart_order`. A player with every readable item mastered everywhere has
  no focus.
- **Start here** is the frontier, or else the focus (BR-44). Next, Skip and the
  Navigation tab's first opening all land on it.

## What the screen does

Route `/system?system=&place=`, inside the shell, the Navigation tab lit. From
the top, as `312:199` draws it:

1. The **last-played card** (spec 06, the same component and states), whose
   list re-measures New from the chosen month.
2. The **place card**: the system's name as kicker, the place's name and a
   chevron that opens the place list; the place's art; **Nodes**, with "{n}/{m}
   Normal" and "{n}/{m} Steel Path"; "{n}/{m} Items mastered" and a bar filled to
   that share. When every readable item is mastered the line takes the
   **Mastered** badge and the bar turns to the mastered colour (`299:597`).
3. **Show**, with **Mastered** and **New** (BR-45).
4. The **Arsenal** divider and its groups, one per catalogue: Warframes,
   Primary, Secondary, Melee, Archgun, Archmelee, Amp, Companion, Necramech,
   Archwing, Railjack.
5. The **Collection** divider and its groups: Resources, Relics, Mods, Arcanes,
   Incarnons, Ephemera, Honoria.
6. Onkko's line, "We watch, we anticipate, we intercede."

Viewing a place writes it to `wf_place` (BR-46).

### A group

As on the Summary: the catalogue's game icon (BR-42), its name, "{n} New" when
the place holds something new since the month, and a chevron; closed by
default, a sideways rail of tiles when open (`212:159`). What a group holds
follows the lens (BR-45); a group or divider with nothing to show does not
render.

### A tile

The item's art, its name, the reading in gold and the place under it, as on
the Summary, but read **at this place**: "~{n} Runs · Rotation {x}" for the
drop here (BR-56), and the node and mission that give it. Over the art, the item's state
for this player:

| State                        | Badge                    | Frame      |
| ---------------------------- | ------------------------ | ---------- |
| Mastered                     | **Mastered**, green      | `257:1124` |
| Ranked, short of its maximum | **Rank {n}/{max}**, blue | `269:364`  |
| Not owned, or cannot be read | None                     | `212:159`  |

A tile opens the item's page, with Navigation as its origin (spec 04).

### The place list

The place card's chevron opens `215:610`, a full-screen sheet with the sheet
header (spec 04):

1. The **system card**: the system's icon, "System" and its name, and a chevron
   that opens the system list.
2. A search field, "Search a planet, location or celestial body...", which
   filters the list by name as the player types.
3. The system's places in `star_chart_order`, each with its art, its name and
   "{n}/{m} Mastered", or the **Mastered** badge in its place when all are. A
   place may also carry **Start here** (BR-44) and **New** when it holds
   something new since the month. The place on view is highlighted.
4. Onkko's line, "Ah, the history you will have."

Choosing a place closes the sheet and opens it.

### The system list

The system card's chevron opens `270:786`: **Choose a system**, "You can switch
at any time.", and the systems in BR-47's order, each with its symbol (a large orb and a
small one beside it, its satellite; the owner, 2026-10-08), its name
and its mastered count or badge, **Start here** on the system that holds it,
and the system on view highlighted. Tau reads "Soon™" and cannot be chosen.
Choosing a system returns to the place list, now listing that system's places.

## States

| State                                | What shows                                                 |
| ------------------------------------ | ---------------------------------------------------------- |
| Default lens                         | What is left (BR-45), groups closed                        |
| Mastered or New chosen               | Only that, groups closed                                   |
| No month (`wf_since` unset)          | No New option, no "{n} New" counts, no New badge on places |
| Everything mastered, no collectibles | The mastered card, then the empty state                    |
| A place with no nodes of its own     | The card without the Nodes lines                           |
| Search with no match (place list)    | The empty state under the field                            |

## Data and sources

- Places and systems: `data/systems.yaml` and the place index
  (`src/lib/place/`), with node names from `warframe-worldstate-data`.
- What a place holds and each tile's reading: the place index's tiles
  (`src/lib/place/tile.ts`) over DE's drop tables and the wiki's modules.
- Item state: `src/lib/place/state.ts` (`done | ranked | absent | unknown`),
  from `XPInfo`.
- Nodes: `Missions[]` and `Missions[].Tier` counted against the node catalog.
- New: `releasesSince()` from the month in `wf_since`.
- The frontier: `findNextPlanet`; the focus: a new function beside it, as
  defined above, with tests.
- Art and icons: the wiki and `@wfcd/items`, never rehosted.

## Desktop (BR-39)

- 840 to 1199: one column as drawn; the two sheets open as panels anchored to
  the chevron that opened them, at the frame's 390 px; open groups lay their
  tiles out as a grid.
- 1200 and up: two panes. The left pane is the place list, always open, with
  the system card and its search (`215:610` without its sheet header). The right
  pane is the last-played card, the place card, Show and the groups. The system
  list still opens from the system card, as a panel.

## Components

`PlaceCard` (in progress, mastered), `ProgressBar` (in progress, mastered),
`Segmented` (none chosen, one chosen), `PlaceRow` and `SystemRow` (plain, on
view, Start here, New, Mastered, Soon), `SearchField`, `Badge` (Start here,
New, Mastered, Rank), `ItemTile` (plain, Rank, Mastered), `GroupRow`, `Rail`,
`Divider`, `FeaturedCard`, `Sheet`, `EmptyState`, each with its stories.

## Acceptance

1. At 390 px each state matches `312:199`, `212:159`, `299:597`, `215:610`,
   `270:786`, `257:1124` and `269:364`, with the corrected Show control and
   chevrons.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut; from 1200 the
   place list is a pane.
3. By default only what is left shows; Mastered and New show only theirs, and
   choosing the chosen one again returns to the default.
4. Start here sits on exactly one place, and on its system; Next, Skip and the
   first Navigation tab land there.
5. The Navigation tab reopens the last place viewed.
6. Tau cannot be opened.
7. `pnpm check` passes, with tests for the focus, the lens and `wf_place`.

## Divergences from the code

| Today                                                | The frames and rules                                  |
| ---------------------------------------------------- | ----------------------------------------------------- |
| All / Missing / New, All by default                  | What is left by default; Mastered / New (BR-45)       |
| A drawer "Where to" with systems and places together | The place list and the system list, two sheets        |
| Opens on the system's first place                    | The last place viewed, else Start here (BR-46)        |
| No focus                                             | The focus, as defined above                           |
| The tile's state as built                            | The Mastered and Rank badges of `257:1124`, `269:364` |
| The suggested goals on the map                       | None; goals live on Goal (spec 08)                    |
| A note that the collection cannot be read            | No note (never explain the machine)                   |
| Pom-2 PC after Empyrean Proxima; "Soon"              | BR-47's order; "Soon™"                                |
| No Dojo                                              | The Dojo in the Origin System (BR-57)                 |
| "No location matches that." in the drawer            | The empty state of `474:1927`                         |

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
