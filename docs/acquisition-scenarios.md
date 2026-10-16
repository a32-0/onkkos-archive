# Acquisition scenarios — how an item's parts group

Step by step cannot use a single flat layout. A Warframe whose parts drop from
one boss reads differently from one whose parts come from three Railjack
regions, or from a clan lab. This document records how the scenarios were
found, how the engine sorts every arsenal item into one, what feeds each row,
and which design each scenario follows.

The engine is `resolveAcquisition()` in
[`src/domain/catalog/scenario.ts`](../src/domain/catalog/scenario.ts). It takes
the catalog's data as an argument (`CatalogData` in
`src/domain/catalog/data.ts`), which `src/infra/catalog/data.ts` reads once:
the wiki's modules, `sources.yaml`, DE's tables, the spine and the item
catalog. [Spec 10](../specs/10-step-by-step.md) draws the view that renders it.

## Five layouts, two axes

The first measurement asked one question: do an item's parts all come from the
same place? The answer split the multi-part, non-Prime items into five groups.
Those groups became the five wireframes:

1. Same source.
2. Same source, with the blueprint elsewhere.
3. Same hub, different bounty tier.
4. Different places.
5. No part in any drop table.

The wireframes differ in **how the parts group**, not in what a row shows:

- A shared source lifts one "How to get" section above a flat parts list
  (Dante, Ember, Gyre).
- A split gives each part its own section (Ash, Gyre Prime).

So the engine does not keep five templates. It resolves every part to its
routes, then reads the grouping off the best route of each part along two
axes:

| Axis      | Values                                                                    | Read from                                      |
| --------- | ------------------------------------------------------------------------- | ---------------------------------------------- |
| Parts     | `one-source`, `one-place`, `many-places`, `unknown`, `none`               | the best route of every part but the blueprint |
| Blueprint | `with-parts`, `apart`, `alone` (the only part), `none` (no recipe at all) | whether the blueprint's best route joins them  |

`scenarioOf()` names the combination:

| Scenario           | Axes                    | Wireframe | Items | Examples                             |
| ------------------ | ----------------------- | --------- | ----: | ------------------------------------ |
| `same-source`      | one-source + with-parts | 1         |    73 | Dante, Nezha, Kullervo               |
| `blueprint-apart`  | one-source + apart      | 2         |    44 | Ember, Frost, Atlas, Grendel, Vauban |
| `same-place`       | one-place               | 3         |    11 | Gyre, Gara, Garuda, Revenant, Xaku   |
| `many-places`      | many-places             | 4 and 6   |   180 | Ash, Ivara, and 154 of the Primes    |
| `parts-unknown`    | unknown                 | —         |     6 | the Invasion Wraiths, Dera Vandal    |
| `single-blueprint` | alone                   | —         |   288 | Akbolto, Aegrit, most Market weapons |
| `no-recipe`        | none                    | —         |   176 | Kuva and Tenet weapons, Prisma, Mk1  |

Counted on 2026-10-13 over the 778 items `arsenalCatalog()` returns,
de-duplicated by `uniqueName`.

### Wireframe 5 is not a layout

The fifth group, "no part in any drop table", was measured against DE's drop
tables alone. Once the wiki's modules are read, most of it resolves into the
other layouts with a different kind of row:

- Nezha, Banshee, Wukong and Zephyr are `same-source`, from the Tenno Lab.
- Kullervo is `same-source`, from Kullervo's Archive.
- Vauban is `blueprint-apart`: Market blueprint, Nightwave parts.
- Grendel is `blueprint-apart`. Each part is a locator bought with Vitus
  Essence, and the locator opens a node on Europa.

