# Step by step

The item's page has two views. **Summary** answers "what do I need and
where"; **Step by step** answers "walk me through it". `?view=steps` on
`/item` opens it, and an item beyond the player's reach opens on it. The
Summary is this plan in short form (`briefOf()` in
`src/domain/catalog/summary.ts`), so the two views never disagree. What each
frame draws is in [spec 10](../specs/10-step-by-step.md); how an item's parts
are grouped and which sources feed each route is in
[`acquisition-scenarios.md`](acquisition-scenarios.md).

| Layer  | File                                                            |
| ------ | --------------------------------------------------------------- |
| Routes | `src/domain/catalog/scenario.ts`                                |
| Plan   | `src/domain/catalog/checks.ts`: `stepPlan()`, `questStepPlan()` |
| Lock   | `src/domain/catalog/checks.ts`: `planLock()`                    |
| Prose  | `src/infra/wiki/prose.ts`: `withProse()`                        |
| Words  | `src/content/checks.ts`: `TITLES`, `BRIEF`, `DETAILS`, `STEPS`  |
| View   | `src/screens/item/steps/`: `stepsView()` and `Steps`            |
| Ticks  | `src/infra/ticks.ts`, wired by `src/app/item/ItemTicks.tsx`     |

## The sections, in order

A section with nothing in it does not render. Each is a `Divider` over a
card.

1. **Prerequisites.** Mastery Rank when it is above 0, the slot, the quests
   the farm needs (root first, the ones the profile confirms left out), a
   Railjack Intrinsics rank, a clan for anything researched, a syndicate rank,
   then one "Reach" row per place. More than one quest share one row, and so
   do more than one Junction (BR-66). When the main blueprint is bought, the
   purchase closes the section: "Buy the Ember Blueprint".
2. **How to get**, one row when the parts share a source. An item that comes
   from a game system (a Kuva Lich, a Sister of Parvos, Baro Ki'Teer,
   breeding, Son) gets its steps here instead, under the same title, one row
   per step.
3. **Blueprints.** A shared source gives one flat list, each row with the
   part's art. Parts from different places each get a card under the same
   divider, its header the part's art and name, best odds first (BR-25).
4. **Components.** Every resource in the recipe tree, in groups split by a
   plain line with no title: what only that place gives, then the rest, then
   the gear recipes summed in (`withGear()` in `checks.ts`): a required
   gear's ingredients join the rows the plan has, an optional one's make one
   last group of their own, each row optional; each group by rarity, credits
   last. The art has
   no ground behind it. A resource the wiki gives no place for reads its
   recipe instead: `madeDetail()` in `checks.ts` takes it from the catalog's
   recipes, which since 2026-10-21 read the Resources category beside Misc
   and Gear (`GEAR_SOURCES`), where the Plains' and the Vallis's cut gems and
   alloys keep theirs. What still has no description, fish parts, toroids,
   standing and a few drops, needs a source of its own.

A quest takes the same grammar (BR-37): Prerequisites with the quests and
junctions before it and its Mastery Rank, then How to get with where it
starts and the lead of its wiki page.

## The words

The plan holds no words: every title, detail and group heading is a phrase,
`{ say, …values }`. `src/screens/summary/lines.ts` checks at compile time
that `TITLES`, `BRIEF` and `DETAILS` together give words to every `say`, so a
new phrase cannot reach the screen silent. A row's marks are added by the
view, once: "(Highest chance)" on the best route (BR-26, BR-50), "(Optional)",
and "Or" on an alternative, which has no diamond. A relic alternative reads
"Or {relic}", with "(Vaulted)" when it no longer drops (BR-49). A route row
is named by its node (BR-27).

The detail is one line of data ("It drops at rotation C, 7.5% a run, so about
13 runs for an even chance."). The prose under it is the wiki's passage in
its paragraphs (BR-48): a mission type's Mechanics section up to its first
subsection, an item's Acquisition section for a route only prose names, and
the page's lead otherwise. `brief()` in `src/infra/wiki/client.ts` trims it
with no hand-written text: a line that is not a sentence is dropped (a
list's lead ending in a colon, an audio caption), a footnote's number is
taken off, and the passage stops at three sentences. "Wiki ↗" closes the passage; a thing the app has its own page for
reads "How to get it" and opens that page instead (BR-30).

## Ticks only on Components

Route rows are alternatives, not steps: a player runs Obol Crossing _or_
Fenton's Field. Prerequisites are facts to read. What the player collects is
what they tick. A tick lives in this browser under
`wf:manual:item:{name}:{rowId}`; nothing is pre-ticked, because the profile
lists no resources. The server renders nothing ticked and the browser fills
the ticks in after it loads, so the two never disagree on the first paint. A
ticked row strikes its title through and folds; unticking brings it back. A
fold is per visit and is not kept.

## A plan dims what waits on an unmet prerequisite (BR-63)

`planLock()` walks Prerequisites in order and stops at the first row the
profile proves unmet: a Mastery Rank above the player's, or a place or
junction past the frontier the profile's `Missions[]` draws. That row keeps
full contrast and reads its gap ("Needs Mastery Rank 15. You are Mastery
Rank 5."); every row after it, in every section, is drawn Locked at half
opacity, still open and readable, and a locked component can still be
ticked. With no `PlayerLevel` or no `Missions[]`, nothing locks, and a quest
without evidence locks nothing.

## The prose costs one request per page, cached a day

`withProse()` collects every distinct page a plan asks about and fetches each
once, in parallel, through the wiki client's one-day cache. Ash asks for four
mission types, not for twelve rows. The page fetches it whichever view opens,
since the View row switches without a reload.

## Two traps

**Prefix matching is not name matching.** A reward name that only starts
with the item's name is another thing: Soma is not _Somatic Fibers_.
`namesItem()` in `src/domain/catalog/rewards.ts` requires the whole name, or
the name followed by a space.

**A part can belong to another item.** Chroma's recipe asks for Volt's
Neuroptics, and Pride and Wrath each ask for the other's Blade. The catalogue
names such a part after its owner ("Volt Neuroptics"), so no two parts of a
recipe share a name, a row or a tick.
