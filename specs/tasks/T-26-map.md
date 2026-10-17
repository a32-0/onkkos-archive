# T-26 · Screen: the map

|          |                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                                                   |
| Serves   | [spec 07](../07-map.md); [plan 1](../plan/01-repository.md); BR-05, BR-36, BR-44, BR-45, BR-46, BR-47, BR-57, BR-59 to BR-62 |
| Waits on | [T-25](T-25-summary.md), [T-15](T-15-places.md), [T-13](T-13-engine.md)                                                      |

One place at a time: the place card, the lens, the groups, the place list and the system list, and where the map opens.

## What it builds

| File                                                                                                     | Note                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/system/page.tsx`                                                                                | Spec 07: where the map opens (BR-46), the place, the card's month                                                                                                                                                                                                                                                      |
| `src/app/actions.ts`                                                                                     | `remeasure()`: the map's card keeps a month and stays on the map                                                                                                                                                                                                                                                       |
| `src/screens/map/`                                                                                       | `MapScreen` inside `Shell`; `MapBody`, the card, Show, the sheets and the pane from 1200; `MapGroups`; `PlaceList` and `SystemList`; `view.ts`, the domain's values in words; `lens.ts`, what each lens shows and how a second press returns to the default; `panes.ts`, the width from which the place list is a pane |
| `src/domain/place/map.ts`                                                                                | `placeMap()`: a place's groups and tiles, each tile's state, lenses and rank gap; `systemStandings()`: each place's and system's count, New and gap                                                                                                                                                                    |
| `src/domain/place/hubs.ts`, `data/systems.yaml`, `src/domain/place/schema.ts`, `src/infra/place/load.ts` | The Incarnons, Honoria and Ephemera a hub hands out, filed under the place of the hub (owner, 2026-10-16)                                                                                                                                                                                                              |
| `src/domain/catalog/whats-new.ts`                                                                        | `itemLine()` and `masteryReqOf()`: a tile's line when nothing drops at this place, and an item's rank                                                                                                                                                                                                                  |
| `src/content/system.ts`                                                                                  | Spec 07                                                                                                                                                                                                                                                                                                                |
| `src/content/checks.ts`                                                                                  | The Circuit's reading, "In {n} weeks" or "This week"                                                                                                                                                                                                                                                                   |
| `src/content/engine.ts`                                                                                  | The words of the engine's values: the junction a frontier needs; without the Intrinsics trees and the placement (T-13's correction)                                                                                                                                                                                    |
| `src/infra/wiki/icons.ts`                                                                                | The map's catalogue icons                                                                                                                                                                                                                                                                                              |
| `src/ui/Segmented/`                                                                                      | One option, for Show with no month                                                                                                                                                                                                                                                                                     |
| `next.config.ts`                                                                                         | `warframe-worldstate-data` loads outside the bundle                                                                                                                                                                                                                                                                    |
| `tests/map.test.ts`, `tests/request.test.ts`                                                             | The lens, reach, the lists, Start here, the card, the hubs; where the map opens, Tau, the card's month                                                                                                                                                                                                                 |
| `tests/tokens.test.ts`                                                                                   | The allowance list is deleted                                                                                                                                                                                                                                                                                          |

## From T-15

- A group is the place index's `group`, one per catalogue as the frames draw them (`docs/place-index.md`).
- Tau is listed as Soon™ and is never counted in the system list's More line: it is in no one's reach, and with no `Missions[]` and no `PlayerLevel` no More line renders (spec 07, acceptance 8). `systemInReach` is false for an unreleased system.

## From T-19

- `proxy.ts` writes `wf_place` as `{system}/{place}` from `/system?system=&place=`, for a system id and a place name of the expected shape. Its matcher is the literal `/system`, missing the two prefetch headers: this task adds the route to `routes.ts` with the same path.
- `readPlace()` in `infra/session.ts` reads it back as `{ system, place }`; the page checks the place exists before it opens it, and opens Start here otherwise (BR-46).
- `gameIcons()` and `placeIcons(names)` in `infra/wiki/icons.ts` give the wiki's icon URLs by role and by place name; a missing one is absent from the map.

## From T-20

- The map renders `Shell` with `tab="navigation"` and the tab bar. `/system` is already in `routes.ts`. A link into an item carries `from=navigation`.

## From T-23

- `startHere()` in `domain/place/start-here.ts` gives the place that carries Start here (BR-44), the frontier or the focus, or `null` with neither; `firstPlace()` gives the Origin System's first place for a first opening with no Start here (BR-46). `placeRoute(system, place)` in `routes.ts` writes the map's address, which Skip already opens.

## From T-25

- A screen of the shell renders `Shell chrome={await chromeOf(screen)}` (`app/chrome.ts`): the player, Onkko's voice and the actions in one value. Onkko's line shows only when `chrome.voice.on` (BR-64).

- `whatsNew()` in `domain/catalog/whats-new.ts` splits a group into tiles in reach and a `Beyond` (how many, which gaps, the lowest rank, the junction); `content/reach.ts` holds the More line's words and `screens/summary/view.ts` chooses among them. The map's groups count the same way (BR-61).
- `bestPlaces()` gives an item's place, the place of its best route in the place index; the map's own place is the place on view (BR-59).

## Corrections

- **Incarnons, Honoria and Ephemera have a place (owner, 2026-10-16).** No drop table names them, so no place held them and their groups never rendered. They are handed out at hubs, and `data/systems.yaml` now maps each hub to its place: The Circuit to Duviri, Pontis Tower to Uranus Proxima, Nightcap to Venus (Fortuna), and La Cathédrale to Deimos, whose portal is in the Sanctum Anatomica (owner's choice). `hubAcquisition()` files the 45 Incarnon Genesis at Duviri, 60 Honoria at Deimos and 8 at Uranus Proxima, and the one Ephemera Nightcap sells at Venus. What only events, the Market or a hub off the map hand out stays off the map; the item page still names its source. The Summary is unchanged: these groups still have no date (spec 06).
- **`warframe-worldstate-data` loaded empty in the build.** The package reads its JSON through dynamic imports that the bundler cannot follow, so in `pnpm build` the node catalog was empty: no Nodes lines, and `regionsPlayed()` proved no planet by a node played. Tests run under Node and never saw it. `next.config.ts` lists it in `serverExternalPackages` and traces its data.
- **The card with no month asks for one.** With no `wf_since` and the newest update not caught up, the last-played card reads "Choose an update" with no art and no meta; its list keeps a month and the map re-measures New in place (`remeasure()`). "Navigation — No month" (`474:1404`) now draws it so.
- **Show with no month has one option.** `Segmented` takes one or more options; spec 07's No month state draws Show with Mastered alone.
- **A system's symbol** is the art of its first place, with its second place's as the satellite; Tau, with no place, shows the blank orb, and so does a place whose name the wiki has no art for (Höllvania, Duviri, the Proximas, Dark Refractory). The first system is named "Origin", as BR-47 and the frames name it (owner, 2026-10-16); `systems.yaml` said "Origin System". The search's empty state reads "None of Origin’s places is called “{query}”.", in the code and in "Navigation Menu — No match".
- **Icons.** The wiki has no white icon for Archgun, Archmelee, Necramech, Incarnons, Ephemera or Honoria; those rows show none (BR-42).
- **The place list's More line.** Places behind a junction are counted in one line naming the next junction; the Dojo, held back by a clan, has its own line, "1 more place opens when you join a clan."
- **A tile with no drop here reads its source.** A tile whose item drops at the place reads its runs and node; any other reads the first line of its own Summary, or, when that line has no reading (an Incarnon Genesis lists its components first), the first way to get it that has one: "In 3 weeks" for The Circuit. A tile with no place line takes its hub's name. One Honoria, "The Power Of Harrow Compels Thee", has no price in the wiki and shows only "La Cathédrale".
- **The system list opens beside its chevron.** From 840 to 1199 the place list is a panel on the right and the system list opens there too; from 1200 the place list is the left pane and the system list opens on the left.
- **`/item` and `/goals` answer 404** until T-27 and T-28 build them; tiles already link with `from=navigation`.
- **The local check.** Under `pnpm build` and `pnpm start`. Cy opens on Earth, Start here, with "15/15 Normal 12/15 Steel Path" and "13/19 Items mastered"; with August 2025, Show offers Mastered and New, and Venus carries New in the place list. Phobos is mastered and still shows its Collection. Ordis opens on Mars, Start here; the place list holds Earth to Deimos, "15 more places open as you clear the junctions. Next: the Mars Junction, on Earth." and the Dojo's line; a search for Jupiter finds it with "Clear the Mars Junction, on Earth, to reach it."; the system list holds Origin and Duviri, Tau as Soon™, and "3 more systems open as you go further."; Primary on Mars ends in "1 more primary weapon needs Mastery Rank 8 or higher. You are Mastery Rank 2." The place list is a panel at 840 and a pane from 1200; no width from 360 to 1440 scrolls sideways.

## Acceptance

- [ ] Every acceptance item of spec 07 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The place list's system card applies `.heading`; the allowance list of `tests/tokens.test.ts` is then empty and removed, and the test passes with no token unapplied.
- [ ] `check.yml` passes on `dev`.
