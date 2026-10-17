# T-27 · Screen: Goal

|          |                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                              |
| Serves   | [spec 08](../08-goals.md); [plan 1](../plan/01-repository.md); BR-05, BR-37, BR-53, BR-54, BR-59, BR-62 |
| Waits on | [T-26](T-26-map.md)                                                                                     |

The search with its suggestions, and the curated goal cards.

## What it builds

| File                               | Note                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/goals/page.tsx`           | Spec 08                                                                                                                                                     |
| `src/app/api/search/route.ts`      | Places too                                                                                                                                                  |
| `src/screens/goals/`               | `suggestedGoals()` takes, with the goals the engine proves done, `build_necramech` once every Necramech is owned, read from the catalog (T-13's correction) |
| `src/content/goals.ts`             | Cards and search only                                                                                                                                       |
| `src/domain/catalog/necramechs.ts` | `lackingNecramechs()`: the Necramechs the profile does not show in `XPInfo`, Voidrig first, then Bonewidow, then by release (BR-54)                         |
| `src/domain/graph/suggest.ts`      | `suggestedGoals()` puts first the goal `goalAtPlace()` names, the one on the frontier or the focus (BR-05)                                                  |
| `src/routes.ts`                    | `itemRoute()` takes `view`, so an item beyond reach opens on Step by step; `searchRoute()`                                                                  |

## From T-16

- `searchCatalog(data, placeIndex(), term)` returns every match, best first, places among them: each hit with its `kind`, `group`, `name`, `type` and `family`. The route orders it by reach (spec 08, BR-62) and keeps eight.

## From T-20

- Goal renders `Shell` with `tab="goal"` and the tab bar. `/goals` is already in `routes.ts`. A link into an item carries `from=goal`.

## From T-22

- Connect sends a player who has not reached Venus straight to `/goals` through `entranceAfter()` in `app/screen.ts` (BR-03). Neither demo arrives that way, since both have reached Venus.

## From T-25

- A screen of the shell renders `Shell chrome={await chromeOf(screen)}` (`app/chrome.ts`): the player, Onkko's voice and the actions in one value. Onkko's line shows only when `chrome.voice.on` (BR-64).
- The Goal frames end in Continue and Skip, secondary, since 2026-10-16 (BR-40): Skip opens Start here.

## Corrections

- **The work lives where the layers allow it.** A screen imports only the domain's types, so what the table gave `src/screens/goals/` is split: `src/screens/goals/view.ts` words the cards and the search rows, and the rules go to the domain, `lackingNecramechs()` and `goalAtPlace()`. `src/app/goals/page.tsx` puts them together.
- **Build a Necramech is done by ownership alone.** The engine resolves the goal through what it requires, Deimos, Entrati rank 2 and the parts, which says what stands before it, not whether it is done. The page drops the engine's answer for this goal and hides it only when the profile shows every Necramech, or when the first one lacking is beyond reach (BR-54, BR-59). With the reach of BR-59, Ordis has Deimos in reach and is offered it; the new player is not.
- **The cards' lines are content.** Spec 08 read them from `grafo.yaml`, which has no line, and every string lives in `src/content/`. The two the frame draws are kept; "Unlock the next planet" names the junction the frontier needs, "Clear the Mars Junction, on Earth, to open the next planet." (owner, 2026-10-17). Spec 08 says so.
- **Skip.** The frame ends in Skip since 2026-10-16 (BR-40) and spec 08 did not list it; it does now, and Skip opens Start here.
- **The search is private.** Its order and its gaps are the player's, so the route reads the screen from the profile's cache, answers 401 with no account, and is `private, no-store`. The field waits 150 ms and drops a reply that a newer query has passed.
- **The list closes on a click outside the search, not on blur.** Closing on blur moved Continue up under the pointer before the click landed, and the click missed it.

## Acceptance

- [ ] Every acceptance item of spec 08 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
