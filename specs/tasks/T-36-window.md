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

Changed on 2026-10-23: the guard left `src/proxy.ts` for `desktop/src/guard.ts`,
since a proxy's matcher is fixed at build time and the demo would have run it on
every page (plan 2); and `origin.ts` left, since the kept port holds the
cookies. `WF_DATA_DIR` moved to T-37, which first needs it: a data path read from
a variable makes Turbopack trace the whole project into the demo's functions,
so T-37 finds a shape the build can follow.

Read on 2026-10-22, on the owner's machine: DE answered and the profile
opened. The second start asked for the id again, because the port had
changed and the cookies with it; the port is now kept (spec 13). The same
read showed the platform glyph in the name (T-40) and no
`ActiveAvatarImageType` in the profile, so a live player wears the game's
default glyph (spec 04).

## What it builds

| File                                    | Note                                                                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desktop/package.json`, `tsconfig.json` | Electron, pinned; its own lockfile; `pnpm --dir desktop check` typechecks and tests; the root's lint covers it                                                                                                            |
| `desktop/src/main.ts`                   | One app at a time; the window of spec 13, its content 390 to 600 wide and 640 tall at least, never maximised; `contextIsolation`, `sandbox`, no `nodeIntegration`, no menu, no tools                                      |
| `desktop/src/server.ts`                 | The standalone server on `127.0.0.1`, on the port kept from the first start, the app's variables; stopped with the app                                                                                                    |
| `desktop/src/guard.ts`, `serve.ts`      | Loaded before `server.js` in the server's process: `403` for a request without the secret or with another `Host`, before Next sees it                                                                                     |
| `desktop/src/links.ts`                  | Navigation held to the app's origin; the wiki, warframe.com and GitHub to the system's browser; any other address refused                                                                                                 |
| `desktop/scripts/starting.mjs`          | Writes the two frames as local pages, on the tokens of `src/ui/tokens.css` and the build's own fonts; their words from `src/content/desktop.ts`, never written in it                                                      |
| `desktop/scripts/stage.mjs`             | The app's build with `output: "standalone"`, `public/` and `.next/static` copied beside `server.js` (`data/` arrives by tracing), then the two frames and `guard-check.mjs`, which fails the stage unless the guard holds |
| `next.config.ts`                        | `output` and `cacheHandler` for the app's target alone, read from the build's own variable                                                                                                                                |
| `desktop/next-cache.cjs`                | The app's cache handler: in memory, so nothing is written beside the program                                                                                                                                              |
| `src/app/layout.tsx`                    | Analytics and Speed Insights on the demo alone                                                                                                                                                                            |
| `src/content/desktop.ts`                | Every word of the two frames                                                                                                                                                                                              |
| `.github/workflows/check.yml`           | `desktop/`'s own checks                                                                                                                                                                                                   |
| `desktop/tests/guard.test.ts`           | The guard: no secret, a wrong secret, another `Host`, each `403`                                                                                                                                                          |

## Documents

`docs/desktop.md`: how the app is built, run from the tree (`pnpm --dir
desktop dev`) and packaged, and why each part of the security baseline is
there.

## Acceptance

- [ ] Spec 13's acceptance 1 to 4 and 7. From the tree on Windows, 2026-10-23: 1 (both frames against Figma, the widths), 2 (no Node, the wiki out, another site and `window.open` refused, Close quits), 3 (`403` without the secret, with another, on another host) and 7 hold, and the cookies survive a restart (`docs/desktop.md`). Still open: the same on a packaged build, once T-38 packages one, on Windows and Linux; and 4, the owner's account reopened within twelve hours with no request to DE.
- [x] Whether cookies hold across starts is measured and recorded (spec 13): a new port each start lost them, so the port is kept, with the same secret.
- [x] The demo's `pnpm build` and `pnpm weight` give what they gave before this task.
- [ ] `pnpm check`, `pnpm knip`, `pnpm test:stories` and `desktop/`'s checks pass; `check.yml` passes on `dev`.
