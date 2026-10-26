# T-19 · Outside reads and the request: wiki, Varzia, cookies, the screen read

|          |                                                                                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                                                                                                   |
| Serves   | [spec 04](../../specs/04-shell.md), [spec 07](../../specs/07-map.md), [spec 09](../../specs/09-item-summary.md), [spec 10](../../specs/10-step-by-step.md); [plan 2](../plan/02-architecture.md); BR-38, BR-46, BR-48 |
| Waits on | [T-16](T-16-catalog.md), [T-18](T-18-profile-proxy.md)                                                                                                                                                                |

Everything else that touches the outside: the wiki's prose and icons, Varzia's stock, the cookies, the one read every screen makes (`readScreen()`), and `proxy.ts`, which writes the last place visited. Wiki and worldstate reads stay in Next's data cache (`force-cache` with `revalidate`), and no route exports `force-dynamic`.

## What it builds

| File                                       | Note                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `src/infra/wiki/client.ts`, `icons.ts`     |                                                                                                      |
| `src/infra/wiki/prose.ts`                  | BR-48: paragraphs, Mechanics for missions                                                            |
| `src/infra/worldstate/client.ts`           | Varzia's stock only; Nightwave is not read (BR-35)                                                   |
| `tests/rotations.test.ts`                  | With Varzia's stock                                                                                  |
| `src/infra/session.ts`                     | `wf_account`, `wf_since`, `wf_place`; the month from `domain/since.ts`                               |
| `src/infra/screen.ts`                      | `readScreen()`: the profile and its readings, or the reason and the retry time; no `content/` import |
| `src/app/screen.ts`                        | `requireScreen()`: a failed read redirects to `/connect?reason=…&retry=…` (BR-38)                    |
| `src/routes.ts`                            | `/connect` and the failure URL                                                                       |
| `src/proxy.ts`                             | Writes `wf_place`; skips prefetches                                                                  |
| `next.config.ts`                           | `logging.fetches`; `outputFileTracingIncludes` for `data/` and `fixtures/`; `agentRules: false`      |
| `tests/checks.test.ts`, `scenario.test.ts` | They read through the wiki client                                                                    |
| `tests/request.test.ts`                    | The cookies, the screen read, the redirect and `proxy.ts`                                            |

## Documents

- `docs/api.md`: the other outside sources, beside DE's endpoint: the wiki's prose and icons, and Varzia's stock with its cache; BR-29 cites it for Varzia and says ten minutes where plan part 2 says a minute, so the client and both texts end with one figure: ten minutes
- Plan part 1: `app/screen.ts`; plan part 2: Varzia's ten minutes, the three cookies `httpOnly`, the retry time and who redirects

## From T-18

- `readProfile(accountId)` in `infra/profile/read.ts` is the read a request makes: React `cache()`, the visitor from the request. It returns `ProfileResult`; a failure carries a `FailureReason` and, for `limited` and `circuit-open`, `retryAfterSeconds`.
- `FailureReason` is in `domain/types/profile.ts`, so `/connect` can check `?reason=` against it without importing `infra/`.

## From T-16

- The catalog's data is one value, `catalogData()` in `infra/catalog/data.ts`; every catalog function takes it first. The step plan takes `{ now, masteryRank, varzia, done }`: `infra/worldstate/client.ts` returns Varzia's stock in the shape `checks.ts` reads (`location`, `expiry`, `offers` with `uniqueName`, `aya`, `regalAya`).
- `parseRequirements`, `namesItem` and the scenario's inner functions (`layoutOf`, `scenarioOf`, `totalsOf`, `wikiNode`, `hubRequirements`, `companionOf`, `systemOf`) are not exported: no T-16 test read them. Export each one `tests/checks.test.ts` or `scenario.test.ts` reads, with the test.
- A prose ask carries its `source` (mechanics, acquisition or lead, BR-48), so `prose.ts` reads the section it names.

## Corrections

