# T-32 · The README and the last documents

|          |                                                                           |
| -------- | ------------------------------------------------------------------------- |
| Phase    | 5. Launch                                                                 |
| Serves   | [spec 00](../00-constitution.md); [plan 5](../plan/05-docs-and-readme.md) |
| Waits on | [T-29](T-29-step-by-step.md), [T-31](T-31-content-update.md)              |

The public README's seven sections as plan part 5 sets them, `ui.md` checked against specs 01 to 10, and the docs index complete.

## Brought forward (owner, 2026-10-21)

The README was rewritten before the task, at the owner's request: Cetus's branding, credits for every source the data comes from, and two diagrams in place of the arrows of the layers, which did not explain themselves (plan part 5). The owner adds its five images to `docs/readme/`. What the task still does: read each licence from its source and quote it, `docs/ui.md`, the docs index, and the owner's line about Claude.

## The owner

- Writes, in their own words, the line saying the work was done with Claude's help.

## What it builds

| File        | Note                                                   |
| ----------- | ------------------------------------------------------ |
| `README.md` | All seven sections; the licences read from each source |

## Documents

- `docs/ui.md`: the routes, their frames and the link rules, line by line against the specs. Its paragraph on progressive disclosure, which tied it to `since` alone, and its four states, whose Locked is BR-63's, follow BR-59 to BR-63
- `docs/README.md`: Every document of plan part 5, in its order

## Acceptance

- [ ] Every document in plan part 5's table is in `docs/` and in the index.
- [ ] No link to the Figma file, no mention of a real capture, no third demo.
- [ ] Every licence is quoted from its source, with the link.
- [ ] `check.yml` passes on `dev`.
