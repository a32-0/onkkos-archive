# 10 · Step by step

The full route to one item or quest for this player: what they need first, in
what order, and where to go for each part, best odds first. Each component can
be ticked off as the player gathers it. It is the long version of the short
answer on the item's page, and it is built exactly as the frames draw it.

## Frames

Row states:

- [`367:291`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=367-291):
  a collapsed row.
- [`382:2233`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=382-2233):
  a ticked component.

The scenarios. Each is a case the grammar must place, and each is an
acceptance test:

| Frame      | Item             | What it proves                                                                            |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `323:689`  | Dante            | Every part from one place: How to get once, a flat Blueprints list                        |
| `337:806`  | Ash              | Every part from a different place: one section per part, ordered by odds                  |
| `368:865`  | Ember            | Parts share a place, the main blueprint is bought: "Buy … Blueprint" closes Prerequisites |
| `371:1183` | Gyre             | One hub, different bounty tiers: one section per part, each its tier                      |
| `372:355`  | Nesha            | No drop table: researched in the dojo, "Join or create a clan"                            |
| `382:452`  | Kuva Sobek       | A Kuva Lich: steps, then an alternative ("Or trade…"), prerequisites to the root          |
| `382:1010` | Tenet Tetra      | A Sister of Parvos: the same system as Kuva                                               |
| `382:1153` | Prisma Gorgon    | Baro Ki'Teer: a rotating vendor, paid in Ducats and Credits                               |
| `372:1070` | Gyre Prime       | A Prime in rotation: relics per part                                                      |
| `382:1528` | Ember Prime      | A vaulted Prime: the Prime Vaulted status row, vaulted relics                             |
| `382:1864` | Ivara Prime      | A vaulted Prime in Resurgence: Acquire Aya, Visit Varzia, then relics                     |
| `385:498`  | Chesa Kubrow     | Bred: gear, optional steps, the Incubator                                                 |
| `396:757`  | Adarza Kavat     | Bred from genetic codes                                                                   |
| `398:1655` | Bhaira Hound     | Two systems composed: the Sister plan plus "The Hound"                                    |
| `396:1179` | Vizier Predasite | Revived by Son: a procedure of steps                                                      |
| `396:498`  | Vasca Kavat      | A special companion: infection, no Mastery row                                            |

The scenario frames' texts are sample values; the data decides every title,
reading and passage (BR-33). Their layout, row types, states and order are the
design.

Drawn on 2026-10-06 under **Documented states**, from the states this spec
describes and no earlier frame drew. Their texts are sample values:

- [`474:2152` Step by step — Quest](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=474-2152): a quest placed in the grammar: "Quest" as kicker and no state; Prerequisites with the quests and junctions before it; How to get with where it starts and the wiki's passage.

Drawn on 2026-10-08 under **Documented states**, for BR-63:

- [`533:5136` Step by step — Locked](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=533-5136): Kuva Sobek for a player below its Mastery Rank: the rank row at full contrast with its gap, everything after it locked.

## Rules

- The grammar: [`scenario-guidelines.md`](../docs/scenario-guidelines.md), and
  [`step-by-step.md`](../docs/step-by-step.md).
