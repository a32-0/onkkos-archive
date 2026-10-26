# The public release: decisions and why

On 2026-10-04 the owner decided to release Onkko's Archive from this public
repository, deployed for anyone to use and built through the
[spec-driven order](spec-driven-order.md). On 2026-10-22 the player's own
account moved to an app on their machine, with the website kept as a demo
(below). This page records each decision
made on the way: the question that raised it, the options weighed and the
measurement that settled it, so the reasoning is still there for the
project's case study. The rules that came out of it are in
[`specs/00-constitution.md`](../specs/00-constitution.md).

## Who it serves

A player who uses the app, and someone who reads the source to evaluate the
work. The owner chose to serve both at once, which is why every piece has to
pass both tests. The release lives inside the spec-driven order's steps: a
file is here when a spec needs it, so the cut rule is mechanical.

## The real profile

The demos needed realistic data, and the one at hand was a full real capture
of a public profile: 406 missions, 495 mastered items, career stats. Under
another name its values were still a real person's. Three options were
weighed: ship it as the owner's own, synthesize every fixture, or ship only
the trimmed and anonymised output of `pnpm fixture`.

The decision: only trimmed and anonymised fixtures are committed. The fields are
whitelisted, the display name replaced, and the account id and platform names
removed. The
values remain realistic, which keeps the tests honest, and they no longer
identify anyone.

## What DE blocks, and who pays for it

The first version of the question was "how often can we call DE before the
player's account is blocked?" Its premise was wrong, and every later decision follows
from correcting it:

- DE refuses an IP address that calls too often, not an account.
- The browser cannot call DE (CORS), so every call leaves from our server. DE
  sees the server's IP, never the player's.
- In production a refusal takes the app down for every player for up to a day.
  Each player's game is untouched, because it connects from their own IP.
- In development the server is the developer's machine, whose IP is also their
  game's. A refusal there locks the developer out of Warframe, which is why
  development reads fixtures by default.

The locks that protect the endpoint:

| Lock                 | Value                                               |
| -------------------- | --------------------------------------------------- |
| One read per profile | Every twelve hours (`PROFILE_TTL_MS`)               |
| Budget per visitor   | 2 new lookups every twelve hours                    |
| Circuit breaker      | 3 refusals in a row stop all calls for 30 minutes   |
| Format check         | Anything but 24 hex characters never leaves the app |

## Why serverless breaks those locks

Kept in a server's memory, in `Map`s and variables, the four locks hold on a
single server, because that is one memory. A serverless host has no
single server: it starts copies of the app as traffic arrives and stops them
when it leaves, and each copy has its own memory. Copy A knows it read a
profile an hour ago; copy B, just started, does not, and calls DE again. A
breaker opened in A does not stop B. Under a burst, when the breaker matters
most, many copies call at once.

So "once every twelve hours" turns into "once every twelve hours per
copy". The constitution therefore states the rule rather than the tool: the
window holds across the whole deployment.

## Which host

The owner asked for a free host to start. Checked on 2026-10-04 against each
provider's own documentation:

| Option                 | Free                                                        | What a player sees                                                                   | What it costs us                             |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| Vercel Hobby + Upstash | Yes; Vercel Hobby is for non-commercial use, as this app is | A normal load                                                                        | The four locks move to a shared store        |
| Render free            | Yes, 750 instance hours a month                             | After 15 minutes with no traffic the service sleeps, and waking takes about a minute | Nothing; a single instance shares its memory |
| Railway, Fly           | No permanent free tier (not re-checked that day)            | n/a                                                                                  | n/a                                          |

The decision: Vercel Hobby with Upstash Redis, confirmed in
[plan part 4](plan/04-deployment.md).

- A fan app sits idle most of the day, so on Render almost every first visitor
  would wait a minute on a loading page. For the reader evaluating the work,
  that is the first impression.
- Vercel is Next.js's own host, and it overwrites `x-forwarded-for` with the
  client's real address to prevent spoofing. That closes a hole: on a host
  that passes the header through, rotating it bypasses the visitor budget.
- The cost is code: the cache, the budget and the breaker live in Upstash,
  behind one store interface ([spec 11](../specs/11-profile-proxy.md)).

Upstash's free plan, as published that day: 500,000 commands a month, 256 MB of
data, 10 GB of transfer a month.

## How long a read lasts

The owner had written twelve hours into BR-07 as an example and asked what the
right figure was, given the traffic. Two different questions were hiding in
it.

