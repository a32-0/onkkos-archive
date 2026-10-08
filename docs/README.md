# docs/

Decisions and findings that are not obvious from the code. The code carries no
comments: anything worth explaining lives here. Each document arrives with the
task that builds what it describes.

- [`business-rules.md`](business-rules.md) — the rule over every screen (the
  build looks exactly like the Figma frames, BR-33), then the owner's comments
  on the frames as business rules, each tied to its frame: component states,
  behaviour, orderings and content.
- [`spec-driven-order.md`](spec-driven-order.md) — the order the work follows:
  constitution, design, spec, plan, tasks, code, and how a spec carries the
  visuals.
- [`public-release.md`](public-release.md) — the decisions behind releasing
  from a new public repository: the real profile, why DE refuses an address and
  not an account, why serverless memory breaks the locks, the host chosen
  against the free tiers, why a read lasts twelve hours, and what the shared
  store spends.
- [`development.md`](development.md) — tooling, the layers and the rule that
  enforces them, conventions, and the environment variables.

All documentation is written in English.