- The redirect is `requireScreen()` in `app/screen.ts`, not `infra/screen.ts`: `infra/` may not import `routes.ts`, which builds the URL. `readScreen()` returns the reason and the retry time (owner, 2026-10-14). Plan parts 1 and 2 say so.
- `src/routes.ts` starts here, with `/connect` and the failure URL, not in T-20.
- The screen read keeps no words: the last read's age and `nextReadAt()` go to T-20, which shows them (spec 04).
- The retry is the Unix time, in seconds, when a retry can succeed: `readScreen()` adds `retryAfterSeconds` to the time of the read. Only `limited` and `circuit-open` carry one. Plan part 2's example used `throttled`, which carries none; it now uses `circuit-open`.
- Varzia's stock is kept ten minutes, as BR-29 and spec 10 say; plan part 2 said a minute (owner, 2026-10-14).
- The prose of BR-48 is the whole passage, in its paragraphs: no cap on paragraphs, no first sentence. `firstSentence`, `leadSentence` and `acquisitionSentence` are gone, with `fetchWikiExtract`, `fetchWikiImage` and `firstParagraph`, which nothing called.
- A mission type's page with no Mechanics section gives its lead (owner, 2026-10-14); BR-48, spec 10 and `scenario-guidelines.md` say so. An item with no Acquisition section gives nothing; every one the catalog asks for has one, checked against the wiki on 2026-10-14.
- The three Hounds have no page of their own: `wiki-titles.json` sends them to a section of the Model page (`Model#Bhaira`). An Acquisition ask whose title names a section reads that section, and only those three ask one; `scenario.test.ts` fails if another appears. A lead ask whose title names a section, a vendor's such as `Acrithis#Enigma Archives`, still reads the page's lead, as BR-48 asks for a vendor (owner, 2026-10-14).
- `withProse()` takes the wiki's modules, for the page titles of `wiki-titles.json`, and asks once per page and source.
- `icons.ts` keeps no promise of its own: the data cache already holds the read, and a module promise kept the first list of places for every later one.
- `wf_since` and `wf_place` are `httpOnly`, like `wf_account`: only the server reads them since the month is written by a server action (T-15b) (owner, 2026-10-14). Plan part 2 says so.
- `proxy.ts` writes `wf_place` only for a system id and a place name of the expected shape. It skips prefetches in its matcher's `missing`, not in its code: Next removes `next-router-prefetch` from the request the proxy receives, and a code check let a prefetch write the cookie on the built app. `unstable_doesMiddlewareMatch` tests the matcher, and the built app wrote the cookie on a navigation and not on a prefetch. Plan part 2 says so.
- `next.config.ts` names `data/` and `fixtures/` for every route. The build's trace of `/api/profile/[accountId]` lists all 29 files of the two folders; without the setting it listed 4.
- `next.config.ts` sets `agentRules: false`: `next dev` otherwise appends its own block to a `CLAUDE.md` at the root (owner, 2026-10-14).
- `tests/request.test.ts` is new: nothing calls `session.ts`, `screen.ts` or `proxy.ts` before the screens, and `knip` fails on an export nothing reaches.
- `scenario.test.ts` reads phrases, not strings (T-16). Its Summary block is not ported: `summary.test.ts` covers BR-55, which replaced it. `parseRequirements`, `partName`, `layoutOf`, `scenarioOf` and `namesItem` are exported for it, as T-16 said; `checks.ts` exports the types `prose.ts` and the worldstate client read.
- `api.md` is now "The outside sources", and its Platforms section names the one source with a platform: Varzia's stock is read from `/pc/`.

## Acceptance

- [x] In development, `logging.fetches` shows the wiki and worldstate reads as hits on a second render; the commit message records what it showed.
- [x] A prefetch of a place does not change `wf_place`.
- [x] A failed read lands on `/connect` with the reason and the retry time.
- [x] `check.yml` passes on `dev`.
