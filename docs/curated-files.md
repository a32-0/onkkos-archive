# Curated files

The YAML files in `data/` are the hand-curated half of the product. They sit
in a folder of their own rather than at the repo root because they are runtime
inputs, read from disk on every request, not prose: `docs/` is what a
maintainer edits freely, `data/` is what the app parses and validates.
They change only when a maintainer edits them and commits, and they carry no
comments: this page is their documentation. Every one is validated with zod
when it loads (`src/domain/*/schema.ts`), and the test suite asserts the
cross-file invariants listed below.

`data/vendor/` holds the other half: snapshots of outside sources, written by
two scripts and never at runtime. Their sources and licences close this page.

## `grafo.yaml`: the dependency model

Data source: `api.warframe.com/cdn/getProfileViewingData.php`, the public
profile, read as DE sends it. [`engine.md`](engine.md) explains how the engine
walks this file.

### `star_chart_order`

The junction chain, used by the `unlock_next_planet` goal and by the
frontier. The engine walks the list in order and returns the first
`junction_tag` missing from the profile's `Missions[].Tag`.

The order is **progression order, not solar distance**: every `junction_tag`
names its own prerequisite (`VenusToMercuryJunction` means Venus precedes
Mercury), so the list is the topological sort of those tags. In solar
distance order a player with zero junctions was told "Mercury", which itself
needs Venus first. The branch points (Earth → Venus/Mars, Mars →
Phobos/Ceres, Jupiter → Europa/Saturn) are flattened into one line; the
engine only needs a valid order, not the tree. Earth has `junction_tag: null`
and is always unlocked.

### `nodes`

Reusable pieces. Each answers what it is (`label`, `type`), how it is
verified (`check`) and what it needs beforehand (`requires`, node ids).
Goals reference nodes by id.

`check` takes one of four shapes:

| Shape          | Fields                        | Example                                                                    |
| -------------- | ----------------------------- | -------------------------------------------------------------------------- |
| array-contains | `field`, `equals`             | `Missions[].Tag` equals `DeimosHub`                                        |
| array-where    | `field`, `where`, `condition` | `Affiliations[]` where `Tag == 'EntratiSyndicate'`, condition `Title >= 2` |
| scalar         | `field`, `compare`, `value`   | `PlayerLevel` `>=` `8`                                                     |
| manual         | `manual: true`, `question`    | Asked to the player, never inferred                                        |

A node may also carry an optional **`item`**: the catalog name of the thing
the step is actually about. `necramech_components` carries `item: "Voidrig"`.
It is a name, not a uniqueName, so the file stays readable; a name that
matches no catalog entry simply yields nothing. Only add it where the node
really is one buildable item: a node covering a category would silently show
one arbitrary member of it.

### `goals`

The three goals of the first version, each naming an item, a quest or a place
(BR-37); the goals that named none of those are in `deferred.md`. Fields:

- `label`: the goal's name in the file. The card's title is Goal's own copy.
- `audience` (`new` / `mid` / `veteran` / `both`): ordering only.
- `pathway`: one of the four paths DE's new-player guide sorts the game into
  (`star_chart`, `collect`, `grow`, `explore`).
- `place`: the place the goal is about, when it has one.
- `quest`: the quest the goal is about, spelled as `narrative_spine.yaml`
  spells it. The goal is done once quest evidence confirms it (spec 08).
- `requires`: node ids; `check`: an optional check on the goal itself.
- `resolution: dynamic` + `source: star_chart_order`: the star chart goal.
- `manual_checklist_if_missing`: quest names, spelled exactly as
  `narrative_spine.yaml` does. The engine marks one done when
  `quest_evidence.yaml` proves it and asks about the rest.

### `off_chart_places`

The places that exist in the game but not on the junction chain: Duviri,
Deimos, Void, Sanctuary, Lua, Kuva Fortress, Zariman, Höllvania, Dark
Refractory and the seven Empyrean Proximas (Earth, Venus, Saturn, Uranus,
Neptune, Pluto and Veil), in the order the game's Empyrean chart lists them.
Each has `after` (the chain planet it is displayed beside) and `unlocked_by`
(the quest that opens it, or `null`). A place off the chart is in reach when
its `after` is (BR-59), so nothing else is read of it.

