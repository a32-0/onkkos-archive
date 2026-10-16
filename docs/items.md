# The item catalog, and the number it shows beside its rotation

The item page (spec 09) and its Summary answer one question: **what do I
need, and where do I go for it?** They exist so the wiki is a fallback rather
than the first stop. The catalog under them is `src/domain/catalog/`:
`items.ts` builds the arsenal from the raw entries `src/infra/catalog/items.ts`
reads out of `@wfcd/items`, and `dossier.ts` turns one item into its parts,
the arsenal items it is built from and the ones it goes into.

## What it carries, and why that list

Everything below is read from `@wfcd/items`, never curated and never guessed:

| Row              | Source                               | Answers                       |
| ---------------- | ------------------------------------ | ----------------------------- |
| Mastery Rank     | `masteryReq`                         | Can I even use it?            |
| Parts to farm    | `components[]` under a recipe path   | What do I have to go and get? |
| Place · node     | `drops[].location`                   | Where do I go?                |
| Mission          | the parenthesised part of `location` | What am I running?            |
| Rotation         | the `Rotation X` suffix              | How far in do I have to get?  |
| Chance, `1 in N` | `drops[].chance`                     | Is this a short grind or not? |
| Resources        | `components[]` that are not parts    | What will the foundry eat?    |
| Credits, hours   | `buildPrice`, `buildTime`            | Can I start it tonight?       |

The cut is "enough to act". Stats, polarities, abilities, lore and build
guides are all things the wiki does better, and the page links there rather
than mirroring it (the constitution: filter and curate, never mirror).

## The number beside its rotation

Tiles and Summary rows read "~{n} Runs · Rotation {x}" (BR-56 in
[`business-rules.md`](business-rules.md)): runs of that roll, beside the
rotation and place that give it. The number is never shown alone, in a column
of its own, and this is why.

A drop chance is one roll, but **the catalog never says what one roll costs**.
Measured across every non-Prime Warframe drop location: 42 are `Assassination`
(roughly a four-minute run, one roll), 11 are `Survival`, where a rotation C
roll is twenty minutes in, 16 are `Defense`, and 93 carry no mission type at
all. A single "runs: 4" column would put those in the same unit and imply a
precision the source does not have.

So the runs restate the chance: `oneIn()` in `odds.ts` rounds `100 / chance`.
That is division, not modelling: it introduces no denominator the data did
not already have, and the rotation and mission sit beside it so the reader can
price an attempt themselves. The step plan carries the number as a value
(`runs` on its odds), so Step by step's detail and the Summary's gold line
read the same one.

## Telling a part from a resource

`components[]` mixes the two. Mesa lists `Chassis` and `Orokin Cell` side by
side, both with `itemCount: 1`; Hek lists `Salvage x1200`. Quantity does not
separate them, and neither does the uniqueName on its own: DE files the
Necramech parts under
`/Lotus/Types/Gameplay/InfestedMicroplanet/Resources/Mechs/`, calling its own
craftable parts "Resources".

Two rules together, in `isPart()`:

1. The uniqueName sits under `/Lotus/Types/Recipes/`. That catches `Chassis`,
   `Neuroptics`, `Systems`, `Blueprint`.
2. Or the component name begins with the item's own name **and only one is
   needed**. That catches `Voidrig Capsule`, which rule 1 misses.

Rule 2 is what the game's own naming convention already encodes. The quantity
clause is not decoration: across the whole arsenal, rule 2 fires without rule 1
eighteen times, and seventeen are real parts: the Necramech and Thanotech
components and the three `Mandachord` pieces. The eighteenth is
`Javlok Capacitor ×6`, a farmed resource that merely starts with its weapon's
name. Every craftable part in Warframe is needed once, so the count separates
them cleanly.

Three tests pin the boundary: `Orokin Cell` stays out of Mesa's parts,
`Voidrig Capsule` stays out of Voidrig's resources, and `Javlok Capacitor`
stays out of Javlok's parts.

## Relics are places

A player wants Nyx Prime, not "Meso N11". So a Prime part treats its relics as
the place it comes from, the way a node is the place a Koumei part comes from.
`relicOffers()` in `src/domain/catalog/relics.ts` groups a part's drops by
relic (the four refinements are four drop rows), keeps the intact and radiant
odds, and joins two more sources:

- The relic catalog for the icon and the `vaulted` flag. Vaulted is taken from
  the catalog only. A relic missing from the drop tables is **not** vaulted
  by inference: 40 relics are unvaulted in the catalog and only 34 appear in
  `place-rewards.json`, so absence would lie six times (2026-10-13).
- `place-rewards.json` for where the relic drops, best chance first, with the
  mission type stripped from the node name where DE repeats it
  (`Khufu Envoy (Caches)` running `Caches`).

A part whose catalog entry carries no drops is looked up the other way:
`rewardOffers()` finds the relics whose rewards name "{item} {part}" or
"{item} {part} Blueprint". `@wfcd/items` 1.1276.21 dropped the drops of
Odonata Prime's blueprint while `Relics.json` still lists it in 20 relics
(2026-10-15).

The drop tables file Railjack nodes under the planet (`Venus` holds Bifrost
Echo), which would let "Reach Venus" tick for a farm that needs a Railjack.
`proximaPlace()` in `src/domain/place/proxima.ts` renames such a place
`Venus Proxima`: a node is Railjack when the same planet lists it with a
`Skirmish` mission, the one mission only Proxima runs. `Caches` alone is not
the signal: Ishtar and Cervantes are ordinary cache nodes. A Proxima place is
not on the star chart, so its step reads as unreadable, never as done. The
place index, the step plan, the relic farms and the collectible routes all
pass through it.

The step plan's relic gate follows the parts rather than the item's own
`vaulted` flag: the catalog marks Nyx Prime vaulted while four of its relics
still drop. A part's relics are alternatives, the first opened and the rest
offered with "Or" (BR-49).

## Weapons inside a recipe

Forty-six arsenal items are ingredients of another: Bolto goes into Akbolto
(twice) and Hystrix, Dual Skana into Akjagara, Dark Split-Sword and Redeemer.
The catalog lists them as components, sometimes one row per copy, so
`readRecipe()` merges rows by `uniqueName`, and `dossier()` lifts any
ingredient whose `uniqueName` is an arsenal item out of the costs, into
`builtFrom` on the consumer and `usedIn` on the ingredient.

`XPInfo` proves the player once had the item, never that they still hold it:
it may have been sold or consumed. Whatever reads `builtFrom` and `usedIn`
against a profile says so.

## Lookup by name

The catalog lookup is by **name**, not uniqueName, because that is what both
the URL and `grafo.yaml` can carry legibly. A name that matches nothing yields
no item rather than an error.
