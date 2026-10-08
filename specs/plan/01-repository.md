# Plan · 1 · The public repository

The tree of the public repository, and where every file in it comes from. The
cut rule decides (constitution): a file travels when a spec names it, when
something a spec names depends on it, or when it records a decision that
governs future work. Everything else stays in this repository and its history.

## How a file gets there

| Origin       | Meaning                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| **Moves**    | Travels unchanged in substance; its path may change to fit the layers.        |
| **Reworked** | Travels, changed by the spec or rule named beside it.                         |
| **Rebuilt**  | Written anew from the frames. The old file is read for behaviour, not copied. |
| **New**      | Has no predecessor here.                                                      |
| **Stays**    | Does not travel. The reason is given.                                         |

No file is copied in bulk. Each one crosses on its own, in the task that needs
it, and the owner commits it (constitution).

## The layers

The constitution asks for layers that point one way. In the public repository
they are folders, and a lint rule (`eslint-plugin-boundaries`) fails any import
against the arrow:

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

## The tree

```
/
├── README.md                  New
├── LICENSE                    Moves
├── package.json               Reworked
├── pnpm-lock.yaml             New (regenerated)
├── next.config.ts             Moves
├── tsconfig.json              Moves
├── eslint.config.mjs          Reworked: layer boundaries
├── vitest.config.ts           Moves
├── knip.json                  New: no dead file or export
├── .prettierrc, .prettierignore, .editorconfig, .gitattributes   Moves
├── .gitignore                 Reworked: CLAUDE.md and .claude/ ignored
├── .env.example               Reworked: the store's variables
├── .github/workflows/         New: check.yml on every push, smoke.yml on every deployment (part 4)
├── .storybook/                New
├── specs/                     Moves: the constitution, the eleven specs, the plan and the tasks
├── docs/                      Selected and reworked (part 5)
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
    ├── proxy.ts               New: writes wf_place (part 2)
    └── routes.ts
```

## Root and configuration

| File                          | Origin   | Note                                                                                                                                                     |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                   | New      | For the two readers of the constitution; part 5                                                                                                          |
| `CLAUDE.md`                   | Stays    | The owner chose on 2026-10-06 that it does not travel. Its rules live in the constitution and the docs. A local copy for the assistant is ignored by git |
| `.claude/settings.local.json` | Stays    | Local configuration                                                                                                                                      |
| `package.json`                | Reworked | Drops Tailwind and its PostCSS plugin; adds Storybook, `@upstash/redis`, `eslint-plugin-boundaries`, `knip`                                              |
| `postcss.config.mjs`          | Stays    | Only Tailwind used it                                                                                                                                    |
| `.env.example`                | Reworked | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `WF_PROFILE_SOURCE`; no default account id (spec 02)                                               |

## What a move changes

**Moves** means a module's substance crosses unchanged. Three changes still
apply to every move, because the layers forbid what this repository allows. An
import check on 2026-10-07, run while the tasks were written, found 28 imports
in 20 modules that cross them:

- **No words in the domain or in infra.** A module that imports `content/`
  returns a typed value instead (a reason, a kind, an id), and the screen picks
  the words. `content/engine.ts` is then read by the screens, not the engine.
- **No file reads in the domain.** A domain module that calls a loader takes the
  loaded data as an argument; the loader moves to `infra/`, and the route or an
  infra function calls it.
- **No `server-only` in the domain.** It marks I/O, which the domain no longer
  does.

A module changed by these and nothing else is marked Reworked in its task, with
the reason.

## `src/app/`: routes

