# T-07 · Fields and chrome: field, search, segmented, tabs, header, sheet, menus

|          |                                                                                                                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                                              |
| Serves   | [spec 02](../02-connect.md), [spec 04](../04-shell.md), [spec 05](../05-resume.md), [spec 07](../07-map.md), [spec 08](../08-goals.md), [spec 09](../09-item-summary.md); [plan 3](../plan/03-design-system.md); BR-39, BR-41 |
| Waits on | [T-06](T-06-atoms.md)                                                                                                                                                                                                         |

What the player types into and what frames every screen: the header with the player chip and its menu, the tab bar, the sheet and its header, and the date menu of Resume.

## What crosses

| File                                                                                                       | Origin | Note |
| ---------------------------------------------------------------------------------------------------------- | ------ | ---- |
| `src/ui/{Field,SearchField,Segmented,Tab,TabBar,Header,PlayerChip,PlayerMenu,Sheet,SheetHeader,DateMenu}/` | New    |      |

## Acceptance

- [ ] Each of the eleven components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] `Sheet` is full screen below 840 and an anchored panel from 840 (BR-39), shown at both widths in its stories.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-07 · Fields and chrome: field, search, segmented, tabs, header, sheet, menus` · Milestone: `2. Design system`

```markdown
What the player types into and what frames every screen: the header with the player chip and its menu, the tab bar, the sheet and its header, and the date menu of Resume.

- **Serves:** `specs/02-connect.md`, `specs/04-shell.md`, `specs/05-resume.md`, `specs/07-map.md`, `specs/08-goals.md`, `specs/09-item-summary.md`, `specs/plan/03-design-system.md`; BR-39, BR-41
- **Waits on:** T-06
- **Task:** `specs/tasks/T-07-fields-and-chrome.md`

### Acceptance

- [ ] Each of the eleven components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] `Sheet` is full screen below 840 and an anchored panel from 840 (BR-39), shown at both widths in its stories.
- [ ] `check.yml` passes on the pull request.
```
