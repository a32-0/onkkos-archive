# 09 · The item: hero and Summary

The one page every item reaches, wherever it was opened from: what it is, the
player's state with it, and the short answer to where it comes from.

## Frames

- [`208:287` Item Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-287):
  the page in its Summary view, the hero in the Rank state.
- [`339:1335`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=339-1335),
  [`320:758`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=320-758),
  [`372:1394`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=372-1394):
  the hero Mastered, Not obtained, and Not obtained Prime.
- [`306:1456` Cards](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=306-1456):
  the hero for every catalogue (kicker, name, art).
- [`372:350` Blueprint Preview](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=372-350):
  a part's art over the blueprint.

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`474:2012` Item (Summary) — Collectible](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-2012): a resource's page. The hero is kicker, name and art with no state, and the Summary is How to get in the row style (`Summary row`, Kind=Route).

## Rules

- [BR-17](../docs/business-rules.md#br-17--the-hero-card-shows-the-items-state-for-this-player)
  and [BR-52](../docs/business-rules.md#br-52--the-heros-state-lives-on-its-image):
  the hero's four states, on the image.
- [BR-18](../docs/business-rules.md#br-18--every-image-sits-on-the-drawn-ground)
  and [BR-19](../docs/business-rules.md#br-19--a-blueprints-art-carries-the-blueprint-behind-it):
  image grounds and blueprint art.
- [BR-30](../docs/business-rules.md#br-30--a-thing-we-curate-links-to-our-page-not-the-wiki):
  our page before the wiki.
- [BR-51](../docs/business-rules.md#br-51--youre-on-names-the-items-place):
  "You're on".
- [BR-55](../docs/business-rules.md#br-55--the-items-summary-is-blueprints-and-components):
  what the Summary holds.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes),
  [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons).

## What the page does

Route `/item?name=&from=&view=`, inside the shell, with the tab of the screen
it was opened from lit (`from`, spec 04). From the top:

1. **You're on** (BR-51): "You're on {system} > {place}" with the place's art,
   when the item comes from a place, the Dojo included for anything
   researched (BR-57). An item from relics or from a game system has none. It
   opens the map on that place.
2. **The hero**: the catalogue as kicker ("Warframe", "Primary"…), the name in
   the display face, and the square image carrying the state:

   | State               | Border and badge                    | Frame      |
   | ------------------- | ----------------------------------- | ---------- |
   | Rank                | Blue border, "Rank {n}/{max}" badge | `208:287`  |
   | Mastered            | Green ground and border, "Mastered" | `339:1335` |
   | Not obtained        | Grey border, no badge               | `320:758`  |
   | Not obtained, Prime | Gold border, no badge               | `372:1394` |
   | Cannot be read      | Grey border, no badge, no state     | —          |

   A collectible (a mod, a resource, a relic…) has no rank and no state; its
   hero is kicker, name and art, as `306:1456` draws Resources and Relics.

3. **View**: a segmented control, **Summary** and **Step by step**. Summary is
   the default; the choice is kept in `?view=steps` so a link can open either.
   Step by step is spec 10.
4. The Summary view (BR-55):
   - **Blueprints**, open: one row per blueprint, the main Blueprint first,
     then the parts in the order Step by step gives them. Each row is the
     part's art over the blueprint (BR-19), its name, its best route's reading, "~{n} Runs · Rotation {x}" (BR-56),
     in gold, and its place.
   - **Components**, open: one row per ingredient, "{name} ×{n}", with its
     art, its reading and its place when it has a known drop, and "{n}
     Credits" last.
   - With neither, the item's How to get or Acquisition rows in the same row
     style.
5. Onkko's line, chosen by the item's state ("Well chosen.").

### What a row does

- A blueprint row opens Step by step at that part's section.
- A component row opens that thing's own page when the app has one, and
  nothing otherwise (BR-30). Credits open nothing.
- A section header folds its section; both start open, as drawn.

## Data and sources

- The plan: `stepPlan()` / `collectibleStepPlan()`, and the Summary through
  `briefOf()` in `src/lib/catalog/summary.ts`, never a second engine.
- State: `XPInfo` through `src/lib/place/state.ts`.
- Art: `@wfcd/items` on `cdn.warframestat.us`, the blueprint ground from the
  catalog's `blueprint.png`; place art from the wiki.
- The catalogue kicker: the catalog's category, named as the map names its
  groups (spec 07).

## Desktop (BR-39)

- 840 to 1199: one reading column at most 640 px; the rows keep their frame
  size.
- 1200 and up: two panes. The left holds You're on and the hero, and stays in
  view while the page scrolls; the right holds View and the sections.

## Components

`PlaceCrumb` (You're on), `ItemHero` (Rank, Mastered, Not obtained, Not
obtained Prime, no state, collectible), `Badge`, `Segmented`, `SectionHeader`
(open, closed), `SummaryRow` (blueprint, component, route), `BlueprintArt`,
`OnkkoLine`, each with its stories.

## Acceptance

1. At 390 px the page matches `208:287`, and each hero state its frame.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut; from 1200 the
   hero pane stays in view.
3. The hero shows the player's state from `XPInfo`, and no state without it.
4. You're on shows only for an item with a place, and opens the map there.
5. Summary shows Blueprints and Components, or How to get when it has neither;
   its facts never contradict Step by step.
6. Every part's art sits on the blueprint ground.
7. `pnpm check` passes.

## Divergences from the code

| Today                                                    | The frames and rules                      |
| -------------------------------------------------------- | ----------------------------------------- |
| Art beside the title with MR, build time and a wiki link | The centred hero of `208:287`             |
| State colours from the palette                           | The drawn ones (BR-17)                    |
| No You're on                                             | BR-51                                     |
| View as two buttons                                      | One segmented control                     |
| Summary renders every section; Components as chips       | Blueprints and Components as rows (BR-55) |
| Part cards with "+N other"                               | One row per blueprint                     |
| The page has no origin                                   | `from` lights the tab it came from        |
