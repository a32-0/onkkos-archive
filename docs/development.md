# Development

This page is for anyone who runs the project or changes it: the tools it uses,
the commands that check a change before it merges, what CI runs on every push,
how the code is split into layers, the conventions every file follows, the
two targets one build serves, and the store behind the profile's locks.

## Tooling

- pnpm is the package manager (`packageManager` in `package.json`), and
  `pnpm-lock.yaml` is the only lockfile.
- TypeScript runs in strict mode with `noUncheckedIndexedAccess`.
- ESLint uses a flat config, `eslint.config.mjs`: `eslint-config-next`'s
  core-web-vitals and TypeScript presets plus `eslint-config-prettier`. Type
  imports must be inline, and `console.log` is an error.
  `@next/next/no-img-element` is off, because the game's art is served as it
  is from the wiki and DE's CDN, never rehosted.
- Prettier (the `prettier` key in `package.json`) wraps at 100 columns, with
  double quotes and trailing commas.
- Vitest runs the tests, which never reach the network. It has two projects:
  `unit` runs `tests/` in Node, and `storybook` runs every story as a test in
  a headless Chromium. A unit run with no test file fails.
- Storybook (`@storybook/nextjs-vite`) is the catalogue of the design system.
  It loads `tokens.css` and the same three fonts as the app, from
  `src/app/fonts.ts`, and offers the widths the constitution sweeps: 360, 390,
  600, 840, 1280 and 1440. The Foundations page, `src/ui/Foundations.mdx`,
  reads `tokens.css` and `type.module.css` as text and shows every token and
  every type style, so nothing can be added to either without appearing there.
- knip finds files, exports and dependencies that nothing reaches. Its Vitest
  and Storybook plugins count tests and stories as entry points, so a module
  that only its tests or its stories use is not reported as dead.
- `pnpm typecheck` runs `next typegen` before `tsc`. `next-env.d.ts`, which
  lets TypeScript import an image, is ignored by git and written by Next, so a
  fresh clone, as in CI, has it only after `next typegen`, `next dev` or
  `next build`.

```bash
pnpm typecheck
pnpm lint          # pnpm lint:fix
pnpm format:check  # pnpm format
pnpm test          # pnpm test:watch
pnpm check         # all of the above
pnpm knip
pnpm build
pnpm palette
pnpm storybook        # the catalogue at localhost:6006
pnpm storybook:build  # into storybook-static/
pnpm test:stories     # every story in Chromium, with the accessibility checks
pnpm weight           # each route's function after a build
pnpm content:update   # after a mainline or an update (content-updates.md)
```

`pnpm content:update` is the one script written in TypeScript, because it
reads the catalog through the app's own modules. Node runs it with `tsx`
loaded through `--import`, not through its command, whose Windows shim the
command's own install rewrites while it runs; and with the `react-server`
condition so that `server-only` lets the infra modules load
outside Next.

`pnpm test:stories` needs Chromium once on a machine:
`pnpm exec playwright install chromium`. Each story is checked by axe, and a
violation fails the story; a run with no story fails too. A story turns one
rule off only where the frame itself falls below that rule, and the owner has
been told: the red label of Disconnect and the Locked rows of Step by step, drawn at
half opacity by BR-63 (`color-contrast`), and the wiki link,
which its colour and its arrow set apart from the prose with no underline
(`link-in-text-block`; the owner kept the frame on 2026-10-08), in its own
stories and wherever it closes a row's passage on Step by step. The
hover and focus stories force those states with
`storybook-addon-pseudo-states`.

