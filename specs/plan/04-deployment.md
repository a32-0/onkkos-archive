# Plan · 4 · Deployment and continuous integration

Where the app and its Storybook run, what each environment reads, and what
every push has to pass before it reaches a player. The host was chosen in
[`public-release.md`](../../docs/public-release.md#which-host); this part says how
it is used.

## Two sites, one repository

| Site      | Vercel project    | Builds                                     | Serves                     |
| --------- | ----------------- | ------------------------------------------ | -------------------------- |
| The app   | `onkko`           | `next build`                               | The app, at the public URL |
| Storybook | `onkko-storybook` | `storybook build` into `storybook-static/` | The catalogue, static      |

Both are Vercel Hobby projects on the same GitHub repository. The constitution
asks for Storybook "from the same host as the app"; a second project on Vercel
keeps it there without mixing a static site into the app's routes, and gives it
its own URL to link from the README. The names are the owner's to change when
the projects are created.

The owner creates both projects, connects them to the repository and holds
every credential. No token, project id or URL is committed.

## Three environments

| Environment | When                                     | Profile source                          | Store   |
| ----------- | ---------------------------------------- | --------------------------------------- | ------- |
| Production  | A push to `main`                         | Live, through the locks                 | Upstash |
| Preview     | Any other branch, and every pull request | Fixtures                                | Memory  |
| Development | `pnpm dev` on a machine                  | Fixtures, unless set to live on purpose | Memory  |

- **Only production reads DE.** A preview is public by URL and runs on Vercel's
  addresses, the same ones production uses; letting it read live would let any
  branch spend production's standing with DE. With `WF_PROFILE_SOURCE=fixture`
  every id, typed or demo, reads a fixture, so a preview still shows every
  screen.
- **One namespace in the store.** Since only production reads live, the keys
  carry no environment prefix (part 2).
- **Development reads fixtures by default**, as the constitution requires.
  Setting `WF_PROFILE_SOURCE=live` locally is the deliberate act; it then uses
  the memory store, so the locks hold within the one process that exists.

### Variables

| Variable                   | Production | Preview   | Development                |
| -------------------------- | ---------- | --------- | -------------------------- |
| `WF_PROFILE_SOURCE`        | `live`     | `fixture` | `fixture` (`.env.example`) |
| `UPSTASH_REDIS_REST_URL`   | Set        | Unset     | Unset                      |
| `UPSTASH_REDIS_REST_TOKEN` | Set        | Unset     | Unset                      |

The two Upstash values come from the database's page in Upstash's console and
are entered in Vercel's settings for the Production environment only. They are
the names `@upstash/redis` reads on its own. The database is created in the
region of the app's functions, so a screen's one store read stays inside it.

## On every push: `check.yml`

One GitHub Actions workflow, on every push and pull request. Each step is a gate
of the constitution:

| Step      | Command                                       | Fails when                                                            |
| --------- | --------------------------------------------- | --------------------------------------------------------------------- |
| Install   | `pnpm install --frozen-lockfile`              | The lockfile and `package.json` disagree                              |
| Check     | `pnpm check`                                  | Types, lint (layers included), format or a test fail                  |
| Dead code | `pnpm knip`                                   | A file, export or dependency nothing reaches                          |
| Stories   | `pnpm test:stories`                           | A story fails to render, or the accessibility addon finds a violation |
| Storybook | `pnpm storybook:build`                        | The catalogue does not build                                          |
| App       | `pnpm build` with `WF_PROFILE_SOURCE=fixture` | The app does not build                                                |

`pnpm test:stories` runs every story as a test through Storybook's Vitest
addon in a headless Chromium, with the accessibility checks on. It is kept out
of `pnpm check` because it needs a browser; CI installs one.

The workflow never reads DE and never holds a secret. `main` is protected so
that a pull request merges only when it passes; the owner sets that rule.

## After a deployment: `smoke.yml`

`pnpm build` passing locally does not prove the deployed function carries
`data/` and `fixtures/` (part 2). Vercel reports each finished deployment to
GitHub, and a second workflow runs on that event against the deployment's URL:

1. `/connect` answers 200.
2. `/api/profile/000000000000000000000002` answers 200: the Ordis demo, read
   from `fixtures/` on disk.
3. `/system`, with `wf_account` set to the same demo id, answers 200: the
   curated files and the vendored data were read from `data/`.

All three use a demo id, so the check never reaches DE, in production either. A
failure marks the deployment red on the commit; it does not roll it back.

## What the deployment does not have

- **No analytics and no telemetry.** Nothing a spec names needs them, and a fan
  app that reads profiles promises strangers as little collection as it can.
  Vercel's function logs are the only record, and they hold no profile.
- **No cron.** Data refreshes (`pnpm data:refresh`, `pnpm data:wiki`) stay
  manual and are committed, as the architecture principle requires.
- **No edge runtime.** Every route runs on Node.js (part 2).

## Limits to watch

| Limit            | Free allowance     | Expected use                                               |
| ---------------- | ------------------ | ---------------------------------------------------------- |
| Upstash commands | 500,000 a month    | About one per screen opened, plus four to six per new read |
| Upstash data     | 256 MB             | About 15 KB per stored profile, for twelve hours           |
| Upstash transfer | 10 GB a month      | About 15 KB per screen opened                              |
| Vercel Hobby     | Non-commercial use | A fan app with no revenue                                  |

Upstash's console alerts at a share of the monthly commands; the owner sets the
alert at 80 %. Past the allowance Upstash stops answering, and the store fails
closed: players see the band for `upstream`, and DE is never read without the
locks.

## Checked when the deployment is set up

Two limits of Vercel Hobby are read from Vercel's own documentation by the task
that creates the projects, not assumed here:

- **A function's longest run.** A new read can take the fifteen-second wait for
  another instance's lock and then DE's fifteen-second timeout. If Hobby's
  limit is shorter than that sum, the two waits shrink to fit inside it, and
  part 2 records the new values.
- **Deployment Protection on previews.** If previews answer `smoke.yml` with a
  login wall, the workflow uses Vercel's bypass for automation where Hobby
  offers it, or runs against production only.

## Divergences from the code

| Today                                                   | This plan                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Runs on the developer's machine only                    | Production on Vercel, Storybook as a second project        |
| `.env.example` pre-fills an account id and a disk cache | `WF_PROFILE_SOURCE=fixture` and the two store names, empty |
| No CI                                                   | `check.yml` on every push, `smoke.yml` on every deployment |
| `pnpm check` is the only gate                           | Plus `knip`, the story tests and both builds               |
