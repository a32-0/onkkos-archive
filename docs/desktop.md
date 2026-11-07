# The desktop app

The app a player installs on Windows or Linux, so DE's profile is read from
their own machine ([spec 13](specs/13-desktop.md)). It lives in `desktop/`,
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
installer on Windows, the AppImage on Linux. `pnpm --dir desktop run
package:store` writes the Microsoft Store's package instead, on Windows. `electron-builder --dir` stops at
the unpacked folder, which opens without installing.

The app reads a real account: the server inside it runs with
`WF_PROFILE_SOURCE=live`. Development of the screens stays on the demo's
fixtures (`pnpm dev`); the app is for checking the app.

## What each file does

| File                      | What it does                                                                                                                                                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/stage.mjs`       | Builds the app's target (`WF_BUILD_TARGET=app`), copies `public/` and `.next/static` beside `server.js`, writes the starting frames, builds the main process and checks the guard                                                                                                   |
| `scripts/guard-check.mjs` | Starts the staged server behind the guard under plain Node and fails the stage unless it answers 200 with the secret and 403 without it or with another                                                                                                                             |
| `scripts/starting.mjs`    | Writes `dist/starting/starting.html` and `failed.html` from `src/ui/tokens.css`, the quill's path, `LoadingCard.module.css` for its motion, the build's own fonts and `src/content/desktop.ts`, `dist/words.json`, the notification's words, and `dist/icon.png`, the window's icon |
| `scripts/after-pack.mjs`  | Copies the staged server into the package's `resources/server`, every package of its `node_modules` hoisted to the top and every link resolved                                                                                                                                      |
| `scripts/trial.mjs`       | Builds a trial app beside the real one, and serves its updates and a data set from this machine (Trying a version, below)                                                                                                                                                           |
| `scripts/store.mjs`       | Builds the Microsoft Store's package with the identity read from three variables, or stops without them                                                                                                                                                                             |
| `icon.png`                | The app's icon: the quill in `--ink` on a `--brand` tile with rounded corners (Figma: Brand > App icon, 933:5775)                                                                                                                                                                   |
| `appx/`                   | The Store package's tiles, drawn from the same tile: `StoreLogo.png` (50), `Square44x44Logo.png`, `Square150x150Logo.png` and `Wide310x150Logo.png`, the tile centred on no background                                                                                              |
| `electron-builder.yml`    | The three packages, what each carries, the Store package's tiles and Windows versions, and GitHub Releases as the place updates come from                                                                                                                                           |
| `src/channel.ts`          | Where the app runs from: the tree, a GitHub package or the Microsoft Store                                                                                                                                                                                                          |
| `tests/channel.test.ts`   | Only a GitHub package updates itself                                                                                                                                                                                                                                                |
| `src/updates.ts`          | The update check at each start and every six hours, the notification, and the answer to Profile's **Check**; none of it from the Store                                                                                                                                              |
| `src/main.ts`             | One app at a time; the window; the starting frame, then the server's first page; the secret on the window's requests                                                                                                                                                                |
| `src/server.ts`           | The kept port, the start's secret, the server started in a utility process, the wait until it answers, and the second server that checks a new data set                                                                                                                             |
| `src/serve.ts`            | The utility process's entry: the guard, then Next's `server.js`                                                                                                                                                                                                                     |
| `src/guard.ts`            | The check in front of Next: the secret and the `Host`, or `403`                                                                                                                                                                                                                     |
| `src/window-bounds.ts`    | The size and place the window was left at, read back inside its limits and the screens                                                                                                                                                                                              |
| `src/links.ts`            | Navigation held to the server's origin; the wiki, warframe.com and GitHub opened in the system's browser; **Restart** on Can't start relaunches the app                                                                                                                             |
| `src/log.ts`              | `app.log`: the server's output and the main process's warnings, each line stamped with its time                                                                                                                                                                                     |
| `src/data.ts`             | The data check at each start: the manifest from `main`, the new server folder, each hash, the read check, the swap                                                                                                                                                                  |
| `tests/data.test.ts`      | A newer set swapped in; the same set, a wrong hash, another schema, a set this version cannot read, no connection, a timeout and a new app version each keep or restore the set in use                                                                                              |
| `next-cache.cjs`          | Next's cache handler for the app: in memory, so nothing is written beside the program                                                                                                                                                                                               |
| `tests/guard.test.ts`     | The guard's four answers, the right secret on another `Host` among them                                                                                                                                                                                                             |

## The window

The window opens 390 wide and 844 tall, or as tall as the screen allows. It
can be widened to 600 and never goes below 390 by 640. It cannot be maximised
or made full screen, and it has no menu. These are the `minWidth`, `maxWidth`
and `minHeight` of `BrowserWindow` with `useContentSize`, so the limits hold for
the content and not for the system's frame around it.

When the window closes, its content size and its position go to `window.json`
in the app's folder, and the next start opens there. A saved size is held
inside the same limits and the height of the screen it opens on, so a smaller
screen or a broken file opens at 390 by 844 or the screen's height. Checked on
2026-10-23: widened to 520 by 760, closed, and reopened at 520 by 760.

The saved place stands while the middle of the title bar falls inside some
screen's work area, so a window left partly past a screen's edge opens there.
If that point is on no screen, or the file comes from a version that kept no
place, the size stays and Electron centres the window.

Three details keep the size from changing on its own:

| Case                                                 | What was measured                                                                                           | What the app does                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Closed while minimised                               | `getContentSize` answers 0 by 0                                                                             | Keeps the size from the last `resize`, and takes the place from `getNormalBounds`          |
| Opened on a screen at 200% with the main one at 100% | The content opened at 511 by 715 for 520 by 760                                                             | Reads the content size once the window is there, and adds the difference to its outer size |
| The same correction                                  | The content can open 1 px wider than asked (521 for 520), so saving at each close grew it by 1 px per start | Saves the size only on a `resize`, so that pixel does not add up                           |

Checked on 2026-11-06 on two screens, at 100% and 200%, from the tree with a
separate `--user-data-dir`: the place and size came back on both screens and
stayed the same over three reopenings; closing while minimised kept both; a
place on no screen and a file with no place opened centred at the saved size.
The Linux build was not tried. Wayland does not let an app place its own
window, so there the system still decides.

The scroll bar is hidden: the app inserts `html { scrollbar-width: none; }`
into each page it loads, and the content keeps its full width. Chromium's
overlay scroll bar only switches on from the process's own command line. An
installed app's shortcut does not pass one, and Electron's
`appendSwitch("enable-features", …)` came too late to change it (measured on
2026-10-23: 375 of 390 px wide with the switch, 390 without the bar). The
pages still scroll by wheel, touch and keys.

**Desktop — Starting** shows from the first frame, as a local file, because
the server does not exist yet. It uses nothing remote: the tokens, the
quill's path and the fonts the build already self-hosts are copied into
it when the app is staged. If the server does not answer within thirty
seconds, **Desktop — Can't start** replaces it. Its Restart is a link to
`app:restart`, which the main process turns into a relaunch. The window has no
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

Before the rename, the app makes sure this version can read the new set
(BR-82). `checkData()` in `src/server.ts` starts a second server from
`server-next` on a port the system picks, never the kept one, asks it for
`/api/data-check`, and stops it. That route calls `readAllData()`
(`src/infra/data-check.ts`), which reads every file through the same code
the screens use, and answers with the first problems it finds. A refusal
deletes `server-next`, leaves one line in `app.log` (`This version cannot
read the new set: items.124.routes.0.type: …`), and writes the version and
the manifest's hash to `server-refused`, so the next start does not download
that set again. A check that does not answer within thirty seconds is not a
refusal: the set is dropped for this start and tried again at the next. It
costs a second start of the server, about two seconds,
and only on a start that found new data.

On 2026-11-02 an app at 1.1.0 downloaded data with a route type, `weekly`,
that only 1.2.0 knew, and every screen answered with an error until the
update installed. This check is what stops that from happening again.

The server's code reads `data/` beside itself, from the folder it runs in, so
nothing in `src/` changes for this and the demo's build does not see it. A
data path read from a variable would have made Turbopack trace the whole
project into the demo's functions.

| What happens                                 | The set used              |
| -------------------------------------------- | ------------------------- |
| The published set equals the one in use      | The one in use            |
| A newer set, every file verified             | The new one               |
| A wrong size or hash, another schema, a 404  | The one in use            |
| A set this version cannot read               | The one in use            |
| The same refused set, at a later start       | The one in use, no fetch  |
| No connection, or thirty seconds run out     | The one in use            |
| The app updated since the set was downloaded | The installer's own again |

Nothing is shown in any of these cases. A refusal leaves one line,
`The data stayed as it was: …`, on the main process's output. Started from
the tree, the app checks only with `WF_DATA_CHECK=1`; otherwise it would
replace the working tree's data with `main`'s.

`WF_DATA_SOURCE` replaces `main`'s address, for trying a set from this
machine (below).

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

Both carry the app's icon, `desktop/icon.png`, 512 px: the quill in
`--ink` at 65% of the height, on a `--brand` tile whose corners round at 64
on 300, with no background around it. The tile is Figma's Brand > App icon
(933:5775), exported as SVG and rendered with sharp to each size. The
Store's tiles in `desktop/appx/` are the same render, and so is the site's:
`src/app/icon.svg` is the tile itself, `public/icon-192.png` and
`icon-512.png` render it for the installed web app, and
`src/app/apple-icon.png` is the tile with square corners, which iOS rounds
itself. electron-builder turns it into the
installer's and the program's icon, and the window shows it from
`dist/icon.png`.

On uninstall, Windows removes the app's folder under `%APPDATA%`. The
installer is not signed (spec 13), so SmartScreen shows "Windows protected
your PC" on the first run: **More info**, then **Run anyway**. Windows
remembers the choice for that file.

### The Microsoft Store package

The app's listing is
[`apps.microsoft.com/detail/9NVJBJD22L6D`](https://apps.microsoft.com/detail/9NVJBJD22L6D),
live since 2026-10-30; `STORE_LISTING` in `src/routes.ts` holds the same
address for the demo's badge.

`pnpm --dir desktop run package:store`, after a stage, writes
`onkkos-archive-{version}.appx`, an MSIX package, into `desktop/release/`.
It is built on Windows only and publishes nothing. `scripts/store.mjs` reads
the identity Partner Center reserved from three variables and passes it to
electron-builder; without all three it stops, so no package goes out under a
made-up identity:

| Variable               | Partner Center, Product identity          |
| ---------------------- | ----------------------------------------- |
| `STORE_IDENTITY_NAME`  | `Package/Identity/Name`                   |
| `STORE_PUBLISHER`      | `Package/Identity/Publisher` (`CN=…`)     |
| `STORE_PUBLISHER_NAME` | `Package/Properties/PublisherDisplayName` |

The release workflow takes them from the repository's Actions secrets of the
same names. To build the package on your own machine, set them in the shell
first. The package is not signed here; Microsoft signs it when it passes
certification. electron-builder gives it the version as four numbers,
`0.1.1.0`, which is what the Store asks for.

Its tiles come from `desktop/appx/`. electron-builder looks for them in the
`appx` folder of its build resources, set to `desktop/` itself
(`buildResources: .`), because the repository ignores every `build/` folder.
Without them it would ship its own sample tiles. The package declares
`runFullTrust`, as every Electron app does; Partner Center asks why when it is
first submitted: the app is a desktop program that runs its own server on the
loopback.

To try the package before submitting it, turn on Windows' Developer Mode,
unpack it with `makeappx`, which electron-builder keeps in its cache, and
register the folder:

```powershell
$mk = Get-ChildItem "$env:LOCALAPPDATA\electron-builder\Cache" -Recurse -Filter makeappx.exe |
  Where-Object FullName -match 'x64' | Select-Object -First 1 -ExpandProperty FullName
