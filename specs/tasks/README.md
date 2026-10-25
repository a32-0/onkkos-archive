# Tasks

Step 5 of the [spec-driven order](../../docs/spec-driven-order.md): the work that
builds the repository from the specs and the plan, cut into pieces. The
constitution sets the first one, the scaffold; the rest follow the plan's phases
([plan part 6](../plan/06-roadmap.md)).

## What a task carries

Every task file has the same parts, so a later session builds from it without
asking the owner to restate a decision:

- **Phase**: the phase of plan part 6 it belongs to.
- **Serves**: the specs, the plan parts and the business rules it builds.
- **Waits on**: earlier tasks only. No task waits on a later one.
- **The owner**: what only the owner does (accounts, projects, secrets,
  settings, reviews against Figma). Claude never does these.
- **What it builds**: each file, with what it holds, and the tests written
  with each module.
- **Documents**: plan part 5 has each document written in the task that
  builds the code it describes, so the two match.
- **Acceptance**: the spec's acceptance by reference, never copied, plus the
  task's own. A screen task points at its spec; the frames are in the spec.

## Branches

Set by the owner on 2026-10-08, replacing the issues, milestones and GitHub
Project planned on 2026-10-06:

- **`dev`** is where every task is committed. Each push runs `check.yml`;
  Vercel builds no preview, as the owner chose on 2026-10-08 (plan part 4).
- **`main`** is production. It moves once per phase: when a phase's tasks are
  done, the owner opens one pull request from `dev` to `main`, titled with the
  phase, `check.yml` runs on it, and the merge deploys production and the
  Storybook build, then `smoke.yml` checks the deployment.
- A commit's subject starts with its task id (`T-04: …`), so `git log` reads
  task by task. The phase's pull request lists the tasks it carries.

## Done

A task is done when its acceptance holds, `check.yml` passes on `dev`, and the
owner has committed it. A screen task is also checked by the owner against its
frames at 390 px on their machine (`pnpm build`, then `pnpm start`), and swept
at 360, 600, 840, 1280 and 1440
(constitution, "The gates"). A phase is done when its pull request is merged
into `main`.

## The tasks