- Row states: [BR-20](../docs/business-rules.md#br-20--a-collapsed-row),
  [BR-21](../docs/business-rules.md#br-21--a-ticked-component),
  [BR-63](../docs/business-rules.md#br-63--a-plan-dims-what-waits-on-an-unmet-prerequisite)
  (locked).
- By scenario: [BR-22](../docs/business-rules.md#br-22--mastery-rank-0-is-not-shown)
  to [BR-32](../docs/business-rules.md#br-32--components-gather-everything-the-plan-names).
- Settled for this spec: [BR-48](../docs/business-rules.md#br-48--the-wikis-prose-runs-as-the-frames-draw-it-in-paragraphs)
  (prose in paragraphs), [BR-49](../docs/business-rules.md#br-49--relic-rows-open-the-best-or-the-rest)
  (relic rows), [BR-50](../docs/business-rules.md#br-50--highest-chance-carries-no-number)
  ("(Highest chance)").
- [BR-37](../docs/business-rules.md#br-37--a-goal-opens-the-steps-of-what-it-names):
  a quest's Step by step.
- [BR-39](../docs/business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes).

## The page

The same page as spec 09, with **Step by step** chosen: You're on, the hero
and View stay; the sections below replace the Summary's. Onkko's line closes
the page.

## The sections

In this order; a section with nothing in it does not render.

1. **Prerequisites**: facts to read, never to tick. Mastery Rank (never 0,
   BR-22), the slot (BR-23), quests root first (BR-28), hub unlocks, reaching
   a place, gear owned, standing, clan, a status row ("Prime Vaulted"), and
   last, "Buy … Blueprint" when the main blueprint is bought.
2. **How to get**, when the parts share a source, or the system's steps
   (Lich, Sister, Baro, Varzia, breeding, Son) as the frames title them.
3. **Blueprints**, one flat list when every part shares a source; otherwise
   **one section per part**, titled "{Part} Blueprint" with the part's art as
   its icon, ordered by best odds (BR-25).
4. **Components**: what the player collects, grouped under dividers, "{Place}
   specific" for what only that place gives and "Different locations" for the
   rest, each group ordered by rarity, credits last (BR-24), including every
   recipe the plan names (BR-32).

A section header is the section's icon (a part's art, or the game icon of
BR-42) and its title in the display face.

## The rows

### Prerequisites, How to get and part sections

A vertical gold line runs down the section. Each row:

- **A diamond** on the line, for a step. An alternative ("Or …") has no
  diamond; it continues the row above (Kuva's "Or trade for a converted Kuva
  Lich", Ivara Prime's "Or Lith Q3 Relic").
- **The title**, bold: a verb and the thing, with the thing's icon when it has
  one ("Blueprint", "Neuroptics" carry their art). "(Optional)" ends an
  optional step. "(Highest chance)" marks the best route in a part section, and
  the title turns gold (BR-26, BR-50). A route is named by its node (BR-27).
- **A chevron**, up while open. Every row starts open, as drawn.
- **The detail**, one line of data when there is one: "It drops at rotation C,
  7.5% a run, so about 13 runs for an even chance." "Uncommon. 11% intact and
  20% radiant."
- **The prose**, the wiki's passage in its paragraphs (BR-48).
- **Wiki ↗**, in the link colour, closing the passage. For a thing the app
  answers on its own page it reads "How to get it" and opens that page
  (BR-30).

Relic rows follow BR-49: "Open {relic} Relic (Highest chance)" with the
diamond, then "Or {relic} Relic" for the others, "(Vaulted)" on a vaulted one.

### Components

No line and no diamond. Each row: a checkbox, the thing's art on the drawn
ground (BR-18), "{name} ×{n}" in bold, a chevron, the description and **Wiki
↗**. Ticking a row (`382:2233`):

- fills the box, dims the title and strikes it through, fades the art's ground;
- collapses the row, its chevron pointing down;
- is kept on this device (`wf:manual:item:{name}:{rowId}`), never read from the
  profile, which lists no resources.

Unticking brings the row back as it was.

### A collapsed row (`367:291`)

Only the title and a chevron pointing down. The chevron opens it. A fold is per
visit and is not kept.

### Locked rows (BR-63)

When Prerequisites holds a step the profile proves unmet, a Mastery Rank above
the player's or a junction whose tag `Missions[]` lacks, that row keeps full
contrast with the gap as its detail ("Needs Mastery Rank 8. You are Mastery
Rank 5."), and every row after it, in
every section, is drawn Locked: `Step row` Locked (`526:96`, `528:97` with art) and
`Component row` Locked (`526:102`), at half opacity, open and readable, never hidden. A
locked component can still be ticked. A quest with no evidence, or anything
else the profile cannot read, locks nothing.

## A quest's Step by step (BR-37)

A quest has no frame of its own and is placed in the grammar: the page's hero
shows the quest's art and "Quest" as kicker, with no state; **Prerequisites**
holds the quests and junctions before it (BR-28) and its Mastery Rank; **How to
get** names where it starts, with the wiki's passage. It has no Blueprints and
no Components unless the quest asks for an item to be built.

## Data and sources

- The plan: `stepPlan()` and `collectibleStepPlan()` in `src/lib/catalog/`,
  over the vendored wiki modules, DE's drop tables and the curated files.
- Prose: for a mission its type's Mechanics section, for a prose-only route
  the item's Acquisition section, otherwise the page's lead (BR-48); cached a
  day, its paragraphs
  kept (BR-48).
- Varzia's stock, live and cached ten minutes, only for a vaulted Prime on
  screen (BR-29).
- Ticks: browser storage, per device.

## Desktop (BR-39)

As spec 09: one reading column from 840, and from 1200 the hero pane stays in
view on the left while the sections scroll on the right. The prose keeps a
reading measure of at most 62 characters.

## Components

`SectionHeader` (icon kinds: game icon, part art), `Timeline`, `StepRow`
(step, optional, alternative, best; open, collapsed, locked), `RowDetail`,
`RowProse`, `WikiLink` (wiki, our page), `ComponentRow` (open, collapsed,
ticked, locked),
`GroupDivider`, `Checkbox`, each with its stories, and a story per scenario
frame above, built from fixture plans.

## Acceptance

1. At 390 px every scenario above matches its frame in layout, row types,
   states and order, with the data's own texts.
2. A collapsed row matches `367:291`; a ticked component matches `382:2233`
   and survives a reload.
3. Prose shows the source's paragraphs, from the source BR-48 names for the
   row's kind: Mechanics for a mission, Acquisition for a prose-only route,
   the lead otherwise.
4. Relic rows read Open and Or; the best route reads "(Highest chance)" in
   gold.
5. A quest opened from Goal renders in the grammar above.
6. With the Ordis fixture, Kuva Sobek's Mastery Rank row reads its gap at full
   contrast and every row after it is locked; with no `PlayerLevel` nothing is
   locked; a prerequisite quest with no evidence locks nothing (BR-63).
7. At 360, 600, 840, 1280 and 1440 nothing overlaps or is cut.
8. `pnpm check` passes, with a test per scenario that the plan has the sections
   and row types its frame draws.

## Divergences from the code

| Today                          | The frames and rules                                          |
| ------------------------------ | ------------------------------------------------------------- |
| Section heads as mono eyebrows | A game icon or part art and a display-face title              |
| Plain rows                     | Diamonds on a gold line; alternatives without diamonds        |
| "Wiki" as a separate link      | "Wiki ↗" inline at the end of the passage, in the link colour |
| One sentence of prose          | The passage in paragraphs (BR-48)                             |
| Relic rows as built            | Open and Or (BR-49)                                           |
| No quest Step by step          | The quest placed in the grammar (BR-37)                       |

## Frame corrections

The owner corrected this screen's frames on 2026-10-06, and the corrections
were applied in Figma the same day. The frames linked above are the design as
it stands.
