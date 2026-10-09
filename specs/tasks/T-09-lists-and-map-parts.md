# T-09 · Lists and the map's parts: groups, tiles, place card, rows, suggestions

|          |                                                                                                                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                                      |
| Serves   | [spec 05](../05-resume.md), [spec 06](../06-catch-up-summary.md), [spec 07](../07-map.md), [spec 08](../08-goals.md); [plan 3](../plan/03-design-system.md); BR-14, BR-15, BR-44, BR-45, BR-53, BR-57 |
| Waits on | [T-08](T-08-cards.md)                                                                                                                                                                                 |

What the Summary and the map list: dividers, group rows and their rails of tiles, the place card with its bar, the place and system rows, and the search's suggestion list.

## What crosses

| File                                                                                                             | Origin   | Note                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `src/ui/{Divider,GroupRow,ItemTile,Rail,PlaceCard,ProgressBar,PlaceRow,SystemRow,SuggestionList,SuggestionRow}/` | New      |                                                                                                         |
| `src/ui/stories/art.ts`                                                                                          | Reworked | Round sample art for places and systems, gradients like the rest                                        |
| `src/ui/SearchField/SearchField.stories.tsx`                                                                     | Reworked | `WithSuggestions` shows `SuggestionList` instead of a list built in the story (owner, 2026-10-08)       |
| `tests/tokens.test.ts`                                                                                           | Reworked | The tokens these components apply leave the allowance list                                              |
| `scripts/palette.mjs`                                                                                            | Reworked | Measures the system name on the place card's band, `--ink-muted` since the owner chose it on 2026-10-08 |

## Acceptance

- [ ] Each of the ten components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] `Rail` is a sideways rail below 840 and a grid from 840 (BR-39).
- [ ] `SuggestionList` is a list box, navigable by keyboard, in its stories: the Keyboard story's play function moves with the arrows, chooses with Enter and closes with Escape.
- [ ] `check.yml` passes on `dev`.
