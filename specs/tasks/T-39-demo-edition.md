# T-39 · The demo reads no account

|          |                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                                     |
| Serves   | [spec 02](../02-connect.md#on-the-demo), [spec 11](../11-profile-proxy.md); [plan 4](../plan/04-deployment.md) |
| Waits on | [T-33](T-33-production.md)                                                                                     |

The website says what it is: a demo that reads no account. Today the demo
still shows the form, and any id typed in it opens Cy's profile as if it were
the player's; this task ends that first. **Connect — Demo** is built without
its card to the download, which T-42 adds once a release exists (owner,
2026-10-22).

## The owner

- Approves the frame **Connect — Demo**.
- Sets `WF_EDITION=demo` for Production in Vercel.

## What it builds

| File                                               | Note                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/infra/edition.ts`                             | `WF_EDITION` read once: `demo`, `app`, or neither                           |
| `src/infra/profile/read.ts`                        | On the demo, an id that is no demo's answers `not-found` and reads nothing  |
| `src/infra/session.ts`                             | On the demo, a remembered id that is no demo's is no account                |
| `src/app/connect/page.tsx`, `src/screens/connect/` | **Connect — Demo** without its card: the two demos, no field                |
| `tests/request.test.ts`                            | `/connect` on the demo and in the app; a typed id on the demo reads nothing |

## Acceptance

- [x] Spec 02's acceptance 8; acceptance 1 to 7 still hold in the app and in development.
- [x] At 390 px **Connect — Demo** matches its frame but for the card; at 360, 600, 840, 1280 and 1440 it holds BR-39.
- [x] `pnpm check`, `pnpm knip`, `pnpm build`, `pnpm weight` and `pnpm test:stories` pass.
- [x] `check.yml` passes on `dev`.
