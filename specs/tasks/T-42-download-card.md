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

| File                              | Note                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `src/screens/connect/Connect.tsx` | The card under the demos, on the demo alone               |
| `src/ui/Button/Button.tsx`        | A link button may open its address in a new tab           |
| `src/routes.ts`                   | The latest release's address                              |
| `src/content/onboarding.ts`       | The card's words                                          |
| `tests/connect.test.ts`           | The card on the demo, and never in the app or development |

The frame's button read "Download for Windows"; spec 02 names it **Download
the app**, since the release page lists both packages, so the frame was
renamed to match (2026-10-24).

## Acceptance

- [x] At 390 px **Connect — Demo** matches its frame, the card included; at 360, 600, 840, 1280 and 1440 it holds BR-39.
- [x] The button opens the latest release in a new tab.
- [ ] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass; `check.yml` passes on `dev`.