& $mk unpack /p desktop\release\onkkos-archive-{version}.appx /d $env:TEMP\oa-store /o
Add-AppxPackage -Register $env:TEMP\oa-store\AppxManifest.xml
```

It then opens from the Start menu as the Store would install it, and
`Get-AppxPackage {package name} | Remove-AppxPackage` removes it. Don't unpack
it as a zip: a package stores its file names encoded, so `Expand-Archive`
writes the program as `Onkko%27s%20Archive.exe`, and Windows then starts
nothing (found on 2026-10-27).

Building it locally, 7-Zip prints two "Cannot create symbolic link" errors
while it unpacks electron-builder's signing tools. They are macOS files inside
that archive, which Windows refuses to link without administrator rights; the
package is built all the same (checked on 2026-10-27: 168 MB, its manifest
carrying the identity, the four tiles and Windows 10.0.17763 or later).

## Updates

`src/updates.ts` runs `electron-updater` in a packaged app alone. It asks
GitHub Releases once the window shows its first page and every six hours
after. A newer version downloads in the background and installs when the app
quits, without opening it again; when it has downloaded, the system shows one notification with the
words of `src/content/desktop.ts`, which the stage writes into
`dist/words.json` since the main process cannot read `src/`. The app's
`AppUserModelId` is the `appId`, which Windows needs to show it.

Profile's **Check** is a server action, `checkUpdates` in `src/app/actions.ts`.
The server cannot reach the updater, which lives in the main process, so it
asks over the utility process's `parentPort` (`src/infra/app-updates.ts`) and
waits a minute at most. The main process answers with one of four states, which
the row then shows in place of the button: up to date, downloading a version,
that version installs on restart, or GitHub could not be reached. Leaving
Profile and coming back shows the button again. Once a version has
downloaded, **Restart now** calls `restartNow`, which posts a `restart`
message the same way; the main process then calls
`autoUpdater.quitAndInstall(true, true)`, a silent install that opens the app
again. It does nothing before a download or from the Store. Started from the tree, the
main process answers "up to date" without asking GitHub; on the demo site the
action answers that GitHub could not be reached, and the row never shows.

Until the first release is published, a packaged app finds no release and its
row reads that GitHub could not be reached.

Installed from the Store, the app never starts `electron-updater`: Electron
sets `process.windowsStore`, `src/channel.ts` reads it, and both the check at
start and Profile's **Check** stand down, since the Store installs every
version and allows no other. The main process passes the channel to the
server as `WF_APP_CHANNEL`, and Profile's Updates row reads "Through the
Microsoft Store" with no button. The app also leaves its `AppUserModelId` to
the package, which Windows assigns. The data check at each start runs as
everywhere else.

## Cutting a version

1. Raise `version` in `desktop/package.json` on `dev` and take it to `main`.
2. Pull the merge, tag `main` with the same version, `v` before it, and push
   the tag. The commands are in
   [`maintaining.md`](maintaining.md#releasing-a-new-version-of-the-app).
3. `release.yml` checks that the tag and `desktop/package.json` agree, opens
   a draft release, and builds the installer on Windows and the AppImage on
   Ubuntu, each uploading its package and its update file (`latest.yml`,
   `latest-linux.yml`) to the draft.
4. Read the draft, write its notes, and publish it. Installed apps see it at
   their next check.
5. The Windows job also builds the Store package and keeps it as the run's
   artifact, `microsoft-store`. Download it from the run's page, then in
   Partner Center open the app, start a new submission, upload the `.appx`
   under Packages and submit it. Store players get the version once it
   passes certification, usually within a few days.

A tag that disagrees with `desktop/package.json` fails before anything is
built. The workflow holds `contents: write`, GitHub's own token, and nothing
else.

## Trying a version before releasing it

`scripts/trial.mjs` builds a trial app: the same program named **Onkko's
Archive Trial**, with its own `appId`, folder, `userData`, updater cache and
single-instance lock, so it installs beside the real app and never touches
its files. Its updates come from this machine,
`http://127.0.0.1:8789/updates`, instead of GitHub. Nothing is published.
It still names itself `onkkos-archive` to Windows (`APP_ID` in
`src/main.ts`), so its "update ready" notification may show as the real
app's.

