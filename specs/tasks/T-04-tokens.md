# T-04 · Tokens and type

|          |                                                                                       |
| -------- | ------------------------------------------------------------------------------------- |
| Phase    | 2. Design system                                                                      |
| Serves   | [spec 00](../00-constitution.md); [plan 3](../plan/03-design-system.md); BR-33, BR-39 |
| Waits on | [T-01](T-01-scaffold.md)                                                              |

The token layer of plan part 3: primitives, semantic roles, type, shape, space and effect, and the three fonts. Every later component reads from it, and two tests keep it honest.

## What it builds

| File                     | Note                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/ui/tokens.css`      | Every token in plan part 3, primitives then roles                                                                                     |
| `src/ui/type.module.css` | One class per type token, taken with `composes:`                                                                                      |
| `src/app/layout.tsx`     | Loads Cinzel, Inter and JetBrains Mono through `next/font/google`                                                                     |
| `scripts/palette.mjs`    | The method and the matrices; it reads `tokens.css`, follows each role to its primitive and measures the frames' pairs; `pnpm palette` |
| `eslint.config.mjs`      | `app/` may import `ui/tokens.css`, the one file of `ui/` the root layout loads                                                        |
| `tests/tokens.test.ts`   | No raw colour, radius, duration or easing outside `tokens.css` and `type.module.css`; no token that no `.module.css` applies          |
| `tests/language.test.ts` | Names in the display serif, readings in mono, against the new type classes; its other two checks arrive with T-06 and T-20            |
| `vitest.config.ts`       | `passWithNoTests` removed: the first tests are here                                                                                   |

## Documents

- `docs/cetus.md`: as plan part 5 sets: the reasoning, with the tokens pointing to plan part 3
- `docs/development.md`: Vitest without `passWithNoTests`, `pnpm palette`, and the layer exception for `tokens.css`
- `docs/README.md`: lists `cetus.md`

## Corrections

- Plan part 3 named five colour roles and seven text styles without all their values, so the variables of `421:590` were read once and its tables carry what they gave, `--night-card` among them (2026-10-08). Plan part 3 records it.
- `tests/language.test.ts` keeps only its type check here. The state vocabulary arrives with T-06, against `Badge`, and Onkko's line on every screen with T-20, each with what it checks.
- `eslint.config.mjs` lets `app/` import `ui/tokens.css`, the one file of `ui/` the root layout loads.
- `cetus.md` leaves out the view frame, the background art registry, Onkko's dialogue tree and the goal solver, which no spec or plan part keeps (owner, 2026-10-08).

## Acceptance

- [x] Every token in plan part 3 exists with the value its table gives, and nothing else does.
- [x] The dead-token half of `tests/tokens.test.ts` reads an allowance list of tokens not yet applied. It starts as every token; each component task removes the ones it applies; T-10 leaves it empty and deletes it.
- [x] `pnpm palette` runs and its findings are listed for the owner when the task is handed over.
- [x] `check.yml` passes on `dev`.
