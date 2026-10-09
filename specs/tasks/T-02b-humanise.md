# T-02b · Write for the people who read it

|          |                                                                   |
| -------- | ----------------------------------------------------------------- |
| Phase    | 1. Scaffold                                                       |
| Serves   | [spec 00](../00-constitution.md); [plan 6](../plan/06-roadmap.md) |
| Waits on | [T-02](T-02-ci.md)                                                |

Every page a person reads opens in plain language: what it is, who it is for and why it matters, before any rule. One text per document, never a second copy for people beside the one Claude reads: the human opening comes first, and the exact rules stay under it, word for word where they are already exact. Added by the owner on 2026-10-08, after T-01 to T-33 were planned.

The rewrite follows [humanizer](https://github.com/blader/humanizer/blob/225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8/SKILL.md) (version 3.1.0, MIT), the owner's reference, in its file mode: only prose changes; code, commands, paths, node ids, rule ids, data and link targets stay as they are.

## The owner

- Reads each reworked page and approves it, or says what still reads like a machine.

## What crosses

Nothing crosses from the private repository. Each file below is already here and is reworked in place.

| File                         | Origin   | Note                                                                             |
| ---------------------------- | -------- | -------------------------------------------------------------------------------- |
| `README.md`                  | Reworked | Plain language throughout; its sections stay as plan part 5 sets them for T-32   |
| `docs/*.md`                  | Reworked | Plain language throughout; every finding, number and reason kept                 |
| `specs/00-constitution.md`   | Reworked | A short opening for a person: what the app is, what it refuses to be, and why    |
| `specs/01-*.md` to `11-*.md` | Reworked | One plain paragraph at the top of each; behaviour and acceptance untouched       |
| `specs/plan/06-roadmap.md`   | Reworked | "Who reads what" states the rule: one text per document, the human opening first |

The plan's other parts and the task files are written for the build, and stay as they are.

## Documents that cross

- The ones in the table above; no other document changes.

## Acceptance

- [ ] Every file in the table opens with a paragraph a person reads without knowing the code, the specs or the jargon.
- [ ] No rule, number, node id, business rule id, acceptance item, link target or linked heading is lost or changed: each reworked file is checked against its previous version, and the check is listed when the task is handed over.
- [ ] No sentence only explains the one before it, and nothing reads as filler (constitution, "The anchor holds").
- [ ] None of humanizer's 26 patterns is left, and no em or en dash: in all the prose of `README.md` and `docs/`, and in the openings this task writes for the constitution and the specs. A Figma frame's name or a quoted UI string keeps its dash.
- [ ] No plan part other than part 6 and no task file changes.
- [ ] `check.yml` passes on `dev`.
