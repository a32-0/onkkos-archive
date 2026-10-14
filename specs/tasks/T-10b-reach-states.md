# T-10b · The reach states: More line, Beyond reach, Locked

|          |                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                                                                  |
| Serves   | [spec 06](../06-catch-up-summary.md), [spec 07](../07-map.md), [spec 08](../08-goals.md), [spec 10](../10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-60 to BR-63 |
| Waits on | [T-10](T-10-item-parts.md)                                                                                                                                                        |

What progressive disclosure (BR-59 to BR-63) asks of the components. T-09 and T-10 were corrected for it on 2026-10-08, but their work had been merged before the correction, so the pieces it added were never built. Added on 2026-10-13 to build them before the screens use them.

## The owner

- Checks each new story against its Figma state in Storybook.

## What it builds

The states are new here.

| File                                             | Note                                                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `src/ui/MoreLine/`                               | `526:117`: the count of what lies beyond reach and its gap, one line that opens nothing                    |
| `src/ui/PlaceRow/`                               | Beyond reach (`526:112`): `gap` in place of the mastered count                                             |
| `src/ui/SuggestionRow/SuggestionRow.stories.tsx` | Beyond reach (`526:107`): the catalogue followed by the gap, which arrives as part of the catalogue's text |
| `src/ui/StepRow/`                                | Locked (`526:96`, `528:97` with art): `locked`, at half opacity                                            |
| `src/ui/ComponentRow/`                           | Locked (`526:102`): `locked`, at half opacity, still tickable                                              |

## Documents

- `docs/development.md`: The Locked stories turn `color-contrast` off, since BR-63 draws them at half opacity

## Acceptance

- [ ] Each state has its story, and the owner has checked each against its Figma state.
- [ ] No component holds a user-facing string: the gaps and counts arrive as props.
- [ ] The half opacity is a component token (`--row-locked-opacity`), as the Button's disabled opacity is.
- [ ] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass.
