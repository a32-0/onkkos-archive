# Deferred to a later version

What the owner set aside on 2026-10-04 as not part of the first version, kept
so a later version can bring it back without rediscovering it. None of it is
built (the cut rule in [`specs/00-constitution.md`](../specs/00-constitution.md)).

## Goals that are not an item, a quest or a place

BR-37 sends a goal to the Step by step of the item or the quest it names, and a
place to the map. Three curated goals named none of those, so they have no
screen to open, and they left `data/grafo.yaml`:

| Goal                    | What it asks                               | How it was read                                                 |
| ----------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `reach_mastery_rank`    | Reach a Mastery Rank the player chooses    | `PlayerLevel >= {target_rank}`                                  |
| `max_syndicate_rank`    | Reach the top rank with a chosen syndicate | `Affiliations[]` where `Tag == '{syndicate_tag}'`, `Title >= 5` |
| `reach_intrinsics_rank` | Reach a rank in a Railjack or Drifter tree | `PlayerSkills.{tree} >= {target_rank}`, ten ranks per tree      |

The owner named the first two. The third falls under the same rule, since an
Intrinsics tree is neither an item, a quest nor a place, and was set aside with
them.

How they worked, for whoever brings them back:

- The parameters were picked on the goal itself: a rank, a syndicate from a
  list of the syndicates with five ranks, or a tree and a rank. The syndicate
  list showed the player's standing with each, and the trees were named in
  words, never by their `LPS_*` keys.
- One screen rendered the plan for a Mastery Rank chosen in the search, and
  another the plan for each curated goal, with a state per step. Both left with
  BR-37.
- The engine still evaluates such a check: a field or a value written as a
  `{placeholder}` is resolved from the parameters it is given
  ([`engine.md`](engine.md)). The goals need their rows back in `grafo.yaml`,
  and the trim keeps no `PlayerSkills`, so the Intrinsics goal also needs
  that field back in `src/domain/profile/fields.ts`.

Bringing one back needs a frame first: none of the pinned frames draws a goal
that is a number to reach rather than a thing to get.
