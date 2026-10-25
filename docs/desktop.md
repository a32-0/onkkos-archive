# The desktop app

The app a player installs on Windows or Linux, so DE's profile is read from
their own machine ([spec 13](../specs/13-desktop.md)). It lives in `desktop/`,
with its own `package.json` and lockfile, outside the demo's install and
build. This page covers how it is built and run, what each file does, and why
each part of the security baseline is there, how a version is packaged and
published, and how an installed app updates itself.

## Running it from the tree

```powershell
pnpm --dir desktop install
pnpm --dir desktop dev
```

`dev` stages the app, then builds and opens it. `pnpm --dir desktop start`
opens it again without staging. `pnpm --dir desktop check` typechecks the main
process and its tests, then runs the tests with Node's own runner; CI runs it
too, after installing with `--ignore-scripts` so Electron's binary is not
downloaded.

If Electron starts as plain Node ("does not provide an export named
BrowserWindow"), the shell has `ELECTRON_RUN_AS_NODE` set, as some editors'
terminals do. Clear it (`Remove-Item Env:ELECTRON_RUN_AS_NODE`) and run again.

`pnpm --dir desktop package`, after a stage, writes the package for the
machine it runs on into `desktop/release/`, and publishes nothing: the
installer on Windows, the AppImage on Linux. `electron-builder --dir` stops at
the unpacked folder, which opens without installing.

The app reads a real account: the server inside it runs with
`WF_PROFILE_SOURCE=live`. Development of the screens stays on the demo's
fixtures (`pnpm dev`); the app is for checking the app.

## What each file does

| File                      | What it does                                                                                                                                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/stage.mjs`       | Builds the app's target (`WF_BUILD_TARGET=app`), copies `public/` and `.next/static` beside `server.js`, writes the starting frames, builds the main process and checks the guard                                                                                                               |
| `scripts/guard-check.mjs` | Starts the staged server behind the guard under plain Node and fails the stage unless it answers 200 with the secret and 403 without it or with another                                                                                                                                         |
| `scripts/starting.mjs`    | Writes `dist/starting/starting.html` and `failed.html` from `src/ui/tokens.css`, the wordmark's paths, `LoadingCard.module.css` for the quill's motion, the build's own fonts and `src/content/desktop.ts`, `dist/words.json`, the notification's words, and `dist/icon.png`, the window's icon |
| `scripts/after-pack.mjs`  | Copies the staged server into the package's `resources/server`, every package of its `node_modules` hoisted to the top and every link resolved                                                                                                                                                  |
| `icon.png`                | The app's icon: the quill alone on no background                                                                                                                                                                                                                                                |
| `electron-builder.yml`    | The two packages, what each carries, and GitHub Releases as the place updates come from                                                                                                                                                                                                         |
| `src/updates.ts`          | The update check at each start and every six hours, the notification, and the answer to Profile's **Check**                                                                                                                                                                                     |
| `src/main.ts`             | One app at a time; the window; the starting frame, then the server's first page; the secret on the window's requests                                                                                                                                                                            |
| `src/server.ts`           | The kept port, the start's secret, the server started in a utility process, and the wait until it answers                                                                                                                                                                                       |
| `src/serve.ts`            | The utility process's entry: the guard, then Next's `server.js`                                                                                                                                                                                                                                 |
| `src/guard.ts`            | The check in front of Next: the secret and the `Host`, or `403`                                                                                                                                                                                                                                 |
| `src/window-size.ts`      | The size the window was left at, read back inside its limits                                                                                                                                                                                                                                    |
| `src/links.ts`            | Navigation held to the server's origin; the wiki, warframe.com and GitHub opened in the system's browser                                                                                                                                                                                        |
| `src/data.ts`             | The data check at each start: the manifest from `main`, the new server folder, each hash, the swap                                                                                                                                                                                              |
| `tests/data.test.ts`      | A newer set swapped in; the same set, a wrong hash, another schema, no connection, a timeout and a new app version each keep or restore the set in use                                                                                                                                          |
| `next-cache.cjs`          | Next's cache handler for the app: in memory, so nothing is written beside the program                                                                                                                                                                                                           |
| `tests/guard.test.ts`     | The guard's four answers, the right secret on another `Host` among them                                                                                                                                                                                                                         |

## The window

The window opens 390 wide and 844 tall, or as tall as the screen allows. It
can be widened to 600 and never goes below 390 by 640. It cannot be maximised
or made full screen, and it has no menu. These are the `minWidth`, `maxWidth`
and `minHeight` of `BrowserWindow` with `useContentSize`, so the limits hold for
the content and not for the system's frame around it.

When the window closes, its content size goes to `window.json` in the app's
folder, and the next start opens at that size. A saved size is held inside the
same limits and the screen's height, so a smaller screen or a broken file
opens at 390 by 844 or the screen's height. Checked on 2026-10-23: widened to
520 by 760, closed, and reopened at 520 by 760.

The scroll bar is hidden: the app inserts `html { scrollbar-width: none; }`
into each page it loads, and the content keeps its full width. Chromium's
overlay scroll bar only switches on from the process's own command line. An
installed app's shortcut does not pass one, and Electron's
`appendSwitch("enable-features", …)` came too late to change it (measured on
2026-10-23: 375 of 390 px wide with the switch, 390 without the bar). The
pages still scroll by wheel, touch and keys.

**Desktop — Starting** shows from the first frame, as a local file, because
the server does not exist yet. It uses nothing remote: the tokens, the
wordmark's paths and the fonts the build already self-hosts are copied into
it when the app is staged. If the server does not answer within thirty
seconds, **Desktop — Can't start** replaces it. Its Close is a link to
`app:close`, which the main process turns into quitting. The window has no
preload and cannot reach the main process any other way.

A player whose `wf_account` cookie the window still holds opens on the map
(`/system`); anyone else opens on the splash.

## Who may talk to the server

The server listens on `127.0.0.1` only. Each start draws a 32-byte secret,
which the main process passes to the server's process and adds to every
request the window makes to the server's origin, and to no other address. The
guard answers `403` to a request that lacks the secret or carries another,
and to one whose `Host` is not the server's own address. That last check
stops a page in the player's browser that renames itself to `127.0.0.1`
through DNS. No web page can know the secret, so none can make the app spend
the player's reads.

The guard runs in the server's own process: `serve.js` wraps the request
listener of every HTTP server created after it loads, then loads `server.js`.
It is not `src/proxy.ts`. A proxy's matcher is fixed when the demo is built,
so a guard there would have made the demo run its proxy on every page.
Wrapping `http.createServer` depends on Next creating its server through it.
Every stage checks that it still does (`guard-check.mjs`), so a Next that
creates its server another way fails the build instead of shipping an open
server.

Checked on 2026-10-23, with the app running. The right secret on another
`Host` cannot be sent from outside, since the secret never leaves the app;
`tests/guard.test.ts` covers it.

| Request to the server           | Answer |
| ------------------------------- | ------ |
| No secret                       | 403    |
| A wrong secret                  | 403    |
| No secret, `Host: evil.example` | 403    |
| The window's own `fetch`        | 200    |

## Why the window is shut tight

- `contextIsolation`, `sandbox`, no `nodeIntegration`, no preload: a page the
  window shows can run nothing on the machine.
- No developer tools in a packaged build (`devTools: !app.isPackaged`).
- `will-navigate` keeps the window on the server's origin. A link out to
  the wiki, warframe.com or GitHub opens in the system's browser over HTTPS.
  Any other address is refused. `window.open` is always denied and follows
  the same rule.
- `requestSingleInstanceLock`: opening the app again brings the open window
  forward instead of starting a second server.

Checked on 2026-10-23, with the app running: `require`, `process` and
`module` are undefined in the window. A wiki link on Step by step reached the
system's browser, and the window stayed on its page. A link to another site
and a `window.open` were both refused: no navigation, no new window, nothing
sent to the browser. Close on **Desktop — Can't start** quit the app.

## Cookies across starts

The window's cookies are Chromium's, under the app's folder. Chromium keeps
them per port, so a new port at each start lost the remembered id: measured
on 2026-10-23, the second start opened on the splash. The app now keeps the
port the system first gave it, in `port` under its own folder, and takes
another only when that one is taken. The cookies are flushed to disk before
the app quits.

## The data at each start

While **Desktop — Starting** shows, a packaged app reads
`data/manifest.json` from `main` on GitHub, for thirty seconds at most. When
the files differ from the set in use and the schema is the app's own, it
builds a new server folder, `server-next` under its own folder. The program's
server is copied there without its `data/` (about 31 MB). The data files that
did not change are copied from the set in use, and the rest are downloaded and
checked against their size and SHA-256. Only then does `server-next` become
`server`, by renaming, and the old one is deleted. The server then starts from
that folder.

The server's code reads `data/` beside itself, from the folder it runs in, so
nothing in `src/` changes for this and the demo's build does not see it. A
data path read from a variable would have made Turbopack trace the whole
project into the demo's functions.

| What happens                                 | The set used              |
| -------------------------------------------- | ------------------------- |
| The published set equals the one in use      | The one in use            |
| A newer set, every file verified             | The new one               |
| A wrong size or hash, another schema, a 404  | The one in use            |
| No connection, or thirty seconds run out     | The one in use            |
| The app updated since the set was downloaded | The installer's own again |

Nothing is shown in any of these cases. A refusal leaves one line,
`The data stayed as it was: …`, on the main process's output. Started from
the tree, the app checks only with `WF_DATA_CHECK=1`; otherwise it would
replace the working tree's data with `main`'s.

## The packages

`electron-builder.yml` builds an NSIS installer for Windows, one click, for
the current user, with no administrator, and an AppImage for Linux. Both are
named `onkkos-archive-{version}`, with no space or apostrophe, because GitHub
renames such characters on upload and the update files would then name an
asset that does not exist. The AppImage also refuses an apostrophe in the
program's file, so on Linux the program and its `.desktop` entry are
`onkkos-archive` (`executableName`, `desktopName`), while the window and the
menus still read Onkko's Archive. The program carries `dist/` and
`electron-updater` in `app.asar`; the server goes beside it in
`resources/server`.

The server is copied by `scripts/after-pack.mjs` rather than by
`extraResources`, which drops a `node_modules` folder, and the staged one is
pnpm's, made of links that an installer cannot hold. So every link is
resolved, and each package under `node_modules/.pnpm` is lifted to the top of
`node_modules`, where Node finds it from anywhere in the server. The script
stops the package if two versions of one package are found.

Both carry the app's icon, `desktop/icon.png`: the quill alone, 512 px on
no background, as most Windows programs draw theirs (the site keeps
`public/icon-512.png`, the quill on the canvas). electron-builder turns it
into the installer's and the program's icon, and the window shows it from
`dist/icon.png`. It was drawn from the wordmark's quill path in `--brand`.

On uninstall, Windows removes the app's folder under `%APPDATA%`. The
installer is not signed (spec 13), so SmartScreen shows "Windows protected
your PC" on the first run: **More info**, then **Run anyway**. Windows
remembers the choice for that file.

## Updates

`src/updates.ts` runs `electron-updater` in a packaged app alone. It asks
GitHub Releases once the window shows its first page and every six hours
after. A newer version downloads in the background and installs when the app
quits; when it has downloaded, the system shows one notification with the
words of `src/content/desktop.ts`, which the stage writes into
`dist/words.json` since the main process cannot read `src/`. The app's
`AppUserModelId` is the `appId`, which Windows needs to show it.

Profile's **Check** is a server action, `checkUpdates` in `src/app/actions.ts`.
The server cannot reach the updater, which lives in the main process, so it
asks over the utility process's `parentPort` (`src/infra/app-updates.ts`) and
waits a minute at most. The main process answers with one of four states, which
the row then shows in place of the button: up to date, downloading a version,
that version installs on close, or GitHub could not be reached. Leaving
Profile and coming back shows the button again. Started from the tree, the
main process answers "up to date" without asking GitHub; on the demo site the
action answers that GitHub could not be reached, and the row never shows.

Until the first release is published, a packaged app finds no release and its
row reads that GitHub could not be reached.

## Cutting a version

1. Raise `version` in `desktop/package.json` on `dev` and take it to `main`.
2. Tag `main` with the same version, `v` before it, and push the tag.
3. `release.yml` checks that the tag and `desktop/package.json` agree, opens
   a draft release, and builds the installer on Windows and the AppImage on
   Ubuntu, each uploading its package and its update file (`latest.yml`,
   `latest-linux.yml`) to the draft.
4. Read the draft, write its notes, and publish it. Installed apps see it at
   their next check.

A tag that disagrees with `desktop/package.json` fails before anything is
built. The workflow holds `contents: write`, GitHub's own token, and nothing
else.

## Where it writes

Everything goes under Electron's `userData`: `%APPDATA%\Onkko's Archive` on
Windows, `~/.config/Onkko's Archive` on Linux. It holds `store.json` (spec
11's locks and the last profile, [`api.md`](api.md)), `port`, `window.json`, `server` once a
data set has been downloaded, and Chromium's own folders, the cookies among
them. Next's cache stays in memory, so the wiki and the worldstate are read
again after each start.

The updater keeps the version it downloads in its own cache,
`%LOCALAPPDATA%\onkkos-archive-desktop-updater` on Windows and
`~/.cache/onkkos-archive-desktop-updater` on Linux, until it installs. The
uninstaller leaves that folder.
