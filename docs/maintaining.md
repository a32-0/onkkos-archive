# Maintaining the app

A guide to the jobs that keep Onkko's Archive running, in the order they
usually come up. Each job gives its steps and links to the page with the
details.

## What you need

| What                                  | What it's for                                                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Git, Node.js 24 and pnpm              | Working on the code. The pnpm version is in `package.json` (`packageManager`); `corepack enable` installs it               |
| Write access to the GitHub repository | GitHub runs the checks, builds the installers and hosts the releases                                                       |
| The Microsoft Partner Center account  | The Store listing. Its package identity is in the Actions secrets ([`desktop.md`](desktop.md#the-microsoft-store-package)) |
| The Vercel project `onkkos-archive`   | The demo. It deploys from `main` on its own                                                                                |
| The Figma file                        | Every screen. It stays private                                                                                             |

Storybook is not published. Run it with `pnpm storybook`.

### Set up a machine once

```bash
git clone https://github.com/a32-0/onkkos-archive.git
cd onkkos-archive
pnpm install
cp.env.example.env.local
pnpm exec playwright install chromium # once, for the story tests
pnpm dev # the app on localhost:3000, with the two demo players
pnpm --dir desktop install # only if you will build or run the desktop app
```

Development never reads a real account. You test against two anonymised
players, Ordis and Cy, from `fixtures/`.

## How the work flows

1. Work on `dev`. Every push runs the checks on GitHub (`check.yml`).
2. Open a pull request from `dev` to `main` and merge it. The merge deploys
   the demo on Vercel, and `smoke.yml` checks that it answers.
3. Installed apps get new game data from `main` at their next start. A code
   change reaches them only through a
   [new version](#releasing-a-new-version-of-the-app).

Name each commit after what it changes, in one short line.

## The checks

Run them before every push. CI runs the same ones and blocks a merge that
fails any of them.

| Command                    | What it checks                                                |
| -------------------------- | ------------------------------------------------------------- |
| `pnpm check`               | Types, lint, formatting and the tests                         |
| `pnpm knip`                | No file, export or dependency left unused                     |
| `pnpm build`               | The app builds                                                |
| `pnpm weight`              | No page of the demo is too heavy for Vercel (after the build) |
| `pnpm test:stories`        | Every component renders, with accessibility checks            |
| `pnpm --dir desktop check` | The desktop app's own code and tests                          |
| `pnpm data:compat`         | Every released app on this schema still reads `data/`         |

- `pnpm data:compat` takes a few minutes: it installs each release in a
  temporary folder. CI runs it on every pull request to `main`, as the
  `data` workflow. Run it yourself when you change the shape of anything in
  `data/` (below).
- `pnpm format` fixes formatting. `pnpm lint:fix` fixes what lint can.
- `pnpm check` also checks the Markdown in `docs/`, so run it after editing a
  document too. A table whose columns no longer line up is the usual reason
  a push fails.

## After each Warframe update

The job you'll do most often: after each mainline or update, every few
weeks. Hotfixes need nothing.

1. Wait until WFCD publishes a new `@wfcd/items` that includes the update.
   It usually takes a few days.
2. Commit or stash your open work, so the update is the only change in the
   tree. Stop the dev server.
3. Run `pnpm content:update`. It updates every data source, finds what's
   new, runs the checks and writes a report to `docs/updates/`.
4. Read the report. It sorts each new thing into a level:

| Level             | What to do                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Enters on its own | Nothing                                                                                                         |
| Needs a source    | Add where it comes from to the files in `data/`, with a `cite` ([`curated-files.md`](curated-files.md))         |
| New to the app    | No screen was designed for it. Treat it as a [change to the app](#changing-a-screen-or-a-rule), or leave it out |

If many items are gone or renamed at once, the new `@wfcd/items` is
broken, not the game. Throw the update away with `git restore.` and
`git clean -fd docs/updates`, and run it again when WFCD publishes a fix.

5. Open a few new items in `pnpm dev`. A drop from an enemy shows the
   enemy's art from the wiki. If a new enemy shows its name with no art:

- The wiki has a picture of it or of its base enemy: add the file or page
  to `WIKI_ART` in `scripts/refresh-vendor-art.mjs` and run
  `pnpm data:vendor-art`.
- The wiki has none: the name alone is correct.

6. Run the checks. Commit everything the command changed, including
   `data/manifest.json` and the report. Push to `dev` and merge to `main`.

No new version is needed: installed apps download the new data at their
next start.

### When the data changes shape

Installed apps download `main`'s data at every start, whatever their
version. Data that only adds items or changes values is fine. Data that the
released code cannot read breaks those apps: a new route type, a renamed
field, a value a schema did not allow. That happened on 2026-11-02, when 1.1.0
downloaded the `weekly` routes of 1.2.0 (BR-82).

1. Run `pnpm data:compat`. It checks every released version on the current
   schema against your `data/`, and names the ones that refuse it and why
   (`items.124.routes.0.type: No matching discriminator`).
2. If one refuses it, raise `schema` in `data/manifest.json` by one, then
   run `pnpm data:manifest`. Released apps then ignore `main`'s data and
   keep the set they shipped with, until they update.
3. Release a new version soon after the merge: until then no installed app
   gets new data, and only the new version carries the new schema.

Since the version after 1.2.0, the app also checks a new set itself before
using it, and keeps its own if it cannot read it. The schema still matters:
without it, those apps never get data again until they update.

The update also checks that every wiki page a step links to exists
(`pnpm data:wiki-pages`, BR-73). If you later change how a step is titled or
linked, run that command yourself; `wiki-links.test.ts` fails until you do.

[`content-updates.md`](content-updates.md) has every detail, including
`--dry-run` and `--since`.

## Fixing a bug

1. Reproduce it with `pnpm dev` on a demo player. If it only happens with a
   real account, run the desktop app (`pnpm --dir desktop dev`). It reads
   your own account live, through the same locks a player's app uses: read
   once, don't loop.
2. Write a test in `tests/` that fails because of the bug.
3. Fix it, run the checks and push.
4. If the bug is in the installed app,
   [release a new version](#releasing-a-new-version-of-the-app) once it's
   merged.

| The bug is in…                             | Look in                                                |
| ------------------------------------------ | ------------------------------------------------------ |
| What a screen shows, its words or layout   | `src/screens/`, `src/content/`, `src/ui/`              |
| What counts as new, missing or next        | `src/domain/`                                          |
| Reading a profile, the wiki or Varzia      | `src/infra/`, and [`api.md`](api.md)                   |
| An item's source, a quest, a place         | `data/`, and [`curated-files.md`](curated-files.md)    |
| A Wiki link that opens nothing             | `pnpm data:wiki-pages`, and `tests/wiki-links.test.ts` |
| The window, the updates, the data at start | `desktop/`, and [`desktop.md`](desktop.md)             |

The layers, and the rule that keeps them apart, are in
[`development.md`](development.md#the-layers).

## Changing a screen or a rule

Every change goes in this order, so the design, the documents and the code
always agree:

1. Update the [constitution](specs/00-constitution.md) only if the change
   touches what the app is for or one of its rules. Most don't.
2. Draw the screen and each of its states in Figma. Put each frame in its
   section, at the end of its screen's row; nothing stays loose on the page.
   Pin a new rule as a comment and add it to
   [`business-rules.md`](business-rules.md).
3. Update the screen's spec in [`specs/`](specs/README.md): what it shows,
   where the data comes from, and how to check it.
4. Change the code, with tests for what the spec promises. Words go in
   `src/content/`, addresses in `src/routes.ts`, colours and sizes in the
   design tokens (`src/ui/tokens.css`), never inline.
5. Update the pages in `docs/` that describe what changed, and the README if
   a player would notice.

Rules that hold everywhere (the tests check most of them):

- The app is never wider than 600 px
  ([BR-39](business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes)).
- No comments in code. What needs explaining goes in `docs/`.
- No real account id, name or email in any file. Fixtures stay anonymised.
- Everything in the repository is written in English.

### The app's icon

1. Change the frame App icon, in the Figma file's Brand section.
2. Export it as SVG and render each size from it: the desktop's `icon.png`,
   the Store's tiles and the site's icons.
   [`desktop.md`](desktop.md#the-packages) lists every file.
3. Release a new version. Players see the new icon only after one.

## Releasing a new version of the app

### Which number to raise

Versions follow [Semantic Versioning](https://semver.org/):
`MAJOR.MINOR.PATCH`.

| Raise     | When                                                                  | Example           |
| --------- | --------------------------------------------------------------------- | ----------------- |
| **PATCH** | It only fixes things. Nothing new                                     | `1.2.0` → `1.2.1` |
| **MINOR** | It adds or changes something a player notices, and takes nothing away | `1.2.1` → `1.3.0` |
| **MAJOR** | A player loses something, or must do something to keep going          | `1.3.0` → `2.0.0` |

- Raising a number sets the ones after it to 0.
- When a version mixes kinds, the highest wins. New things plus a fix is a
  MINOR.
- For this app, MAJOR means the player has to paste their ID again or loses
  what was saved, a system stops being supported (Windows 10, say), or a
  screen or feature is removed.
- A published version never changes. A mistake in `1.2.0` is fixed in
  `1.2.1`.
- Game data has no version. Only a change to the code needs one.

### The steps

The version goes in first and the tag last. The tag goes on `main` after the
merge, never on `dev`.

1. On `dev`, raise `version` in `desktop/package.json`. Commit it with the
   version as the message (`Desktop 1.2.1`) and push `dev`.
2. Open the pull request from `dev` to `main`, wait for the checks, and merge
   it.
3. Bring the merge to your machine and tag it, `v` before the version.
   Pushing the tag starts the release.

```sh
git checkout main
git pull
git tag v1.2.1
git push origin v1.2.1
git checkout dev
```

Tag only after `git pull`: a tag on the old `main` ships the version
without the merge. To undo a wrong tag before its release is published:
`git tag -d v1.2.1` and `git push origin :refs/tags/v1.2.1`.

4. GitHub builds the Windows installer and the Linux AppImage into a draft
   release. If the tag and `desktop/package.json` disagree, it stops.
5. Open the draft, write what changed in plain words, and publish it.
   Installed apps download it in the background and install it at the next
   restart, or at once from Profile's **Restart now**.
6. Download the `microsoft-store` artifact from the same workflow run. Upload
   its `.appx` as a new submission in Partner Center. Store players get the
   version once it passes certification.
7. Install the published version over the old one and open it. Check the
   icon, the version in Profile, and that a player's data loads.

To try the package on your own machine before step 3, run
`pnpm --dir desktop stage`, then `pnpm --dir desktop package`. The installer
lands in `desktop/release/`. [`desktop.md`](desktop.md#cutting-a-version) has
the details.

To try an update or a data set without publishing anything, build a trial
app: it installs beside yours, under another name, and takes its updates
and its data from your machine.
[`desktop.md`](desktop.md#trying-a-version-before-releasing-it) has the
steps.

## How many people download it

| Where  | How                                                                                            |
| ------ | ---------------------------------------------------------------------------------------------- |
| GitHub | The releases page shows no counts. The API does: run the command below in PowerShell           |
| Store  | Partner Center, under the app's **Analytics › Acquisitions**. Numbers arrive a day or two late |

```powershell
(Invoke-RestMethod https://api.github.com/repos/a32-0/onkkos-archive/releases) | ForEach-Object { $t=$_.tag_name; $_.assets | Where-Object name -match '\.(exe|AppImage)$' | ForEach-Object { "{0}`t{1}`t{2}" -f $t,$_.download_count,$_.name } }
```

- Only the installer and the AppImage count. Installed apps fetch
  `latest.yml` and the `.blockmap` when they check for updates.
- An app that updates itself downloads the new installer too. Each count
  includes updates as well as new players, your own included.

## Keeping the tools current

Check every month or two, and after each mainline.

| Tool           | How to update it                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Packages       | `pnpm outdated` lists what's behind. Update one at a time, run every check, and read the release notes of any major jump                                           |
| Next.js        | Before changing code that depends on it, read the docs that ship with it, in `node_modules/next/dist/docs/`                                                        |
| Electron       | Update it with the other packages in `desktop/package.json`, run `pnpm --dir desktop check`, then build a package and open it. Keep its bundled Node close to CI's |
| GitHub Actions | The workflows pin each action's version. Update them when GitHub announces a deprecation                                                                           |

## What never to do

- **Never point development at DE's profile endpoint by default, and never
  scan or load-test it.** Misusing it gets the caller's address blocked from
  Warframe itself. `WF_PROFILE_SOURCE=fixture` stays the default;
  [`api.md`](api.md) explains the locks in front of it.
- **Never commit a real profile**, a token or a password. Vercel and GitHub
  hold every secret.
- **Never rehost the game's art.** The app links it from the wiki and DE.

## When something goes wrong

| What you see                                    | What to do                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `format:check` fails on GitHub                  | Run `pnpm format`, commit what it changed and push again                                               |
| A check fails on GitHub but not on your machine | Run `pnpm install --frozen-lockfile`; the lockfile may be stale                                        |
| `pnpm content:update` stops on a source         | That site is down. Wait and run it again; nothing was changed                                          |
| The manifest test fails                         | Run `pnpm data:manifest` after changing anything in `data/`                                            |
| The `data` workflow fails                       | A released app cannot read the new data. Raise the schema ([above](#when-the-data-changes-shape))      |
| `app.log` says "cannot read the new set"        | The app kept its data. Check that `data/manifest.json`'s schema was raised                             |
| A function is over the weight limit             | See [`development.md`](development.md#the-weight-of-a-function)                                        |
| Electron starts as plain Node                   | Your shell sets `ELECTRON_RUN_AS_NODE`; clear it ([`desktop.md`](desktop.md#running-it-from-the-tree)) |
| The app says DE isn't answering, for a while    | DE refused reads and the app waits thirty minutes. It recovers alone ([`api.md`](api.md#the-locks))    |
| Windows warns about the installer               | Expected: the installer isn't signed. The README tells players what to click                           |
| A player reports a problem you can't reproduce  | Ask for their `app.log` (below)                                                                        |

`app.log` holds DE's refusals and failed updates
([`desktop.md`](desktop.md#where-it-writes)):

| Installed from     | Where `app.log` is                                      |
| ------------------ | ------------------------------------------------------- |
| Windows, installer | `%APPDATA%\Onkko's Archive\app.log`                     |
| Windows, Store     | Inside the app's folder under `%LOCALAPPDATA%\Packages` |
| Linux              | `~/.config/Onkko's Archive/app.log`                     |

How the app was built, and why it is the way it is, is in
[`history/`](history/README.md).
