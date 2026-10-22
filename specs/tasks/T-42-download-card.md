# T-42 · The way from the demo to the app

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                           |
| Serves   | [spec 02](../02-connect.md#on-the-demo), [spec 13](../13-desktop.md) |
| Waits on | [T-38](T-38-releases.md), [T-39](T-39-demo-edition.md)               |

The card T-39 left out of **Connect — Demo**: one line that says a player's own
account is read by the app on their computer, and **Download the app**, which
opens the repository's latest release. It waits on the first published
release, so the button never opens an empty page.

## What it builds

| File                        | Note                                                      |
| --------------------------- | --------------------------------------------------------- |
| `src/screens/connect/`      | The card under the demos, as the frame draws it           |
| `src/routes.ts`             | The latest release's address                              |
| `src/content/onboarding.ts` | The card's words                                          |
| `tests/request.test.ts`     | The card on the demo, and never in the app or development |

## Acceptance

- [ ] At 390 px **Connect — Demo** matches its frame, the card included; at 360, 600, 840, 1280 and 1440 it holds BR-39.
- [ ] The button opens the latest release in a new tab.
- [ ] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass; `check.yml` passes on `dev`.
