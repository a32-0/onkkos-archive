# Development

This page is for anyone who runs the project or changes it: the tools it uses,
the commands that check a change before it merges, what CI runs on every push,
how the code is split into layers, and the conventions every file follows.

## Tooling

- pnpm is the package manager (`packageManager` in `package.json`), and
  `pnpm-lock.yaml` is the only lockfile.
- TypeScript runs in strict mode with `noUncheckedIndexedAccess`.
- ESLint uses a flat config, `eslint.config.mjs`: `eslint-config-next`'s
  core-web-vitals and TypeScript presets plus `eslint-config-prettier`. Type
  imports must be inline, and `console.log` is an error.
  `@next/next/no-img-element` is off, because the game's art is served as it
  is from the wiki and DE's CDN, never rehosted.
- Prettier (`.prettierrc`) wraps at 100 columns, with double quotes and
  trailing commas.
- Vitest runs the tests, which never reach the network. Until the first test
  exists it passes with none (`passWithNoTests`); the tokens task removes that
  setting.
- knip finds files, exports and dependencies that nothing reaches. Its Vitest
  and Storybook plugins count tests and stories as entry points, so a module
  that only its tests or its stories use is not reported as dead.

```bash
pnpm typecheck
pnpm lint          # pnpm lint:fix
pnpm format:check  # pnpm format
pnpm test          # pnpm test:watch
pnpm check         # all of the above
pnpm knip
pnpm build
```

## Continuous integration

`.github/workflows/check.yml` runs the gates on every push and every pull
request, on GitHub's Ubuntu runner with Node 24 and the pnpm version
`packageManager` names
([plan part 4](../specs/plan/04-deployment.md#on-every-push-checkyml)). Each
step is named after the gate it runs, so a failed run shows which gate failed:

| Step      | Command                                       | Why it runs                                                    |
| --------- | --------------------------------------------- | -------------------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`              | The lockfile is the only source of versions; a stale one fails |
| Check     | `pnpm check`                                  | Types, lint with the layers, format and tests, as on a machine |
| Dead code | `pnpm knip`                                   | A file, export or dependency nothing reaches does not merge    |
| App       | `pnpm build` with `WF_PROFILE_SOURCE=fixture` | The app builds without DE, the way every preview runs          |

The workflow holds no secret. Apart from the packages the lockfile names, it
reads nothing outside the repository. Its token can only read the repository,
checkout does not keep it, and Next's telemetry is off. The Storybook steps
are added with Storybook itself (T-05).

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

| Layer      | May import                                                       |
| ---------- | ---------------------------------------------------------------- |
| `app/`     | `app/`, `screens/`, `domain/`, `infra/`, `content/`, `routes.ts` |
| `screens/` | `screens/`, `ui/`, `content/`, `routes.ts`, and `domain/` types  |
| `ui/`      | `ui/`                                                            |
| `domain/`  | `domain/`; no Node built-in, no React, no Next, no `server-only` |
| `infra/`   | `infra/`, `domain/`                                              |
| `content/` | `content/`                                                       |
| `proxy.ts` | `infra/`, `domain/`, `routes.ts`                                 |

`ui/` takes no Next import and no `server-only` either, so a component renders
in Storybook with nothing behind it. A layer's folder appears with its first
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

## Environment variables

`.env.example` lists them. Copy it to `.env.local` for development.

- `WF_PROFILE_SOURCE`: with `fixture`, every profile is served from
  `fixtures/` and DE is never reached. With `live`, DE's endpoint is read
  through the locks. Development and previews use `fixture`, and only
  production uses `live`
  ([plan part 4](../specs/plan/04-deployment.md#three-environments)).
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: the shared store,
  set in production only.
