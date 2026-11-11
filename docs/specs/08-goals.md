# 08 · Plan

Where a player picks one thing to chase. They can take one of the suggested
goals, or search by name for anything the app knows how to get, and the app
opens the steps to it.

## Frames

- [`662:4811` Plan](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-4811).

Their texts are sample values; on 2026-11-08 every frame gained the Milestones
divider, the Mastery Rank card and Advanced search, with the cards the app shows
for the demo player Cy (Next planet: Ordis):

- [`675:5962` Plan — Results](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5962): typing, the suggestion list under the field.
- [`675:5989` Plan — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5989): typing, "Nothing by that name."
- [`675:6049` Plan — Every goal done](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-6049): the search card, then the empty state (flag, "Nothing left to suggest", "You've done every suggestion. Search above for anything else.") where the goal cards would be.
- [`675:6022` Plan — Beyond reach](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-6022): the last match beyond reach, after those in reach, with its gap.
- [`1001:7542` Plan — Mastery Rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1001-7542), [`1009:7199` — Test ready](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7199) and
  [`1009:7275` — Highest rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7275): the Mastery Rank card first among the
  suggestions, and gone at the highest rank (BR-78).
- [`1142:7324` Plan — Milestones](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1142-7324), [`1142:7408` — After The New War](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1142-7408) and
  [`1142:7500` — After Jade Shadows](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1142-7500): a Mastery Rank 9 player before The New War, then
  after it, then after Jade Shadows; each wall waits for the one before it (BR-86).
- [`1165:8337` Plan>Milestones reached](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1165-8337): the milestones the profile proves done, on a page of their own (`/goals/milestones`), opened from a `List item` under the cards (BR-86).
- [`675:6088` Plan — Next planet](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-6088): a player with a frontier, "Unlock the next planet" first with its flag and the junction it needs.

## Rules