`pnpm palette` measures every ink in `src/ui/tokens.css` for contrast and
against the colour blindness matrices. It reports and never fails;
[`cetus.md`](cetus.md#the-palette-is-measured) explains what it
measures and why.

## Opening the dev server from a phone

`pnpm dev -H 0.0.0.0` serves the app on the computer's address in the local
network, and a phone on the same network opens it there
(`http://192.168.x.x:3000`). Next.js blocks its development scripts for any
host but `localhost` unless the host is listed, which leaves the page drawn
but its buttons dead. `allowedDevOrigins` in `next.config.ts` lists the
private ranges, `192.168.*.*`, `10.*.*.*` and `172.*.*.*`, so no address of
anyone's machine is committed. It applies to `next dev` alone; `next start`
and production never block a host. Restart the dev server after changing it.

## Continuous integration

`.github/workflows/check.yml` runs the gates on every push and every pull
request, on GitHub's Ubuntu runner with Node 24 and the pnpm version
`packageManager` names
([plan part 4](../specs/plan/04-deployment.md#on-every-push-checkyml)). Each
step is named after the gate it runs, so a failed run shows which gate failed:

| Step      | Command                                             | Why it runs                                                    |
| --------- | --------------------------------------------------- | -------------------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`                    | The lockfile is the only source of versions; a stale one fails |
| Check     | `pnpm check`                                        | Types, lint with the layers, format and tests, as on a machine |
| Dead code | `pnpm knip`                                         | A file, export or dependency nothing reaches does not merge    |
| Chromium  | `pnpm exec playwright install --with-deps chromium` | The browser the story tests run in                             |
| Stories   | `pnpm test:stories`                                 | A story fails to render, or axe finds a violation              |
| Storybook | `pnpm storybook:build`                              | The catalogue builds, the way its Vercel project builds it     |
| App       | `pnpm build` with `WF_PROFILE_SOURCE=fixture`       | The app builds without DE, as the demo on Vercel does          |
| Weight    | `pnpm weight`                                       | No route's function carries more than 80 MB                    |

The workflow holds no secret. It reads nothing outside the repository except
the packages the lockfile names, the three fonts `next/font` downloads from
Google Fonts during both builds, and Chromium with the system libraries it
needs, which Playwright installs. Its token can only read the repository,
checkout does not keep it, and the telemetry of Next and Storybook is off.

## Releases

`.github/workflows/release.yml` runs on a `v*` tag alone and turns it into a
draft release with the Windows installer and the Linux AppImage
([plan part 4](../specs/plan/04-deployment.md#on-a-version-tag-releaseyml),
[`desktop.md`](desktop.md#cutting-a-version)). It is the one workflow that
writes to the repository, with `contents: write` and nothing else.

## After a deployment

`.github/workflows/smoke.yml` runs when Vercel reports a finished production
deployment of the demo, against that deployment's own address
([plan part 4](../specs/plan/04-deployment.md#after-a-deployment-smokeyml)):
`/connect` answers 200, the Ordis demo's profile answers 200 from
`fixtures/`, and `/system` with that demo's id stays on `/system`, which
proves the function carries `data/`. Its one secret,
`VERCEL_AUTOMATION_BYPASS_SECRET`, passes Vercel's deployment protection.

## The weight of a function

Vercel's Hobby plan takes at most 12 functions in a deployment. It bundles
the routes into as few functions as it can, and a function holds at most
250 MB, so the count stays low only while each route is light
([plan part 4](../specs/plan/04-deployment.md#checked-when-the-deployment-is-set-up)).
`pnpm weight` (`scripts/function-weight.mjs`) reads each route's trace in
`.next/server/app` after `pnpm build`, adds up the files it names, each real
file once however many links point to it, and fails when a route carries more
than 80 MB. CI runs it after the App step; on 2026-10-21 every route weighs
about 28 MB.

Three things keep it there, in `next.config.ts` and `data/vendor/`:

- The catalog is read from `data/vendor/items.json`, never from
  `@wfcd/items` (`curated-files.md`, Vendored snapshots). The package stays a
  dependency of the scripts and the tests only.
- `outputFileTracingIncludes` names `data/*.yaml`, `data/vendor/*.json` and
  `fixtures/*.json` exactly. A pattern of `./data/**/*` also brought in every
  package's own `data/` folder, `@wfcd/items` and the translations of
  `warframe-worldstate-data` among them.
- `outputFileTracingExcludes` leaves out the translations of `@wfcd/items`,
  should a route ever import the package again. Next matches it against
  POSIX paths, so it applies on Linux, in CI and on Vercel, and not in a
  build on Windows.

## The layers

`src/` holds six layers, and every import points one way
([plan part 1](../specs/plan/01-repository.md#the-layers)):

```
app ──► screens ──► ui
 │         │
 │         ▼
 ├──────► domain ◄── infra
 └──────────────────► infra
```

`eslint-plugin-boundaries` enforces this in `eslint.config.mjs`. An import is
refused unless a policy allows it, and when several policies match, the last
one wins:

| Layer      | May import                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| `app/`     | `app/`, `screens/`, `domain/`, `infra/`, `content/`, `routes.ts`, and `ui/tokens.css` |
| `screens/` | `screens/`, `ui/`, `content/`, `routes.ts`, and `domain/` types                       |
| `ui/`      | `ui/`                                                                                 |
| `domain/`  | `domain/`; no Node built-in, no React, no Next, no `server-only`                      |
| `infra/`   | `infra/`, `domain/`                                                                   |
| `content/` | `content/`                                                                            |
| `proxy.ts` | `infra/`, `domain/`, `routes.ts`                                                      |

`ui/` takes no Next import and no `server-only` either, so a component renders
in Storybook with nothing behind it. A component that navigates takes the link it renders
as a prop (`LinkComponent` in `src/ui/link.ts`): a screen passes `next/link`,
and a story leaves the plain anchor. `ui/tokens.css` is the one file of `ui/`
that `app/` imports: the root layout loads the token layer once for every
page. A layer's folder appears with its first
file, but the rule already names every path.

## Conventions

- No comments in code, CSS, YAML or configuration. Anything that needs
  explaining goes in `docs/`.
- No user-facing string outside `src/content/`. A template with variables is a
  function in the same module.
- No internal href outside `src/routes.ts`.
- Pages under `src/app/` stay thin: they read, call the domain, and hand the
  result to a screen.
- Everything in the repository is written in English: code, tests,
  documentation and curated files. The app's own copy is a separate matter.

## Files written for coding agents

`next dev` writes `AGENTS.md` and `CLAUDE.md` at the root when it detects an AI
coding agent (`node_modules/next/dist/server/lib/generate-agent-files.js`).
Git ignores both, along with `.claude/`, so neither can enter the history by
accident.

## Two targets, one build

The demo on Vercel and the app on a player's machine are the same `src/`
tree and the same Next build; variables tell them apart
([plan part 2](../specs/plan/02-architecture.md)):

| Variable            | The demo, on Vercel | The app                            | Development                 |
| ------------------- | ------------------- | ---------------------------------- | --------------------------- |
| `WF_EDITION`        | `demo`              | `app`                              | Unset: the form, as the app |
| `WF_PROFILE_SOURCE` | `fixture`           | `live`                             | `fixture` (`.env.example`)  |
| `WF_STORE_FILE`     | Unset: memory       | The store file in the app's folder | Unset: memory               |

- `WF_EDITION`: `demo` hides the id form, offers the two demos and the card
  to the download, and refuses any id but the demos'; `app` shows the app's
  version on Profile. `src/infra/edition.ts` reads it.
- `WF_PROFILE_SOURCE`: with `fixture`, every profile is served from
  `fixtures/` and DE is never reached. With `live`, DE's endpoint is read
  through the locks. Only the app reads `live`
  ([spec 13](../specs/13-desktop.md)).
- `WF_STORE_FILE`: the store file the app keeps its locks in.

The app's main process sets the app's column and three more, and nothing in
the player's hands sets any of them: `WF_LAUNCH_TOKEN`, the start's secret,
and `WF_LAUNCH_HOST`, the server's own address, which the guard checks; and
`WF_APP_VERSION`. Two more are for the build and the tree alone:
`WF_BUILD_TARGET=app`, which `pnpm --dir desktop stage` sets so
`next.config.ts` builds `standalone` with the app's cache handler, and
`WF_DATA_CHECK=1`, which makes an unpackaged app check the data manifest at
start as a packaged one does ([`desktop.md`](desktop.md)).

`.env.example` holds development's one variable; copy it to `.env.local`.
[`desktop.md`](desktop.md#running-it-from-the-tree) has `desktop/`'s
commands: `dev`, `start`, `check`, `stage`, `package` and `release`.

## The store

The profile's locks live in one store with two backends behind one interface,
`src/infra/store/`
([plan part 2](../specs/plan/02-architecture.md#the-store)). `store()` in
`index.ts` picks one on each call:

| Backend | File        | Used when                                                |
| ------- | ----------- | -------------------------------------------------------- |
| File    | `file.ts`   | `WF_STORE_FILE` is set: the app                          |
| Memory  | `memory.ts` | It is not: the demo, the tests, development              |
| None    | `index.ts`  | It is not, in a production build reading live: it throws |

Both backends are one map, `mapStore()` in `memory.ts`, so a key expires the
same way in each: a key read after its time is gone, `increment` sets the time
only when it creates the key, and a later increment leaves it.

The memory backend keeps its map on `globalThis`, so it survives the hot reload
of `pnpm dev`, which evaluates the modules again, and is lost only when the
process stops. `flush()` empties it between tests.

The file backend reads its file once, when the server opens it, dropping what
expired while the app was closed. After each change it writes the whole map to
`{file}.tmp` and renames it over the file, so a write cut short leaves the last
complete file. A missing or unreadable file starts empty. Only one server
writes it, because the app runs one at a time (spec 13).
`tests/store-file.test.ts` reads a profile, spends a budget and opens the
circuit, then opens the store again as a restart would.
