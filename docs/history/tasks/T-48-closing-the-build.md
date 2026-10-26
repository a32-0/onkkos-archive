# T-48 · Closing the build

|          |                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                                                                     |
| Serves   | [constitution](../../specs/00-constitution.md), [BR-39](../../business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes) |
| Waits on | [T-47](T-47-readme-sections.md)                                                                                                                |

The last task, asked by the owner on 2026-10-24 after reading T-47's README.
Three changes close the build:

- **The app is never wider than 600 px.** The demo kept the width classes of
  Material 3 above 840, with a floating tab bar and two panes, while the
  desktop window never passes 600. The owner asked for the demo to feel like
  the app it offers. The page is now a centred column 600 px wide at every
  width, in the demo, in development and in the app, and the layouts above
  840 are gone from the code, BR-39 and every spec.
- **The documents live in `docs/`.** The constitution and the specs moved to
  `docs/specs/`, current. The plan, the tasks, `public-release.md` and
  `spec-driven-order.md` moved to `docs/history/`, kept as a record and no
  longer maintained. Later changes are not cut into tasks.
- **A guide for maintaining the app**, `docs/maintaining.md`, so the owner can
  keep it running alone: the checks, the content update, a bug, a change to a
  screen, a release, the tools, and what could come next.

Also: the README's section titles were exported again without the quill (the
owner removed it in Figma), and the documents were read against the app as it
is, to remove what still described the website that read DE.

## What it builds

| File                                                                              | Note                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/app/layout.module.css`                                                       | The page at most 600 px wide, centred                                          |
| `src/screens/`                                                                    | Every rule above 840 removed; the shell's floating bar and the map's pane gone |
| `tests/shell.test.ts`, `tests/request.test.ts`                                    | No tab bar under a top bar, at any width                                       |
| `tests/language.test.ts`                                                          | Reads the specs from `docs/specs/`                                             |
| `docs/business-rules.md`, `docs/specs/`                                           | BR-39 and each spec's sweep at 360, 390 and 600                                |
| `docs/specs/`, `docs/history/`                                                    | The move, every link rewritten                                                 |
| `docs/maintaining.md`                                                             | The guide                                                                      |
| `docs/README.md`, `docs/development.md`, `docs/api.md`, `docs/content-updates.md` | The index, the Vercel projects, what no longer held                            |
| `docs/readme/*.png`                                                               | The five section titles without the quill                                      |

## Acceptance

- [x] At 360, 600 and 1280 the splash, Connect, Two ways in, the map, the Summary, Goal, an item, the advanced search and Profile hold BR-39: no sideways scroll, nothing outside the column, and at 1280 a centred 600 px column.
- [x] Every relative link in every Markdown file resolves.
- [x] No living document under `docs/` describes the website reading DE, a shared store, or work cut into tasks as still to come.
- [ ] `pnpm check`, `pnpm knip`, `pnpm build`, `pnpm weight`, `pnpm test:stories` and `desktop/`'s checks pass; `check.yml` passes on `dev`.
