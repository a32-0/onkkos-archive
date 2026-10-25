# T-05 · Storybook and the Foundations page

|          |                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase    | 2. Design system                                                                                                   |
| Serves   | [spec 00](../00-constitution.md); [plan 3](../plan/03-design-system.md), [plan 4](../plan/04-deployment.md); BR-39 |
| Waits on | [T-04](T-04-tokens.md), [T-02](T-02-ci.md)                                                                         |

The catalogue the constitution asks for, its tests in CI, and a Foundations page that shows every token so a value can be read against Figma at a glance.

## The owner

- Creates the `onkkos-archive-storybook` Vercel project: build `pnpm storybook:build`, output `storybook-static/`.

## What it builds

| File                                                 | Note                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `.storybook/`                                        | `@storybook/nextjs-vite`, the accessibility addon, viewports at 360, 390, 600, 840, 1280 and 1440, the fonts and `tokens.css` loaded |
| `src/ui/Foundations.mdx`                             | Swatches with their role, the type ramp, radii and spaces                                                                            |
| `package.json`                                       | `storybook`, `storybook:build` and `test:stories`                                                                                    |
| `.github/workflows/check.yml`                        | Adds the Stories and Storybook steps; installs Chromium                                                                              |
| `vitest.config.ts`                                   | Two projects, `unit` in Node and `storybook` in Chromium                                                                             |
| `src/app/fonts.ts`                                   | The three fonts, loaded once and shared by the root layout and Storybook                                                             |
| `src/app/layout.tsx`                                 | Takes its fonts from `fonts.ts`                                                                                                      |
| `eslint.config.mjs`, `.prettierignore`, `.gitignore` | `storybook-static/` is ignored                                                                                                       |

## Documents

- `docs/development.md`: How to run Storybook and the story tests

## Corrections

- The Storybook project is named `onkkos-archive-storybook` (2026-10-08).
- The three fonts moved to `src/app/fonts.ts`, so the root layout and Storybook load the same ones, and Vitest gained its two projects, `unit` and `storybook`.
- `test:stories` passes with no story until T-06, which removes `--passWithNoTests` with its first stories.

## Acceptance

- [x] `pnpm storybook` serves the Foundations page; every token in `tokens.css` appears on it.
- [x] `pnpm test:stories` runs in CI with the accessibility checks on. It passes with no story (`--passWithNoTests`) until T-06 adds the first.
- [x] The Storybook project deploys from the repository.
- [x] `check.yml` passes on `dev`.
