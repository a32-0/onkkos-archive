# Plan · 1 · The repository

The tree of the repository, what each part holds, and the task that builds it.
The cut rule decides what is here (constitution): a file is here when a spec
names it, when something a spec names depends on it, or when it records a
decision that governs future work.

Each file arrives in the task that needs it, and the owner commits it
(constitution).

## The layers

The constitution asks for layers that point one way. They are folders, and a
lint rule (`eslint-plugin-boundaries`) fails any import against the arrow:

```
app ──► screens ──► ui
 │         │
 │         ▼
 ├──────► domain ◄── infra
 └──────────────────► infra
```

| Layer      | Holds                                                                                                                                   | May import                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `app/`     | Routes and server actions. Read, call the domain, hand results to a screen.                                                             | screens, domain, infra, content, routes |
| `screens/` | One folder per screen of the specs: the composition of `ui/` parts for it.                                                              | ui, domain types, content, routes       |
| `ui/`      | The design system: tokens and components, each with its styles and stories.                                                             | nothing but itself                      |
| `domain/`  | Plain TypeScript: profile reading, the catalog, places, the rules engine, plans. No React, no Next, no I/O.                             | nothing but itself                      |
| `infra/`   | Everything that touches the outside: DE's endpoint, the shared store, the wiki, the worldstate, cookies, and reading `data/` from disk. | domain                                  |
| `content/` | Every user-facing string.                                                                                                               | nothing                                 |

`ui/` never imports `domain/`: a component takes plain props, so it renders in
Storybook with no profile behind it.

## What the layers forbid

Three rules hold in every module, and the boundaries rule and the tests check
them:

- **No words in the domain or in infra.** A module returns a typed value (a
  reason, a kind, an id), and the screen picks the words. `content/engine.ts`
  is read by the screens, not the engine.
- **No file reads in the domain.** A domain function takes its data as an
  argument; the loader lives in `infra/`, and the route or an infra function
  calls it.
- **No `server-only` in the domain.** It marks I/O, which the domain never
  does.

## The tree

```
/
├── README.md                  The two readers of the constitution (part 5)
├── LICENSE                    MIT
├── package.json, pnpm-lock.yaml  With the Prettier options
├── next.config.ts, tsconfig.json, vitest.config.ts
├── eslint.config.mjs          The layer boundaries
├── .prettierignore, .editorconfig, .gitattributes
├── .gitignore                 CLAUDE.md and .claude/ ignored
├── .env.example               The store's variables and the profile source
├── .github/workflows/         check.yml on every push, smoke.yml on every deployment (part 4)
├── .storybook/
├── specs/                     The constitution, the eleven specs, the plan and the tasks
├── docs/                      The documents of part 5
├── data/                      Curated files and vendored snapshots
├── fixtures/                  The two demos and the synthetic test profiles
├── scripts/                   Data refreshes, the fixture cutter, the palette
├── tests/                     Domain and infra tests
└── src/
    ├── app/
    ├── screens/
    ├── ui/
    ├── domain/
    ├── infra/
    ├── content/
    ├── proxy.ts               Writes wf_place (part 2)
    └── routes.ts
```

## Root and configuration

| File           | Holds                                                                                                      | Task       |
| -------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| `README.md`    | For the two readers of the constitution; part 5                                                            | T-01, T-32 |
| `package.json` | Next, React, Storybook, `@upstash/redis`, `eslint-plugin-boundaries`, `knip`                               | T-01       |
| `.env.example` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `WF_PROFILE_SOURCE`; no default account id (spec 02) | T-01       |

`CLAUDE.md` and `.claude/` are local to the assistant and never committed. The
rules they would carry are in the constitution and the docs.

## `src/app/`: routes

| Route                                                                                                                                    | Spec       | Task                   |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------- |
| `layout.tsx`                                                                                                                             | 04         | T-20                   |
| `page.tsx` (`/`)                                                                                                                         | 01         | T-21                   |
| `connect/page.tsx`                                                                                                                       | 02         | T-22                   |
| `features/page.tsx`                                                                                                                      | 03         | T-23                   |
| `catch-up/page.tsx`                                                                                                                      | 05, 06     | T-24, T-25             |
| `system/page.tsx`                                                                                                                        | 07         | T-26                   |
| `goals/page.tsx`                                                                                                                         | 08         | T-27                   |
| `item/page.tsx`                                                                                                                          | 09, 10     | T-28, T-29             |
| `actions.ts`: connect, demo, disconnect, resume (`wf_since`)                                                                             | 02, 04, 05 | T-20, T-22, T-24       |
| `screen.ts`: a failed read redirects to `/connect`; the player the shell shows; where a read leads (BR-03); Start here's address (BR-40) | 02, 03, 04 | T-19, T-20, T-22, T-23 |
| `api/profile/[accountId]/route.ts`                                                                                                       | 11         | T-18                   |
| `api/search/route.ts`: items, collectibles and places                                                                                    | 08         | T-27                   |

