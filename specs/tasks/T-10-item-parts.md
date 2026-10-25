# T-10 · The item's parts: hero, crumb, Summary rows, sections, the timeline

|          |                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                                                                      |
| Serves   | [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 3](../plan/03-design-system.md); BR-48, BR-55, BR-56, BR-63 |
| Waits on | [T-09](T-09-lists-and-map-parts.md)                                                                                                   |

The last components: the item page's hero, crumb and Summary rows, and Step by step's sections, timeline, rows, prose and component rows. With them every token a component applies is applied; what is left on the allowance list is what only screens apply, and the list goes with the last of them (plan part 3, Checks).

Corrected on 2026-10-08, before the work: the divider between groups of steps is the `Divider` component itself (Ash and Bhaira Hound use it with its own padding), so `GroupDivider` is not built; and the allowance list cannot be deleted here, since `.numeral`, `.mono-label`, `.heading` and `--scrim` are applied only by screens.

Corrected again on 2026-10-08: `StepRow` and `ComponentRow` gain the Locked state of BR-63 (`526:96` and `528:97` with art, `526:102`), half opacity, a locked component still tickable.

## What it builds

| File                                                                                                                   | Note                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/ui/{PlaceCrumb,ItemHero,BlueprintArt,SummaryRow,SectionHeader,Timeline,StepRow,RowDetail,RowProse,ComponentRow}/` |                                                                                               |
| `src/ui/stories/art.ts`                                                                                                | A sample blueprint and part, drawn, for BlueprintArt                                          |
| `tests/tokens.test.ts`                                                                                                 | The allowance list keeps only what screens apply                                              |
| `docs/development.md`                                                                                                  | The wiki link closing a row's passage joins the `link-in-text-block` exception the owner kept |

## Corrections

- `--space-3` (6) was applied nowhere, in the code or in Figma, and the owner removed it on 2026-10-08; the other spaces keep their names.
- The type table was corrected against the frames: `.numeral` sets screen titles, `.title` the hero's name, `.heading` the place list's system card.
- Step by step was bound in Figma as its frames drew it, the hero's Not obtained Prime border moved to `--state-prime`, "(Highest chance)" turned gold as BR-26 asks, Step row gained Best, and Component row's Collapsed state was rebuilt (2026-10-08). Plan part 3 records each.
- What only screens apply left the allowance list for the tasks that apply it, each noted there: `.numeral` and `.mono-label` (T-22), `--scrim` (T-25), `.heading` (T-26).

## Acceptance

- [x] Each of the ten components lives in `src/ui/<Name>/` with its `.tsx`, `.module.css` and `.stories.tsx`.
- [x] Each has one story per variant and state in plan part 3's table, and the owner has checked each against its Figma component in Storybook.
- [x] No component imports `domain/`, fetches, or holds a user-facing string: text arrives as props.
- [x] The tokens these components apply are removed from the allowance list of `tests/tokens.test.ts`, which then holds only the tokens plan part 3 assigns to screen tasks.
- [x] Every row of plan part 3's component table has its folder in `src/ui/`.
- [x] `check.yml` passes on `dev`.
