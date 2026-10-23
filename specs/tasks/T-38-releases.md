# T-38 · Installers, releases and updates

|          |                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                          |
| Serves   | [spec 13](../13-desktop.md#updates); [plan 4](../plan/04-deployment.md#on-a-version-tag-releaseyml) |
| Waits on | [T-37](T-37-data-at-start.md)                                                                       |

A version the owner tags becomes a Windows installer and a Linux AppImage on
a draft release, and an installed app updates itself once the owner publishes
it.

## The owner

- Pushes the first tag, `v0.1.0`, on `main`, reads the draft release and publishes it.
- Installs it on Windows, passes SmartScreen once, and confirms the next published version installs on close.

## What it builds

| File                            | Note                                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desktop/electron-builder.yml`  | NSIS for the current user, removing the app's folder on uninstall (`deleteAppDataOnUninstall`); the AppImage; what each carries; GitHub as the place to publish |
| `desktop/src/updates.ts`        | `electron-updater` at each start and every six hours; install on close; the one notification                                                                    |
| `desktop/package.json`          | `electron-builder` and `electron-updater`, pinned; the app's version                                                                                            |
| `src/content/desktop.ts`        | The notification's words                                                                                                                                        |
| `src/screens/shell/Profile.tsx` | About's Check (spec 04), built disabled on 2026-10-23: enabled, it asks the main process over the server's `parentPort` to look now                             |
| `.github/workflows/release.yml` | Plan 4's three steps, on a `v*` tag alone, with `contents: write`                                                                                               |

## Documents

`docs/desktop.md`: how a version is cut and published, and what SmartScreen
shows. `development.md`: the release in the list of workflows.

## Acceptance

- [ ] Spec 13's acceptance 6.
- [ ] A tag that disagrees with `desktop/package.json` fails before building.
- [ ] `check.yml` holds no new permission, and `release.yml` none beyond `contents: write`.
- [ ] `check.yml` passes on `dev`.
