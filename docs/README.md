# docs/

These pages explain what the code can't say for itself: the decisions behind
the app, the findings that settled them, and how to work on it. The code has no
comments, so anything worth explaining is written here instead. Each page
arrives with the task that builds what it describes.

- [`business-rules.md`](business-rules.md): the rules the owner pinned to the
  Figma frames as comments. The first, BR-33, covers every screen: the build
  looks exactly like the frames. Each rule after it is tied to its frame and
  sets a component's states, a behaviour, an ordering or a piece of content.
- [`spec-driven-order.md`](spec-driven-order.md): the order the work follows
  (constitution, design, spec, plan, tasks, code) and how a spec carries the
  visuals.
- [`public-release.md`](public-release.md): why the app is released from a new
  public repository, and what was decided on the way. It covers the real
  profile, why DE refuses an address rather than an account, why serverless
  memory breaks the locks, the host chosen against the free tiers, why a read
  lasts twelve hours, and what the shared store spends.
- [`development.md`](development.md): the tooling, what CI runs, the layers
  and the rule that enforces them, the conventions, and the environment
  variables.

All documentation is written in English.
