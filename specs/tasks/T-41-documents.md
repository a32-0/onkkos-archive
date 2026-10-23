# T-41 · The README and the documents for the app

|          |                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Phase    | 6. Desktop                                                                                             |
| Serves   | [spec 00](../00-constitution.md), [spec 13](../13-desktop.md); [plan 5](../plan/05-docs-and-readme.md) |
| Waits on | [T-38](T-38-releases.md), [T-42](T-42-download-card.md)                                                |

Every document describes the app as it is (constitution): the README offers
the demo and the download, and promises what the app on a player's machine
does with their account.

## Brought forward (owner, 2026-10-23)

The README was rewritten before T-42, at the owner's request, ahead of the
first release: the two ways in, the download and what SmartScreen asks, the
privacy section for the app, the desktop commands, a new banner with the
wordmark alone, and the three screens retaken. What the task still does: the
other documents of its table, and the README checked again once T-42 ships.

## What it builds

| File                  | Note                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `README.md`           | Plan 5's sections as rewritten for the app: try the demo, download for Windows or Linux, what SmartScreen asks, privacy |
| `docs/desktop.md`     | Completed from T-36 to T-38                                                                                             |
| `docs/api.md`         | The locks per machine, the guard of the server, the demo that reads nothing                                             |
| `docs/development.md` | The two targets, the variables, `desktop/`'s commands, the three workflows                                              |
| `docs/ui.md`          | Connect on the demo; the routes are the same in the app                                                                 |
| `docs/README.md`      | `desktop.md` in plan 5's order                                                                                          |
| `docs/readme/`        | The images retaken if a screen changed                                                                                  |

## Acceptance

- [ ] Every document in plan part 5's table is in `docs/` and in the index, and none says production reads DE or names a shared store.
- [ ] The README's privacy section matches spec 13's "What it keeps, and where" line for line.
- [ ] The migration check and `git grep` for personal ids find nothing.
- [ ] `check.yml` passes on `dev`.
