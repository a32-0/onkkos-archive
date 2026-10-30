# 02 · Connect

Where a player types their Warframe account id so the app can read their
public profile, or picks a demo profile to try the app without one. It is the
only screen that reads a profile for the first time, the only one that shows a
read in progress, and the only one that says what went wrong when a read
fails.

## Frames

- [`661:4354` Onboarding](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=661-4354):
  the form at rest, with the demo profiles.
- [`675:5392` Onboarding — Loading](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5392):
  the form while the profile is read.
- [`662:6943` Onboarding>Error](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-6943):
  the form after a failed read.

Drawn on 2026-10-22 from Onboarding, for the owner to approve before this
part of the spec is pinned:

- [`764:4753` Connect — Demo](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=764-4753): the screen on the demo website,
  which reads no account (below). Its lead reads "This is a demo: two
  players' archives to explore. Nothing here reads an account."; the card
  under the demos is headed **Your own account** and reads "The app reads
  your profile from your own computer, through your own connection. For
  Windows and Linux.", over Microsoft's **Download from the Microsoft Store**
  badge, centred, and, under it, the text button **Or from GitHub, for
  Windows and Linux** (owner, 2026-10-30).

- [`864:5693` Connect — Reads note](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=864-5693):
  Onboarding with the note under the field (approved by the owner on
  2026-10-25).

- [`895:5723` Onboarding — Find your ID](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=895-5723):
  the help page **Help me find my ID** opens (owner, 2026-10-29; below).

On 2026-10-29 every Connect frame above took **More help** under the steps,
and **Explore with a demo** as two choice cards (owner). On 2026-10-30 the
button became **Help me find my ID** in every one of them (owner).

The steps were redrawn in all three on 2026-10-15: `warframe.com/api/user-data`
answers 404, so the id is read from the `gid` cookie instead (owner).

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`480:94` Error band](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=480-94): on the Design System page, one variant per BR-38 message (Invalid ID, Not found, Not answering, Unreadable, Limited), each padded `space/5` (12 px) on every side (owner, 2026-10-29). The Error frame shows Invalid ID.

## Rules

