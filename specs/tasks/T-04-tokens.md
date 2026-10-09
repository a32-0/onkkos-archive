# T-04 · Tokens and type

|          |                                                                                       |
| -------- | ------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                      |
| Serves   | [spec 00](../00-constitution.md); [plan 3](../plan/03-design-system.md); BR-33, BR-39 |
| Waits on | [T-01](T-01-scaffold.md)                                                              |

The token layer of plan part 3: primitives, semantic roles, type, shape, space and effect, and the three fonts. Every later component reads from it, and two tests keep it honest.

## What crosses

| File                     | Origin   | Note                                                                                                                         |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/tokens.css`      | New      | Every token in plan part 3, primitives then roles                                                                            |
| `src/ui/type.module.css` | New      | One class per type token, taken with `composes:`                                                                             |
| `src/app/layout.tsx`     | Reworked | Loads Cinzel, Inter and JetBrains Mono through `next/font/google`                                                            |
| `scripts/palette.mjs`    | Moves    | Reads `tokens.css`; `pnpm palette`                                                                                           |
| `tests/tokens.test.ts`   | New      | No raw colour, radius, duration or easing outside `tokens.css` and `type.module.css`; no token that no `.module.css` applies |
| `tests/language.test.ts` | Reworked | Names in the display serif, readings in mono, against the new type classes                                                   |
| `vitest.config.ts`       | Reworked | `passWithNoTests` removed: the first tests are here                                                                          |

## Documents that cross

- `docs/cetus.md`: Reworked as plan part 5 sets: the reasoning stays, the tokens point to plan part 3

## Acceptance

- [ ] Every token in plan part 3 exists with the value its table gives, and nothing else does.
- [ ] The dead-token half of `tests/tokens.test.ts` reads an allowance list of tokens not yet applied. It starts as every token; each component task removes the ones it applies; T-10 leaves it empty and deletes it.
- [ ] `pnpm palette` runs and its findings are listed for the owner when the task is handed over.
- [ ] `check.yml` passes on `dev`.
