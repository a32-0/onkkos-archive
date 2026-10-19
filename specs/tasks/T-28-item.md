# T-28 · Screen: the item and its Summary

|          |                                                                                           |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                |
| Serves   | [spec 09](../09-item-summary.md); [plan 1](../plan/01-repository.md); BR-55, BR-56, BR-62 |
| Waits on | [T-27c](T-27c-material-code.md)                                                           |

An item's page: the hero with its state, the crumb, and the Summary that is Step by step in short form.

## What it builds

| File                    | Note                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `src/app/item/page.tsx` | Spec 09                                                      |
| `src/screens/item/`     |                                                              |
| `src/content/item.ts`   | Spec 09                                                      |
| `src/content/checks.ts` | Every title and section name, and the readings still missing |

## Correction

Written on 2026-10-18, before the code. The Summary's rows are named by the
step plan's title phrases ("Neuroptics", "Fate Pearl ×12", "25,000 Credits",
"Defeat Spy"), and a How to get row can carry any route's title. So the words
of every title and section phrase come here rather than with T-29, typed
against `Phrase` so that none is missed. So do the readings `BRIEF` still
lacks (Baro's price, Varzia's, Aya's, the Prime Resurgence lines, Nightwave),
which this page is the first to show. `states.ts`, the vocabulary of a step's
status, moves to T-29, which is the first to draw one. The Step by step view
itself stays T-29's: this task builds the View row, `?view=steps` and the rule
that opens an item beyond reach on it.

A part's blueprint row names its place: when every part comes from one
source, the step plan now gives each part's row that source's node and
mission as its `where`, as it already did for parts with their own routes.

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
- `SummaryRow` is `compact` here too: `662:5503` sets the name in 16, the
  reading in 12 and the place in 14, as the category pages do (corrected on
  2026-10-18; the note first kept 16 and 16).
- Each section is a `Divider` over its card at `--radius-m`; sections do not
  fold (spec 09).

## Owner review, 2026-10-18

- Onkko says "These will assist." on an item the player does not have, his
  line for browsing his wares on the wiki; "Well chosen." stays for one they
  have (spec 09).
- Back returns to the screen the player came from, where they were on it: the
  item's top bar goes back in the browser's history when the app came before
  it, and to the tab's root otherwise. A map category keeps its view in its
  link (`?view=`), so going back finds it as it was (specs 04, 07, 09).
- A Collection category on the map has no View: it gives no mastery (spec 07).
- A place or system row carries one tag at most, at its end; Tau shows
  disabled (spec 07).
- Updates keeps Newest on the newest game update, and its cards are keyed by
  version, since two updates can share a month (spec 06).
- Resume's list sits on the page's ground, as `662:4717` draws it.

## Acceptance

- [ ] Every acceptance item of spec 09 holds.
- [x] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
