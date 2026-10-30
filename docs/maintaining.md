# Maintaining the app

This page is for whoever keeps Onkko's Archive running after it was built,
with no one from the build to ask. It covers the jobs that come up, in the
order they usually do: setting up a machine, bringing in a Warframe update,
fixing a bug, changing a screen, releasing a version, and keeping the tools
current. Each job lists its steps and links to the page with the details.

## What you need

- A computer with Git, Node.js 24 and pnpm. The pnpm version is the one in
  `package.json` (`packageManager`); `corepack enable` installs it for you.
- Write access to the GitHub repository. GitHub runs the checks, builds the
  installers and hosts the releases.
- The Microsoft Partner Center account that holds the app's Store listing.
  Its package identity is kept in the repository's Actions secrets
  ([`desktop.md`](desktop.md#the-microsoft-store-package)).
- The Vercel project `onkkos-archive`, which serves the demo. It deploys from
  `main` on its own. The design system's Storybook is not published; run it
  with `pnpm storybook`.
- The Figma file, which holds every screen. It stays private.

Set up a machine once:

```bash
git clone https://github.com/a32-0/onkkos-archive.git
cd onkkos-archive
pnpm install
cp .env.example .env.local
pnpm exec playwright install chromium   # once, for the story tests
pnpm dev                     # the app on localhost:3000, with the two demo players
pnpm --dir desktop install   # only if you will build or run the desktop app
```

Development never reads a real account. It runs on two anonymised players,
Ordis and Cy, from `fixtures/`, and that is what you test against.

## How the work flows

1. Work on the `dev` branch. Every push runs the checks on GitHub
   (`check.yml`).
2. When a change is ready, open a pull request from `dev` to `main` and merge
   it. The merge deploys the demo on Vercel, and
   `smoke.yml` checks the demo answers.
3. Installed apps pick up new game data from `main` at their next start. A
   change to the code reaches them only through a new version (below).

Name each commit after what it changes, in one short line.

## The checks

Run these before every push. CI runs the same ones and blocks a merge that
fails any of them.

| Command                    | What it checks                                                |
| -------------------------- | ------------------------------------------------------------- |
| `pnpm check`               | Types, lint, formatting and the tests                         |
| `pnpm knip`                | No file, export or dependency left unused                     |
| `pnpm build`               | The app builds                                                |
| `pnpm weight`              | No page of the demo is too heavy for Vercel (after the build) |
| `pnpm test:stories`        | Every component renders, with accessibility checks            |
| `pnpm --dir desktop check` | The desktop app's own code and tests                          |

`pnpm format` fixes formatting; `pnpm lint:fix` fixes what lint can.
`pnpm check` also checks the formatting of the Markdown in `docs/`, so run it
after editing a document too, not only after code. A table whose columns no
longer line up is the usual reason a push fails.

## After each Warframe update

This is the job you'll do most often. DE ships a mainline or an update every
few weeks; hotfixes don't need anything.

1. Wait a few days after the update, until WFCD publishes a new
   `@wfcd/items` that includes it.
2. Commit or stash anything you have open, so the update is the only change
   in the tree. Stop the dev server, then run `pnpm content:update`. It
   updates every data source, finds what's new, runs the checks and writes a
   report to `docs/updates/`.
3. Read the report. It sorts each new thing into one of three levels:
   - What enters on its own needs nothing from you.
   - What needs a source gets one: add where it comes from to the files in
     `data/`, with a `cite`, as [`curated-files.md`](curated-files.md)
     explains.
   - What is new to the app is a kind of thing no screen was designed for.
     Treat it as a change to the app (below), or leave it out.

   If the report shows many items gone or renamed at once, the new
   `@wfcd/items` is broken, not the game. Throw the update away with
   `git restore .` and `git clean -fd docs/updates`, and run it again when
   WFCD publishes a fix.

4. Look at a few new items in `pnpm dev`. A drop from an enemy wears the
   enemy's art from its wiki page. When a new enemy shows its name with no
   art, search the wiki for it: if a picture of it (or of its base enemy)
   exists, add its file or page to `WIKI_ART` in
   `scripts/refresh-vendor-art.mjs` and run `pnpm data:vendor-art`. If the
   wiki has none, its name alone is correct.
5. Run the checks, commit everything the command changed (including
   `data/manifest.json` and the report), push to `dev` and merge to `main`.

Installed apps download the new data at their next start. No new version is
needed. [`content-updates.md`](content-updates.md) has every detail, including
`--dry-run` and `--since`.

## Fixing a bug

1. Reproduce it with `pnpm dev` on a demo player. If it only happens with a
   real account, run the desktop app (`pnpm --dir desktop dev`). It reads
   your own account live, through the same locks a player's app uses, so
   read it once and don't loop.
2. Write a test in `tests/` that fails because of the bug.
3. Fix it, run the checks, and push.
4. If the bug is in the installed app, release a new version once it's merged.

Where to look:

| The bug is in…                             | Look in                                             |
| ------------------------------------------ | --------------------------------------------------- |
| What a screen shows, its words or layout   | `src/screens/`, `src/content/`, `src/ui/`           |
| What counts as new, missing or next        | `src/domain/`                                       |
| Reading a profile, the wiki or Varzia      | `src/infra/`, and [`api.md`](api.md)                |
| An item's source, a quest, a place         | `data/`, and [`curated-files.md`](curated-files.md) |
| The window, the updates, the data at start | `desktop/`, and [`desktop.md`](desktop.md)          |

The layers and the rule that keeps them apart are in
[`development.md`](development.md#the-layers).

## Changing a screen or a rule

Every change goes in the same direction, so the design, the documents and the
code never disagree:

1. Update the [constitution](specs/00-constitution.md) only if the change
   touches what the app is for or one of its rules. Most changes don't.
2. Draw the change in the Figma file first: the screen and each of its
   states. Put each frame in its section, at the end of its screen's row;
   nothing stays loose on the page. If it sets a new rule, pin it as a
   comment and add it to [`business-rules.md`](business-rules.md).
3. Update the screen's spec in [`specs/`](specs/README.md): what it shows,
   where the data comes from, and how to check it.
4. Change the code, with tests for what the spec promises. Words go in
   `src/content/`, addresses in `src/routes.ts`, colours and sizes in the
   design tokens (`src/ui/tokens.css`), never inline.
5. Update the pages in `docs/` that describe what changed, and the README if
   a player would notice.

A few rules hold everywhere, and the tests check most of them:

- The app is never wider than 600 px
  ([BR-39](business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes)).
- No comments in code. What needs explaining goes in `docs/`.
- No real account id, name or email in any file. Fixtures stay anonymised.
- Everything in the repository is written in English.

### The app's icon

The icon is the frame App icon in the Figma file's Brand section. Change it
there first, then export it as SVG and render each size from it: the
desktop's `icon.png`, the Store's tiles and the site's icons.
[`desktop.md`](desktop.md#the-packages) lists every file. Players see a
new icon on the desktop only after a new version.

## Releasing a new version of the app

The order matters: the version goes in first, the tag last, and the tag
goes on `main` after the merge, never on `dev`.

1. On `dev`, raise `version` in `desktop/package.json`, usually its last
   number (`0.1.3` to `0.1.4`). Commit it with the version as the message
   (`Desktop 0.1.4`) and push `dev`.
2. Open the pull request from `dev` to `main`, wait for the checks, and
   merge it.
3. Bring the merge to your machine and tag it, `v` before the version:

   ```sh
   git checkout main
   git pull
   git tag v0.1.4
   git push origin v0.1.4
   git checkout dev
   ```

   Pushing the tag is what starts the release. A tag made before
   `git pull` lands on the old `main`, and the version ships without the
   merge. To undo a wrong tag before its release is published:
   `git tag -d v0.1.4` and `git push origin :refs/tags/v0.1.4`.

4. GitHub builds the Windows installer and the Linux AppImage into a draft
   release. If the tag and `desktop/package.json` disagree, it stops.
5. Open the draft, write what changed in plain words, and publish it.
   Installed apps download it in the background and install it at the next
   restart, or at once from Profile's **Restart now**.
6. Download the `microsoft-store` artifact from the same workflow run and
   upload its `.appx` as a new submission in Partner Center. Players who
   installed from the Microsoft Store get the version once it passes
   certification.
7. Install the published version over the old one and open it: check the
   icon, the version in Profile, and that a player's data loads.

Before step 3 you can try the package on your own machine:
`pnpm --dir desktop stage`, then `pnpm --dir desktop package`. The installer
lands in `desktop/release/`. [`desktop.md`](desktop.md#cutting-a-version) has
the details.

## Keeping the tools current

Check every month or two, and after each mainline:

- `pnpm outdated` lists what's behind. Update one thing at a time, run every
  check, and read the release notes of anything that jumps a major version.
- **Next.js**: before changing code that depends on it, read the docs that
  ship with it, in `node_modules/next/dist/docs/`. They match the installed
  version.
- **Electron** (`desktop/package.json`): update it with the other desktop
  packages, run `pnpm --dir desktop check`, then build a package and open it
  before releasing. Keep the Node version it bundles close to the one CI uses.
- **GitHub Actions**: the workflows pin each action's version. Update them
  when GitHub announces a deprecation.

## What never to do

- **Never point development at DE's profile endpoint by default, and never
  scan or load-test it.** Misusing it gets the caller's address blocked from
  Warframe itself. `WF_PROFILE_SOURCE=fixture` stays the default;
  [`api.md`](api.md) explains the locks in front of it.
- **Never commit a real profile**, a token or a password. Vercel and GitHub
  hold every secret.
- **Never rehost the game's art.** The app links it from the wiki and DE.

## When something goes wrong

| What you see                                    | What to do                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format:check` fails on GitHub                  | Run `pnpm format`, commit what it changed and push again                                                                                                                                                                                                                         |
| A check fails on GitHub but not on your machine | Run `pnpm install --frozen-lockfile`; the lockfile may be stale                                                                                                                                                                                                                  |
| `pnpm content:update` stops on a source         | That site is down. Wait and run it again; nothing was changed                                                                                                                                                                                                                    |
| The manifest test fails                         | Run `pnpm data:manifest` after changing anything in `data/`                                                                                                                                                                                                                      |
| A function is over the weight limit             | See [`development.md`](development.md#the-weight-of-a-function)                                                                                                                                                                                                                  |
| Electron starts as plain Node                   | Your shell sets `ELECTRON_RUN_AS_NODE`; clear it ([`desktop.md`](desktop.md#running-it-from-the-tree))                                                                                                                                                                           |
| The app says DE isn't answering, for a while    | DE refused reads and the app is waiting thirty minutes; it recovers alone ([`api.md`](api.md#the-locks))                                                                                                                                                                         |
| Windows warns about the installer               | Expected: the installer isn't signed. The README tells players what to click                                                                                                                                                                                                     |
| A player reports a problem you can't reproduce  | Ask for `app.log`: `%APPDATA%\Onkko's Archive\app.log` on Windows, inside the app's folder under `%LOCALAPPDATA%\Packages` from the Store, `~/.config/Onkko's Archive/app.log` on Linux. DE's refusals and failed updates are there ([`desktop.md`](desktop.md#where-it-writes)) |

## What could come next

- **Spanish.** The Language setting is drawn but disabled until the app's
  words are translated (`src/content/`).
- **Android.** The app can't run its server on a phone. It needs each page to
  load its data without one first; that is a design of its own
  ([`specs/13-desktop.md`](specs/13-desktop.md)).
- **What was set aside**, with how to bring it back, is in
  [`deferred.md`](deferred.md).

How the app was built, and why it is the way it is, is in
[`history/`](history/README.md).
