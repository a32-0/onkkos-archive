# 09 · The item: hero and Summary

Every item in the app opens this page, wherever the player found it. It shows
what the item is, whether the player has it, is still ranking it or has
mastered it, and the short answer to where it comes from: its blueprints and
the materials they call for.

## Frames

- [`662:5503` Item>Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-5503):
  the page in its Summary view, the hero in the Rank state.
- [`677:6582` Item>Summary — Mastered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6582),
  [`677:6640` Item>Summary — Not obtained](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6640),
  [`677:6694` Item>Summary — Not obtained Prime](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6694):
  the hero Mastered, Not obtained, and Not obtained Prime.
- [`677:6750` Item>Summary — Collectible](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-6750):
  a resource's page. The hero is kicker, name and art with no state, and the
  Summary is How to get in the row style (`Summary row`, Kind=Route).
- [`479:3589` Summary row](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=479-3589):
  a part's art over the blueprint.

Drawn in "App flows" on 2026-10-18 (T-27b). Their texts are sample values.

## Rules

- [BR-17](../business-rules.md#br-17--the-hero-card-shows-the-items-state-for-this-player)
  and [BR-52](../business-rules.md#br-52--the-heros-state-lives-on-its-image):
  the hero's four states, on the image.
- [BR-18](../business-rules.md#br-18--every-image-sits-on-the-drawn-ground)
  and [BR-19](../business-rules.md#br-19--a-blueprints-art-carries-the-blueprint-behind-it):
  image grounds and blueprint art.
- [BR-30](../business-rules.md#br-30--a-thing-we-curate-links-to-our-page-not-the-wiki):
  our page before the wiki.
- [BR-51](../business-rules.md#br-51--youre-on-names-the-items-place):
  "You're on".
- [BR-55](../business-rules.md#br-55--the-items-summary-is-blueprints-and-components):
  what the Summary holds.
- [BR-62](../business-rules.md#br-62--a-search-shows-everything-and-says-the-gap):
  an item beyond the player's reach opens on Step by step.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-42](../business-rules.md#br-42--the-placeholder-circles-are-the-games-icons).

## What the page does

Route `/item?name=&from=&view=`, inside the shell, under the top bar titled
with the item's catalogue (spec 04), with the tab of the screen it was opened
from lit (`from`, spec 04). Back returns to the screen the player came from,
where they were on it; an item opened directly, with nothing before it in the
app, returns to the root of its tab (owner, 2026-10-18). From the top:

1. Onkko's line, chosen by the item's state: "Well chosen." for an item the
   player has, ranked or mastered, and "These will assist." for any other, his
   line for browsing his wares on the wiki (owner, 2026-10-18).
2. **You're on** (BR-51): "You're on {system} > {place}" with the place's art,
   when the item comes from a place, the Dojo included for anything
   researched (BR-57). An item from relics or from a game system has none. It
   opens the map on that place.
3. **The hero**, on the page and not on a card (owner, 2026-10-18): the
   catalogue as kicker ("Warframe", "Primary"…), the name in the display face,
   and the square image carrying the state:

   | State               | Border and badge                    | Frame      |
   | ------------------- | ----------------------------------- | ---------- |
   | Rank                | Blue border, "Rank {n}/{max}" badge | `662:5503` |
   | Mastered            | Green ground and border, "Mastered" | `677:6582` |
   | Not obtained        | Grey border, no badge               | `677:6640` |
   | Not obtained, Prime | Gold border, no badge               | `677:6694` |
   | Cannot be read      | Grey border, no badge, no state     | —          |

   A collectible (a mod, a resource, a relic…) has no rank and no state; its
   hero is kicker, name and art, as `677:6750` draws a resource.

4. **View**, a row holding a segmented control, **Summary** and **Step by
   step**. Summary is the default; the choice is kept in `?view=steps` so a
   link can open either. Step by step is spec 10. An item beyond the player's
   reach (BR-59) opens with Step by step chosen, where the prerequisite in the
   way leads (BR-62); Summary is one tap away and shows as it always does.
5. The Summary view (BR-55), each section a divider naming it over its rows:
   - **Blueprints**: one row per blueprint, the main Blueprint first, then the
     parts in the order Step by step gives them. Each row is the part's art
     over the blueprint (BR-19), its name, its best route's reading, "~{n}
     Runs · Rotation {x}" (BR-56), in gold, and its place.
   - A row's place names a mission node as the wiki and the players write
     it, "{Node} ({Planet}) · {Mission}": "Armatus (Deimos) · Disruption",
     so it is found at once on the star chart (owner, 2026-10-19). A route
     that groups nodes of several planets names the nodes alone.
   - **Components**: one row per ingredient, "{name} ×{n}", with its art, its
     reading and its place when it has a known drop, and "{n} Credits" last.
     A row with no reading and no place shows its description from Step by
     step instead, so no row is a bare name; a thing bought from a vendor
     names the vendor; what only an optional step asks for ends "(Optional)"
     (owner, 2026-10-21).
   - Without Blueprints, **How to get** comes first: the item's How to get or
     Acquisition rows in the same row style, then Components. A quest's
     reward or a bought blueprint is how the item is had, so it leads, never
     its first ingredient (owner, 2026-10-23, on Thornbak and Thalys). A
     quest's own page leads with the row that starts it, which wears the
     quest's art, as a collectible's rows wear the collectible's (T-43).

### What a row does

- A blueprint row opens Step by step at that part's section.
- A component row opens that thing's own page when the app has one, and
  nothing otherwise (BR-30). Credits open nothing.
- A section's divider only names it; sections do not fold, since the
  frames draw no fold from T-27b on.

## Data and sources

- The plan: `stepPlan()` / `collectibleStepPlan()`, and the Summary through
  `briefOf()` in `src/domain/catalog/summary.ts`, never a second engine.
- State: `XPInfo` through `src/domain/place/state.ts`.
- Art: `@wfcd/items` on `cdn.warframestat.us`, the blueprint ground from the
  catalog's `blueprint.png`; place art from the wiki.
- The catalogue kicker: the catalog's category, named as the map names its
  groups (spec 07).

## Components

`TopBar`, `PlaceCrumb` (You're on), `ItemHero` (Rank, Mastered, Not obtained,
Not obtained Prime, no state, collectible), `Badge`, `Segmented`, `Divider`,
`SummaryRow` (blueprint, component, route), `BlueprintArt`,
`OnkkoLine`, each with its stories.

## Acceptance

1. At 390 px the page matches `662:5503`, and each state its frame in "App
   flows".
2. At 360 and 600 nothing overlaps or is cut, and wider than 600 the page stays a centred 600 px column (BR-39).
3. The hero shows the player's state from `XPInfo`, and no state without it.
4. You're on shows only for an item with a place, and opens the map there.
5. Summary shows Blueprints and Components, or How to get when it has neither;
   its facts never contradict Step by step.
6. Every part's art sits on the blueprint ground.
7. An item beyond reach opens on Step by step unless `?view=` says otherwise.
8. `pnpm check` passes.