- [BR-01](../business-rules.md#br-01--remember-the-player-on-this-device):
  the device remembers the id.
- [BR-02](../business-rules.md#br-02--the-lead-line-is-one-of-onkkos-contextual-phrases):
  the lead line is Onkko's.
- [BR-03](../business-rules.md#br-03--a-low-level-player-is-not-asked-when-they-last-played):
  where a successful read leads.
- [BR-38](../business-rules.md#br-38--loading-and-errors-happen-on-the-id-form):
  loading and errors, and the band's five messages.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  wider than the frame.

## What the screen does

Route `/connect`, outside the shell: the header carries the wordmark and no
tabs or player chip. From the top, as `661:4354` draws it:

1. Onkko's line, "It is time. Utter the name.", and the lead, "Onkko will read
   your public profile and tell you what's left. Nothing is written to your
   account."
2. The **Account ID** field and **Connect**. The field's placeholder is the
   frame's `4b2e9f17c3a85d06e1f74a9c`, an invented id of the real shape. When
   the device remembers an id (`wf_account`), the field holds it (BR-01).
   Under the field, and under the band when one shows, a note in
   `--ink-muted` says what a wrong id costs before it is sent: "This device can read 2 profiles from Warframe every 12 hours, and a wrong ID uses one. Check it's the gid value before you connect."
   Two ids with the right shape that answer no account spend both reads and
   lock the device out for twelve hours (spec 11), so the note stands before
   the first try rather than after (owner, 2026-10-25).
3. **Where do I find this?**: three numbered steps. On a computer,
   log in at `https://www.warframe.com`, a link that opens in a new tab; in the
   same browser, open the developer tools, pressing F12, and in the side or
   down panel go to the cookies (**On Firefox:** Storage › Cookies, **On Edge
   or Chrome:** Application › Cookies, the browsers' names in bold; Edge
   added on 2026-10-29, since Windows ships it); copy the value of the `gid`
   cookie. Under the steps, **Help me find my ID**, a secondary button, opens
   **Find your ID** (below). Then an example of that cookie and the
   note "It's safe: it's the same public profile the game shows when you look at
   another player. We only remember your ID on this device, and Disconnect
   forgets it." The cookie is the app's only record of the
   player and is needed to read their profile, so no consent banner is shown
   (owner, 2026-10-21).
4. **Explore with a demo**: the label, then two choice cards, as Two ways in
   draws them, with no card around them, since nothing nests a card in a
   card: **Ordis**, with `rocket-launch`, "Mastery Rank 2. A player starting
   out, with most of the archive still ahead."; then **Cy**, with
   `military-tech`, "Mastery Rank 27. A player far along, with what's left
   after years of play." The rank is the fixture's own. Each card is the
   form's submit button (owner, 2026-10-29).

### Find your ID

`/connect/find-your-id`, outside the shell like Connect, under a top bar
titled **Find your ID** whose back goes to `/connect`. Content is never folded
inside other content (constitution), so the pictures have their own page
instead of opening inside the steps (owner, 2026-10-29). A lead,
"Where the “gid” cookie is, in what each browser shows. Do it on a computer,
logged in at www.warframe.com.", where `www.warframe.com` is an underlined
link that opens the site in a new tab, then one card per browser, **Firefox**
and then **Edge or Chrome** (one card, as both use the same developer tools),
each with three numbered steps ("**Press F12** to open the developer tools.";
Storage › Cookies, or Application › Cookies, › `https://www.warframe.com`;
"Type “gid” in the filter, and copy its **Value**.", the words in bold as
the frame sets them; owner, 2026-10-30) and a screenshot of that panel with
its alt text. The screenshots are the owner's,
taken in English, filtered to the `gid` row, with the frame's example id in
place of a real one, so they show nothing of an account. The demo website
never links to it, since it asks for no id.

### Connect

1. The id is trimmed and checked for shape (24 hexadecimal characters,
   either case) before any call. A bad shape shows the `invalid-id` band
   without reading anything.
2. Otherwise the form enters **Loading** (`675:5392`): Connect is disabled,
   and the loading screen every wait shares covers the page (owner,
   2026-10-29): the whole screen behind black at 80% (`--scrim-strong`), and
   the quill alone, 64 × 96, centred on it, with no card and no visible
   words. The page stays as it was underneath. Screen readers hear
   "Onkko is reading your archive...". The quill writes a stroke, lifts, and
   starts again every 2.4 s
   ([`841:536` Loading — Quill motion](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=841-536);
   owner, 2026-10-23); with reduced motion it stands still and draws no
   stroke (T-44).
3. On success the id is saved in `wf_account` for a year, and the player goes
   on by BR-03: a player who has reached Venus to `/features`, a new player to
   `/goals`. A profile whose `Missions[]` cannot be read counts as reached.
4. On failure the form returns to rest with the **Error** band (`662:6943`)
   under the field, holding that reason's message from BR-38. The field keeps
   what was typed, and the form can be sent again at once.

### A demo

Each demo card saves that demo's id in `wf_account` and goes on by BR-03,
exactly as a real read would. Both demos have reached Venus (Ordis stops at
Mercury), so both land on `/features` (owner, 2026-10-15). A demo is
read from its fixture and never calls DE. It spends no lookup from the
visitor's budget.

### On the demo

The website is a demo of the app (constitution; spec 13). It never reads an
account, so its `/connect` asks for none. In place of the Account ID field,
Connect and **Where do I find this?**, **Connect — Demo** shows the two demos
first and, under them, a card that sends the player to the app: one line that
says their own account is read by the app on their computer, then two ways
to get it, each opened in a new tab (owner, 2026-10-30):

- Microsoft's own badge, **Download from the Microsoft Store**, at its own
  size and colours (the dark one), centred, which opens the app's Store
  listing. It comes first: the Store's package is signed, so Windows shows
  no warning (spec 13).
- **Or from GitHub, for Windows and Linux**, a text button, which opens the
  repository's latest release. The release page lists the Windows installer
  and the Linux AppImage, so the demo does not guess the player's system.

An id remembered from before (`wf_account`) that is no demo's is forgotten on
the demo: the screens treat the device as connected to nothing, and `/connect`
shows the demo state. The app, and development, keep the form as this spec
draws it above.

### A failure on another screen

Every later read happens on a screen inside the shell, once the twelve hours
have passed. When it fails, that screen sends the player to `/connect` with
the reason and, where one is known, the retry time. The form shows the band
for that reason with the remembered id in the field (BR-38). No other screen
draws a failure.

## States

| State   | Frame      | What differs from rest                                     |
| ------- | ---------- | ---------------------------------------------------------- |
| Rest    | `661:4354` | Empty field, or the remembered id                          |
| Loading | `675:5392` | Connect disabled, the page behind black at 80%, the quill  |
| Error   | `662:6943` | The red band under the field with one of the five messages |
| Demo    | `764:4753` | The demos and the card to the Store and GitHub, no field   |

## Data and sources

- The read: `fetchProfile()` in `src/infra/profile/read.ts`, with the shared
  locks the constitution names. Its `FailureReason` picks the band's message;
  its `retryAfterSeconds` gives the time in it, in the player's own time once
  the page loads, and as `HH:MM UTC` before (BR-38).
- The demos: `fixtures/profile-ordis.json` and `fixtures/profile-cy.json`,
  both output of `pnpm fixture`, matched by the ids `…0002` and `…0001` in
  `src/infra/profile/fixture-source.ts`. The Mastery Rank on each button is
  read from its fixture's `PlayerLevel`, so the label cannot drift from the
  data.
- The frame's example id, `4b2e9f17c3a85d06e1f74a9c`, is invented: 24
  characters of 0–9 and a–f, so it reads as an id, and it is no demo's id.
  It cannot be anyone's. An account id is a MongoDB ObjectId, whose first 8
  characters are its creation time in seconds; `4b2e9f17` is 20 December
  2009, before Warframe's closed beta in October 2012, so no account was
  created then (owner, 2026-10-15). A replacement keeps a date before 2012.
  Typing it reads it like any other id: under the fixture source it opens Cy,
  the default fixture; live, it spends one read and ends in "not found".
- Copy lives in `src/content/`, the band's messages included.

## Acceptance

1. At 390 px each state matches its frame: layout, type, colour, spacing and
   copy.
2. At 360 and 600 nothing overlaps, nothing is cut and the page does not
   scroll sideways; the cards keep 16 px from the column's edges. Wider than
   600 the page stays a centred 600 px column (BR-39).
3. A malformed id shows the `invalid-id` band and makes no request.
4. Each of the seven reasons shows its BR-38 message; the three that share a
   message show it with the retry time when one is known, and "try again in a
   few minutes." when not.
5. A successful read of a player past Venus lands on `/features`; a new
   player's lands on `/goals`.
6. Ordis and Cy land on `/features`, with no request to DE and no lookup
   spent.
7. A failed read on any screen inside the shell lands on `/connect` with that
   reason's band and the remembered id in the field.
8. On the demo, `/connect` shows **Connect — Demo**, no request to DE is ever
   built, and an id that is no demo's reads nothing.
9. `pnpm check` passes, with tests for the reason-to-message mapping and the
   BR-03 routing.
