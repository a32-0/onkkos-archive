# 03 · Two ways in

Where a returning player chooses between catching up and chasing a goal. It is
the last screen of onboarding.

## Frames

- [`203:140` Features](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-140).

## Rules

- [BR-03](../docs/business-rules.md#br-03--a-low-level-player-is-not-asked-when-they-last-played):
  only a player past Venus reaches this screen.
- [BR-04](../docs/business-rules.md#br-04--explain-each-choice-so-a-player-can-act-on-it):
  the words on each card.
- [BR-05](../docs/business-rules.md#br-05--set-a-goal-runs-on-frontier-and-focus):
  Set a goal leads to goals ordered by frontier and focus.
- [BR-36](../docs/business-rules.md#br-36--from-the-summary-an-item-or-next-to-a-place):
  the frontier or the focus, which Skip shares with Next.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  wider than the frame.
- [BR-40](../docs/business-rules.md#br-40--two-ways-in-skip-goes-to-the-map-go-back-to-the-id-form):
  Skip and Go back.

## What the screen does

Route `/features`, outside the shell: the header carries the wordmark only, no
tab bar and no player chip. From the top, as `203:140` draws it:

1. Onkko's line, "We have, and shall have a long association, {name}.", with
   the player's display name in the accent colour. A profile with no display
   name ends the line at "association."
2. **Two ways in**, and "Pick one, you can switch at any time."
3. Two cards, each a link, each with its icon, title and one line (BR-04):
   - **Pick up where you left off** opens `/catch-up`, the update picker
     (spec 05).
   - **Set a goal** opens `/goals` (spec 08).
4. **Skip** opens the map on the frontier, or on the focus when the player has
   no frontier (BR-40).
5. **Go back** opens `/connect` with the player's id in the field (BR-40).

A new player never sees this screen: `/connect` sends them to `/goals`
(BR-03). A new player who opens `/features` by its address is sent to
`/goals` too, so the screen has a single form.

## States

One. The profile has been read on `/connect`, so the screen has data when it
renders. A read that fails here sends the player to `/connect` (BR-38).

## Data and sources

- The display name: the profile's `DisplayName`, through the screen context.
- Whether the player is past Venus: `asksWhenLastPlayed()` in
  `src/lib/graph/star-chart.ts`.
- The frontier: `findNextPlanet`. The focus does not exist in code yet
  (BR-05); spec 07 defines it, and Skip and Next use the same one.
- Copy lives in `src/content/` (`VOICE.features`, `FEATURES`).

## Acceptance

1. At 390 px the screen matches `203:140`: layout, type, colour, spacing and
   copy, with its Material Symbols icons (hourglass, flag).
2. At 360, 600, 840, 1280 and 1440 nothing overlaps, nothing is cut and the
   page does not scroll sideways. From 840 the heading and the buttons stay one
   centred column, and the two cards sit side by side under it, each at its
   frame width (BR-39).
3. Each card opens its route. Skip opens the map on the frontier, or the focus
   with no frontier. Go back opens `/connect` with the id in the field.
4. A new player opening `/features` lands on `/goals`.
5. `pnpm check` passes.

## Divergences from the code

Each becomes a task.

| Today                                                                    | The frame and rules                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------- |
| Inside the shell, with tabs and the player chip                          | Outside the shell, wordmark only                        |
| The line reads "We have and shall have…", falling back to the account id | "We have, and shall have…", the display name or nothing |
| Card titles "When did you last play?" and "What are you after?"          | "Pick up where you left off" and "Set a goal"           |
| The first card's line promises quests                                    | The BR-04 line, arsenal and collection only             |
| A diamond mark on each card                                              | `hourglass` and `flag`, Material Symbols                |
| "Next, just show me the map" with a note, opening the map with no place  | **Skip**, opening the map on the frontier or the focus  |
| No way back                                                              | **Go back** to `/connect`                               |
| A new player sees a one-card form titled "Start with a goal"             | A new player is sent to `/goals`                        |
| `ProfileFailure` when the read fails                                     | Back to `/connect` with the band (BR-38)                |

## Does not travel

- `FEATURES.soloTitle`, `soloIntro` and `skipNote`, and the one-card form.

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
