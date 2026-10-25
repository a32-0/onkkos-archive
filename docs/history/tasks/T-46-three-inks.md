# T-46 · Three inks, and Figma bound to its variables

|          |                                                      |
| -------- | ---------------------------------------------------- |
| Phase    | 6. Desktop                                           |
| Serves   | [plan 3](../plan/03-design-system.md#the-three-inks) |
| Waits on | [T-43](T-43-first-fixes.md)                          |

Asked by the owner on 2026-10-24, after the Disconnect dialog drew its body in
`--ink-muted`: a rule for which text takes which ink, applied to every screen
in Figma and in the code, and every colour in the frames and the components
bound to its variable.

Figma, on 2026-10-24:

- The Mobile section and the Design System page: 87 free texts that explain
  moved to `--ink-muted`, and the matching texts of Choice card, Update card,
  Featured card, Empty state and Summary row; the counts of Place row and
  System row bound to `--ink-dim`.
- Every loose colour left there bound to the variable it already showed: `#eae1d9`
  and `#ebe0d9` to `--ink`, `#9f9486` and `#9b8f80` to `--ink-dim`, `#fbbc36`
  and `#d4b038` to `--accent`, the timeline's lines to `--line`, the wordmark's
  white letters to `--ink`, as the site draws them.
- Moodboard, Reference, Palette, the first README banner and the early loose
  frames are explorations, not the design: they moved, unbound, to a new
  **Archive** page (`850:5800`; owner, 2026-10-24). The Wireframes page keeps
  "App flows" (`661:4302`), "Lo-fi Wireframes" (`421:614`), which the
  constitution names for the flow, and a "README" section around the banner.

## What it builds

| File                                                                                        | Note                                      |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `src/ui/ChoiceCard`, `UpdateCard`, `FeaturedCard`, `EmptyState`, `SummaryRow`, `SearchCard` | Their explaining text in `--ink-muted`    |
| The `.lead` of Connect, Two ways in, Resume, Summary, Goal and the map's lists              | `--ink-muted`                             |
| `specs/plan/03-design-system.md`                                                            | The three inks, their roles and contrasts |

## Acceptance

- [x] Every text in the Mobile section and the components takes its ink by role; no loose colour is left there.
- [x] Every pair of ink and ground in the code passes AA, or lifts as the rule says.
- [x] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass; `check.yml` passes on `dev`.
