# The public release — decisions and why

The owner decided on 2026-10-04 to release the app from a new public
repository, built through the spec-driven order. This document records every
decision taken on the way there, the question that raised it, the options
weighed and the measurement that settled it, so the reasoning survives into the
project's case study. The rules that came out of it are in
[`specs/00-constitution.md`](../specs/00-constitution.md).

## Which process

Two plans existed for the same work:

- A seven-file migration pack, proposed when the release was first discussed:
  an inventory of every file, data contracts, the engine, the UI, a public
  posture and a migration plan.
- The order in [`spec-driven-order.md`](spec-driven-order.md): constitution,
  design, spec, plan, tasks, code.

Neither works alone. The spec-driven order has no step that decides what
travels, what to do with real data or what the deployment needs. The migration
pack is organised by layer, so it would have restated by hand what
[`business-rules.md`](business-rules.md) already holds against frame node-ids.

The decision: the spec-driven order is the spine, and the release lives inside
its steps. The inventory stops being a hand-judged table of 275 files. It falls
out of the specs: a file travels when a spec needs it. The cut rule becomes
mechanical.

## Where the code goes

A new public repository, deployed at a public URL. This repository keeps its
history; the public one starts from the specs. The owner chose it to serve two
readers at once, a player who uses the app and someone who reads the source to
evaluate the work, which is why every piece has to pass both tests.

## The real profile

`fixtures/profile-full.json` is a full real capture of a public profile: 406
missions, 495 mastered items, career stats. The demo profile Cy is the same
capture under another name, so its values are still a real person's. Three
options were weighed: ship it as the owner's own, synthesize every fixture, or
ship only the trimmed and anonymised output of `pnpm fixture`.

The decision: only trimmed and anonymised fixtures travel. The fields are
whitelisted, and the account id, display name and platform names replaced. The
values remain realistic, which keeps the tests honest, and they no longer
identify anyone.

## What DE blocks, and who pays for it

The first version of the question was "how often can we call DE before the
player's account is blocked?" The premise needed correcting, and the correction
shaped everything after it:

- DE refuses an **IP address** that calls too often, not an account.
- The browser cannot call DE (CORS), so every call leaves from our server. DE
  sees the server's IP, never the player's.
- In production a refusal takes the app down for every player for up to a day.
  Each player's game is untouched, because it connects from their own IP.
- In development the server is the developer's machine, whose IP is also their
  game's. A refusal there locks the developer out of Warframe, which is why
  development reads fixtures by default.

What protects the endpoint today, verified in `src/lib/warframe/`:

| Lock                 | Value                                               |
| -------------------- | --------------------------------------------------- |
| One read per profile | Every twelve hours (`PROFILE_TTL_MS`)               |
| Budget per visitor   | 2 new lookups every twelve hours                    |
| Circuit breaker      | 3 refusals in a row stop all calls for 30 minutes   |
| Format check         | Anything but 24 hex characters never leaves the app |

## Why serverless breaks those locks

All four locks live in the server's memory, in `Map`s and variables. On a
single server that is one memory, and the locks hold. A serverless host has no
single server: it starts copies of the app as traffic arrives and stops them
when it leaves, and each copy has its own memory. Copy A knows it read a
profile an hour ago; copy B, just started, does not, and calls DE again. A
breaker opened in A does not stop B. Under a burst, which is exactly when the
breaker matters, many copies call at once.

So "once every twelve hours" quietly becomes "once every twelve hours per
copy". The constitution therefore states the rule rather than the tool: the
window holds across the whole deployment.

## Which host

The owner asked for a free host to start. Checked on 2026-10-04 against each
provider's own documentation:

| Option                 | Free                                                        | What a player sees                                                                   | What it costs us                             |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------- |
| Vercel Hobby + Upstash | Yes; Vercel Hobby is for non-commercial use, as this app is | A normal load                                                                        | The four locks move to a shared store        |
| Render free            | Yes, 750 instance hours a month                             | After 15 minutes with no traffic the service sleeps, and waking takes about a minute | Nothing; a single instance shares its memory |
| Railway, Fly           | No permanent free tier (not re-checked that day)            | —                                                                                    | —                                            |

The decision: **Vercel Hobby with Upstash Redis**, confirmed in
[plan part 4](../specs/plan/04-deployment.md).

- A fan app sits idle most of the day, so on Render almost every first visitor
  would wait a minute on a loading page. For the reader evaluating the work,
  that is the first impression.
- Vercel is Next.js's own host, and it overwrites `x-forwarded-for` with the
  client's real address to prevent spoofing. That closes the hole
  [`api.md`](api.md) records as open: on a host that passes the header through,
  rotating it bypasses the visitor budget.
- The cost is code: the cache, the budget and the breaker move from memory to
  Upstash. The cache already reads and writes through `readEntry` and
  `writeEntry`, which is where the store plugs in.

Upstash's free plan, as published that day: 500,000 commands a month, 256 MB of
data, 10 GB of transfer a month.

## How long a read lasts

