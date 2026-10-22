# Plan · 2 · Architecture and the shared store

How a request moves through the layers of part 1, where each kind of state
lives, how the four locks of spec 11 hold on the player's machine, and how one
build runs as the demo and as the app. Part 1 says where each file goes; this
part says how the files work together. Each decision records the question,
the options and what settled it.

## Two targets, one tree

The owner chose on 2026-10-22 that a player's own account is read by an app on
their machine, and that the website stays as a demo (constitution; spec 13).
Both run the same `src/` tree and the same Next build; three variables tell
them apart:

| Variable            | The demo, on Vercel | The app, on the player's machine   | Development                 |
| ------------------- | ------------------- | ---------------------------------- | --------------------------- |
| `WF_EDITION`        | `demo`              | `app`                              | Unset: the form, as the app |
| `WF_PROFILE_SOURCE` | `fixture`           | `live`                             | `fixture` (`.env.example`)  |
| `WF_STORE_FILE`     | Unset: memory       | The store file in the app's folder | Unset: memory               |

The main process of the app sets the app's column, with `WF_DATA_DIR` (the
current data set), `WF_LAUNCH_TOKEN` (the start's secret) and the cache folder
below; nothing in the player's hands sets any of them.

```
Electron main ──► Next server (standalone, 127.0.0.1, any port)
   │  secret on each request to it   │
   ▼                                 ▼
the window ──► proxy.ts: secret and Host checked, else 403 ──► the routes below
```

- **The build.** The app's build sets `output: "standalone"` for its target
  alone, from the desktop build's own command, so the demo's build, its
  functions and `pnpm weight` are what they are today. `server.js` serves
  `public/` and `.next/static` once they are copied beside it, as Next's
  `output` reference says.
- **The guard is `proxy.ts`.** When `WF_LAUNCH_TOKEN` is set, a request without
  it in its header, or with a `Host` other than the server's own, answers
  `403` before any route runs. The demo and development set no token, and the
  proxy behaves as it does today.
- **Writable folders.** The program's folder is read-only on an AppImage and
  may be on Windows, so every write goes under Electron's `userData`: the
  store file, the data sets and Next's fetch cache. The fetch cache moves
  through `cacheHandler`, which Next 16's `incrementalCacheHandlerPath`
  reference documents as covering the patched `fetch`; the task that builds
  the window confirms it before relying on it.
- **The loaders read `WF_DATA_DIR`** when it is set, and `data/` beside the
  code otherwise, so the demo and development are unchanged.

## A request, end to end

```
browser ──► proxy.ts ──► app/<route>/page.tsx ──► screens/<screen> ──► ui/*
              │                 │
          wf_place          readScreen()   (once per request)
                                │
                     infra/profile/read.ts ──► infra/store ──► the store file
                                │                (memory on the demo, in tests and dev)
                                ├──► DE's endpoint, only on a miss
                                ▼
                     domain/*: readings, places, plans
```

1. **`proxy.ts`** runs before the route. It does one thing: when `/system`
   opens with a place, it writes `wf_place` (BR-46).
2. **The page** calls `readScreen()`: the account id from `wf_account`, the
   profile through `readProfile()`, and the readings the domain makes of it. It
   hands plain values to its screen.
3. **The screen** composes `ui/` components from those values. Nothing under
   `screens/` or `ui/` fetches, reads a cookie or imports `infra/`.
4. **A failure** never renders on the screen that met it: the page redirects to
   `/connect` with the reason (below).

### One read per request

The shell's header shows the player, so the shell and the screen inside it both
need the profile. The page renders the shell, not the root layout: Next 16.3
gives a layout neither the pathname nor the query, so it cannot know the active
tab, the item's `from` or Resume's entrance, and `/`, `/connect` and
`/features` have no player to show. `readScreen()` is wrapped in React's
`cache()`, which dedupes it for the length of one request: a screen costs one
store read, however many server components ask. Without it a screen could cost
two.

## Where each kind of state lives

| State                                   | Where                                               | Lives for                      | Set by                          |
| --------------------------------------- | --------------------------------------------------- | ------------------------------ | ------------------------------- |
| The trimmed profile                     | The store                                           | Twelve hours                   | `fetchProfile`                  |
| Not-found, budget, circuit, lock        | The store                                           | Each lock's own window (below) | `fetchProfile`                  |
| `wf_account`                            | Cookie, `httpOnly`                                  | One year                       | The connect action              |
| `wf_since`                              | Cookie, `httpOnly`                                  | One year                       | A server action, from Resume    |
| `wf_place`                              | Cookie, `httpOnly`                                  | One year                       | `proxy.ts`                      |
| The ticks of spec 10                    | Browser storage                                     | Until cleared                  | The checkbox, in the client     |
| Wiki prose and icons, Varzia, rotations | Next's data cache (`force-cache` with `revalidate`) | A day; Varzia ten minutes      | The wiki and worldstate clients |
| Curated files and vendored data         | `data/`, or the app's current set, read from disk   | The deployment, or the set     | Commits                         |

**Why the wiki and the worldstate stay out of the store.** The question was
whether every outside read should go through the store. Next 16.3, without
Cache Components, keeps a `fetch` in its data cache when the call opts in,
Vercel shares that cache across instances, and the app keeps it in its own
folder. It already does what the store would, and neither source protects
anything of DE's. Only the profile's locks need the store.

Two things make the opt-in hold, and both are checked rather than assumed:

- **No route exports `dynamic = "force-dynamic"`.** Next 16.3 documents it as
  forcing every `fetch` in the route to `no-store`, `force-cache` included, so
  the wiki would be read again on every screen. Reading `cookies()` already
  makes a page render per request; the export would add nothing but the lost
  cache.
- **The wiki and worldstate clients say `cache: "force-cache"`** beside their
  `revalidate`. A page reads its cookies before it fetches, and Next does not
  cache a `fetch` met after a request-time API unless the call opts in.
  `logging.fetches` in `next.config.ts` shows each one as a hit or a miss in
  development, and the task that moves the clients records what it shows.

**Why DE's read is never in that cache.** The profile request keeps
`cache: "no-store"`, which Next 16.3 documents as fetched on every call and never
stored. Without it the raw 526 KB payload would sit in Vercel's cache, against
spec 11's rule that the raw payload is never stored.

**Why `proxy.ts` writes `wf_place`.** Next 16.3 does not let a server component
set a cookie while it renders; only a server function, a route handler or the
proxy can. The map is reached by plain links, so a server function would need a
client round trip after the page loads, and a route handler would need a
redirect on every place. The proxy sets it on the response of the same request,
with no extra trip. It reads only the URL; it never reads the profile.

It skips prefetches. A `<Link>` prefetches its target as it scrolls into view,
and the map is a list of place links, so without the check the last place
_prefetched_ would become the last place visited. The proxy writes nothing
when the request carries the `next-router-prefetch` header or
`purpose: prefetch`, the two Next 16.3 names for a prefetch. The check is in
the proxy's matcher, as `missing` headers, and not in its code: Next removes
`next-router-prefetch` from the request it hands the proxy, so the code never
sees it.

## How a failure reaches `/connect`

Spec 02 sends a failure on any screen to `/connect` "with the reason and, where
one is known, the retry time". A redirect issued while a server component
renders cannot set a cookie, so both go in the URL:
`/connect?reason=circuit-open&retry=1760023800`. The retry is the Unix time, in
seconds, when a retry can succeed; only `limited` and `circuit-open` carry one.
The page accepts a `reason` only if it is one of the seven `FailureReason`
values and a `retry` only as a whole number of seconds in the next day, and
ignores anything else. A forged URL can show a band message and nothing more.

`readScreen()` in `infra/screen.ts` returns the reason and the retry time, and
`requireScreen()` in `app/screen.ts` redirects: `infra/` does not import
`routes.ts`, which builds the URL. No page writes it by hand.

## The read order

Spec 11 first read the circuit before the cache. That meant that while the
circuit was open, every player was sent to `/connect` with
"Warframe isn't answering", even one whose profile was stored an hour earlier,
and every screen spent an extra store command. The owner chose on 2026-10-06
that a stored profile answers first. Spec 11 is corrected to this order:

1. **Shape.** Trim and lower-case; anything but 24 hex characters is
   `invalid-id`.
2. **Demo.** The two demo ids, and every id when the source is fixtures, read
   their fixture.
3. **Stored.** One `MGET` reads the profile, the not-found and the lock for
   the id, with the circuit's two keys. A hit answers at once.
4. **Circuit.** If open, `circuit-open` with the time it closes, read from the
   same `MGET`.
5. **Lock.** Take the id's read lock. If another instance holds it, wait for
   its result (below).
6. **Budget.** Spend one of the visitor's two lookups, or answer `limited`.
7. **Read.** One request to DE, fifteen seconds at most.
8. **Classify**, as [`api.md`](../../docs/api.md#status-codes) records.
9. **Keep** the trimmed, compressed profile for twelve hours, or the not-found
   for DE's `max-age`; release the lock.

A screen with a stored profile costs one command: the `MGET`.

## The store

One interface in `infra/store/`, two backends. Only what the locks use is
exposed:

```ts
interface Store {
  getMany(keys: string[]): Promise<(string | null)[]>;
  set(key: string, value: string, ttlMs: number): Promise<void>;
  setIfAbsent(key: string, value: string, ttlMs: number): Promise<boolean>;
  increment(key: string, ttlMs: number): Promise<{ count: number; ttlMs: number }>;
  remove(...keys: string[]): Promise<void>;
}
```

| Backend | File                    | Used                                                         |
| ------- | ----------------------- | ------------------------------------------------------------ |
| File    | `infra/store/file.ts`   | The app: the memory backend's map, kept in one file          |
| Memory  | `infra/store/memory.ts` | The demo, tests and development; exposes `flush()` for tests |

Upstash, the shared backend until 2026-10-22, is removed: no target reads DE
from a server any more, and the cut rule keeps nothing for later. The file
backend is a plain JSON file, not a database (constitution, "No computed
state"). It loads once when the server starts, drops what has expired, and
writes the whole map after each change to a temporary file it then renames
over the old one, so a crash leaves the last complete file. One server runs
per machine (spec 13: one app at a time), so no second writer exists.

The memory backend keeps its map on `globalThis`. A hot reload in development
re-evaluates the modules, and a map held in a module would start empty: with
the source set to live, the next render would read DE again from the
developer's own address, the lockout the constitution warns about. On
`globalThis` the cache, the budget and the circuit survive every reload and are
lost only when the process stops, so development needs no disk cache.

`infra/store/index.ts` picks the backend: the file when `WF_STORE_FILE` is set,
memory otherwise. In a production build with the source set to live, a
missing file is a configuration error: the read fails closed and never falls
back to memory, which a restart would empty and with it the window
(constitution).

`increment` sets the expiry only when it creates the key, in the same call
(`SET NX PX` then `INCR`, pipelined), so a window is never extended by a later
spend.

### The keys

Every key starts with `wf:`. Each machine has its own file, so one namespace
serves it.

| Lock           | Key                   | Value                                                        | Lives for                                   |
| -------------- | --------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Profile        | `wf:profile:{id}`     | The trimmed profile, gzip, base64, with the time it was read | Twelve hours                                |
| Not-found      | `wf:notfound:{id}`    | `1`                                                          | DE's `max-age`, clamped to one minute–a day |
| Read lock      | `wf:lock:{id}`        | The instance's token                                         | Twenty seconds, or until the read ends      |
| Visitor budget | `wf:budget:{visitor}` | The number of lookups spent                                  | Twelve hours from the first spend           |
| Refusals       | `wf:circuit:refusals` | Consecutive refusals                                         | Thirty minutes from the first               |
| Circuit        | `wf:circuit:open`     | The time it closes, in milliseconds                          | Thirty minutes                              |

### Two instances, one id

The in-process map of reads in flight dedupes one visitor's requests for an id.
The app runs one server, but the lock is kept as it was written for many,
because it costs one key and holds whatever runs the server:
`wf:lock:{id}` is taken with `setIfAbsent`. The owner chose on
2026-10-06 what the instance that loses does: every half second, for up to fifteen
seconds, it reads the same keys as step 3 in one `MGET`, and
answers with whichever result the winner left:

- **A profile or a not-found**: it answers with it. It spends no lookup and
  never calls DE.
- **No lock and nothing stored**: the winner ended without a result it could
  keep (its visitor's budget was spent, or DE refused). The waiting instance
  goes back to step 4 and tries for the lock itself, with its own visitor's
  budget.
- **Fifteen seconds and still locked**: it answers `upstream`, which sends the
  player to `/connect` with the band and costs DE nothing.

The lock expires on its own after twenty seconds, so a crashed winner never
blocks an id.

### The budget is a fixed window

Spec 11 says "twelve hours from first spend", and the store makes that the
simple form, rather than a sliding window over each visitor's timestamps: the
first lookup creates `wf:budget:{visitor}` with a twelve-hour expiry, each one
increments it, and a count over two answers `limited` with the key's remaining
time as the retry.

The cost, accepted knowingly: at the edge of a window a fixed window lets a
visitor through twice as often. Two lookups at 19:55, the window closing at
20:00, and two more at 20:01 make four lookups in six minutes; the sliding
window would have allowed two in any twelve hours. Four reads from one address
is not a burst DE punishes, the circuit and the cached not-found still stand
behind it, and the simple form costs one command instead of a sorted set per
spend. Re-reading one's own profile still costs at most one lookup per window,
because the profile is stored.

### The circuit counts refusals without a success between them

A refusal increments `wf:circuit:refusals`; at three it sets `wf:circuit:open`
for thirty minutes, with the time it closes as its value, since the store
reads no key's remaining time. A profile or a not-found removes both keys, when
the `MGET` of step 3 saw either. On one server
"three in a row" was exact. Across instances it means three refusals with no
success recorded between them, which is the same protection: what DE punishes
is a burst, and a burst is what the count sees.

### Synchronous becomes asynchronous

`spendLookup`, `recordSuccess` and `recordRefusal` return promises once they
write the store; `circuitState` reads the circuit's value from the `MGET` of
step 3 and stays synchronous. Their only caller is `read.ts`, which holds the
read order; `client.ts` is the request to DE and its classification. The tests'
`resetBudget`, `resetCircuit` and `clearMemoryCache` become one `flush()` on the
memory store, so the same tests run against the store's interface (spec 11,
acceptance 9).

## Trim and compress

The trim is a domain function, `domain/profile/trim.ts`, over one list of the
root fields the app reads, `domain/profile/fields.ts`. The list was read off
every module that reads the profile, and the curated files' checks:

| Field                   | Read by                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DisplayName`           | The player chip (spec 04)                                                                                            |
| `PlayerLevel`           | The chip's Mastery Rank, and goal checks in `grafo.yaml`                                                             |
| `Created`               | Resume's earliest month (spec 05)                                                                                    |
| `Missions`              | The star chart, the frontier and every place's state                                                                 |
| `Affiliations`          | Goal checks and quest evidence                                                                                       |
| `LoadOutInventory`      | Mastery per item (`XPInfo`), quest evidence, every item state                                                        |
| `UnlockedOperator`      | Quest evidence                                                                                                       |
| `GuildId`               | The Dojo's reach (BR-59); kept as `true`, never the clan's id                                                        |
| `ActiveAvatarImageType` | The player's glyph on the chip and in the menu (spec 04), added on 2026-10-16; a profile without it keeps the square |

Left out, because nothing the app does reads them: `PlayerSkills` (the
Intrinsics goal, deferred), `ChallengeProgress` (Nightwave, BR-35), `Stats`,
and `GuildName` and `PlatformNames` (no frame draws them). T-12 confirmed the
list against every reading on 2026-10-13: inside `LoadOutInventory` only
`XPInfo` is read, so the trim keeps `XPInfo` alone and drops the presets, skins
and equipped gear DE sends beside it, as the fixture cutter does. There is no
profile parser: the player chip reads `DisplayName` and `PlayerLevel`
directly.
`scripts/trim-profile` imports the same list, so the fixtures and the store can
never keep different fields. The file has no imports, so Node's type stripping
runs the script without a build step.

Measured on 2026-10-06 with that list. The real capture is the largest
profile in hand, so it sets the figure; only its sizes are recorded here:

| Form                          | The real capture | Ordis  |
| ----------------------------- | ---------------- | ------ |
| As DE returns it              | 526 KB           | 4.5 KB |
| The seven fields, minified    | 63 KB            | 2.1 KB |
| Gzip, base64 (what is stored) | 15 KB            | 0.6 KB |

The store holds strings, hence base64. At 15 KB for a full veteran, a machine's
store file stays a few dozen kilobytes. `public-release.md` estimated 18 KB
with more fields; its figures are corrected.

## The runtime

Every route runs on Node.js, not the edge: the store's compression uses
`node:zlib`, and the loaders read `data/` and `fixtures/` from disk.
`next.config.ts` names their files in `outputFileTracingIncludes`
(`data/*.yaml`, `data/vendor/*.json`, `fixtures/*.json`, never a `**`
pattern, which also pulled in every package's own `data/` folder), so the
deployed function carries them; `pnpm weight` keeps each function light
(part 4). Part 4 checks it on the deployment, because a
missing file passes locally.
