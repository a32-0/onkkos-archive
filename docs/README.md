# docs/

These pages explain what the code can't say for itself: what the app is, the
decisions behind it, and how to keep it running. The code has no comments, so
anything worth explaining is written here instead.

Start with [`maintaining.md`](maintaining.md): how to update, fix, change and
release the app, step by step, without anyone who built it.

- [`specs/`](specs/README.md): the constitution and one spec per screen or
  service. They describe the app as it is, and change before the code does.
- [`history/`](history/README.md): how the app was planned and built, kept as
  a record and no longer maintained.

The reference pages:

- [`business-rules.md`](business-rules.md): the rules the owner pinned to the
  Figma frames as comments. The first, BR-33, covers every screen: the build
  looks exactly like the frames. Each rule after it is tied to its frame and
  sets a component's states, a behaviour, an ordering or a piece of content.
- [`development.md`](development.md): the tooling, what CI runs, the palette
  check, the layers and the rule that enforces them, the conventions, the
  two targets one build serves and their variables, and the store behind the
  locks.
- [`cetus.md`](cetus.md): why the app looks as it does. It covers the Cetus
  direction, how every colour is measured for a colour blind owner, the three
  typefaces and what each carries, and where the icons come from.
- [`curated-files.md`](curated-files.md): the hand-written files in `data/`,
  field by field, the invariants the tests hold them to, and the vendored
  snapshots with the source and licence of each.
- [`engine.md`](engine.md): the rules engine over `grafo.yaml`, why it reads
  the raw payload and returns values rather than words, the frontier and the
  focus, and which goals it offers.
- [`narrative.md`](narrative.md): what the profile can prove of the story, the
  evidence rejected and why, and when a quest can be started.
- [`deferred.md`](deferred.md): what was set aside for a later version, and how
  to bring it back.
- [`equipment-unlock-requirements.md`](equipment-unlock-requirements.md): the
  research behind every gate an item can have, which source states it, and
  whether the profile can show the player passed it.
- [`place-index.md`](place-index.md): where the place index comes from, the
  systems and how their places are named, the Dojo, and what the index cannot
  answer.
- [`system.md`](system.md): how the world and the player join, the states of an
  item, a place, a quest and a step, and the lenses that cut every level: the
  frontier, the focus and reach.
- [`items.md`](items.md): the item catalog under the item page and the
  Summary, why the runs sit beside their rotation, how a part is told from a
  resource, relics as places, and weapons inside a recipe.
- [`scenario-guidelines.md`](scenario-guidelines.md): the grammar every item
  view shares, the two densities of one answer, and how a family with no frame
  of its own is drawn.
- [`acquisition-scenarios.md`](acquisition-scenarios.md): how an item's parts
  group into a scenario, the kinds of route, the systems, the curated sources
  that leave nothing to prose alone, and the vendored wiki modules.
- [`api.md`](api.md): the outside sources. DE's profile endpoint as verified,
  what each answer means, how long a read is kept, the locks in front of it
  and the route that exposes it; then the wiki's prose and icons, and
  Varzia's stock, with how long each is kept.
- [`step-by-step.md`](step-by-step.md): what Step by step draws, where its
  words come from, the ticks kept in the browser, and how a plan locks behind
  an unmet prerequisite.
- [`content-updates.md`](content-updates.md): how a new mainline or update
  enters the app, the command that brings every source up to date, the three
  levels of a review and the report it writes.
- [`ui.md`](ui.md): every route with its spec and its frames, which tab stays
  lit and where Back goes, where a link goes, what the player answers and
  where it is kept, how much a screen shows, and the states of a step.
- [`desktop.md`](desktop.md): the app on the player's machine. It covers how
  it is staged and run, what each file in `desktop/` does, the window, the
  guard in front of the server and why the window is shut tight.

All documentation is written in English.
