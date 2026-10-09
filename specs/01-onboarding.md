# 01 · Onboarding

The first screen anyone sees: the app's name, one line from Onkko, the
character the app is named after, and a Begin button. Begin leads to the account form, which already holds the
player's id when this device remembers them.

## Frames

- [`206:903` Onboarding](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-903),
  in the pinned section `421:590`. It is the only frame for this screen.

The frame is the design (BR-33). This spec says what the frame cannot:
behaviour, where things come from, and what in the code has to change.

## Rules

- [BR-01](../docs/business-rules.md#br-01--remember-the-player-on-this-device):
  a returning player never types the account id again.
- [BR-34](../docs/business-rules.md#br-34--figma-is-the-only-source-of-truth-for-the-screens-and-the-flow):
  the flow goes from here to the account id form.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  how the screen lands wider than the frame.

## What the screen does

- Route `/`, outside the shell: no header, no tab bar, no player chip.
- It holds what the frame draws, and nothing else: the background art, the
  thin frame line, the wordmark (quill and "Onkko's Archive"), a **Begin**
  button, and Onkko's line under it, "You were anticipated. Our interaction
  begins."
- **Begin** opens `/connect`. When the device remembers an account id
  (`wf_account`), the form opens with it already in the field, so the player
  only presses Connect (BR-01). The splash itself never reads the profile and
  never redirects.

## States

One. The screen has no data, so it has no loading, empty or error state.

## Data and sources

- None from the player or the catalog.
- The background art is the frame's image, exported from Figma into the
  repository. The wordmark is the existing `Wordmark` component.
- Copy lives in `src/content/` (`VOICE.onboarding`, `VOICE.onboardingEnter`).

## Acceptance

1. At 390 px the screen matches `206:903`: layout, type, colour, spacing and
   copy.
2. At 360, 600, 840, 1280 and 1440 nothing overlaps, nothing is cut and the
   page does not scroll sideways. Wider than the frame (BR-39), the wordmark,
   the button and the line stay one centred column at the frame's width; the
   art covers the whole window and the thin frame line stays inset from the
   window's edges.
3. Begin opens `/connect`; with `wf_account` set, the field holds that id.
4. `/` makes no request to DE's endpoint.
5. `pnpm check` passes.

## Divergences from the code

Each becomes a task.

| Today                                                              | The frame                                     |
| ------------------------------------------------------------------ | --------------------------------------------- |
| An intro paragraph ("We read your public profile…") under the line | No paragraph                                  |
| The tagline "What's left, and in what order" under the button      | No tagline                                    |
| Onkko's line above the button                                      | The line under the button                     |
| Everything aligned left                                            | Everything centred                            |
| The art is `SystemArt system="origin"`                             | The frame's own image, with a thin frame line |

## Does not travel

- The intro paragraph and the tagline leave this screen. `ONBOARDING.intro`
  is also used on `/connect`, where spec 02 decides its words; `APP.tagline`
  travels only if another spec names it.
