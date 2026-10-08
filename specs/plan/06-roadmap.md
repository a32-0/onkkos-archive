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
Business rule ──► Spec ──► Task ──► Issue ──► Pull request ──► Commit
   BR-46          07       T-26      #26        closes #26      the owner's
                                                    │
                                          Vercel preview, Storybook
```

- **A task** is written here, in `specs/tasks/`, with its id, the spec and rules
  it serves, its acceptance and the tasks it waits on.
- **An issue** in the public repository carries the task: the same title, its
  acceptance as a checklist, and the paths of its spec and task. The owner
  creates every issue (set on 2026-10-06), in order and before anything else, so
  issue #n is task T-n; the task's text is written to be pasted
  ([`specs/tasks/README.md`](../tasks/README.md)).
- **A pull request** closes its issue, and its Vercel preview and Storybook
  build are linked from it. The owner commits and merges.
- **A GitHub Project** on the public repository shows every issue on one board,
  with the phases above as milestones: what is done, in progress and next.

Read the other way, from a line of code: its commit names the pull request, the
pull request its issue, the issue its spec, and the spec the rule and the frame
it builds.

## After the launch

A content update follows the same chain. The report in `docs/updates/` lists
what arrived; anything new to the app becomes an issue the owner opens, and from
there a rule, a frame if one is needed, a spec, a task and code, like everything
before it.
