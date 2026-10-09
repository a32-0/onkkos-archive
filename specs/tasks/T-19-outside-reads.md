# T-19 · Outside reads and the request: wiki, Varzia, cookies, the screen read

|          |                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 3. Domain and infra                                                                                                                                                               |
| Serves   | [spec 04](../04-shell.md), [spec 07](../07-map.md), [spec 09](../09-item-summary.md), [spec 10](../10-step-by-step.md); [plan 2](../plan/02-architecture.md); BR-38, BR-46, BR-48 |
| Waits on | [T-16](T-16-catalog.md), [T-18](T-18-profile-proxy.md)                                                                                                                            |

Everything else that touches the outside: the wiki's prose and icons, Varzia's stock, the cookies, the one read every screen makes (`readScreen()`), and `proxy.ts`, which writes the last place visited. Wiki and worldstate reads stay in Next's data cache (`force-cache` with `revalidate`), and no route exports `force-dynamic`.

## What crosses

| File                                       | Origin   | Note                                                                                         |
| ------------------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `src/infra/wiki/client.ts`, `icons.ts`     | Moves    |                                                                                              |
| `src/infra/wiki/prose.ts`                  | Reworked | BR-48: paragraphs, Mechanics for missions                                                    |
| `src/infra/worldstate/client.ts`           | Reworked | Varzia's stock only                                                                          |
| `src/infra/session.ts`                     | Reworked | `wf_account`, `wf_since`, `wf_place`; the lore cookie goes; the month from `domain/since.ts` |
| `src/infra/screen.ts`                      | Reworked | A failed read redirects to `/connect?reason=…&retry=…` (BR-38); no `content/` import         |
| `src/proxy.ts`                             | New      | Writes `wf_place`; skips prefetches                                                          |
| `next.config.ts`                           | Reworked | `logging.fetches`; `outputFileTracingIncludes` for `data/` and `fixtures/`                   |
| `tests/checks.test.ts`, `scenario.test.ts` | Moves    | They read through the wiki client                                                            |

## Acceptance

- [ ] In development, `logging.fetches` shows the wiki and worldstate reads as hits on a second render; the commit message records what it showed.
- [ ] A prefetch of a place does not change `wf_place`.
- [ ] A failed read lands on `/connect` with the reason and the retry time.
- [ ] `check.yml` passes on `dev`.
