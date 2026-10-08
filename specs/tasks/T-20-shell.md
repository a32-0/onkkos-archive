# T-20 · Screen: the shell

|          |                                                                             |
| -------- | --------------------------------------------------------------------------- |
| Phase    | 4. Screens                                                                  |
| Serves   | [spec 04](../04-shell.md); [plan 1](../plan/01-repository.md); BR-39, BR-41 |
| Waits on | [T-10](T-10-item-parts.md), [T-19](T-19-outside-reads.md)                   |

The header, the player chip and its menu with Disconnect, the tab bar and its origin rule, and the sheet header: what every later screen sits in.

## What crosses

| File                                       | Origin   | Note                                                                                     |
| ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                       | Rebuilt  | Spec 04                                                                                  |
| `src/routes.ts`                            | Moves    | From `src/lib/routes.ts`, with only the routes that exist; each screen task adds its own |
| `src/app/actions.ts`                       | Reworked | Disconnect                                                                               |
| `src/screens/shell/`                       | Rebuilt  |                                                                                          |
| `src/content/app.ts`, `voice.ts`, `nav.ts` | Reworked | Spec 04                                                                                  |

## Acceptance

- [ ] Every acceptance item of spec 04 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on the pull request.

## The issue

Title: `T-20 · Screen: the shell` · Milestone: `4. Screens`

```markdown
The header, the player chip and its menu with Disconnect, the tab bar and its origin rule, and the sheet header: what every later screen sits in.

- **Serves:** `specs/04-shell.md`, `specs/plan/01-repository.md`; BR-39, BR-41
- **Waits on:** T-10, T-19
- **Task:** `specs/tasks/T-20-shell.md`

### Acceptance

- [ ] Every acceptance item of spec 04 holds.
- [ ] Every string is in `src/content/`, every internal href comes from `src/routes.ts`, and the screen composes `ui/` components without restyling one.
- [ ] The owner has compared the preview with the frames at 390 px, and the sweep at 360, 600, 840, 1280 and 1440 shows nothing overlapping or cut.
- [ ] `check.yml` passes on the pull request.
```
