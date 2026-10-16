# T-22 · Screen: Connect

|          |                                                                               |
| -------- | ----------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                    |
| Serves   | [spec 02](../02-connect.md); [plan 1](../plan/01-repository.md); BR-03, BR-38 |
| Waits on | [T-21](T-21-onboarding.md), [T-18](T-18-profile-proxy.md)                     |

The id form, its loading card, the five error bands and the demo entrance. A failed read anywhere lands here with its reason.

## What it builds

| File                           | Note                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/connect/page.tsx`     | Spec 02; the demos' names and ranks read from their fixtures                                                                                      |
| `src/app/actions.ts`           | Connect and demo                                                                                                                                  |
| `src/app/screen.ts`            | `entranceAfter()`: `/features` or `/goals` by BR-03                                                                                               |
| `src/routes.ts`                | `/features`                                                                                                                                       |
| `src/domain/types/next.ts`     | The screen reads `?reason=` and `?retry=` (T-13's correction)                                                                                     |
| `src/screens/connect/`         | The page, the form with its loading and its band, and the action's state                                                                          |
| `src/content/failures.ts`      | The five band messages (BR-38)                                                                                                                    |
| `src/content/onboarding.ts`    | The form's strings and `connectError`; the field's placeholder and the example are `4b2e9f17c3a85d06e1f74a9c`, an invented id, as the frames show |
| `tests/connect-errors.test.ts` | The seven reasons and their five messages (BR-38)                                                                                                 |
| `tests/connect.test.ts`        | The page: the remembered id, a band sent from elsewhere, the links, the demos                                                                     |
| `tests/request.test.ts`        | Connect, the demos and BR-03's routing                                                                                                            |
| `tests/tokens.test.ts`         | `.numeral` and `.mono-label` leave the allowance list                                                                                             |

## From T-19

- A failed read lands as `/connect?reason=…&retry=…`, built by `connectAfter()` in `routes.ts`. `retry` is the Unix time, in seconds, when a retry can succeed, and only `limited` and `circuit-open` carry one (plan part 2).
- The connect and demo actions keep the id with `writeAccountId()` in `infra/session.ts`; the field reads `readAccountId()`.

## From T-20

- Disconnect (`app/actions.ts`) forgets `wf_account` and `wf_since` and redirects to `/connect` with no query: the field must open empty.
- `tests/language.test.ts` checks `src/screens/connect/` for an `OnkkoLine` fed from `VOICE`, and every line of `content/voice.ts` against the specs. `VOICE.connect` exists.

## From T-21

- `content/onboarding.ts` is created here: spec 01's only strings are `VOICE.onboarding` and `VOICE.onboardingEnter`, so T-21 left it out.
- `Button` takes `href` and `link` and then draws a link that looks the same; Begin opens `/connect` that way. The field holding the remembered id (spec 01, acceptance 3) is this task's.

## Corrections

- **Both demos land on `/features` (owner, 2026-10-15).** Spec 02 sent Ordis to `/goals`, but the Ordis fixture stops at Mercury, past Venus, and `demo-fixtures.test` holds it there on purpose. A demo goes on by BR-03 as a real read would, so spec 02 now says both land on `/features`. A new player's way to `/goals` is tested with a profile that has no junction.
- **`/features` and `/goals` answer 404** until T-23 and T-27 build them; Connect already sends players there.
- **The veil is `--scrim` (owner, 2026-10-15).** The Loading frame dimmed the page with the canvas at 80% opacity, bound to no veil. It is now the `scrim` variable at 60%, as on the splash (T-21), so the app has one veil.
- **The steps and the example are the screen's own.** Plan part 3 keeps the numbered steps, the address boxes and the example JSON as loose layers with no component, so `Connect.module.css` lays them out with `.numeral`, `.mono` and `.mono-label` from `type.module.css`. No `ui/` component is restyled.
- **Wider than the frame (BR-39).** Below 600 the page is fluid, with the 16 px gutter at the window's edges; from 600 it stays one centred column at the frame's 390 px, with the header across the window. The two address links take the one hover treatment, `--hover`, as every pressable thing does.
- **The column was capped at 390 at every width (owner, 2026-10-15, after this task's commit).** On a 402 px phone the cards stood 22 px from the edges instead of 16, and the splash's Begin likewise. BR-39's compact class is fluid below 600, so both screens now cap their column only from 600; BR-39 and specs 01 and 02 say so. Measured at 360, 390, 402, 430 and 599: the cards and the loading card 16 px from each edge, Begin 32 px (the gutter and the frame line's padding).
- **The id comes from the `gid` cookie (owner, 2026-10-15).** `https://www.warframe.com/api/user-data`, which the frames' second step opened, answers 404: Digital Extremes removed it, and other projects report the same. The owner found the id as the value of the `gid` cookie on warframe.com (Storage › Cookies in Firefox, Application › Cookies in Chrome and Edge). Steps 2 and 3 and the example were redrawn in Login, Loading and Error, spec 02 and `docs/api.md` say so, and the first step says "On a computer", since a phone has no developer tools. The owner then reworded the steps in Login (step 1 opens with "On a computer", step 2 names each browser in `Mono/Strong`), which was copied to Loading and Error; the step texts there had lost their text styles in the first edit and have them again (`Body/Large`, `Mono`). The example JSON, which broke anywhere, became the cookie's name and value. The `not-found` band of BR-38 now says "Copy it again from the gid cookie.", in the code and in the Error band component in Figma.
- **An invented example id (owner, 2026-10-15, after this task's commit).** The placeholder and the example showed `000000000000000000000001`, Cy's demo id, which says little about what an id looks like. Both now show `4b2e9f17c3a85d06e1f74a9c`, an invented id of 24 characters of 0–9 and a–f whose ObjectId time, 20 December 2009, comes before Warframe, so it cannot belong to an account (spec 02); the Login, Loading and Error frames show the same.
- **The band's wording without a time.** BR-38 gives `limited` a time, which the budget always knows. Should one come without it, the band keeps the first sentence alone: "You've had your two readings for now."
- **An unknown `?reason=` shows no band**, and `?retry=` is read only when it is a whole number.
- **The frame's typography is kept**: "Onkko’s reading your codex..." and "It’s a safe public read endpoint…" use the frame's apostrophe.
- **The local check.** Under `pnpm build` and `pnpm start`, at 390 the header is 81 high and the field and Connect are 326 wide at x 32. A malformed id showed the `invalid-id` band and kept what was typed. Ordis's id, with the read held back 2.5 s, dimmed the page and showed the quill card, 358 wide, with Connect busy, then landed on `/features` with `wf_account` set. `/connect?reason=limited&retry=…` showed "The next opens at 15:30 UTC." with the remembered id in the field. Cy's demo landed on `/features`. At 360, 600, 840, 1280 and 1440 nothing scrolled sideways and the column stayed 390 wide and centred. No request left the app. This is evidence, not the owner's comparison.

## Acceptance

- [ ] Every acceptance item of spec 02 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The screen applies `.numeral` (the numbered steps) and `.mono-label` (the field's label), and both leave the allowance list of `tests/tokens.test.ts`.
- [ ] `check.yml` passes on `dev`.
