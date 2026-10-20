# 04 · Shell

What stays around every screen once onboarding ends: the header on a tab's
root, the top bar on every page under it, the tab bar with the app's three
sections, and the Profile page, which shows who is connected and when their
profile will be read again, and lets them disconnect.

## Frames

- [`662:5177` Map](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-5177) and [`662:6188` Map — Viewport](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6188): the header
  and the tab bar as they sit on a tab's root; the viewport shows the content
  stopping 8 px above the tab bar.
- [`662:6837` Map>Warframes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6837): the top bar on a page under a tab, with
  the tab bar still under it.
- [`662:4642` Profile](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-4642): the Profile page.
- [`679:4734` Resume — From Two Ways In](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=679-4734): the header with no tab bar,
  during onboarding.

## Rules

- [BR-06](../docs/business-rules.md#br-06--the-player-menu): the player menu.
- [BR-07](../docs/business-rules.md#br-07--one-profile-read-per-twelve-hours):
  the read cycle in the menu's footer.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  the tab bar in the header from 840.
- [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances): Resume
  shows the tab bar only when reached from its tab.
- [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons):
  the tab bar's icons.
- Thread `1929710840`: no tab bar during onboarding.

## Where the shell shows

| Screen                                              | Header        | Tab bar                                          |
| --------------------------------------------------- | ------------- | ------------------------------------------------ |
| `/`, `/connect`, `/features`                        | Wordmark only | No                                               |
| Resume and its Summary, from Two ways in (`?step=`) | With the chip | No                                               |
| Resume and its Summary, from the Resume tab         | With the chip | Yes                                              |
| The map, Goal                                       | With the chip | Yes                                              |
| A page under a tab: a category, an item, a place    | Top bar       | Yes, but none from Two ways in (`?step=`, BR-41) |
| Profile                                             | Top bar       | Yes                                              |

## The parts

### Header

The wordmark at the left, and at the right the **player chip**: the avatar
square, the display name and a chevron. A thin red rule runs under the header.
The chip opens Profile. The wordmark is not a link. The header shows on a
tab's root only.

### Top bar

Every page under a tab opens under a top bar as tall as the header (65 px),
on the same ground and over the same red rule: a round back button and the
page's title in the display face. Back is the browser's back: it returns to
the screen the player came from, where they were on it (owner, 2026-10-19).
When nothing in the app came before the page, it goes to the screen above
it instead: a category to its menu, Updates to where it was opened, the place
and system lists to the map and to the place list, Profile and an item to the
root of the tab they were opened from (T-27b, owner 2026-10-18).

### Tab bar

Three tabs, in this order: **Navigation** (the map), **Resume** (the update
picker), **Goal** (`/goals`). Each is an icon over its label. The active tab
is raised on a lighter surface with a red rule along its top. The content
above it stops 8 px short of it (owner, 2026-10-18).

Which tab is active:

| Screen                       | Active tab                           |
| ---------------------------- | ------------------------------------ |
| The map                      | Navigation                           |
| `/catch-up` and its Summary  | Resume                               |
| `/goals`                     | Goal                                 |
| `/item`, a category, Profile | The tab of the screen that opened it |

A page under a tab learns where it was opened from through its link, so the
tab the player came from stays lit while they read it.

### The tab bar's icons

Material Symbols Rounded, the interface's icon set, drawn in the frames on
2026-10-06: **Navigation** `explore`, **Resume** `hourglass`, **Goal** `flag`.
The Design System page holds them as `Icon` components.

### Profile

A page of its own under the top bar, titled **Profile** (`662:4642`; owner,
2026-10-18). It replaced the player menu, a full-screen sheet:

1. The avatar square, the display name in the display face, "Mastery Rank
   {n}" and the rank's title under it ("Middle Master").
2. **Settings**: a divider, then the settings as a grouped list, one row
   each: **Language** (English, Español), **Onkko's Phrases** (On, Off) and
   **Tutorial** (Reset). Onkko's Phrases shows once the player has reached
   Cetus (BR-64). Language and Tutorial show disabled; they wait for later
   versions (owner, 2026-10-16).
3. **Disconnect**, a red button across the width. It forgets `wf_account`,
   `wf_since` and `wf_onkko` and opens `/connect` with an empty field.
4. Under it, the read cycle in mono: "Data is read every **12 hours**. The last
   read was **{age}**, and the next one will be at **{HH:MM} hours UTC**."

The avatar is the player's active glyph (owner, 2026-10-16): the profile's `ActiveAvatarImageType`, drawn with the glyph's art from `@wfcd/items` (`avatarOf()` in `domain/profile/avatar.ts`), as the chip's and Profile's squares. A profile that names no glyph, or one the catalog lacks, keeps the square the frame draws. The demos wear Cephalon Cy's glyph and Conquera Ordis's, set by the fixture source.

## Data and sources

- Display name, Mastery Rank: the profile, through the screen context.
- Rank title: `SHELL.rankTitle`, the names on the wiki's Mastery Rank page.
- Last read and next read: the cache's stored time and `nextReadAt()`.
- Icons: the wiki, served from its host and never rehosted.

## Desktop (BR-39)

- From 840 the tab bar leaves the bottom and its three tabs sit in the header,
  between the wordmark and the chip, in the same order and with the same
  active treatment.
- From 840 a page under a tab keeps the header, with the tabs in it, above
  its top bar, so the tabs stay in reach. Profile and every page under a tab
  stay one centred column at the frame's width, as the other pages do.

## Components

Each is one component with its Storybook stories: `Header`, `PlayerChip`,
`TopBar`, `TabBar` and `Tab` (active, inactive), `List` holding a
`ControlRow` per setting, `Segmented`, and `Button` in the red filled variant
Disconnect uses; Profile is a screen.

## Acceptance

1. At 390 px the header, the top bar, the tab bar and Profile match
   `662:5177`, `662:6188`, `662:6837` and `662:4642`.
2. The shell shows and hides as the table above says, on every route.
3. The active tab follows the table above, `/item` included.
4. From 840 the tabs sit in the header; at 360, 600, 840, 1280 and 1440
   nothing overlaps or is cut.
5. Disconnect clears both cookies and lands on `/connect` with an empty field.
6. The read cycle shows the real last read and the next read in UTC.
7. Every part has its stories, in every state the frames draw.
8. `pnpm check` passes.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
