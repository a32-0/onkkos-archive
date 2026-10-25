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
| `ui.md`                            | The routes with their frames and the link rules, checked against specs 01 to 12 line by line                                                                  | T-32, T-41       |
| `desktop.md`                       | The app on the player's machine: how it is built, run, packaged and released, its data folder, and why each part of its security baseline is there            | T-36 to T-38     |
| `README.md` (the index)            | Every document above, in this order                                                                                                                           | T-01, T-32       |

Each document is written in the task that builds the code it describes, so the
two match.

## The README

The README has the two readers of the constitution, and it serves the player
first because the player reads less. It is short and links out for the rest.
Rewritten on 2026-10-24 at the owner's request (T-47): the earlier one was too
long and repeated what the demo already shows.

What popular READMEs of the same kind do, read that day (Destiny Item Manager,
WFInfo, Path of Building, Awakened PoE Trade, Heroic, LocalSend, Hydra,
Playnite, RuneLite and others): the download and the demo come first, one
paragraph says what the app is for, a short section answers the trust
question a player asks before giving their account ("Will I get banned?" in
WFInfo), and development lives in its own document. GitHub's own guidance
says the same: what the project does, why it is useful and how to start, with
longer documentation elsewhere.

Each section opens with its title drawn as an image in Cetus, a strip of the
splash's art with its frame line, the quill and the title in Cinzel, drawn in
Figma in the README section and exported at 2x into `docs/readme/`. The
sections, in order:

1. **The banner** (`banner.png`, **README — Banner**), the download and the
   demo, one paragraph on what the app does for a returning player, and how
   to install it on Windows (what SmartScreen asks) and Linux.
2. **What it does** (`what-it-does.png`): catching up and reaching a goal,
   one paragraph each, and the map they end on.
3. **Why Onkko** (`why-onkko.png`): what it answers that the wiki and an
   inventory tracker do not, and why it lists only what can be mastered or
   collected. It names no other product.
4. **Your ID** (`your-id.png`): what the id is and where to find it, then
   spec 13's "What it keeps, and where" as a table, what leaves the machine,
   the demo's analytics, and how DE's endpoint is protected, with a link to
   `api.md`.
5. **How it was built** (`how-it-was-built.png`): the order of the work, each
   step in one plain sentence and linked, and the owner's line on Claude's
   help, in their own words (constitution).
6. **Credits** (`credits.png`): each source in a table, with what the app
   takes from it and its terms, read from each licence's source; then a link
   to `development.md` for running the project, and the licence: MIT for the
   code and the curated files, Warframe and its content Digital Extremes', a
   fan project not affiliated with or endorsed by them.

Every sentence of it goes through the humanizer's list
([blader/humanizer](https://github.com/blader/humanizer)) before it is handed
over: no em or en dash, no inflated words, no triad forced for rhythm.

What it does not have:

- **No link to the Figma file**, which stays private (constitution).
- **No claim that the app says which value proved a step.** The anchor forbids
  it ("Never explain the machine").
- **No third demo** and no mention of a real capture.
- **No screenshot of a screen.** The demo shows the screens themselves.
- **No design-system sheet, no commands and no variables.** They are in
  `cetus.md`, the Storybook and `development.md`.
- **No link to `CLAUDE.md`.** The product context is the constitution.
