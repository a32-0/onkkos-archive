# T-20 · Screen: the shell

|          |                                                                                      |
| -------- | ------------------------------------------------------------------------------------ |
| Phase    | 4. Screens                                                                           |
| Serves   | [spec 04](../../specs/04-shell.md); [plan 1](../plan/01-repository.md); BR-39, BR-41 |
| Waits on | [T-10b](T-10b-reach-states.md), [T-19](T-19-outside-reads.md)                        |

The header, the player chip and its menu with Disconnect, the tab bar and its origin rule, and the sheet header: what every later screen sits in.

## What it builds

| File                                            | Note                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                            | Spec 04: the document, the fonts, the title and the viewport; no shell (Corrections)                                            |
| `src/routes.ts`                                 | With only the routes that exist; each screen task adds its own. This task adds the tabs' three destinations                     |
| `src/app/actions.ts`                            | Disconnect                                                                                                                      |
| `src/app/screen.ts`                             | `playerOf()`: the player the shell shows                                                                                        |
| `src/infra/screen.ts`                           | `nextReadAt()`: the last read plus `PROFILE_TTL_MS`                                                                             |
| `src/screens/shell/`                            | `Shell`, the chip and its menu, the tabs and the read cycle                                                                     |
| `src/content/app.ts`, `voice.ts`, `nav.ts`      | Spec 04                                                                                                                         |
| `tests/content.test.ts`                         | The player's rank title (T-13's correction)                                                                                     |
| `tests/language.test.ts`                        | Onkko speaks on every screen: each page opens or closes with a line from `voice.ts`; each screen task after it is checked by it |
| `tests/shell.test.ts`                           | The tabs, `from`, the read cycle and the shell rendered                                                                         |
| `tests/request.test.ts`                         | Disconnect and `playerOf()`                                                                                                     |
| `src/app/layout.module.css`                     | The document's body                                                                                                             |
| `src/ui/Button`, `OnkkoLine`, `StepRow` modules | Each class names its type class itself (Corrections)                                                                            |
| `tests/tokens.test.ts`                          | No chain of `composes` into another file                                                                                        |

## Documents

- `docs/business-rules.md`: BR-07's footer as the frame draws it, and the age's words
- `docs/spec-driven-order.md`: what `language.test.ts` checks
- Plan part 1: `app/screen.ts` and `infra/screen.ts`; plan part 2: the page renders the shell, not the layout; plan part 3: no chain of `composes`

## From T-19

- `src/routes.ts` exists, with `/connect` and `connectAfter()`, the failure URL; this task adds the shell's routes.
- A page reads through `requireScreen()` in `app/screen.ts`: it answers the `Screen` or redirects to `/connect`. `readScreen()` is wrapped in React's `cache()`, so the layout and the page share one read.
- `Screen` carries `cached` and `fetchedAt`. The last read's age and `nextReadAt()` (spec 04) are this task's: the age is words, so it is not in `infra/`, and the next read is `fetchedAt` plus `PROFILE_TTL_MS` from `infra/profile/cache.ts`.
- Disconnect calls `forgetAccount()` in `infra/session.ts`, which forgets `wf_account` and `wf_since`.

## Corrections

- **The page renders the shell, not the layout.** Next 16.3 gives a layout neither the pathname nor the query, so it cannot know the active tab, the item's `from` or Resume's entrance, and `/`, `/connect` and `/features` have no player. `layout.tsx` holds the document; each screen of the shell wraps itself in `Shell` with its tab and whether the tab bar shows. The note from T-19 that "the layout and the page share one read" no longer holds; `cache()` stays for any two server components of one request.
- **The routes.** The tab bar links to `/system`, `/catch-up` and `/goals`, so `routes.ts` holds them now; they answer 404 until T-24, T-26 and T-27 build them.
- **No visual check in this task (owner, 2026-10-14).** No route shows the shell until Resume. The owner compares the shell with `212:159`, `312:199` and `270:1145` at 390 px, and sweeps 360 to 1440, in T-24. Acceptance 1 and 4 of spec 04, and this task's third item, move there.
- **The read cycle follows the frame.** BR-07 quoted an older wording ("Read every twelve hours: last read 12 min ago…"); spec 04 and `270:1145` say "Data is read every 12 hours. The last read was 12 minutes ago, and the next one will be at 15:30 hours UTC.", with three parts in bold. BR-34 settles it for the frame; BR-07 is corrected. The age is said in whole words, as the frame does (owner, 2026-10-14).
- **`nextReadAt()` lives in `infra/screen.ts`**, as BR-07 says, and answers a time, not words; the shell writes it as HH:MM in UTC. `playerOf()` reads the clock and hands the shell the whole minutes since the read: React's purity rule fails `Date.now()` in a component, a page included, as a local page built to check the shell showed.
- **The player.** `playerOf()` in `app/screen.ts` turns the screen into plain values; a profile without a display name shows the account id, and one without a rank shows rank 0.
- **The item's `from`.** It names a tab: `navigation`, `resume` or `goal`. Anything else lights no tab.
- **`voice.ts` holds exactly the lines the specs quote, as they write them**; `features` follows spec 03 ("We have, and shall have a long association, {name}."). Spec 09 quotes only "Well chosen.", so T-28 settles the line for an item not owned with the owner, and spec 10 quotes no line, so T-29 does the same.
- **`content/app.ts`** holds the name and the description the layout's metadata uses.
- **`language.test.ts`** checks every folder under `src/screens/` but the shell for an `OnkkoLine` fed from `VOICE`, and every line against the specs. Until T-21 there is no screen to check. It checks that the line is there; where it sits, opening or closing the page, is checked against the frames.
- **`tests/shell.test.ts`** is new: it renders `Shell` on the server and checks the tabs, the lit tab and the menu. `request.test.ts` checks Disconnect: it clears `wf_account` and `wf_since`, keeps `wf_place`, and lands on `/connect`.
- **The wide layout is the shell's.** `Header` and `TabBar` do not switch at 840 themselves, so `Shell.module.css` shows the header's tabs and hides the bottom bar from 840. No `ui/` component is restyled.
- **The type of three components in Next's build (owner, 2026-10-14).** A local page that rendered the shell showed Disconnect in Arial 13 px: `.danger` composed `.button`, which composed `label` from `type.module.css`, and Next's build does not follow that chain, though Storybook does. `Button`'s four variants, `OnkkoLine`'s two places and `StepRow`'s `.best` now name their type class themselves, and `tests/tokens.test.ts` fails a chain. Plan part 3 says so.
- **The document's body.** `src/app/layout.module.css` gives `body` no margin, the canvas and the ink; without it the page showed white around the shell.
- **The local check.** A page that was never committed wrapped a line in `Shell` with the Cy demo, under `pnpm build` and `pnpm start`: the tab bar sits at the bottom up to 839 and in the header from 840, nothing overflows at 360, 390, 600, 840, 1280 or 1440, the menu is full screen at 390 and a 390 px panel under the chip at 1280, and Disconnect left only `wf_place` and landed on `/connect`. This is evidence, not the owner's comparison, which stays in T-24.

## Acceptance

- [x] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [x] Every acceptance item of spec 04 holds, but 1 and 4, which T-24 checks on the first screen that shows the shell.
- [x] The comparison with the frames at 390 px and the sweep at 360, 600, 840, 1280 and 1440 move to T-24 (owner, 2026-10-14).
- [x] `check.yml` passes on `dev`.
