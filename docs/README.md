# docs/

These pages explain what the code can't say for itself: the decisions behind
the app, the findings that settled them, and how to work on it. The code has no
comments, so anything worth explaining is written here instead. Each page
arrives with the task that builds what it describes.

- [`business-rules.md`](business-rules.md): the rules the owner pinned to the
  Figma frames as comments. The first, BR-33, covers every screen: the build
  looks exactly like the frames. Each rule after it is tied to its frame and
  sets a component's states, a behaviour, an ordering or a piece of content.
- [`public-release.md`](public-release.md): what was decided on the way to
  releasing the app publicly. It covers the real
  profile, why DE refuses an address rather than an account, why serverless
  memory breaks the locks, the host chosen against the free tiers, why a read
  lasts twelve hours, and what the shared store spends.
- [`spec-driven-order.md`](spec-driven-order.md): the order the work follows
  (constitution, design, spec, plan, tasks, code) and how a spec carries the
  visuals.
- [`desktop.md`](desktop.md): the app on the player's machine. It covers how
  it is staged and run, what each file in `desktop/` does, the window, the
  guard in front of the server and why the window is shut tight.
- [`development.md`](development.md): the tooling, what CI runs, the palette
  check, the layers and the rule that enforces them, the conventions, the
  environment variables, and the shared store's two backends.
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

All documentation is written in English.
