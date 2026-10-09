# 11 · The profile proxy

Every screen depends on the player's public profile, which the app reads from
Digital Extremes (DE), the game's maker. This spec covers how that read
happens, how long the result is kept, and how the app avoids calling DE so
often that DE blocks it, which would take the app down for every player. No
frame draws it. What a failed read looks like is in spec 02.

## Rules

- The constitution: "It is deployed, and it protects DE's endpoint", "No
  computed state", "Nothing real about a person ships".
- [BR-01](../docs/business-rules.md#br-01--remember-the-player-on-this-device):
  the id is remembered on the device.
- [BR-07](../docs/business-rules.md#br-07--one-profile-read-per-twelve-hours):
  one read per twelve hours.
- [BR-38](../docs/business-rules.md#br-38--loading-and-errors-happen-on-the-id-form):
  the seven failure reasons and where they show.
- Verified behaviour of the endpoint: [`api.md`](../docs/api.md). The host and
  store, and why: [`public-release.md`](../docs/public-release.md).

## What it does

One server function, `fetchProfile(accountId, visitor)`, and one route that
exposes it, `GET /api/profile/[accountId]`. Every screen reads through the
function on the server; nothing in the browser calls DE.

In order, for every read:

1. **Shape.** The id is trimmed and lower-cased; anything that is not 24
   hexadecimal characters answers `invalid-id` before anything else.
2. **Demo.** The ids of the two demos (Ordis, Cy) read their fixture and stop
   here. So does every id when the source is set to fixtures, which is the
   default in development.
3. **Stored.** A stored profile for this id, younger than twelve hours, answers
   at once. So does a stored not-found, within DE's own `max-age` (clamped to
   between one minute and a day). The owner set on 2026-10-06 that this comes
   before the circuit: a player whose profile is stored keeps reading it while
   the circuit is open.
4. **Circuit.** If the circuit is open, answer `circuit-open` with the time it
   closes.
5. **Lock.** One instance takes the id's read lock. Another instance asking for
   the same id waits for that read's result, for up to fifteen seconds, and
   answers with it; it spends no lookup and never calls DE.
6. **Budget.** A miss spends one of the visitor's two lookups for the window.
   A spent budget answers `limited` with the time the window ends, and never
   reaches DE.
7. **Read.** One request to DE's endpoint, fifteen seconds at most.
8. **Classify**, as [`api.md`](../docs/api.md#status-codes) records: a profile,
   `not-found` (cached), `throttled` or `upstream` (never cached, counted by the
   circuit), `malformed` (never cached).
9. **Keep** only what the app reads: the profile cut to the fields any spec
   uses, compressed, for twelve hours. The raw payload is never stored.

How the store implements each step: [plan part 2](plan/02-architecture.md).

## Shared, never per instance

The cache, the stored not-founds, the visitor budgets and the circuit live in
one store shared by every serverless instance (Upstash Redis on the host the
plan names), behind the interfaces `cache.ts`, `budget.ts` and `circuit.ts`
already have. An instance's memory is never the source of truth for any of
them, or a second instance would read DE again inside the window.

| Lock           | Key                        | Lives for                     |
| -------------- | -------------------------- | ----------------------------- |
| Profile        | the account id             | twelve hours                  |
| Not-found      | the account id             | DE's `max-age`, clamped       |
| Visitor budget | the visitor's address      | twelve hours from first spend |
| Circuit        | one key for the deployment | thirty minutes once opened    |

The visitor is the host's own client address. The host overwrites
`x-forwarded-for`, so a client cannot choose its key.

## What is kept, and what is not

- Kept: the trimmed profile, for twelve hours; nothing else about a player.
- On the device: `wf_account` (one year) and `wf_since` (the month), both
  cookies; `wf_place` (BR-46); the ticks of spec 10 in browser storage.
- Never: the raw payload, a computed result, anything past the window.
- Disconnect clears both cookies; the stored profile simply expires.

## The fixtures

- `profile-cy.json` and `profile-ordis.json` are the demos, and the only
  profiles that travel. Both are the output of `pnpm fixture`: whitelisted
  fields, with the account id, display name and platform names replaced.
- Tests read fixtures, never DE.
- `profile-full.json`, the real capture, does not travel, nor does the
  `full` demo id that reads it.

## Acceptance

1. A malformed id never builds a request.
2. Two instances reading the same id inside twelve hours call DE once.
3. A third lookup by one visitor in a window answers `limited` and never
   reaches DE; a cached profile costs nothing.
4. Three refusals in a row open the circuit for thirty minutes, across every
   instance; a not-found never counts as a refusal.
5. The empty-body `409` is never cached as a not-found.
6. The store holds only the trimmed, compressed profile.
7. A demo and development never call DE unless the source is set to live on
   purpose.
8. A profile stored before the circuit opened still answers while it is open.
9. `pnpm check` passes, with the existing client, budget and circuit tests run
   against the shared store's interface.

## Divergences from the code

| Today                                           | This spec                                   |
| ----------------------------------------------- | ------------------------------------------- |
| Cache, budget and circuit in process memory     | One shared store                            |
| The raw payload is held                         | The trimmed, compressed profile             |
| A third demo reads the real capture             | Two demos, both anonymised                  |
| A dev disk cache outside the store              | The store's interface, with a local backend |
| The circuit is checked before the cache         | A stored profile answers first              |
| Concurrent reads share one request per instance | One read lock across instances              |
