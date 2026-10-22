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

To be drawn by the owner and approved before this part of the spec is
pinned (2026-10-22):

- **Connect — Demo**: the screen on the demo website, which reads no account
  (below).

The steps were redrawn in all three on 2026-10-15: `warframe.com/api/user-data`
answers 404, so the id is read from the `gid` cookie instead (owner).

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`480:94` Error band](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=480-94): on the Design System page, one variant per BR-38 message (Invalid ID, Not found, Not answering, Unreadable, Limited). The Error frame shows Invalid ID.

## Rules

- [BR-01](../docs/business-rules.md#br-01--remember-the-player-on-this-device):
  the device remembers the id.
- [BR-02](../docs/business-rules.md#br-02--the-lead-line-is-one-of-onkkos-contextual-phrases):
  the lead line is Onkko's.
- [BR-03](../docs/business-rules.md#br-03--a-low-level-player-is-not-asked-when-they-last-played):
  where a successful read leads.
- [BR-38](../docs/business-rules.md#br-38--loading-and-errors-happen-on-the-id-form):
  loading and errors, and the band's five messages.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
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
3. **Where do I find this?**: three numbered steps. On a computer,
   log in at `https://www.warframe.com`, a link that opens in a new tab; in the
   same browser, open the developer tools and the cookies (**On Firefox:**
   Storage › Cookies, **On Chrome:** Application › Cookies, the browsers'
   names in bold); copy the value of the `gid` cookie. Then an example of that cookie and the
   note "It's safe: it's the same public profile the game shows when you look at
   another player. We only remember your ID on this device, and Disconnect
   forgets it." The cookie is the app's only record of the
   player and is needed to read their profile, so no consent banner is shown
   (owner, 2026-10-21).
4. **Explore with a demo**: **Ordis (Mastery Rank 2)**, then **Cy (Mastery
   Rank 27)**.

### Connect

1. The id is trimmed and checked for shape (24 hexadecimal characters,
   either case) before any call. A bad shape shows the `invalid-id` band
   without reading anything.
2. Otherwise the form enters **Loading** (`675:5392`): Connect is disabled,
   and the quill card reads "Onkko is reading your archive...", centred under
   the quill (owner, 2026-10-16), between the form and the steps, where the
   demos give way to it (T-27b). The card is announced to screen readers.
3. On success the id is saved in `wf_account` for a year, and the player goes
   on by BR-03: a player who has reached Venus to `/features`, a new player to
   `/goals`. A profile whose `Missions[]` cannot be read counts as reached.
4. On failure the form returns to rest with the **Error** band (`662:6943`)
   under the field, holding that reason's message from BR-38. The field keeps
   what was typed, and the form can be sent again at once.

### A demo

Each demo button saves that demo's id in `wf_account` and goes on by BR-03,
exactly as a real read would. Both demos have reached Venus (Ordis stops at
Mercury), so both land on `/features` (owner, 2026-10-15). A demo is
read from its fixture and never calls DE. It spends no lookup from the
visitor's budget.

### On the demo

The website is a demo of the app (constitution; spec 13). It never reads an
account, so its `/connect` asks for none. In place of the Account ID field,
Connect and **Where do I find this?**, **Connect — Demo** shows the two demos
first and, under them, a card that sends the player to the app: one line that
says their own account is read by the app on their computer, and **Download
the app**, which opens the repository's latest release in a new tab. The
release page lists the Windows installer and the Linux AppImage, so the demo
does not guess the player's system.

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

| State   | Frame       | What differs from rest                                     |
| ------- | ----------- | ---------------------------------------------------------- |
| Rest    | `661:4354`  | Empty field, or the remembered id                          |
| Loading | `675:5392`  | Connect disabled, the quill card in place of the demos     |
| Error   | `662:6943`  | The red band under the field with one of the five messages |
| Demo    | To be drawn | The demos and the card to the download, no field           |

## Data and sources

- The read: `fetchProfile()` in `src/infra/profile/read.ts`, with the shared
  locks the constitution names. Its `FailureReason` picks the band's message;
  its `retryAfterSeconds` gives the time in it, shown as `HH:MM UTC`.
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
2. At 360, 600, 840, 1280 and 1440 nothing overlaps, nothing is cut and the
   page does not scroll sideways. Below 600 the cards keep 16 px from the
   window's edges at every width; from 600 the page stays one centred column
   at the frame's width (BR-39).
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
