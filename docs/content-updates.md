# Content updates: how a new Warframe update enters the app

When DE ships an update, the app has to learn what arrived: new items, places
and quests. Most of it enters on its own, because the catalog carries every
item's source. Some of it needs a source curated by hand. Rarely, something
arrives that no screen was designed for. This document is the process for all
three, and the command that runs it. The owner set it on 2026-10-06, and on
2026-10-15 made the command wire new content in as well as report it.

## What counts as an update

DE ships three kinds of patch. Only the first two start a review:

| Kind     | Version | Example                   | How often, 2025–2026     | Starts a review |
| -------- | ------- | ------------------------- | ------------------------ | --------------- |
| Mainline | `X.0`   | Update 43.0, 2026-06-17   | Every two to four months | Yes             |
| Update   | `X.Y`   | Update 43.5, 2026-08-12   | Between mainlines        | Yes             |
| Hotfix   | `X.Y.Z` | Hotfix 43.5.4, 2026-08-19 | Most weeks               | No              |

**A hotfix never starts a review, but what it brings is never lost.** Hotfixes
do add items, Hotfix 43.5.4 among them. Each hotfix is folded into the update
it follows: the review of Update 43.5 also lists what Hotfixes 43.5.1 to
43.5.4 added, and whatever a hotfix adds after the last update waits for the
next one.

### Where the kind comes from

None of the sources announces a patch:

- **DE's profile endpoint** knows nothing about patches. It returns a player.
- **DE's Public Export**, which feeds the catalog, is a snapshot of the game's
  data as it stands. It carries no version and no date for anything in it.
- **`@wfcd/items`** adds what the Public Export lacks: for most items an
  `introduced` record, read from the wiki's patch notes, with the patch's name
  (`Update 43.5`, `Hotfix 43.5.4`), the mainline it belongs to
  (`parent: "43.0"`), its date and a link to the notes. The update an item
  belongs to is read from that name: `releaseOfName()` in
  `src/domain/catalog/updates.ts` turns `Hotfix 43.5.4` into `43.5` and
  `Update 44.0` into `44`. A few old entries carry no version (`Vanilla`,
  `TBA`); they belong to no update.
- **DE's patch notes** (`pnpm data:patch-notes`) list every mainline and update
  with its name and date, hotfixes left out. The list of updates is
  `gameUpdates()`, the same one Resume shows.

So the app learns about an update from the patch notes, and about what it
brought from the catalog, after WFCD publishes a new version of it, usually
within days of DE's patch. An update can be out before the catalog carries
anything from it; the review then says so, and its items are reviewed when the
catalog brings them (below).

## The command: `pnpm content:update`

Run by hand by the owner, after a mainline or an update is out, with the dev
server stopped: the command reinstalls packages, which Windows refuses while
a running server holds their files. It reads, it writes files, it never
commits: the owner reads the report, then commits.

What it does, in order (`scripts/content-update.ts`):

1. **Reads where the last review stopped**, from `data/reviewed-update.json`:
   the update last reviewed and the catalog version it was reviewed with. It
   keeps a copy of `package.json`, the lockfile, every file in `data/vendor/`
   and the mark, to put back.
2. **Updates the sources**: `@wfcd/items` to its latest version, then its
   snapshot (`pnpm data:items`), DE's drop tables and the update art
   (`pnpm data:refresh`), the wiki's data modules (`pnpm data:wiki`), the
   vendors' art and what each drop's source is, with its art (`pnpm data:vendor-art`) and DE's patch notes
   (`pnpm data:patch-notes`). If one fails, the wiki's API being down for
   example, it puts every source back, says which one failed, and stops.
3. **Finds what is new**: every update after the one last reviewed; every item
   the catalog did not have before, whatever its update; every node the wiki's
   missions gained. If there is none, it says so, puts every source back, and
   stops: a hotfix alone, or a catalog version that adds nothing, is never
   reviewed.
4. **Sorts each new thing into a level** (below).
5. **Writes `data/manifest.json`** (`pnpm data:manifest`): each file the
   server reads, with its size and SHA-256, and the schema. The desktop app
   reads it from `main` at each start and downloads what changed (spec 13),
   so a merged content update reaches installed apps without a new version.
6. **Runs `pnpm check`**, so the report says whether the app still builds and
   its tests still pass with the new data.
7. **Writes the report** to `docs/updates/<version>.md`, named after the newest
   update reviewed, or after the day when it found only late items or new
   nodes, prints its first lines in the terminal, and moves
   `data/reviewed-update.json` to the newest update and the new catalog
   version. The updated sources stay in the working tree.

