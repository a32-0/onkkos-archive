# T-23 · Screen: Two ways in

|          |                                                                                   |
| -------- | --------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                        |
| Serves   | [spec 03](../03-two-ways-in.md); [plan 1](../plan/01-repository.md); BR-34, BR-41 |
| Waits on | [T-22](T-22-connect.md), [T-13](T-13-engine.md)                                   |

The choice between Catch me up and Reach a goal after connecting.

## What it builds

| File                             | Note                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/app/features/page.tsx`      | Spec 03; a new player goes to `/goals`, a failed read to `/connect` with its band                  |
| `src/app/screen.ts`              | `startHereOf()`: Skip's address, Start here or else the Origin System's first place (BR-40, BR-46) |
| `src/domain/place/start-here.ts` | `startHere()`, the frontier or the focus (BR-44); `firstPlace()`                                   |
| `src/routes.ts`                  | `placeRoute(system, place)`, the map's address that `proxy.ts` reads                               |
| `src/screens/two-ways-in/`       | The screen: Onkko's line, the title, the two cards, Skip and Go back                               |
| `src/content/features.ts`        | Spec 03; the cards' lines are the frame's (BR-04)                                                  |
| `src/content/voice.ts`           | `VOICE.features(name)` ends at "association." with no name                                         |
| `src/ui/OnkkoLine/`              | `accent`: the part of the line drawn in `--accent`, the player's name                              |
| `tests/start-here.test.ts`       | The frontier, the focus, the Dojo and an unreleased system left out, nothing left, the fallback    |
| `tests/request.test.ts`          | The page: no account, a failed read, a new player, the links, a profile with no name               |

## From T-20

- `VOICE.features(name)` reads "We have, and shall have a long association, {name}.", as spec 03 writes it.
- `tests/language.test.ts` checks `src/screens/two-ways-in/` for an `OnkkoLine` fed from `VOICE`, and every line of `content/voice.ts` against the specs.

## From T-21

- `Button` takes `href` and `link` and then draws a link that looks the same, for a button that only opens another screen.

## From T-22

- `ROUTES.features` exists. Connect and both demos send a player past Venus here through `entranceAfter()` in `app/screen.ts` (BR-03); the Ordis demo stops at Mercury, so it lands here too.

## Corrections

- **Skip's place is built here.** Spec 03 said the focus did not exist in code yet. `findFocus` came with T-15, and the place index, item state and systems give each place's share, so `startHere()` joins them now rather than leave Skip without a place until T-26. The map (T-26) and Next (T-25) use the same function. With neither a frontier nor a focus, Skip opens the Origin System's first place, as BR-46 opens the map the first time.
- **`OnkkoLine` takes an accent.** The frame draws the player's name in the accent colour inside the line; the component drew one colour. `accent` names the part of the line drawn in `--accent`; a line without it is unchanged.
- **The title is the frame's text, "TWO WAYS IN".** Display/Numeral has no case of its own, and the frame writes the title in capitals.
- **The frame's copy (owner, 2026-10-15).** The owner changed the lead to "Pick one, you can change at any time." and shortened the first card's line to "Name the last update you played and see everything added since."; spec 03, BR-04 and the `ChoiceCard` story follow. The frame's first card is now a Choice card instance.
- **`/system` answers 404** until T-26 builds it; Skip already opens it.
- **"Pick up where you left off" opens `/catch-up?step=resume` (T-24, after this task's commit)**, so Resume knows it is the onboarding entrance (BR-41).
- **The local check.** Under `pnpm build` and `pnpm start`, with the Ordis demo, at 390: the title at y 151, the cards 358 wide at x 16, Skip at y 720 and Go back ending at 828, as the frame. Skip opens `/system?system=origin&place=Mars`, Ordis's frontier; with Cy, who has no frontier, the focus, Earth. At 360 and 600 nothing is cut; from 840 the cards sit side by side at 358 each under a 358 column, and no width scrolls sideways.

## Acceptance

- [x] Every acceptance item of spec 03 holds.
- [x] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [x] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [x] `check.yml` passes on `dev`.
