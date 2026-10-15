# T-15b · The specs speak of this repository alone

|          |                                                                                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                                                                           |
| Serves   | [the constitution](../00-constitution.md); [plan 1](../plan/01-repository.md), [plan 2](../plan/02-architecture.md), [plan 5](../plan/05-docs-and-readme.md), [plan 6](../plan/06-roadmap.md) |
| Waits on | [T-15](T-15-places.md)                                                                                                                                                                        |

The constitution, the specs, the plan, the tasks and the documents describe this repository as it is and as it will be built. Every path is this repository's own, no section or column records where a file came from, and history stays only where a decision needs it. Every rule and decision they carry stays. Asked by the owner on 2026-10-13, so the repository stays clean as it is built.

## The owner

- Reads the constitution's edits, listed in the handover, and approves them.

## What it builds

| File                                                                 | Note                                                                                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `specs/00-constitution.md`                                           | Where the work ends is this repository; the order without a release table; the cut rule says what is here; the privacy rules speak of what is committed |
| `specs/README.md`                                                    | What the folder holds                                                                                                                                   |
| `specs/01` to `specs/11`                                             | Paths in the layers of plan part 1; each spec's rules stay in its body, its frames and its business rules                                               |
| `specs/plan/01-repository.md`                                        | The tree, what each part holds and the task that builds it; "What the layers forbid"                                                                    |
| `specs/plan/02-architecture.md`, `04-deployment.md`, `06-roadmap.md` | The design as it is; the Resume picker's month written by a server action                                                                               |
| `specs/plan/05-docs-and-readme.md`                                   | Each document with what it holds and its task                                                                                                           |
| `specs/tasks/README.md` and every task                               | "What it builds" and "Documents", each file with what it holds; T-24's month settled                                                                    |

The Resume picker's month is written by a server action, as the connect action writes `wf_account`, because `screens/` and `ui/` read and write no cookie (owner, 2026-10-13). Plan part 2, [T-12](T-12-profile-reading.md) and [T-24](T-24-resume.md) say so.

## Documents

- `docs/public-release.md`: the decisions with their measurements
- `docs/spec-driven-order.md`: where the work stands
- `docs/deferred.md`, `docs/README.md`, `docs/business-rules.md`, `docs/equipment-unlock-requirements.md`: the same, line by line

## Acceptance

- [ ] Every path under `specs/` and `docs/`, and in the README, is this repository's own, and no section or column records where a file came from.
- [ ] No rule is lost: whatever a removed section held is stated in its spec's body, drawn in its frames or pinned in a business rule.
- [ ] No spec, plan part, task or document holds an open question.
- [ ] `pnpm check` passes, and `check.yml` passes on `dev`.
