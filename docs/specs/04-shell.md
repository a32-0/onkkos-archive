# 04 · Shell

What stays around every screen once onboarding ends: the header on a tab's
root, the top bar on every page under it, the tab bar with the app's three
sections, and the Profile page, which shows who is connected and when their
profile will be read again, and lets them disconnect.

## Frames

- [`662:5177` Star Chart](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-5177) and [`662:6188` Star Chart — Viewport](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6188): the header
  and the tab bar as they sit on a tab's root; the viewport shows the content
  running up to the tab bar, with no gap.
- [`662:6837` Star Chart>Warframes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6837): the top bar on a page under a tab, with
  no tab bar under it (owner, 2026-10-20).
- [`662:4642` Profile](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-4642): the Profile page.
- [`1004:7696` Profile — Mastery Rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1004-7696): Profile with the way to the
  next rank (BR-77, owner, 2026-11-02), and its states
  [`1009:7351` Profile — Mastery Rank — Many to rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7351),
  [`1009:7440` — Nothing to rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7440), [`1009:7526` — Test ready](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7526) and
  [`1009:7612` — Highest rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7612).
- [`943:5889` Profile — Stale read](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=943-5889): Profile after a later read failed (BR-69).
- [`943:6079` Toast — Updated](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=943-6079) and [`943:6161` Toast — Connected](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=943-6161): the toast after a read that worked (BR-70); [`953:6536` Where to start — Connected for the first time](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=953-6536) draws Connected where Connect lands.
- [`679:4734` Catch up — From Where to start](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=679-4734): the header with no tab bar,
  during onboarding.

## Rules

