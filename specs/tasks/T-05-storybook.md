# T-05 · Storybook and the Foundations page

|          |                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase    | 2. Design system                                                                                                   |
| Serves   | [spec 00](../00-constitution.md); [plan 3](../plan/03-design-system.md), [plan 4](../plan/04-deployment.md); BR-39 |
| Waits on | [T-04](T-04-tokens.md), [T-02](T-02-ci.md)                                                                         |

The catalogue the constitution asks for, its tests in CI, and a Foundations page that shows every token so a value can be read against Figma at a glance.

## The owner

- Creates the `onkkos-archive-storybook` Vercel project: build `pnpm storybook:build`, output `storybook-static/`.

## What crosses

| File                          | Origin   | Note                                                                                                                                 |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `.storybook/`                 | New      | `@storybook/nextjs-vite`, the accessibility addon, viewports at 360, 390, 600, 840, 1280 and 1440, the fonts and `tokens.css` loaded |
| `src/ui/Foundations.mdx`      | New      | Swatches with their role, the type ramp, radii and spaces                                                                            |
| `package.json`                | Reworked | `storybook`, `storybook:build` and `test:stories`                                                                                    |
| `.github/workflows/check.yml` | Reworked | Adds the Stories and Storybook steps; installs Chromium                                                                              |

## Documents that cross

- `docs/development.md`: How to run Storybook and the story tests

## Acceptance

- [ ] `pnpm storybook` serves the Foundations page; every token in `tokens.css` appears on it.
- [ ] `pnpm test:stories` runs in CI with the accessibility checks on.
- [ ] The Storybook project deploys from the repository.
- [ ] `check.yml` passes on `dev`.
