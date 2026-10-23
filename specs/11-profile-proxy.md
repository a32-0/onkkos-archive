# 11 · The profile proxy

Every screen depends on the player's public profile, which the app reads from
Digital Extremes (DE), the game's maker. This spec covers how that read
happens, how long the result is kept, and how the app avoids calling DE so
often that DE blocks it. The read leaves from the player's own machine, in the
app of [spec 13](13-desktop.md), so a block would lock that player out of
their own game for up to a day. The demo never reads DE. No frame draws it. What a failed read looks like is in spec 02.

## Rules

- The constitution: "It runs on the player's machine, and it protects DE's
  endpoint", "No computed state", "Nothing real about a person ships".
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
   default in development. On the demo, which never reads live, any other id
   answers `not-found` without reading anything (spec 02).
3. **Stored.** A stored profile for this id, younger than twelve hours, answers
   at once. So does a stored not-found, within DE's own `max-age` (clamped to
   between one minute and a day). The owner set on 2026-10-06 that this comes
   before the circuit: a player whose profile is stored keeps reading it while
   the circuit is open.
4. **Circuit.** If the circuit is open, answer `circuit-open` with the time it
   closes.
5. **Lock.** One read at a time per id: a second screen asking for the same id
   while it is read waits for that read's result, for up to fifteen seconds,
   and answers with it; it spends no lookup and never calls DE.
6. **Budget.** A miss spends one of the machine's two lookups for the window.
   A spent budget answers `limited` with the time the window ends, and never
   reaches DE.
7. **Read.** One request to DE's endpoint, fifteen seconds at most.
8. **Classify**, as [`api.md`](../docs/api.md#status-codes) records: a profile,
   `not-found` (cached), `throttled` or `upstream` (never cached, counted by the
   circuit), `malformed` (never cached).
9. **Keep** only what the app reads: the profile cut to the fields any spec
   uses, compressed, for twelve hours. The raw payload is never stored.

A refusal, a read that gets no answer and a store that fails each write one
line to the server's log: DE's status and the headers that say who
refused, or the error's name. The line never holds the account id, the
visitor or the profile (added 2026-10-21, when production's first read was
refused and nothing said why).

How the store implements each step: [plan part 2](plan/02-architecture.md).

## Kept on the machine, across restarts

The cache, the stored not-founds, the budget and the circuit live in one store
file in the app's own folder (spec 13), behind the interfaces `cache.ts`,
`budget.ts` and `circuit.ts` already have. The app runs one server, so its
memory holds them while it runs and the file keeps them when it closes:
closing and opening the app never reads DE again inside the window, and never
resets a budget or closes an open circuit.

| Lock      | Key                     | Lives for                     |
| --------- | ----------------------- | ----------------------------- |
| Profile   | the account id          | twelve hours                  |
| Not-found | the account id          | DE's `max-age`, clamped       |
| Budget    | the machine             | twelve hours from first spend |
| Circuit   | one key for the machine | thirty minutes once opened    |

Only the app's window can reach its server (spec 13), so every request is the
player's own and the budget is the machine's. Development uses the memory
store, which keeps the same locks until the process stops.

## What is kept, and what is not

- Kept: the trimmed profile, for twelve hours; nothing else about a player.
- On the device: `wf_account` (one year) and `wf_since` (the month), both
  cookies; `wf_place` (BR-46); the ticks of spec 10 in browser storage.
- Never: the raw payload, a computed result, anything past the window.
- Disconnect clears both cookies; the stored profile simply expires.

## The fixtures

- `profile-cy.json` and `profile-ordis.json` are the demos. Both are the
  output of `pnpm fixture`: whitelisted fields, with the display name replaced
  and the account id and platform names removed.
- Tests read fixtures, never DE.
- No real capture is committed, and no demo id reads one.

## Acceptance

1. A malformed id never builds a request.
2. Two screens reading the same id at once, or the same id twice inside
   twelve hours with the app closed and opened between them, call DE once.
3. A third lookup on one machine in a window answers `limited` and never
   reaches DE; a cached profile costs nothing.
4. Three refusals in a row open the circuit for thirty minutes, and a restart
   does not close it; a not-found never counts as a refusal.
5. The empty-body `409` is never cached as a not-found.
6. The store holds only the trimmed, compressed profile.
7. A demo id, the demo and development never call DE; development does when
   the source is set to live on purpose, and the app by default.
8. A profile stored before the circuit opened still answers while it is open.
9. `pnpm check` passes, with the client, budget and circuit tests run against
   the store's interface, and the store file's own tests.
