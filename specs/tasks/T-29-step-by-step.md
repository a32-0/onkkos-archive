# T-29 · Screen: Step by step

|          |                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------ |
| Phase    | 4. Screens                                                                                       |
| Serves   | [spec 10](../10-step-by-step.md); [plan 1](../plan/01-repository.md); BR-28, BR-37, BR-48, BR-63 |
| Waits on | [T-28](T-28-item.md)                                                                             |

The plan of an item or a quest, section by section, with the wiki's prose and the ticks the player keeps in the browser.

## What it builds

| File                    | Note           |
| ----------------------- | -------------- |
| `src/app/item/page.tsx` | Spec 10's view |
| `src/screens/steps/`    |                |
| `src/infra/ticks.ts`    |                |
| `src/content/checks.ts` | Spec 10        |

## Documents

- `docs/step-by-step.md`: what Step by step draws and why

## From T-16

- The step plan holds no words: every title, detail, reading and group heading is a phrase, `{ say, …values }`. `content/checks.ts` holds one function per `say`, typed against `Phrase` in `domain/catalog/checks.ts`, and a row's `best`, `alternative` and `optional` add "(Highest chance)", "Or" and "(Optional)". A detail joins its parts with a space, a reading with " · ".

## From T-19

- `withProse(wiki, plan)` in `infra/wiki/prose.ts` gives each row its prose as paragraphs, or null; `wikiModules()` gives the wiki. A mission type's page with no Mechanics section gives its lead, and an item with no Acquisition section gives null (owner, 2026-10-14).
- `fetchVarzia()` in `infra/worldstate/client.ts` is read only for a vaulted Prime (BR-29); its stock, or null, is the step plan's `varzia`.

## From T-20

- Step by step is the item's page: the same `Shell` and `from`. Onkko's line closes the page, from `VOICE`. Spec 10 quotes no line, and `language.test.ts` checks every line against the specs: settle it with the owner and quote it in spec 10 first.

## Acceptance

- [ ] Every acceptance item of spec 10 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on `dev`.
