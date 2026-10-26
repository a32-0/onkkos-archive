# T-34 · Screen: Advanced search

|          |                                                                         |
| -------- | ----------------------------------------------------------------------- |
| Phase    | 5. Launch                                                               |
| Serves   | [spec 12](../../specs/12-search.md), [spec 08](../../specs/08-goals.md) |
| Waits on | [T-27](T-27-goal.md), [T-29](T-29-step-by-step.md)                      |

Asked by the owner on 2026-10-21, once the catalog held every sourced
resource and Goal's eight rows could no longer reach them: a page of its own,
opened from Goal, where a term and filters narrow the whole catalog and the
results stay on the same screen. The owner approved spec 12 and its frames the
same day, with the two open questions settled as recommended: the page opens
from Goal only, and the results keep the search's own order, with no sorting.

## What it builds

| File                                       | Note                                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `src/app/search/page.tsx`                  | `/search`: reads the filters from the address and renders the page                  |
| `src/app/targets.ts`                       | Every search hit as the screen's input, with its gap, its standing and vaulted      |
| `src/app/api/search/route.ts`              | Goal's suggestions, now through `targetInputs()`                                    |
| `src/domain/catalog/search.ts`             | `browseCatalog()`: the whole catalog by name; an arsenal item's vaulted flag        |
| `src/screens/search/`                      | `AdvancedSearch`, `SearchPanel`, the filters' model and the address                 |
| `src/screens/goals/`                       | **Advanced search** under Continue; `orderedInputs()` and `searchRows()` shared     |
| `src/ui/FilterChip/`, `src/ui/ResultList/` | The two new components, with their stories                                          |
| `src/content/search.ts`                    | Every word of the page                                                              |
| `tests/advanced-search.test.ts`            | The address, each filter, the page of twenty, the catalog by name                   |
| `tests/request.test.ts`                    | The page for Ordis: the term carried, a type, no term, In my reach, nothing matches |

## Decided while building

- **Other, not Cosmetics.** The type that holds what no other type does is
  named "Other": it holds Kitgun parts and Misc items as well as Ephemera and
  Honoria, which "Cosmetics" would misname. The frames follow.
- **The filters fold on the chevron**, and open folded when the address
  already carries a filter, so a shared or returned search shows its results
  first. Folding on scroll was left out: it moves the page under the
  player's finger.
- **A choice answers at once.** A chip or a box changes as it is pressed
  while the page reads the new results, and the rows already shown stay
  until they arrive.
- **Show more** keeps the scroll where it is and adds twenty rows.
- Onkko speaks Goal's line at the top, as every screen of the Goal tab does.

## Acceptance

1. At 390 px each state matches its frame in "App flows"; at 360, 600, 840,
   1280 and 1440 nothing overlaps or is cut, and from 840 the filters are a
   column beside the results.
2. **Advanced search** on Goal opens `/search` with the term typed.
3. Each filter narrows as spec 12 says, and lives in the address.
4. A result beyond reach stays, with its gap, until In my reach is chosen
   (BR-68).
5. `pnpm check`, `pnpm knip`, `pnpm build`, `pnpm weight` and
   `pnpm test:stories` pass.