| Task                                                                                                          | Phase | Serves                     | Waits on         |
| ------------------------------------------------------------------------------------------------------------- | ----- | -------------------------- | ---------------- |
| [T-01 · Scaffold the repository](T-01-scaffold.md)                                                            | 1     | 00                         | —                |
| [T-02 · Run the gates on every push](T-02-ci.md)                                                              | 1     | 00                         | T-01             |
| [T-02b · Write for the people who read it](T-02b-humanise.md)                                                 | 1     | 00                         | T-02             |
| [T-03 · Deploy the app on Vercel](T-03-vercel-app.md)                                                         | 1     | 00                         | T-02             |
| [T-04 · Tokens and type](T-04-tokens.md)                                                                      | 2     | 00                         | T-01             |
| [T-05 · Storybook and the Foundations page](T-05-storybook.md)                                                | 2     | 00                         | T-04, T-02       |
| [T-06 · Atoms: icon, badge, button, checkbox, wordmark, Onkko's line, wiki link](T-06-atoms.md)               | 2     | 01, 02, 04, 05, 07, 09, 10 | T-05             |
| [T-07 · Fields and chrome: field, search, segmented, tabs, header, sheet, menus](T-07-fields-and-chrome.md)   | 2     | 02, 04, 05, 07, 08, 09     | T-06             |
| [T-08 · Cards: choice, search, update, featured, error band, loading, empty state](T-08-cards.md)             | 2     | 02, 03, 05, 06, 07, 08     | T-07             |
| [T-09 · Lists and the map's parts: groups, tiles, place card, rows, suggestions](T-09-lists-and-map-parts.md) | 2     | 05, 06, 07, 08             | T-08             |
| [T-10 · The item's parts: hero, crumb, Summary rows, sections, the timeline](T-10-item-parts.md)              | 2     | 09, 10                     | T-09             |
| [T-10b · The reach states: More line, Beyond reach, Locked](T-10b-reach-states.md)                            | 2     | 06, 07, 08, 10             | T-10             |
| [T-11 · The data, the fixtures and the scripts that refresh them](T-11-data-and-fixtures.md)                  | 3     | 00, 11                     | T-01             |
| [T-12 · Reading a profile: id, payload, nodes, the month, the trim](T-12-profile-reading.md)                  | 3     | 02, 11                     | T-11             |
| [T-13 · The engine and quest evidence: goals, the frontier, the focus](T-13-engine.md)                        | 3     | 03, 07, 08, 10             | T-12             |
| [T-14 · Items and mastery: the catalog's base and the arsenal](T-14-items.md)                                 | 3     | 06, 07, 09                 | T-12             |
| [T-15 · Places and systems: the place index, item state, the Dojo](T-15-places.md)                            | 3     | 07                         | T-13, T-14       |
| [T-15b · The specs speak of this repository alone](T-15b-one-repository.md)                                   | 3     | 00                         | T-15             |
| [T-16 · The catalog: sources, relics, releases, updates, search](T-16-catalog.md)                             | 3     | 05, 06, 08, 09, 10         | T-15             |
| [T-17 · The shared store: one interface, Upstash and memory](T-17-store.md)                                   | 3     | 11                         | T-01             |
| [T-18 · The profile proxy: the read order and every lock](T-18-profile-proxy.md)                              | 3     | 11, 02                     | T-13, T-17       |
| [T-19 · Outside reads and the request: wiki, Varzia, cookies, the screen read](T-19-outside-reads.md)         | 3     | 04, 07, 09, 10             | T-16, T-18       |
| [T-20 · Screen: the shell](T-20-shell.md)                                                                     | 4     | 04                         | T-10b, T-19      |
| [T-21 · Screen: Onboarding](T-21-onboarding.md)                                                               | 4     | 01                         | T-20             |
| [T-22 · Screen: Connect](T-22-connect.md)                                                                     | 4     | 02                         | T-21, T-18       |
| [T-23 · Screen: Two ways in](T-23-two-ways-in.md)                                                             | 4     | 03                         | T-22, T-13       |
| [T-24 · Screen: Resume](T-24-resume.md)                                                                       | 4     | 05                         | T-23, T-16       |
| [T-25 · Screen: the Summary](T-25-summary.md)                                                                 | 4     | 06                         | T-24             |
| [T-26 · Screen: the map](T-26-map.md)                                                                         | 4     | 07                         | T-25, T-15, T-13 |
| [T-27 · Screen: Goal](T-27-goal.md)                                                                           | 4     | 08                         | T-26             |
| [T-27b · The Material pass](T-27b-material-pass.md)                                                           | 4     | 04 to 10                   | T-27             |
| [T-27c · The Material pass in code](T-27c-material-code.md)                                                   | 4     | 02, 04 to 10               | T-27b            |
| [T-28 · Screen: the item and its Summary](T-28-item.md)                                                       | 4     | 09                         | T-27c            |
| [T-29 · Screen: Step by step](T-29-step-by-step.md)                                                           | 4     | 10                         | T-28             |
| [T-30 · Check every deployment](T-30-smoke.md)                                                                | 4     | 00                         | T-22, T-26       |
| [T-31 · The content update command](T-31-content-update.md)                                                   | 5     | 00                         | T-16             |
| [T-32 · The README and the last documents](T-32-readme.md)                                                    | 5     | 00                         | T-29, T-31       |
| [T-33 · Production reads DE](T-33-production.md)                                                              | 5     | 11, 00                     | T-30, T-32       |
| [T-34 · Screen: Advanced search](T-34-advanced-search.md)                                                     | 5     | 12, 08                     | T-27, T-29       |
| [T-35 · The store on disk, and Upstash removed](T-35-store-on-disk.md)                                        | 6     | 11, 13                     | T-33             |
| [T-36 · The window: Electron, the server inside it, the guard](T-36-window.md)                                | 6     | 13, 00                     | T-35             |
| [T-37 · The data at each start](T-37-data-at-start.md)                                                        | 6     | 13, 00                     | T-36             |
| [T-38 · Installers, releases and updates](T-38-releases.md)                                                   | 6     | 13                         | T-37             |
| [T-39 · The demo reads no account](T-39-demo-edition.md)                                                      | 6     | 02, 11                     | T-33             |
| [T-40 · The platform glyph in a display name](T-40-platform-glyph.md)                                         | 6     | 04, 11                     | T-35             |
| [T-41 · The README and the documents for the app](T-41-documents.md)                                          | 6     | 00, 13                     | T-38, T-42       |
| [T-42 · The way from the demo to the app](T-42-download-card.md)                                              | 6     | 02, 13                     | T-38, T-39       |
| [T-43 · What the first installed release showed](T-43-first-fixes.md)                                         | 6     | 04, 09, 12, 13             | T-38             |
| [T-44 · The quill that writes while it loads](T-44-quill-loading.md)                                          | 6     | 02, 13                     | T-43             |
| [T-45 · A first tour](T-45-tour.md)                                                                           | 6     | 04                         | T-43             |
| [T-46 · Three inks, and Figma bound to its variables](T-46-three-inks.md)                                     | 6     | plan 3                     | T-43             |

## Nothing left out, nothing out of order

Both checks ran on 2026-10-07 against the tasks as written here.

**Coverage.** Every item below has a task, read from the tasks' "What it
builds", "Documents" and component lists:

| What                                                 | Count | Where                  |
| ---------------------------------------------------- | ----- | ---------------------- |
| Components in plan part 3's table                    | 50    | T-06 to T-10b          |
| Domain and infra modules in plan part 1              | all   | T-12 to T-19, T-29     |
| Content files                                        | 13    | T-13, T-20 to T-29     |
| Documents in plan part 5's table                     | 20    | Beside their code      |
| Curated files, vendored snapshots, fixtures, scripts | all   | T-04, T-11, T-13, T-15 |
| `pnpm content:update` and its files                  | 3     | T-31                   |

These files are touched by more than one task, each adding its part:
`package.json`, `next.config.ts`, `README.md`, `src/app/layout.tsx`,
`src/app/page.tsx`, `src/app/actions.ts`, `src/app/catch-up/page.tsx`,
`src/app/item/page.tsx`, `src/content/onboarding.ts`,
`src/content/catch-up.ts`, `.github/workflows/check.yml`,
`tests/tokens.test.ts`, `tests/language.test.ts`, `eslint.config.mjs`,
`docs/development.md` and `docs/README.md`.

**Order.** Every module's imports were matched to the task that brings what
they import, and no task needs a module that a later task brings. Where a
module would import across the layers, plan part 1's "What the layers forbid"
sets how it is turned round: a typed value instead of words, data handed in
instead of a file read.
