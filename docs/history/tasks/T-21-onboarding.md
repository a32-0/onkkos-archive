# T-21 · Screen: Onboarding

|          |                                                                             |
| -------- | --------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                  |
| Serves   | [spec 01](../../specs/01-onboarding.md); [plan 1](../plan/01-repository.md) |
| Waits on | [T-20](T-20-shell.md)                                                       |

The first screen a new visitor sees, as spec 01 sets it.

## What it builds

| File                       | Note                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| `src/app/page.tsx`         | Spec 01                                                          |
| `src/screens/onboarding/`  | The screen, and the frame's art exported from Figma as `art.png` |
| `src/ui/Button/`           | With `href`, a link that looks the same                          |
| `src/ui/OnkkoLine/`        | The `art` place: the line in ink, over the art                   |
| `tests/onboarding.test.ts` | The splash's parts, Begin's link, and a page that reads nothing  |
| `tests/tokens.test.ts`     | `--scrim` leaves the allowance list                              |

## From T-20

- The wordmark's label is `APP.name` from `content/app.ts`. The splash has no header (spec 01): the wordmark stands alone, at its splash size.
- `tests/language.test.ts` checks `src/screens/onboarding/` for an `OnkkoLine` fed from `VOICE`, and every line of `content/voice.ts` against the specs. `VOICE.onboarding` and `VOICE.onboardingEnter` exist.

## Corrections

- **No `content/onboarding.ts` yet.** Spec 01's only strings are `VOICE.onboarding` and `VOICE.onboardingEnter`, and the wordmark's label is `APP.name`; an empty module would fail knip. T-22 creates it with the form's strings.
- **Begin is a link (owner, 2026-10-14).** `Button` takes `href` and `link` and then draws an `<a>` with the same classes; the screen passes Next's `Link`. The story `PrimaryLink` shows it. Plan part 3 says so.
- **The line in ink (owner, 2026-10-14).** The frame drew the line in `ink` over an `Onkko line` that is `ink-dim`. The frame wins: `OnkkoLine` has a third place, `art`, with its story, and the component set in Figma has `Place=Art`, which the frame now uses with no override.
- **The veil is `--scrim` (owner, 2026-10-14).** The frame's black at 50% was bound to nothing; it is now the `scrim` variable at 60%, as `tokens.css` has it, and `--scrim` leaves the allowance list. T-25 is told.
- **The art.** The frame's image, 1024 × 683, sits at `src/screens/onboarding/art.png` and is drawn by `next/image`, covering the window, at 30% from the left as the frame crops it.
- **The frame line** is an outline drawn inside the box, as Figma draws a stroke, so the column is 326 px wide at 390, as in the frame.
- **The remembered id in the field** (spec 01, acceptance 3) is Connect's, so T-22 checks it; this task checks that Begin opens `/connect`.
- **`pnpm typecheck` runs `next typegen` first.** The art is the first image a module imports, and the types for it live in `next-env.d.ts`, which git ignores; a working copy that had run `next build` had it, and CI did not, so `check.yml` failed on `./art.png`. `docs/development.md` says so.
- **The wordmark in the middle, Begin at the foot (owner, 2026-10-15, after this task's commit).** The owner redrew `206:903`: the frame line spreads its content with `space-between`, an invisible wordmark at the top keeps the visible one in the middle, and Begin and the line sit at the foot. The screen does the same with an empty spacer of the wordmark's 80 px. At 390 × 844 the wordmark starts at y 372 and Begin at y 712, 2 px above the frame's 374 and 714 because `Button` is 46 px high, not 45; at 360 × 640 and at 844 × 390 nothing overlaps. Spec 01 says so. The change ships with T-22's commit.
- **The local check.** Under `pnpm build` and `pnpm start`, at 390 × 844 the frame line is 358 × 812 at 16, the wordmark starts at y 320, and Begin is 326 wide at x 32, as in the frame; at 360, 600, 840, 1280 and 1440 nothing overflows, the column stays 326 wide and centred, the art covers the window and the line stays 16 px in. Begin landed on `/connect`, and `/` made no request outside the app. This is evidence, not the owner's comparison.

## Acceptance

- [x] Every acceptance item of spec 01 holds.
- [x] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [x] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [x] `check.yml` passes on `dev`.
