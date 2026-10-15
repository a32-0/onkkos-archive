# T-22 · Screen: Connect

|          |                                                                               |
| -------- | ----------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                    |
| Serves   | [spec 02](../02-connect.md); [plan 1](../plan/01-repository.md); BR-03, BR-38 |
| Waits on | [T-21](T-21-onboarding.md), [T-18](T-18-profile-proxy.md)                     |

The id form, its loading card, the five error bands and the demo entrance. A failed read anywhere lands here with its reason.

## What it builds

| File                           | Note                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/app/connect/page.tsx`     | Spec 02                                                                                                          |
| `src/app/actions.ts`           | Connect and demo                                                                                                 |
| `src/domain/types/next.ts`     | The screen reads `?reason=` and `?retry=` (T-13's correction)                                                    |
| `src/screens/connect/`         |                                                                                                                  |
| `src/content/failures.ts`      | The five band messages (BR-38)                                                                                   |
| `src/content/onboarding.ts`    | The form's strings and `connectError`; the field's placeholder is `000000000000000000000001`, as the frames show |
| `tests/connect-errors.test.ts` | The five reasons of BR-38                                                                                        |
| `tests/tokens.test.ts`         | `.numeral` and `.mono-label` leave the allowance list                                                            |

## From T-19

- A failed read lands as `/connect?reason=…&retry=…`, built by `connectAfter()` in `routes.ts`. `retry` is the Unix time, in seconds, when a retry can succeed, and only `limited` and `circuit-open` carry one (plan part 2).
- The connect and demo actions keep the id with `writeAccountId()` in `infra/session.ts`; the field reads `readAccountId()`.

## From T-20

- Disconnect (`app/actions.ts`) forgets `wf_account` and `wf_since` and redirects to `/connect` with no query: the field must open empty.
- `tests/language.test.ts` checks `src/screens/connect/` for an `OnkkoLine` fed from `VOICE`, and every line of `content/voice.ts` against the specs. `VOICE.connect` exists.

## From T-21

- `content/onboarding.ts` is created here: spec 01's only strings are `VOICE.onboarding` and `VOICE.onboardingEnter`, so T-21 left it out.
- `Button` takes `href` and `link` and then draws a link that looks the same; Begin opens `/connect` that way. The field holding the remembered id (spec 01, acceptance 3) is this task's.

## Acceptance

- [ ] Every acceptance item of spec 02 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the app on their machine with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] The screen applies `.numeral` (the numbered steps) and `.mono-label` (the field's label), and both leave the allowance list of `tests/tokens.test.ts`.
- [ ] `check.yml` passes on `dev`.