Sanctuary and Dark Refractory came with BR-59, settled on 2026-10-08. Neither
quest can be read, so the planet before it is the measure of reach: Europa for
Sanctuary (The New Strange), Sedna for Dark Refractory (The Old Peace), as for
Höllvania.

The schema rejects a place that duplicates a `star_chart_order` planet and one
whose `after` is not a chain planet.

### `update_names`

Seven rows, each `version` and `name`. They are corrections, not a model:
the list of updates a returning player can pick from comes from DE's patch
notes (`patch-notes.json`, BR-09) and, before Update 19, from the catalog;
only the names those get wrong or omit are curated, and a curated name wins
over both.

`@wfcd/items` carries an `introduced` object on most items:

```
{ name: "Update 31.5", aliases: ["31.5", "Angels of the Zariman"],
  parent: "31.0", date: "2022-04-27",
  url: "https://wiki.warframe.com/w/Update_31#Update_31.5" }
```

The list of updates keys on the entry whose `name` is exactly `Update N.0`
and takes that entry's own `date`. The obvious alternative, the earliest date
among items whose `parent` major is N, is wrong: `parent` carries
retro-tagged noise and puts Fortuna in January 2018 instead of November. That
date is not cosmetic; it becomes the month that drives what is new since, so
a test pins Fortuna at `2018-11-08`.

That yields 29 majors, U15 to U43. Twenty-five carry a usable title in
`aliases`; the other four have none, and three more are unusable (`OA`,
`CH`, and `Whispers in the Wall`, truncated). Those seven are the curated
rows, each resolved against the wiki's own update page:

| Version | Name                   | Why curated      |
| ------- | ---------------------- | ---------------- |
| 17      | Echoes of the Sentient | no alias         |
| 18      | The Second Dream       | no alias         |
| 20      | Octavia's Anthem       | alias reads `OA` |
| 21      | Chains of Harrow       | alias reads `CH` |
| 33      | The Duviri Paradox     | no alias         |
| 35      | Whispers in the Walls  | alias truncated  |
| 40      | The Vallis Undermind   | no alias         |

**The catalog is the authority on dates, the wiki on names.** They disagree
on U33: the catalog says 2023-04-26 and the wiki's page reads July. Duviri
launched on 26 April, and a date is what the rest of the app computes from,
so the catalog wins. A name is a proper noun nobody computes with, so the
wiki wins.

## `narrative_spine.yaml`: story arcs

