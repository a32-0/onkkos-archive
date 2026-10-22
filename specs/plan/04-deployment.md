# Plan · 4 · Deployment and continuous integration

Where the app and its Storybook run, what each environment reads, and what
every push has to pass before it reaches a player. The host was chosen in
[`public-release.md`](../../docs/public-release.md#which-host); this part says how
it is used.

## Two sites, one repository

| Site      | Vercel project             | Builds                                     | Serves                     |
| --------- | -------------------------- | ------------------------------------------ | -------------------------- |
| The app   | `onkkos-archive`           | `next build`                               | The app, at the public URL |
| Storybook | `onkkos-archive-storybook` | `storybook build` into `storybook-static/` | The catalogue, static      |

Both are Vercel Hobby projects on the same GitHub repository. The constitution
asks for Storybook "from the same host as the app"; a second project on Vercel
keeps it there without mixing a static site into the app's routes, and gives it
its own URL to link from the README. The names are the owner's to change when
the projects are created.

The owner creates both projects, connects them to the repository and holds
every credential. No token, project id or URL is committed.

## Two environments

| Environment | When                                    | Profile source                                    | Store                           |
| ----------- | --------------------------------------- | ------------------------------------------------- | ------------------------------- |
| Production  | A phase merged into `main`              | Fixtures until T-33, then live, through the locks | Memory until T-33, then Upstash |
| Development | `pnpm dev` or `pnpm start` on a machine | Fixtures, unless set to live on purpose           | Memory                          |

- **Only `main` deploys.** The owner chose on 2026-10-08 that Vercel builds no
  preview: `vercel.json`, at the root both projects build from, turns
  deployments off for every branch but `main`. A push to `dev` and a phase's
  pull request are checked by `check.yml`, and the owner looks at the screens
  on their own machine; a phase reaches a URL when it is merged.
- **Only production reads DE, and only from T-33.** Until the owner sets
  `WF_PROFILE_SOURCE=live` for Production, the variable is unset or `fixture`
  there, and every id, typed or demo, reads a fixture (spec 11), so each merged phase
  shows every screen without reaching DE.
- **One namespace in the store.** Since only production reads live, the keys
  carry no environment prefix (part 2).
- **Development reads fixtures by default**, as the constitution requires.
  Setting `WF_PROFILE_SOURCE=live` locally is the deliberate act; it then uses
  the memory store, so the locks hold within the one process that exists.

### Variables

| Variable                   | Production        | Development                |
| -------------------------- | ----------------- | -------------------------- |
| `WF_PROFILE_SOURCE`        | `live`, from T-33 | `fixture` (`.env.example`) |
| `UPSTASH_REDIS_REST_URL`   | Set, from T-33    | Unset                      |
| `UPSTASH_REDIS_REST_TOKEN` | Set, from T-33    | Unset                      |

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
| Weight    | `pnpm weight`                                 | A route's function carries more than 80 MB                            |

`pnpm test:stories` runs every story as a test through Storybook's Vitest
addon in a headless Chromium, with the accessibility checks on. It is kept out
of `pnpm check` because it needs a browser; CI installs one.

The workflow never reads DE and never holds a secret. `main` is protected so
that a pull request merges only when it passes; the owner sets that rule.

## After a deployment: `smoke.yml`

`pnpm build` passing locally does not prove the deployed function carries
`data/` and `fixtures/` (part 2). Vercel reports each finished deployment to
GitHub, and since only `main` deploys, each one is production's, after a
phase's merge. A second workflow runs on that event against the deployment's
URL:

1. `/connect` answers 200.
2. `/api/profile/000000000000000000000002` answers 200: the Ordis demo, read
   from `fixtures/` on disk.
3. `/system`, with `wf_account` set to the same demo id, answers 200 and
   stays on `/system` after its redirect to the player's place: the curated
   files and the vendored data were read from `data/`. Without the cookie it
   would end on `/connect`, also with 200, so the final address is what
   proves it.

All three use a demo id, so the check never reaches DE, in production either. A
failure marks the deployment red on the commit; it does not roll it back.

## What the deployment does not have

- **Counts, not people.** The plan first had no analytics at all. The owner
  asked on 2026-10-21, before the launch, to know how many people come:
  Vercel Web Analytics counts page views and Speed Insights measures how fast
  pages load, `<Analytics />` and `<SpeedInsights />` in the root layout,
  from `@vercel/analytics` and `@vercel/speed-insights`. Web Analytics sets
  no cookie; a visitor is a hash of the request, discarded after 24 hours,
  and a page view keeps its path, referrer, country, browser and device
  ([Vercel: Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)).
  No address in the app carries an account id, so nothing needs redacting
  with `beforeSend`; a route that ever does must redact it. No custom event
  is sent. Vercel's function logs stay the only other record, and they hold
  no profile. Both are switched on per project in Vercel's dashboard
  (Analytics, Speed Insights) by the owner; without that the components send
  nothing.
- **What a shared link and a search engine see** (owner, 2026-10-21). The
  root layout's metadata gives the app's name and summary to Open Graph and
  to X's large card; `src/app/opengraph-image.png` is the splash over Cetus,
  1200 by 630, without its button. `apple-icon.png`, `manifest.ts` and the
  two icons in `public/` let a phone keep the app on its home screen.
  `robots.ts` lets crawlers read `/` and `/connect` only, since every other
  page needs an account, and `sitemap.ts` names those two.
- **No cron.** Data refreshes (`pnpm data:refresh`, `pnpm data:wiki`) stay
  manual and are committed, as the architecture principle requires.
- **No edge runtime.** Every route runs on Node.js (part 2).

## Limits to watch

| Limit            | Free allowance                    | Expected use                                                             |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------ |
| Upstash commands | 500,000 a month                   | About one per screen opened, plus seven per new read                     |
| Upstash data     | 256 MB                            | About 15 KB per stored profile, for twelve hours                         |
| Upstash transfer | 10 GB a month                     | About 15 KB per screen opened                                            |
| Vercel Hobby     | Non-commercial use                | A fan app with no revenue                                                |
| Web Analytics    | 50,000 events a month             | One per page opened; past it, after three days' grace, collection pauses |
| Speed Insights   | 10,000 events in 30 days, rolling | A few per page opened; past it, collection pauses for at least 14 days   |

Upstash's console alerts at a share of the monthly commands; the owner sets the
alert at 80 %. Neither Vercel allowance can cost money on Hobby: past it,
collection stops and the app runs on
([Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing),
[Speed Insights limits](https://vercel.com/docs/speed-insights/limits-and-pricing)). Past the allowance Upstash stops answering, and the store fails
closed: players see the band for `upstream`, and DE is never read without the
locks.

## Checked when the deployment is set up

Two limits of Vercel Hobby were read from Vercel's own documentation by the
task that creates the projects (T-03, on 2026-10-08), not assumed here:

- **A function's longest run.** A new read can take the fifteen-second wait for
  another instance's lock and then DE's fifteen-second timeout, thirty seconds
  in all. On Hobby a Node.js function runs for 300 seconds by default and at
  most, with fluid compute, which new projects have on by default
  ([Vercel: function limitations, max duration](https://vercel.com/docs/functions/limitations#max-duration);
  [fluid compute, default settings by plan](https://vercel.com/docs/fluid-compute#default-settings-by-plan)).
  Thirty seconds fits inside it, so the two waits stay as part 2 sets them and
  no route sets `maxDuration`.
- **Deployment Protection.** Vercel Authentication with Standard
  Protection is available on Hobby and, when on, puts every deployment but the
  production domains behind Vercel's login, a production deployment's own URL
  included
  ([Vercel: Deployment Protection](https://vercel.com/docs/deployment-protection#standard-protection);
  [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)).
  Protection Bypass for Automation is available on all plans: a secret sent as
  the `x-vercel-protection-bypass` header passes the login
  ([Vercel: Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)).
  `smoke.yml` reads the deployment's own URL, so while protection is on it
  sends that header, its secret held in the repository's Actions secrets by
  the owner as `VERCEL_AUTOMATION_BYPASS_SECRET` (T-30); with no secret it
  sends no header.
  That secret is `smoke.yml`'s only one; `check.yml` still holds none.
- **Functions in a deployment** (added 2026-10-21, when phase 4's production
  build failed). Hobby takes at most 12 functions in a deployment; with
  Next.js, Vercel bundles the routes rendered on request into the fewest
  functions it can
  ([Vercel: functions created per deployment](https://vercel.com/docs/functions/runtimes#functions-created-per-deployment)).
  A function's files weigh at most 250 MB uncompressed
  ([function limitations, bundle size](https://vercel.com/docs/functions/limitations#bundle-size-limits)).
  Each of the fourteen routes carried `@wfcd/items` and weighed about 122 MB,
  and the build failed with more than 12 functions: what the failure implies,
  and no page states, is that two routes that together pass 250 MB cannot
  share a function. The production build of 2026-10-21, at about 28 MB a
  route, passed and confirmed it. The catalog is now read from a
  snapshot in `data/vendor/` and each route weighs about 28 MB; `pnpm weight`
  in `check.yml` fails a route past 80 MB, before Vercel does
  ([`development.md`](../../docs/development.md#the-weight-of-a-function)).
