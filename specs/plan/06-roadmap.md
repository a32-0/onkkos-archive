# Plan · 6 · The roadmap, and how the work is traced

The phases from the specs to a running app, what the owner creates in each, and
how any line of code leads back to the rule that asked for it. The owner asked
on 2026-10-06 for visibility and traceability over the whole release.

## Who reads what

| Reader                      | Reads                                                      | To                                             |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| The owner                   | Business rules, specs, this roadmap, update reports        | Decide and approve                             |
| Claude, in later sessions   | The constitution, the specs, the plan, the tasks           | Build without the owner restating any decision |
| Someone evaluating the work | The README, `public-release.md`, the specs, Storybook      | See how the product was reasoned               |
| A future contributor        | `development.md`, the data documents, `content-updates.md` | Add content without breaking a rule            |

A player reads none of it.

Each document is one text for every reader in its row, never a copy for people
beside one for Claude. A page a person reads opens in plain language, saying
what it is and why it matters, and the exact rules follow under it unchanged.
Set by the owner on 2026-10-08 ([T-02b](../tasks/T-02b-humanise.md)).

## The phases

| Phase                   | What is built                                                                                                             | What the owner creates                                                      | Done when                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **0. Specs**            | The tasks, here                                                                                                           | Approves the new designs in Figma and the plan                              | Every task has its spec, its acceptance and its order                                              |
| **1. Scaffold**         | The empty tree of part 1, the tooling, `check.yml`, the first preview                                                     | The public GitHub repository, the Vercel account and the app's project      | A push to a branch builds a preview, and `check.yml` passes on it                                  |
| **2. Design system**    | The tokens and the components of part 3, each with its stories                                                            | The Storybook project on Vercel                                             | Every component matches its Figma component in every state                                         |
| **3. Domain and infra** | The engine, the catalog, the places, the trim, the store, the proxy                                                       | Nothing                                                                     | Spec 11's acceptance passes against the memory store                                               |
| **4. Screens**          | By flow: the shell, Onboarding and Connect, Two ways in, Resume and the Summary, the map, Goal, the item and Step by step | Nothing                                                                     | Each screen matches its frames at 390 and holds BR-39 at every sweep width, and `smoke.yml` passes |
| **5. Launch**           | The README, production reading DE                                                                                         | The Upstash database, its two variables in Vercel, the protection on `main` | Production serves a real account through the locks                                                 |
| **6. Operation**        | Content updates, as `content-updates.md` sets out                                                                         | Runs `pnpm content:update` after each mainline or update                    | Ongoing                                                                                            |

Upstash is created last on purpose: until phase 5 nothing reads DE, so nothing
needs the shared store, and no secret exists before it is used.

The public repository is **public from its first commit**, set by the owner on
2026-10-06: the history, from an empty tree to the launch, is part of what the
work shows. Nothing enters it that the cut rule would not let travel, so there
is nothing to clean up before it is opened.

## Tracing the work

Every piece points to the one before it, and back:

```
Business rule ──► Spec ──► Task ──► Commit on dev ──► Phase pull request ──► main
   BR-46          07       T-26     T-26: …           4. Screens
                                         │
                               Vercel preview, Storybook
```

- **A task** is written here, in `specs/tasks/`, with its id, the spec and rules
  it serves, its acceptance and the tasks it waits on.
- **A commit** on `dev` starts its subject with the task's id. The owner
  commits; every push builds a preview.
- **A pull request** per phase takes `dev` into `main` and lists the tasks it
  carries, with the preview and the Storybook build linked. The owner merges it,
  and the merge deploys production
  ([`specs/tasks/README.md`](../tasks/README.md#branches)).

The owner set this on 2026-10-08, in place of one issue per task, milestones
and a GitHub Project, which cost more time than they gave back.

Read the other way, from a line of code: its commit names the task, the task
its spec, and the spec the rule and the frame it builds.

## After the launch

A content update follows the same chain. The report in `docs/updates/` lists
what arrived; anything new to the app goes to the owner first, and from
there a rule, a frame if one is needed, a spec, a task and code, like everything
before it.