What wireframe 5 really shows is a **source that is not a mission**: a lab, a
vendor, a store. That belongs on the route row, not in a separate template.
The items left in `parts-unknown` by the modules are closed by curated
sources; see [Nothing is left to prose alone](#nothing-is-left-to-prose-alone).

### Primes are `many-places`

154 of 166 Primes land in `many-places`: each part sits in its own relic, and a
relic is never the same "place" as another relic. Six Prime weapons are
`same-source`: every part of Aklex, Akmagnus, Akvasto and Vasto Prime shares
one relic, and every part of Galariak and Sagek Prime shares one source. Akbronco Prime is `blueprint-apart`. The five Primes with no
relic at all (Excalibur, Lato, Skana, Gotva and War Prime) are `no-recipe`.

## Seven kinds of route

Each part resolves to every route found, ordered best first. Alternatives are
kept, not discarded.

| Kind       | Carries                                                     | From                                                      |
| ---------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `drop`     | place, node, mission type, boss, rotation, chance, access   | DE's tables, plus the wiki node for type, boss and access |
| `bounty`   | place, tier, rotation, stage, chance, hub access            | DE's bounty tables, plus the wiki hub node                |
| `relic`    | relic, refinement odds, vaulted, where the relic drops      | `@wfcd/items` component drops, `Relics.json`, DE's tables |
| `enemy`    | the source named in the drop string, rotation, chance       | `@wfcd/items` drop strings with no node in them           |
| `research` | the dojo lab, the research it depends on, blueprint credits | `Module:Research/data`, `Module:Blueprints/data`          |
| `vendor`   | vendor, currency, cost, rank, quest, locator and its node   | `Module:Vendors/data`; syndicate strings as a fallback    |
| `market`   | credits for the main blueprint                              | `BPCost` in `Module:Blueprints/data`                      |

A route is ranked by kind in the order shown. Within drops and bounties it is
ranked by chance. Platinum vendors sort after every other vendor. Two rules
keep the routes honest:

- **`market` is never a default.** It renders only when the wiki gives the
  blueprint a `BPCost`, and never when the item is researched: for Nezha, the
  `BPCost` is what the dojo charges to replicate it. Of the 38 blueprints with
  no drop entry, 34 carry a Market price. The other four come from vendors:
  Cyte-09 (Amir), Jade, Qorvex (Bird 3) and Uriel (Roathe).
- **`BPCost` is a price, not a place.** On 2026-10-02 every item whose main
  blueprint resolved to `market` or `research` was checked against the first
  line of its own Acquisition section:

  | Route      | Items | Prose agrees |
  | ---------- | ----: | -----------: |
  | `market`   |   137 |          132 |
  | `research` |   103 |          101 |

  Three `market` rows are wrong:

  - Dagath and Dorrclave come from Dagath's Hollow, a dojo room with no
    research. `Module:Research/data` has their entries commented out, so
    nothing structured says so.
  - Prisma Dual Decurions is a Baro Ki'Teer item.

  Three more are unconfirmed:

  - Excalibur and Mag are starter choices in Awakening.
  - Protea's blueprint is first a quest reward.

  On the `research` side, Ignis Wraith also drops from Derelict caches, and
  Volt is a starter that the Tenno Lab also researches. No researched item's
  prose mentions the Market, which is why research suppresses `market`
  rather than adding it as an alternative.

- **A vendor read from a drop string defers to the wiki's own entry**, which
  carries the price. It defers only when both name the same vendor and agree
  on the rank. Aegrit is the case that does not merge: DE's string says
  Chipper at _Settlement_, and the wiki's Kahl's Garrison entry says _Home_ for
  30 Stock. Both are kept rather than one guessed right.

## What fills each part of the wireframes

**Prerequisites** come from the best route of every part, de-duplicated:

- A node's `Requirements` in `Module:Missions/data`, parsed by
  `parseRequirements()` into quests, an Intrinsics rank, a locator key, or an
  active Kuva Lich or Sister. 89 nodes carry one. Armatus gives Dante's "The
  Deadlock Protocol and Whispers in the Walls" word for word.
- For a bounty, the same field on the hub node of that place. Chrysalith
  gives Gyre's "Angels of the Zariman".
- A vendor's quest or rank: Simaris asks for The Jordas Precept before he
  sells Atlas.
- A clan lab for anything researched.

Reaching the place itself (a junction, a Proxima) is not in this list. That
stays with the star-chart rules the app already has.

**How to get** is the shared source when the parts axis is `one-source` or
`one-place`. For a node, its boss names the mechanics page (Tethys gives
General Sargas Ruk) and its mission type names it otherwise.

**Blueprints and parts** are the resolved routes, in recipe order.

**Components** is a real total. `totalsOf()` walks the wiki's recipe tree:

1. The main blueprint's parts.
2. For every component part, the component's own blueprint, found as
   `{item} {part}` or as `{base} {part}` for a Prime.

The sum of their resources and credits gives 70,000 credits for Ember (25,000
plus 3 × 15,000). Dante comes out as Alloy Plate ×8,000, Circuits ×4,000 and
Necracoil ×450, the same figures as its wireframe. `@wfcd/items` carries no
component recipe, so the tree comes from the wiki. Weapons a recipe consumes (two Boltos for Akbolto) are listed apart
rather than tallied as resources. A component with no wiki recipe is named in
`missing`. A Prime part is the only exception, because it drops already
built.

Each resource carries its wiki `Rarity` and the `Location:` line of its
description: "Rare · Ceres, Saturn, and Deimos" for Orokin Cell. That is the
sentence each component row in the wireframes asks for.

## Items that come from a system, not a place

66 items with no route in any table come from one of four game systems. The wiki marks the system in each weapon's `Traits` field
(`Module:Weapons/data/*`):

| System           | Read from                                                       | Items |
| ---------------- | --------------------------------------------------------------- | ----: |
| Kuva Lich        | trait `Kuva Lich`; the Creation section of `Kuva Lich/Main`     |    21 |
| Sister of Parvos | trait `Tenet`; the Creation section of `Sisters of Parvos/Main` |    12 |
| Baro Ki'Teer     | trait `Baro`, or any entry in `Module:Baro/data`                |    28 |
| Invasion         | trait `Invasion Reward`                                         |     5 |

The trait is the signal, not the name or the catalog path.
`/KuvaLich/` misses Kuva Bramma, Ayanga, Chakkhurr and Shildeg, and
`/BoardExec/` misses three Tenet weapons. `systemOf()` in
[`scenario.ts`](../src/domain/catalog/scenario.ts) applies only when no part
has a route of its own, so a weapon that also drops somewhere keeps its
drop.

**Adversaries** (Kuva Lich, Sister) read everything off the wiki's own pages
at refresh time:

- The Creation section's first paragraph gives the encounter sentence ("…the
  player may encounter a Kuva Larvling in a regular level 20+ Grineer
  mission…"). Its bold link names the larva (Kuva Larvling, Candidate). Its
  links give the prerequisites: those that match a quest in
  `narrative_spine.yaml` become a "Complete" row, and a `[[Railjack]]` link
  becomes "Acquire a Railjack". Nothing is written by hand, so the Sister's
  extra Call of the Tempestarii comes through on its own.
- The second paragraph gives the Mercy-kill sentence.
- "Accessing the Saturn Proxima … requires one rank 5 Railjack Intrinsics"
  gives the confrontation's Intrinsics row.
- The Gameplay page's Crimson Branch line gives the trade alternative.

**Baro** prices come from `Module:Baro/data`: `CreditCost`, `DucatCost`, and
the latest of `OfferingDates` and `PcOfferingDates`. The latest has to be
taken across both lists, because the PC list stops in 2021 and the merged
list carries on. The wiki's own Acquisition sentence is not shown for Baro
items: it loses its currency icons and reads "for 50,000 and 600".

**Invasion** has no structured detail. The row carries the lead sentence of
the Invasion page, not the item's Acquisition sentence, which for Latron
Wraith opens on a 2014 event.

### Wraith and Vandal

Wraith and Vandal weapons are split across five kinds of source, not one:

- **Seven** are in DE's drop tables and already resolve as ordinary drops:
  Braton, Lato, Spectra and Imperator Vandal; Furax, Gorgon and Ignis
  Wraith.
- **Nine** are Baro items: Halikar, Machete, Viper and Vulkar Wraith;
  Glaxion, Opticor, Prova, Quanta and Supra Vandal.
- **Five** are Invasion rewards: Karak, Latron, Strun and Twin Vipers Wraith,
  and Snipetron Vandal.
- **Dera Vandal** is an Invasion reward by its own prose, but carries no
  trait, so it stays prose only.

The other fourteen, the Baro, Invasion and Dera Vandal items, appear nowhere
in DE's drop table page. This was checked against the page itself, not only
the WFCD mirror the app vendors.

## Nothing is left to prose alone

On 2026-10-03 every one of the 778 arsenal items and every collectible in the
Goal search renders from data. `tests/coverage.test.ts` holds it there. The
last 43 arsenal items, 4 items with an unrouted part and about 120
collectibles were closed in this order, cheapest first:

1. **Case.** `@wfcd/items` spells "Ax-52", "Angel Of Death Honoria",
   "Conquera Ii Ephemera"; the wiki spells "AX-52", "Angel of Death",
   "Conquera II". Every module map is a `NameMap` that ignores case, and
   vendor offers match `{name}` or `{name} Blueprint`, singular or plural.
   That alone routed AX-52, both EFV weapons, nine Honoria, five Baro
   Ephemera and Keratinos's Blades. Wiki links go through the modules' own
   `Name`/`Link` fields (`wiki-titles.json`), because MediaWiki is case-sensitive after the first
   letter and "Ax-52" returned an empty page.
2. **A part named after another item.** Pride's recipe holds a "Wrath Blade"
   and Wrath's a "Pride Blade". `foreignPart()` looks such a part up by its
   own name in DE's tables.
3. **Data that was vendored but unread.**
   - Honoria: the module's price is joined to a vendor through the currency
     (`Volatile Motes` → Belly of the Beast), and the Honoria page's tag
     sections give the vendor, place and quest for Roathe, Hunhow, Melica and
     Marie (`wiki-honoria-tags.json`).
   - Baro answers collectibles too, not only weapons.
   - 588 collectibles carry a recipe in `@wfcd/items`; they get Components
     like any weapon.
4. **Rotations computed, not fetched.** The Circuit page defines each week
   with a fixed anchor and period (normal: 11 weeks from 2023-04-24; Steel
   Path: 9 weeks from 2026-04-20). `wiki-circuit.json` keeps both tables, and
   `circuitStatus()` says "this week" or "in N weeks" for every Warframe and
   Incarnon Genesis. It agreed with warframestat's live `duviriCycle` on the
   day it was written, so there is no live read. The week is computed from the
   date the plan is handed (`now`), so the domain reads no clock. Each Genesis page adds
   its install cost (Components), its prerequisites and Cavalero's platinum
   price (`wiki-incarnons.json`).
5. **Curated sources.** What remained is in no module: Market-only weapons
   and Sentinels, Teshin's Cave, quest rewards, Founders items, the Dex
   anniversary weapons, Ephemera from Liches, Sisters, Codas, Nightwave
   seasons and Prime Access packs. Each was read from its wiki page's
   wikitext and written as a typed route in `data/sources.yaml`, with a
   `cite`. See [`curated-files.md`](curated-files.md#sourcesyaml-where-an-item-comes-from-when-no-module-says).

Two corrections came out of the research:

- **Dagath and Dorrclave** were shown as Market blueprints. Their price comes
  from `BPCost`, but the wiki says the blueprints are sold by Dagath's Hollow
  in the clan dojo, without research. A `dojo` source replaces the Market
  row and keeps the price.
- **Chroma's Neuroptics** is catalogued as "Volt Neuroptics", a catalog
  error. Its curated route (Uranus Junction, Simaris) is scoped to that part
  name.

## Disagreements between sources

The sources disagree in places. Each disagreement is recorded rather than
silently resolved:

- **Mission type on Proxima nodes.** DE's tables say Skirmish for Ash's
  Railjack nodes; the wiki says Defense, Survival and Exterminate. The engine
  takes the type from the wiki node and the chance from DE. The wireframe's
  "Falling Glory, Defense" matches.
- **Relic rarity.** Lith G14 carries Gyre Prime Neuroptics as _Uncommon_, at
  2% intact and 10% radiant, which are Rare odds. The label comes from
  `@wfcd/items`. The odds are the ones to trust.
- **Vendor rank.** Aegrit, above.
- **`Module:Acquisition/data` is not used.** It is a second copy of the drop
  chances, and for most Warframes it is the shared placeholder `WFDefault`:
  Atlas reads as 38.72% with no source at all.

## The modules, and why they are vendored

| Module                   | Kept                                                       |  Rows |
| ------------------------ | ---------------------------------------------------------- | ----: |
| `Module:Blueprints/data` | `Blueprints` and `Suits` merged: recipe, credits, `BPCost` | 1,163 |
| `Module:Missions/data`   | `MissionDetails`: planet, type, boss, requirements         |   357 |
| `Module:Resources/data`  | `ResourceData`: rarity, type, location line                |   929 |
| `Module:Research/data`   | lab, prerequisite research, credits, time                  |   188 |
| `Module:Vendors/data`    | 66 vendors, with currency, rank names and offers           | 2,843 |
| `Module:Weapons/data/*`  | each weapon's `Traits` ("Kuva Lich", "Tenet", "Baro"…)     |   667 |
| `Module:Baro/data`       | credits, ducats, and the last date Baro offered it         |   468 |
| `Module:Companions/data` | each companion species (Kubrow, Kavat, Predasite, Hound)   |    41 |
| `Module:Honorias/data`   | each Honoria description, tags and Roathe price            |   209 |

The modules are Lua, about 3.4 MB raw between them. Parsing that on every
request would be the only Lua interpreter in the app, so `pnpm data:wiki`
parses them once and writes trimmed JSON, exactly as `pnpm data:refresh` does
for DE's tables. `scripts/lua.mjs` reads table literals only (strings, numbers,
booleans, nested tables, comments) and stops on anything else. That is enough
for these modules, and it fails loudly if one grows code.

Two traps in the module shapes:

- Warframe blueprints live in a separate `Suits` table. A first count that
  read only `Blueprints` missed every Warframe and reported a third less
  coverage than there is.
- `Module:Resources/data` returns two tables. The data is the local
  `ResourceData`, not the first table in the file.

Joins are by name. Blueprints and research have no `InternalName`, so a part is
looked up as `{item} {part}`. `partName()` keeps that from doubling a name the
part already carries, so "Bonewidow Capsule" is not read as "Bonewidow
Bonewidow Capsule". Without that guard, Bonewidow, Cortege and Morgha showed
up as unresolved.

## Which scenarios have a design

| Scenario                        | Layout                           | Reference               |
| ------------------------------- | -------------------------------- | ----------------------- |
| Same source                     | Wireframe 1                      | Dante                   |
| Blueprint apart                 | Wireframe 2                      | Ember                   |
| Same place, different tier      | Wireframe 3                      | Gyre                    |
| Different places, Primes        | Wireframes 4 and 6               | Ash, Gyre Prime         |
| Kuva Lich, Sister of Parvos     | Prerequisites, Acquisition steps | Kuva Sobek, Tenet Tetra |
| Baro Ki'Teer                    | Acquisition, priced Components   | Prisma Gorgon           |
| Invasion                        | Acquisition, one step            | Latron Wraith           |
| Single blueprint                | Wireframe 1, one route           | Akbolto                 |
| Vendor blueprint, dropped parts | Wireframe 2                      | Atlas                   |
| Vendor parts, other currency    | Wireframe 1                      | Kullervo, Grendel       |
| Enemy drops with no node        | Wireframe 4, "Defeat" rows       | Brakk                   |
| Fully vaulted Prime             | Status, Acquisition, relic parts | Ivara Prime             |
| Incubated companion             | Prerequisites, optional steps    | Chesa Kubrow, Adarza    |
| Infected Kavat                  | Acquisition steps                | Vasca Kavat             |
| Revived companion               | Acquisition steps                | Vizier Predasite        |
| Sister's hound                  | Adversary steps plus one         | Bhaira Hound            |

Every scenario has a reference. The grammar they share, and
the mapping of the families with no wireframe of their own, is in
[`scenario-guidelines.md`](scenario-guidelines.md).

### Fully vaulted Prime

124 of the 166 Primes have every part in relics that no longer drop. 35 still
drop everywhere, and none is half vaulted (2026-10-13). This is the common Prime case, not
an edge. `vaultedOf()` reads it: a Prime whose every part has routes, all of
them relics, all vaulted.

What the view carries:

- **Status.** A "Prime Vaulted" prerequisite says whether the Prime is back
  in Prime Resurgence, and until when.
- **Aya**, with the best bounty from DE's tables (48 tiers drop it).
- **Varzia**, with where she stands and until when, from the live endpoint.
- **"Or buy it whole"**, only when her stock holds the Prime itself.
- **The relics** per part, up to four, best first. Their detail drops the
  "Vaulted" tail because the status row already says it.

Varzia's stock is a live read of `api.warframestat.us/pc/vaultTrader`, handed
to the plan as `varzia`. Each entry's
`uniqueName` is the catalog's with `/StoreItems/` added, so it joins without
name matching. The two price fields are misnamed: `ducats` holds **Regal Aya**
(a whole Prime costs 3) and `credits` holds **Aya** (a relic costs 1).

Varzia's Resurgence relics (Lith B12, Meso I3, Neo O4 on 2026-10-03) come
with no contents in `@wfcd/items`. Their contents are read from
`Module:Void/data` (`wiki-relics.json`, 799 relics), matched to Varzia's
stock by `uniqueName` through the relic catalog. Each part section opens
with the relics she sells this rotation that hold that part, priced in Aya,
then lists the vaulted ones.

### Companions

The 18 companions with no route split into five mechanisms, each its own
system. The species comes from `Module:Companions/data`, never from the name:

| Mechanism          | Items                       | How it is recognised                                    |
| ------------------ | --------------------------- | ------------------------------------------------------- |
| Kubrow incubation  | 5 Kubrows, Helminth Charger | species `Kubrow`                                        |
| Kavat incubation   | Adarza, Smeeta              | species `Kavat`, no Echo-Lure of its own                |
| Vasca infection    | Vasca Kavat                 | species `Kavat` and a vendor sells `{name} Echo-Lure`   |
| Son revivification | 3 Vulpaphylas, 3 Predasites | species `Predasite` or `Vulpaphyla`                     |
| Sister's hound     | Bhaira, Dorma, Hec Hound    | species `Hound`; composes the Sister system plus a step |

Every "Acquire X" row resolves its line from data, in this order: a vendor
offer (Tranq Rifle at Son), a dojo lab (Kavat and Nutrio segments), a drop in
DE's tables (Kubrow Egg), else the first sentence of the thing's Acquisition
section. The procedure itself (Howl of the Kubrow, Heart of Deimos, Fortuna for
the hound, the order of the steps) has no structured source: its game names
are constants in `checks.ts`, and its words are the screen's. Bred companions have no recipe, so they have no
Components. The hounds keep theirs from the catalog.

The six Market sentinels (Carrier, Dethcube, Diriga, Shade, Taxon, Wyrm) are
not incubated. Their blueprints are missing from `Module:Blueprints/data`, so
they fall back to prose ("Carrier's blueprint can be purchased from the
Market.").

## Collectibles with no drop of their own

A search that indexed only what `@wfcd/items` gives a drop would leave out
every Honoria (204), every Incarnon Genesis (45) and almost every Ephemera
(98 of 104). Three families are admitted on their own, each marked by its
`family`:

- **Honoria.** `Module:Honorias/data` gives each one a description ("Awarded
  for reaching Rank 29 in Nightwave…") and, for 42 of them, Roathe's price.
- **Incarnon Genesis.** The Steel Path Circuit's weekly choices come from
  the Circuit page's own rotation table, computed for the current week; see
  below.
- **Ephemera.** 28 are sold by a vendor or the Market; the rest show the
  first sentence of their Acquisition section.

A Honoria or an Ephemera enters only when a source says how to get it: a
drop, a region, a vendor, a `sources.yaml` row, or a Honoria entry in the
wiki's module with a description or a price. The catalog lists some the wiki
has never documented (six Honorias and Eskhatos Infinitas Ephemera when
`@wfcd/items` 1.1276.21 arrived); they stay out until it does, and the next
refresh brings them in (owner, 2026-10-15). That version also moved the
Honorias out of `Misc` into a category of their own, `Honoria`, which
`COLLECTIBLE_SOURCES` reads.

Any other collectible with a vendor offer in `Module:Vendors/data` is admitted
too (51 mods among them). Event vendors (Nights of Naberus, Scarlet Spear…) sort
after standing vendors, and a collectible lists at most four ways to get it.
