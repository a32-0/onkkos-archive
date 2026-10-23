# T-36 · The window: Electron, the server inside it, the guard

|          |                                                                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                                                                                                   |
| Serves   | [spec 13](../13-desktop.md), [spec 00](../00-constitution.md); [plan 1](../plan/01-repository.md#desktop-the-app), [plan 2](../plan/02-architecture.md#two-targets-one-tree) |
| Waits on | [T-35](T-35-store-on-disk.md)                                                                                                                                                |

The app opens on the player's machine: one window on the app's own Next
server, which answers that window and nothing else, with every write under the
app's own folder.

## The owner

- Approves the frames **Desktop — Starting** and **Desktop — Can't start**.
- Runs the packaged build on their Windows machine, and on Linux if they have one, and reads their own account once.

## First, one read from inside Electron

Before the rest of this task: the smallest Electron main process that starts
the server with `WF_PROFILE_SOURCE=live`, and the owner's account read once
through it, on the owner's machine (spec 13, "How it reads DE"). The answer is
recorded here, the profile never. A refusal stops the task and goes to the
owner with its log line.

## What it builds

| File                                    | Note                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `desktop/package.json`, `tsconfig.json` | Electron, pinned; its own lockfile; `pnpm --dir desktop check` typechecks, lints and tests                                                                                           |
| `desktop/src/main.ts`                   | One app at a time; the window of spec 13, its content 390 to 600 wide and 640 tall at least, never maximised; `contextIsolation`, `sandbox`, no `nodeIntegration`, no menu, no tools |
| `desktop/src/server.ts`                 | The standalone server on `127.0.0.1`, a port the system picks, the app's variables; stopped with the app                                                                             |
| `desktop/src/origin.ts`                 | The window's own origin, forwarded to the server with the secret; the measurement that cookies and storage survive                                                                   |
| `desktop/src/links.ts`                  | Navigation held to the app's origin; the wiki, warframe.com and GitHub to the system's browser; any other address refused                                                            |
| `desktop/src/starting.html`             | The two frames, on the tokens of `src/ui/tokens.css`; their words filled in by `stage.mjs` from `src/content/desktop.ts`, never written in it                                        |
| `desktop/scripts/stage.mjs`             | The app's build with `output: "standalone"`, and `public/`, `.next/static` and `data/` copied beside `server.js`                                                                     |
| `next.config.ts`                        | `output` and `cacheHandler` for the app's target alone, read from the build's own variable                                                                                           |
| `src/proxy.ts`                          | With `WF_LAUNCH_TOKEN` set, `403` for a request without it or with another `Host`                                                                                                    |
| `src/infra/*` loaders                   | `data/` read from `WF_DATA_DIR` when it is set                                                                                                                                       |
| `src/app/layout.tsx`                    | Analytics and Speed Insights on the demo alone                                                                                                                                       |
| `src/content/desktop.ts`                | Every word of the two frames                                                                                                                                                         |
| `.github/workflows/check.yml`           | `desktop/`'s own checks                                                                                                                                                              |
| `tests/proxy.test.ts`                   | The guard: no secret, a wrong secret, another `Host`, each `403`; the demo's proxy unchanged                                                                                         |

## Documents

`docs/desktop.md`: how the app is built, run from the tree (`pnpm --dir
desktop dev`) and packaged, and why each part of the security baseline is
there.

## Acceptance

- [ ] Spec 13's acceptance 1 to 4 and 7, on a packaged build run from `desktop/`.
- [ ] Whether cookies hold on the app's own origin is measured and recorded in `docs/desktop.md`; if they do not, the port is kept instead, with the same secret.
- [ ] The demo's `pnpm build` and `pnpm weight` give what they gave before this task.
- [ ] `pnpm check`, `pnpm knip`, `pnpm test:stories` and `desktop/`'s checks pass; `check.yml` passes on `dev`.
