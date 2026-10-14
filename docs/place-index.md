# The place index

The app's browsing model is the player's: a system holds places, a place holds
catalogs, a catalog holds items. This file records where that index comes from,
what it cannot answer, and the measurements that shaped it. The code is in
`src/domain/place/`; the files it reads are read in `src/infra/place/load.ts`
and handed in.

## The sources

`@wfcd/items` exposes a `drops` array per item, and reading the world through
it is a mistake worth naming: it resolves only 3 to 29% of each category to a
planet. The data is not missing; `drops` is a thin projection. WFCD also
publishes [`warframe-drop-data`](https://github.com/WFCD/warframe-drop-data), a
parse of DE's own drop tables, and its shape is already the one the app needs:

```
place → node → gameMode → rotation → rewards[]

Venus / Fossa   Assassination   Rhino Neuroptics, Chassis, Systems
Earth  / Oro    Assassination   Hydroid Neuroptics, Chassis, Systems
```

Sources are treated by their rate of change. Drop tables change with a patch,
so they are vendored by `pnpm data:refresh` into `data/vendor/` and refreshed
by hand like the catalog. The worldstate changes hourly, so it stays a live
read. Vendoring costs staleness, so `data/vendor/manifest.json` records the
upstream hash and build date: the age is visible rather than silent.

The wiki contributes two more tables, vendored by `pnpm data:wiki`:

- `Module:Missions/data` carries `RegionResources`, the four or five resources
  a planet yields, which answers "what does Earth give me" in the form the game
  itself uses.
- `Module:Research/data` names everything a clan dojo's labs research, and
  which lab. It fills the Dojo (below).

## Reward names do not match catalog names

Drop tables name rewards the way the game does (`Rhino Neuroptics Blueprint`,
`150X Agnovidisc`, `Lith Q3 Relic`), and the catalog names items `Rhino`,
`Agnovidisc`, `Lith Q3 Intact`. `resolve.ts` closes that gap and is pure, so it
is tested without the catalog. Of 1267 distinct reward names, 1125 resolve, 45
are currency and are rejected on purpose, and 97 name nothing the index holds:
landing-craft parts, syndicate medallions, focus lenses, fish parts, and the
gear and modular parts that have no group (below). Measured on 2026-10-13.

**A generic component name is never registered on its own.** Archwing
components are called `Harness`, `Systems` and `Wings`; registering those bare
put Amesha on fourteen planets it does not appear on. A bare component name is
only indexed when it already begins with its parent's name.

## Every item under its catalogue

The map draws one group per catalogue (spec 07), and the index files each item
under the group it is drawn in: `warframes`, `primary`, `secondary`, `melee`,
`archgun`, `archmelee`, `amp`, `companion`, `necramech`, `archwing` and
`railjack` in the Arsenal; `resources`, `relics`, `mods`, `arcanes`,
`incarnons`, `ephemera` and `honoria` in the Collection. The Summary draws
fewer, wider groups (BR-16), and `summaryGroupOf` gathers the map's into them:
the weapons and the amps into Weapons, the companion into Companions, the
Necramech, the Archwing and the Railjack into Vehicles.

The catalog's own category is not enough to place an item, so `groupOf` reads,
in this order:

1. The `uniqueName`, for what the category hides. An Incarnon Genesis is under
   `/IncarnonAdapters/`, an amp's parts under `/OperatorAmplifiers/`, an
   Honoria under `/Types/Items/Titles/`, an Ephemera under
   `/Upgrades/Skins/Effects/` (only what is named "Ephemera"; the folder also
   holds other effects), a Railjack component under
   `/Upgrades/Skins/RailJack/` though its category is `Skins`, and the classic
   resources under `/Types/Items/MiscItems/`: Ferrite, Rubedo, Neurodes,
   Morphics, Plastids, Orokin Cell, Nano Spores, Salvage, Gallium and Oxium are
   category `Misc`, so anything reading `category: ["Resources"]` alone misses
   the ten most common resources in the game.
2. The `productCategory`: `MechSuits` is a Necramech though its category is
   `Warframes`, `OperatorAmps` an amp, `SentinelWeapons` a companion's
   weapon.
3. The `type`: a kitgun's chamber is category `Misc`, and goes with the
   secondaries.
4. The category.

What no group draws is left out of the index: gear, K-Drives, quests, and an
arsenal item the catalog marks `masterable: false`, which is a modular part (a
Zaw's grip, a Moa's legs) and would pollute a mastery denominator. The amp and
the Railjack are the exceptions: their parts are the whole of what the player
gathers, so the group holds them all.

## What the drop tables cannot place, and the curated file that answers it

Companions and vehicles are not dropped. A Moa is built by Legs in Fortuna, a
Predasite is captured in the Cambion Drift, an Itzal is researched in a dojo.
The verb is not "drop", so no drop table names them, and the fix is not more
data: it is treating the acquisition verb as a field:

```
drop · bounty · conservation · vendor · research · incubate · lich · granum · quest · market
```

37 items across the whole game have no location in any machine source: 17
pets, 9 sentinels, 3 archwings, 7 arch-guns and 1 arch-melee. They live in
`data/acquisition.yaml` ([`curated-files.md`](curated-files.md)). A row with
`place: null` has no place on the map; the researched ones among them reach the
Dojo through the research table.

## The systems are curated, and so are their names

No source groups places into systems: the node catalog has 452 nodes and no
system field. `data/systems.yaml` is therefore hand-written:

- The systems come in BR-47's order: Origin, Pom-2 PC, Duviri, Empyrean
  Proxima, Dark Refractory, Tau.
- The Origin System's places follow `star_chart_order`, each place off the
  chart right after the planet it sits `after` in `grafo.yaml`, and the Dojo
  last. A test holds the order.
- Every place is spelled as `grafo.yaml` spells it, so reach can measure it.
  The sources spell two of them otherwise, and `aliases` reads those under the
  same name: the drop tables' `Dark Refractory, Deimos` and the wiki's
  `Zariman Ten Zero`. The aliases are applied as the files are read, so nothing
  downstream sees the other spelling.
- Dark Refractory is a peer of Duviri and Höllvania, not a child of Deimos.
  The item-level drop string suggests a sub-area, but DE's own mission table
  lists it as a top-level key with four nodes, and in game it is reached from
  the Orbiter rather than from Deimos.
- Tau is carried as announced, with `released: false` and no places, because
  it has no nodes and no items.

## The Dojo

BR-57 makes the Dojo a place in the Origin System that holds everything built
from research in a clan dojo's labs. The research table names 188 things; 144
resolve to an item the index holds, through the same reward index as the drop
tables, and land in the Dojo as 114 items (a Warframe's three parts are one
Warframe), each with the verb `research` and its lab. The 44 that do not are
gear, which no group draws (stims, restores, keys, Specters), or not items the
catalog has (Orbiter and landing-craft segments, a solar rail, dojo
decorations). A test pins the list, so a refresh that changes it is seen.

The Dojo is on no chart, so the focus never lands on it (BR-57), and its reach
is the clan: a profile that names one (`GuildId`) can enter it
([`system.md`](system.md#two-lenses-that-cut-every-level-at-once)).

## Update art

`gameUpdates` names an update the way a player recognises it ("Jade Shadows:
Constellations", not "Update 43"), and the wiki has a page image under that
name for almost every major update. `pnpm data:refresh` asks the wiki by
**name**, never by version: `Update 43` has no page, the name it shipped under
does. `data/vendor/update-art.json` holds art for 61 names; a name with no art
renders as a name, never as a placeholder.

## What the profile cannot date

The New lens compares an item's `releaseDate` against the chosen month. Only
135 of Earth's 187 items carry one, so New is a floor, not a census: it can
only ever under-report. Measured on 2026-10-13.
