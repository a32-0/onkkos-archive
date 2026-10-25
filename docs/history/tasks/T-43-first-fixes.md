# T-43 · What the first installed release showed

|          |                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase    | 6. Desktop                                                                                                                                               |
| Serves   | [spec 04](../../specs/04-shell.md), [spec 09](../../specs/09-item-summary.md), [spec 12](../../specs/12-search.md), [spec 13](../../specs/13-desktop.md) |
| Waits on | [T-38](T-38-releases.md)                                                                                                                                 |

The owner installed 0.1.0 on 2026-10-23 and found four things to change. They
ship as 0.1.1, which also proves an installed app updates itself. The owner
cuts 0.1.1 once T-44 and T-45 are done too (owner, 2026-10-24).

- A quest's Summary showed its **How to get** row with an empty square: the
  row that starts the quest carries no art of its own. It now shows the
  quest's art, as a collectible's rows show the collectible's.
- On **Advanced search**, the folded filters drew the chevron pointing right;
  `753:5217` Search — Filtered draws it pointing down, and `753:4593` Search
  draws it up when open.
- The app's icon is the quill alone, larger and with no background, as most
  Windows programs draw theirs (owner, 2026-10-23). The site keeps its icon.
- **Disconnect** asks first: a dialog says what it does and what it does not
  (`838:4762` Profile — Disconnect, drawn on 2026-10-24).

## What it builds

| File                                   | Note                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `src/screens/item/view.ts`             | A quest's row with no art of its own shows the quest's                  |
| `src/screens/search/Search.module.css` | The folded chevron points down                                          |
| `desktop/icon.png`                     | The quill alone, 512 px, transparent                                    |
| `desktop/electron-builder.yml`         | The installer and the program use it                                    |
| `desktop/scripts/starting.mjs`         | The window uses it                                                      |
| `desktop/package.json`                 | Version 0.1.1                                                           |
| `src/screens/shell/Profile.tsx`        | Disconnect opens a dialog; its own Disconnect submits, Cancel closes it |
| `src/screens/shell/Profile.module.css` | The dialog, as the frame draws it                                       |
| `src/content/nav.ts`                   | The dialog's words                                                      |
| `tests/item.test.ts`                   | The quest's art on its row                                              |
| `tests/shell.test.ts`                  | Only the dialog's button disconnects                                    |

## Acceptance

- [x] A quest's Summary shows the quest's art on the row that starts it.
- [x] The filters' chevron points down when folded and up when open, as `753:5217` and `753:4593`.
- [ ] The installer, the program and the window show the quill on no background.
- [x] At 390 px the dialog matches `838:4762`; Escape and Cancel close it, and only its Disconnect forgets the account.
- [x] `pnpm check`, `pnpm knip`, `pnpm build` and `pnpm test:stories` pass; `check.yml` passes on `dev`.
- [ ] 0.1.1 is published, and 0.1.0 installed updates itself to it.
