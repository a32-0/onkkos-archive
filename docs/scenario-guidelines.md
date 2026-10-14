# Scenario guidelines — designing an item view without a wireframe

There are more than 200 ways to obtain something in Warframe, and there will
not be a wireframe for each. Fifteen wireframes exist (Dante, Ember, Gyre,
Ash, Gyre Prime, Nezha, Kuva Sobek, Tenet Tetra, Prisma Gorgon, Ivara Prime,
Chesa Kubrow, Adarza Kavat, Vasca Kavat, Vizier Predasite, Bhaira Hound). This
document is the grammar they share. A new kind of item is designed by placing
it in that grammar, not by drawing a new screen. Where the grammar has no
answer, the owner designs one case and it is added here.

How items are sorted into scenarios is in
[`acquisition-scenarios.md`](acquisition-scenarios.md). What the view draws
is in [spec 10](../specs/10-step-by-step.md).

## The question every item view answers

"What do I need, in what order, and where do I go?" for this player, and
nothing else. The wiki gathers everything about a thing. The item view
answers that one question and links out for the rest (the constitution:
filter and curate, never mirror).

## One answer, two densities

Summary and Step by step say the same thing. Summary is the short form and
Step by step is the long form. Summary is derived from the step plan itself:
`briefOf()` in `src/domain/catalog/summary.ts` reads the plan and keeps each
row's title and its `brief`, a one-line reading the plan builder writes next to
the long detail. There is no second engine to drift.

The plan, `stepPlan()` in `src/domain/catalog/checks.ts`, holds no words. Each
title, detail and reading is a typed phrase (a key and its values: a node, a
chance, a price), and the screens give each phrase its words. The runs, the
odds and the dates are values, so both densities read the same numbers.

| Step by step section    | Summary shows (BR-55, 2026-10-06)                                         |
| ----------------------- | ------------------------------------------------------------------------- |
| Prerequisites           | Nothing                                                                   |
| How to get, Acquisition | Nothing, unless the item has no blueprint and no component: then its rows |
| Part sections           | **Blueprints**: one row per blueprint, its best route, reading and place  |
| Components              | **Components**: one row per ingredient, reading and place                 |

The Summary carries no credits of the recipe's own. They are the last step's
cost only, and would contradict the tree total in Components.

A fact that appears in one view and contradicts the other is a bug. A fact
that appears in only one view is the density difference, as long as Summary
holds the subset.

## The four sections

Every item view, arsenal or collectible, is these sections in this order. A
section with nothing in it does not render.

1. **Prerequisites.** Facts the player reads, never ticks.
2. **How to get** (a shared source), or **Acquisition** (a procedure).
3. **One section per part**, or one flat **Blueprints** list when all parts
   share a source.
4. **Components.** What the player collects. The only section with ticks.

### Prerequisite kinds

| Kind              | Title pattern                              | Example                      |
| ----------------- | ------------------------------------------ | ---------------------------- |
| Mastery           | Mastery Rank {n}                           | only when n is above 0       |
| Slot              | {Kind} Slot                                | Warframe, weapon, companion  |
| Quests            | Complete {quest}, one row per quest        | The War Within               |
| Hub unlock        | Unlock {hub}                               | Fortuna, Deimos              |
| Reach             | Reach {place}, naming the junction         | Clear the Saturn Junction    |
| Gear owned        | Acquire {thing}                            | Kubrow Egg, Tranq Rifle      |
| Standing          | {Syndicate} rank {name}                    | Son, Stranger                |
| Intrinsics        | Railjack Intrinsics rank {n}               | Kuva Lich confrontation      |
| Clan              | Join a clan with the lab                   | anything researched          |
| Status            | One line on why the normal route is closed | Prime Vaulted                |
| Purchase (closes) | Buy the {item} Blueprint                   | when the blueprint is bought |

"Unlock" is a hub that a quest opens. "Reach" is a node that the star chart
opens. They are different rows.

A Mastery Rank 0 item gets no Mastery row: a requirement every player meets
is not a fact worth reading. Every item that takes an inventory slot gets the
Slot row for its kind. The owner's comments behind both are in
[`business-rules.md`](business-rules.md) (BR-22, BR-23).

A prerequisite brings its own. "Acquire a Railjack" puts Rising Tide and The
War Within above it as rows, not only in its sentence (BR-28). Quests are one
row each, root first, read off the spine by `questsBefore()`, each preceded by
the junctions its requirement names. A quest the profile confirms drops out,
with everything before it.

### Row grammar inside How to get and Acquisition

There are three row types. Each is told apart by its title alone.

- **Step.** Done in order. "Find a Kuva Larvling", "Capture a Weakened
  Subspecies", "Return to Son".
- **Optional step.** Improves the result and is never required. The title
  ends in "(Optional)": "Add a Genetic Code Template (Optional)". The plan
  marks the row `optional`.
- **Alternative.** Replaces the row above it. The title starts with "Or":
  "Or trade for a converted Sister". The plan marks the row `alternative`.

Part sections hold only alternatives, best first, at most four: the first is
opened, and every other reads "Or" (BR-49). Every route tied for the best
odds is marked `best`, reads "(Highest chance)" with no number (BR-50), and
is marked in gold
(`--orokin`) as well as by the words, as long as a shown route of the same
kind has worse odds. Drop tables tie often: Ash's Chassis drops at 13.33% on
both Obol Crossing and Fenton's Field, so both are marked. When every shown
route has the same odds, none is. When parts come from
different places, the part sections themselves are ordered by each one's best
odds, highest first (BR-25, BR-26).

### Row anatomy

