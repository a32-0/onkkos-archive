# 00 — Constitution

This page holds the rules for Onkko's Archive, a fan app for Warframe players
coming back after a break. The app does two things, catching a player up and
leading them to one goal, and the rules below keep it to those two. Every spec,
plan part and task written after this page answers to it. Where one of them
disagrees with this page, this page wins, and the other is wrong until this
page is changed.

## What it is

Onkko's Archive reads a player's public Warframe profile and compares it with a
hand-curated model of how the game's things are reached. It is not an inventory
tracker: it answers what is left, in what order, and where to go looking. Its
two features are under Scope, below, and what it cannot read is under "What
cannot be read".

This document records the rules the work follows, and what each one costs. The reasoning behind every decision below, with the
measurements that settled it, is in [`docs/public-release.md`](../docs/public-release.md).

## Where the work ends

In a **new public repository**, deployed at a public URL. The specs are written
in this repository; the code step builds the public one from them. This
repository stays behind as the history of how the product was reasoned.

The public repository serves two readers, and neither is optional:

- **A returning player.** Someone back after months opens the URL, pastes an
  account id, and learns what the Origin System did while they were away and
  what stands between them and one concrete goal. They never read the source.
- **Someone evaluating the work.** A designer or an engineer who opens the
  repository to see how it was reasoned. They may never type an account id.

Both readers apply one test twice: a piece ships only if it earns its place on
both counts. Code that works but cannot be explained is filler. A document that
reads well but governs nothing a player reaches is filler too.

**The owner writes the public history.** Every commit and push in the public
repository and its Storybook is the owner's. Claude prepares the changes and
never commits, pushes or signs there, and no file, commit or pull request
carries an AI attribution line. The owner says openly, in their own words, that
the work was done with Claude's help. Set by the owner on 2026-10-05, so that the open-source
history raises no doubt about who controls it.

## The order

Constitution, design, spec, plan, tasks, code, as
[`docs/spec-driven-order.md`](../docs/spec-driven-order.md) sets out. The
release adds no step of its own; it lives inside the six:

| Step   | What the release adds                                                     |
| ------ | ------------------------------------------------------------------------- |
| Design | The Figma version every spec is written against is pinned                 |
| Spec   | What a spec names travels to the public repository                        |
| Plan   | The tree of the public repository, each file with its origin here         |
| Tasks  | The first task scaffolds the public repository; the rest follow the specs |
| Code   | Written in the public repository, never here                              |

## Scope: two features, and nothing beside them

- **Catch me up**: what shipped in the arsenal and the collection since the
  update the player last played, as the Summary frame draws it (BR-35).
- **Reach a goal**: the Step by step of an item or a quest, reached from a
  curated goal or from anything with a known source found through the search
  on Goal (BR-37).

Both end on the map, at one place (BR-36). The flow between screens is the one
the Figma section `421:614` draws (BR-34).

The shell both features live in, and whatever either depends on, travel with
them. Anything else is filler by definition, however well it works.

## The cut rule

**The default is out.** Nothing travels because it already exists. A file,
route, document, token, fixture or dependency travels for one of three reasons,
and only these:

1. A spec names it.
2. Something a spec names depends on it.
3. It records a decision that governs future work.

These are not reasons: it works; it took effort; it might be useful later. A
document that marks itself superseded fails reason 3 by its own admission. A
document that describes a screen that no longer exists is corrected before it
travels, or it does not travel. Whatever stays behind remains in this
repository's history, which is where history belongs.

## The design is the frames

