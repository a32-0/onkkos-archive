# T-44 · The quill that writes while it loads

|          |                                                          |
| -------- | -------------------------------------------------------- |
| Phase    | 6. Desktop                                               |
| Serves   | [spec 02](../02-connect.md), [spec 13](../13-desktop.md) |
| Waits on | [T-43](T-43-first-fixes.md)                              |

Asked by the owner on 2026-10-23: a loading animation with the quill alone
(`465:485`), livelier than the still quill on the loading card. The quill
writes a stroke, sways and starts again; with reduced motion it stands still.
It takes the place of the still quill on Connect's loading card and on the
window's starting page. Drawn on 2026-10-24 as `841:536` Loading — Quill
motion, on the Design System page: over 2.4 s the quill writes from left to
right while the stroke draws under its tip, lifts, the stroke fades, and the
quill returns. The starting page reads `LoadingCard.module.css` itself, so the
two never drift apart.

Changed on 2026-10-24 by the owner: the quill leads. It grows to 64 × 96,
the card's background goes, and the words are no longer shown, only spoken to
screen readers. Figma's `465:485` Loading card already drew the quill alone;
its quill and `841:536` were enlarged to match.

## What it builds

| File                           | Note                                             |
| ------------------------------ | ------------------------------------------------ |
| `src/ui/LoadingCard/`          | The quill in motion                              |
| `src/ui/tokens.css`            | `--motion-quill` and `--motion-ease`             |
| `tests/tokens.test.ts`         | Motion tokens are shape tokens a module may name |
| `desktop/scripts/starting.mjs` | The same motion on the starting page             |
| `specs/02-connect.md`, spec 13 | The motion, its frame and reduced motion         |

## Acceptance

- [x] The motion matches its frame; with `prefers-reduced-motion` the quill is still.
- [x] Connect's loading card and the starting page use it.
- [x] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass; `check.yml` passes on `dev`.
