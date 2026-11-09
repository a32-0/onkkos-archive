# Deferred to a later version

What is set aside as not part of the first version, kept so a later version
can bring it back without rediscovering it.

None of it is built (the cut rule in
[`docs/specs/00-constitution.md`](specs/00-constitution.md)).

## Goals that are not an item, a quest or a place

BR-37 sends a goal to the Step by step of the item or the quest it names, and a
place to the map. Three curated goals named none of those, so they had no
screen to open, and they left `data/grafo.yaml`. Two are still out:

| Goal                    | What it asks                               | How it was read                                                 |
| ----------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `max_syndicate_rank`    | Reach the top rank with a chosen syndicate | `Affiliations[]` where `Tag == '{syndicate_tag}'`, `Title >= 5` |
| `reach_intrinsics_rank` | Reach a rank in a Railjack or Drifter tree | `PlayerSkills.{tree} >= {target_rank}`, ten ranks per tree      |

The owner named Mastery Rank and syndicate rank. The Intrinsics goal falls
under the same rule, since an Intrinsics tree is neither an item, a quest nor a
place, and was set aside with them. The next Mastery Rank came back on
2026-11-02 as a goal of its own (BR-76, spec 10): always the next rank, never
one the player picks.

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
  ([`engine.md`](engine.md)). The goals need their rows back in `grafo.yaml`.
  The trim keeps `PlayerSkills` again since 2026-11-02, for the Mastery Rank.

Bringing one back needs a frame first. The Mastery Rank frames (`1001:7231`)
show how a number to reach is drawn.

## The player's own glyph

DE's public profile carries no glyph (read on 2026-10-23), so a live player
wears the game's default, Lotus Symbol (spec 04). The owner wants a later
version to let the player choose their glyph in Profile, from the catalog's
glyphs (`@wfcd/items`, category `Glyphs`), kept on the device like the other
choices; the chip and Profile would wear it in place of the default.
