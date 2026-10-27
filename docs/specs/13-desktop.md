# 13 · The app on the player's machine

A player's own account is read by an app they install on Windows or Linux, not
by the website. DE's CDN refuses a cloud server's address and a web page may
not read DE's answer, while a player's own machine reads it as their game does
([`public-release.md`](../history/public-release.md#why-the-app-moved-to-the-players-machine)).
This spec covers what the app is: the window the screens run in, the server
inside it and who may talk to it, where it keeps what it keeps, how its data
stays current after each Warframe update, and how it updates itself. The
screens are the same screens, specs 01 to 12; nothing here changes what any
of them shows.

## Frames

Drawn on 2026-10-22 in the first row of "App flows", from Onboarding —
Loading, for the owner to approve before this spec is pinned:

- [`764:5335` Desktop — Starting](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=764-5335): the window while the app
  opens: the header's wordmark, and the loading quill centred under it, with
  no card and no visible words; screen readers hear "Onkko is opening the
  archive...". The quill moves as Connect's does
  (`841:536`, T-44).
- [`764:5389` Desktop — Can't start](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=764-5389): the same window when the
  server inside cannot start: the error band, "Onkko's Archive couldn't
  start. Close it and open it again.", and **Close**, which quits the app.

No other state needs a frame. The update notice is the operating system's own
notification, and every data failure is silent by design (below).

## Rules

- The constitution: "It runs on the player's machine, and it protects DE's
  endpoint", "No computed state", "Nothing real about a person ships".
- [Spec 11](11-profile-proxy.md): the read order and every lock, kept on the
  machine's disk.
- [BR-01](../business-rules.md#br-01--remember-the-player-on-this-device):
  the device remembers the id.
- [BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  the app is never wider than 600 px, so it is the frames at every size it
  allows.

## What it is

An Electron app. Its main process starts the app's own Next server, built
`standalone`, on the player's machine, and opens one window on it. The window
renders the routes of [`docs/ui.md`](../ui.md) exactly as the demo does,
with the profile source set to `live`. One build serves both targets: the app
is the same `src/` tree, never a copy.

| Platform                 | Package                                          | Updates itself     |
| ------------------------ | ------------------------------------------------ | ------------------ |
| Windows, GitHub          | An installer, for the current user, no admin     | Yes                |
| Windows, Microsoft Store | An MSIX package                                  | No: the Store does |
| Linux                    | An AppImage                                      | Yes                |
| Android                  | Phase 7, after the refactor that needs no server | n/a                |

The installer and the AppImage are not signed (owner, 2026-10-22). A
signature would prove who published a package and that nobody changed it
since; without one, Windows shows SmartScreen's warning on the first run, and
the README says what to press. What stands in its place: each package is
built by the release workflow from the public source, which anyone can build
themselves, and reaches the player only from the repository's GitHub
Releases, over HTTPS.

The Microsoft Store package is signed by Microsoft when it passes
certification, so it shows no warning (owner, 2026-10-27). It is the same
program: the release workflow builds it from the same tag, and the owner
uploads it in Partner Center. The app knows it runs from the Store when
Electron reports `process.windowsStore`, and then leaves updating to the
Store (Updates, below). Its identity is the one Partner Center reserved: the
package name, the publisher and the publisher's display name. The owner keeps
them as the repository's Actions secrets, not in a committed file (owner,
2026-10-27), and the release workflow hands them to the build.

## The window

- One window the width of a phone (owner, 2026-10-22): its content opens 390
  wide, the frames' width, and can be widened to 600, BR-39's limit,
  never past it nor narrower than 390. It opens 844 tall, or as
  tall as the screen allows, and is never shorter than 640. After the first
  start it opens at the size the player left it, kept inside those limits
  and the screen (owner, 2026-10-23). It cannot be
  maximised or made full screen. The scroll bar is hidden, so the content
  keeps its full width (Chromium's overlay bar cannot be switched on from
  inside the app; `docs/desktop.md`). The system's own title bar; its title is
  the page's. A desktop layout was drawn and set aside the same day: the
  first version ships at a phone's width.
- No menu bar and no developer tools in a packaged build.
- One app at a time: opening it again brings the open window forward.
- **Desktop — Starting** shows from the first frame, before the server
  answers, and gives way once it does: to `/` for a device that remembers no
  id, and to the map (`/system`) for one that does (owner, 2026-10-23).
- If the server cannot start, **Desktop — Can't start** replaces it. Nothing
  else is tried; closing and opening the app tries again.

## How it reads DE

The server inside the app reads DE with its own `fetch`, as development
does, and says what it is: no browser's headers, no browser's network stack
borrowed to look like one, nothing that hides the app from a refusal
(constitution). The owner's machine read a profile this way on 2026-10-22,
with Node, and on 2026-10-23 from inside Electron, whose Node runs on another
TLS library. If DE ever refuses the app's reads, the refusal's log line is
the evidence, and the owner decides what follows.

## Who may talk to the server

The server inside the app reads DE from the player's address, so anything
that can reach it can spend the player's reads. Only the app's window may:

- It listens on `127.0.0.1` alone, on a port the operating system picks at
  each start. Nothing on the network reaches it.
- Each start draws a secret that only the main process knows. The main
  process adds it to every request the window makes to the server, and to no
  other address; the server answers any
  request without it, or with a `Host` other than its own address, with
  `403` and does nothing else. A web page open in the player's browser cannot
  know the secret, so it cannot make the app call DE. The check runs in the
  server's own process, in front of Next, so the demo's proxy stays as it is.
- The window's origin stays the same across starts, so cookies (BR-01) and
  the ticks of spec 10 survive a restart. Chromium keeps cookies per port, and a new
  port at each start lost them (measured on 2026-10-23), so the app keeps the
  port the system first gave it in a file under its own folder, and picks
  another only when that one is taken.
- A returning player, whose `wf_account` cookie the window still holds, opens
  on the map (`/system`), not on the splash (owner, 2026-10-23).

## What it keeps, and where

Everything lives in the app's own folder in the player's profile (Electron's
`userData`), never beside the program, which Windows may protect and an
AppImage mounts read-only. The one exception is the updater's cache, which
`electron-updater` keeps in the system's cache folder (`docs/desktop.md`):

| What                                                                                         | Where                         | Lives for                                                   |
| -------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------- |
| The trimmed profile and every lock of spec 11                                                | One store file                | Each lock's own window, as spec 11                          |
| `wf_account`, `wf_since`, `wf_place`, `wf_onkko`, `wf_tour`                                  | The window's cookies          | As on the demo                                              |
| The ticks of spec 10                                                                         | The window's storage          | Until cleared                                               |
| Wiki prose and icons, Varzia, rotations                                                      | Next's fetch cache, in memory | A day at most, Varzia ten minutes; gone when the app closes |
| The current `data/`                                                                          | A data folder (below)         | Until a newer set replaces it                               |
| A downloaded version of the app                                                              | The updater's cache           | Until it installs                                           |
| What went wrong: DE's refusals, a data set or an update that failed, the server's own errors | `app.log`                     | Until it passes 1 MB; the next start begins it again        |

On Windows the uninstaller removes the folder; from the Store, Windows keeps
the folder inside the package's own storage and removes it with the app. An AppImage has no
uninstaller: deleting it leaves the folder, `~/.config/Onkko's Archive`, which
the README names so a player can remove it. Disconnect clears the account's cookies; the
stored profile expires on its own.

`app.log` is how a problem on a player's machine reaches the owner: the player
sends it. It holds what the server and the main process warn of, each line
with its time; a refusal's line carries DE's status and the headers that say
who refused, never the account id or the profile (`api.md`) (owner,
2026-10-25).

What leaves the machine, and nothing else, each read the demo already makes
but the first and the last:

| To                                            | For                                                      |
| --------------------------------------------- | -------------------------------------------------------- |
| `api.warframe.com`                            | The profile, from the player's address (spec 11)         |
| `wiki.warframe.com`                           | Prose, icons, place art and update art                   |
| `www.warframe.com`, `www-static.warframe.com` | DE's own art named in the vendored data                  |
| `cdn.warframestat.us`, `api.warframestat.us`  | Item art; Varzia's stock and the rotations               |
| GitHub                                        | The data manifest and its files, and the updates (below) |

The app sends no analytics.

## The data, after each Warframe update

`data/` changes with every content update (`content-updates.md`); the code
rarely does. So the app fetches the data published on `main` rather than
waiting for a new version of itself:

1. `pnpm content:update` writes `data/manifest.json`: a schema number and,
   for each file, its size and SHA-256. A test fails when the manifest does
   not match the files.
2. Each start, while **Desktop — Starting** shows, the main process reads the
   manifest from `main` on GitHub, for at most thirty seconds in all.
3. A manifest with the app's own schema whose files differ from the current
   set is fetched file by file into a new folder. Every file is checked
   against its hash; only a complete, verified set replaces the current one,
   by renaming the folder. The old set is then deleted.
4. A manifest with another schema is ignored: that data needs a different
   version of the app, and the update below brings both.
5. Offline, slow, a failed hash, a full disk: the app opens with the set it
   has and tries again at the next start. Nothing is shown, because the set
   it has is always complete and correct for its version.

The installer carries the set that was on `main` when it was built, so the
first start and every offline start have one. The server runs in place from
the program's folder, with that set, until a downloaded set replaces it. The
app then runs a copy of the server from its own folder, with the new set beside
it, and drops that copy when the app itself updates. Nothing is ever written
beside the program.

## Updates

The app checks GitHub Releases at each start and every six hours. A newer
version downloads in the background and installs when the player closes the
app; the operating system's notification says so once: "A new version is
ready. It installs when you close Onkko's Archive." Its words live in
`src/content/`, like every word the player reads.

Profile's **Check** (spec 04) asks at once instead of waiting. While it asks,
the button reads "Checking…" and is disabled; then the answer takes the
button's place, in the row's value style: "Up to date", "Downloading
{version}", "{version} installs on close" once it has downloaded, or
"Couldn’t reach GitHub" without a network. The notification above follows as
usual. Leaving Profile and coming back shows the button again. Drawn on
2026-10-23 in
[`827:4748` Profile — App — Check states](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=827-4748),
beside Profile — App, for the owner to confirm.

From the Microsoft Store the app never checks GitHub and never downloads a
version of itself: the Store installs each new version, and Store policy
allows no other way. Profile's Updates row then holds no button; it reads
"Through the Microsoft Store", in the same value style. Drawn on 2026-10-27
as the last row of Profile — App — Check states, and approved by the owner
the same day.
The data of each Warframe update still arrives as above, because it is data
and not code.

A version is published by the owner. A tag `v{version}` on `main` builds the
installer and the AppImage in GitHub Actions and attaches them to a draft
release; publishing the draft is what reaches players. The same tag builds the
Store's package as a workflow artifact, which the owner uploads in Partner
Center; the version reaches Store players once it passes certification. A tag
whose version differs from the app's own fails the build.

## Data and sources

- The read, the store and every lock: spec 11.
- The demos: the same fixtures and buttons as the demo (spec 02).
- The server: the app's own Next build, `output: "standalone"`, set for this
  target alone, so the demo's build and its weight do not change.

## Acceptance

1. A packaged build on Windows and on Linux opens on **Desktop — Starting**
   and then the splash or the map (The window, above), 390 wide, matching each frame; widened to
   600 it holds BR-39, and it can be neither narrower nor wider.
2. The window cannot reach Node, opens no other origin inside itself, and
   sends every link outside the app (the wiki, warframe.com, GitHub) to the
   system's browser; any other address is refused.
3. A request to the server from outside the window (a browser tab, `curl`)
   answers `403` and never reads a profile or calls DE.
4. After closing and opening the app within twelve hours, the same account
   is read from the store, with no request to DE; the id, the month, the last
   place and the ticks are all still there.
5. A manifest with a newer set replaces the data in one start; a wrong hash,
   another schema or no connection leaves the current set in use, and the
   app opens normally.
6. A tagged version builds both packages and a draft release; a published
   release reaches an installed app, which installs it on close. The same tag
   builds the Store's package; installed from it, the app asks GitHub for no
   update, and Profile's Updates row reads "Through the Microsoft Store".
7. Development still reads fixtures by default; only the packaged app reads
   live without being told.
8. `pnpm check` passes, with tests for the store file, the request guard and
   the manifest.
