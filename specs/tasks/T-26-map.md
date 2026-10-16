# T-26 · Screen: the map

|          |                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                                                   |
| Serves   | [spec 07](../07-map.md); [plan 1](../plan/01-repository.md); BR-05, BR-36, BR-44, BR-45, BR-46, BR-47, BR-57, BR-59 to BR-62 |
| Waits on | [T-25](T-25-summary.md), [T-15](T-15-places.md), [T-13](T-13-engine.md)                                                      |

One place at a time: the place card, the lens, the groups, the place list and the system list, and where the map opens.

## What it builds

| File                      | Note                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/system/page.tsx` | Spec 07                                                                                                                             |
| `src/screens/map/`        |                                                                                                                                     |
| `src/content/system.ts`   | Spec 07                                                                                                                             |
| `src/content/engine.ts`   | The words of the engine's values: the junction a frontier needs; without the Intrinsics trees and the placement (T-13's correction) |
| `tests/tokens.test.ts`    | The allowance list is deleted                                                                                                       |

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

## Acceptance

- [ ] Every acceptance item of spec 07 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The place list's system card applies `.heading`; the allowance list of `tests/tokens.test.ts` is then empty and removed, and the test passes with no token unapplied.
- [ ] `check.yml` passes on `dev`.
