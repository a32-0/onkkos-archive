# Equipment unlock requirements: what the available sources can and cannot state

Research pass, 2026-09-20. Offline only: `node_modules/@wfcd/items@1.1275.72`,
a full capture of a real profile (never committed) and
`warframe-worldstate-data`. No call was made to
DE's endpoints.

The question: for every kind of equipment, what gates its unlock, which source
states that gate, and whether the public profile can tell us the player has
passed it.

## Method and population

"Equipment" is read wide: every masterable item in the ten arsenal category
files, plus the equippable classes that sit outside them (Railjack armaments,
Arcanes, Gear, modular parts, Quests). The masterable arsenal population is
**794 items**.

| File                   | Masterable | Notes                                                                                                       |
| ---------------------- | ---------: | ----------------------------------------------------------------------------------------------------------- |
| `Warframes.json`       |        120 | 117 Suits + 2 MechSuits + 1 SpecialItems                                                                    |
| `Primary.json`         |        195 | includes 1 OperatorAmp                                                                                      |
| `Secondary.json`       |        148 |                                                                                                             |
| `Melee.json`           |        235 | 224 Melee + 45 `Zaw Component` rows, of which 11 are masterable                                             |
| `Archwing.json`        |          5 |                                                                                                             |
| `Arch-Gun.json`        |         20 |                                                                                                             |
| `Arch-Melee.json`      |          8 |                                                                                                             |
| `Sentinels.json`       |         17 |                                                                                                             |
| `SentinelWeapons.json` |         24 |                                                                                                             |
| `Pets.json`            |         22 | of 66 rows; the other 44 are Moa parts (26 `Pet Resource`), Hound parts (16 `Pet Parts`) and 2 SpecialItems |
| `Railjack.json`        |          0 | 143 rows, all `masterable: false`                                                                           |
| `Gear.json`            |          0 | 184 rows, all `masterable: false`                                                                           |
| `Arcanes.json`         |          0 | 172 rows, all `masterable: false`                                                                           |
| `Misc.json`            |          9 | 5 K-Drive + 4 Kitgun components                                                                             |
| `Quests.json`          |          0 | 46 rows                                                                                                     |

## The three sources, and what each can say about a gate

1. **Public profile** (`api.warframe.com/cdn/getProfileViewingData.php`) says
   what the player has _passed_, never what a gate _is_. Readable fields, as
   captured: `LoadOutInventory.XPInfo` (495 entries, per-item
   `ItemType` + `XP`, so ownership and per-item mastery), `PlayerLevel` (27),
   `Missions[]` (406 entries, `Tag` + `Completes` + `Tier`), `Affiliations[]`
   (35 entries, `Tag` + `Standing` + `Title`), `PlayerSkills` (Railjack and
   Drifter intrinsics), `UnlockedOperator`, `Stats`.
2. **`@wfcd/items`** (Public Export) says what the gate _is_, for the gates it
   models: mastery rank, foundry cost, build time, components, drop tables,
   market cost, vault status, tradability.
3. **Curated files** (`grafo.yaml`, `narrative_spine.yaml`, `quest_evidence.yaml`)
   say what neither of the other two can: quest prerequisites, quest rewards,
   and the proxy rules that let a quest be confirmed from profile evidence.

## The gate taxonomy

Nine gate kinds appear in the data. Each row: what states it, the field that
carries it, and whether the profile can confirm the player has cleared it.

