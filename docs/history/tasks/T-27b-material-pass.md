# T-27b · The Material pass

|          |                                                       |
| -------- | ----------------------------------------------------- |
| Phase    | 4. Screens                                            |
| Serves   | [plan 3](../plan/03-design-system.md); specs 04 to 10 |
| Waits on | [T-27](T-27-goal.md)                                  |

Cetus keeps its type, its art and its state colours, and takes Material's
shape and hierarchy: steadier spacing, two grounds, one kind of list, card
and button across the app, and no complex menus (owner, 2026-10-17). The
owner's own pass on 2026-10-18 sets the radii, the spacing and the screens
below; where it differs from the first draft, it wins.

## Decisions

- **Figma first.** The design system and every screen with its states are
  finished in Figma and approved by the owner before any code changes; T-28
  waits on this task (owner, 2026-10-17).
- **Two grounds.** The page is `#16130E` and every surface is `#2A251F`;
  hover and pressed are a state layer over the surface, never a third colour.
  The state colours, the accent, the link and the brand stay.
- **Grouped lists.** The rows of a section form one block, 2 px apart, as
  Android's Settings group them.
- **Menu, category, item.** Summary and the Map are menus of categories; each
  category has its own page; each object in it has its detail page, as Step
  by step is. Resume and Goal keep their structure and take the new
  components.
- **A category row says what its screen is about only in Summary.** Summary's
  rows say how many are new; the Map's rows carry no count, since the place
  above already says what is left to master (owner, 2026-10-18).
- **A View row replaces the Map's lenses.** A category page of the Map opens
  with the place it is about and a row "View" holding a segmented control:
  To get, Mastered, New. It is the same row as Summary and Step by step on an
  item, and as the settings in Profile (owner, 2026-10-18). There are no
  filter chips.
- **Subpages have a top bar.** A category, item, place or profile page opens
  under a bar as tall as the header (65 px), on the same ground and with the
  same brand line, holding a round back button and the title. The logo
  header stays on the tab roots.
- **The tab bar is on every screen after onboarding**, subpages included.
  The scrolling content stops 8 px above it (owner, 2026-10-18).
- **Radii** (owner, 2026-10-18):
  - `radius/s` (4): list rows, settings rows, update cards; the ends of a
    grouped list and an item's section take `radius/m`.
  - `radius/m` (8): cards, sections, steps, tags (start here, new items,
    mastered), the place chips, fields.
  - `radius/l` (12): segmented controls only, the track and its chosen
    segment.
  - `radius/full`: buttons, the search field, the back button.
  - A card with the accent edge is square on that edge: 0, 8, 8, 0.
- **Spacing.** 16 px around every screen and between its blocks; 8 px between
  a group's title and its list; 24 px between groups; 2 px between grouped
  rows; 16 px inside a card or a section; 12 by 16 inside a row.
- **Segmented controls are outlined.** The track has no fill and a `line`
  border; the chosen segment is filled, `fill-strong` under `ink-inverse`.
- **The Map's top.** The last update card, then "Change location" (the
  `Place switcher`), then the place on the page (the `Place overview`): the
  sphere, "Still to master here" as an icon and a count per group, and the
  mastery of the place.
- **An item's hero sits on the page.** Its kind, its name and its art, with
  no card around them.
- **Profile is a page**, not a menu over the screen: the top bar, the player,
  the settings as a grouped list, then Disconnect and when the data is read.
- **One object row.** Every category page lists its objects with the
  `Summary row` (100 px) in a grouped list.

## The grounds the tokens become

| Token today                                                 | Becomes                                   |
| ----------------------------------------------------------- | ----------------------------------------- |
| `canvas`, `surface-header`, `surface-sunken`                | The page, `#16130E`                       |
| `surface`, `surface-raised`, `surface-card`, `surface-band` | The surface, `#2A251F`                    |
| `surface-raised-strong`                                     | The surface with the selected state layer |
| `hover`                                                     | The state layer, over either ground       |

## What it draws

| Where                     | What                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| Design System, components | List item, Top bar, Place switcher, Place overview, Segmented, the rest |
| Wireframes, "App flows"   | Every screen in order of use, one row per flow, its states beside it    |

## What is drawn

- **The owner's pass** (2026-10-18) drew the roots of each flow; this task
  takes it into the components and draws every documented state from it.
- **"App flows"** (`661:4302`) on the Wireframes page replaces "High-fi
  Wireframes", which is deleted (owner, 2026-10-18; the old frames stay in
  the file's version history). Nine rows, in order of use: Entry, Resume,
  Summary, Item, Step by step, Goal, Map, Places, Profile; each root first,
  its states to its right, named "Screen — State".
- **The mastery of a place** is a ring around the place's sphere that
  fills with its mastered share, "{n}/{m}" and "Items mastered" under it,
  then the chips of what is still to master (`Place overview` `656:211`). The
  owner chose it over a linear bar and over a bar inside "Change location",
  and adjusted it (2026-10-18).
