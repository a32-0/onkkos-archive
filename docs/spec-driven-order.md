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
  [`business-rules.md`](business-rules.md) holds BR-01 to BR-33, and each rule
  already has its frame, its pin position, its rule and its code status. A
  spec cites rules by id and adds acceptance criteria; it does not restate
  them.
- The frame does not fix the data. A sample value drawn in a frame is a
  placeholder, as BR-33 says, and the spec states where the real value comes
  from.

## Where this stands

Done before the spec, because every spec answers to it:

- The constitution names the Figma frames as the design (BR-33).
- [`cetus.md`](cetus.md) is reframed as the reasoning behind the system as
  built, and its measurements become feedback on the frames.
- `pnpm palette` measures every ink, reports what falls below its floor and
  exits clean. It no longer blocks a build.
- `tests/language.test.ts` no longer confines brand red to the mark or keeps a
  second state hue out, since those checks would have blocked colours the
  frames draw, such as the red Disconnect. The checks on type faces remain:
  names in the display serif, readings in mono.

Settled by the constitution on 2026-10-04:

- `specs/00-constitution.md` was rebuilt. Its gates now follow BR-33: each
  screen matches its frame, and `pnpm palette` measures and reports. It also
  names where the work ends, a new public repository, and how the release fits
  inside these six steps. The reasoning is in
  [`public-release.md`](public-release.md).

Waiting until the spec is written:

- The divergences listed under BR-33 ("Code: not met yet"): the hero card,
  the "You're on" card, the view pill, Summary rows, the Step-by-step line,
  the player menu, the update banner and cards, Resume, the Catch-up summary,
  Two ways in, and the splash and ID form (still to audit). They become tasks
  in step 5. None is built ahead of its spec, so the spec decides what the
  code does instead of describing it afterwards.

Settled by the owner on 2026-10-04, which pinned the design:

- Both slips are corrected in the frames: the player menu reads twelve hours,
  and the chevrons in `257:653` agree with `367:291`.
- The pinned design is the section `421:590` "High-fi Wireframes". The file
  stays private. See "Settled before the spec" in
  [`specs/00-constitution.md`](../specs/00-constitution.md).
