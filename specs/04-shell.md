# 04 · Shell

What surrounds every screen once onboarding ends: the header, the tab bar and
the player menu.

## Frames

- [`212:159` Navigation](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=212-159)
  and [`312:199`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=312-199),
  its collapsed state: the header and the tab bar as they sit on a screen.
- [`270:1145`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-1145):
  the player menu.
- [`215:610`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=215-610)
  and [`270:786`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-786):
  the header of a full-screen sheet (small wordmark, close). Their content is
  spec 07's.

## Rules

- [BR-06](../docs/business-rules.md#br-06--the-player-menu): the player menu.
- [BR-07](../docs/business-rules.md#br-07--one-profile-read-per-twelve-hours):
  the read cycle in the menu's footer.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  the tab bar in the header from 840, the menu as a panel.
- [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances): Resume
  shows the tab bar only when reached from its tab.
- [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons):
  the tab bar's icons.
- Thread `1929710840`: no tab bar during onboarding.

## Where the shell shows

| Screen                                      | Header        | Tab bar |
| ------------------------------------------- | ------------- | ------- |
| `/`, `/connect`, `/features`                | Wordmark only | No      |
| Resume and its Summary, from Two ways in    | With the chip | No      |
| Resume and its Summary, from the Resume tab | With the chip | Yes     |
| The map, Goal, the item                     | With the chip | Yes     |
| A full-screen sheet                         | Sheet header  | No      |

## The parts

### Header

The wordmark at the left, and at the right the **player chip**: the avatar
square, the display name and a chevron. A thin red rule runs under the header.
The chip opens the player menu. The wordmark is not a link.

### Tab bar

Three tabs, in this order: **Navigation** (the map), **Resume** (the update
picker), **Goal** (`/goals`). Each is an icon over its label. The active tab
is raised on a lighter surface with a red rule along its top.

Which tab is active:

| Screen                      | Active tab                                 |
| --------------------------- | ------------------------------------------ |
| The map                     | Navigation                                 |
| `/catch-up` and its Summary | Resume                                     |
| `/goals`                    | Goal                                       |
| `/item`                     | The tab of the screen that opened the item |

`/item` learns where it was opened from through its link, so the tab the
player came from stays lit while they read an item.

### The tab bar's icons

Material Symbols Rounded, the interface's icon set, drawn in the frames on
2026-10-06: **Navigation** `explore`, **Resume** `hourglass`, **Goal** `flag`.
The Design System page holds them as `Icon` components.

### Sheet header

A full-screen sheet replaces the header with its own: the small wordmark at
the left and a close button at the right, over the same red rule. Close
returns to the screen underneath, as it was.

### Player menu

A full-screen sheet with the sheet header (`270:1145`):

1. The avatar square, the display name in the display face, "Mastery Rank
   {n}" and the rank's title under it ("Middle Master").
2. At the bottom, **Disconnect**, a red outlined button across the width. It
   forgets `wf_account` and `wf_since` and opens `/connect` with an empty field.
3. Under it, the read cycle in mono: "Data is read every **12 hours**. The last
   read was **{age}**, and the next one will be at **{HH:MM} hours UTC**."

The profile carries no picture, so the avatar is the square the frame draws.

## Data and sources

- Display name, Mastery Rank: the profile, through the screen context.
- Rank title: `SHELL.rankTitle`, the names on the wiki's Mastery Rank page.
- Last read and next read: the cache's stored time and `nextReadAt()`.
- Icons: the wiki, served from its host and never rehosted.

## Desktop (BR-39)

- From 840 the tab bar leaves the bottom and its three tabs sit in the header,
  between the wordmark and the chip, in the same order and with the same
  active treatment.
- From 840 the player menu opens as a panel at the frame's 390 px, anchored
  under the chip, with the same content; close or a click outside dismisses
  it. Full-screen sheets of spec 07 follow the same rule.

## Components

Each is one component with its Storybook stories: `Header`, `PlayerChip`,
`TabBar` and `Tab` (active, inactive), `SheetHeader`, `PlayerMenu`, and
`Button` in the red outlined variant Disconnect uses.

## Acceptance

1. At 390 px the header, the tab bar and the player menu match `212:159`,
   `312:199` and `270:1145`.
2. The shell shows and hides as the table above says, on every route.
3. The active tab follows the table above, `/item` included.
4. From 840 the tabs sit in the header and the menu opens as an anchored
   panel; at 360, 600, 840, 1280 and 1440 nothing overlaps or is cut.
5. Disconnect clears both cookies and lands on `/connect` with an empty field.
6. The read cycle shows the real last read and the next read in UTC.
7. Every part has its stories, in every state the frames draw.
8. `pnpm check` passes.

## Divergences from the code

| Today                                                                     | The frames and rules                                 |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| The menu is a dropdown sheet with a secondary Disconnect                  | A full-screen sheet, red outlined Disconnect (BR-06) |
| The read cycle reads "Read every twelve hours: last read 12 min ago…"     | The frame's sentence                                 |
| `/features` sits inside the shell                                         | Outside it                                           |
| `/catch-up` has one form                                                  | Two entrances (BR-41)                                |
| The active tab is chosen per page, and `/item` has none of its own origin | The table above                                      |
| Tab icons as built                                                        | The three approved icons                             |

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