The window does not prevent blocking. What DE punishes is bursts, mostly of
mistyped ids, and the format check, the cached not-found, the visitor budget and
the breaker answer that. The window decides how fresh the data is. DE's own
response allows a re-read every ten minutes (`Cache-Control: max-age=600`).

One hour was proposed first, on the argument that a player who finishes a step
should see it the same day. The owner objected from how the game is played:
almost everything takes longer than eight hours to build, a player chases two or
three things a day, and the farm and the build are slow. The catalog confirmed
it (`buildTime` in `@wfcd/items`):

| Class                    | Most common       | Longest |
| ------------------------ | ----------------- | ------- |
| Primary and secondary    | 12 h              | 24 h    |
| Melee                    | 12 h              | 24 h    |
| Arch-guns and arch-melee | 12 h              | 24 h    |
| Weapon parts             | 12 h              | 24 h    |
| Companions and Sentinels | 24 h              | 24 h    |
| Warframes                | 72 h (111 of 118) | 72 h    |

The few builds that take minutes are not crafted the usual way. Twelve hours is
the arsenal's floor.

What tipped it: the app cannot see the foundry. An item reaches the profile
only once it is built and has gained affinity, so nothing the app reads about an
item changes faster than its build. The rest of what it reads moves by the day
as well: the Mastery Rank test can be taken once every 24 hours, and syndicate
standing has a daily cap.

The decision: twelve hours, which is also what BR-07 and the player menu
already said. The Figma frame `270:1145` drew 24, and the owner
corrected it to 12 the same day.

The cost, accepted knowingly: progress on the star chart is fast. A new player
can open two or three junctions in an evening, and the app keeps pointing at
the earlier one for up to twelve hours. It is the only path where the window
shows, it affects a player with little at stake, and the next read catches up.

## What Upstash actually spends

The owner asked whether a longer window would leave more room on the free plan.
Only a little, because the window moves the smallest share of the cost:

| What              | When it happens                | Does a longer window lower it?                            |
| ----------------- | ------------------------------ | --------------------------------------------------------- |
| Reading a profile | On every screen a player opens | No; it follows screens opened, not the window             |
| Writing a profile | Once per window per player     | Yes                                                       |
| Space held        | While the profile is kept      | The opposite; a longer window keeps more profiles at once |

An example of 300 players a day, ten screens each: about 117,000 commands a
month with a one-hour window, about 100,000 with 24 hours. The free plan allows
500,000.

The lever that matters is the size of the profile, measured on the fixtures:

| Form                                           | Size   |
| ---------------------------------------------- | ------ |
| The full profile as DE returns it              | 526 KB |
| Only the fields the app reads (the Cy fixture) | 159 KB |
| The same, compressed                           | 18 KB  |

Plan part 2 re-measured it on 2026-10-06 against the seven fields the
app reads, and counted the base64 Upstash stores: 15 KB for the
real capture. At that size the 256 MB hold about 17,000 profiles at once and
the 10 GB of transfer covers about 660,000 reads a month, so the 500,000
commands are what binds. Keeping only what the
app reads was the decision that made the free plan sufficient. It is also the
better rule for privacy.

## The pinned design, and a private file

The owner pinned the design as the section `421:590` "High-fi Wireframes" on
the page Wireframes, as it stood on 2026-10-04, after correcting the two slips
in the drawing that day: the player menu now reads twelve hours, and closed
groups in `257:653` point down like the collapsed row in `367:291`.

The file stays private, for design and development. A spec still links its
frames by node-id, and those links open only for
the owner. That is deliberate: the spec's behaviour and acceptance criteria
have to stand without the picture, and the frames draw a real display name and
Mastery Rank as sample values, so publishing the file would publish them.

Pinning the section made one gap concrete. `business-rules.md` was transcribed
from the comments on 2026-10-03 and covers the frames the owner commented. The
section holds more screens than that, with no rule pinned to them: the Step by
step frames for Prime, Prime Vaulted, Tenet, Prisma, Hound, Kavat, Predasite and
Companion Special (`372:1070`, `382:1528`, `382:1010`, `382:1153`, `398:1655`,
`396:757`, `396:1179`, `396:498`), Planet Details (`299:597`), Goal (`208:90`),
a second Summary (`264:67`) and three more Navigation frames (`312:199`,
`215:610`, `270:786`). They are not open questions; under BR-33 a frame is the
design whether or not a comment sits on it. Each one is covered by the spec of
the screen it belongs to, which reads it directly.

