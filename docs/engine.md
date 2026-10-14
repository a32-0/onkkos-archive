# Rules engine

`src/domain/graph/` turns a goal from `grafo.yaml` plus a raw profile into a
`Plan` (`src/domain/types/plan.ts`): the steps, which of them the profile
proves, and why each of the rest is not done yet, as values. The screens ask
it two things: whether a goal is done, so Goal does not offer it (spec 08), and
where the frontier or the focus is, so the map knows where Start here goes
(spec 07).

## Three decisions worth not undoing by accident

1. **The engine reads the raw payload.** The checks in `grafo.yaml` name DE's
   own fields and tags (`Affiliations[].Tag: "EntratiSyndicate"`), so the
   profile is read as DE sends it, after the trim, and never through a parser
   that renames tags on the way.
2. **Missing data is not zero data.** A player who never touched the Entrati
   has no `EntratiSyndicate` entry in `Affiliations[]`. That is "todo", not
   an implicit `Title: 0`. `compare()` returns false for any ordering
   comparison against `undefined`.
3. **The mini-DSL is parsed, not evaluated.** `"Title >= 2"` and
   `"Tag == 'EntratiSyndicate'"` become structures when the graph loads; zod
   rejects anything outside the grammar. There is no `eval` or
   `new Function` anywhere.

## `schema.ts`: checks normalize to a discriminated union

`grafo.yaml` supports four shapes of `check`: `manual`, `array-contains`
(`field` + `equals`), `array-where` (`field` + `where` + `condition`), and
`scalar` (`field` + `compare` + `value`). They are validated with zod and
normalized into a `Check` with a `kind` discriminator, so `evaluate.ts` is an
exhaustive `switch`: a new shape that is not normalized fails to compile
instead of failing at runtime.

`assertReferencesResolve` runs at the end of `normalizeGraph` and fails the
load if a `requires` points at a node id that does not exist, or an
off-chart place is misplaced. Model errors surface when the YAML loads, not
halfway through a real player's goal.

Field paths follow `Root`, `Root.property`, `Root[]`, `Root[].property` or
`Root.{placeholder}`. No goal in the first version takes a parameter, but the
engine still resolves a placeholder from the parameters it is given, so the
deferred goals (`deferred.md`) come back without touching it.

## `predicates.ts`: the mini-DSL

- The regex tries two-character operators before one-character ones
  (`>=`/`<=` before `>`/`<`); reversed, `"Title >= 2"` would match `>` and
  leave `= 2` as an invalid remainder.
- A quoted literal stays a string; a `{placeholder}` stays as is and is
  resolved later with the goal's parameters; anything else must be a number,
  negatives included, because `Affiliations[].Title` can be negative
  (adverse standing).
- Anything else is a `PredicateParseError` at load time.

## `resolve.ts`: order, blocking, and the checklist

- `topologicalOrder` is a post-order DFS over `requires`, so every
  prerequisite comes out before whoever needs it. A cycle is a model bug and
  throws with the full trail (`A -> B -> C -> A`) instead of recursing
  forever.
- A node whose dependencies are not all satisfied is marked `blocked`
  without evaluating its check, so it never shows a confusing "todo" reason
  when the real problem is further up the chain. Its reason names the
  dependencies by label, never by node id.
- A goal with `manual_checklist_if_missing` gets one `quest:<name>` step per
  quest while its access is incomplete: `done` when `quest_evidence.yaml`
  proves it, `manual` otherwise. Never `todo`, because absence of proof is
  not absence of the quest.
- `unlock_next_planet` is dynamic: it walks `star_chart_order` and returns
  the first junction tag missing from `Missions[]`. `findNextPlanet` returns
  two counts on purpose: `unlocked` (planets, Earth included, 14 max) and
  `junctionsCompleted` / `junctionsTotal` (tags actually present, 13 max).
  Collapsing them makes one of the two screens lie.

## The engine returns values, never words

A reason is a value: a Mastery Rank gap (`mastery`, with the reading and the
target), a rank gap (`rank`, with the tree's key when the check names one),
a syndicate never joined (`not-joined`), the junction a planet needs
(`junction`, its two planets), or the steps a node waits on (`after`). The
screen that shows one picks the words from `src/content/`, so the domain
imports no copy and a sentence changes without touching the engine.

None of the words may carry a profile field name, a tag or a node id: the
constitution's "never explain the machine". `PlayerLevel` reads "MR 27 of
28", a rank below its target "Rank 1 of 2", and a syndicate the profile has
never met "Not joined yet". Where the label already carries the whole fact,
a hub that is simply missing, the outcome carries no reason at all. A
confirmed step shows its tick and nothing else: the value that proved it is
the engine's business, not the player's.

The only words that come from data are the node's `label` and a manual
check's `question`, both written in `grafo.yaml`.

## The frontier and the focus

`findNextPlanet` gives the frontier. `findFocus` gives the place for a player
who has none (spec 07): the highest share of readable items mastered, short
of all of them. It takes each place's counts and the systems' order as values,
because the place index reads them, and compares shares exactly by
cross-multiplying, so a third and two sixths tie. A tie goes to the earlier
system (BR-47), then to the earlier place on `star_chart_order`, a place off
the chart sitting just after the planet it is drawn beside. A place on no
chart, the Dojo, is never the focus (BR-57). With everything readable mastered
there is no focus.

## Goal suggestion

`suggest.ts` orders goals by `audience` crossed with the player's Mastery
Rank (new < 8, mid 8 to 15, veteran 16 and over), then by label. It leaves
out the goals already done: `goalsProvenDone` proves the star chart once
there is no frontier, and a goal that names a quest once quest evidence
confirms it. Whether every Necramech is owned needs the catalog, so the
screen adds it to the set it passes in.
