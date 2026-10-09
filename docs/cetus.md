# The visual system

This page explains why Onkko's Archive looks the way it does: where its look
comes from, how its colours are measured for a colour blind owner, why it uses
three typefaces, and where its icons come from. The values themselves are not
here. They live in [plan part 3](../specs/plan/03-design-system.md) and in
`src/ui/tokens.css`, and the Figma frames are the design: where this page and a
frame disagree, the frame wins
([BR-33](business-rules.md#br-33--the-build-looks-exactly-like-the-frames)).

## Cetus

The owner set the direction after the first star chart screens: Cetus, the
Ostron town of the Plains of Eidolon, where scavenged craft meets interstellar
technology, "as if the Mexica reached the Warframe era". It replaced an
earlier direction based on Orokin terminals, and only that direction's way of
measuring colour survives, in `scripts/palette.mjs`.

The app is named for Quill Onkko, the Cetus archivist who speaks in
consequences and futures. His lines are the app's voice, which is why a line
of his opens or closes each screen.

## The palette is measured

The owner is colour blind, so a script measures every ink.
`pnpm palette` reads `tokens.css`, follows each role to its primitive, and
takes two measurements:

- Contrast against the ground the frames put it on, with a floor of 4.5:1 for
  text and 3:1 for shapes such as the focus ring or a rule. A colour with
  transparency is laid over its ground first.
- The distance between two inks as a protanope and a deuteranope see them,
  through the Viénot matrices, as ΔE in CIELAB. Below 28, two inks risk
  reading as one. The tritanope distance is printed beside the state colours
  for reference.

It reports and never fails. A measurement below its floor goes back to the
owner as feedback on the frame, and the frame decides
([BR-33](business-rules.md#br-33--the-build-looks-exactly-like-the-frames)).

### What it measures

- The four state colours (mastered, rank, not obtained, Prime) against each
  other. On 2026-10-08 every pair clears 28; the closest is mastered against
  not obtained, at 30.7.
- The brand red against every other ink. Under protanopia red loses far more
  lightness than gold does, so it is the colour most likely to merge with
  another. It is measured on every run and reported.
- Every semantic ink against every other, with each pair under 28 listed.
  Inks that share a hue family, such as the three greys of the reading ramp,
  are expected to sit close; the list shows where a state colour sits close to
  plain text.

### History that shaped it

- Red was once confined by a test to the app's mark, the view frame and
  failure. That test was removed when the frames became the design, because
  the frames draw red elsewhere, such as Disconnect (BR-06). The brand
  measurement above replaced it.
- The rank state once had a blue that sat 11.2 ΔE from the link colour, the
  same colour to the owner. It lost its hue for a while. The frames now draw
  rank in `#5aa9ff` and links in `#4fd8e8`, and the two clear the floor.

## Type carries the duality

One rule makes the app feel old:

> The serif carries the names of old things: places, quests, items, lore.
> The sans and the mono carry the machine's readings: counts, percentages, runs.

The display face is Cinzel, drawn from Roman inscriptional capitals, which
reads as carved stone rather than print. It has no lowercase of its own; its
lowercase are small capitals, which is why Onkko's lines read in small caps.
Body text is Inter. Readings are JetBrains Mono, which replaced Consolas
because Consolas exists only on Windows. `tests/language.test.ts` checks that
every name style uses Cinzel and every reading style uses JetBrains Mono.

The reading that leads a drop is one example of the rule. "~24 Runs ·
Rotation A" turns a drop chance into the question a player actually asks, how
long will this take, so it is set in bold mono and is the loudest line on a
part.

## Icons are the game's own

The game's things carry the game's icons (BR-42). The wiki hosts DE's
extracted interface icons as white images named `Icon<Thing>(xWhite).png`,
and the app maps the categories it shows (Warframes, primaries, quests,
archwings, arcanes and the rest) and its marks (mastered, owned, locked) to
them. Place orbs use the wiki's planet images.

Because the icons are white, `GameIcon` draws them as a CSS mask and colours
them from the token layer. An icon that is missing degrades to the item's name
alone, and a wiki that is down costs icons and nothing else.

The interface's own icons are Material Symbols Rounded, the set the frames'
chevrons and checkboxes already use.

Wiki media is under CC BY-NC-SA 3.0. The app earns nothing, so the
non-commercial clause holds. The licence also asks for attribution, which no
frame draws yet. Item art
comes from DE's Public Export instead, under DE's own terms.
