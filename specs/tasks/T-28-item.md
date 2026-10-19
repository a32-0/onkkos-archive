# T-28 · Screen: the item and its Summary

|          |                                                                                           |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                |
| Serves   | [spec 09](../09-item-summary.md); [plan 1](../plan/01-repository.md); BR-55, BR-56, BR-62 |
| Waits on | [T-27c](T-27c-material-code.md)                                                           |

An item's page: the hero with its state, the crumb, and the Summary that is Step by step in short form.

## What it builds

| File                               | Note    |
| ---------------------------------- | ------- |
| `src/app/item/page.tsx`            | Spec 09 |
| `src/screens/item/`                |         |
| `src/content/item.ts`, `states.ts` | Spec 09 |

## From T-16

- `briefOf()` returns blocks `blueprints` and `components`, or `how` when an item has neither (BR-55). Each line carries its `title`, its best `route`, its `reading` (the runs as a value, BR-56) and its `where` (node and mission).

## From T-20

- The item renders `Shell` with the tab bar and `tab={openedFrom(from)}` from `screens/shell/tabs.ts`: `from` is `navigation`, `resume` or `goal`, and anything else lights no tab.
- `VOICE.itemOwned` ("Well chosen.") exists. The line for an item not owned is not in `voice.ts`: spec 09 quotes none, so it is settled with the owner here.

## From T-25

- A screen of the shell renders `Shell chrome={await chromeOf(screen)}` (`app/chrome.ts`): the player, Onkko's voice and the actions in one value. Onkko's line shows only when `chrome.voice.on` (BR-64).

- `itemRoute(name, from)` in `routes.ts` writes `/item?name=&from=`; a category's rows in the Summary open it with `from=resume`, and `openedFrom()` in `screens/shell/tabs.ts` reads it.

## From T-26

- A category's rows on the map open the item with `from=navigation`. An Incarnon Genesis, an Honoria or an Ephemera now has a place on the map when a hub hands it out (`domain/place/hubs.ts`); the page's own routes still come from `briefOf()`, so the two agree on the source and the page names it whether or not the map holds it.

## From T-27c

- The item renders `Shell` with `bar={{ title, back }}`: the top bar titled
  with the item's catalogue, its back to the screen that opened it. From 840
  the header with the tabs sits above it.
- View is a `ControlRow` holding `Segmented` (Summary, Step by step).
- `ItemHero` has no card: the kicker, the name and the art sit on the page.
- `SummaryRow` keeps its 16 and 16 here; `compact` is only for category pages.
- Each section is a `Divider` over its card at `--radius-m`; sections do not
  fold (spec 09).

## Acceptance

- [ ] Every acceptance item of spec 09 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
