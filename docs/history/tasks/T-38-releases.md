# T-38 · Installers, releases and updates

|          |                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| Phase    | 6. Desktop                                                                                                   |
| Serves   | [spec 13](../../specs/13-desktop.md#updates); [plan 4](../plan/04-deployment.md#on-a-version-tag-releaseyml) |
| Waits on | [T-37](T-37-data-at-start.md)                                                                                |

A version the owner tags becomes a Windows installer and a Linux AppImage on
a draft release, and an installed app updates itself once the owner publishes
it.

## The owner

- Pushes the first tag, `v0.1.0`, on `main`, reads the draft release and publishes it.
- Installs it on Windows, passes SmartScreen once, and confirms the next published version installs on close.

## What it builds

| File                                                                                 | Note                                                                                                                                                            |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desktop/electron-builder.yml`                                                       | NSIS for the current user, removing the app's folder on uninstall (`deleteAppDataOnUninstall`); the AppImage; what each carries; GitHub as the place to publish |
| `desktop/scripts/after-pack.mjs`                                                     | The staged server into `resources/server`, its links resolved and its packages hoisted                                                                          |
| `desktop/src/updates.ts`                                                             | `electron-updater` at each start and every six hours; install on close; the one notification; the answer to Check                                               |
| `desktop/scripts/starting.mjs`                                                       | Also writes the notification's words into `dist/words.json`, and the window's icon into `dist/icon.png`                                                         |
| `desktop/package.json`                                                               | `electron-builder` and `electron-updater`, pinned; the app's version                                                                                            |
| `src/content/desktop.ts`                                                             | The notification's words                                                                                                                                        |
| `src/screens/shell/Profile.tsx`                                                      | About's Check (spec 04), built disabled on 2026-10-23: enabled, it asks the main process over the server's `parentPort` to look now                             |
| `src/app/actions.ts`, `src/infra/app-updates.ts`, `src/domain/types/update-state.ts` | The server action Check calls; the ask over `parentPort`, a minute at most; the four answers                                                                    |
| `src/content/nav.ts`                                                                 | The row's words: Checking…, Up to date, Downloading, installs on close, Couldn’t reach GitHub                                                                   |
| `.github/workflows/release.yml`                                                      | Plan 4's three steps, on a `v*` tag alone, with `contents: write`                                                                                               |

Changed on 2026-10-23: `extraResources` drops the server's `node_modules`,
and pnpm's links cannot go into an installer, so an `afterPack` script copies
the server instead. The release workflow opens the draft in its Version job,
so the two builds upload to one draft rather than racing to create it.

Added on 2026-10-23 by the owner: the app's icon, the site's
`public/icon-512.png`, on the installer, the program and the window.

## Documents

`docs/desktop.md`: how a version is cut and published, and what SmartScreen
shows. `development.md`: the release in the list of workflows.

## Acceptance

- [ ] Spec 13's acceptance 6.
- [x] A tag that disagrees with `desktop/package.json` fails before building.
- [x] `check.yml` holds no new permission, and `release.yml` none beyond `contents: write`.
- [x] `check.yml` passes on `dev`.
