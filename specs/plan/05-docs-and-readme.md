# Plan · 5 · The documents that travel, and the public README

Which documents in `docs/` cross to the public repository, what changes in each,
and what the public README says. The cut rule decides, as in part 1: a document
travels when a spec cites it, when a document that travels depends on it, or
when it records a decision that governs future work. Every one that travels
describes the public repository as it will be, not this one.

## What changes in every document that travels

- **Paths follow part 1.** `src/lib/warframe/` becomes `src/infra/…` or
  `src/domain/…`; `src/components/` becomes `src/ui/` or `src/screens/`.
- **No "Code: met / not met".** Those lines in `business-rules.md` measure this
  repository's code against a rule. The public repository starts from the
  specs, so its code meets each rule by construction, and its tasks say where it
  does not yet.
- **No history of this repository** beyond what a decision needs: the question,
  the options and what settled it stay; a list of commits or of files that were
  removed here does not.
- **No link to `CLAUDE.md`**, which stays (part 1). Where a document sent the
  reader there, it links the constitution.

## The documents

| Document                           | Origin   | Why it travels, or why it stays                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `business-rules.md`                | Reworked | Every spec cites it. Loses the "Code:" lines and the Slips section once the owner approves the new designs in Figma                                                                                                                                                                                                                                                                                    |
| `public-release.md`                | Moves    | The constitution cites it; it is the case study's reasoning                                                                                                                                                                                                                                                                                                                                            |
| `spec-driven-order.md`             | Moves    | The constitution cites it                                                                                                                                                                                                                                                                                                                                                                              |
| `api.md`                           | Moves    | Spec 11 cites it: the endpoint's verified behaviour                                                                                                                                                                                                                                                                                                                                                    |
| `deferred.md`                      | Moves    | Spec 08 cites it; it governs what a later version adds                                                                                                                                                                                                                                                                                                                                                 |
| `step-by-step.md`                  | Moves    | Spec 10 cites it                                                                                                                                                                                                                                                                                                                                                                                       |
| `scenario-guidelines.md`           | Moves    | Spec 10 cites it; spec 09 reads its densities (BR-55)                                                                                                                                                                                                                                                                                                                                                  |
| `acquisition-scenarios.md`         | Moves    | Step by step depends on the routes and the vendored modules it explains                                                                                                                                                                                                                                                                                                                                |
| `curated-files.md`                 | Moves    | `data/` travels, and this is how each file in it is written                                                                                                                                                                                                                                                                                                                                            |
| `items.md`                         | Moves    | The catalog under the item page and the Summary                                                                                                                                                                                                                                                                                                                                                        |
| `place-index.md`                   | Moves    | The map (spec 07) reads the place index it describes                                                                                                                                                                                                                                                                                                                                                   |
| `system.md`                        | Moves    | The states of an item, a place, a quest and a step that every screen draws                                                                                                                                                                                                                                                                                                                             |
| `narrative.md`                     | Reworked | Quest evidence and access travel (BR-28); the sections on Catch me up's quest rail leave with it (BR-35)                                                                                                                                                                                                                                                                                               |
| `engine.md`                        | Reworked | The engine travels; the `Plan` contract is described as Step by step reads it, not as the removed goal screen did                                                                                                                                                                                                                                                                                      |
| `equipment-unlock-requirements.md` | Moves    | The research behind "don't promise what can't be read"; it governs which checks a new goal may make                                                                                                                                                                                                                                                                                                    |
| `ui.md`                            | Reworked | The routes with their frames and the link rules; checked against specs 01 to 10 line by line                                                                                                                                                                                                                                                                                                           |
| `cetus.md`                         | Reworked | Why the system looks as it does: the palette, colour blindness, the type pairing. The tokens themselves move to plan part 3 and `ui/tokens.css`; the icons section follows BR-42; "What changed structurally" and "Pending on the owner" leave, and so do the view frame, the background art registry, Onkko's dialogue tree and the goal solver, which no spec or plan part keeps (owner, 2026-10-08) |
| `content-updates.md`               | New      | How a mainline or an update enters the app, and the command that runs it; it governs all content work after the launch                                                                                                                                                                                                                                                                                 |
| `development.md`                   | Reworked | Tooling with Storybook, `knip` and the layers; the store's two backends; the two demos and two test profiles; no disk cache, no real capture                                                                                                                                                                                                                                                           |
| `README.md` (the index)            | Reworked | Lists what travels, in this order                                                                                                                                                                                                                                                                                                                                                                      |

No document stays behind whole. Each one that changes is reworked in the task
that moves the code it describes, so the two cross together and match.

## The public README

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
   (constitution, specs, plan, tasks, code), linked to `specs/`; the layers in
   one diagram; the design system and a link to the Storybook. The owner writes
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

What it does not have:

- **No link to the Figma file**, which stays private (constitution).
- **No claim that the app says which value proved a step.** The current README
  says it; the anchor forbids it ("Never explain the machine").
- **No third demo** and no mention of a real capture.

## Divergences from this repository

| Here                                                  | In the public repository                             |
| ----------------------------------------------------- | ---------------------------------------------------- |
| The README describes `src/lib/` and `src/components/` | The layers of part 1                                 |
| "Says which value proved it"                          | Removed: the anchor                                  |
| A profile "held in memory"                            | Trimmed, compressed, in a shared store, twelve hours |
| Three demo ids, one a real capture                    | Two, both anonymised                                 |
| `CLAUDE.md` linked as the product context             | The constitution                                     |
| Documents carry "Code: met / not met"                 | Tasks carry what is not built yet                    |