The Figma file `Warframe`, page Wireframes, is the design
([BR-33](../docs/business-rules.md#br-33--the-build-looks-exactly-like-the-frames)).
The build matches each frame exactly: layout, order, spacing, sizes, type,
colour, borders, radii, icons, states and every static word. Where the code
cannot produce the frame, the code changes.

- The frame does not fix the data. A sample value drawn in a frame is a
  placeholder; the spec states where the real value comes from.
- A spec links a frame by node-id at the pinned version of the file. It never
  pastes a screenshot.
- Where two frames disagree, or a frame contradicts the data, the owner
  corrects the frame. The build does not choose a reading on its own.
- The frames are drawn at 390 px. Wider than that, the layout follows the
  width classes of
  [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes):
  width changes the arrangement, never the content.
- [`docs/business-rules.md`](../docs/business-rules.md) holds the rules the
  owner pinned to the frames. A spec cites them by id and adds acceptance
  criteria; it does not restate them.

## The anchor holds

Warframe ends when you have everything. The app serves that, but its point is
that the player should also understand what they are chasing, which is why
quests and the curated prose sit beside the item data. Four rules follow, and
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

## What cannot be read

The public profile does not expose completed quests, foundry contents, or mods
by slot. A quest is confirmed by wiki-cited evidence or it is unread; absence of
evidence is never absence of the deed. What the profile does not prove is asked
of the player or not claimed at all. The app never infers to fill a gap.

## No computed state

Three sources with three rates of change, crossed on every request and never
copied into one another: the player profile, the game catalog (with the
snapshots vendored in `data/vendor/`, which are source data and never written at
runtime), and the curated files. No database, no search index, no stored result
to invalidate later. A proposal to store a computed value is a change to this
document first.

## It is deployed, and it protects DE's endpoint

DE refuses an **IP address**, not an account. Every call to DE leaves from our
server, so a refusal takes the app down for every player for up to a day, while
each player's game is untouched. In development the server is the developer's
own machine, whose IP is also their game's: a refusal there locks the developer
out of Warframe. Hence:

- **One read per account every twelve hours, across the whole deployment.** The
  window holds for the app as a whole, never per instance or per process. It is
  never shorter than DE's own `Cache-Control` allows.
- **Every lock is shared the same way:** the account-id format check before any
  call, the cached not-found, each visitor's budget of new lookups, and the
  circuit breaker after consecutive refusals.
- **No refresh action**, now or later.
- **Only what the app reads is kept**, and only for the window. Nothing about a
  player is persisted beyond it.
- **Development reads fixtures by default.** Calling DE from a developer's
  machine is a deliberate act, never the default.

The host and the shared store are named in the plan.

## Nothing real about a person ships

- **No real profile travels.** Fixtures in the public repository are the output
  of `pnpm fixture`: whitelisted fields, with the account id, display name and
  platform names replaced.
- **No local configuration, secret or personal id travels**, in the tree or in
  its history.
- **Third-party material keeps its own terms.** The MIT licence covers our code
  and curated files only. Images are served from the wiki and DE's CDN, never
  rehosted. Data vendored from the wiki's modules or DE's tables travels with
  its source named and under that source's licence.

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
  static site from the same host as the app.

## The code is built to be read

The owner asked on 2026-10-05 that the front and the back both be
componentised, organised and written to read well. That is a rule of the
public repository, not a wish:

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
  at 360, 600, 840, 1280 and 1440. `pnpm check` can see neither.
- `pnpm palette` runs whenever a colour moves. It measures every ink against the
  protanope and deuteranope matrices, because the owner is colour blind. Its
  findings go back to the owner as feedback on the frame. It never blocks a
  build and never overrules a frame.
- The build passes on the deployment target, not only locally.
- No comments in any file. What needs explaining goes in `docs/`.
- No user-facing string outside `src/content/`, no internal href outside
  `src/routes.ts`, no hard-coded colour, radius, duration or easing outside
  the token layer, no token that nothing applies, and no import against the
  direction of the layers. Each is a test or a lint rule.
- Documentation and specs are in English. UI copy is a separate concern.

## Settled before the spec

Nothing is left open. These were the last questions, closed by the owner on
2026-10-04:

- **The pinned design** is the section `421:590` "High-fi Wireframes" on the page
  Wireframes of the Figma file `unteOMr3YYUIyBE6XF0AD6`, as it stood on
  2026-10-04. Every spec is written against it. A frame changed inside it after
  that date is a design change: the spec is updated before the code follows.
- **The Figma file is private**, for the owner's design and development use. It
  is never linked from the README. A spec in the public repository still links
  its frames by node-id; a reader without access reads the spec's behaviour and
  acceptance criteria, which stand without the picture. Publishing the file to
  make those links open is not a fix; it would publish the real display name
  and rank the frames draw as sample values.
- **Every slip in the drawing is corrected.** Where a frame and a rule
  disagreed, the owner said which wins and corrected the frame. The corrections
  were applied in Figma on 2026-10-06, and no slip remains.
- **Every document in `docs/` describes the app as it is.** Superseded documents
  were removed and the rest corrected on 2026-10-04. Which of them travel is
  decided by the cut rule, spec by spec.
