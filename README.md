# Onkko's Archive

Been away from the Origin System for months? Onkko's Archive reads your public
Warframe profile, lists what shipped since you last played, and shows what you
still need to get the thing you want next.

It is being built in the open, from its specs. The app is not deployed yet.

## How it was built

The work follows one order, and every step answers to the one before it:

1. **[Constitution](specs/00-constitution.md)**: what the app is, the two
   features and nothing beside them, and the rules every later step answers
   to.
2. **Design**: the Figma frames are the design, and the build matches them
   exactly.
3. **[Specs](specs/)**: what each screen does, its states, where its data comes
   from, and how it is accepted. A spec links its frames and never pastes them.
4. **[Plan](specs/plan/)**: the repository, the architecture, the design
   system, the deployment, the documents and the roadmap.
5. **[Tasks](specs/tasks/)**: the work cut into pieces, each one an issue and
   one pull request.
6. **Code**, last.

[`docs/spec-driven-order.md`](docs/spec-driven-order.md) explains the order,
and [`docs/public-release.md`](docs/public-release.md) the decisions behind
releasing it.

The code is in layers that point one way, and a lint rule fails any import
against the arrow:

```
app ──► screens ──► ui
 │         │
 │         ▼
 ├──────► domain ◄── infra
 └──────────────────► infra
```

`domain/` is plain TypeScript with no React, no Next and no I/O; `infra/` is
the only code that reaches the outside; `ui/` is the design system and renders
with nothing behind it.

Progress is tracked as issues, one per task, grouped by phase in the
milestones.

Claude assisted with research, implementation, debugging and documentation.

## Licence

MIT, for the code and the curated files. Warframe and its content belong to
Digital Extremes. This is a fan project, not affiliated with or endorsed by
them.