| #   | Gate                    | Stated by                   | Field                                                                                       | Profile can confirm?                                                              |
| --- | ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **Mastery Rank**        | `@wfcd/items`               | `masteryReq`                                                                                | **Readable**: MR derived from `XPInfo` + `PlayerLevel`                            |
| 2   | **Foundry build**       | `@wfcd/items`               | `buildPrice` (credits), `buildTime` (s), `components[].itemCount`                           | **No**: the foundry queue is not in the payload                                   |
| 3   | **Blueprint purchase**  | `@wfcd/items`               | `bpCost` (credits), `marketCost` (platinum)                                                 | **No**: unbuilt blueprints are not in the payload                                 |
| 4   | **Mission drop**        | `@wfcd/items`               | `components[].drops[]` → `location`, `chance`, `rarity`                                     | **Partly**: `Missions[].Tag` says the node was played, never that the drop landed |
| 5   | **Relic / Void**        | `@wfcd/items`               | `components[].drops[]` naming a relic + refinement; `Relics.json` for where the relic drops | **No**: relic inventory is not in the payload                                     |
| 6   | **Syndicate standing**  | `@wfcd/items`, partially    | `drops[].location` matching a syndicate name                                                | **Partly**: `Affiliations[].Standing`/`Title` give current rank, not the purchase |
| 7   | **Quest completion**    | Curated only                | `narrative_spine.yaml` `requirement`; `quest_evidence.yaml` rules                           | **By proxy only**: confirms, never denies                                         |
| 8   | **Clan dojo research**  | `@wfcd/items`, by path only | `/ClanTech/` in `uniqueName`                                                                | **No**: dojo research state is not in the payload                                 |
| 9   | **Not stated anywhere** | none                        | none                                                                                        | **No**: see the gap section                                                       |

### Gate 1: Mastery Rank

`masteryReq` is non-zero on 557 of the 794 masterable items. It is zero across
every Warframe, Archwing, Sentinel and Pet (those classes carry no MR lock)
and non-zero on most weapons: Primary 183/195, Secondary 141/148, Melee 206/235,
Arch-Gun 17/20, Arch-Melee 7/8, Sentinel weapons 3/24.

This is the only gate the profile confirms outright, because MR is computed from
the same `XPInfo` array the app already reads.

### Gates 2 and 3: foundry and market

Present together on nearly everything buildable: `buildPrice` + `buildTime` on
118/120 Warframes, 165/195 Primaries, 125/148 Secondaries, 207/235 Melee.
`bpCost` (credits for the blueprint itself) is far sparser (28/120 Warframes,
69/195 Primaries) because most blueprints drop rather than sell. `marketCost`
(platinum) is the escape hatch on 63/120 Warframes and 82/195 Primaries.

`components[].itemCount` gives the exact resource bill. For Excalibur:
1 Blueprint, 1 Chassis, 1 Neuroptics, 1 Systems, 1 Orokin Cell. Resource
components carry no drops of their own, so "where do I farm an Orokin Cell"
resolves against `Resources.json`, which the app already loads.

Neither gate is confirmable. The profile shows an item once it has been built
and gained XP; it says nothing about blueprints owned or a build in progress.

### Gate 4: mission drops

Drop entries across the arsenal population, by location shape:

| Shape               | Entries |
| ------------------- | ------: |
| Relic               |  18,383 |
| Node + rotation     |     446 |
| Bounty / open world |     444 |
| Plain node          |     338 |
| Syndicate           |     223 |

The location string is unstructured (`"Mars/War (Assassination)"`,
`"Earth/Cetus (Level 15 - 25 Plague Star), Rotation A"`); `parseLocation()` in
`src/domain/catalog/acquisition.ts` already splits it into
place, node, source and rotation. `chance` and `rarity` come with it, which is
what makes a line like "Barrel, Blueprint, Receiver · Caches · Rot. B · 6.45%"
derivable rather than curated.

### Gate 5: relics

The Prime chain is fully derivable offline, contrary to what the drop-table size
suggests. Component drops name the relic **and its refinement**:

```
Ash Prime
  Blueprint   -> Axi I3 Relic @11% (Uncommon), Lith S3 Relic @11%
  Chassis     -> Axi B1 Relic (Radiant) @16.67%
  Neuroptics  -> Axi N2 Relic @11%, Meso N2 Relic @11%
  Systems     -> Axi A7 Relic (Radiant) @10%, Axi N1 Relic (Radiant) @10%
  Orokin Cell -> (resource, no drops)
```

Where the relic itself drops lives in `Relics.json`: 3,120 rows, of which 167
are non-vaulted and **136 of those carry `locations[]`** with node, rotation,
chance and rarity. The full chain, Prime part → relic → farmable node, is
therefore complete for live relics and empty for vaulted ones, which is correct:
a vaulted relic has no farm.

The cost was file size: `Relics.json` is 8.3 MB, and the app first chose not
to load it. The relic catalog now reads it for each relic's icon and its
`vaulted` flag, and where a relic drops comes from `place-rewards.json`
([`items.md`](items.md)).

