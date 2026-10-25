# 00 — Constitution

This page holds the rules for Onkko's Archive, a fan app for Warframe players
coming back after a break. The app does two things, catching a player up and
leading them to one goal, and the rules below keep it to those two. Every
spec and every change answers to it. Where one of them disagrees with this
page, this page wins, and the other is wrong until this page is changed.

## What it is

Onkko's Archive reads a player's public Warframe profile and compares it with a
hand-curated model of how the game's things are reached. It is not an inventory
tracker: it answers what is left, in what order, and where to go looking. Its
two features are under Scope, below, and what it cannot read is under "What
cannot be read".

This document records the rules the work follows, and what each one costs. The reasoning behind every decision below, with the
measurements that settled it, is in [`docs/history/public-release.md`](../history/public-release.md).

## Where the work ends

In this repository, which is public, in the app it builds for Windows and
Linux, and at the public URL where the same screens run as a demo. It serves
two readers, and neither is optional:

- **A returning player.** Someone back after months installs the app, pastes
  an account id, and learns what the Origin System did while they were away
  and what stands between them and one concrete goal. They may first try the
  demo at the URL, which needs nothing installed. They never read the source.
- **Someone evaluating the work.** A designer or an engineer who opens the
  repository to see how it was reasoned. They may never type an account id.

Both readers apply one test twice: a piece ships only if it earns its place on
both counts. Code that works but cannot be explained is filler. A document that
reads well but governs nothing a player reaches is filler too.

**The owner writes the public history.** Every commit and push in this
repository and its Storybook is the owner's. Claude prepares the changes and
never commits, pushes or signs there, and no file, commit or pull request
carries an AI attribution line. The owner says openly, in their own words, that
the work was done with Claude's help. Set by the owner on 2026-10-05, so that the open-source
history raises no doubt about who controls it.

## The order

The app was built in a fixed order: constitution, design, spec, plan, tasks,
code, as [`spec-driven-order.md`](../history/spec-driven-order.md) records.
That build ended on 2026-10-24 (owner); the plan and the tasks are kept in
[`docs/history/`](../history/README.md) and are no longer written.

A change since then keeps the same direction, shorter: this page if a rule
moves, then the frame in Figma, then the spec, then the code, with its tests.
[`maintaining.md`](../maintaining.md) says how, step by step.

## Scope: two features, and nothing beside them

- **Catch me up**: what shipped in the arsenal and the collection since the
  update the player last played, as the Summary frame draws it (BR-35).
- **Reach a goal**: the Step by step of an item or a quest, reached from a
  curated goal or from anything with a known source found through the search
  on Goal (BR-37).

Both end on the map, at one place (BR-36). The flow between screens is the one
the Figma section `421:614` draws (BR-34).

The shell both features live in, and whatever either depends on, are built
with them. Anything else is filler by definition, however well it works.
The app's window, its updates and the data it downloads, and the demo's way
to the download, are that shell: without them no player reaches either
feature with their own account (owner, 2026-10-22; spec 13).

## The cut rule

**The default is out.** A file, route, document, token, fixture or dependency
is in this repository for one of three reasons, and only these:

1. A spec names it.
2. Something a spec names depends on it.
3. It records a decision that governs future work.

These are not reasons: it works; it took effort; it might be useful later. A
document that marks itself superseded fails reason 3 by its own admission. A
document that describes a screen that no longer exists is corrected or
removed. What is removed remains in the history, which is where history
belongs.

## The design is the frames

