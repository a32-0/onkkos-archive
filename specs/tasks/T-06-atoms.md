# T-06 · Atoms: icon, badge, button, checkbox, wordmark, Onkko's line, wiki link

|          |                                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                                                                              |
| Serves   | [spec 01](../01-onboarding.md), [spec 02](../02-connect.md), [spec 04](../04-shell.md), [spec 05](../05-resume.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-42 |
| Waits on | [T-05](T-05-storybook.md)                                                                                                                                                                                                                                     |

The smallest parts every screen uses. `GameIcon` renders the game's own art from a URL it is given, and the name alone when there is none (BR-42).

## What crosses

| File                                                                        | Origin   | Note                                                                                                                                                                                             |
| --------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/ui/{Icon,GameIcon,Badge,Button,Checkbox,Wordmark,OnkkoLine,WikiLink}/` | New      | From the Design System page; the old `src/components/` read for behaviour and accessibility only                                                                                                 |
| `src/ui/Wordmark/Quill.tsx`                                                 | Moves    | From `src/components/brand/Quill.tsx`: the app's own quill (BR-58), never the game's emblem. The path is unchanged; its box is drawn to the path's bounds, as the frame stretches it to 96 × 144 |
| `tests/language.test.ts`                                                    | Reworked | The four states keep their vocabulary: `Badge` draws Mastered and Rank, and nothing for not obtained or unknown, against `Badge` instead of `StateChip`                                          |
| `src/ui/Icon/glyphs.ts`                                                     | New      | The Material Symbols Rounded paths the Design System page draws, one per icon name                                                                                                               |
| `src/ui/Wordmark/letters.ts`                                                | New      | The outlined letters of "Onkko's Archive" from the `Wordmark` component, filled with `--ink`                                                                                                     |
| `tests/tokens.test.ts`                                                      | Reworked | Spaces, radii and borders are not primitives; `linear-gradient` is not an easing; the tokens these atoms apply leave the allowance list                                                          |
| `package.json`, `.storybook/main.ts`                                        | Reworked | `storybook-addon-pseudo-states`, so the hover and focus stories show those states                                                                                                                |

## Acceptance

- [ ] Each of the eight components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] `--passWithNoTests` is removed from `test:stories`: from here a run with no story fails.
- [ ] `check.yml` passes on `dev`.
