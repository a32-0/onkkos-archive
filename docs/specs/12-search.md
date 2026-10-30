# 12 · Search

Approved by the owner on 2026-10-21 and built by
[T-34](../history/tasks/T-34-advanced-search.md) the same day.

Goal's search answers a name in eight rows. This page answers a narrower
question: "the Mods I have not got", "the relics still dropping", "what is in
my reach on Deimos". The player names a term, a filter, or both, and the
results stay on the same screen as the filters.

## Frames

Drawn in "App flows" on 2026-10-21, after the Goal frames, and adjusted by
the owner the same day: the title "Advanced search", the button on Goal in
the text style, the filters folding under a chevron, and the count as a
divider's label. Their texts are sample values:

- [`752:4545` Goal — Advanced search](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=752-4545): Goal's search card with **Advanced search**, in
  the text style, under Continue.
- [`753:4593` Search](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=753-4593): the page at rest, the filters open and the first results.
- [`753:5217` Search — Filtered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=753-5217): two filters chosen; the filters fold into one row that
  names them, and the results take the screen.
- [`753:5317` Search — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=753-5317): the empty state under the filters.

On the Design System page, a new component, [`751:542` Filter chip](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=751-542)
(Off, On, Focus), bound to the same tokens as `Segmented`.

## Rules

- [BR-53](../business-rules.md#br-53--the-search-suggests-as-the-player-types)
  and [BR-62](../business-rules.md#br-62--a-search-shows-everything-and-says-the-gap):
  the same index, the same closeness and the same gap as Goal's search.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  never wider than 600 px.
- [BR-68](../business-rules.md#br-68--a-filter-narrows-and-never-hides-why):
  a filter narrows and never hides why. A result beyond reach stays in the
  list with its gap unless "In my reach" is chosen.

## What the screen does

Route `/search`, inside the shell, with the Goal tab lit. It opens from
**Advanced search** on Goal, carrying the term already typed (`/search?q=ash`).
Every filter lives in the address (`/search?q=em&type=mods&state=absent&reach=1`),
so Back returns to the same results and a search can be shared.

From the top:

1. `Top bar`, "Advanced search", with Back, which returns to Goal.
2. Onkko's line, Goal's own: "Every choice closes off an infinite number of
   possible futures."
3. The `Search field`, filled with the term carried from Goal; the results
   follow a quarter of a second after the player stops typing.
4. **Filters**, open at rest, its title with a chevron that folds it:
   - **Type**, one or more `Filter chip`s: Warframes, Weapons, Companions,
     Vehicles, Mods, Arcanes, Relics, Resources, Other, Places, Quests.
     None chosen means all of them.
   - **State**, one chip at a time: All, Not obtained, Ranking, Mastered. The
     hero's states (BR-17); it narrows to what the profile can tell, so a
     state chosen leaves out places, quests and resources.
   - **In my reach** and **Hide vaulted**, each a `Checkbox`.
   - **Clear**, in the text style, when anything is chosen; the desktop
     column draws it beside the title.
5. The count, "128 results", as the label of a `Divider`.
6. The results: `ResultList`, the `Suggestion row`s as links in the
   `Suggestion list`'s frame, best first (spec 08), 20 at a time, then
   **Show more** in the text style, which adds twenty and keeps the scroll.
   A place has no art of its own, so its row wears its orb, the sphere the
   map draws from its colour in `systems.yaml` (spec 07), never an empty
   circle. Decided on 2026-10-30 and drawn in
   [`928:5861` Search — Place](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=928-5861), approved by the owner the same day.

The chevron folds the filters into one row: "Filters", how many are on ("2
on"), and the ones chosen under it ("Mods, In my reach"), with a chevron that
opens them again. The page opens folded when its address already carries a
filter. A chip or a box changes as it is pressed, while the results load.

The term may be empty: filters alone list everything they hold, by name.

## States

| State        | What shows                                                              |
| ------------ | ----------------------------------------------------------------------- |
| At rest      | The field, the filters open, every result by name                       |
| Filtered     | The folded row naming the filters, the results                          |
| No match     | `Empty state`: "Nothing matches.", "Clear a filter or change the term." |
| Beyond reach | `Suggestion row` Beyond reach, with its gap (BR-62)                     |
| Loading      | The rows already shown stay until the new ones arrive                   |

## Data and sources

- The page reads its results on the server, from the address, through
  `targetInputs()` in `src/app/targets.ts`, the same reading Goal's
  `/api/search` makes; the page never ships the whole index, only the rows
  it shows.
- The type groups map onto `CATALOGUES` in `src/content/goals.ts`: Weapons
  holds Primary, Secondary, Melee, Archgun, Archmelee, Amp and Incarnon;
  Vehicles holds Archwing, Necramech and Railjack; Other holds Ephemera,
  Honoria and the rest, Kitgun parts and Misc items among them.
- The state comes from the profile, as the hero reads it; vaulted from the
  relic and Prime data the catalog already holds.
- Copy lives in `src/content/search.ts`.

## Components

`TopBar`, `OnkkoLine`, `SearchField`, `FilterChip` (new), `Checkbox`,
`Button` (text), `Divider`, `ResultList` (new), `EmptyState`, and on Goal
`Button` (text).

## Settled by the owner

- The page opens from Goal only, for now; the map's category pages and
  Resume's search may open it later.
- No sorting: the results keep the search's own order, by closeness and then
  by reach, and by name when no term is given.
