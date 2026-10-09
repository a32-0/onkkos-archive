# T-10 · The item's parts: hero, crumb, Summary rows, sections, the timeline

|          |                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase    | 2. Design system                                                                                                               |
| Serves   | [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-48, BR-55, BR-56 |
| Waits on | [T-09](T-09-lists-and-map-parts.md)                                                                                            |

The last components: the item page's hero, crumb and Summary rows, and Step by step's sections, timeline, rows, prose and component rows. With them every token is applied, and the allowance list goes.

## What crosses

| File                                                                                                                                | Origin   | Note                          |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------- |
| `src/ui/{PlaceCrumb,ItemHero,BlueprintArt,SummaryRow,SectionHeader,Timeline,StepRow,RowDetail,RowProse,ComponentRow,GroupDivider}/` | New      |                               |
| `tests/tokens.test.ts`                                                                                                              | Reworked | The allowance list is deleted |

## Acceptance

- [ ] Each of the eleven components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [ ] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [ ] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [ ] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`.
- [ ] The allowance list is empty and removed; `tests/tokens.test.ts` passes with no token unapplied.
- [ ] Every row of plan part 3's component table has its folder in `src/ui/`.
- [ ] `check.yml` passes on `dev`.
