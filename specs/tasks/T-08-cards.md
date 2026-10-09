# T-08 · Cards: choice, search, update, featured, error band, loading, empty state

|          |                                                                                                                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                                                               |
| Serves   | [spec 02](../02-connect.md), [spec 03](../03-two-ways-in.md), [spec 05](../05-resume.md), [spec 06](../06-catch-up-summary.md), [spec 07](../07-map.md), [spec 08](../08-goals.md); [plan 3](../plan/03-design-system.md); BR-11, BR-13, BR-38 |
| Waits on | [T-07](T-07-fields-and-chrome.md)                                                                                                                                                                                                              |

The cards the screens stack: the two ways in and the goal cards (`ChoiceCard`), the search card on Goal, the update cards of Resume, the last-played card and its list, the five error bands, the loading card and the empty state.

## What crosses

| File                                                                                                           | Origin   | Note                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `src/ui/{ChoiceCard,SearchCard,UpdateCard,FeaturedCard,UpdateList,ShowMore,ErrorBand,LoadingCard,EmptyState}/` | New      |                                                                                                |
| `src/ui/Icon/`                                                                                                 | Reworked | Size 40, the cards' icons                                                                      |
| `src/ui/stories/art.ts`                                                                                        | New      | Sample art for stories: gradients, so no game art is rehosted and no story reaches the network |
| `src/ui/DateMenu/DateMenu.tsx`                                                                                 | Reworked | `aria-controls` only while open, as `FeaturedCard`                                             |
| `tests/tokens.test.ts`                                                                                         | Reworked | The tokens these components apply leave the allowance list                                     |

## Acceptance

- [ ] Each of the nine components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] `ErrorBand` has a story for each of the five BR-38 messages; `EmptyState` one for each of the four frames that use it.
- [ ] `check.yml` passes on `dev`.