Source: `https://wiki.warframe.com/w/Quest` ("Available Quests" for the
main / side / Warframe split, "Quest Progression", "Quests by Release
Date") plus each quest's own page. Arc labels follow DE's quest guide
(`warframe.com/en/guides/quests`) so the player reads the same chapter names
in both places.

This file changes with every major game update. DE has reordered the path
several times (Duviri moved twice; Stolen Dreams and The New Strange left
the main path in 2023; Saya's Vigil went main in October 2023 and back to
side once Cetus stopped being the road to the Mars Junction). Re-check the
source on every major patch.

Per-quest fields:

- `quest`: the name, the key every other file uses.
- `kind`: `main` (default), `side` or `warframe`, the wiki's three lists.
  Only main quests move the player along the story; side and Warframe quests
  sit in the arc where their gate opens and never block the path.
- `wiki`: the wiki page title, exactly; its lead paragraph is the synopsis
  at render time.
- `requirement`: what unlocks the quest, as the wiki's infobox states it.
  Prose for the screen, not a check.
- `start`: how the quest is begun in the game. "Codex → Quests" is the
  Orbiter's Codex.
- `locations`: planets and hubs the quest's missions visit. Prose and
  backdrop, not a check.
- `release`: ISO date the quest shipped; drives `/catch-up`. Prelude to War
  is dated by its last part (The Maker, 2020-03-24).
- `official`: DE's spoiler-light guide page, when one exists.
- `available_at`: planets that must be unlocked before the quest can be
  started, when the gate is a planet. This is access, not completion. Quests
  gated by another quest, a rank or an Orbiter segment carry no value.
- `note`: free text. A note containing "doesn't block the main path" marks
  a main-story branch as off-path.

Which arc unlocks a side quest is derived, not stated by the wiki: it is
where the quest's gate falls on the main path.

## `quest_evidence.yaml`: how quests are confirmed

Each rule says: if the profile shows THIS, THAT quest is complete. Evidence
only ever confirms; the app never marks a quest "not done" from this file.
Every rule cites the wiki page that states the requirement (`source`) and
may carry a `note`.

Evidence kinds:

| Kind           | Field   | Reads                                                                                                                                |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `flag`         | `field` | A boolean at the profile root (`UnlockedOperator`)                                                                                   |
| `affiliation`  | `tag`   | A tag in `Affiliations[]`; standing can only be earned once the syndicate is open                                                    |
| `mission`      | `tag`   | A tag in `Missions[]`; a hub that only opens after the quest                                                                         |
| `mission_type` | `type`  | Any star chart node of this mission type in `Missions[]`, as `warframe-worldstate-data` spells it (substring match)                  |
| `item`         | `type`  | An `ItemType` in `LoadOutInventory.XPInfo` that only exists as the quest's completion reward, never sold in the Market nor tradeable |

What is deliberately absent, and why, is in `narrative.md`.

## `sources.yaml`: where an item comes from when no module says

The item view answers "where does this come from" from data: DE's drop tables,
`@wfcd/items`, and the wiki's Lua modules vendored by `pnpm data:wiki`. A few
dozen items have their source only in the prose of their wiki page's
Acquisition section: Market-only weapons, quest rewards, Teshin's Cave,
Founders items, Ephemera from a Lich or a Nightwave season. This file carries
those sources as structured routes, researched from that prose, so they render
with the same rigor as the rest.

Two lists:

- `vendors`: access gates the wiki states on the vendor's page, not on each
  offer. Amir needs The Hex, Cavalero needs Angels of the Zariman, Roathe needs
  The Old Peace. Every offer from that vendor adds those quests to
  Prerequisites. Each entry has `vendor`, `quests` and `cite`.
- `stores`: a store the wiki's Vendors module names by its button rather than
  by who sells it. Each entry has `store` (the module's key), `vendor` (who
  the player buys from), `link` (the wiki page that lists the store's wares),
  an optional `quest` that gates every offer, and `cite`. Exchange Scuttler
  Husks is Acrithis in the Dormizone, after The Hex; the module links a page
  that does not exist (found on 2026-10-23 on Thalys).
- `items`: one entry per item, spelled as `@wfcd/items` spells it (the match
  ignores case). `cite` is the wiki page the routes were read from; it is also
  the row's Wiki link. `routes` is a list of typed sources.

Every route has a `type`; a route that names a `part` applies to that part
only and is always shown, and one without applies to every part with no other
route. The types and their fields:

| Type          | Fields                                               | Renders as                                      |
| ------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `vendor`      | `vendor`, `place`, `thing`, `costs`, `quest`, `rank` | Buy it from {vendor}, with price and rank       |
| `copies`      | `vendor`, `costs`                                    | Buy another copy from {vendor}                  |
| `market`      | `credits` or `platinum`, `blueprint`, `bundle`       | Buy it (or its blueprint) in the Market         |
| `quest`       | `quest`, `choice`                                    | Complete {quest}                                |
| `junction`    | `junction`                                           | Clear the {junction}, with its planet           |
| `enigma`      | `chance`, `quest`                                    | Solve Enigma puzzles in Duviri                  |
| `invasion`    | none                                                 | The Invasion system                             |
| `anniversary` | `year`                                               | Claim it from the anniversary alerts            |
| `unavailable` | `reason`, `event`, `until`                           | No longer obtainable, and why                   |
| `race`        | `race`, `place`                                      | Win the {race} K-Drive race                     |
| `bundled`     | `with`                                               | Claim a {Necramech}                             |
| `primeAccess` | `warframe`, `from`, `until`, `resurgence`            | Buy the Prime Access Accessories pack           |
| `adversary`   | `adversary`, `element`, `chance`                     | Vanquish or convert a {element} {adversary}     |
| `nightwave`   | `ranks` (season and rank)                            | Earn it in Nightwave                            |
| `drop`        | `source`, `chance`                                   | Defeat {source}                                 |
| `event`       | `event`, `vendor`, `costs`, `progress`               | Play {event}                                    |
| `goal`        | `focus`, `wearing`                                   | Earn {focus} Focus wearing {Ephemera}           |
| `scan`        | `target`, `chance`                                   | Scan a live {target}                            |
| `cyst`        | `warframe`, `days`                                   | Get infected by {warframe} in the Helminth room |
| `dojo`        | `room`                                               | Buy it in {room}, at the blueprint's own price  |
| `circuit`     | `mode`, `tier`                                       | Play the Circuit (generated, not written here)  |

Rules for editing it:

- Read numbers from the raw wikitext (`index.php?action=raw`), never from the
  plain-text extract. The extract drops the currency icon, so "for 225" could
  be platinum or credits; the wikitext says `{{pc|225}}`, `{{cc|15,000}}` or
  `{{sc|100,000}}`.
- Add an item here only when no vendored module carries its source. If a
  module starts carrying it after a refresh, delete the entry.
- `tests/coverage.test.ts` fails when any arsenal item or collectible renders
  with nothing but a wiki sentence. That test, not this file, is the measure.

## `acquisition.yaml`: what no drop table names

Thirty-seven companions and vehicles are incubated, built, captured or
researched rather than dropped, so no machine source places them. Each row
has `item`, `place`, `verb` (how it is obtained) and `from`, and `verify`
marks the rows still waiting on a player's eye. A row with `place: null`
has no place on the map. `place-index.md` explains where the rows are read.

## `systems.yaml`: the systems and their places

The systems in BR-47's order, each with `id`, `name`, `released` and its
`places`. The Origin System's places follow `star_chart_order`, each place off
the chart after the planet it sits `after` in `grafo.yaml`, and the Dojo
(BR-57) last. Tau is `released: false` with no places. `aliases` maps a
source's spelling of a place to the one used here, applied as the drop tables
and the wiki's region resources are read. `place-index.md` explains why.

## Invariants the tests enforce

- Every `requires` in `grafo.yaml` points at an existing node.
- Every `junction_tag` names a planet earlier in `star_chart_order`.
- Every goal carries one of the four pathways.
- Every goal's `quest` and `manual_checklist_if_missing` use the spine's
  spelling.
- Every `available_at` planet exists in `star_chart_order`.
- Every main-path quest has a release date.
- Every quest has `wiki`, `start`, `requirement` and at least one location.
- Every `quest_evidence.yaml` rule cites the wiki and names a quest spelled
  as the spine spells it.
- `sources.yaml` parses against its schema, names no item twice, and leaves no
  arsenal item or collectible answered by prose alone.
- `acquisition.yaml` names no item twice, and only items the catalog has.
- `systems.yaml` lists the systems in BR-47's order and every place once;
  every place is on `star_chart_order`, in `off_chart_places` or the Dojo,
  and every place there is in a system; the Origin System's places follow the
  chart, the Dojo last.

## Vendored snapshots

Five scripts write `data/vendor/`, and nothing else does: `pnpm data:refresh`
(`scripts/refresh-drops.mjs`), `pnpm data:wiki` (`scripts/refresh-wiki.mjs`),
`pnpm data:patch-notes` (`scripts/refresh-patch-notes.mjs`),
`pnpm data:vendor-art` (`scripts/refresh-vendor-art.mjs`), which reads
`wiki-vendors.json` and `items.json` and so runs after `data:wiki`, and `pnpm data:items`
(`scripts/refresh-items.mjs`). Each reduces
its source to the fields the app reads; `manifest.json` records when the first
two ran and how much they kept, `patch-notes.json` carries its own
`refreshedAt` and `items.json` the version of `@wfcd/items` it was written
from. A refresh is a commit of its own, never part of a feature.

`items.json` exists so that no deployed function carries `@wfcd/items`: the
package is about 94 MB, two thirds of it translations the app never reads, and
every route that read it weighed about 122 MB, too much for Vercel to put two
routes in one function (plan part 4). The snapshot keeps each category file of
the package, Enemy left out and Components last as the package loads them,
each item resolved as the package resolves it and cut to the fields the domain
reads; `readItems()` concatenates the categories asked for and sorts them by
name, then `uniqueName`, as the package does. It is written one item per
line, so a content update reads as a diff of the items it changed.
`tests/items-snapshot.test.ts` builds every consumer, the arsenal, resources,
glyphs, relics, collectibles, gear, the places' catalog and the updates, from
the package and from the snapshot and requires the same result, and requires
the snapshot's version to be the installed one: updating `@wfcd/items` without
`pnpm data:items` fails `pnpm check`, and so does a field the domain starts
reading that the snapshot does not keep. Such a field is added to `FIELDS` in
the script.

| File                     | Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items.json`             | `@wfcd/items`: every category but Enemy, each item cut to the fields the domain reads, with the package's version                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `place-rewards.json`     | WFCD's `warframe-drop-data`: the mission rewards and six bounty tables, built from DE's drop tables                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `region-resources.json`  | The wiki's `Module:Missions/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `update-art.json`        | The wiki's API: the lead image of each update's page, as a link; used where `patch-notes.json` has no art                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `vendor-art.json`        | The wiki's API: the lead image of each page of a vendor paid in Standing or Stock, a syndicate's sigil; the Credits page                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `drop-sources.json`      | The wiki's API: for each source in `items.json`'s drops that is not a node, a bounty, a relic or a vendor's rank, what it is (an enemy, an activity or an object, from its page's categories, or from its name when it has no page) and the lead image of its page. A variant with no page of its own (Narmer, Elite, Arid, Kuva and the rest listed in the script) takes its base enemy's page, so "Narmer Thumper Bull" takes Thumper Bull's; an enemy whose page has no lead image takes the wiki file or page the script names for it (Erra takes `File:Erra.png`, Profit-Taker the Profit-Taker Orb's page), at the wiki's 480 px thumbnail; the six stages of The New War that DE's tables name are listed in the script as activities |
| `patch-notes.json`       | DE's patch notes index and its JSON feed: each update's version, name, date, art and page, hotfixes left out                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `wiki-blueprints.json`   | `Module:Blueprints/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `wiki-nodes.json`        | `Module:Missions/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `wiki-resources.json`    | `Module:Resources/data`: each resource's rarity, type, image file and where it comes from, read from its "Location", its "Source" or the sentence of its description that says how it is earned                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `wiki-research.json`     | `Module:Research/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `wiki-vendors.json`      | `Module:Vendors/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `wiki-traits.json`       | `Module:Weapons/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `wiki-baro.json`         | `Module:Baro/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `wiki-relics.json`       | `Module:Void/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `wiki-companions.json`   | `Module:Companions/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `wiki-honorias.json`     | `Module:Honorias/data`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `wiki-titles.json`       | `Module:Weapons/data`, `Module:Companions/data`, `Module:Honorias/data`, `Module:Cosmetics/data/ephemera`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `wiki-circuit.json`      | The wiki's page "The Circuit"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `wiki-incarnons.json`    | Each Incarnon weapon's page on the wiki                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `wiki-honoria-tags.json` | The wiki's page "Honoria"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `wiki-adversaries.json`  | Each adversary's pages on the wiki                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

The licences, read from each source on 2026-10-13:

- **`warframe-drop-data`** is released under the MIT License. The drop tables
  it is built from are published by Digital Extremes.
- **The wiki** (`wiki.warframe.com`, its page `Warframe_Wiki:Copyrights`)
  releases code in the Module namespace under CC BY-SA unless a module says
  otherwise. For page text that page also says CC BY-SA, while every page's
  footer reads CC BY-NC-SA 3.0. The snapshots read from pages are held to
  the stricter of the two; the app carries no revenue, and this page credits
  the wiki.
- **Images** are never copied. `update-art.json`, `vendor-art.json` and `drop-sources.json` hold links, and the art is
  served from the wiki. The wiki states that DE's assets are used with DE's
  permission or as fair use.
