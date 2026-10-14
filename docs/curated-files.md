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
belongs to its system rather than a planet. `place-index.md` explains where the
rows are read.

## Invariants the tests enforce

- Every `available_at` planet exists in `star_chart_order`.
- Every main-path quest has a release date.
- Every quest has `wiki`, `start`, `requirement` and at least one location.
- Every `quest_evidence.yaml` rule cites the wiki and names a quest spelled
  as the spine spells it.
- `sources.yaml` parses against its schema, names no item twice, and leaves no
  arsenal item or collectible answered by prose alone.
- `acquisition.yaml` names no item twice.

## Vendored snapshots

Two scripts write `data/vendor/`, and nothing else does: `pnpm data:refresh`
(`scripts/refresh-drops.mjs`) and `pnpm data:wiki` (`scripts/refresh-wiki.mjs`).
Each reduces its source to the fields the app reads, and `manifest.json`
records when each ran and how much it kept. A refresh is a commit of its own,
never part of a feature.

| File                     | Source                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `place-rewards.json`     | WFCD's `warframe-drop-data`: the mission rewards and six bounty tables, built from DE's drop tables       |
| `region-resources.json`  | The wiki's `Module:Missions/data`                                                                         |
| `update-art.json`        | The wiki's API: the lead image of each update's page, as a link                                           |
| `wiki-blueprints.json`   | `Module:Blueprints/data`                                                                                  |
| `wiki-nodes.json`        | `Module:Missions/data`                                                                                    |
| `wiki-resources.json`    | `Module:Resources/data`                                                                                   |
| `wiki-research.json`     | `Module:Research/data`                                                                                    |
| `wiki-vendors.json`      | `Module:Vendors/data`                                                                                     |
| `wiki-traits.json`       | `Module:Weapons/data`                                                                                     |
| `wiki-baro.json`         | `Module:Baro/data`                                                                                        |
| `wiki-relics.json`       | `Module:Void/data`                                                                                        |
| `wiki-companions.json`   | `Module:Companions/data`                                                                                  |
| `wiki-honorias.json`     | `Module:Honorias/data`                                                                                    |
| `wiki-titles.json`       | `Module:Weapons/data`, `Module:Companions/data`, `Module:Honorias/data`, `Module:Cosmetics/data/ephemera` |
| `wiki-circuit.json`      | The wiki's page "The Circuit"                                                                             |
| `wiki-incarnons.json`    | Each Incarnon weapon's page on the wiki                                                                   |
| `wiki-honoria-tags.json` | The wiki's page "Honoria"                                                                                 |
| `wiki-adversaries.json`  | Each adversary's pages on the wiki                                                                        |

The licences, read from each source on 2026-10-13:

- **`warframe-drop-data`** is released under the MIT License. The drop tables
  it is built from are published by Digital Extremes.
- **The wiki** (`wiki.warframe.com`, its page `Warframe_Wiki:Copyrights`)
  releases code in the Module namespace under CC BY-SA unless a module says
  otherwise. For page text that page also says CC BY-SA, while every page's
  footer reads CC BY-NC-SA 3.0. The snapshots read from pages are held to
  the stricter of the two; the app carries no revenue, and this page credits
  the wiki.
- **Images** are never copied. `update-art.json` holds links, and the art is
  served from the wiki. The wiki states that DE's assets are used with DE's
  permission or as fair use.