- [BR-05](../business-rules.md#br-05--plan-runs-on-frontier-and-focus):
  the goals offered follow the frontier and the focus.
- [BR-37](../business-rules.md#br-37--a-goal-opens-the-steps-of-what-it-names):
  a goal opens the Step by step of what it names, a quest's and a game mode's
  included; a place opens the map.
- [BR-53](../business-rules.md#br-53--the-search-suggests-as-the-player-types):
  the search suggests as the player types.
- [BR-54](../business-rules.md#br-54--build-a-necramech-names-the-one-the-player-lacks):
  the Necramech the player lacks.
- [BR-59](../business-rules.md#br-59--what-the-player-can-reach) and
  [BR-62](../business-rules.md#br-62--a-search-shows-everything-and-says-the-gap):
  the search reaches everything and says the gap; a goal beyond reach is not
  offered.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-42](../business-rules.md#br-42--the-placeholder-circles-are-the-games-icons).
- [`deferred.md`](../deferred.md): Mastery Rank, syndicate and Intrinsics
  goals are not in this version.

## What the screen does

Route `/goals`, inside the shell, the Plan tab lit. A new player lands here
from `/connect` (BR-03). From the top, as `662:4811` draws it:

1. Onkko's line, "Every choice closes off an infinite number of possible
   futures."
2. **Plan**, and "Search for anything you want, or take a suggestion. Onkko
   lays out the steps in order."
3. **Search for anything**: "Warframes, weapons, companions, mods, arcanes,
   relics, resources, quests and places.", which names what the search reaches now
   that the catalog holds every sourced resource ; the field, "A warframe, a
   weapon, or planet"; **Continue**; and **Advanced search**, in the text style,
   which opens spec 12's page with the term typed (`752:4545`).
4. The goal cards, each a link with its icon, title and one line.
5. **Skip**, in the secondary style, which opens the map on Start here
   (BR-40), as `662:4811` draws it since 2026-10-16.

### The search (BR-53)

- From the second character, a list opens under the field: up to eight
  matches, best first, each a row with its icon, its name and its catalogue.
  The list reuses the place list's row (spec 07) in a compact form. It has
  no screen frame of its own: it is the `Suggestion list` component, and
  `675:5962` draws it in place.
- It reaches only what has a known source: an arsenal item, a mod, arcane,
  resource or other entry with a drop, a region or a vendor, every relic,
  every quest of the narrative spine, with its art and "Quest" as its
  catalogue, and every place. About 8,000 cosmetics with no source never appear.
- Among matches as close to the name, what is in the player's reach comes
  first; a closer name is never pushed down by reach, so "ash" finds Ash
  first. The closeness: the exact name, then a name
  that starts with the term, then a word that starts with it, then the term
  inside a word. A match beyond reach is the
  Beyond reach row (`526:107`): its catalogue, then the gap, "Sniper · Needs
  Mastery Rank 8, you are 5", "Place · Clear the Venus Junction, on Earth" or
  "Place · Join a clan" (BR-62).
- Choosing a row opens it: a place opens the map on it (BR-37), anything else
  its item page with Plan as its origin (spec 04). An item beyond reach opens
  with Step by step chosen (BR-62). **Continue** opens the first
  row. With no match, the list shows one line, "Nothing by that name.", and
  Continue does nothing.
- The list closes on Escape, on a click outside, and when the field is
  cleared. It is keyboard-navigable and announced as a list box.

### The Mastery Rank card (BR-78)

The cards sit under a `Divider` labelled "Milestones". Before every goal
card, the `Rank card`: the next rank's seal ("9", "30", or "L1" for a
Legendary rank, in `Display/Heading`), "Reach Mastery Rank {n}" in the accent, and the line
that says what takes the player there:

| The way                            | Line                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Items already ranked close the gap | "Ranking Lex and Boltor takes you there."                                      |
| They do not, or nothing is left    | "Each new weapon you take to rank 30 covers about half of what is left."       |
| The bar is full                    | Title "Take the Rank {n} test", "Your bar is full. Take the test in the game." |

It opens the Mastery Rank goal (`/goals/rank`, spec 10). At the highest rank,
or with no `XPInfo`, there is no card.

### The goal cards

The curated goals in `data/grafo.yaml`, except the deferred ones:

| Goal                                                       | Card title                                                                   | Opens                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `unlock_next_planet`                                       | "Unlock the next planet"                                                     | The map on the frontier                                    |
| `build_necramech`                                          | "Build a Necramech"                                                          | The Step by step of the Necramech the player lacks (BR-54) |
| `build_helminth`                                           | "Build the Helminth"                                                         | The Step by step of the Helminth Segment                   |
| `unlock_1999`                                              | "Play the Hex Quest"                                                         | The Step by step of The Hex quest                          |
| `play_new_war`, `play_jade_shadows`, `play_constellations` | "Play The New War", "Play Jade Shadows", "Play Jade Shadows: Constellations" | The quest's Step by step                                   |
| `hunt_archon`                                              | "Hunt an Archon"                                                             | The Step by step of the Archon Hunt                        |
| `unlock_steel_path`                                        | "Unlock The Steel Path"                                                      | The Step by step of The Steel Path                         |
| `hunt_kuva_lich`                                           | "Hunt a Kuva Lich"                                                           | The Step by step of the first Kuva weapon lacking          |

What each waits for, what proves it done and its icon are BR-86.

- A goal the profile already proves done is not offered: no frontier hides
  the first, every Necramech owned hides the second, and the quest confirmed
  by `quest_evidence.yaml` hides the third.
- A goal that names an item beyond the player's reach is not offered
  (BR-59): the Necramech when its rank or its place is beyond. A quest has no
  reach, so "Play the Hex Quest" follows only the rule above. The search
  still reaches everything.
- Order: the goal on the frontier or the focus first (BR-05), then by Mastery
  Rank band (`suggestedGoals`).
- A goal waits for what `after`, `after_quests`, `after_nodes` and
  `mastery_rank` name before it is offered (BR-86). A Necramech or a Kuva
  Lich is done once the player owns one; the Helminth once the player has used
  one of its own abilities.
- Each card carries its own icon, as the frames draw it (BR-86), and its line
  says what the player gets.
- The card's line lives in `src/content/goals.ts`, as every string does:
  the lines of the walls are BR-86's frames, the Necramech's and the Hex's
  included, which said what the player gets from 2026-11-08 on; "Unlock the next
  planet" names the junction the frontier needs, "Clear the Mars Junction, on
  Earth, to open the next planet.".

## States

| State            | What shows                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------- |
| At rest          | The search card and the goals offered                                                     |
| Typing, matches  | The list under the field                                                                  |
| Typing, no match | "Nothing by that name."                                                                   |
| A match beyond   | `Suggestion row` Beyond reach (BR-62)                                                     |
| Every goal done  | The search card, then the Mastery Rank card, or the empty state when there is none either |

## Data and sources

- Search: `GET /api/search?q=` over `src/domain/catalog/search.ts`, so the page
  never ships the whole index.
- Goals: `data/grafo.yaml` through `suggestedGoals()`; the frontier and the
  focus as in spec 07. What is offered and what is done are worked out once,
  in `goalState()` (`src/app/goals/goals.ts`), for Plan and for
  `/goals/milestones` alike.
- Necramechs: the catalog's Necramech category against `XPInfo`
  (`lackingNecramechs()` in `src/domain/catalog/necramechs.ts`).
- Kuva weapons: the catalog's names that start "Kuva " against `XPInfo`
  (`lackingNamed()` in `src/domain/catalog/lacking.ts`).
- The Steel Path: the wiki's nodes (`data/vendor/wiki-nodes.json`) against
  `Missions[].Completes`, over the goal's `places` less its `skip_nodes`
  (`placeWithNodesLeft()` in `src/domain/graph/steel-path.ts`); a Steel Path
  clear is `Missions[].Tier`.
- Search: the route reads the player's screen, from the profile's cache, to
  order by reach and say each gap; it is private to the player and never
  cached in public.
- Copy lives in `src/content/`.

## Components

`SearchCard`, `SearchField`, `SuggestionList` and `SuggestionRow` (default,
active, beyond reach), `Divider` (label), `RankCard` (In progress, Test ready), `ChoiceCard`
(goal),
`EmptyState`, `Button` (primary), `ListItem` (supporting) and, on
Milestones reached, `MilestoneRow`, each with its stories.

## Acceptance

1. At 390 px each state matches its frame in "App flows".
2. At 360 and 600 nothing overlaps or is cut, and wider than 600 the page stays a centred 600 px column (BR-39).
3. Typing two characters shows matches; a place opens the map, an item its
   page; Continue opens the first.
4. Each card opens what the table says; a goal already done is not offered.
5. "Build a Necramech" opens the first Necramech the profile lacks.
6. With the Ordis fixture, a match beyond reach comes after those in reach
   and reads its gap; choosing an item beyond reach opens its Step by step;
   no goal beyond reach is offered (BR-62).
7. With Cy, the Mastery Rank card leads the suggestions and reads "Reach
   Mastery Rank 28"; with the bar full it asks for the test; at the highest
   rank it is gone (`rank-view.test.ts`, `request.test.ts`).
8. `pnpm check` passes, with tests for the goals offered, BR-54 and BR-62.

## Drawn on the Design System page
