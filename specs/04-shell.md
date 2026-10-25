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
  no tab bar under it (owner, 2026-10-20).
- [`662:4642` Profile](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-4642): the Profile page.
- [`679:4734` Resume — From Two Ways In](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=679-4734): the header with no tab bar,
  during onboarding.

## Rules

- [BR-06](../docs/business-rules.md#br-06--the-player-menu): the player menu.
- [BR-07](../docs/business-rules.md#br-07--one-profile-read-per-twelve-hours):
  the read cycle in the menu's footer.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  from 840 the tab bar floats at the bottom of the screen.
- [BR-41](../docs/business-rules.md#br-41--resume-has-two-entrances): Resume
  shows the tab bar only when reached from its tab.
- [BR-42](../docs/business-rules.md#br-42--the-placeholder-circles-are-the-games-icons):
  the tab bar's icons.
- Thread `1929710840`: no tab bar during onboarding.

## Where the shell shows

| Screen                                              | Header        | Tab bar                       |
| --------------------------------------------------- | ------------- | ----------------------------- |
| `/`, `/connect`, `/features`                        | Wordmark only | No                            |
| Resume and its Summary, from Two ways in (`?step=`) | With the chip | No                            |
| Resume and its Summary, from the Resume tab         | With the chip | Yes                           |
| The map, Goal                                       | With the chip | Yes                           |
| A page under a tab: a category, an item, a place    | Top bar       | No; from 840 the floating bar |
| Profile                                             | Top bar       | No; from 840 the floating bar |

## The parts

### Header

The wordmark at the left, and at the right the **player chip**: the avatar
square and the display name on a card of `--surface`, `--space-4` inside it,
with `--radius-m` corners, and a chevron pointing forward after the name
(owner, 2026-10-22 and 2026-10-23, on `306:1099`). A
thin red rule runs under the header.
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
above it stops 8 px short of it (owner, 2026-10-18). It shows on a tab's
root only: a page with a back button has no tab bar below 840, since Back is
its way out (owner, 2026-10-20).

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
   **Tutorial** (Reset, a button 200 px wide; owner, 2026-10-22). Onkko's Phrases shows once the player has reached
   Cetus (BR-64). Language shows disabled; it waits for a later version
   (owner, 2026-10-16). Tutorial's Reset shows the first tour again: it
   forgets `wf_tour` and opens the map, where the tour starts (T-45).
3. **About**, in the app alone (`819:48` Profile — App; approved by the
   owner on 2026-10-23): a divider, then two rows: **Version**,
   the app's version in `--ink-muted`, and **Updates**, a **Check** button
   200 px wide that asks GitHub Releases at once (spec 13, "Updates"). The
   demo site shows neither. The version comes from the main process
   (`WF_APP_VERSION`, `appVersion()`). Built on 2026-10-23 with Check shown
   disabled, as Reset is, until T-38 brings the updater it asks; enabled by
   T-38, its states are spec 13's "Updates".
4. **Disconnect**, a red button across the width. It asks first, in a dialog
   over a scrim ([`838:4762` Profile — Disconnect](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=838-4762);
   owner, 2026-10-24): "Disconnect?", "This device will forget your ID. Next time you'll need to paste it again. Your Warframe account isn't touched.", a red
   **Disconnect** and **Cancel**, which has the focus. Cancel and Escape close
   the dialog. Its Disconnect forgets `wf_account`, `wf_since` and `wf_onkko`
   and opens `/connect` with an empty field.
5. Under it, the read cycle in mono: "Data is read every **12 hours**. The last
   read was **{age}**, and the next one will be at **{h:mm AM} your local
   time**." The page is drawn with "**{HH:MM} hours UTC**", which the
   browser turns into the player's own time once it loads, since only the
   browser knows its time zone (owner, 2026-10-21).

The avatar is the player's active glyph (owner, 2026-10-16): the profile's `ActiveAvatarImageType`, drawn with the glyph's art from `@wfcd/items` (`avatarOf()` in `domain/profile/avatar.ts`), as the chip's and Profile's squares. A profile that names no glyph, or one the catalog lacks, keeps the square the frame draws. The demos wear Cephalon Cy's glyph and Conquera Ordis's, set by the fixture source. A live response read on 2026-10-23 carries no glyph anywhere: its only image-like fields are `LoadOutPreset.PresetIcon`, empty, and `GuildEmblem`, a flag. A live player therefore wears the game's default glyph, Lotus Symbol (`AvatarImageDefault`, the one every account starts with; owner, 2026-10-23), until the player can choose one; the square stays only if the catalog lacks it.

## The first tour

Built by T-45 (owner, 2026-10-24). The first time a player reaches a screen
with both the header's chip and the tab bar, four hotspots walk them through
the shell, one at a time, each drawn by its frame. Each says what the
section holds and what the player can do there, in two to four short
sentences (owner, 2026-10-24):

| Step | Points at        | Frame                          | Words                                                                                                                                                                                                                                        |
| ---- | ---------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Navigation's tab | `844:4776` Tour — 1 Navigation | "The star chart, one place at a time. Change location to jump to another planet or system. The ring shows how much gear here you've mastered, ranked to the max. Only what you can master or collect is listed, not every item in the game." |
| 2    | Resume's tab     | `844:5065` Tour — 2 Resume     | "Everything the game added since the update you last played, grouped by category. Name your last update and the app counts from there. Open a category to see each new thing and how to get it."                                             |
| 3    | Goal's tab       | `844:5354` Tour — 3 Goal       | "Pick one thing to chase: take a suggestion or search for it. You get the steps in order: what it needs, where each part drops and what to unlock first."                                                                                    |
| 4    | The player chip  | `844:5643` Tour — 4 Profile    | "Your account, and when it's read again, every 12 hours. Change your settings or disconnect here. Tutorial plays this tour again."                                                                                                           |

- A scrim covers the screen but the hotspot, which a 2 px `--brand` ring
  outlines. The coach mark, on `--surface-raised`, says "{n} of 4", the
  step's name and its words, with **Skip** and **Next** sharing the row
  (**Done** alone on the last, 120 px at the right), 12 px between its parts. It sits above a tab and below the chip, 16 px from the window's
  edges; from 840 it centres on the hotspot over the floating bar.
- It is a modal dialog: the focus starts on Next, Escape skips. Skip, Done
  or Escape end the tour and keep `wf_tour` for a year, so it never shows
  again on this device. Disconnect leaves it: the tour belongs to the
  device, not the account.
- The server leaves the tour out of the page once `wf_tour` is set, so it
  never flashes in.

## Data and sources

- Display name, Mastery Rank: the profile, through the screen context.
- Rank title: `SHELL.rankTitle`, the names on the wiki's Mastery Rank page.
- Last read and next read: the cache's stored time and `nextReadAt()`.
- Icons: the wiki, served from its host and never rehosted.

## Desktop (BR-39)

- From 840 the tab bar floats (owner, 2026-10-21; it had sat in the header,
  between the wordmark and the chip): a card on `--surface-header`, the
  header's ground, with a `--line-subtle` border, `--radius-l` and 8 px
  inside, centred, 48 px above the bottom of the screen, over the content.
  Its three tabs keep the same order and the same active treatment, each 96
  by 56 px with square corners (owner, 2026-10-21). The content ends 130 px
  above the bottom, 8 px over the bar, so the last row scrolls clear of it.
  [`Tab bar` Placement=Floating](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=757-564)
  draws it, and `Search — Desktop` (spec 12) shows it in place.
- From 840 a page under a tab keeps the header above its top bar and the
  floating bar under it, so the tabs stay in reach. Profile and every page under a tab
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
4. From 840 the tabs float at the bottom; at 360, 600, 840, 1280 and 1440
   nothing overlaps or is cut.
5. Disconnect clears both cookies and lands on `/connect` with an empty field.
6. The read cycle shows the real last read and the next read in the player's
   own time.
7. Every part has its stories, in every state the frames draw.
8. `pnpm check` passes.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