| Flag          | Effect                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| `--dry-run`   | Writes the report only; puts back every source and the mark                |
| `--since X.Y` | Reviews from that update, inclusive, instead of the mark, to redo a review |

A review written with `--since` still moves the mark forward, never back.

## The three levels

| Level                 | What it is                                                                                                      | What the owner does                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Enters on its own** | An item the app answers from data, a quest the story already tells, a node on a planet the app knows            | Reads the list. No code                                                                                     |
| **Needs a source**    | A kind the app knows, but no source says how to get it; a quest the story does not tell; a node on a new planet | Curates it in `data/` with a `cite`, as `curated-files.md` sets out                                         |
| **New to the app**    | An item of a category no list of the catalog knows                                                              | Changes the app for it, as `maintaining.md` says: a rule, a frame if one is needed, the spec, then the code |

The levels are mechanical, never a judgement (`reviewOf()` in
`src/domain/catalog/review.ts`):

- An arsenal item enters on its own when its Step by step has a route for every
  part, and a collectible when its Step by step has a route with a detail:
  `thinArsenal()` and `proseOnly()`, the same two functions
  `tests/coverage.test.ts` holds every item of the catalog to. One that fails
  them needs a source, and so does an item of a known category that the
  catalog leaves out because no source names where it comes from.
- A quest enters on its own when `narrative_spine.yaml` names it.
- A node enters on its own when its planet is one of `systems.yaml`'s places or
  aliases.
- An item is new to the app when its category is in none of the lists the
  catalog reads (`ARSENAL_SOURCES`, `COLLECTIBLE_SOURCES`, `RELIC_SOURCES`),
  so the report cannot call something familiar when it is not. Parts
  (`Components`), enemies and nodes listed as items are passed over: a part is
  reviewed with its item, and nodes come from the wiki.

Most things that need a source leave `pnpm check` passing: the catalog leaves
out an item no source places, so the coverage test never sees it, and only the
report names it. The review of Update 44 found six such mods and every check
passed. `pnpm check` fails only when an arsenal item has a part with no route,
or a collectible the catalog keeps has prose alone; the report then says the
checks fail, and the curation is what makes them pass.

## The report

Written for the owner to read, not for a machine: plain sentences, the game's
names, no file paths in the findings, no rule ids
(`tests/review.test.ts` holds it to that). English, like every document in the
repository. Its words are in `src/content/review.ts` and its shape in
`scripts/review-report.ts`:

```markdown
# Content review of 2026-10-21

Catalog 1.1276.21 → 1.1276.27. Every check passes with the new data: types, lint, format and tests.

## At a glance

12 new things: 6 enter on their own, 6 need a source, 0 are new to the app.

## Update 44.1: Iceblade of Narin: The Icebind

Released 2026-10-07.

The catalog has nothing from it yet; the next review lists what it brought.

## Update 44: Iceblade of Narin

Released 2026-09-23.

### Needs a source

| What        | Kind | What is missing | Where to look              |
| ----------- | ---- | --------------- | -------------------------- |
| Example Mod | Mods | How to get it   | Its wiki page, Acquisition |

### Enters on its own

| What  | Kind      | Where it comes from   |
| ----- | --------- | --------------------- |
| Narin | Warframes | Play Halako Perimeter |

## What else changed

Drop tables: unchanged.

Wiki data: Baro changed.
```

An item that reaches the catalog after its update was reviewed is listed under
"New in the catalog, from updates already reviewed", and a new node under "New
places", each in the same three levels.

## The files

| File                        | What it is                                          |
| --------------------------- | --------------------------------------------------- |
| `scripts/content-update.ts` | The command                                         |
| `scripts/review-report.ts`  | The report's shape                                  |
| `data/reviewed-update.json` | Where the last review stopped, committed            |
| `scripts/data-manifest.ts`  | `pnpm data:manifest`, which writes the manifest     |
| `data/manifest.json`        | What the desktop app downloads, committed           |
| `docs/updates/`             | One report per review, committed with what it wired |

A hand edit to a file in `data/` needs `pnpm data:manifest` too:
`tests/data-manifest.test.ts` fails until the manifest matches the files. The
schema starts at 1 and is raised by hand, in `data/manifest.json`, when a
file's shape changes so that an older app could not read it; an app then
ignores the newer data until its own update brings both.

The mark was set to Update 44.1 and catalog 1.1276.21 at launch, so the first
report is written by the first review after it. The reports are committed so
that the history of the app's content is readable: what each update brought
and what was done about it.