- [BR-06](../business-rules.md#br-06--the-player-menu): the player menu.
- [BR-07](../business-rules.md#br-07--one-profile-read-per-twelve-hours):
  the read cycle in the menu's footer.
- [BR-69](../business-rules.md#br-69--a-later-read-that-fails-keeps-the-player-in-place),
  [BR-70](../business-rules.md#br-70--a-read-that-worked-says-so-once) and
  [BR-71](../business-rules.md#br-71--every-wait-longer-than-a-moment-shows-the-quill):
  a failed read, a read that worked, and every wait.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  the app is never wider than 600 px.
- [BR-41](../business-rules.md#br-41--catch-up-has-two-entrances): Catch up
  shows the tab bar only when reached from its tab.
- [BR-42](../business-rules.md#br-42--the-placeholder-circles-are-the-games-icons):
  the tab bar's icons.
- Thread `1929710840`: no tab bar during onboarding.

## Where the shell shows

| Screen                                                      | Header        | Tab bar |
| ----------------------------------------------------------- | ------------- | ------- |
| `/`, `/connect`, `/features`                                | Wordmark only | No      |
| Catch up and its What's new, from Where to start (`?step=`) | With the chip | No      |
| Catch up and its What's new, from the Catch up tab          | With the chip | Yes     |
| The map, Plan                                               | With the chip | Yes     |
| A page under a tab: a category, an item, a place            | Top bar       | No      |
| The Mastery Rank goal (`/goals/rank`)                       | Top bar       | No      |
| Profile                                                     | Top bar       | No      |

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

Three tabs, in this order: **Star Chart** (the map), **Catch up** (the update
picker), **Plan** (`/goals`). Each is an icon over its label. The active tab
is raised on a lighter surface with a red rule along its top. The content
above it runs up to it, with no gap (owner, 2026-11-01). It shows on a tab's
root only: a page with a back button has no tab bar, since Back is its way
out (owner, 2026-10-20). A tab, its page's title, its window title and its step in the tour carry
one name: **Star Chart**, **Catch up**, **Plan**. Under Catch up, the update
picker is titled Catch up and the list of what came out is titled What's
new, since they are two pages; the item's view is **Overview** and **Step
by step** (owner, 2026-11-01). The words of each are in the glossary of the
constitution.

Which tab is active:

| Screen                         | Active tab                           |
| ------------------------------ | ------------------------------------ |
| The map                        | Star Chart                           |
| `/catch-up` and its What's new | Catch up                             |
| `/goals`                       | Plan                                 |
| `/goals/rank`                  | Plan                                 |
| `/item`, a category, Profile   | The tab of the screen that opened it |

A page under a tab learns where it was opened from through its link, so the
tab the player came from stays lit while they read it.

### The tab bar's icons

Material Symbols Rounded, the interface's icon set, drawn in the frames on
2026-10-06: **Star Chart** `explore`, **Catch up** `hourglass`, **Plan** `flag`.
The Design System page holds them as `Icon` components.

### Profile

A page of its own under the top bar, titled **Profile** (`662:4642`; owner,
2026-10-18). It replaced the player menu, a full-screen sheet:

1. The display name in the display face, then "Mastery Rank {n}" in
   `Kicker/Strong` and the rank's title in `Kicker`, side by side, both in
   `--ink` ("Silver Disciple"; a Legendary rank shows its
   title alone), then the `Rank overview` (BR-77) with `Link=Yes`: the
   player's glyph in the square and the share of the way to the next rank,
   which together open the goal (`/goals/rank`). Its line, in `--link`, is
   the call: "See the way to Rank {n}", or "See the Rank {n} test" with a full
   bar. No chips and no empty state: what to rank, and the test, are the
   goal's and Plan's (owner, 2026-11-02). The highest rank reads
   "The highest rank there is", opens nothing and has no empty state. A profile with no `XPInfo` keeps the avatar square, the name
   and the rank as `662:4642` draws them.
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
   (`WF_APP_VERSION`, `appVersion()`). Check's states are spec 13's
   "Updates".
4. **Disconnect**, a red button across the width. It asks first, in a dialog
   over a scrim ([`838:4762` Profile — Disconnect](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=838-4762);
   owner, 2026-10-24): "Disconnect?", "This device will forget your ID. Next time you'll need to paste it again. Your Warframe account isn't touched.", a red
   **Disconnect** and **Cancel**, which has the focus. Cancel and Escape close
   the dialog. Its Disconnect forgets `wf_account`, `wf_since` and `wf_onkko`
   and opens `/connect` with an empty field.
5. Under it, the read cycle in mono: "Data is read every **12 hours**. The last
   read was **{age}**, and the next one will be at **{h:mm AM}**." The time
   is the player's own, from the system's time zone, which only the browser
   knows, so the line is written once the page has loaded and never in UTC
   (owner, 2026-10-21 and 2026-11-01; `useLocalTime()` in `read-cycle.ts`).

After a later read failed, the read cycle gives way to the Warning alert under the
player's name and rank, with BR-69's words: the age of the data shown and the
time of the next try (`943:5889`).

### The toast

`Toast` floats 12 px under the header or the top bar, across the column, over
the screen (`943:6079`, `943:6161`). It is the Success state of
[`947:159` Alert](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=947-159),
the owner's design of 2026-11-01, and says BR-70's words: **Connected** on the first screen after Connect,
**Updated** on the first screen shown in the minute after DE was read again.
The minute matters because the read often happens on a screen that only
redirects: the desktop app opens `/system`, which reads and sends the player on
to their place, so the screen they see finds the read already stored. It is a polite status
for screen readers, leaves after six seconds (held while the pointer or the
focus is on it) or on a tap, and each read shows
it once: the browser remembers the reads it has shown for the session. Connect
leaves a one-minute `wf_toast` cookie that the screen reads and the toast
clears.

### Alert

In Figma there is one component, [`947:159` Alert](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=947-159),
with a State and a Message; every message the app shows is an example in
[`956:6488` Alert — Examples](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=956-6488) (owner, 2026-11-01; until then the
id form's messages and the toast were components of their own). `Alert` is one message in one of four states, each its own ground, ink and
Material Symbols icon at 18 px: **Informative** (`info`), **Success**
(`check-circle`), **Warning** (`warning`) and **Error** (`error`). The text is
mono bold, `Mono/Strong` (owner, 2026-11-01). Each ink reaches about 7:1 on its ground (WCAG AAA for text, and well
over the 3:1 an icon needs). Error is a screen-reader alert; the others are a
polite status. Error carries BR-38's messages on the id form, Warning BR-69's
in Profile, Success the toast. Nothing uses Informative yet.

### The wait

Every link and every form that sends the player on shows the loading screen
(`LoadingCard`, spec 02's Loading) once the wait passes 400 ms (BR-71). The
page stays as it was underneath. Links go through the shell's `Link`, which
watches Next's `useLinkStatus`; forms hold a `FormWait`, which watches
`useFormStatus`; Plan's search, which jumps to a result on Enter, wraps the
jump in a transition and shows the same `Wait` while it is pending.

The avatar is the player's active glyph (owner, 2026-10-16): the profile's `ActiveAvatarImageType`, drawn with the glyph's art from `@wfcd/items` (`avatarOf()` in `domain/profile/avatar.ts`), as the chip's and Profile's squares. A profile that names no glyph, or one the catalog lacks, keeps the square the frame draws. The demos wear Cephalon Cy's glyph and Conquera Ordis's, set by the fixture source. A live response read on 2026-10-23 carries no glyph anywhere: its only image-like fields are `LoadOutPreset.PresetIcon`, empty, and `GuildEmblem`, a flag. A live player therefore wears the game's default glyph, Lotus Symbol (`AvatarImageDefault`, the one every account starts with; owner, 2026-10-23), until the player can choose one; the square stays only if the catalog lacks it.

## The first tour

Built by T-45 (owner, 2026-10-24). The first time a player reaches a screen
with both the header's chip and the tab bar, four hotspots walk them through
the shell, one at a time, each drawn by its frame. Each says what the
section holds and what the player can do there, in two to four short
sentences (owner, 2026-10-24):

| Step | Points at        | Frame                          | Words                                                                                                                                                                                                                                        |
| ---- | ---------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Star Chart's tab | `844:4776` Tour — 1 Star Chart | "The star chart, one place at a time. Change location to jump to another planet or system. The ring shows how much gear here you've mastered, ranked to the max. Only what you can master or collect is listed, not every item in the game." |
| 2    | Catch up's tab   | `844:5065` Tour — 2 Catch up   | "Everything the game added since the update you last played, grouped by category. Name your last update and the app counts from there. Open a category to see each new thing and how to get it."                                             |
| 3    | Plan's tab       | `844:5354` Tour — 3 Plan       | "Pick one thing to chase: take a suggestion or search for it. You get the steps in order: what it needs, where each part drops and what to unlock first."                                                                                    |
| 4    | The player chip  | `844:5643` Tour — 4 Profile    | "Your account, and when it's read again, every 12 hours. Change your settings or disconnect here. Tutorial plays this tour again."                                                                                                           |

- A scrim covers the screen but the hotspot, which a 2 px `--brand` ring
  outlines. The coach mark, on `--surface-raised`, says "{n} of 4", the
  step's name and its words, with **Skip** and **Next** sharing the row
  (**Done** alone on the last, 120 px at the right), 12 px between its parts. It sits above a tab and below the chip, 16 px from the window's
  edges.
- It is a modal dialog: the focus starts on Next, Escape skips. Skip, Done
  or Escape end the tour and keep `wf_tour` for a year, so it never shows
  again on this device. Disconnect leaves it: the tour belongs to the
  device, not the account.
- The server leaves the tour out of the page once `wf_tour` is set, so it
  never flashes in.

## Data and sources

- Display name, Mastery Rank: the profile, through the screen context.
- Rank title: `SHELL.rankTitle`, the names on the wiki's Mastery Rank page.
- The way to the next rank: `rankProgress()` in
  `src/domain/profile/mastery-rank.ts`, over `XPInfo`, `Missions`,
  `PlayerSkills`, the catalog and the wiki's node mastery (BR-76).
- Last read and next read: the cache's stored time and `nextReadAt()`.
- Icons: the wiki, served from its host and never rehosted.

## Components

Each is one component with its Storybook stories: `Alert`, `Toast`, `Header`, `PlayerChip`,
`RankOverview` (In progress, Many to rank, Nothing to rank, Test ready,
Highest rank), `ItemChip` (Default, Done, More, Hover, Focus), `EmptyState`,
`TopBar`, `TabBar` and `Tab` (active, inactive), `List` holding a
`ControlRow` per setting, `Segmented`, and `Button` in the red filled variant
Disconnect uses; Profile is a screen.

## Acceptance

1. At 390 px the header, the top bar, the tab bar and Profile match
   `662:5177`, `662:6188`, `662:6837` and `662:4642`.
2. The shell shows and hides as the table above says, on every route.
3. The active tab follows the table above, `/item` included.
4. At 360 and 600 nothing overlaps or is cut, and wider than 600 the page stays a centred 600 px column (BR-39).
5. Disconnect clears both cookies and lands on `/connect` with an empty field.
6. The read cycle shows the real last read and the next read in the player's
   own time; after a failed read, the band of BR-69 in its place.
7. A read that worked shows its toast once, never on the demo; a refresh or
   going back does not show it again.
8. A screen that takes longer than 400 ms shows the loading screen over the
   page; a quicker one shows nothing.
9. Every part has its stories, in every state the frames draw.
10. With Cy, Profile shows "Mastery Rank 27" and the square filled to the
    share of the way to Rank 28, as a link to the goal, with no chips
    (`request.test.ts`, `rank-view.test.ts`).
11. `pnpm check` passes.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
