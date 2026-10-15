# T-20 · Screen: the shell

|          |                                                                             |
| -------- | --------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                  |
| Serves   | [spec 04](../04-shell.md); [plan 1](../plan/01-repository.md); BR-39, BR-41 |
| Waits on | [T-10b](T-10b-reach-states.md), [T-19](T-19-outside-reads.md)               |

The header, the player chip and its menu with Disconnect, the tab bar and its origin rule, and the sheet header: what every later screen sits in.

## What it builds

| File                                       | Note                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                       | Spec 04                                                                                                                         |
| `src/routes.ts`                            | With only the routes that exist; each screen task adds its own                                                                  |
| `src/app/actions.ts`                       | Disconnect                                                                                                                      |
| `src/screens/shell/`                       |                                                                                                                                 |
| `src/content/app.ts`, `voice.ts`, `nav.ts` | Spec 04                                                                                                                         |
| `tests/content.test.ts`                    | The player's rank title (T-13's correction)                                                                                     |
| `tests/language.test.ts`                   | Onkko speaks on every screen: each page opens or closes with a line from `voice.ts`; each screen task after it is checked by it |

## From T-19

- `src/routes.ts` exists, with `/connect` and `connectAfter()`, the failure URL; this task adds the shell's routes.
- A page reads through `requireScreen()` in `app/screen.ts`: it answers the `Screen` or redirects to `/connect`. `readScreen()` is wrapped in React's `cache()`, so the layout and the page share one read.
- `Screen` carries `cached` and `fetchedAt`. The last read's age and `nextReadAt()` (spec 04) are this task's: the age is words, so it is not in `infra/`, and the next read is `fetchedAt` plus `PROFILE_TTL_MS` from `infra/profile/cache.ts`.
- Disconnect calls `forgetAccount()` in `infra/session.ts`, which forgets `wf_account` and `wf_since`.

## Acceptance

- [ ] Every acceptance item of spec 04 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
