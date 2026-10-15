# The outside sources

The app reads three things from outside: DE's profile endpoint, the wiki's
prose and icons, and Varzia's stock. DE's endpoint takes most of this page,
because misusing it costs the game itself; the other two are free public reads
kept in Next's data cache.

DE's endpoint was verified against the live service. Third-party
documentation (FrameHub, the `@wfcd/profile-parser` README) describes a
`content.warframe.com/dynamic/...` host that no longer answers. How the app
protects the endpoint is [spec 11](../specs/11-profile-proxy.md); how the
shared store holds each lock is
[plan part 2](../specs/plan/02-architecture.md#the-store).

## Endpoint

```
GET https://api.warframe.com/cdn/getProfileViewingData.php?playerId={account_id}
```

- `account_id` is a 24-character hexadecimal ObjectId. There is no lookup by
  username: the id comes from the `gid` cookie on warframe.com, or from
  `https://www.warframe.com/api/user-data` while logged in (`user_id`).
- The response is JSON wrapped in `Results[0]`, with a `Stats` block as a
  sibling of `Results`. `profileFromResponse()` in
  `src/domain/profile/payload.ts` merges the two, and the trim then drops
  `Stats`, which nothing reads.
- `Content-Type` is `text/html` even though the body is JSON. The client
  always parses the body as text.
- The endpoint is public and read-only: the same one the game client uses to
  view another player's profile. The app never authenticates and never
  writes.
- The request is `src/infra/profile/client.ts`. It waits fifteen seconds at
  most, and says `cache: "no-store"`, so Next never keeps the raw payload in
  its data cache.

## Status codes

| Response                                                          | Meaning                                                          | Handling                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| `200` + JSON                                                      | Profile                                                          | Kept, trimmed, for twelve hours        |
| `409` + body `Could not find requested account` + `Cache-Control` | Account does not exist                                           | `not-found`, kept for DE's `max-age`   |
| `409` + empty body, no `Cache-Control`                            | DE is refusing requests                                          | `throttled`, never kept, a refusal     |
| `404`                                                             | Not seen today; kept as `not-found` in case the endpoint changes | `not-found`                            |
| `403` / `429`                                                     | The whole address is being refused after too many requests       | `throttled`, never kept, a refusal     |
| Other non-2xx                                                     | Upstream problem                                                 | `upstream`, never kept, a refusal      |
| No answer in fifteen seconds, or no connection                    | Upstream problem                                                 | `upstream`, never kept, a refusal      |
| `200` + a body that is not JSON, or has no `Results[0]`           | Upstream HTML error page                                         | `malformed`, never kept, not a refusal |

The two `409` variants are the trap: keeping the empty-body one would pin a
false "account not found" for ten minutes, the default when no `max-age` comes.
`tests/client.test.ts` covers it.

## How long a read is kept

- A valid response carries `Cache-Control: max-age=600`. The app ignores it
  and keeps the profile for twelve hours (`PROFILE_TTL_MS` in
  `src/infra/profile/cache.ts`): nothing the app reads changes faster, as
  [`public-release.md`](public-release.md#how-long-a-read-lasts) records.
- A not-found keeps DE's own `max-age` (86400 on a missing account), clamped
  by `ttlFromCacheControl()` to between one minute and a day, so retyping the
  same wrong id costs nothing. With no header it keeps ten minutes.
- What is kept is the trimmed profile, gzipped and base64-encoded, with the
  time it was read. The raw payload is never stored.
- There is no refresh action. It existed and let a player bypass the window
  with repeated clicks; it was removed for that reason.

## Why the endpoint needs protecting

Misuse of this endpoint gets the calling address refused, and the game client
uses the same endpoint: a developer building another tracker reported being
locked out of Warframe itself for up to 24 hours, mostly after players typed
wrong ids. Behind the app the refused address is the server's, so the cost is
the app for everyone; in local development it is the developer's own game.

After a burst of requests the endpoint escalates from `409` (empty body) to
`403 Forbidden` for the whole address, including ids that answered `200`
minutes earlier.

## The locks

`fetchProfile()` in `src/infra/profile/read.ts` reads in the order of spec 11,
and every lock lives in the shared store, so each one holds across every
serverless instance:

1. **Format first.** `normalizeAccountId()` refuses anything that is not 24
   hexadecimal characters before any request is built.
2. **Fixtures by default.** Only `WF_PROFILE_SOURCE=live` reaches DE; unset,
   `fixture` or anything else reads a fixture. The two demo ids, `…0001` Cy
   and `…0002` Ordis, read theirs even when live, so the demo entrance on
   `/connect` always works and never spends a lookup.
3. **Stored first.** One `MGET` reads the profile, the not-found, the read
   lock and the circuit. A stored profile answers even while the circuit is
   open.
4. **The circuit.** Three refusals with no profile or not-found between them
   open it for thirty minutes (`circuit.ts`). A legitimate not-found never
   counts.
5. **The read lock.** One instance takes `wf:lock:{id}`; another asking for the
   same id reads the store every half second for up to fifteen seconds and
   answers with what the first one kept. The lock lives twenty seconds, longer
   than the request's fifteen, so the one that holds it can release it
   without checking it is still its own.
6. **The visitor's budget.** `budget.ts` gives each visitor two lookups in a
   fixed twelve-hour window that starts at the first. Only a miss spends one;
   a stored profile or a stored not-found is free. A spent budget answers
   `limited` with the time the window ends, and never reaches DE.

The visitor is the first `x-forwarded-for` address, then `x-real-ip`, then
`local` (`visitor.ts`). The host overwrites `x-forwarded-for` with the client's
own address, so a client cannot choose its key. An address is still not a
player: a household or a mobile carrier puts many players behind one address,
and they share its two lookups.

A store that is missing in production, or stops answering, fails closed: the
read answers `upstream` and DE is never read without the locks.

No failure blames the account id when the cause is upstream. The read returns
one of seven reasons (`FailureReason` in `src/domain/types/profile.ts`), never
a sentence; the band's words for each are BR-38's.

## The route

`GET /api/profile/{account_id}` answers with the same read, through
`readProfile()`, which takes the visitor from the request.

| Answer         | Status | Body                                              |
| -------------- | ------ | ------------------------------------------------- |
| A profile      | `200`  | `display` (name and Mastery Rank) and the profile |
| `invalid-id`   | `400`  | `error`                                           |
| `not-found`    | `404`  | `error`                                           |
| `limited`      | `429`  | `error` and `retryAfterSeconds`                   |
| `throttled`    | `503`  | `error`                                           |
| `circuit-open` | `503`  | `error` and `retryAfterSeconds`                   |
| `upstream`     | `502`  | `error`                                           |
| `malformed`    | `502`  | `error`                                           |

A profile carries `x-wf-cache: hit` or `miss`, and `cache-control: private,
max-age=60`.

## The wiki

`src/infra/wiki/client.ts` reads `wiki.warframe.com/api.php`, the wiki's
MediaWiki API, for two things:

- **Prose** (BR-48). One request per page, the plain text of the whole page
  (`prop=extracts`, `explaintext`). `withProse()` in `prose.ts` asks once per
  page and source, and cuts the passage the plan names: a mission type's
  Mechanics section with its subsections, or the page's lead when it has
  none; an item's Acquisition section without the drop tables' boilerplate;
  otherwise the page's lead, without an opening quote or a hatnote, and
  nothing for a disambiguation page. An Acquisition title that names a
  section, as the Hounds' `Model#Bhaira` does, reads that section instead. Every paragraph is kept. A title goes
  through the vendored `wiki-titles.json` first, so a row asks for the page
  the wiki files it under.
- **Icons.** One request for many files (`prop=imageinfo`): the white game
  icons by their role, and each place's art by its name (`icons.ts`). The
  app links to the wiki's own file URLs and never rehosts them.

Each request waits eight seconds at most. A failed or missing read answers
nothing, and the row or the icon goes without: the wiki never stops a screen.

## Varzia's stock

`src/infra/worldstate/client.ts` reads `api.warframestat.us/pc/vaultTrader`,
the community's free public worldstate API, for where Varzia is, when her
rotation ends and what she offers. A store path (`/Lotus/StoreItems/…`) is read
as the catalog's own `uniqueName`; an offer's `ducats` is its Regal Aya and
its `credits` its Aya. It is read only when a vaulted Prime is on screen
(BR-29) and waits eight seconds at most; a failed read drops to the lines
that need no live data. Nightwave is not read (BR-35).

## How long the wiki and Varzia are kept

| Source | Kept        | Set by                                                        |
| ------ | ----------- | ------------------------------------------------------------- |
| Wiki   | A day       | `REVALIDATE_SECONDS` in `wiki/client.ts`                      |
| Varzia | Ten minutes | `REVALIDATE_SECONDS` in `worldstate/client.ts`, as BR-29 says |

Both requests say `cache: "force-cache"` beside `next: { revalidate }`, so
Next keeps them in its data cache, which Vercel shares across instances; they
cost no store command. A page reads its cookies before it fetches, and Next
caches a `fetch` met after that only when the call opts in
([plan part 2](../specs/plan/02-architecture.md#where-each-kind-of-state-lives)).
Checked on 2026-10-14 with `logging.fetches` in development: on a page that
reads its cookies first, the first render fetched the icons, a page's prose
and Varzia's stock from their sources, and the second answered all three as
`cache hit`.

## Platforms

The app never asks a player for a platform, and only one source names one.

- The profile endpoint takes `playerId` and nothing else. Account ids are
  global; there is no per-platform host or parameter.
- `@wfcd/items` carries no platform field: one `releaseDate` and one
  `introduced` per item, so what shipped while a player was away is the same
  answer everywhere.
- Varzia's stock is read from the worldstate API's `/pc/` path, for every
  player.

Not verified: whether Varzia's stock differs on another platform, and whether
a player who has never set up Cross Save can reach
`warframe.com/api/user-data` at all. The steps on `/connect` assume a
warframe.com login exists.
