# T-10 · The item's parts: hero, crumb, Summary rows, sections, the timeline

|          |                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                      |
| Serves   | [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-48, BR-55, BR-56, BR-63 |
| Waits on | [T-09](T-09-lists-and-map-parts.md)                                                                                                   |

The last components: the item page's hero, crumb and Summary rows, and Step by step's sections, timeline, rows, prose and component rows. With them every token a component applies is applied; what is left on the allowance list is what only screens apply, and the list goes with the last of them (plan part 3, Checks).

Corrected on 2026-10-08, before the work: the divider between groups of steps is the `Divider` component itself (Ash and Bhaira Hound use it with its own padding), so `GroupDivider` is not built; and the allowance list cannot be deleted here, since `.numeral`, `.mono-label`, `.heading` and `--scrim` are applied only by screens.

Corrected again on 2026-10-08: `StepRow` and `ComponentRow` gain the Locked state of BR-63 (`526:96` and `528:97` with art, `526:102`), half opacity, a locked component still tickable.

## What crosses

| File                                                                                                                   | Origin   | Note                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `src/ui/{PlaceCrumb,ItemHero,BlueprintArt,SummaryRow,SectionHeader,Timeline,StepRow,RowDetail,RowProse,ComponentRow}/` | New      |                                                                                               |
| `src/ui/stories/art.ts`                                                                                                | Reworked | A sample blueprint and part, drawn, for BlueprintArt                                          |
| `tests/tokens.test.ts`                                                                                                 | Reworked | The allowance list keeps only what screens apply                                              |
| `docs/development.md`                                                                                                  | Reworked | The wiki link closing a row's passage joins the `link-in-text-block` exception the owner kept |

## Acceptance

- [ ] Each of the ten components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`, which then holds only the tokens plan part 3 assigns to screen tasks.
- [ ] Every row of plan part 3's component table has its folder in `src/ui/`.
- [ ] `check.yml` passes on `dev`.