## Figma is the only source of truth

Drafting the list of specs meant reading each pinned frame against the scope,
and two screens did not match it.

The first was Catch me up. The Summary frame draws Arsenal and Collection and
ends in "Next". The first draft of the constitution also had story quests, the
live Nightwave and a suggested goal. Asked which was Catch me up, the owner
answered that Figma is respected exactly as drawn: it is the only source of
truth, and where the project differs, the project changes.

The owner also pointed to the flow map, the section `421:614` "Lo-fi
Wireframes", where connectors draw which screen leads to which. Two decisions
came out of it, and they are separate:

- From the Summary the player either opens an item or presses Next, which
  goes straight to the map on the frontier or the focus: the view of one
  planet. Next does not lead to quests.
- A goal leads to the Step by step of the item or the quest it names. Goals
  have no plan screen of their own.

The second was a plan screen of a goal's own, with Done / Next / Locked steps
and Yes / No questions. No frame draws one, so the answer above leaves it out
rather than designing it.

All of this is recorded as BR-34 to BR-37 in
[`business-rules.md`](../business-rules.md#the-flow-between-screens), and the
constitution's feature definitions were corrected the same day. Story quests leave Catch me up but not the app: a quest
still has its Step by step, and its chain still comes from the spine (BR-28).

## Why the app moved to the player's machine

On 2026-10-21 production was set to read DE, through Upstash and every lock,
and the owner's own account answered `throttled`. The client logged nothing
then, so it was made to log each refusal's status and the headers that say
who refused, never the id. Three single reads, each of the owner's own
account, settled the cause:

| Read from                                          | Answer                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Production on Vercel                               | `403` from `AkamaiGHost`, empty body, no `retry-after`, on the deployment's very first request |
| The owner's browser, a `fetch` from the app's page | DE answered without `Access-Control-Allow-Origin`, so the page could not read it               |
| The owner's machine, `pnpm dev` with `live`        | The profile                                                                                    |

DE's CDN refuses a cloud server's address before DE sees the request, and a
web page is not allowed to read the answer. The player's own machine reads it,
as their game does. Nothing that hides a server from that refusal was
considered: no rotating addresses, no borrowed residential ones, no posing as
a browser. The refusal is DE's choice.

The options weighed that day:

| Option                                   | For                                                | Against                                                                                               |
| ---------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Ask DE to let the server read            | Nothing changes for a player                       | Depends on an answer that may never come                                                              |
| A browser extension                      | Reads from the player's address                    | A second product to publish per browser, and the screens still render on a server                     |
| A desktop app, Electron                  | The Next server runs unchanged inside it           | Heavier than a native app: its own Chromium, about 100 MB to download                                 |
| A desktop app, Tauri with Node beside it | A smaller installer                                | A second process to manage, Rust in the build, and WebKitGTK on Linux; the Next server's weight stays |
| A desktop app, Tauri with no server      | About 10 MB, and the same code for Android and iOS | Every page's data loading rewritten first                                                             |
| Native, WinUI or WPF                     | The lightest and most native                       | Windows only, and every screen and the engine rewritten in C#                                         |

The owner chose on 2026-10-22: **Electron, for Windows and Linux first, then
Android**, in this repository, with the website kept as a demo that needs
nothing installed. Electron is the one option that keeps every screen, the
engine and the locks as they are, for a first desktop app. Android cannot run
a Next server, so its phase starts with the refactor that loads each page's
data without one; the desktop app does not wait for it.

What moving changes:

- **A refusal now costs the player, not everyone.** The locks protect that
  player's own game, so they stay in code, kept on the machine's disk across
  restarts, and no setting shortens one.
- **No shared store.** One machine runs one server, so the locks need no
  Upstash; the demo never calls DE and needs no store either.
- **Who plays where** was not published by DE when asked (2026-10-22). Steam
  alone holds 45,000 to 86,000 players at once on monthly average, which
  suggests PC is most of the active players, and every console player can
  still use the app on a computer or, later, a phone: cross-save makes the
  profile the same wherever they play.

## What follows for the plan

- The cache, the visitor budget and the circuit breaker live in the app's
  store on the player's disk, since 2026-10-22; before, in the shared store.
- The stored profile is the whitelisted, compressed form, not the raw payload.
- The budget can stay as it is: with a twelve-hour window, re-reading one's own
  profile costs at most one lookup per window.
- The README's privacy section is rewritten for a deployed app, where
  strangers read it as a promise.
