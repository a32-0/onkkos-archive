# Tasks

Step 5 of the [spec-driven order](../../docs/spec-driven-order.md): the work that
builds the public repository from the specs and the plan, cut into pieces. The
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
- **What crosses**: each file with its origin from plan part 1 (Moves,
  Reworked, Rebuilt, New), and the tests that move with each module.
- **Documents that cross**: plan part 5 has each document reworked in the task
  that moves the code it describes, so the two cross together.
- **Acceptance**: the spec's acceptance by reference, never copied, plus the
  task's own. A screen task points at its spec; the frames are in the spec.

## Branches

Set by the owner on 2026-10-08, replacing the issues, milestones and GitHub
Project planned on 2026-10-06:

- **`dev`** is where every task is committed. Each push runs `check.yml` and
  builds a Vercel preview, which reads fixtures.
- **`main`** is production. It moves once per phase: when a phase's tasks are
  done, the owner opens one pull request from `dev` to `main`, titled with the
  phase, `check.yml` runs on it, and the merge deploys production.
- A commit's subject starts with its task id (`T-04: …`), so `git log` reads
  task by task. The phase's pull request lists the tasks it carries and links
  its preview and, from T-05, its Storybook build.

## Done

A task is done when its acceptance holds, `check.yml` passes on `dev`, and the
owner has committed it. A screen task is also checked by the owner against its
frames at 390 px on the preview, and swept at 360, 600, 840, 1280 and 1440
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
| [T-11 · The data, the fixtures and the scripts that refresh them](T-11-data-and-fixtures.md)                  | 3     | 00, 11                     | T-01             |
| [T-12 · Reading a profile: id, payload, nodes, the month, the trim](T-12-profile-reading.md)                  | 3     | 02, 11                     | T-11             |
| [T-13 · The engine and quest evidence: goals, the frontier, the focus](T-13-engine.md)                        | 3     | 03, 07, 08, 10             | T-12             |
| [T-14 · Items and mastery: the catalog's base and the arsenal](T-14-items.md)                                 | 3     | 06, 07, 09                 | T-12             |
| [T-15 · Places and systems: the place index, item state, the Dojo](T-15-places.md)                            | 3     | 07                         | T-13, T-14       |
| [T-16 · The catalog: sources, relics, releases, updates, search](T-16-catalog.md)                             | 3     | 05, 06, 08, 09, 10         | T-15             |
| [T-17 · The shared store: one interface, Upstash and memory](T-17-store.md)                                   | 3     | 11                         | T-01             |
| [T-18 · The profile proxy: the read order and every lock](T-18-profile-proxy.md)                              | 3     | 11, 02                     | T-13, T-17       |
| [T-19 · Outside reads and the request: wiki, Varzia, cookies, the screen read](T-19-outside-reads.md)         | 3     | 04, 07, 09, 10             | T-16, T-18       |
| [T-20 · Screen: the shell](T-20-shell.md)                                                                     | 4     | 04                         | T-10, T-19       |
| [T-21 · Screen: Onboarding](T-21-onboarding.md)                                                               | 4     | 01                         | T-20             |
| [T-22 · Screen: Connect](T-22-connect.md)                                                                     | 4     | 02                         | T-21, T-18       |
| [T-23 · Screen: Two ways in](T-23-two-ways-in.md)                                                             | 4     | 03                         | T-22, T-13       |
| [T-24 · Screen: Resume](T-24-resume.md)                                                                       | 4     | 05                         | T-23, T-16       |
| [T-25 · Screen: the Summary](T-25-summary.md)                                                                 | 4     | 06                         | T-24             |
| [T-26 · Screen: the map](T-26-map.md)                                                                         | 4     | 07                         | T-25, T-15, T-13 |
| [T-27 · Screen: Goal](T-27-goal.md)                                                                           | 4     | 08                         | T-26             |
| [T-28 · Screen: the item and its Summary](T-28-item.md)                                                       | 4     | 09                         | T-27             |
| [T-29 · Screen: Step by step](T-29-step-by-step.md)                                                           | 4     | 10                         | T-28             |
| [T-30 · Check every deployment](T-30-smoke.md)                                                                | 4     | 00                         | T-22, T-26       |
| [T-31 · The content update command](T-31-content-update.md)                                                   | 5     | 00                         | T-16             |
| [T-32 · The README and the last documents](T-32-readme.md)                                                    | 5     | 00                         | T-29, T-31       |
| [T-33 · Production reads DE](T-33-production.md)                                                              | 5     | 11, 00                     | T-30, T-32       |

## Nothing left out, nothing out of order

Both checks ran on 2026-10-07 against the tasks as written here.

**Coverage.** Every item below has a task, read from the tasks' "What
crosses", "Documents that cross" and component lists:

| What                                                           | Count | Where                    |
| -------------------------------------------------------------- | ----- | ------------------------ |
| Components in plan part 3's table                              | 49    | T-06 to T-10             |
| Modules of `src/lib/` that plan part 1 marks Moves or Reworked | 63    | T-01, T-12 to T-19, T-29 |
| Test files that travel                                         | 27    | Beside their modules     |
| Content files that travel                                      | 13    | T-13, T-20 to T-29       |
| Documents in plan part 5's table                               | 20    | Beside their code        |
| Curated files, vendored snapshots, fixtures, scripts           | all   | T-04, T-11, T-13, T-15   |
| `pnpm content:update` and its files                            | 3     | T-31                     |

These files are touched by more than one task, each adding its part:
`package.json`, `next.config.ts`, `README.md`, `src/app/layout.tsx`,
`src/app/page.tsx`, `src/app/actions.ts`, `src/app/catch-up/page.tsx`,
`src/app/item/page.tsx`, `src/content/onboarding.ts`,
`src/content/catch-up.ts`, `.github/workflows/check.yml`,
`tests/tokens.test.ts`, `docs/development.md` and `docs/README.md`.

**Order.** Every import of every module and test that travels was read and
matched to the task that brings what it imports. No task needs a module that
a later task brings, once two kinds of import are taken out:

- **Imports the layers forbid** (28, in 20 modules): a domain module that
  imports `content/` or a file loader, or an infra module that imports
  `content/`. Plan part 1's "What a move changes" sets how each is turned
  round, and the task marks the module Reworked.
- **Imports of what stays behind**, each reworked by its task: the month's
  check in `since.ts` and `session.ts`, the lore cookie in `session.ts`, the
  quest rail's words in `catch-up.ts`, and `connectError` in `onboarding.ts`,
  which crosses with Connect (T-22). Tests that read a staying module or a
  later task's strings are marked Reworked.

What stays behind is what plan part 1 marks Stays, and nothing else.