- **Title.** A verb and the thing, with the thing's icon. The verbs are Play,
  Defeat, Open, Buy, Visit, Find, Vanquish, Trade, Acquire, Use, Capture and
  Return to. A new verb is a sign the scenario is new. A mission is named
  by its node, as the planet shows it in game ("Play Beacon Shield Ring"),
  never by its mission type: the wiki files by type, players don't (BR-27).
- **Detail.** One line of data: odds, runs, price, rank or date. "Uncommon.
  11% intact and 20% radiant." "Rotation C, 8.51% a run."
- **Prose.** The wiki's passage in its paragraphs, as the frames draw it
  (BR-48): for a mission, its type's Mechanics section; for an item whose
  route only prose names, its Acquisition section; for anything else, the
  lead of its page. The plan says which, as the prose ask's `source`.
- **Link.** Every row has one. It opens the thing's own `/item` page when the
  app has one, and the wiki otherwise (BR-30).

## Systems compose

A system is a procedure the game runs around a set of items. Each one is
designed once and reused:

- **Adversary** (Kuva Lich, Sister of Parvos)
- **Baro Ki'Teer**
- **Invasion**
- **Varzia** (vaulted Primes)
- **Incubator** (Kubrow egg, Kavat genetic code)
- **Son revivification**
- **Vasca infection**

An item that comes from two systems is their composition. Bhaira Hound is the
Sister plan plus one step ("The Hound"), and its Components come from its own
recipe.

## Rotating sources share one design

Varzia, Baro, the Circuit's Incarnon Genesis, Teshin and the seasonal
vendors (Nights of Naberus, Star Days, Dog Days) all sell from a stock that
changes on a schedule. They share one pattern:

- **In rotation now.** The Visit step names where and until when.
- **Not in rotation.** The same step says when it was last offered, from the
  wiki data or the live endpoint, and the item's other routes (relics, trade)
  stay visible.

Prisma Gorgon already does the second case: "He last brought it on 4
September 2026". Varzia and the Circuit use the same two lines.

## Components gather every recipe the plan names

Components is what the player collects for the whole plan, not only for the
item's own recipe (BR-32).

- **The item's recipe.** The whole recipe tree from `Module:Blueprints/data`,
  or from `Module:Companions/data` for companions. Bhaira Hound has
  `BuildPrice` and `Components`.
- **Everything the plan names.** Any gear the plan asks for that is built
  from a recipe adds its tree too. A Kubrow has no recipe of its own, since it
  is bred, but the plan asks for an Incubator Power Core, so the Power Core's
  ingredients fill Components, in a group of their own titled "For the
  Incubator Power Core", and "(Optional)" when the gear is. What is acquired whole (a Kubrow Egg, ten
  Kavat Genetic Codes) stays in Prerequisites as gear owned.
- **Order.** Inside each group, Common, then Uncommon, then Rare, then the
  resources the wiki gives no rarity (Entrati Obols, Necracoil), in recipe
  order. Weapons, other currencies and the credit total close the list
  (BR-24).

## Rules that hold on every screen

- Wiki prose runs in its paragraphs, as drawn (BR-48).
- No machine talk: "The catalog doesn't say", "No drop recorded" and "from
  DE's tables" never reach the player. What cannot be read is one short line
  or nothing.
- Wireframe copy is placeholder where it repeats across screens. The data
  decides every quest list, hub gate, price and component.
- Every named thing carries its icon, or renders as a name with no box.

## Families mapped to the grammar

These families have no wireframe of their own. Each one resolves to designs
that already exist.

| Family                           | Count | Source of truth                                     | Renders as                                  |
| -------------------------------- | ----- | --------------------------------------------------- | ------------------------------------------- |
| Mods, arcanes with drops         | 1563  | `@wfcd/items` drops, DE tables                      | Collectible: Reach, then the best route     |
| Mods from a vendor or syndicate  | 51+   | `Module:Vendors/data`                               | How to get: Visit {vendor}, rank and price  |
| Event and Nightwave mods         | —     | `Module:GuaranteedRewards/data`, Acquisition prose  | How to get: prose fallback                  |
| Honoria from Roathe              | 42    | `Module:Honorias/data` `Price`                      | How to get: Visit Roathe, price             |
| Honoria from a feat              | 162   | `Module:Honorias/data` `Description` and `Tags`     | How to get: the description is the one line |
| Ephemera from a vendor or Market | 28    | `Module:Vendors/data`                               | How to get: Visit, price                    |
| Ephemera from a boss or event    | 76    | Acquisition prose                                   | How to get: prose fallback                  |
| Incarnon Genesis                 | 45    | Live Circuit rotation (`duviriCycle`, hard choices) | Rotating source: Steel Path Circuit         |
| Vaulted Prime                    | 124   | Relics, Varzia's live stock, Aya bounties           | Status, Acquisition (Aya, Varzia), parts    |
| Kuva, Tenet weapons              | 33    | `Module:Weapons/data` traits                        | Adversary system                            |
| Baro, Invasion items             | 33    | `Module:Baro/data`, traits                          | Baro or Invasion system                     |
| Kubrow, Kavat                    | 8     | `Module:Companions/data` species, Research, Vendors | Incubator system                            |
| Vasca Kavat                      | 1     | Species, and Teasonai sells a Vasca Echo-Lure       | Vasca infection system                      |
| Predasite, Vulpaphyla            | 6     | Vendors (Son), Conservation                         | Son revivification                          |
| Sister hounds                    | 3     | Companions recipe, adversary page                   | Adversary system plus "The Hound"           |

A family whose source of truth is "Acquisition prose" stays on the fallback
row until a structured source appears. That is a correct render, not a gap.

## When a new wireframe is needed

Only when an item needs a section, row type or prerequisite kind that is not
listed above. Everything else is placed by this document and verified by
rendering a real item of the family at 360, 600, 840 and desktop widths.