| Route                              | Origin   | Spec                                                                           |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `layout.tsx`                       | Rebuilt  | 04                                                                             |
| `page.tsx` (`/`)                   | Rebuilt  | 01                                                                             |
| `connect/page.tsx`                 | Rebuilt  | 02                                                                             |
| `features/page.tsx`                | Rebuilt  | 03                                                                             |
| `catch-up/page.tsx`                | Rebuilt  | 05, 06                                                                         |
| `system/page.tsx`                  | Rebuilt  | 07                                                                             |
| `goals/page.tsx`                   | Rebuilt  | 08                                                                             |
| `item/page.tsx`                    | Rebuilt  | 09, 10                                                                         |
| `actions.ts`                       | Reworked | 02, 04: connect, demo, disconnect; no `?step=start`                            |
| `api/profile/[accountId]/route.ts` | Moves    | 11                                                                             |
| `api/search/route.ts`              | Reworked | 08: places too                                                                 |
| `goal/`, `target/`                 | Stays    | BR-37: a goal opens Step by step                                               |
| every `loading.tsx`                | Stays    | No frame draws a route loading; the one drawn loading is the id form's (BR-38) |
| `globals.css`                      | Stays    | Split into `ui/tokens.css` and one module per component                        |

## `src/ui/`: the design system

All **New**, from the frames, each component with its `.module.css` and its
`.stories.tsx` beside it. Part 3 lists the tokens and every component with its
variants. The old components under `src/components/` are read for behaviour
and accessibility, and none is copied.

## `src/screens/`

All **Rebuilt**, one folder per spec: `onboarding`, `connect`, `two-ways-in`,
`shell`, `resume`, `summary`, `map`, `goals`, `item`, `steps`.

Old components with no successor, because no spec draws what they did:
`PickUp`, `RunningNow`, `GoalParameters`, `GoalProse`, `IsThisForMeGoal`,
`TargetPicker`, `CollectToggle`, the `manual/` questions, `PlanNotes`,
`PlanSteps`, `ProvenSteps`, `QuestGuideHint`, `ProfileFailure`, `Telemetry`,
`ArsenalLinks`.

## `src/domain/`

| Today                                                                         | Origin                                                                                                                                                          | Note                                                  |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `lib/catalog/*`                                                               | Moves, with `summary.ts` (BR-55, BR-56), `checks.ts` (BR-48 to BR-50), `search.ts` (places), `updates.ts` (BR-43) and `releases.ts` (no quests, BR-35) reworked | The file reads in `update-art.ts` move to `infra/`    |
| `lib/place/*`                                                                 | Moves; `schema.ts` and `tile.ts` reworked (BR-47, BR-56, BR-57)                                                                                                 | `load.ts` and `art.ts` move to `infra/`               |
| `lib/graph/` load, schema, predicates, evaluate, resolve, suggest, star-chart | Moves; `star-chart.ts` gains the focus (spec 07)                                                                                                                | `load.ts` to `infra/`                                 |
| `lib/graph/pickup.ts`, `steps.ts`                                             | Stays                                                                                                                                                           | Only Pick up and the goal plan screen used them       |
| `lib/narrative/` load, schema, chain, evidence, evidence-load, access         | Moves                                                                                                                                                           | Quest prerequisites and quest evidence (BR-28, BR-37) |
| `lib/narrative/catch-up.ts`, `place.ts`                                       | Stays, after `since` parsing moves to `domain/since.ts`                                                                                                         | The quest rail of Catch me up (BR-35)                 |
| `lib/profile/arsenal.ts`, `nodes.ts`                                          | Moves                                                                                                                                                           |                                                       |
| `lib/profile/intrinsics.ts`, `syndicates.ts`, `nightwave.ts`                  | Stays                                                                                                                                                           | Deferred goals; Nightwave (BR-35)                     |
| `lib/manual/since.ts`                                                         | Moves                                                                                                                                                           |                                                       |
| `lib/warframe/` account-id, payload, display                                  | Moves                                                                                                                                                           |                                                       |
| `lib/lore/*`, `lib/glossary/*`, `lib/goal/solve.ts`                           | Stays                                                                                                                                                           | No screen reaches them                                |
| `types/*`                                                                     | Moves                                                                                                                                                           |                                                       |

## `src/infra/`

