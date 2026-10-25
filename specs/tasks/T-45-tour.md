# T-45 · A first tour

|          |                             |
| -------- | --------------------------- |
| Phase    | 6. Desktop                  |
| Serves   | [spec 04](../04-shell.md)   |
| Waits on | [T-43](T-43-first-fixes.md) |

Asked by the owner on 2026-10-23. The first time a player reaches a screen
with the header's chip and the tab bar, four hotspots walk them through the
shell: Navigation, Resume, Goal and Profile. They can skip it, it shows once
per device, and Profile's **Tutorial: Reset** shows it again. Spec 04, "The
first tour", holds its rules; `844:4776`, `844:5065`, `844:5354` and
`844:5643` draw its four steps (drawn on 2026-10-24).

Changed on 2026-10-24 by the owner: the questions a player asks are left out
of the app. They may go to the launch post on Reddit or to the documents
instead.

Changed on 2026-10-24 by the owner, on the first review: each step explains
its section and what can be done there, taken from specs 04 to 08: what the
map counts as mastered, that the app lists what can be mastered or collected
and not every item, how Resume measures, what Goal's steps hold.

The owner then set the coach mark's spacing on `844:5056`: 12 px between its
parts, 16 px between the buttons, and Skip and Next sharing the row; Done,
alone on the last step, keeps 120 px at the right.

## What it builds

| File                                                       | Note                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/screens/shell/Tour.tsx`, `Tour.module.css`            | The hotspot, the scrim and the coach mark, a modal dialog               |
| `src/screens/shell/Shell.tsx`                              | Shows the tour with the chip and the tab bar, until it is seen          |
| `src/screens/shell/voice.ts`, `src/app/chrome.ts`          | The chrome carries whether to show it, and the actions that end it      |
| `src/app/actions.ts`                                       | `endTour` keeps `wf_tour`; `resetTour` forgets it and opens the map     |
| `src/infra/session.ts`                                     | The `wf_tour` cookie, a year                                            |
| `src/screens/shell/Profile.tsx`, `Profile.module.css`      | Tutorial's Reset, enabled                                               |
| `src/content/tour.ts`                                      | The tour's words                                                        |
| `tests/request.test.ts`, `tests/shell.test.ts`             | Shown once, again after Reset, never on Two ways in, kept on Disconnect |
| `specs/04-shell.md`, spec 13, plan 1, `docs/ui.md`, README | The tour and its cookie                                                 |

## Acceptance

- [x] At 390 px each step matches its frame; at 1280 the coach mark sits by the floating bar and the chip.
- [x] The focus starts on Next; Skip, Done and Escape end the tour, and it does not show again.
- [x] Reset shows it again; Disconnect does not.
- [ ] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass; `check.yml` passes on `dev`.
