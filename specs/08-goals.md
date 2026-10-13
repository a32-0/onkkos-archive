# 08 · Goal

Where a player picks one thing to chase. They can take one of the suggested
goals, or search by name for anything the app knows how to get, and the app
opens the steps to it.

## Frames

- [`208:90` Goal](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-90).

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`474:920` Goal — Results](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-920): typing, the suggestion list under the field.
- [`474:1013` Goal — No match](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-1013): typing, "Nothing by that name."
- [`474:1090` Goal — Every goal done](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-1090): the search card, then the empty state (flag, "Nothing left to suggest", "Every goal we curate is behind you. Name anything above and chase it.") where the goal cards would be.

Drawn on 2026-10-08 under **Documented states**, for BR-62:

- [`533:5041` Goal — Beyond reach](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=533-5041): the last match beyond reach, after those in reach, with its gap.

## Rules

- [BR-05](../docs/business-rules.md#br-05--set-a-goal-runs-on-frontier-and-focus):
  the goals offered follow the frontier and the focus.
- [BR-37](../docs/business-rules.md#br-37--a-goal-opens-the-steps-of-what-it-names):
  a goal opens the Step by step of what it names; a place opens the map.
- [BR-53](../docs/business-rules.md#br-53--the-search-suggests-as-the-player-types):
  the search suggests as the player types.
- [BR-54](../docs/business-rules.md#br-54--build-a-necramech-names-the-one-the-player-lacks):
  the Necramech the player lacks.
- [BR-59](../docs/business-rules.md#br-59--what-the-player-can-reach) and
  [BR-62](../docs/business-rules.md#br-62--a-search-shows-everything-and-says-the-gap):
  the search reaches everything and says the gap; a goal beyond reach is not
  offered.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons).
- [`deferred.md`](../docs/deferred.md): Mastery Rank, syndicate and Intrinsics
  goals are not in this version.

## What the screen does

Route `/goals`, inside the shell, the Goal tab lit. A new player lands here
from `/connect` (BR-03). From the top, as `208:90` draws it:

1. Onkko's line, "Every choice closes off an infinite number of possible
   futures."
2. **Goal**, and "Curated against your profile and the planets you have
   reached."
3. **Choose a target**: "Anything in the arsenal, any place on the chart." once
   the frame drops "or a Mastery Rank"; the field, "A warframe, a weapon, or
   planet"; and **Continue**.
4. The goal cards, each a link with its icon, title and one line.

### The search (BR-53)

- From the second character, a list opens under the field: up to eight
  matches, best first, each a row with its icon, its name and its catalogue.
  The list reuses the place list's row (spec 07) in a compact form. It has
  no screen frame of its own: it is the `Suggestion list` component, and
  `474:920` draws it in place.
- It reaches only what has a known source: an arsenal item, a mod, arcane,
  resource or other entry with a drop, a region or a vendor, every relic, and
  every place. About 8,000 cosmetics with no source never appear.
- What is in the player's reach comes first. A match beyond reach is the
  Beyond reach row (`526:107`): its catalogue, then the gap, "Sniper · Needs
  Mastery Rank 8, you are 5", "Place · Clear the Venus Junction, on Earth" or
  "Place · Join a clan" (BR-62).
- Choosing a row opens it: a place opens the map on it (BR-37), anything else
  its item page with Goal as its origin (spec 04). An item beyond reach opens
  with Step by step chosen (BR-62). **Continue** opens the first
  row. With no match, the list shows one line, "Nothing by that name.", and
  Continue does nothing.
- The list closes on Escape, on a click outside, and when the field is
  cleared. It is keyboard-navigable and announced as a list box.

### The goal cards

The curated goals in `data/grafo.yaml`, except the deferred ones:

| Goal                 | Card title               | Opens                                                      |
| -------------------- | ------------------------ | ---------------------------------------------------------- |
| `unlock_next_planet` | "Unlock the next planet" | The map on the frontier                                    |
| `build_necramech`    | "Build a Necramech"      | The Step by step of the Necramech the player lacks (BR-54) |
| `unlock_1999`        | "Play the Hex Quest"     | The Step by step of The Hex quest                          |

- A goal the profile already proves done is not offered: no frontier hides
  the first, every Necramech owned hides the second, and the quest confirmed
  by `quest_evidence.yaml` hides the third.
- A goal that names an item beyond the player's reach is not offered
  (BR-59): the Necramech when its rank or its place is beyond. A quest has no
  reach, so "Play the Hex Quest" follows only the rule above. The search
  still reaches everything.
- Order: the goal on the frontier or the focus first (BR-05), then by Mastery
  Rank band (`suggestedGoals`).
- Each card carries its icon, as the frame draws it: `precision_manufacturing`
  for the Necramech, `auto_stories` for a quest, `flag` otherwise.
- The card's line is the goal's curated line in `grafo.yaml`.

## States

| State            | What shows                            |
| ---------------- | ------------------------------------- |
| At rest          | The search card and the goals offered |
| Typing, matches  | The list under the field              |
| Typing, no match | "Nothing by that name."               |
| A match beyond   | `Suggestion row` Beyond reach (BR-62) |
| Every goal done  | The search card, then the empty state |

## Data and sources

- Search: `GET /api/search?q=` over `src/lib/catalog/search.ts`, so the page
  never ships the whole index.
- Goals: `data/grafo.yaml` through `suggestedGoals()`; the frontier and the
  focus as in spec 07.
- Necramechs: the catalog's Necramech category against `XPInfo`.
- Copy lives in `src/content/`.

## Desktop (BR-39)

From 840 the heading and the search card stay one reading column; the goal
cards sit in a grid at their frame width under it. The suggestion list keeps
the field's width.

## Components

`SearchCard`, `SearchField`, `SuggestionList` and `SuggestionRow` (default,
active, beyond reach), `ChoiceCard`
(goal),
`EmptyState`, `Button` (primary), each with its stories.

## Acceptance

1. At 390 px the screen matches `208:90`, and the list matches its frame once
   drawn.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut.
3. Typing two characters shows matches; a place opens the map, an item its
   page; Continue opens the first.
4. Each card opens what the table says; a goal already done is not offered.
5. "Build a Necramech" opens the first Necramech the profile lacks.
6. With the Ordis fixture, a match beyond reach comes after those in reach
   and reads its gap; choosing an item beyond reach opens its Step by step;
   no goal beyond reach is offered (BR-62).
7. `pnpm check` passes, with tests for the goals offered, BR-54 and BR-62.

## Divergences from the code

| Today                                                    | The frame and rules                                   |
| -------------------------------------------------------- | ----------------------------------------------------- |
| A goal opens `/goal?id=`, a plan of its own              | The Step by step of what it names, or the map (BR-37) |
| Mastery Rank, syndicate and Intrinsics goals and targets | Deferred                                              |
| "Unlock Warframe: 1999"                                  | "Play the Hex Quest"                                  |
| The search's hits as built                               | The list of BR-53                                     |
| The search reaches items and collectibles only           | Places too, as the field's placeholder promises       |
| `ProfileFailure` on a failed read                        | Back to `/connect` (BR-38)                            |
| No goals offered: nothing in their place                 | The empty state of `474:1090`                         |

## Does not travel

`/goal`, `/target`, `GoalParameters`, the syndicate picker and the plan
components that only they render (spec 10 keeps what Step by step uses).

## Drawn on the Design System page

The suggestion list is the `Suggestion list` component (Results, No match),
approved by the owner on 2026-10-06, and drawn in place on `474:920` and
`474:1013`.