| Today                                                | Origin                                                                 | Note                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `lib/warframe/client.ts`, `visitor.ts`               | Moves                                                                  | spec 11                                                                                      |
| `lib/warframe/cache.ts`, `budget.ts`, `circuit.ts`   | Reworked                                                               | Behind one store interface: Upstash in production, memory in tests and development (spec 11) |
| `lib/warframe/fixture-source.ts`                     | Reworked                                                               | Two demos only                                                                               |
| `lib/wiki/*`                                         | Moves; `prose.ts` reworked (BR-48: paragraphs, Mechanics for missions) | `links.ts` goes to `domain/wiki-links.ts`: it builds a URL and reads nothing                 |
| `lib/worldstate/client.ts`                           | Reworked                                                               | Varzia's stock only                                                                          |
| `lib/worldstate/rotations.ts`                        | Moves to `domain/`                                                     | Pure: the Circuit's week is computed                                                         |
| `lib/session.ts`                                     | Reworked                                                               | `wf_account`, `wf_since`, `wf_place` (BR-46); the lore cookie goes                           |
| `lib/screen.ts`                                      | Reworked                                                               | A failed read redirects to `/connect` (BR-38)                                                |
| `lib/manual/storage.ts`                              | Moves                                                                  | The ticks of spec 10, in browser storage                                                     |
| the loaders (`*/load.ts`, `update-art.ts`, `art.ts`) | Move here                                                              | Reading `data/` from disk is I/O                                                             |

## `src/content/`

| File                                                                                              | Origin                                       |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `app`, `voice`, `onboarding`, `features`, `catch-up`, `system`, `nav`, `item`, `checks`, `states` | Reworked by the spec of each screen          |
| `failures.ts`                                                                                     | Reworked into the five band messages (BR-38) |
| `goals.ts`                                                                                        | Reworked: cards and search only              |
| `engine.ts`                                                                                       | Moves (the engine's own readings)            |
| `lore`, `timeline`, `target`, `manual`, `acquisition`, `catch-up-band`                            | Stays: no screen, or unused today            |

## `data/`

| File                                                                              | Origin   | Note                                                                 |
| --------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `grafo.yaml`                                                                      | Reworked | The three deferred goals leave (`deferred.md`); "Play the Hex Quest" |
| `narrative_spine.yaml`, `quest_evidence.yaml`, `sources.yaml`, `acquisition.yaml` | Moves    |                                                                      |
| `systems.yaml`                                                                    | Reworked | BR-47's order, the Dojo (BR-57), "Soon™"                             |
| `glosario.yaml`, `lore.yaml`                                                      | Stays    | No screen renders them                                               |
| `vendor/*`                                                                        | Moves    | Each with its source and licence named (part 5)                      |

## `fixtures/`, `scripts/`, `tests/`

| File                                                                      | Origin                                                                                                                | Note                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `profile-cy.json`, `profile-ordis.json`                                   | Moves                                                                                                                 | The demos, output of `pnpm fixture`                                           |
| `profile-veteran.json`, `profile-new-player.json`                         | Moves                                                                                                                 | Synthetic test profiles                                                       |
| `profile-full.json`                                                       | Stays                                                                                                                 | The real capture (constitution)                                               |
| `scripts/*`                                                               | Moves                                                                                                                 | `palette.mjs` measures the token layer once it exists                         |
| `scripts/content-update.ts`, `data/reviewed-update.json`, `docs/updates/` | New                                                                                                                   | `pnpm content:update` ([`content-updates.md`](../../docs/content-updates.md)) |
| `tests/*`                                                                 | Move with the module each covers; `lore`, `pickup` stay; `connect-errors` and `demo-fixtures` reworked (specs 02, 11) |                                                                               |

## Checked, not trusted

The tables above are read off today's imports. Two tools keep them true in the
public repository: the boundaries rule fails a wrong import, and `knip` fails a
file or an export that nothing reaches, so a piece that should have stayed
behind cannot travel unnoticed.
