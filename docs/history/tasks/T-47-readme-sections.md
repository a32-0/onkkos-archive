# T-47 · The README in six sections

|          |                                                                                          |
| -------- | ---------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                               |
| Serves   | [plan 5](../plan/05-docs-and-readme.md#the-readme), [spec 13](../../specs/13-desktop.md) |
| Waits on | [T-41](T-41-documents.md)                                                                |

Asked by the owner on 2026-10-24: the README was too long, unclear, and
showed screenshots the demo already shows. It becomes six sections, each
opened by its title drawn in Cetus, and plan part 5 says so first. The
research it rests on is recorded there.

## What it builds

| File                               | Note                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `README.md`                        | The banner, What it does, Why Onkko, Your ID, How it was built, Credits                |
| `docs/readme/*.png`                | Five section titles at 2x, from the README section in Figma (`856:5693` to `856:5785`) |
| `docs/readme/`                     | The three screenshots and the design-system sheet removed                              |
| `specs/plan/05-docs-and-readme.md` | The README's sections and the research behind them                                     |

## Acceptance

- [x] The README holds the six sections of plan part 5, in its order, and nothing of what plan part 5 leaves out.
- [x] Your ID's table matches spec 13's "What it keeps, and where" row for row.
- [x] No em or en dash in its prose, and none of the humanizer's patterns.
- [x] Every image the README names is in `docs/readme/`, and nothing else is.
- [ ] `pnpm check` passes; `check.yml` passes on `dev`.