Vault status is carried per item: `vaulted`, `vaultDate`, `estimatedVaultDate`.
Ash Prime reads `vaulted: true, vaultDate: 2017-05-30`. 44 of 120 Warframes and
24 of 195 Primaries are vaulted.

### Gate 6: syndicates

223 drop entries match a syndicate name, and that is the whole of it. The
`standing` and `required` fields in `Misc.json` look like syndicate costs but
are not: **all 226 rows carrying them are `Nightwave Challenge` entries**, where
`standing` is the Nightwave reward and `required` is the completion count.

What _is_ present, encoded inside the `location` string rather than as fields,
is the vendor and the required rank. Across the catalog **369 drop entries in 84
distinct shapes** follow the pattern `Syndicate (Vendor), Rank`:

```
Solaris United (Rude Zuud), Neutral
Ostron (Old Man Suumbaat), Kin
Entrati (Father), Stranger
NecraLoid (Loid), Clearance Odima
Ventkids, Primo
Cephalon Suda, Genius
```

So "which syndicate" and "at which rank" are derivable. Only the **standing
price**, the number of standing the purchase costs, is missing, and that gap
is structural: `@wfcd/items` ships 24 files in `data/json/` and **none of them
is a vendor, offering or syndicate-shop file**. There is no place in the package
for a price to live.

One caveat for whoever consumes this: `parseLocation()` in
`src/domain/catalog/acquisition.ts` does not recover the rank
today. Its paren regex is anchored to end-of-string, so
`Solaris United (Rude Zuud), Neutral` parses to node
`Solaris United (Rude Zuud)` with a null source and the rank silently dropped.

The profile gives current standing and title per syndicate (35 `Affiliations`
entries in the fixture), so "can afford" is answerable; "already bought" is not.

### Gate 7: quests

Not in the catalog. `Quests.json` has 46 rows and only 2 carry drops; no field
links a quest to the equipment it rewards.

`classify()` accepts a `questReward` parameter, but **its one call site passes
`null`** (`src/domain/catalog/releases.ts`). The `quest`
branch is unreachable today, so quest-gated equipment falls through to
`market` or `unknown`.

The prerequisite chain between quests is curated in `narrative_spine.yaml`
(`requirement`, `start`, `available_at` per quest). Completion is confirmable
only through `quest_evidence.yaml`, and only in the affirmative direction.

### Gate 8: clan dojo

Detected by `/ClanTech/` in the `uniqueName` and nothing else. No research cost,
no clan tier requirement, no lab name in the data. Dojo research state is absent
from the profile, so this gate is manual end to end.

## Where the gates run out

Of the 794 masterable arsenal items, **360 have no drop entry anywhere**:
neither on the item nor on any component. 188 of those carry a `bpCost` or
`marketCost`, so "buy the blueprint from the Market" is a defensible reading.

That leaves **172 items with no readable gate of any kind**. They are not
random; they cluster into acquisition systems the catalog does not model:

| Cluster           | Count | Real gate                                                        |
| ----------------- | ----: | ---------------------------------------------------------------- |
| Uncategorised     |    71 | mixed: quest rewards, starter gear, Duviri, events               |
| Kuva (Lich)       |    21 | Kuva Lich chain, requires _The War Within_                       |
| Tenet (Sister)    |    16 | Sisters of Parvos, requires _Call of the Tempestarii_            |
| Prisma            |    15 | Baro Ki'Teer, rotating stock                                     |
| Coda (Technocyte) |    13 | Technocyte Coda, requires _The Hex_ content                      |
| Prime, no relic   |    10 | Founder (Excalibur Prime, Lato Prime, Skana Prime) or unreleased |
| Wraith            |     8 | historic events / Baro                                           |
| Vandal            |     7 | historic events / Baro                                           |
| Mk1 starter       |     7 | market, zero cost                                                |
| Dex               |     4 | anniversary gift, annual                                         |

Three Warframes in that list deserve naming because they sit on the critical
path of real goals: **Voidrig** (Isolation Vault, Deimos), **Excalibur Umbra**
(_The Sacrifice_) and **Orion & Sirius** (recent release). None is derivable;
each needs a curated rule or a wiki link.

