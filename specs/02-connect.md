# 02 · Connect

Where a player types their Warframe account id so the app can read their
public profile, or picks a demo profile to try the app without one. It is the
only screen that reads a profile for the first time, the only one that shows a
read in progress, and the only one that says what went wrong when a read
fails.

## Frames

- [`202:38` Login](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=202-38):
  the form at rest, with the demo profiles.
- [`428:743` Loading](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=428-743):
  the form while the profile is read.
- [`428:616` Error](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=428-616):
  the form after a failed read.

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
tabs or player chip. From the top, as `202:38` draws it:

1. Onkko's line, "It is time. Utter the name.", and the lead, "Onkko will read
   your public profile and tell you what's left. Nothing is written to your
   account."
2. The **Account ID** field and **Connect**. The field's placeholder is the
   frame's `000000000000000000000001`. When the device remembers an id
   (`wf_account`), the field holds it (BR-01).
3. **Where do I find this?**: three numbered steps. Both addresses are links
   and open in a new tab: `https://www.warframe.com` and
   `https://www.warframe.com/api/user-data`. Then the example JSON and the
   note "It's a safe public read endpoint, the same one the game uses to view
   another player."
4. **Explore with a demo**: **Ordis (Mastery Rank 2)**, then **Cy (Mastery
   Rank 27)**.

### Connect

1. The id is trimmed and checked for shape (24 hexadecimal characters,
   either case) before any call. A bad shape shows the `invalid-id` band
   without reading anything.
2. Otherwise the form enters **Loading** (`428:743`): the page dims, Connect
   is disabled, and the quill card reads "Onkko's reading your codex...".
   The card is announced to screen readers.
3. On success the id is saved in `wf_account` for a year, and the player goes
   on by BR-03: a player who has reached Venus to `/features`, a new player to
   `/goals`. A profile whose `Missions[]` cannot be read counts as reached.
4. On failure the form returns to rest with the **Error** band (`428:616`)
   under the field, holding that reason's message from BR-38. The field keeps
   what was typed, and the form can be sent again at once.

### A demo

Each demo button saves that demo's id in `wf_account` and goes on by BR-03,
exactly as a real read would: Ordis to `/goals`, Cy to `/features`. A demo is
read from its fixture and never calls DE. It spends no lookup from the
visitor's budget.

### A failure on another screen

Every later read happens on a screen inside the shell, once the twelve hours
have passed. When it fails, that screen sends the player to `/connect` with
the reason and, where one is known, the retry time. The form shows the band
for that reason with the remembered id in the field (BR-38). No other screen
draws a failure.

## States

| State   | Frame     | What differs from rest                                     |
| ------- | --------- | ---------------------------------------------------------- |
| Rest    | `202:38`  | Empty field, or the remembered id                          |
| Loading | `428:743` | The page dimmed, Connect disabled, the quill card          |
| Error   | `428:616` | The red band under the field with one of the five messages |

## Data and sources

- The read: `fetchProfile()` in `src/lib/warframe/client.ts`, with the shared
  locks the constitution names. Its `FailureReason` picks the band's message;
  its `retryAfterSeconds` gives the time in it, shown as `HH:MM UTC`.
- The demos: `fixtures/profile-ordis.json` and `fixtures/profile-cy.json`,
  both output of `pnpm fixture`, matched by the ids `…0002` and `…0001` in
  `src/lib/warframe/fixture-source.ts`. The Mastery Rank on each button is
  read from its fixture's `PlayerLevel`, so the label cannot drift from the
  data.
- The frame's example id is Cy's demo id. Typing it opens Cy, which is
  harmless and needs nothing more.
- Copy lives in `src/content/`, the band's messages included.

## Acceptance

1. At 390 px each state matches its frame: layout, type, colour, spacing and
   copy.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps, nothing is cut and the
   page does not scroll sideways. Wider than the frame the page stays one
   centred column at the frame's width (BR-39).
3. A malformed id shows the `invalid-id` band and makes no request.
4. Each of the seven reasons shows its BR-38 message; the three that share a
   message show it with the retry time when one is known, and "try again in a
   few minutes." when not.
5. A successful read of a player past Venus lands on `/features`; a new
   player's lands on `/goals`.
6. Ordis lands on `/goals` and Cy on `/features`, with no request to DE and no
   lookup spent.
7. A failed read on any screen inside the shell lands on `/connect` with that
   reason's band and the remembered id in the field.
8. `pnpm check` passes, with tests for the reason-to-message mapping and the
   BR-03 routing.

## Divergences from the code

Each becomes a task.

| Today                                                                                         | The frames and rules                                     |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| The placeholder is the real captured account id                                               | `000000000000000000000001`                               |
| A hint "24 hexadecimal characters" under the field                                            | No hint                                                  |
| Errors in muted red text under the field                                                      | The red band of `428:616`                                |
| Four error messages in `connectError()`; the other reasons share "aren't answering"           | The five messages of BR-38                               |
| Loading is Connect's label changing to "Reading your profile…"                                | The dimmed page and the quill card of `428:743`          |
| Success goes through `/connect?step=start`, which sends a new player to the map               | Straight to `/features` or `/goals` (BR-03)              |
| The lead "We read your public profile…" plus a separate public-endpoint note under the header | The frame's lead, and the note at the end of the steps   |
| Steps in plain text with one link; a note about usernames and the `gid` cookie                | Three numbered steps with two links and the example JSON |
| Demo buttons "Cy · Veteran" then "Ordis · New player", secondary style                        | "Ordis (Mastery Rank 2)" then "Cy (Mastery Rank 27)"     |
| Any other screen renders `ProfileFailure` when a read fails                                   | The player is sent to `/connect` with the band           |
| The field falls back to `NEXT_PUBLIC_DEFAULT_ACCOUNT_ID`                                      | The remembered id or nothing                             |

## Does not travel

- `ProfileFailure`, `FAILURES` and `FAILURE_SCREEN`: the band replaces them.
- The `?step=start` redirect and `startHref()`.
- `NEXT_PUBLIC_DEFAULT_ACCOUNT_ID`: local configuration.
- The `full` demo id (`…0003`) and `fixtures/profile-full.json`: the real
  capture.
- `ONBOARDING.fieldHint`, `whereNote` and `publicNote` as they read today.
