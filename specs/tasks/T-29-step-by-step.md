# T-29 · Screen: Step by step

|          |                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                                              |
| Serves   | [spec 10](../10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-28, BR-37, BR-48, BR-63, BR-66 |
| Waits on | [T-28](T-28-item.md)                                                                                    |

The plan of an item or a quest, section by section, with the wiki's prose and the ticks the player keeps in the browser.

## What it builds

| File                           | Note                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `src/app/item/page.tsx`        | Spec 10's view                                         |
| `src/app/item/item.ts`         | The plan, its prose and its lock, for a quest too      |
| `src/app/item/ItemTicks.tsx`   | Hands the ticks to the screen                          |
| `src/screens/item/steps/`      | The view and `Steps`                                   |
| `src/domain/catalog/checks.ts` | `questStepPlan()` and `planLock()`                     |
| `src/infra/ticks.ts`           |                                                        |
| `src/content/checks.ts`        | Spec 10: the details, the group headings and the marks |
| `src/content/states.ts`        | Spec 10                                                |

## Correction

Written on 2026-10-19, during the task.

- A quest opened from Goal had no plan: the page answered only items and
  collectibles. `questStepPlan()` places a quest in the grammar (BR-37), and
  the page answers a quest's name.
- `planLock()` reads BR-63 off the plan's Prerequisites, so the page draws
  the lock rather than working it out.
- The view lives in `src/screens/item/steps/`: Step by step is a view of the
  item's page, and every folder of `src/screens/` is a screen that gives
  Onkko a line, which the item's page already does.
- The ticks reach the screen through `src/app/item/ItemTicks.tsx`, since a
  screen may not import `infra/`.
- Onkko's line stays at the top of the page, as `662:7143` draws it; the
  frame draws no closing line, so none was added (From T-20 below).

## Documents

- `docs/step-by-step.md`: what Step by step draws and why

## From T-16

- The step plan holds no words: every title, detail, reading and group heading is a phrase, `{ say, …values }`. `content/checks.ts` holds one function per `say`, typed against `Phrase` in `domain/catalog/checks.ts`, and a row's `best`, `alternative` and `optional` add "(Highest chance)", "Or" and "(Optional)". A detail joins its parts with a space, a reading with " · ".

## From T-19

- `withProse(wiki, plan)` in `infra/wiki/prose.ts` gives each row its prose as paragraphs, or null; `wikiModules()` gives the wiki. A mission type's page with no Mechanics section gives its lead, and an item with no Acquisition section gives null (owner, 2026-10-14).
- `fetchVarzia()` in `infra/worldstate/client.ts` is read only for a vaulted Prime (BR-29); its stock, or null, is the step plan's `varzia`.

## From T-20

- Step by step is the item's page: the same `Shell` and `from`. Onkko's line closes the page, from `VOICE`. Spec 10 quotes no line, and `language.test.ts` checks every line against the specs: settle it with the owner and quote it in spec 10 first.

## From T-25

- `content/checks.ts` exists with the eight readings a Summary tile shows (`BRIEF`) and `briefLine()`, which joins with " · ". `content/` cannot import `domain/`, so each function types its own values; `screens/summary/lines.ts` checks `BRIEF` against `Phrase` at compile time. The rest of the phrases join it here.

## From T-28

- `content/checks.ts` holds the words of every title and section phrase (`TITLES`) and of every reading (`BRIEF`), checked against `Phrase` in `screens/summary/lines.ts`. The details, the group headings and the "(Highest chance)", "Or" and "(Optional)" marks join them here.
- The page reads `?view=steps` and opens an item beyond reach on it (`initialView()` in `screens/item/view.ts`); the View row switches without a reload. With Step by step chosen, the page shows Onkko's line, You're on, the hero and the View row, and this task draws the plan under them.
- A blueprint row links to `itemRoute(name, from, "steps", section)`, which ends in `#{section id}`: each part's section takes its plan id (`part:{name}`) as its anchor.

## Owner review, 2026-10-19

- Components' groups are split by a plain line with no title, as `662:7558`
  draws it; `Divider` with no label draws that line (spec 10).
- A component's art has no ground in Step by step; a ticked one dims its art.
- Every badge is one size: `.badge`, 8 px padding, a 1 px border (plan 3).
- A row's place names a node as "{Node} ({Planet}) · {Mission}" (spec 09).
- An Arsenal category every item of which is mastered carries the Mastered
  tag on the map (spec 07).
- Figma was brought level with the code the same day: the Badge set, Place
  and System rows (Badge instances at the end), the Component row's art, List
  item's "Show tag", the group lines of the Step by step scenarios, and the
  sample texts.

## Owner review, 2026-10-19 (second)

- A component row's body starts under the art, 32 px in, so nothing sits
  under the checkbox; "Wiki ↗" closes the same line of text (`465:477`).
- Every badge is as wide as the widest, 92 px, so badges side by side line up;
  New has no stroke, its border kept transparent so it stays as tall (plan 3).
- A system's steps are titled "How to get", as the frames draw them (spec 10).
- Updates, Change location and Change system keep one height, 84 px; a long
  name shrinks its type down to a floor, then takes a second line, then
  ends in an ellipsis, instead of growing the card. This replaces "one height, the taller setting
  it" (spec 07, T-28).

## Owner review, 2026-10-20

- Similar prerequisites share one row: more than one quest read "Complete
  {n} quests", more than one Junction "Clear {n} Junctions", each naming
  its list in the detail; a Reach row its Junction already names is dropped
  (BR-66). The Hex goes from seventeen rows to two.
- A page with a back button has no tab bar below 840; from 840 the header
  keeps its tabs (spec 04).
- A quest's art is found under its name or its wiki title ("The Hex
  (Quest)"), and Credits take the wiki's versioned image from
  `vendor-art.json`: the wiki serves an image only with its version.
- Goal's search finds every quest of the spine, "Quest" as its catalogue
  (spec 08).

## Owner review, 2026-10-21

- The wiki's prose is trimmed by rule, with no hand-written text: Mechanics
  up to its first subsection, only lines that are sentences, no footnote
  numbers, three sentences at most (BR-48). Citrine's Mirror Defense goes
  from every variant and its audio captions to its three opening sentences.
- The timeline's line runs from under a diamond to 4 px above the next one,
  across the space between rows, as the frames draw it.

## Owner review, 2026-10-21 (second)

- Places to reach share one row too, "Reach {n} places" (BR-66); Ash's three
  Proxima become one row, and Figma's Ash frame moves them out of each part
  into Prerequisites, as the code has them.
- The line runs on unbroken into an alternative ("Or play …"), which has no
  diamond of its own.
- Every page names itself in the browser's tab, "{Page} · Onkko's Archive",
  an item or a category by its own name; the favicon is the quill of the
  imagotype (`421:615`), `src/app/icon.svg`.
- Profile writes the next read in the player's own time, "9:30 AM your local
  time." (spec 04, BR-07).
- Connect's public note says, in plain words, what is kept: "It's safe: it's
  the same public profile the game shows when you look at another player. We
  only remember your ID on this device, and Disconnect forgets it." No consent
  banner, since the app keeps no cookie it does not need (spec 02). Connect's
  cards sit 16 px apart, as the frame draws them.

## Owner review, 2026-10-21 (third)

The owner asked for a full sweep of the item page, Summary and Step by step,
after finding fish parts with no description, refined gems that opened the
wiki instead of their own page, and Forma and Kuva with no art.

- Every Cinzel style is set in capitals (plan part 3).
- Updates carries Resume's search (spec 06).
- A gear recipe is summed into Components, what only an optional step asks
  for in one last group, each row "(Optional)", in Step by step and Summary
  alike (BR-32).
- Every resource a recipe names has its own page (BR-67): the catalog keeps a
  resource whose wiki entry says where it comes from (its "Location", "Source"
  or a sentence that says how it is earned), whose recipe the catalog has, or
  whose blueprint a vendor sells. Its How to get says so: where the wiki sends
  the player, "Buy its blueprint from {vendor}", "Build it in your foundry",
  and for Forma, the Void Relics its blueprint opens from.
- A component's description, in order: where the wiki says it comes from,
  what it is made from, the relics it opens from; a part of the thing itself
  (a landing craft's Avionics, a collar's Band) says it is a part. Standing,
  Ducats and the other currencies say what they are; credits say where they
  come from.
- An item researched in the dojo says, on each part, that the lab's research
  gives its blueprint. A modular weapon no longer lists its blueprint as a
  resource, and a weapon a recipe uses up is a weapon row.
- Art falls back to the wiki's own file when the catalog's art is missing or
  WFCD's placeholder (Forma, Kuva, the fish).
- A Summary line with no reading shows its description instead; a component
  bought from a vendor names the vendor.
- A collectible's "You're on" comes from its own How to get; one built in the
  foundry has none.
- `tests/item-sweep.test.ts` holds every item and collectible to all of it.
  Ten components keep the wiki's prose and link to the wiki, because no
  source says where they come from: the Greater Focus Lens, the Javlok
  Capacitor, the three Mandachord parts, Orion's and Sirius' Swaddle
  Syandanas, the Proof Fragment, the Trembera Essence and the Vizier
  Predasite Tag.

## Acceptance

- [ ] Every acceptance item of spec 10 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