1. Build the program once: `pnpm --dir desktop stage`.
2. Build two versions of the trial. Pick any numbers; they only have to
   grow. Each lands in `desktop/release-trial/{version}/`.

   ```sh
   node desktop/scripts/trial.mjs build 0.0.1
   node desktop/scripts/trial.mjs build 0.0.2
   ```

3. Serve the newer one, with this tree's data or a copy of it. Each copy
   changes `sources.yaml` and writes a matching manifest: `changed` adds a
   comment, which every version reads; `broken` turns the first
   `type: weekly` into a type no code knows.

   ```sh
   node desktop/scripts/trial.mjs serve 0.0.2
   node desktop/scripts/trial.mjs serve 0.0.2 changed
   node desktop/scripts/trial.mjs serve 0.0.2 broken
   ```

4. Install `onkkos-archive-trial-0.0.1-setup.exe`, or run
   `release-trial/0.0.1/win-unpacked/Onkko's Archive Trial.exe`. To take the
   data from step 3 instead of `main`, start it from a terminal with
   `WF_DATA_SOURCE=http://127.0.0.1:8789/data`, and with
   `ELECTRON_RUN_AS_NODE` cleared.
5. Read `%APPDATA%\Onkko's Archive Trial\app.log`. The serving terminal
   prints every request.