The owner had written twelve hours into BR-07 as an example and asked what the
right figure was, given the traffic. Two different questions were hiding in
it.

**The window does not prevent blocking.** What DE punishes is bursts, mostly of
mistyped ids, and the format check, the cached not-found, the visitor budget and
the breaker answer that. **The window decides how fresh the data is.** DE's own
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
the real floor of the arsenal.

What tipped it: **the app cannot see the foundry.** An item reaches the profile
only once it is built and has gained affinity, so nothing the app reads about an
item changes faster than its build. The rest of what it reads moves by the day
as well: the Mastery Rank test can be taken once every 24 hours, and syndicate
standing has a daily cap.

The decision: **twelve hours**, which is also what the code, BR-07 and the
player menu already said. The Figma frame `270:1145` drew 24, and the owner
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
travelling code reads, and counted the base64 Upstash stores: 15 KB for the
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

The file stays private, for design and development. A spec in the public
repository still links its frames by node-id, and those links open only for
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

## Documents that describe the app as it is

The constitution closed with a rule: every document in `docs/` describes the
app as it is, before any spec cites it. A spec that cited a document describing
a deleted screen would inherit the contradiction. Each document was checked on
2026-10-04 against the code, by every file path and identifier it names.

Removed, because they described screens or a direction that no longer exist:

- `star-chart.md`, which called itself superseded. The star-chart Home it
  documented was deleted in the Cetus redesign.
- `design-system.md`, superseded by `cetus.md`. Its measuring method lives on
  in `scripts/palette.mjs`.
- `lore.md`. The story timeline that rendered `lore.yaml` was deleted, and no
  screen reads the file. `src/lib/lore/` survives only as an unused cookie
  reader, so by the cut rule neither the code nor the file travels.

Corrected, because a spec will cite them:

- `ui.md`, rewritten. It opened on the "Orokin Terminal" direction, its route
  map still had Home as the star chart and `?view=story`, and it described
  mobile as a fallback when the frames are drawn at 390 px. It now carries the
  current routes with each screen's frame.
- `system.md`, rewritten. It cited the removed source badges and
  `src/lib/starchart/guide.ts`. The item and place states are now the ones in
  `src/lib/place/state.ts`.
- `narrative.md`, without the timeline view and the lore layer, and with `since`
  kept in a cookie rather than browser storage.
- `development.md`, which said `pnpm palette` fails below its floors. It
  reports and exits clean.
- `api.md`, `items.md`, `place-index.md`, `curated-files.md`, `cetus.md`,
  `step-by-step.md` and `equipment-unlock-requirements.md`, each for a
  paragraph or a link that pointed at something removed.

The check found one rule whose code had fallen behind: BR-05 asks for the goal
behind "Set a goal" to follow the frontier and focus, and focus was removed with
the star-chart Home. `business-rules.md` now records BR-05 as partial, so the
spec for `/goals` carries it as acceptance criteria.

It also found code no screen reaches, recorded here so the plan does not port
it: the lore layer, `fetchWikiExtract` and `fetchWikiImage` (the quest card's
synopsis, gone with the timeline), `NO_DATA` in `src/content/states.ts`, and
`NAV` in `src/content/nav.ts`. None of it travels, because no spec names it.

## Figma is the only source of truth

Drafting the list of specs meant reading each pinned frame against the code,
and two screens did not match what the code and the scope said.

The first was Catch me up. The Summary frame draws Arsenal and Collection and
ends in "Next". The code, the project's instructions and the first draft of the constitution
also had story quests, the live Nightwave and a suggested goal. Asked which
was Catch me up, the owner answered that Figma is respected exactly as drawn:
it is the only source of truth, and where the project differs, the project
changes. The visual layer of the code is behind the latest frames, and many
changes follow from that.

The owner also pointed to the flow map, the section `421:614` "Lo-fi
Wireframes", where connectors draw which screen leads to which. Two decisions
came out of it, and they are separate:

- From the Summary the player either opens an item or presses Next, which
  goes straight to the map on the frontier or the focus: the view of one
  planet. Next does not lead to quests.
- A goal leads to the Step by step of the item or the quest it names. Goals
  have no plan screen of their own.

The second mismatch was those plan screens: `/goal` and `/target` render a
plan with Done / Next / Locked steps and Yes / No questions, and no frame draws
them. The answer above removes them rather than designing them.

All of this is recorded as BR-34 to BR-37 in
[`business-rules.md`](business-rules.md#the-flow-between-screens), and the
feature definitions in the project's instructions, the README and the constitution were
corrected the same day. Story quests leave Catch me up but not the app: a quest
still has its Step by step, and its chain still comes from the spine (BR-28).

## What follows for the plan

- The cache, the visitor budget and the circuit breaker move to the shared
  store, behind the interfaces they already have.
- The stored profile is the whitelisted, compressed form, not the raw payload.
- The budget can stay as it is: with a twelve-hour window, re-reading one's own
  profile costs at most one lookup per window.
- The README's privacy section is rewritten for a deployed app, where it is a
  promise to strangers, not a description of a local script.
