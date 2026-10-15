# The spec-driven order

Every change to the app goes through the same six steps, in the same order:
the rules first, then the design, then a written spec, a plan, the tasks, and
only then the code. This page sets out that order and how a spec refers to the
design without copying it. The owner agreed the order on 2026-10-04, and any
session that writes a spec in `specs/` or touches the screens follows it.

## The order

| Step              | Produces                                                               | Where the visuals are                                  |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| 1. Constitution   | `specs/00-constitution.md`: the rules every later spec answers to      | One rule only: the Figma frames are the design (BR-33) |
| 2. Design         | The Figma file `Warframe`, page Wireframes, plus the owner's comments  | Decided here                                           |
| 3. Spec           | What each screen does: its states, rules, data and acceptance criteria | Linked by node-id, never pasted in                     |
| 4. Plan           | How the spec is built: components, data, tokens                        | The tokens and components the frames call for          |
| 5. Tasks          | One task per screen or per divergence                                  | Each task names its frame                              |
| 6. Implementation | Code                                                                   | Changed here, and checked against the frame at 390 px  |

Visual decisions are made before the spec, and the code changes to match them
last. The spec describes behaviour and points to the frames for how things
look.

## How a spec carries the visuals

- A spec refers to a frame by its node-id and a link, never by a pasted
  screenshot. A screenshot goes stale the moment the frame changes, and then
  there are two sources of truth.
- A spec names the version of the Figma file it was written against, taken
  from the file's version history. When a frame changes after that version,
  anyone can see the spec is behind, and the spec is updated before the code
  follows.
- The business rules are the spec's requirements.
  [`business-rules.md`](business-rules.md) holds the rules from BR-01 on, and each rule
  already has its frame, its pin position and its rule. A
  spec cites rules by id and adds acceptance criteria; it does not restate
  them.
- The frame does not fix the data. A sample value drawn in a frame is a
  placeholder, as BR-33 says, and the spec states where the real value comes
  from.

## Where this stands

- The constitution names the Figma frames as the design (BR-33). The reasoning
  behind its release decisions is in [`public-release.md`](public-release.md).
- The pinned design is the section `421:590` "High-fi Wireframes", as it
  stood on 2026-10-04, once the owner had corrected both slips in it: the
  player menu reads twelve hours, and the chevrons in `257:653` agree with
  `367:291`. The file stays private. See "Settled before the spec" in
  [`specs/00-constitution.md`](../specs/00-constitution.md).
- [`cetus.md`](cetus.md) is the reasoning behind the system, and its
  measurements are feedback on the frames.
- `pnpm palette` measures every ink, reports what falls below its floor and
  exits clean. It never blocks a build.
- `tests/language.test.ts` checks the type faces (names in the display serif,
  readings in mono) and never a colour the frames draw.
- The eleven specs are written against the pinned design, and the plan and the
  tasks build from them.
