# Development

## Tooling

- **pnpm** is the package manager (`packageManager` in `package.json`);
  `pnpm-lock.yaml` is the only lockfile.
- **TypeScript** in strict mode with `noUncheckedIndexedAccess`.
- **ESLint** (flat config, `eslint.config.mjs`): `eslint-config-next`'s
  core-web-vitals and TypeScript presets plus `eslint-config-prettier`.
  Inline type imports are enforced; `console.log` is an error;
  `@next/next/no-img-element` is off, because the game's art is served from
  the wiki and DE's CDN as it is, never rehosted.
- **Prettier** (`.prettierrc`): 100 columns, double quotes, trailing commas.
- **Vitest** for tests, which never reach the network. Until the first test
  exists it passes with none (`passWithNoTests`); the tokens task removes the
  setting.
- **knip** finds files, exports and dependencies that nothing reaches. Its
  Vitest and Storybook plugins count tests and stories as entry points, so a
  module reached only by its tests or its stories is not dead.

```bash
pnpm typecheck
pnpm lint          # pnpm lint:fix
pnpm format:check  # pnpm format
pnpm test          # pnpm test:watch
pnpm check         # all of the above
pnpm knip
pnpm build
```

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

`eslint-plugin-boundaries` enforces it in `eslint.config.mjs`. Every import is
refused unless a policy allows it, and the last matching policy wins:

| Layer      | May import                                                       |
| ---------- | ---------------------------------------------------------------- |
| `app/`     | `app/`, `screens/`, `domain/`, `infra/`, `content/`, `routes.ts` |
| `screens/` | `screens/`, `ui/`, `content/`, `routes.ts`, and `domain/` types  |
| `ui/`      | `ui/`                                                            |
| `domain/`  | `domain/`; no Node built-in, no React, no Next, no `server-only` |
| `infra/`   | `infra/`, `domain/`                                              |
| `content/` | `content/`                                                       |
| `proxy.ts` | `infra/`, `domain/`, `routes.ts`                                 |

`ui/` takes no Next import and no `server-only` either: a component renders
in Storybook with nothing behind it. A layer's folder appears with its first
file; the rule names the paths before they exist.

## Conventions

- No comments in code, CSS, YAML or configuration. What needs explaining goes
  in `docs/`.
- No user-facing string outside `src/content/`. Templates with variables are
  functions in the same modules.
- No internal href outside `src/routes.ts`.
- Pages under `src/app/` are thin: read, call the domain, hand the result to a
  screen.
- Everything in the repository is written in English: code, tests,
  documentation, curated files. The app's own copy is a separate concern.

## Files written for coding agents

`next dev` writes `AGENTS.md` and `CLAUDE.md` at the root when it detects an AI
coding agent (`node_modules/next/dist/server/lib/generate-agent-files.js`).
Both are ignored by git, with `.claude/`, so neither enters the history by
accident.

## Environment variables

See `.env.example`. Copy it to `.env.local` for development.

- `WF_PROFILE_SOURCE` — `fixture` serves every profile from `fixtures/` and
  never reaches DE; `live` reads DE's endpoint through the locks. Development
  and previews use `fixture`; only production uses `live`
  ([plan part 4](../specs/plan/04-deployment.md#three-environments)).
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — the shared store, set
  in production only.
