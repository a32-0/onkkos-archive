# T-27c · The Material pass in code

|          |                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                      |
| Serves   | [plan 3](../plan/03-design-system.md); specs 02 and 04 to 10; BR-06, BR-13, BR-14, BR-45, BR-65 |
| Waits on | [T-27b](T-27b-material-pass.md)                                                                 |

The screens built so far take the design the owner approved on 2026-10-18:
two grounds, the new radii, the top bar, grouped lists, and the Summary and
the map as menus whose categories open pages of their own.

## What it builds

| File                                                                                                                                                                  | Note                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/tokens.css`                                                                                                                                                   | `--night-650` `#2a251f`; `--canvas`, `--surface-header`, `--surface-sunken` point at `--night-800`; `--surface`, `--surface-raised`, `--surface-band`, `--surface-card` at `--night-650`; `--radius-l` 12 (plan 3)                             |
| `src/ui/TopBar/`                                                                                                                                                      | The round back button and the title, 65 px, the header's ground and rule (spec 04)                                                                                                                                                             |
| `src/ui/List/`, `src/ui/ControlRow/`                                                                                                                                  | The grouped list (`List`, `ListEntry`) and the label-and-control row of View and the settings                                                                                                                                                  |
| `src/ui/ListItem/`                                                                                                                                                    | Top, middle, bottom, single; icon, title, badge, supporting line, chevron; a link; hover, focus. A grouped list is its rows 2 px apart, the ends at `--radius-m`                                                                               |
| `src/ui/PlaceSwitcher/`                                                                                                                                               | "Change location" and the place's name, the accent edge (spec 07)                                                                                                                                                                              |
| `src/ui/PlaceOverview/`                                                                                                                                               | In progress and mastered: the sphere inside the ring of the mastered share, "{n}/{m}", the chips of what is still to master (spec 07, BR-65)                                                                                                   |
| `src/ui/Segmented/`, `Header/`, `ItemHero/`, `SummaryRow/`, `UpdateCard/`, `FeaturedCard/`, `ChoiceCard/`, `PlaceCrumb/`, `PlaceRow/`, `SystemRow/`, `SectionHeader/` | Restyled to the Design System page: outlined segmented at `--radius-l`, the hero on the page, rows at least 100 px, the accent cards square on their edge, the update card at `--radius-s`, tags at `--radius-m`, Header wordmark-or-chip only |
| `src/ui/Sheet/`, `SheetHeader/`, `PlayerMenu/`, `GroupRow/`, `ItemTile/`, `Rail/`, `UpdateList/`, `PlaceCard/`, `ProgressBar/`                                        | Deleted with their stories, once nothing imports them                                                                                                                                                                                          |
| `src/routes.ts`                                                                                                                                                       | `profileRoute()`, `catchUpCategoryRoute()`, `updatesRoute()`, `mapCategoryRoute()`, `placesRoute()`, `systemsRoute()`; each page under a tab carries `from`                                                                                    |
| `src/app/profile/page.tsx`, `src/screens/shell/`                                                                                                                      | Profile, a page (spec 04); the chip links to it; the tab bar on every page after onboarding, the content stopping 8 px above it                                                                                                                |
| `src/app/catch-up/[category]/page.tsx`, `src/app/catch-up/updates/page.tsx`, `src/screens/summary/`                                                                   | The menu of categories, a category's page, Updates (spec 06)                                                                                                                                                                                   |
| `src/app/system/[category]/page.tsx`, `src/app/system/places/page.tsx`, `src/app/system/systems/page.tsx`, `src/screens/map/`                                         | The menu with the place, a category's page with View, the place list and the system list as pages (spec 07)                                                                                                                                    |
| `src/screens/connect/`, `src/screens/resume/`                                                                                                                         | Loading in place of the demos (spec 02); no match as the empty state (spec 05)                                                                                                                                                                 |
| `src/content/`                                                                                                                                                        | The new copy: the category page's lead, "Updates", "Profile", "Choose a location", Resume's no-match hint                                                                                                                                      |

## Corrections

- **One list, not four positions.** Figma draws `List item` as Top, Middle,
  Bottom and Single; the code draws one row at `--radius-s` inside a `List`
  that clips its ends to `--radius-m`, which renders the same four.
- **A category's rows are compact.** The owner's category frames set the
  reading at 12 and the place at 14, where `Summary row` is 16 and 16 on the
  item page; `SummaryRow` takes `compact`.
- **The place and system lists carry the system listed.** A page of its own
  cannot hold the chosen system in state, so `placesRoute()` and
  `systemsRoute()` take a `list` after the place on view.
- **Updates returns where it was opened.** From the map, choosing an update
  keeps the month and returns to the map (`remeasure` redirects); from the
  Summary it is `resume`, keeping the onboarding entrance.
- **From 840 a page under a tab keeps the header above its top bar**, so the
  tabs stay in reach once the bottom bar leaves (spec 04).
- **The selected row keeps its contrast.** On `--surface-raised-strong`,
  `--ink-dim` reads 4.13:1; the on-view row's count turns `--ink-muted`.
- **`.quiet-upper` and four night primitives left** with the components that
  used them; `.bar-title` (Cinzel 700 22, upper) joined for the top bar.

## From T-25 and T-26

- The Summary and the map share their group machinery (`GroupRow`, `Rail`,
  `ItemTile`). A category's page takes its items from the same views; only
  what renders them changes.
- `lens.ts` in `src/screens/map/` holds the three views of BR-45; the View
  row is its new face.

## Acceptance

- [x] Every screen built so far matches its frame in "App flows" at 390 px,
      each state included.
- [x] Specs 02 and 04 to 10 hold as they read since T-27b.
- [x] No component deleted above is imported anywhere; `pnpm knip` is clean.
- [x] `tests/tokens.test.ts` passes with the new radii and grounds; no module
      holds a raw radius or colour.
- [x] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass.
- [x] The owner has compared the app on their machine with the frames, and the
      sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