| To see                           | Do                                    | Expect                                                                                                                                                              |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An update downloads and installs | Install 0.0.1, open it, then close it | `latest.yml` and the installer requested; the next start is 0.0.2                                                                                                   |
| New data that works              | Serve `changed`, start with the data  | Only `sources.yaml` fetched, two "Ready" lines (the check, then the app), and `serverdatasources.yaml` ends with the comment; no `server-next` or `server-old` left |
| The same set, at the next start  | Start it again                        | Only `manifest.json` requested, one "Ready"                                                                                                                         |
| Data this version cannot read    | Serve `broken`, start with the data   | `This version cannot read the new set: …` in the log, and the app opens normally                                                                                    |
| A refused set is not fetched     | Start it again                        | Only `manifest.json` requested                                                                                                                                      |

Connect a trial only with a demo id: a real one makes it read DE. When you
finish, uninstall Onkko's Archive Trial from Windows' settings and delete
`desktop/release-trial/`.

Checked on 2026-11-02, run from `win-unpacked`: the four data rows behaved as
written, and 0.0.1 downloaded 0.0.2 from this machine. Installing an update
on quit was not tried that day.

## Where it writes

Everything goes under Electron's `userData`: `%APPDATA%\Onkko's Archive` on
Windows, `~/.config/Onkko's Archive` on Linux. It holds `store.json` (spec
11's locks and the last profile, [`api.md`](api.md)), `port`, `window.json`, `app.log`, `server` once a
data set has been downloaded, and Chromium's own folders, the cookies among
them. Next's cache stays in memory, so the wiki and the worldstate are read
again after each start.

