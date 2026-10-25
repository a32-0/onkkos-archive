# T-40 · The platform glyph in a display name

|          |                                                              |
| -------- | ------------------------------------------------------------ |
| Phase    | 6. Desktop                                                   |
| Serves   | [spec 04](../04-shell.md), [spec 11](../11-profile-proxy.md) |
| Waits on | [T-35](T-35-store-on-disk.md)                                |

A live profile's `DisplayName` ends in a character from Unicode's private use
area, the platform's icon, which the game draws with its own font and the
app's fonts draw as an empty box. Found on 2026-10-22 in the first live read
on the owner's machine; the fixtures had lost it when their names were
replaced.

## What it builds

| File                            | Note                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| `src/domain/profile/display.ts` | The name without any character from U+E000 to U+F8FF, and trimmed |
| `tests/display.test.ts`         | A name with the glyph, a name made only of it, a name without it  |

## Acceptance

- [x] The player chip and the menu show the name with no box, for a profile whose name carries the glyph.
- [x] `pnpm check` and `pnpm knip` pass; `check.yml` passes on `dev`.
