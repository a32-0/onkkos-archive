# 07 · Map

The game's map, one place at a time, and what each place holds for this
player. The map is a menu: the place on view, how much of it is mastered, and
its categories. A category opens its own page, which by default shows what is
left to get there; the player can switch to what they have already mastered,
or to what is new since they last played. It opens where the player left it,
or where they should start.

## Frames

- [`662:5177` Map](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-5177): the menu, scrolled whole.
- [`662:6188` Map — Viewport](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6188): the menu as a phone shows it, the content
  stopping 8 px above the tab bar.
- [`656:211` Place overview](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=656-211): the place, In progress and Mastered.
- [`662:6837` Map>Warframes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6837): a category's page, To get chosen.
- [`662:6528` Locations](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6528): the place list, a page.
- [`662:6556` Systems](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6556): the system list, a page.

Drawn in "App flows" on 2026-10-18 (T-27b), from the states this spec
describes. Their texts are sample values:

- [`676:5901` Map — No month](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-5901): no date on the card, no New anywhere.
- [`676:5988` Map — Everything mastered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-5988): the mastered place, then the
  empty state (explore, "Nothing left on {place}", "Every item it gives is
  mastered. Choose another place from the card above.").
- [`676:6098` Map>Warframes — Mastered chosen](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-6098): View with Mastered
  chosen.
- [`676:6158` Map>Warframes — Beyond reach](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-6158): the page ends in the More
  line, by rank.
- [`676:6220` Map>Warframes — Nothing to get](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-6220): To get chosen, the empty
  state (explore, "Nothing left to get on {place}", "You have everything it
  gives so far. What it adds later shows up here.").
- [`676:6285` Map>Warframes — Nothing mastered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-6285): Mastered chosen, the
  empty state ("Nothing mastered on {place} yet", "What you master from this
  place shows up here.").
- [`676:6350` Map>Warframes — Nothing new](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=676-6350): New chosen, the empty state
  ("Nothing new on {place}", "No item from this place came out after the
  update you chose.").
- [`677:6385` Locations — New player](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6385): the place list up to the
  frontier, then the More line.
- [`677:6457` Locations — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6457): the search with no hit: the empty
  state (explore, "No place by that name", "None of {system}’s places is
  called “{query}”. Try another system.").
- [`677:6512` Locations — Beyond reach](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6512): a search hit beyond reach, its
  gap in place of the count.

## Rules

- [BR-05](../docs/business-rules.md#br-05--set-a-goal-runs-on-frontier-and-focus)
  and [BR-44](../docs/business-rules.md#br-44--start-here-marks-the-frontier-or-the-focus):
  the frontier, the focus and Start here.
- [BR-11](../docs/business-rules.md#br-11--say-plainly-where-the-game-stands-now)
  and [BR-13](../docs/business-rules.md#br-13--the-last-played-card-opens-the-update-list):
  the last-played card, shared with the Summary.
- [BR-36](../docs/business-rules.md#br-36--from-the-summary-an-item-or-skip-to-a-place):
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
- [BR-59](../docs/business-rules.md#br-59--what-the-player-can-reach) to
  [BR-62](../docs/business-rules.md#br-62--a-search-shows-everything-and-says-the-gap):
  the lists hold the places and systems in reach, a category's page the items
  in reach, and the rest is counted; the place list's search reaches every
  place.
- [BR-65](../docs/business-rules.md#br-65--the-place-card-shows-what-is-still-to-master-by-kind):
  the place's Still to master here.
- Threads `1933693172` (the system is chosen here, not from the tab bar) and
  `1933718008` (every catalogue: primaries, secondaries, melee…).

## The frontier and the focus

- **The frontier** is the first planet on `star_chart_order` the profile
  cannot prove, by its junction tag or by a played node on it, as accounts
  older than junctions show (`findNextPlanet`).
- **The focus** is for a player with no frontier: the place, in any system,
  with the highest share of its readable arsenal items mastered, short of all
  of them. A tie goes to the earlier place in system order (BR-47), then in
  `star_chart_order`. A player with every readable item mastered everywhere has
  no focus.
- **Start here** is the frontier, or else the focus (BR-44). Skip and the
  Navigation tab's first opening all land on it.

## What the screen does

Route `/system?system=&place=`, inside the shell, the Navigation tab lit. From
the top, as `662:5177` draws it:

1. The header with the player chip, and Onkko's line, "We watch, we
   anticipate, we intercede."
2. The **last-played card** (spec 06, the same component and states), which
   opens Updates and re-measures New from the chosen month. With no month
   kept, the player is taken as up to date: the card reads "You're up to
   date" and names the newest update (owner, 2026-10-16).
3. **Change location** (`Place switcher`): "Change location" as kicker, the
   place's name in the display face and a chevron that opens the place list.
   It, the Updates card above it and Change system on the place list are
   84 px tall at every width. A name too long for one line shrinks its type,
   from the display size down to a floor (16 px here, 14 px for Change
   system, 11 px for an update's name); at the floor it takes a second
   line, and past that ends in an ellipsis; the card never grows (owner, 2026-10-19).
4. The **place** (`Place overview`, `656:211`), on the page and not on a
   card: its sphere in its colour inside a ring that fills counter-clockwise from the top with
   the share of its readable items mastered; under it "{n}/{m}" in the display
   face and "Items mastered". The place counts items alone: a place is
   mastered by its items, never by its nodes, which the game already shows
   (owner, 2026-10-17). While anything is left, one chip per Arsenal category
   with its game icon and the count of its items still to master in reach, in
   the categories' order and with no other word, and "Still to master here"
   under them (BR-65). When every readable item is mastered the ring closes in
   the mastered colour and the chips go (owner, 2026-10-18).
5. The **Arsenal** divider and its categories, one per catalogue: Warframes,
   Primary, Secondary, Melee, Archgun, Archmelee, Amp, Companion, Necramech,
   Archwing, Railjack.
6. The **Collection** divider and its categories: Resources, Relics, Mods,
   Arcanes, Incarnons, Ephemera, Honoria. What a hub hands out is filed under
   the hub's place (owner, 2026-10-16): the Incarnon Genesis of The Circuit at
   Duviri, Honoria at Deimos (La Cathédrale) and Uranus Proxima (Pontis
   Tower), Nightcap's Ephemera at Venus. What only events, the Market or a hub
   off the map hand out has no place here.

Viewing a place writes it to `wf_place` (BR-46).

### A category row

Each divider holds its categories as one grouped list (`List item`): the
catalogue's game icon (BR-42), its name and a chevron, and no count, since
the place above already says what is left (owner, 2026-10-18). An Arsenal
category every item of which is mastered carries the Mastered tag before its
chevron, so the player sees at a glance which are done (owner, 2026-10-19). A category the
place holds nothing of, under any view, does not render, nor a divider left
empty. The row opens the category's page.

### A category's page

Route `/system/{category}?system=&place=`, under the top bar titled with the
category (spec 04), as `662:6837` draws it:

1. Onkko's line, "We are prepared to provide."
2. The place it is about (`Place crumb`): its sphere, "You're on" and
   "{system} > {place}".
3. **View**, a row holding a segmented control: **To get**, **Mastered** and
   **New**, one always chosen, To get first (BR-45). Only an Arsenal category
   has it: what the Collection holds gives no mastery, so a Collection
   category lists everything in reach with no View (owner, 2026-10-18). It is
   the same row as
   Summary and Step by step on an item (spec 09). When the chosen one leaves
   nothing, the empty state that names the place takes the list's place
   (BR-45).
4. The items, one `Summary row` each in a grouped list: the item's art, its
   name without the word its category already says ("Hunhow" under Honoria,
   "Axi A21" under Relics, "Braton" under Incarnons), the reading in gold and
   the place under it, as on the Summary, but read **at this place**: "~{n}
   Runs · Rotation {x}" for the drop here (BR-56), and the node and mission
   that give it. The row carries no state badge; the view chosen says which
   state the list holds. A ranked item short of its maximum reads "Rank
   {n}/{max}" before its place (`662:6837`; owner, 2026-10-18).

Under To get and New the list holds what is in reach, and ends in a More line
that counts the rest by rank alone, the place being on view: "4 more primary
weapons need Mastery Rank 8 or higher. You are Mastery Rank 5." (`676:6158`,
BR-61). A category with nothing in reach and something beyond holds only the
line. A place beyond reach opened on purpose shows whole (BR-60).

A row opens the item's page, with Navigation as its origin (spec 04).

### The place list

Change location opens `662:6528`, a page under the top bar (spec 04):

1. Onkko's line, "Ah, the history you will have.", then **Choose a location**
   in the screen titles' 36 (`.numeral`; owner, 2026-10-23), and "You can switch at any time."
2. The **system card**: the system's sphere, "Change system" and its name,
   and a chevron that opens the system list.
3. A search field, "Search a planet, location or celestial body...", which
   filters the list by name as the player types. It reaches every place of
   the system; a place beyond reach shows as the Beyond reach row
   (`526:112`), the gap in place of its count: "Clear the Venus Junction, on
   Earth, to reach it." or, for the Dojo, "Join a clan to enter its Dojo."
   (BR-59, BR-62).
4. The system's places in reach (BR-59, BR-60), in `star_chart_order`, as one
   grouped list, each with its sphere, its name and "{n}/{m} Mastered", or the
   **Mastered** tag in its place when all are. A place may also carry **Start
   here** (BR-44) and **New items** when it holds something new since the
   month (owner, 2026-10-17). A row carries one tag at most, at its end:
   Mastered, else Start here, else New items (owner, 2026-10-18). The place
   on view is highlighted, and stays
   listed while on view even beyond reach. Then, when any place is beyond, one
   More line, a single paragraph: "3 more places open as you clear the
   junctions. Next: the Venus Junction, on Earth.", or, with the Dojo among
   them, "… as you clear the junctions and join a clan. Next: …".

Choosing a place returns to the map, on that place.

### The system list

The system card's chevron opens `662:6556`, a page under the top bar whose
back returns to the place list: Onkko's line, **Choose a system**, "You can
switch at any time.", and the systems in BR-47's order as one grouped list,
each with its symbol (a large orb and a small one beside it, its satellite;
the owner, 2026-10-08): its first place's sphere, and its second place's as
the satellite, or the neutral sphere when it has no second place, as every
`System row` draws one (owner, 2026-10-17), its name and how many of its
places are mastered, "{n}/{m} Mastered", counting the places that hold an
item (owner, 2026-10-19), or the Mastered tag when all are, **Start here** on the system that holds it, and the system on view
highlighted. Only the systems with a place in reach are listed, then a More
line, "2 more systems open as you go further." (BR-60). Tau reads "Soon™",
cannot be chosen, and shows disabled, dimmed (owner, 2026-10-18). Choosing a system returns to the place list, now listing
that system's places.

## States

| State                               | What shows                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| A category's page, To get (default) | What is left (BR-45)                                                             |
| Mastered or New chosen              | Only that                                                                        |
| The chosen view leaves nothing      | View, then the empty state that names the place (BR-45)                          |
| No month (`wf_since` unset)         | No New option, no New tag on places; the card reads "You're up to date", no date |
| Everything mastered                 | The ring closed in the mastered colour, no chips, then the empty state           |
| Search with no match (place list)   | The empty state under the field                                                  |
| Places or systems beyond reach      | The lists end in `More line` (`526:117`, BR-60)                                  |
| A hit beyond reach (place list)     | `Place row` Beyond reach (`526:112`, BR-62)                                      |
| Items beyond reach in a category    | The page ends in `More line` (BR-61)                                             |
| A place beyond reach on view        | The place whole, still listed while on view (BR-60)                              |

## Data and sources

- Places and systems: `data/systems.yaml` and the place index
  (`src/domain/place/`), with node names from `warframe-worldstate-data`.
  `systems.yaml`'s `hubs` maps a hub to its place, for what a hub hands out
  (`src/domain/place/hubs.ts`).
- A system's symbol: its first place's sphere, its second place's as the
  satellite, the neutral sphere without one.
- What a place holds and each row's reading: the place index's tiles
  (`src/domain/place/tile.ts`) over DE's drop tables and the wiki's modules.
- Item state: `src/domain/place/state.ts` (`done | ranked | absent | unknown`),
  from `XPInfo`.
- New: `releasesSince()` from the month in `wf_since`.
- The frontier: `findNextPlanet`; the focus: `findFocus` beside it, as
  defined above, with tests. Start here: `startHere()` in
  `src/domain/place/start-here.ts`, built with Two ways in (spec 03).
- Reach: one predicate in `src/domain/place/reach.ts` over `reachedPlaces`,
  the `after` of `off_chart_places`, `PlayerLevel` and the catalog's
  `masteryReq` (BR-59).
- Art and icons: items' art from `@wfcd/items` and the categories' icons
  from the wiki, never rehosted; a category with no wiki icon takes a
  Material Symbol (BR-42). A place's sphere is drawn from its colour in
  `systems.yaml`'s `colors` (owner, 2026-10-17). A place outside Origin
  takes the lit side of its art on the wiki, made more vivid. Origin's
  places blend that art with the colour a player already has in mind (Earth
  blue, Mars rust, Kuva Fortress Kuva red, Eris Infested green) and stay
  apart from one another in hue or lightness. Höllvania (electric green, as
  1999's art), Sanctuary (Tenno cyan) and the Dark Refractory (infernal red)
  were chosen by the owner.

## Desktop (BR-39)

- 840 to 1199: one column as drawn; a category's page, the place list and the
  system list stay one centred column at the frame's width.
- 1200 and up: two panes. The left pane is the place list, always open, with
  the system card and its search (`662:6528` without its top bar). The right
  pane is the map. The system list still opens from the system card.

## Components

`PlaceSwitcher`, `PlaceOverview` (in progress, mastered), `PlaceCrumb`,
`List`, `ListItem`, `SummaryRow` (compact), `ControlRow` (View),
`Segmented` (one chosen), `PlaceRow` and
`SystemRow` (plain, on view, Start here, New, Mastered, Soon; `PlaceRow`
also beyond reach), `MoreLine`, `SearchField`, `Badge` (Start here, New,
Mastered), `Divider`, `FeaturedCard`, `TopBar`, `EmptyState`, each with
its stories.

## Acceptance

1. At 390 px each state matches its frame in "App flows".
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut; from 1200 the
   place list is a pane.
3. A category's page opens on To get and shows only what is left; Mastered
   and New show only theirs; one option is always chosen.
4. Start here sits on exactly one place, and on its system; Skip and the
   first Navigation tab land there.
5. The Navigation tab reopens the last place viewed.
6. Tau cannot be opened.
7. With the Ordis fixture, the place list holds the places up to the frontier
   and the ones off the chart after them, then the More line; the system
   list holds the systems with a place in reach; a category's page holds only
   what is in reach. A search in the place list finds a place beyond reach and
   shows its gap; opened, it shows whole (BR-59 to BR-62).
8. With no `Missions[]` and no `PlayerLevel`, every place, system and item
   shows and no More line renders.
9. `pnpm check` passes, with tests for the focus, the view, reach and
   `wf_place`.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