- **The Design System** takes the pass: `Top bar` at 65 px, `List item` ends
  at `radius/m`, `Summary row` at least 100 px, the accent cards 0, 8, 8, 0,
  `Update card` at `radius/s`, `Item hero` on the page, `Segmented` at
  `radius/l`, every other `radius/l` at `radius/m`. `Filter chip` is
  removed.

## Where the old frames went

The specs, `docs/business-rules.md` and T-28 link frames that were deleted
with "High-fi Wireframes". Each link becomes the frame below.

| Old                                    | Now                                                       |
| -------------------------------------- | --------------------------------------------------------- |
| `421:590` High-fi Wireframes           | `661:4302` App flows                                      |
| `202:38` Login                         | `661:4354` Onboarding                                     |
| `206:903` Onboarding (the splash)      | `661:4307` Start                                          |
| `428:743` Loading                      | `675:5392` Onboarding — Loading                           |
| `428:616` Error                        | `662:6943` Onboarding>Error                               |
| `203:140` Features                     | `661:4591` Two Ways In                                    |
| `203:231` Resume                       | `662:4709` Resume                                         |
| `466:207` Resume (from Two ways in)    | `679:4734` Resume — From Two Ways In                      |
| `474:608` Resume — No match            | `675:5461` Resume — No match                              |
| `264:388` Card Container               | `Update card` `463:256`                                   |
| `206:774`, `257:653` Summary           | `662:4885` Summary; `679:4789` Summary — From Two Ways In |
| `474:778` Summary — Nothing new        | `675:5527` Summary — Nothing new                          |
| `264:67` Summary_Card Opened           | `662:5040` Summary>Warframes                              |
| `533:4813` Summary — Beyond reach      | `675:5570` Summary>Warframes — Beyond reach               |
| `208:287` Item Summary                 | `662:5503` Item>Summary                                   |
| `339:1335` Item mastered               | `677:6582` Item>Summary — Mastered                        |
| `320:758` item normal, not obtained    | `677:6640` Item>Summary — Not obtained                    |
| `372:1394` item prime, not obtained    | `677:6694` Item>Summary — Not obtained Prime              |
| `474:2012`, `306:1456` Collectible     | `677:6750` Item>Summary — Collectible                     |
| `257:1124`, `269:364`, `372:350` tiles | `Summary row` `479:3589`                                  |
| `323:689` every part from one place    | `677:7827`                                                |
| `368:865` main blueprint from Market   | `677:8135`                                                |
| `371:1183` one hub, different nodes    | `677:8443`                                                |
| `337:806` every part, different place  | `677:8763`                                                |
| `372:355` no part in the drop tables   | `677:9075`                                                |
| `382:1864` Prime Resurgence            | `677:10011`                                               |
| `382:452` Kuva                         | `677:10331`                                               |
| `385:498` Kubrow                       | `677:11052`                                               |
| `474:2152` Step by step — Quest        | `677:12872`                                               |
| `533:5136` Step by step — Locked       | `677:13172`                                               |
| `367:291`, `382:2233` checkbox states  | `Step row` `479:3620`, `Component row` `465:477`          |
| `208:90` Goal                          | `662:4811` Goal                                           |
| `474:920` Goal — Results               | `675:5962`                                                |
| `474:1013` Goal — No match             | `675:5989`                                                |
| `533:5041` Goal — Beyond reach         | `675:6022`                                                |
| `474:1090` Goal — Every goal done      | `675:6049`                                                |
| `645:5166` Goal — Next planet          | `675:6088`                                                |
| `212:159` Navigation                   | `662:5177` Map; `662:6188` Map — Viewport                 |
| `474:1404` Navigation — No month       | `676:5901` Map — No month                                 |
| `474:1648` Navigation — Everything     | `676:5988` Map — Everything mastered                      |
| `299:597` Planet Details               | `Place overview` `656:211`                                |
| `312:199` Navigation — Warframes       | `662:6837` Map>Warframes                                  |
| `474:1160` Mastered chosen             | `676:6098`                                                |
| `533:4426` Navigation — Beyond reach   | `676:6158`                                                |
| `630:5021` Nothing to get              | `676:6220`                                                |
| `630:5119` Nothing mastered            | `676:6285`                                                |
| `630:5246` Nothing new                 | `676:6350`                                                |
| `215:610` Navigation Menu              | `662:6528` Locations                                      |
| `533:4285` Navigation Menu — New       | `677:6385` Locations — New player                         |
| `474:1927` Navigation Menu — No match  | `677:6457` Locations — No match                           |
| `533:4354` Navigation Menu — Beyond    | `677:6512` Locations — Beyond reach                       |
| `270:786` Navigation Menu System       | `662:6556` Systems                                        |
| `270:1145` Player menu                 | `662:4642` Profile                                        |

## Afterwards

- Specs 02 and 04 to 10, plan 3, the constitution and `docs/business-rules.md`
  were updated on 2026-10-18 to the frames above; the business rules keep
  their old frame links as history, with a note on each rule the pass
  changed.
- [T-27c](T-27c-material-code.md) takes the pass into the code.

## Acceptance

- [x] The owner approves every screen and state in "App flows" (2026-10-18).
- [x] Specs 04 to 10 and plan 3 say what changed, and the code task that follows is written.
