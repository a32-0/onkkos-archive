# Plan · 2 · Architecture and the shared store

How a request moves through the layers of part 1, where each kind of state
lives, and how the four locks of spec 11 hold across every serverless instance.
Part 1 says where each file goes; this part says how the files work together.
Each decision records the question, the options and what settled it.

## A request, end to end

```
browser ──► proxy.ts ──► app/<route>/page.tsx ──► screens/<screen> ──► ui/*
              │                 │
          wf_place          readScreen()   (once per request)
                                │
                     infra/profile/fetch-profile.ts ──► infra/store ──► Upstash
                                │                          (memory in tests and dev)
                                ├──► DE's endpoint, only on a miss
                                ▼
                     domain/*: readings, places, plans
```

1. **`proxy.ts`** runs before the route. It does one thing: when `/system`
   opens with a place, it writes `wf_place` (BR-46).
2. **The page** calls `readScreen()`: the account id from `wf_account`, the
   profile through `fetchProfile`, and the readings the domain makes of it. It
   hands plain values to its screen.
3. **The screen** composes `ui/` components from those values. Nothing under
   `screens/` or `ui/` fetches, reads a cookie or imports `infra/`.
4. **A failure** never renders on the screen that met it: the page redirects to
   `/connect` with the reason (below).

### One read per request

