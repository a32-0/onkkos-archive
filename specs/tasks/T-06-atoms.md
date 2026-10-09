# T-06 · Atoms: icon, badge, button, checkbox, wordmark, Onkko's line, wiki link

|          |                                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                                                                              |
| Serves   | [spec 01](../01-onboarding.md), [spec 02](../02-connect.md), [spec 04](../04-shell.md), [spec 05](../05-resume.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-42 |
| Waits on | [T-05](T-05-storybook.md)                                                                                                                                                                                                                                     |

The smallest parts every screen uses. `GameIcon` renders the game's own art from a URL it is given, and the name alone when there is none (BR-42).

## What crosses

| File                                                                        | Origin   | Note                                                                                                                                                    |
| --------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/{Icon,GameIcon,Badge,Button,Checkbox,Wordmark,OnkkoLine,WikiLink}/` | New      | From the Design System page; the old `src/components/` read for behaviour and accessibility only                                                        |
| `src/ui/Wordmark/Quill.tsx`                                                 | Moves    | From `src/components/brand/Quill.tsx`: the app's own quill (BR-58), never the game's emblem                                                             |
| `tests/language.test.ts`                                                    | Reworked | The four states keep their vocabulary: `Badge` draws Mastered and Rank, and nothing for not obtained or unknown, against `Badge` instead of `StateChip` |

## Acceptance

- [ ] Each of the eight components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] `check.yml` passes on `dev`.