`app.log` keeps what the server prints and what the main process warns of,
each line stamped with its time (`src/log.ts`). The server's output is piped
into it; the main process's `console.warn` and `console.error` write to it as
well as to the terminal. It starts over at the first start after it passes
1 MB. A player who meets a problem sends it; the app's own lines never name the account.

The updater keeps the version it downloads in its own cache,
`%LOCALAPPDATA%\onkkos-archive-desktop-updater` on Windows and
`~/.cache/onkkos-archive-desktop-updater` on Linux, until it installs. The
uninstaller leaves that folder.

Installed from the Store, the program sits in Windows' protected
`WindowsApps` folder, and Windows redirects what the app writes under
`%APPDATA%` into the package's own storage,
`%LOCALAPPDATA%\Packages\{package name}_{id}\LocalCache\Roaming\Onkko's Archive`.
The app sees its usual path, so nothing in it changes for the Store; a player
looking for `app.log` finds it there. Removing the app removes that folder
too. There is no updater cache. Checked on 2026-10-27 with the package
registered locally: it opened on the splash with a demo, then on the map once
an account was read; Profile's Updates row read "Through the Microsoft
Store"; closed and reopened, it kept the account and the window's size; and
`app.log`, `port`, `window.json` and `store.json`, with the profile and the
visitor budget, were in the package's folder above. A newer data set was not
waiting on `main` that day, so the swap itself was not exercised there.
