# T-07 · Fields and chrome: field, search, segmented, tabs, header, sheet, menus

|          |                                                                                                                                                                                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                                                                                                    |
| Serves   | [spec 02](../../specs/02-connect.md), [spec 04](../../specs/04-shell.md), [spec 05](../../specs/05-resume.md), [spec 07](../../specs/07-map.md), [spec 08](../../specs/08-goals.md), [spec 09](../../specs/09-item-summary.md); [plan 3](../plan/03-design-system.md); BR-39, BR-41 |
| Waits on | [T-06](T-06-atoms.md)                                                                                                                                                                                                                                                               |

What the player types into and what frames every screen: the header with the player chip and its menu, the tab bar, the sheet and its header, and the date menu of Resume.

## What it builds

| File                                                                                                       | Note                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/ui/{Field,SearchField,Segmented,Tab,TabBar,Header,PlayerChip,PlayerMenu,Sheet,SheetHeader,DateMenu}/` |                                                                                                      |
| `src/ui/link.ts`                                                                                           | The link type a navigating component takes, so a screen passes `next/link` and `ui/` imports no Next |
| `src/ui/Icon/glyphs.ts`                                                                                    | Adds `close`, from the sheet header                                                                  |
| `src/ui/Button/Button.tsx`                                                                                 | Carries `data-variant`, so a story can leave the danger label out of the contrast check alone        |
| `tests/tokens.test.ts`                                                                                     | The tokens these components apply leave the allowance list                                           |

## Corrections

- `src/ui/link.ts` arrived so a navigating component takes its link as a prop and `ui/` imports no Next; `Button` carries `data-variant`, so a story can leave the danger label out of the contrast check alone.
- The owner redesigned Resume's date menu on 2026-10-08, with the exact day as a field under the months, and the Design System page was brought level with the code of T-06 and T-07 the same day. Plan part 3 records what changed.
- The owner kept the wiki link as drawn, set apart from the prose by its colour and its arrow with no underline (2026-10-08); `docs/development.md` says so.

## Acceptance

- [x] Each of the eleven components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [x] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [x] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [x] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [x] `Sheet` is full screen below 840 and an anchored panel from 840 (BR-39), shown at both widths in its stories.
- [x] `check.yml` passes on `dev`.