The shell's header shows the player, so the layout and the page both need the
profile. `readScreen()` is wrapped in React's `cache()`, which dedupes it for
the length of one request: a screen costs one store read, however many server
components ask. Without it every screen would cost two, and the command count
in [`public-release.md`](../../docs/public-release.md#what-upstash-actually-spends)
would be off by half.

## Where each kind of state lives

| State                                   | Where                                               | Lives for                      | Set by                           |
| --------------------------------------- | --------------------------------------------------- | ------------------------------ | -------------------------------- |
| The trimmed profile                     | The shared store                                    | Twelve hours                   | `fetchProfile`                   |
| Not-found, budget, circuit, lock        | The shared store                                    | Each lock's own window (below) | `fetchProfile`                   |
| `wf_account`                            | Cookie, `httpOnly`                                  | One year                       | The connect action               |
| `wf_since`                              | Cookie                                              | One year                       | The Resume picker, in the client |
| `wf_place`                              | Cookie                                              | One year                       | `proxy.ts`                       |
| The ticks of spec 10                    | Browser storage                                     | Until cleared                  | The checkbox, in the client      |
| Wiki prose and icons, Varzia, rotations | Next's data cache (`force-cache` with `revalidate`) | A day; Varzia a minute         | The wiki and worldstate clients  |
| Curated files and vendored data         | `data/`, read from disk                             | The deployment                 | Commits                          |

**Why the wiki and the worldstate stay out of the store.** The question was
whether every outside read should go through Upstash. Next 16.3, without Cache
Components, keeps a `fetch` in its data cache when the call opts in, and Vercel
shares that cache across instances. It already does what the store would, at
no command cost, and neither source protects anything of DE's. Only the
profile's locks need the store.

Two things make the opt-in hold, and both are checked rather than assumed:

- **No route exports `dynamic = "force-dynamic"`.** Next 16.3 documents it as
  forcing every `fetch` in the route to `no-store`, `force-cache` included.
  Every page today exports it, so today the wiki is read again on every screen.
  Reading `cookies()` already makes a page render per request; the export adds
  nothing but the lost cache.
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
`purpose: prefetch`, the two Next 16.3 names for a prefetch.

## How a failure reaches `/connect`

Spec 02 sends a failure on any screen to `/connect` "with the reason and, where
one is known, the retry time". A redirect issued while a server component
renders cannot set a cookie, so both travel in the URL:
`/connect?reason=throttled&retry=1760023800`. The page accepts a `reason` only
if it is one of the seven `FailureReason` values and a `retry` only as a whole
number of seconds in the next day, and ignores anything else. A forged URL can
show a band message and nothing more. `routes.ts` builds the URL; no page writes
it by hand.

## The read order

Spec 11 read the circuit before the cache, as the code does today. That meant
that while the circuit was open, every player was sent to `/connect` with
"Warframe isn't answering", even one whose profile was stored an hour earlier,
and every screen spent an extra store command. The owner chose on 2026-10-06
that a stored profile answers first. Spec 11 is corrected to this order:

1. **Shape.** Trim and lower-case; anything but 24 hex characters is
   `invalid-id`.
2. **Demo.** The two demo ids, and every id when the source is fixtures, read
   their fixture.
3. **Stored.** One `MGET` reads the profile and the not-found for the id. A hit
   answers at once.
4. **Circuit.** If open, `circuit-open` with the time it closes.
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

| Backend | File                     | Used                                               |
| ------- | ------------------------ | -------------------------------------------------- |
| Upstash | `infra/store/upstash.ts` | Production, through `@upstash/redis` over REST     |
| Memory  | `infra/store/memory.ts`  | Tests and development; exposes `flush()` for tests |

The memory backend keeps its map on `globalThis`. A hot reload in development
re-evaluates the modules, and a map held in a module would start empty: with
the source set to live, the next render would read DE again from the
developer's own address, the lockout the constitution warns about. On
`globalThis` the cache, the budget and the circuit survive every reload and are
lost only when the process stops. That replaces today's disk cache, which
existed for the same reason.

`infra/store/index.ts` picks the backend: Upstash when its two variables are
set, memory otherwise. In production with the source set to live, a missing
store is a configuration error: the read fails closed and never falls back to an
instance's memory, because that would quietly break the window across
instances (constitution).

`increment` sets the expiry only when it creates the key, in the same call
(`SET NX PX` then `INCR`, pipelined), so a window is never extended by a later
spend.

### The keys

Every key starts with `wf:`. Preview deployments never read live (part 4), so
one namespace serves the one deployment that does.

| Lock           | Key                   | Value                                                        | Lives for                                   |
| -------------- | --------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Profile        | `wf:profile:{id}`     | The trimmed profile, gzip, base64, with the time it was read | Twelve hours                                |
| Not-found      | `wf:notfound:{id}`    | `1`                                                          | DE's `max-age`, clamped to one minute–a day |
| Read lock      | `wf:lock:{id}`        | The instance's token                                         | Twenty seconds, or until the read ends      |
| Visitor budget | `wf:budget:{visitor}` | The number of lookups spent                                  | Twelve hours from the first spend           |
| Refusals       | `wf:circuit:refusals` | Consecutive refusals                                         | Thirty minutes from the first               |
| Circuit        | `wf:circuit:open`     | `1`                                                          | Thirty minutes                              |

### Two instances, one id

The in-process map of reads in flight dedupes requests inside one instance only.
Across instances, `wf:lock:{id}` is taken with `setIfAbsent`. The owner chose on
2026-10-06 what the instance that loses does: every half second, for up to fifteen
seconds, it reads the profile, the not-found and the lock in one `MGET`, and
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

Today the budget keeps each visitor's timestamps and slides. Spec 11 says
"twelve hours from first spend", and the store makes that the simple form: the
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
for thirty minutes. A profile or a not-found removes both keys. On one server
"three in a row" was exact. Across instances it means three refusals with no
success recorded between them, which is the same protection: what DE punishes
is a burst, and a burst is what the count sees.

### Synchronous becomes asynchronous

`spendLookup`, `circuitState`, `recordSuccess` and `recordRejection` return
promises once they read the store. Their only callers are `client.ts` and two
test files, `client.test.ts` and `resilience.test.ts`. The tests' `resetBudget`,
`resetCircuit` and `clearMemoryCache` become one `flush()` on the memory store,
so the same tests run against the store's interface (spec 11, acceptance 8).

## Trim and compress

The trim is a domain function, `domain/profile/trim.ts`, over one list of the
root fields the travelling code reads, `domain/profile/fields.ts`. The list was
read off the modules part 1 marks Moves or Reworked, and the curated files'
checks, never off today's whole `src/`:

| Field              | Read by                                                       |
| ------------------ | ------------------------------------------------------------- |
| `DisplayName`      | The player chip (spec 04)                                     |
| `PlayerLevel`      | The chip's Mastery Rank, and goal checks in `grafo.yaml`      |
| `Created`          | Resume's earliest month (spec 05)                             |
| `Missions`         | The star chart, the frontier and every place's state          |
| `Affiliations`     | Goal checks and quest evidence                                |
| `LoadOutInventory` | Mastery per item (`XPInfo`), quest evidence, every item state |
| `UnlockedOperator` | Quest evidence                                                |

Left out, because only code that stays reads them: `PlayerSkills` (the
Intrinsics goal, deferred), `ChallengeProgress` (Nightwave, BR-35), `Stats`
(read by nothing), and `GuildName` and `PlatformNames` (no frame draws them).
The task that builds the trim confirms the list against every reading that
travels, the profile parser's included.
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

Upstash's REST interface carries strings, hence base64. At 15 KB for a full
veteran, the 256 MB hold about 17,000 profiles at once, and the 10 GB of monthly
transfer covers about 660,000 reads. The 500,000 commands a month are the
binding limit, not the space or the transfer. `public-release.md` estimated
18 KB with more fields; its figures are corrected.

## The runtime

Every route runs on Node.js, not the edge: the store's compression uses
`node:zlib`, and the loaders read `data/` and `fixtures/` from disk.
`next.config.ts` names both folders in `outputFileTracingIncludes`, so the
deployed function carries them. Part 4 checks it on the deployment, because a
missing file passes locally.

## Divergences from the code

| Today                                                 | This plan                                                      |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| Cache, budget and circuit in maps and variables       | One `Store`, Upstash in production, memory in tests and dev    |
| A disk cache in development (`WF_DISK_CACHE`)         | The memory store; development reads fixtures                   |
| The circuit is read before the cache                  | A stored profile answers first                                 |
| Two instances can read the same id at once            | A read lock; the loser waits for the winner's result           |
| The budget slides over two timestamps                 | A fixed window from the first spend                            |
| The raw `Results[0]` is held                          | The trimmed profile, gzip and base64                           |
| No field list; Cy is the whole capture                | One list in the domain, shared by the store and `pnpm fixture` |
| Pages call `requireScreen()` with no dedupe           | `readScreen()` in React's `cache()`                            |
| `/connect?step=start` and a failure rendered in place | `/connect?reason=…&retry=…`                                    |
| The place is not remembered                           | `proxy.ts` writes `wf_place`                                   |
| Every page exports `dynamic = "force-dynamic"`        | None does; the wiki and worldstate reads say `force-cache`     |
| The development disk cache survives restarts          | The memory store survives hot reloads on `globalThis`          |
