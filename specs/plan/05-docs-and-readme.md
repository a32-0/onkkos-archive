# Plan · 5 · The documents, and the README

Which documents `docs/` holds, what each one is for, the task that writes it,
and what the README says. The cut rule decides, as everywhere: a document is
here when a spec cites it, when a document that is here depends on it, or when
it records a decision that governs future work.

## What every document keeps to

- **Paths are this repository's**, in the layers of part 1.
- **No measure of the code against a rule.** The code meets each rule by
  construction, and a task says where it does not yet.
- **History only where a decision needs it:** the question, the options and
  what settled it, never a list of commits or of files.
- **No link to `CLAUDE.md`**, which is never committed. Where a document would
  send the reader there, it links the constitution.

## The documents

| Document                           | What it holds, and why it is here                                                                                                                             | Task             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `business-rules.md`                | The rules pinned to the frames; every spec cites it                                                                                                           | T-01             |
| `public-release.md`                | The reasoning behind the release; the constitution cites it, and it is the case study                                                                         | T-01             |
| `spec-driven-order.md`             | The order the work follows; the constitution cites it                                                                                                         | T-01             |
| `development.md`                   | Tooling with Storybook, `knip` and the layers; the store's two backends; the two demos and two test profiles                                                  | T-01, each task  |
| `cetus.md`                         | Why the system looks as it does: the palette, colour blindness, the type pairing; the tokens themselves are in part 3 and `ui/tokens.css`; icons follow BR-42 | T-04             |
| `curated-files.md`                 | How each file in `data/` is written, with each snapshot's source and licence                                                                                  | T-11, T-13, T-15 |
| `engine.md`                        | The engine's `Plan` as Goal and the map read it: whether a goal is done, the frontier and the focus                                                           | T-13             |
| `narrative.md`                     | Quest evidence and access (BR-28)                                                                                                                             | T-13             |
| `deferred.md`                      | What a later version adds; spec 08 cites it                                                                                                                   | T-13             |
| `equipment-unlock-requirements.md` | The research behind "don't promise what can't be read"; it governs which checks a new goal may make                                                           | T-13             |
| `place-index.md`                   | The place index the map (spec 07) reads: its sources, the systems and their names, the Dojo                                                                   | T-15             |
| `system.md`                        | The states of an item, a place, a quest and a step that every screen draws, and the two lenses                                                                | T-15             |
| `items.md`                         | The catalog under the item page and the Summary                                                                                                               | T-16             |
| `scenario-guidelines.md`           | Spec 10 cites it; spec 09 reads its densities (BR-55)                                                                                                         | T-16             |
| `acquisition-scenarios.md`         | The routes and the vendored modules Step by step depends on                                                                                                   | T-16             |
| `api.md`                           | The endpoint's verified behaviour; spec 11 cites it                                                                                                           | T-18, T-19       |
| `step-by-step.md`                  | Spec 10 cites it                                                                                                                                              | T-29             |
| `content-updates.md`               | How a mainline or an update enters the app, and the command that runs it                                                                                      | T-31             |
| `ui.md`                            | The routes with their frames and the link rules, checked against specs 01 to 10 line by line                                                                  | T-32             |
| `README.md` (the index)            | Every document above, in this order                                                                                                                           | T-01, T-32       |

Each document is written in the task that builds the code it describes, so the
two match.

## The README

The README has the two readers of the constitution, and it serves the player
first because the player reads less. It is short and links out for the rest.

1. **Onkko's Archive**, then one sentence: what it does for a returning player,
   in the voice of the app. A link to the app.
2. **What it does.** The two features, each in one line, and the map they end
   on. A screenshot of the Summary on the Ordis demo, which is anonymised.
3. **Privacy.** A promise to strangers, in plain words:
   - The only input is a public account id, read through the same endpoint the
     game uses to show another player's profile. No login, no password.
   - What the app keeps: only the fields it reads, for twelve hours, then
     nothing. Never the full profile and never a computed result.
   - On the device: the id, the update last played and the last place, in
     cookies; the ticked steps in the browser.
   - No analytics and no tracking.
   - How DE's endpoint is protected, in two lines, with a link to `api.md`.
4. **How it was built.** For the reader evaluating the work: the order
   (constitution, specs, plan, tasks, code), linked to `specs/`, and the
   layers as the road from an id to a screen, each in a Mermaid diagram in
   the Cetus colours (owner, 2026-10-21: the arrows of the earlier diagram did
   not explain themselves); the design system and a link to the Storybook. The owner writes
   the line saying that the work was done with Claude's help, in their own words
   (constitution).
5. **Run it.** `pnpm install`, `pnpm dev` on fixtures, `pnpm check`,
   `pnpm storybook`. The variables, from `.env.example`, with what each does.
6. **Data and credits.** DE's endpoint and Public Export; WFCD's packages; the
   wiki's API and the vendored modules, each with its source and licence. The
   task that writes this section reads each licence from its source rather than
   from memory.
7. **Licence.** MIT for the code and the curated files. Warframe and its
   content belong to Digital Extremes; a fan project, not affiliated with or
   endorsed by them.

The README wears Cetus (owner, 2026-10-21): a banner, the features in two
columns with a screenshot each, the map, and a sheet of the design system.
Their images are the owner's, in `docs/readme/`: `banner.png`, `summary.png`,
`step-by-step.png`, `map.png` and `design-system.png`, every screenshot of the
Ordis demo. Section 6 credits each source in a table, with what the app takes
from it and its terms.

What it does not have:

- **No link to the Figma file**, which stays private (constitution).
- **No claim that the app says which value proved a step.** The anchor forbids
  it ("Never explain the machine").
- **No third demo** and no mention of a real capture.
- **No link to `CLAUDE.md`.** The product context is the constitution.
