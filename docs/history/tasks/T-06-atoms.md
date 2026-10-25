# T-06 · Atoms: icon, badge, button, checkbox, wordmark, Onkko's line, wiki link

|          |                                                                                                                                                                                                                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                                                                                                                                             |
| Serves   | [spec 01](../../specs/01-onboarding.md), [spec 02](../../specs/02-connect.md), [spec 04](../../specs/04-shell.md), [spec 05](../../specs/05-resume.md), [spec 07](../../specs/07-map.md), [spec 09](../../specs/09-item-summary.md), [spec 10](../../specs/10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-42 |
| Waits on | [T-05](T-05-storybook.md)                                                                                                                                                                                                                                                                                                    |

The smallest parts every screen uses. `GameIcon` renders the game's own art from a URL it is given, and the name alone when there is none (BR-42).

## What it builds

| File                                                                        | Note                                                                                                                                                      |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/{Icon,GameIcon,Badge,Button,Checkbox,Wordmark,OnkkoLine,WikiLink}/` | From the Design System page                                                                                                                               |
| `src/ui/Wordmark/Quill.tsx`                                                 | The app's own quill (BR-58), never the game's emblem. The path is unchanged; its box is drawn to the path's bounds, as the frame stretches it to 96 × 144 |
| `tests/language.test.ts`                                                    | The four states keep their vocabulary: `Badge` draws Mastered and Rank, and nothing for not obtained or unknown, against `Badge` instead of `StateChip`   |
| `src/ui/Icon/glyphs.ts`                                                     | The Material Symbols Rounded paths the Design System page draws, one per icon name                                                                        |
| `src/ui/Wordmark/letters.ts`                                                | The outlined letters of "Onkko's Archive" from the `Wordmark` component, filled with `--ink`                                                              |
| `tests/tokens.test.ts`                                                      | Spaces, radii and borders are not primitives; `linear-gradient` is not an easing; the tokens these atoms apply leave the allowance list                   |
| `package.json`, `.storybook/main.ts`                                        | `storybook-addon-pseudo-states`, so the hover and focus stories show those states                                                                         |

## Corrections

- BR-58 (2026-10-07): the quill is the app's own mark, never the game's emblem. Its path is unchanged and its box is drawn to the path's bounds, as the frame stretches it.
- Added to what it builds: the glyphs and the outlined letters, the state vocabulary of `tests/language.test.ts` (from T-04), `storybook-addon-pseudo-states` for the hover and focus stories, and two rules in `tests/tokens.test.ts` (spaces, radii and borders are not primitives; `linear-gradient` is not an easing).
- `docs/development.md` records the two accessibility rules a story turns off, where the frame itself falls below them: the red label of Disconnect (`color-contrast`) and the wiki link (`link-in-text-block`).

## Acceptance

- [x] Each of the eight components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [x] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [x] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [x] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [x] `--passWithNoTests` is removed from `test:stories`: from here a run with no story fails.
- [x] `check.yml` passes on `dev`.