No route has a `loading.tsx`: no frame draws a route loading, and the one
loading drawn is the id form's (BR-38). A goal opens Step by step, so there is
no goal route (BR-37).

## `src/ui/`: the design system

Built from the frames, each component with its `.module.css` and its
`.stories.tsx` beside it. Part 3 lists the tokens and every component with its
variants (T-04 to T-10b).

## `src/screens/`

One folder per spec, built from the frames: `onboarding`, `connect`,
`two-ways-in`, `shell`, `resume`, `summary`, `map`, `goals`, `item`, `steps`
(T-20 to T-29).

## `src/domain/`

| Folder or file  | Holds                                                                                                                                                            | Task             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `profile/`      | The account id, the payload, the display name, nodes, the field list, the trim, the arsenal                                                                      | T-12, T-14       |
| `since.ts`      | The month a player last played                                                                                                                                   | T-12             |
| `types/`        | The profile, the plan with its reasons as values, the `next` parameter                                                                                           | T-12, T-13, T-22 |
| `graph/`        | The goal graph: schema, predicates, evaluation, suggestion, the frontier and the focus                                                                           | T-13             |
| `narrative/`    | Quest prerequisites and quest evidence (BR-28, BR-37); the chain                                                                                                 | T-13, T-16       |
| `catalog/`      | Items, mastery, odds, the dossier; the wiki modules' shapes, the catalog's data as one value; sources, relics, releases, updates, the Summary, checks and search | T-14, T-16       |
| `place/`        | The place index, item state, tiles, the Dojo, reach (BR-59), Start here (BR-44)                                                                                  | T-15, T-23       |
| `wiki-links.ts` | A wiki URL from a name; it reads nothing                                                                                                                         | T-16             |

## `src/infra/`

| Folder or file                   | Holds                                                                                                          | Task       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- |
| `catalog/`                       | The read of `@wfcd/items`, of `sources.yaml` and of the update art; the catalog's data, read once              | T-14, T-16 |
| `graph/`, `narrative/`, `place/` | The loaders of `data/`                                                                                         | T-13, T-15 |
| `store/`                         | One store interface: Upstash in production, memory in tests and development (spec 11)                          | T-17       |
| `profile/`                       | DE's client, the fixture source (two demos), the visitor, the cache, the budget, the circuit, the read         | T-18       |
| `wiki/`                          | The vendored modules, the wiki's client and its prose (BR-48)                                                  | T-16, T-19 |
| `worldstate/`                    | Varzia's stock                                                                                                 | T-19       |
| `session.ts`                     | `wf_account`, `wf_since`, `wf_place` (BR-46)                                                                   | T-19       |
| `screen.ts`                      | The screen read: the profile and its readings, or a failed read's reason and retry time (BR-38); the next read | T-19, T-20 |
| `ticks.ts`                       | The ticks of spec 10, in browser storage                                                                       | T-29       |

## `src/content/`

Every user-facing string, one file per screen or concern, each written by the
task that builds what speaks it. `failures.ts` holds the five band messages
(BR-38), `engine.ts` the words of the engine's values, read by the map (T-26),
and `goals.ts` the cards and the search.

## `data/`

| File                                                                              | Holds                                                                        | Task             |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| `grafo.yaml`                                                                      | The goals and their checks; the deferred goals are not in it (`deferred.md`) | T-13             |
| `narrative_spine.yaml`, `quest_evidence.yaml`, `sources.yaml`, `acquisition.yaml` | The spine, quest evidence, sources and placed acquisition                    | T-11, T-13, T-15 |
| `systems.yaml`                                                                    | BR-47's order, the Dojo (BR-57), "Soon™", the places' aliases                | T-11, T-15       |
| `vendor/*`                                                                        | Snapshots, each with its source and licence named (part 5)                   | T-11             |

## `fixtures/`, `scripts/`, `tests/`

| File                                                                      | Holds                                                                                                                | Task             |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `profile-cy.json`, `profile-ordis.json`                                   | The demos, output of `pnpm fixture`                                                                                  | T-11             |
| `profile-veteran.json`, `profile-new-player.json`                         | Synthetic test profiles                                                                                              | T-11             |
| `scripts/*`                                                               | `palette.mjs` measures the token layer; `trim-profile.mjs` takes `--from` with no default and imports the field list | T-04, T-11, T-12 |
| `scripts/content-update.ts`, `data/reviewed-update.json`, `docs/updates/` | `pnpm content:update` ([`content-updates.md`](../../docs/content-updates.md))                                        | T-31             |
| `tests/*`                                                                 | One file per domain or infra module, written with it                                                                 | Each task        |

No real capture is ever committed (constitution).

## Checked, not trusted

Two tools keep this tree true: the boundaries rule fails a wrong import, and
`knip` fails a file or an export that nothing reaches, so nothing the cut rule
would keep out can sit here unnoticed.
