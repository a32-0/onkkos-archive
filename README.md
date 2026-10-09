# Onkko's Archive

Been away from the Origin System for months? Onkko's Archive reads your public
Warframe profile, lists what shipped since you last played, and shows what you
still need to get the thing you want next.

It is being built in the open with spec-driven development: every line of code
answers to a written spec.

## How it is built: spec-driven development

The work follows one order, and each step answers to the one before it:

1. [Constitution](specs/00-constitution.md): what the app is, its two features
   and nothing else, and the rules every later step follows.
2. Design: the Figma frames. The build matches them exactly.
3. [Specs](specs/): what each screen does, its states, where its data comes
   from, and how it is accepted. A spec links its frames instead of pasting
   them.
4. [Plan](specs/plan/): the repository, the architecture, the design system,
   the deployment, the documents and the roadmap.
5. [Tasks](specs/tasks/): the work cut into pieces, grouped in phases. Each
   task is committed on `dev`, and each phase reaches `main` in one pull request.
6. Code, which comes last.

[`docs/spec-driven-order.md`](docs/spec-driven-order.md) explains the order,
and [`docs/public-release.md`](docs/public-release.md) explains the decisions
behind releasing it.

The code is split into layers, and imports only go in the direction of the
arrows. A lint rule fails any import that goes the other way:

```
app ──► screens ──► ui
 │         │
 │         ▼
 ├──────► domain ◄── infra
 └──────────────────► infra
```

`domain/` is plain TypeScript with no React, no Next and no I/O. `infra/` is
the only code that reaches the outside. `ui/` is the design system, and it
renders with nothing behind it.

Progress shows in [the task list](specs/tasks/README.md#the-tasks) and in the
commits, each one named after its task.

Claude assisted with research, implementation, debugging and documentation.

## Licence

The MIT licence covers the code and the curated files. Warframe and its
content belong to Digital Extremes. This is a fan project, not affiliated with
or endorsed by them.
