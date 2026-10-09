# Plan · 3 · The design system

Tokens and components, read off the frames, so the build can match them
exactly (BR-33) and every value changes in one place (constitution, "The
design system").

## Where the values come from

The Figma file defines no variables and no styles, apart from one blur
(`Blur/Overlay`, 4). Its layers are loose: very few are components. On
2026-10-06 one read-only pass over the pinned section `421:590` (6,286 nodes)
counted every colour, text style, radius, spacing, stroke and effect in use.
That inventory is the source below; a value used once in a stray frame is left
out. It is not fetched again: a change in Figma is a design change, and the
spec it touches is updated first. The one exception was T-04, on 2026-10-08:
binding (below) had named five colour roles and seven text styles without all
their values, so the variables of `421:590` were read once, and the tables
here carry what they gave.

Four decisions the owner made the same day shape the result:

- **Near-identical values are unified.** Five secondary greys become two, three
  golds become one, and so on, as the tables below say. The owner corrects
  Figma to the unified values.
- **The mono face is JetBrains Mono.** The frames used Consolas, which exists
  only on Windows.
- **Only three families.** Cinzel, Inter and JetBrains Mono. Roboto (place names
  in the place list, "Earth" on the place card) and Barlow (leftovers) were
  not intended; place names take Cinzel like every other name.
- **One icon set for the interface:** Material Symbols Rounded, which the
  frames' chevrons and checkboxes already use. The game's own icons stay for
  the game's things (BR-42).

## Three layers

```
primitives  →  semantic  →  components
--gold-400     --accent      Badge.module.css uses var(--accent)
```

- **Primitives** hold raw values and nothing else uses them directly but the
  semantic layer. Named by family and step (`--ash-100`, `--gold-400`).
- **Semantic** tokens name a role and point at a primitive. Components use these
  only. Changing a role's colour is one line.
- **Component** tokens exist only where a component needs a value no role
  covers (the step indent of 44 px), and live in that component's module.

All of it is CSS custom properties in `src/ui/tokens.css`. TypeScript reads none
of them; a component never computes a colour.

## Colour

### Primitives

| Token          | Value       | Was in the frames                                                          | Uses  |
| -------------- | ----------- | -------------------------------------------------------------------------- | ----- |
| `--black`      | `#000000`   | page canvas                                                                | 32    |
| `--night-900`  | `#0f0f0f`   | `#0f0f0f`, `#110e09`, `#17140f`, `#161413` (header, text on light buttons) | 45    |
| `--night-800`  | `#16130e`   | art ground, value fields (BR-18)                                           | 111   |
| `--night-700`  | `#1f1b16`   | `#1f1b16`, `#1f1c18` (sections, cards, segmented)                          | 244   |
| `--night-600`  | `#2e2924`   | active segment, secondary buttons                                          | 42    |
| `--night-500`  | `#39342e`   | `#39342e`, `#352f2d` (featured card)                                       | 9     |
| `--night-band` | `#37322ce5` | `#37322c@90`, `#373130@90`, `#39342e@80` (title bands)                     | 70    |
| `--night-card` | `#231f1acc` | the choice cards                                                           | n/a   |
| `--ash-100`    | `#eae1d9`   | `#eae1d9`, `#ffffff` (text, light buttons, icons)                          | 2,163 |
| `--ash-300`    | `#b1a595`   | `#b1a595`, `#b6a99a` (secondary text)                                      | 279   |
| `--ash-500`    | `#9f9486`   | `#9f9486`, `#9b8f80`, `#97a5a4` (dim text, lines)                          | 210   |
| `--slate-400`  | `#98a2b3`   | the not-obtained frame                                                     | 32    |
| `--gold-400`   | `#fcbb4a`   | `#fcbb4a`, `#fbbc36`, `#f5b731` (accent, Newest, card rules)               | 141   |
| `--bronze-600` | `#765824`   | the line down a Step by step section                                       | 101   |
| `--cyan-300`   | `#4fd8e8`   | links ("Wiki ↗")                                                           | 236   |
| `--green-400`  | `#4ec98a`   | mastered, done                                                             | 26    |
| `--green-900`  | `#143024`   | mastered ground                                                            | 25    |
| `--green-700`  | `#1f5138`   | mastered border                                                            | 25    |
| `--blue-400`   | `#5aa9ff`   | rank                                                                       | 6     |
| `--blue-900`   | `#122438`   | rank ground                                                                | 4     |
| `--blue-700`   | `#1d3c5c`   | rank border                                                                | 4     |
| `--red-600`    | `#b33419`   | the mark, the header rule, Disconnect, the error band                      | 43    |
| `--red-100`    | `#ffd4cb`   | text on the error band                                                     | 1     |

### Semantic

| Role                                         | Points at                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `--canvas`                                   | `--black`                                                                               |
| `--surface-header`                           | `--night-900`                                                                           |
| `--surface`                                  | `--night-700`                                                                           |
| `--surface-sunken`                           | `--night-800`                                                                           |
| `--surface-raised`                           | `--night-600`                                                                           |
| `--surface-raised-strong`                    | `--night-500`                                                                           |
| `--surface-band`                             | `--night-band`                                                                          |
| `--surface-card`                             | `--night-card`                                                                          |
| `--scrim`                                    | `--black` at 60%                                                                        |
| `--ink`                                      | `--ash-100`                                                                             |
| `--ink-muted`                                | `--ash-300`                                                                             |
| `--ink-dim`                                  | `--ash-500`                                                                             |
| `--ink-inverse`                              | `--night-900`                                                                           |
| `--fill-strong`                              | `--ash-100` (primary buttons, icons)                                                    |
| `--fill-dim`                                 | `--ash-500`                                                                             |
| `--line`                                     | `--ash-500`                                                                             |
| `--line-strong`                              | `--ash-100` (fields, outlined buttons)                                                  |
| `--line-subtle`                              | `--night-600`                                                                           |
| `--accent`                                   | `--gold-400`                                                                            |
| `--timeline`                                 | `--bronze-600`                                                                          |
| `--link`                                     | `--cyan-300`                                                                            |
| `--brand`                                    | `--red-600`                                                                             |
| `--danger`, `--danger-ink`                   | `--red-600`, `--red-100`                                                                |
| `--state-mastered`, `-ground`, `-border`     | the greens                                                                              |
| `--state-rank`, `-ground`, `-border`         | the blues                                                                               |
| `--state-mastered-tint`, `--state-rank-tint` | `--green-400`, `--blue-400` at 20% (the ground behind a part's art)                     |
| `--art-done`                                 | `--night-800` at 20% (a ticked component's faded art)                                   |
| `--state-absent`                             | `--slate-400`                                                                           |
| `--state-prime`                              | `--gold-400`                                                                            |
| `--hover`                                    | `--ash-100` at 8%, laid over what is pressable (BR-39; drawn on the Design System page) |
| `--focus`                                    | `--gold-400`, a 2 px ring offset 2 px (drawn on the Design System page)                 |

A role at a fraction of a primitive's opacity is written as `color-mix()` on
that primitive. `tokens.css` has 23 primitives; Figma's Primitives collection
counts 28, and the five it adds have not been read.

## Type

Line height is the font's own (`auto` in every frame) and letter spacing 0.
Cinzel has no lowercase of its own; its lowercase are small capitals, which is
why the frames' Onkko lines read in small caps without `textCase`.

| Class             | Figma style       | Face           | Weight | Size | Case  | Used for                                             |
| ----------------- | ----------------- | -------------- | ------ | ---- | ----- | ---------------------------------------------------- |
| `.place`          | Display/Place     | Cinzel         | 700    | 40   | upper | the place card's name                                |
| `.numeral`        | Display/Numeral   | Cinzel         | 700    | 36   |       | the numbered steps on the id form                    |
| `.title`          | Display/Title     | Cinzel         | 700    | 32   | upper | screen titles, the hero's name                       |
| `.display-name`   | Display/Name      | Cinzel         | 700    | 32   |       | the player's name                                    |
| `.heading`        | Display/Heading   | Cinzel         | 700    | 24   | upper | system names in the system list                      |
| `.name`           | Name/Default      | Cinzel         | 700    | 16   | upper | card, tile, group, place and update names            |
| `.name-caps`      | Name/Small Caps   | Cinzel         | 700    | 16   |       | the choice cards' titles, in Cinzel's small capitals |
| `.name-s`         | Name/Small        | Cinzel         | 700    | 14   | upper | section titles, dividers, the featured card          |
| `.voice`          | Voice             | Cinzel         | 400    | 14   |       | Onkko's lines                                        |
| `.figure`         | Figure/Value      | Inter          | 700    | 24   |       | "Mastery Rank 27"                                    |
| `.figure-caption` | Figure/Caption    | Inter          | 400    | 24   |       | the rank's title                                     |
| `.body-l`         | Body/Large        | Inter          | 400    | 16   |       | leads, the search field                              |
| `.body`           | Body/Default      | Inter          | 400    | 14   |       | descriptions, prose, dates                           |
| `.body-s`         | Body/Small        | Inter          | 400    | 12   |       | places under a tile, the update list                 |
| `.label`          | Label/Default     | Inter          | 700    | 16   |       | buttons, step titles                                 |
| `.label-upper`    | Label/Upper       | Inter          | 700    | 16   | upper | Newest, system names                                 |
| `.label-s`        | Label/Small       | Inter          | 700    | 14   |       | tabs, counts                                         |
| `.label-s-upper`  | Label/Small Upper | Inter          | 700    | 14   | upper | the counts on the place card                         |
| `.kicker`         | Kicker            | Inter          | 400    | 16   | upper | the hero's catalogue                                 |
| `.eyebrow`        | Eyebrow/Default   | Inter          | 400    | 14   | upper | "Origin", "Normal", "Steel Path"                     |
| `.eyebrow-s`      | Eyebrow/Small     | Inter          | 400    | 12   | upper | "You're on", "System"                                |
| `.badge`          | Badge             | Inter          | 700    | 12   | upper | badges, "You last played"                            |
| `.quiet`          | Quiet             | Inter          | 300    | 14   |       | "12/21 Mastered"                                     |
| `.quiet-upper`    | Quiet/Upper       | Inter          | 300    | 14   | upper | the quiet line in capitals                           |
| `.reading`        | Reading/Default   | JetBrains Mono | 700    | 12   |       | the gold line, "~24 Runs · Rotation A"               |
| `.reading-l`      | Reading/Large     | JetBrains Mono | 700    | 16   |       | the gold line in Summary rows                        |
| `.mono`           | Mono              | JetBrains Mono | 400    | 14   |       | the read cycle, addresses                            |
| `.mono-label`     | Mono/Label        | JetBrains Mono | 400    | 14   | upper | field labels                                         |
| `.mono-strong`    | Mono/Strong       | JetBrains Mono | 700    | 14   |       | the bold part of the read cycle                      |

A type token is a set of properties (`font-family`, `font-weight`, `font-size`,
`text-transform`), one class each in `src/ui/type.module.css`, named in the
table above, which a component's module takes with `composes:`. Like
`tokens.css`, it is the only other file allowed raw type values. Fonts load
through `next/font/google`, self-hosted at build time, as the variables
`--font-cinzel`, `--font-inter` and `--font-jetbrains-mono`.

## Shape, space and effect

| Token family | Values                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radius       | `--radius-xs` 2 (diamonds), `--radius-s` 4 (fields), `--radius-m` 8 (badges, chips), `--radius-l` 24 (buttons, segmented), `--radius-full` (orbs, avatars, round icons) |
| Space        | `--space-1` 2, `--space-2` 4, `--space-3` 6, `--space-4` 8, `--space-5` 12, `--space-6` 16, `--space-7` 24, `--space-8` 32                                              |
| Border       | `--border-1` 1, `--border-2` 2 (a field in error)                                                                                                                       |
| Blur         | `--blur-band` 4 (`Blur/Band`)                                                                                                                                           |
| Gutter       | `--gutter` 16, the frames' side margin                                                                                                                                  |

The frames draw no motion, so there is no duration or easing token yet; the
check below still refuses a raw one in a module.

The 44 px indent of a step's text under its diamond is a component token of
`StepRow`, not a space step.

## Components

Inferred from what the frames repeat, since the file has almost no components.
Each lives in `src/ui/<Name>/` with `Name.tsx`, `Name.module.css` and
`Name.stories.tsx`, and its stories show every variant and state below.

| Component               | Variants and states                                                                                                                                                     | Seen in        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `Button`                | primary (light), secondary (outlined), danger (red outlined), text; rest, hover, focus, disabled, loading (drawn as disabled and marked busy, as Connect is in spec 02) | every screen   |
| `Field`                 | rest, focus, filled, error                                                                                                                                              | 02, 05, 07, 08 |
| `SearchField`           | empty, typing, with suggestions                                                                                                                                         | 05, 07, 08     |
| `Segmented`             | two options; none chosen, one chosen                                                                                                                                    | 07, 09         |
| `Badge`                 | Newest, Start here, New, Mastered, Rank                                                                                                                                 | 05, 07, 09     |
| `Icon`                  | Material Symbols Rounded, by name; sizes 16, 20, 24                                                                                                                     | all            |
| `GameIcon`              | the game's icon from the wiki; the name alone when it has none                                                                                                          | 06, 07, 10     |
| `Wordmark`              | large (splash), header, sheet                                                                                                                                           | 01, 02, 04     |
| `OnkkoLine`             | top, bottom                                                                                                                                                             | all            |
| `Header`                | wordmark only, with chip, sheet (with close)                                                                                                                            | 04             |
| `PlayerChip`            |                                                                                                                                                                         | 04             |
| `TabBar`, `Tab`         | active, inactive; bottom, in the header                                                                                                                                 | 04             |
| `Sheet`                 | full screen, anchored panel                                                                                                                                             | 04, 07         |
| `ChoiceCard`            | with icon, title, line; link                                                                                                                                            | 03, 08         |
| `UpdateCard`            | plain, Newest; with art, without                                                                                                                                        | 05             |
| `FeaturedCard`          | last played, up to date; closed, open                                                                                                                                   | 06, 07         |
| `UpdateList`            | with "Show older"                                                                                                                                                       | 06, 07         |
| `Divider`               | with label                                                                                                                                                              | 06, 07, 10     |
| `GroupRow`              | closed, open; with count                                                                                                                                                | 06, 07         |
| `ItemTile`              | plain, Rank, Mastered                                                                                                                                                   | 06, 07         |
| `Rail`                  | sideways (compact), grid (from 840)                                                                                                                                     | 06, 07         |
| `PlaceCard`             | in progress, mastered                                                                                                                                                   | 07             |
| `ProgressBar`           | in progress, mastered                                                                                                                                                   | 07             |
| `PlaceRow`, `SystemRow` | plain, on view, Start here, New, Mastered, Soon                                                                                                                         | 07             |
| `PlaceCrumb`            | "You're on"                                                                                                                                                             | 09, 10         |
| `ItemHero`              | Rank, Mastered, Not obtained, Not obtained Prime, no state, collectible                                                                                                 | 09             |
| `BlueprintArt`          | the part over the blueprint                                                                                                                                             | 09, 10         |
| `SummaryRow`            | blueprint, component, route                                                                                                                                             | 09             |
| `SectionHeader`         | game icon, part art; open, closed                                                                                                                                       | 09, 10         |
| `StepRow`               | step, optional, alternative, best; open, collapsed                                                                                                                      | 10             |
| `ComponentRow`          | open, collapsed, ticked                                                                                                                                                 | 10             |
| `Checkbox`              | off, on                                                                                                                                                                 | 10             |
| `ErrorBand`             |                                                                                                                                                                         | 02             |
| `LoadingCard`           | the quill                                                                                                                                                               | 02             |
| `SuggestionList`        | the search's list (BR-53): results, no match                                                                                                                            | 08             |
| `PlayerMenu`            | open, with Disconnect                                                                                                                                                   | 04             |
| `SheetHeader`           | wordmark and close                                                                                                                                                      | 04, 07         |
| `DateMenu`              | closed, open                                                                                                                                                            | 05             |
| `ShowMore`              | "Show {n} older"                                                                                                                                                        | 05, 06         |
| `SearchCard`            | title, line, field and Continue                                                                                                                                         | 08             |
| `SuggestionRow`         | icon, name, catalogue; hover, focus                                                                                                                                     | 08             |
| `Timeline`              | the diamonds and the line of a section                                                                                                                                  | 10             |
| `RowDetail`             | the reading under a step                                                                                                                                                | 10             |
| `RowProse`              | the wiki's paragraphs under a step                                                                                                                                      | 10             |
| `WikiLink`              | wiki, our page                                                                                                                                                          | 09, 10         |
| `GroupDivider`          | between groups of steps                                                                                                                                                 | 10             |
| `EmptyState`            | icon, title, one line                                                                                                                                                   | 06, 07, 08     |

## Storybook

- `@storybook/nextjs-vite`, with the accessibility addon and viewports at 360,
  390, 600, 840, 1280 and 1440.
- A **Foundations** page shows every token: swatches with their role, the type
  ramp, radii and spaces, so a value can be read against Figma at a glance.
- Every component has one story per variant and state in the table above.
- Every screen has one story per state its spec lists, rendered from fixture
  data, so a screen is reviewed against its frame without a profile or a
  network.
- The icons the owner approves (tab bar, Two ways in, Goal cards) and the
  suggestion list are proposed here first.

## Checks

- A test fails on any colour, length, radius, duration or font in a
  `.module.css`, outside `tokens.css` and `type.module.css`. `0`, `100%` and
  layout keywords are allowed.
- A test fails on a token that no module uses.
- `pnpm palette` reads `tokens.css` and reports every ink against the colour
  blindness matrices, as the constitution says. It never blocks.

## Built in Figma

On 2026-10-06 the foundations were built in the Figma file itself, so the file
and the code share one vocabulary:

- Three variable collections: **Primitives** (28 colours, hidden from pickers),
  **Color** (37 roles, mode "Dark", each an alias of a primitive) and **Space &
  Shape** (spaces, gutter, radii, borders, the band blur). Every variable has
  its scope and its web code syntax, `var(--name)`, the same name as in
  `tokens.css`.
- 29 text styles and the effect style `Blur/Band`.
- The 46 screen and component frames are bound to them: 1,772 fills, 193
  strokes, 1,513 text colours, 1,513 text runs, 5,708 gaps and paddings, 445
  radii and 119 blurs. What stays unbound is illustration: the white and beige
  points of the planets' constellations and the splash's dark veil.

Binding found combinations the type table above did not have, and they became
styles of their own: `Label/Small Upper` (Inter 700 14, upper: the counts on
the place card), `Label/Upper` (Inter 700 16, upper: Newest, system names),
`Quiet/Upper`, `Mono/Label` (JetBrains Mono 400 14, upper: field labels),
`Mono/Strong` (JetBrains Mono 700 14: the bold part of the read cycle),
`Name/Small Caps` (Cinzel 700 16 in its own small capitals: the choice cards'
titles) and `Display/Name` (Cinzel 700 32: the player's name). It found five
colour roles too: `--state-mastered-tint` and `--state-rank-tint` (the 20%
grounds behind a part's art), `--art-done` (a ticked component's faded art),
`--surface-card` (`#231f1a` at 80%, the choice cards) and `--fill-dim`.
`tokens.css` carries all of them.

### The Design System page

A page of its own, **Design System**, holds the system in four blocks, built the
same day:

- **Foundations**: every colour role as a swatch bound to its variable, a
  specimen of every text style, the space steps and the radii.
- **Atoms**, **Controls and cards**, **Rows and sections**: the components of
  the table above, each a variant set. Each was cloned from its real layer in
  the screens, so it matches the frame exactly and is already bound to the
  tokens: Icon (7, Material Symbols), Badge (5), Button (4 styles × Default,
  Hover, Focus, Disabled), Checkbox, Wordmark (3), Onkko line, Field (Rest,
  Focus, Error), Search field (3 contexts), Segmented, Tab and Tab bar, Choice
  card, Update card, Featured card, Item tile (Plain, Rank, Mastered), Place
  card, Group row, Divider, Place row (7, Dojo and Hover included), System
  row, Place crumb, Summary row, Section header, Step section, Component row
  (Open, Collapsed, Ticked), Error band, Loading card and Item hero (4). The
  header and the player chip are the file's existing `Header` component set,
  shown there as instances.
- **New designs**: what no frame drew: the Goal search's suggestion list
  (Results, No match; BR-53), the Hover and Focus states (BR-39), the Dojo row
  (BR-57). The owner approved them on 2026-10-06.

Three sets were added or rebuilt the same day, from the screens' own layers:
**Tab bar** (Active=Navigation, Resume, Goal), **Summary row** (Blueprint,
Component, Route, rebuilt from the item page's real rows), **Step row** (Art
No or Yes × Open or Collapsed) and **Error band** (one variant per BR-38
message).

**Empty state** was added on 2026-10-07, at the owner's request that an empty
screen say so plainly instead of leaving a blank or a bare line. It is the
search card's surface, padding and type: the icon of the screen's subject, a
title that names what is absent, and one line with the fact and the way on,
all three component properties. Four frames use it: the Summary with nothing
new, Goal with every goal done, the map with everything mastered, and the
place list with no match.

### The screens are built from the components

The owner first chose to keep the screens' own layers, then asked on
2026-10-06 for the components to be placed in them. One pass replaced every
loose layer whose structure matched a component exactly with an instance of
that component, carrying its texts, images, colours and visibility as
overrides: 875 instances, with no failure. A layer that only resembled a
component stayed as it was, and two near misses were caught by comparing the
screens with their exports: icons, which share one shape and are matched by
name, and the example JSON box on Connect, which is shaped like the error band
and was returned to a plain layer. What remains loose is what the system has no
component for: the timeline's diamonds and lines, illustrations, and layouts
that hold components.

### Documented states

A row of frames in the pinned section, under **Documented states**, draws every
mobile state the specs describe that no earlier frame drew: Resume with no
match and with Date open; the Summary with nothing new; the map with Mastered
chosen, with no month, and with everything mastered; the place list with no
match; Goal with results, with no match and with every goal done; a
collectible's item page; a quest's Step by step; and Resume from Two ways in.
Each spec links its own. Desktop is not drawn: the owner chose on 2026-10-06 to
keep the wider layouts in the words of BR-39 and each spec's Desktop section.

## Applied in Figma

On 2026-10-06, at the owner's request, one script applied the unified values to
the 46 screen and component frames of the pinned section, leaving the palette,
the logotype and loose notes untouched: 423 whites in text and interface icons
to `#eae1d9`; 88 `#9b8f80` and 12 `#b6a99a` to the two secondary inks; 26 golds
to `#fcbb4a`; 41 `#1f1c18` to `#1f1b16`; 6 `#352f2d` to `#39342e`; 17 near-blacks
to `#0f0f0f`; 14 title bands to `#37322c` at 90%; and 63 Consolas runs to
JetBrains Mono. No Roboto, Barlow or `#97a5a4` was left inside those frames.
Nothing failed. The file's version history holds the state before.
