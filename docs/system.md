# The system is a join, not a tree

The other documents in this folder each describe one layer. This one says how
the layers relate, because the app's shape is not obvious from any of them
alone: there is no hierarchy of screens to descend, and no state that belongs
to a thing on its own.

## Two jobs, two axes, not two personas

Of the four questions a Warframe player can ask, the wiki owns anything with
no "you" in it, the game owns what you are right now, and a mastery tracker
owns you against what exists. The fourth has no owner, and it is two
questions:

| Job          | The question          | The screen                         |
| ------------ | --------------------- | ---------------------------------- |
| Catch me up  | You against **when**  | `/catch-up`, the Summary (spec 06) |
| Reach a goal | You against **order** | `/goals`, then Step by step        |

They are axes, not audiences. The mapping to "new player" and "returning
veteran" breaks in three places:

- `grafo.yaml` carries audiences per goal (`new`, `mid`, `veteran`, `both`),
  and a goal declares who it is for: `unlock_next_planet` is `new`,
  `build_necramech` is `veteran`.
- **A new player has no month.** Catch me up is not merely thin for them, it
  is unreachable: there is no month to measure from, which is why a player who
  has not reached Venus is never asked (BR-03).
- **A new player's profile barely reads.** Few `XPInfo` entries, few regions,
  no quest proofs.

What serves a new player is one path: the frontier and `unlock_next_planet`.
That is a goal, not a job, and it is worth saying out loud rather than
assuming the second job covers them. Both jobs end in the same two places: the
map, at a place, or an item's Step by step (BR-36, BR-37).

## The join, and the third value

There is no "state of a planet". There is only the state of that planet **for
you**, plus a third value for when the profile cannot say.

- **The world model**: places, items, quests. It comes from the catalog, the
  vendored snapshots and the curated YAML, and it is identical for every
  player.
- **The player model**: what the public profile exposes, read at most every
  twelve hours.

Every state in the app is that intersection, and every one of them has a value
for "the profile cannot answer". It is not a missing "no", and it is
load-bearing:

- The Proximas are not read from the profile, so they are never reported as
  unreached.
- A profile with no `XPInfo` shows no mastery at all, not 0%.
- A quest absent from the proofs map is not readable, never not done
  ([`narrative.md`](narrative.md)).

"Absence of evidence is never no" is therefore a property of the model, not a
rule about copy. Anything that collapses the unknown into "no" is a bug at the
model layer, not a wording problem.

## Four axes

A place hierarchy is one axis of four. The others cut across it.

| Axis           | Where it lives                                                         | What it orders                            |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| **Place**      | `data/systems.yaml`, `star_chart_order` and `off_chart_places`         | System → place → node → drop              |
| **Time**       | the `wf_since` cookie, `releaseDate` in the catalog, the spine's dates | What changed while you were away          |
| **Dependency** | `grafo.yaml`: `nodes` → `goals`, each with a `check`                   | What comes before what                    |
| **Narrative**  | `narrative_spine.yaml`: arcs → quests                                  | The story's order, which is not the map's |

Provenance is not a fifth axis on screen. The engine still knows which source
proved what, but the screens never recite it: that is the constitution's
[never explain the machine](../specs/00-constitution.md#the-anchor-holds).

## Time is a dial, not the top of the tree

The month is not a level above the Origin System. It is orthogonal to place,
and it controls how much there is to read. The update picker is how it is set:
the player names an update because they remember it better than a month, and
the catalog's dates turn it into `YYYY-MM`.

## What has a state, and which states

Four vocabularies, kept apart on purpose.

**An item for this player**: `ItemState` in `src/domain/place/state.ts`, read
from `XPInfo`:

| `kind`    | Means                                                     |
| --------- | --------------------------------------------------------- |
| `done`    | Ranked to its maximum: Mastered                           |
| `ranked`  | Ranked, not yet to its maximum, with `rank` and `max`     |
| `absent`  | Never ranked                                              |
| `unknown` | Not masterable, or the profile carries no `XPInfo` at all |

`XPInfo` lists what was ever ranked, so an item bought and never levelled reads
`absent`.

**A place for this player**: `Completion`, the `done` and `readable` items,
plus `unreadable` ones counted apart. A place with nothing readable is never
complete; zero of zero is not done.

**A quest**: confirmed by proof, or not readable. Never "not done".

**A step of a goal**: `PlanStep.status` in `src/domain/types/plan.ts`, one of
`done`, `todo`, `manual` and `blocked`, with the reason as a value
([`engine.md`](engine.md)). The screens word each one.

## Two lenses that cut every level at once

Neither is a property of a thing. Both reshape what a level shows.

**The frontier** is the first planet on `star_chart_order` the profile cannot
prove, by its junction tag or by a played node on it (`findNextPlanet` in
`src/domain/graph/star-chart.ts`).
For a player with no frontier, **the focus** takes its place: the place with
the highest share of its readable items mastered, short of all of them
(`findFocus`, beside it). Start here marks one or the other (BR-44), and a
player with neither sees no mark. The Dojo is on no chart and is never the
focus (BR-57).

**Reach** is what the player can get to now (BR-59), from
`src/domain/place/reach.ts`. It has two measures, each read from the profile:

- **A place** is in reach when its planet is behind the frontier or is the
  frontier, when the planet it sits `after` is, or, for the Dojo, when the
  profile names a clan.
- **An item** is in reach when `PlayerLevel` meets its `masteryReq` and its
  place is in reach.

What cannot be read is in reach: without `Missions[]` every place is, and
without `PlayerLevel` every rank is. What lies beyond is said as a gap, a
value the screens word: the rank needed and held, the junction the frontier
needs, or the clan. Exploring hides and counts it, a search shows it, and a
plan dims it (BR-60 to BR-63).

This module is the only reader of a place's reach. Whether a quest can be
started is a narrower question, answered by `questAccess()`
([`narrative.md`](narrative.md#access)), and it keeps the same rule for what
cannot be read.

**Mastery Rank** therefore does two things. It orders the suggested goals:
`suggestedGoals` crosses each goal's audience with the player's rank (new below
8, mid 8 to 15, veteran 16 and up), as an ordering, never a filter. And it is
one of reach's two measures, so it decides which items a group shows and which
it counts.