## Equipment classes outside the masterable arsenal

Modular equipment _is_ modelled, contrary to first impression; it is simply
scattered across files by weapon slot rather than grouped as a class.

| Class                                          |               Rows | What the catalog states                                                                                                                                                                           | What is missing                                               |
| ---------------------------------------------- | -----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Arcanes (`Arcanes.json`)                       |                172 | 162 carry drops with node + rotation + chance; 165 carry a wiki URL                                                                                                                               | Nothing material; not masterable, so no MR gate               |
| Railjack armaments (`Railjack.json`)           |                143 | 135 carry drops                                                                                                                                                                                   | No wiki URL, no build cost, no research cost                  |
| Gear (`Gear.json`)                             |                184 | 66 carry drops, 77 carry `buildPrice`                                                                                                                                                             | Gate for the remaining ~100                                   |
| Zaw components (`Melee.json`, `Zaw Component`) | 45 (11 masterable) | 37 carry `buildPrice`, 8 carry drops                                                                                                                                                              | Ostron standing price; vendor and rank are in the drop string |
| Kitgun components (`Misc.json`)                |  28 (4 masterable) | all 28 carry `buildPrice` (5,000 cr) and 5 components                                                                                                                                             | Solaris United standing price only                            |
| K-Drive components (`Misc.json`)               |  20 (5 masterable) | all 20 carry `buildPrice` and 5 components                                                                                                                                                        | Vent Kids standing price only                                 |
| Amps (`Misc.json`, `Amp`)                      |  24 (0 masterable) | 21 carry `buildPrice` (5,000 cr), `buildTime` 3,600 s, and a full resource bill, e.g. Cantic Prism: 1 Blueprint, 3 Gyromag Systems, 6 Longwinder Lathe Coagulant, 3 Radiant Zodian, 3 Vega Toroid | Quills / Vox Solaris standing price only; no wiki URL         |
| Moa parts (`Pets.json`, `Pet Resource`)        |                 26 | `buildPrice` 50,000 cr                                                                                                                                                                            | Solaris United standing price only                            |
| Hound parts (`Pets.json`, `Pet Parts`)         |                 16 | `buildPrice` 1,000 cr                                                                                                                                                                             | Entrati standing price only                                   |
| Quests (`Quests.json`)                         |                 46 | 2 carry drops                                                                                                                                                                                     | Everything; the curated layer covers this                     |

The pattern is uniform: for every modular class the **foundry half of the gate
is complete** (credits, build time, exact resource bill) and the **vendor half
is all but one field**: syndicate and rank ride inside the drop `location`
string, and only the standing price is missing (which syndicate, which rank, how much standing). One missing file,
ten missing prices.

## What this means for the app

- **One gate is solved end to end**: Mastery Rank. Requirement from the catalog,
  clearance from the profile.
- **Four gates have a complete requirement and no confirmation**: foundry,
  market, relic, dojo. The app can always say _what_ is needed and _where_; it
  can never say _done_. That matches the "never a warehouse clerk" rule: the
  requirement carries the hard fact, the state stays honest.
- **Two gates are half-readable**: mission drops (node played, not drop landed)
  and syndicates (standing known, purchase not).
- **Two gates need curation or a wiki link**: quests, and the 172-item tail.
- The `questReward` branch in `classify()` is dead code. Wiring it to
  `narrative_spine.yaml` would move part of the 71 uncategorised items, the
  quest-reward frames in particular, out of the tail.
- The relic chain is a decision, not a limitation. Loading `Relics.json` would
  complete Prime acquisition down to the farmable node for the 136 live relics.
- Modular equipment (Zaw, Kitgun, Amp, Hound, Moa, K-Drive) is half-stated: the
  foundry cost, resource bill, syndicate and vendor rank are all present; only
  the standing price is missing, because `@wfcd/items` ships no vendor file.
  That one number is curation or a wiki link.

## Sources

- `@wfcd/items@1.1275.72`, `data/json/*.json`, read directly.
- A full capture of a real profile, taken on 2026-09-04, never committed.
- `api.md` for the profile endpoint's behaviour.
- `narrative_spine.yaml` and `quest_evidence.yaml` for the curated quest layer.