The Figma file `Warframe`, page Wireframes, is the design
([BR-33](../business-rules.md#br-33--the-build-looks-exactly-like-the-frames)).
The build matches each frame exactly: layout, order, spacing, sizes, type,
colour, borders, radii, icons, states and every static word. Where the code
cannot produce the frame, the code changes.

- The frame does not fix the data. A sample value drawn in a frame is a
  placeholder; the spec states where the real value comes from.
- A spec links a frame by node-id at the pinned version of the file. It never
  pastes a screenshot.
- Where two frames disagree, or a frame contradicts the data, the owner
  corrects the frame. The build does not choose a reading on its own.
- The frames are drawn at 390 px, and the app is never wider than 600
  ([BR-39](../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes)):
  width changes how wide things grow, never the content.
- [`docs/business-rules.md`](../business-rules.md) holds the rules the
  owner pinned to the frames. A spec cites them by id and adds acceptance
  criteria; it does not restate them.

## The anchor holds

Warframe ends when you have everything. The app serves that, but its point is
that the player should also understand what they are chasing, which is why
quests and the curated prose sit beside the item data. Five rules follow, and
they govern every screen:

- **Never a warehouse clerk, and never an essay.** Copy speaks in terms of the
  world and the story, carries the hard fact inside the sentence, and then
  stops. "Barrel, Blueprint, Receiver · Caches · Rot. B · 6.45%" beats "3 items
  remaining"; neither is replaced by atmosphere with no data in it. The tone
  lives in the heading and the lead line; everything under them is data first
  and built to be scanned, not read. A second sentence that only explains the
  first is the tell that the copy has drifted, and it goes.
- **Never explain the machine.** The player never reads a profile field, a
  source badge, a file path or a rule id. A goal says "MR 27 of 28", never
  "PlayerLevel is 27, needs to be >= 28"; a confirmed step shows the tick and
  not the value behind it. What cannot be read is one short line or nothing.
- **Filter and curate; never mirror.** The wiki gathers everything about a
  thing. The app answers one question about it: where it comes from, in what
  order, for this player. For the rest it links to the wiki. A screen that only
  restates another source does not exist. The search on Goal reaches anything
  with a known source, and what it opens is that curated answer: best odds
  first, places the player already reaches ahead of the rest.
- **Name a thing, show its icon.** Wherever an item, a part, a resource or a
  place is named as a fact, its art rides with it: the catalog's for items, the
  wiki's for places. A name with no art available renders as a name, never as
  a placeholder box.
- **Show what the player can reach; count what lies beyond.** The wiki hands
  over the whole game at once, to a player who does not yet know what any of
  it is. The app shows what the player's progress and Mastery Rank allow, and
  turns the rest into a count that names what it counts and what stands in
  the way ("4 more primary weapons need Mastery Rank 8 or higher. You are
  Mastery Rank 5."). Exploring hides and counts; a search shows everything,
  because the player asked; a plan dims the steps that wait on an unmet
  prerequisite and never hides them. What cannot be read is in reach
  ([BR-59](../business-rules.md#br-59--what-the-player-can-reach) to
  [BR-63](../business-rules.md#br-63--a-plan-dims-what-waits-on-an-unmet-prerequisite)).

## What cannot be read

The public profile does not expose completed quests, foundry contents, or mods
by slot. A quest is confirmed by wiki-cited evidence or it is unread; absence of
evidence is never absence of the deed. What the profile does not prove is asked
of the player or not claimed at all. The app never infers to fill a gap.

## No computed state

Three sources with three rates of change, crossed on every request and never
copied into one another: the player profile, the game catalog (with the
snapshots vendored in `data/vendor/`, which are source data), and the curated
files. No database, no search index, no stored result to invalidate later. A
proposal to store a computed value is a change to this document first.

Source data is written only by a commit to this repository. The app on a
player's machine replaces its copy of `data/` with the set published from
`main`, whole and verified, and never with anything it worked out itself
(owner, 2026-10-22; spec 13).

## It runs on the player's machine, and it protects DE's endpoint

DE refuses an **IP address**, not an account, and its edge refuses a server's
address outright: on 2026-10-21 production's very first read was answered
`403` by DE's CDN, while the same read from a player's own machine answered
with the profile, and a web page cannot read it at all
([`public-release.md`](../history/public-release.md#why-the-app-moved-to-the-players-machine)).
So a player's own account is read by the app on their own machine, from their
own address. The website is a demo of the same screens and never calls DE.

That address is also their game's: a refusal locks the player out of Warframe
itself for up to a day. The locks protect the player first, so they live in
the code and no setting turns one off or shortens it. Hence:

- **One read per account every twelve hours, on each machine.** The window
  holds for the app on that machine, across restarts, and is never shorter
  than DE's own `Cache-Control` allows.
- **Every lock is kept the same way, on the machine's disk:** the account-id
  format check before any call, the cached not-found, the machine's budget of
  new lookups, and the circuit breaker after consecutive refusals.
- **No refresh action**, now or later.
- **Only what the app reads is kept**, and only for the window. Nothing about a
  player is persisted beyond it, and nothing leaves their machine but the read
  itself.
- **Only the app reaches DE, and only for the player at its window.** The
  server it runs answers its own window and nothing else on the machine, so
  no web page the player visits can make it call DE.
- **Development reads fixtures by default.** Calling DE from a developer's
  machine is a deliberate act, never the default. The installed app is the
  one place that reads live by default.

The app, its store and the demo's host are described in [`desktop.md`](../desktop.md) and [`development.md`](../development.md).

## Nothing real about a person ships

- **No real profile is committed.** Fixtures are the output of `pnpm fixture`: whitelisted fields, with the display name replaced and the
  account id and platform names removed.
- **No local configuration, secret or personal id is committed**, in the tree
  or in its history.
- **Third-party material keeps its own terms.** The MIT licence covers our code
  and curated files only. Images are served from the wiki and DE's CDN, never
  rehosted. Data vendored from the wiki's modules or DE's tables is committed
  with its source named and under that source's licence.

## The design system

The owner asked on 2026-10-05 for a design system that is impeccable, easy to
change and built to grow. The frames are its source; the code is its one
implementation.

- **Three layers of tokens.** Primitives hold the raw values the frames draw:
  every colour, type style, space, radius, border, shadow, blur, duration and
  easing. Semantic tokens name a role (`surface`, `ink-muted`, `accent`,
  `state-mastered`) and point at a primitive. Components use semantic tokens
  only. Changing a value is one line in one place, and every screen follows.
- **Names follow Figma.** A token or component carries the name its Figma style
  or component carries, so a change in the frame has one obvious place to land
  in the code.
- **Components before screens.** Anything the frames draw twice is a component:
  a button, a badge, a card, a field, a segmented control, a group row, an item
  tile, a sheet, a place orb. Each one exposes the variants and states its Figma
  component draws (an item tile is Rank, Mastered or plain; a badge is Start
  here, New or Mastered) and nothing a screen invents. A screen composes
  components; it never restyles one.
- **A component's styles live beside it.** The token layer is global; every
  other rule belongs to the one component it styles. No screen-wide stylesheet
  grows with each screen.
- **No raw value outside the token layer**, and no token that nothing applies.
  Both are checked by a test, not by review.
- **Storybook is the catalogue.** Every token and every component, in every
  state its frame draws, is visible on its own in Storybook, so a component is
  checked against its Figma component before any screen uses it. The owner
  chose it on 2026-10-05; it is free and open source, and is published as a
  static site from the same host as the demo.

## The code is built to be read

The owner asked on 2026-10-05 that the front and the back both be
componentised, organised and written to read well. That is a rule of this
repository, not a wish:

- **Layers that point one way.** The domain (profile parsing, the rules engine,
  the catalog, the place index) is plain TypeScript with no React, no Next and
  no I/O. Data access (DE's endpoint, the shared store, the wiki, the vendored
  files) sits under it and is the only code that reaches the outside. Routes
  are thin: they read, call the domain and hand the result to components.
  Components render what they are given and fetch nothing. A lint rule enforces
  the direction of every import.
- **One thing per file**, named for what it is. A file that needs a second
  reason to change is split.
- **Types carry the meaning.** Strict TypeScript, no `any`, and domain states as
  unions (`done | ranked | absent | unknown`), so an impossible state cannot be
  written.
- **The reader never needs a comment.** Names, small functions and the docs do
  the explaining.
- **Tests sit at the domain**, where the rules live, and every component's
  states are checked against its frame.

## The gates

A change is done when all of these hold:

- `pnpm check` passes: typecheck, ESLint, Prettier, Vitest.
- Each screen matches its frame at the frame's width, 390 px, and holds BR-39
  at 360 and 600, and as a centred 600 px column in a wider window. `pnpm check` can see neither.
- `pnpm palette` runs whenever a colour moves. It measures every ink against the
  protanope and deuteranope matrices, because the owner is colour blind. Its
  findings go back to the owner as feedback on the frame. It never blocks a
  build and never overrules a frame.
- The build passes on both targets, not only locally: the demo on its host,
  and the app's installers for Windows and Linux, built by the release
  workflow.
- No comments in any file. What needs explaining goes in `docs/`.
- No user-facing string outside `src/content/`, no internal href outside
  `src/routes.ts`, no hard-coded colour, radius, duration or easing outside
  the token layer, no token that nothing applies, and no import against the
  direction of the layers. Each is a test or a lint rule.
- Documentation and specs are in English. UI copy is a separate concern.

## Settled before the spec

Nothing is left open. These were the last questions, closed by the owner on
2026-10-04:

- **The pinned design** is the section `661:4302` "App flows" on the page
  Wireframes of the Figma file `unteOMr3YYUIyBE6XF0AD6`, as the owner approved
  it on 2026-10-18 (T-27b). It replaced `421:590` "High-fi Wireframes", pinned
  on 2026-10-04 and since deleted. Every spec is written against it. A frame
  changed inside it after that date is a design change: the spec is updated
  before the code follows.
- **The Figma file is private**, for the owner's design and development use. It
  is never linked from the README. A spec still links its frames by node-id; a reader without access reads the spec's behaviour and
  acceptance criteria, which stand without the picture. Publishing the file to
  make those links open is not a fix; it would publish the real display name
  and rank the frames draw as sample values.
- **Every slip in the drawing is corrected.** Where a frame and a rule
  disagreed, the owner said which wins and corrected the frame. The corrections
  were applied in Figma on 2026-10-06, and no slip remains.
- **Every document in `docs/` describes the app as it is**, and each one is
  here by the cut rule.
