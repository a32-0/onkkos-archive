# Business rules from the Figma wireframes

The app's design lives in the Figma file
[Warframe](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1-2),
and the owner leaves comments on its wireframes. Each comment is a business
rule tied to the spot where it is pinned: how a component looks in a state,
what something does, the order of a list, a piece of content, or an open
question. This page writes every one of them down, says where it sits, and
links it to the rest of `docs/`. The specs cite these rules by id instead of
repeating them, so this is the page that explains why a screen behaves the way
it does.

Read on 2026-10-03 through the Figma REST API: 66 comments, 53 open and 13
resolved, all on the page Wireframes. The owner answered the open
readings on 2026-10-04, and those answers are folded into the rules below.

## How to read an entry

- **Frame** is named by its node id, because names repeat in the file: there
  are two `Features`, two `Summary` and three `Home - 0.0.0`. The link opens
  the frame in Figma.
- **Pin** is the offset in pixels from the frame's top-left corner, at 1×.
- **Layer** is the deepest visible layer under the pin, found by hit-testing
  the file's geometry, not by eye.
- **Type** is one of: state, behaviour, ordering, content, question.
- Colours drawn in the wireframes are built exactly as drawn (BR-33). A drawn
  value with no token gets one in `src/ui/tokens.css`; it is never mapped
  to a nearby token instead.

Rule ids (`BR-nn`) are this document's own, so code reviews and commits can
cite one. The Figma comment id is given beside each for traceability.

## The rule over every rule

### BR-33 · The build looks exactly like the frames

- Given by the owner on 2026-10-04. It governs every screen and every rule in
  this document.
- Type: behaviour (of the work, not of the app).
- Rule: the implementation is exactly what the Figma frames present. Layout,
  order, spacing, sizes, type, colours, borders, radii, icons, states and
  every static word on screen match the frame. Where a token, a component or
  a CSS rule cannot produce the frame, the code changes; the frame does not.
- What the frame does not fix: the data. Names, numbers, dates, odds, routes,
  quest lists and prices come from the sources, as the rest of this document
  says. A sample value drawn in a frame ("MR 27", "Middle Master", "~24 Runs",
  "Saya's Visions") is a placeholder for the data's own value, laid out and
  styled as drawn. This is the line in [`scenario-guidelines.md`](scenario-guidelines.md#rules-that-hold-on-every-screen):
  wireframe copy that repeats across screens is placeholder.
- Where the frames disagree with each other, or a frame states something the
  data contradicts, the owner corrects the frame and the build follows the
  corrected one. The build does not pick a reading on its own. Every such case
  found was corrected in Figma on 2026-10-06.
- It overrides what came before it: BR-17's hero colours, Disconnect's
  secondary button (BR-06) and every "builds as" that departed from a frame.
  `pnpm palette` is a measurement, not a gate: it reports and never blocks a
  build.
- Verified by putting each screen beside its frame at the frame's width
  (390 px), and then sweeping the wider widths against BR-39. `pnpm check`
  cannot see either.

### BR-39 · Wider than the frames: the layout follows width classes

- Given by the owner on 2026-10-04. The frames are drawn at 390 px only, and
  the owner may never draw a desktop. They asked for the standard, most
  logical desktop behaviour, defined here rather than invented screen by
  screen.
- Type: behaviour (of the work).
- Rule: width changes arrangement, never content. At every width the
  screen holds what its frame holds, in the same order, with the same copy,
  components, states, type and colours. A wider window may change only the
  number of columns, where navigation sits, and how wide things grow.
- The width classes are Material 3's, which the sweep already used:

  | Width       | Class    | Layout                                                                                                                                                                                                                                             |
  | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | below 600   | compact  | The frame as drawn, fluid between 360 and 599.                                                                                                                                                                                                     |
  | 600 to 839  | medium   | The frame's single column, centred, at most 600 px wide. The bottom tab bar stays.                                                                                                                                                                 |
  | 840 to 1199 | expanded | The tab bar moves into the header, the same three destinations in the same order. Reading screens keep one column, at most 640 px. Grids of tiles or cards keep the frame's tile size and add columns, inside a content area at most 1200 px wide. |
  | 1200 and up | large    | A screen that is a choice and its answer shows both side by side: the map (the system and its places, then the chosen place) and the item (the hero, then Summary or Step by step). Everything else stays as in expanded.                          |

- Outside the shell, the splash and the id form stay one centred column at the
  frame's width. Background art covers the whole window at every width.
- A sheet or menu that the frame draws full width, such as the player menu
  (`270:1145`), opens from 840 up as a panel at the frame's 390 px, anchored to
  what opened it.
- Pointer and keyboard: the frames draw no hover. From 840 up, anything
  pressable takes one hover treatment, the same token everywhere. Keyboard
  focus is always visible, at every width.
- Each spec states how its screen lands in the expanded and large classes.
  Where a frame leaves a doubt this rule does not answer, the spec settles it
  and cites this rule.
- Verified by sweeping 360, 600, 840, 1280 and 1440.

## The flow between screens

The owner settled these on 2026-10-04, when the high-fi section was pinned and
a reading of the earlier build against it was put to them.

### BR-34 · Figma is the only source of truth, for the screens and the flow

- Sections: [`421:590` High-fi Wireframes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=421-590)
  for what each screen looks like, and
  [`421:614` Lo-fi Wireframes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=421-614)
  for the flow: which screen leads to which, drawn as connectors between
  low-fidelity frames.
- Type: behaviour (of the work).
- Rule: what the frames draw is the product, as drawn. Where the code differs,
  the code changes. Where the lo-fi flow and a high-fi frame differ about what
  a screen holds, the high-fi frame wins; the lo-fi section is read for its
  arrows. Its Summary still lists quests, for instance, and the high-fi one
  does not (BR-35).
- The flow it draws: the account id; then, for a player past the first
  planet, Two ways in, and for a new one, the goals (BR-03). "When did you
  last play?" leads to the Summary; "What are you after?" leads to a goal's
  steps; the Summary's items lead to their steps; and both end on the map,
  at a place.

### BR-35 · Catch me up is what the Summary draws

- Frames [`206:774` Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-774),
  `257:653`, `264:67`.
- Type: content.
- Rule: Catch me up shows what shipped since the chosen update, under
  Arsenal and Collection, and nothing else. Story quests, the live
  Nightwave ("Running now") and the suggested goal ("Pick up") are not part
  of it.

### BR-36 · From the Summary: an item, or Next to a place

- Frame `206:774`, the tiles and the "Next" button.
- Type: behaviour.
- Rule: from the Summary the player either opens an item, which opens that
  item's page, or presses Next, which opens the map on one place: the
  frontier when the player has one, otherwise the focus
  ([`system.md`](system.md#two-lenses-that-cut-every-level-at-once)). The two
  are separate decisions: Next does not lead to quests.

### BR-37 · A goal opens the steps of what it names

- Frame [`208:90` Goal](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-90),
  the goal cards ("Build a Necramech", "Play the Hex Quest").
- Type: behaviour.
- Rule: choosing a goal opens the Step by step of the item or the quest it
  refers to. A goal has no plan screen of its own.
- A quest's Step by step has no frame of its own. It is placed in the grammar
  every Step by step shares
  ([`scenario-guidelines.md`](scenario-guidelines.md)): its prerequisites are
  the quests and junctions before it (BR-28) and its Mastery Rank, and How to
  get names where it starts.
- A place chosen as a target opens the map on that place, as Next does
  (BR-36).
- Mastery Rank and syndicate rank are not targets in this version: neither is
  an item, a quest or a place. The owner set them aside for a later version on
  2026-10-04; [`deferred.md`](deferred.md) keeps what they were and how they
  worked.

### BR-38 · Loading and errors happen on the id form

- Frames [`428:743` Loading](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=428-743)
  and [`428:616` Error](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=428-616),
  both drawn on the Login frame (`202:38`), added by the owner on 2026-10-04.
- Type: state.
- Rule: while the profile is read, the form dims and a card with the quill
  reads "Onkko's reading your codex...". When the read fails, the message sits
  in a red band under the account id field, and the form stays usable.
- The band's words are not fixed by the frame. The owner drew one as an
  example and on 2026-10-04 left the messages to be written from the failures
  the system can return. The proxy knows seven reasons
  (`FailureReason` in `src/infra/profile/client.ts`); the player can act on
  four, so the band says four things:

  | Reason                                  | The band                                                                     |
  | --------------------------------------- | ---------------------------------------------------------------------------- |
  | `invalid-id`                            | An account ID is 24 characters: digits 0–9 and letters a–f.                  |
  | `not-found`                             | No account answers to this ID. Copy it again from user_id.                   |
  | `upstream`, `throttled`, `circuit-open` | Warframe isn't answering right now. Your ID is fine; try again at 15:30 UTC. |
  | `malformed`                             | Warframe's answer came back in a form we can't read yet. Your ID is fine.    |
  | `limited`                               | You've had your two readings for now. The next opens at 15:30 UTC.           |

- The time is when a retry can succeed: the circuit's reopening or the end of
  the visitor's window (`retryAfterSeconds`). With no time known, the third row
  ends "try again in a few minutes." The machine stays out of the band: no
  status code, no refusal count, no "circuit". `malformed` is apart from the
  others because waiting does not fix it; the app has to be updated.
- The profile is read on this form and then kept for twelve hours, so the
  first read always happens here. When a later read fails on another screen,
  the player is returned to this form with the band, which is the one place a
  failure is drawn.

### BR-40 · Two ways in: Skip goes to the map, Go back to the id form

- Frame [`203:140` Features](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-140),
  the Skip and Go back buttons under the two cards. Settled by the
  owner on 2026-10-05.
- Type: behaviour.
- Rule: Skip opens the map on one place, the same as Next on the Summary
  (BR-36): the frontier when the player has one, otherwise the focus. Go
  back returns to `/connect`, with the player's id in the field, which is
  also how a player changes account or demo.
- The screen is still onboarding, so it draws no tab bar and no player chip
  (thread `1929710840`, "no navbar during onboarding until it ends").

### BR-41 · Resume has two entrances

- Frame [`203:231` Resume](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-231).
  Settled by the owner on 2026-10-05.
- Type: behaviour.
- Rule: reached from "Pick up where you left off" (BR-40's screen), Resume is
  onboarding and looks as drawn: no tab bar, with Skip and Go back.
  Reached from the Resume tab, it is a section of the shell: the tab bar
  shows and Skip and Go back do not. Everything else is the same screen.
- The Summary that follows keeps the entrance: no tab bar after the onboarding
  entrance, the tab bar after the tab's. Its frames draw the first. Settled by
  the owner on 2026-10-05.

### BR-43 · One date format: "Mar, 2026"

- Frames `203:231`, `206:774`, `257:653`, `264:67`, `257:1090`. Settled by the
  owner on 2026-10-05.
- Type: content.
- Rule: an update's date reads "Update {version} · {Mon}, {year}" everywhere,
  with the month in three letters: "Update 42 · Mar, 2026". The frames had
  drawn four forms ("March, 2026", "Mar, 2026", "Feb 11, 2026", "Aug, 2026");
  the owner chose the short month without a day.

### BR-42 · The placeholder circles are the game's icons

- Frames `212:159` and its collapsed state: the light circles in the tab bar
  (Navigation, Resume, Goal) and before each category row (Warframes,
  Primary…). Settled by the owner on 2026-10-05.
- Type: content.
- Rule: a category row carries the game's own icon for that category, from the
  wiki, under the terms in [`cetus.md`](cetus.md#icons-are-the-games-own). The
  interface's own icons are Material Symbols Rounded, drawn in the frames on
  2026-10-06: the tab bar's explore, hourglass and flag; hourglass and flag on
  Two ways in; precision manufacturing and auto stories on the Goal cards.

### BR-44 · Start here marks the frontier, or the focus

- Frames [`215:610`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=215-610)
  and [`270:786`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-786),
  the gold-outlined "Start here" badge. Settled by the owner on 2026-10-06.
- Type: content.
- Rule: Start here marks the one place Next and Skip open: the frontier, or the
  focus when the player has no frontier (BR-36). Exactly one place carries it,
  and so does that place's system in the system list. A player with neither
  sees no badge.

### BR-45 · The map shows what is left; Mastered and New are the two lenses

- Frame [`312:199`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=312-199),
  the "Show" control. Settled by the owner on 2026-10-06.
- Type: behaviour.
- Rule: by default a place shows only what is left: everything here the player
  has not mastered. That includes a ranked item short of its maximum and every
  collectible, since the profile cannot prove one is owned. The control has
  two options, Mastered and New, and none is chosen by default.
  Choosing Mastered shows only what is mastered here; choosing New shows only
  what shipped since the player's month, mastered or not. Choosing the chosen
  option again returns to the default.
- New needs a month. Without `wf_since` the New option is not shown.
- A group with nothing to show under the current lens does not render, and a
  divider with no group under it does not render either. A place where every
  arsenal item is mastered and that holds no collectible shows the empty state
  under its card (spec 07).
- The frame draws three options (All / Mastered / New); the owner corrects it
  to the two. The `All` view leaves: the default is what is
  left.
- Under the default and New, what is left is also what is in reach; the rest
  is counted in the group's More line (BR-61).

### BR-46 · The map reopens where the player left it

- Frame [`212:159` Navigation](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=212-159),
  the Navigation tab. Settled by the owner on 2026-10-06.
- Type: behaviour.
- Rule: the Navigation tab opens the map on the last place the player viewed
  on this device. The first time, it opens on Start here (BR-44), and with no
  Start here, on the first place of the Origin System. Next and Skip always
  open Start here, whatever was viewed last.
- The place is kept in a cookie, `wf_place`, as `{system}/{place}`, because the
  server renders the map. It is a convenience: losing it only reopens on Start
  here.

### BR-47 · The systems in the frame's order

- Frame `270:786`, the system list. Settled by the owner on 2026-10-06.
- Type: content.
- Rule: the systems are listed in this order: Origin, Pom-2 PC, Duviri,
  Empyrean Proxima, Dark Refractory, Tau. A system not in the game yet (Tau)
  reads "Soon™" and cannot be opened.
- The list holds the systems with a place in the player's reach, in this
  order, and counts the rest (BR-60).

## Onboarding and the account

### BR-01 · Remember the player on this device

- Frame [`206:903` Onboarding](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-903)
  · pin (225, 322) · layer: Header › Logo Container · comment `1933409920`
- Type: behaviour.
- Rule: the device remembers the player, so a returning player never types
  the account id again.

### BR-02 · The lead line is one of Onkko's contextual phrases

- Frame [`202:38` Login](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=202-38)
  · pin (226, 120) · layer: Container › Introduction Container · comment `1924100224`
- Type: content.
- Rule: the small-caps line above the lead ("It is time. Utter the name.") is a
  contextual Onkko phrase, chosen for the screen and state, not fixed copy.

### BR-03 · A low-level player is not asked when they last played

- Frame [`203:140` Features](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-140)
  · pin (146, 289) · layer: Option Container › Shipment Section (the "Pick up
  where you left off" card) · comment `1933409660`
- Type: behaviour.
- Rule: a player who has not reached the second planet does not see the "Pick
  up where you left off" option. The second planet is the second entry of
  `star_chart_order` in `data/grafo.yaml` (Venus), so the reading is the
  `EarthToVenusJunction` tag in `Missions[]`.
- When `Missions[]` cannot be read, the option shows. An unreadable profile is
  `null`, never "low level" ([`system.md`](system.md#the-join-and-the-third-value)).
- The flow map (BR-34) sends that player straight to the goals: "if player
  > 0?" answers no, and the arrow goes to "What are you after?".
- It is the first instance of BR-59: what the player cannot use yet is not
  put in front of them.

### BR-04 · Explain each choice so a player can act on it

- Frame `203:140` · pin (248, 358) · layer: Shipment Section › Measurement
  Description Container ("Everything will be measured from the day it
  shipped.") · comment `1931755936`
- Type: content.
- Rule: where the player must take a concrete action, each option's text
  explains what the option does more clearly, in the player's terms.
- The frame still carried the old words when spec 03 was written on
  2026-10-05, and the first sentence then built still promised quests, which
  BR-35 took out of Catch me up. The owner chose to correct the frame with
  these two lines, which the build then follows:
  - "Pick up where you left off": "Name the last update you played and see
    everything added to your arsenal and collection since."
  - "Set a goal": "Pick one thing to chase and get the road to it, in order,
    read from your profile."

### BR-05 · "Set a goal" runs on frontier and focus

- Frame `203:140` · pin (185, 533) · layer: Profile Description Container
  ("Select or create a goal curated against your profile…") · comment `1933735165`
- Type: behaviour.
- Rule: the goal offered behind "Set a goal" follows the frontier / focus
  logic.

### BR-06 · The player menu

- Frame [`270:1145` Features](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-1145)
  · pin (341, 34) · layer: Header · comment `1933407291`
- Type: content.
- Rule: this frame is the player menu, opened from the player chip at the top
  right of every screen (avatar, display name, Mastery Rank and title,
  Disconnect).

### BR-07 · One profile read per twelve hours

- Frame `270:1145` · pin (180, 661) · layer: User Details · comment `1933412798`
- Type: behaviour (asked as a question).
- Rule: one profile read every twelve hours. The owner first gave 8 to 12
  hours as an example and settled on twelve on 2026-10-04: nothing the app
  reads about an item changes faster than its build, and twelve hours is the
  arsenal's floor ([`public-release.md`](public-release.md#how-long-a-read-lasts)).
- The footer reads "Read every twelve hours: last read 12 min ago, next at
  15:30 UTC.", the next time being the last read plus `PROFILE_TTL_MS`
  (`nextReadAt()` in `src/infra/screen.ts`). The frame drew 24 until the owner
  corrected it to 12 on 2026-10-04.

## Resume: picking the last update played

### BR-08 · Pick a date, or type it

- Frame [`203:231` Resume](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-231)
  · pin (344, 321) · layer: Shipment Section › Date Filter Container (the
  "Date" button) · comment `1931751624`
- Type: behaviour.
- Rule: "Date" opens a dropdown to choose a date. Beside it, a field accepts a
  full date typed by hand.

### BR-09 · Main updates and minor updates both count

- Frame `203:231` · pin (315, 393) · layer: Card Container › Preview Image
  (the "Newest" card) · comment `1933352446`
- Type: content.
- Rule: the list shows main updates and the numbered updates in between
  (43, 43.5…), because minor updates also ship content. Reference: DE's patch
  notes index.

### BR-10 · Update card title band

- Frame [`264:388` Card Container](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=264-388)
  · pin (291, 181) · layer: Card Info · comment `1933353858`
- Type: state (visual spec).
- Rule: the band behind the card title is 80% opaque with a background blur.
- Drawn values: fill `#39342e` at 80%, `BACKGROUND_BLUR` radius 4. The badge
  "Newest" is `#fcbb4a` (nearest `--orokin`) on dark text.

### BR-11 · Say plainly where the game stands now

- Frame [`257:1090` Featured card](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=257-1090)
  · pin (278, 23) · layer: Featured card description container · comment `1933352580`
- Type: state and behaviour.
- Rule: when the player is on the newest update, the card says so in its
  eyebrow: "You're up to date", in gold, in place of "You last played". It
  is the up-to-date variant of the card BR-13 opens.
- Rule: the card reaches that state on its own. An update counts as caught up
  when the profile shows every arsenal item it released in `XPInfo`. When the
  newest update is caught up, the card shows "You're up to date" whatever
  month the player chose.
- Only what the profile can read counts. Mods, resources and other
  collectibles are not in the profile, so they never hold the card back.
- The card can say "up to date" while Catch me up
  still lists what shipped since an older chosen month, because the month the
  player picked is not rewritten. And `XPInfo` holds what was ever ranked, so
  an item bought and never levelled does not count as owned yet.

## Catch me up: Summary

Frame [`206:774` Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-774)
is the expanded state. Frame
[`257:653` Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=257-653)
is the same screen with every group closed (comment `1951841233`, pinned on the
logo as a frame label).

Three resolved comments on `206:774` were posted again as open ones and are
in force: BR-12, BR-13 and BR-14.

### BR-12 · Everything new that the sources record

- Frame `206:774` · pin (29, 332) · layer: the "Arsenal" divider above
  Warframes · comment `1933213824`
- Type: content.
- Rule: every new thing the endpoints can record is shown.
- What lies beyond the player's reach is counted instead, in the group's More
  line, and still counts in the group's "{n} NEW" (BR-61).

### BR-13 · The last-played card opens the update list

- Frame `206:774` · pin (347, 280) · layer: Featured card (the "You last
  played" card's chevron) · comment `1933213835`
- Type: behaviour.
- Rule: the chevron opens a dropdown with the updates, ordered by date, newest
  first. Choosing one changes `since`.

### BR-14 · Groups start closed

- Frame `206:774` · pin (363, 404) · comment `1933213840`
- Type: state.
- Rule: every group is closed by default. `257:653` draws that default.
- A closed group's chevron points down and an open one's points up, on every
  screen, the same as the rows in BR-20. `257:653` drew closed groups with an
  up chevron until the owner corrected it on 2026-10-04.

### BR-15 · No Mastered or Rank here, only NEW

- Frame `206:774` · pin (169, 467) · layer: Cards container › Card › Card image
  · comment `1933399323`
- Type: state.
- Rule: tiles in Catch me up carry no Mastered or Rank state. The only marker
  is NEW, counted in the group header ("3 NEW").

### BR-16 · What each Arsenal group holds

- Frame `206:774` · pins (107, 719), (101, 991), (91, 1283) · comments
  `1933194634`, `1933194693`, `1933194826`
- Type: content.
- Rule:

| Group      | Holds                                                             |
| ---------- | ----------------------------------------------------------------- |
| Weapons    | Primary, Secondary, Melee, Arch-gun, Arch-melee, Amps             |
| Companions | Sentinels, MOAs, Hounds, Kubrows, Kavats, Predasites, Vulpaphylas |
| Vehicles   | Necramechs, Archwings, Railjack, each with their weapons          |

## The item: hero states and art

The item screen's hero card has four states. Each is a frame of its own,
358 × 312, beside `208:287`. They build exactly as drawn (BR-33):

| State               | Frame                                                                                                      | Comment      | Drawn                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| Rank                | [`208:287`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-287) pin (195, 376)   | `1951841255` | blue border and badge |
| Mastered            | [`339:1335`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=339-1335) pin (203, 206) | `1951841261` | green `#4ec98a`       |
| Not obtained        | [`320:758`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=320-758) pin (195, 218)   | `1951841267` | grey `#98a2b3`        |
| Not obtained, Prime | [`372:1394`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=372-1394) pin (183, 188) | `1951841280` | gold `#fcbb4a`        |

### BR-17 · The hero card shows the item's state for this player

- Type: state.
- Rule: one of the four states above, read from `XPInfo`. Ranked and not
  mastered, mastered, never ranked. With no `XPInfo` at all, the card shows no
  state rather than Not obtained.

### BR-18 · Every image sits on the drawn ground

- Frame `208:287` · pin (64, 1261) · layer: Section container › Card › image 59
  (the Fate Pearl art in Components) · comment `1951841324`
- Type: state (visual spec).
- Rule: every item, part and resource image sits on the ground colour drawn,
  `#16130e`, through `--tile-art`, the token for art grounds.

### BR-19 · A blueprint's art carries the blueprint behind it

- Frame [`372:350` Group 18](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=372-350)
  · pin (55, 56) · layer: image 49 over BP · comment `1951841308`
- Type: state (visual spec).
- Rule: every blueprint image is the part's art laid over the blueprint
  graphic (layer `BP`) as its background. `208:287` draws it on each row of
  Blueprints.

## Step by step: row states

### BR-20 · A collapsed row

- Frame [`367:291`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=367-291)
  (layer "Checkbox Collapsed Item Step by Step") · pin (109, 13) · layer:
  "Mastery Rank 0" · comment `1951841610`
- Type: state.
- Rule: a collapsed row shows only its title and a chevron pointing down. The
  description (`Frame 196`) is hidden. Expanded, the chevron points up and the
  description shows.

### BR-21 · A ticked component

- Frame [`382:2233`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=382-2233)
  (layer "Checkbox clicked step by step") · pin (166, 15) · layer:
  "22,000 Entrati Obols" · comment `1951841416`
- Type: state.
- Rule: tapping the checkbox ticks the row and:
  - fills the box, `#9f9486` (nearest `--ink-dim`);
  - dims the title to the same ink and strikes it through;
  - fades the icon's ground to 20%;
  - collapses the row (the description is hidden, the chevron points down).

## Step by step: rules by scenario

Each scenario frame carries a "Caso de uso" comment pinned on its hero image.
The comment is the scenario's name.

| Frame                                                                                           | Scenario                                                                | Comment      |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------ |
| [`323:689`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=323-689) Dante | Every part comes from the same place                                    | `1939150646` |
| [`337:806`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=337-806) Ash   | Every part comes from a different place                                 | `1940959615` |
| [`368:865`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=368-865)       | Parts share a place; the main blueprint is in no table (usually Market) | `1951624914` |
| [`371:1183`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=371-1183)     | Same hub, different node or bounty tier                                 | `1951645250` |
| [`372:355`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=372-355)       | No part appears in the drop tables                                      | `1951651353` |

These are the axes in [`acquisition-scenarios.md`](acquisition-scenarios.md).

### BR-22 · Mastery Rank 0 is not shown

- Frame `323:689` · pin (202, 711) · layer: the Mastery Rank 0 row's
  description · comment `1951807007`
- Type: content.
- Rule: when the item needs Mastery Rank 0, the Mastery row does not render.
- [`scenario-guidelines.md`](scenario-guidelines.md#prerequisite-kinds) says
  the same since 2026-10-04.

### BR-23 · Every item that takes a slot asks for one

- Frame `323:689` · pin (137, 828) · layer: the "Warframe Slot" row's
  description · comment `1951807140`
- Type: content.
- Rule: slots are a prerequisite. Dante draws "Warframe Slot"; Kubrow
  (`385:498`) draws "Companion Slot".
- [`scenario-guidelines.md`](scenario-guidelines.md#prerequisite-kinds) says
  the same since 2026-10-04.

### BR-24 · Components are ordered by rarity

- Frame `323:689` · pin (136, 2049) · layer: "22,000 Entrati Obols", the first
  row of the "Deimos specific" group · comment `1951617125`
- Type: ordering.
- Rule: inside each Components group, rows go Common, then Uncommon, then
  Rare, as Dante draws them. Weapons, other currencies and the credit total
  stay at the end.

### BR-25 · Part sections are ordered by their odds

- Frame `337:806` · pin (84, 1200) · layer: the "Reach Proxima Pluto" row of
  the Chassis Blueprint section · comment `1951617862`
- Type: ordering.
- Rule: when parts come from different places, the part sections themselves
  are ordered by the best chance each one has, highest first. Ash draws
  Chassis, then Systems, then Neuroptics, not the catalog's order.

### BR-26 · The best mission leads, and is marked

- Frame `337:806` · pin (327, 1359) · layer: the drop line under "Play Falling
  Glory (Highest Chance 13.33%)" · comment `1951618442`
- Type: ordering.
- Rule: inside a part section, the mission with the highest chance comes first
  and is marked in gold (`--orokin`), not only in its title. The words
  "(Highest chance)" stay, so colour is never the only signal.

### BR-27 · A route names the node, not the mission type

- Frame `337:806` · pin (59, 1498) · layer: the description under "Play
  Beacon Shield Ring" ("Players must recalibrate a Corpus Ship's reactor…") ·
  comment `1951608101`
- Type: content.
- Rule: a route row is titled by the node, the name a player sees first on
  the planet in game (Beacon Shield Ring). The wiki files by mission type
  (Defense, Exterminate), and players don't talk that way, so the type
  never stands in for the node in a title. The type's one wiki sentence can
  still sit under the title, as the row's prose.

### BR-28 · Prerequisites are followed to the root

- Frame [`382:452` Kuva](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=382-452)
  · pin (140, 617) · layer: the Mastery Rank 15 row's description · comment `1951683264`
- Type: behaviour.
- Rule: prerequisites are tracked for every item named, not only for the item
  on screen. "Acquire a Railjack" brings its own chain (Rising Tide, which
  needs The War Within), and each link is a prerequisite.
- Each quest also brings what its requirement names besides quests:
  `questNeeds()` reads the junctions ("the Pluto and Sedna Junctions", "Earth
  to Mars Junction") into "Clear the … Junction" rows placed before the quest,
  and a Mastery Rank, which raises the Mastery row to the highest rank still
  pending. Dante needs Mastery Rank 0, but The Deadlock Protocol needs 4, so
  its plan opens on "Mastery Rank 4".
- What the profile confirms is not asked. `stepPlan()` and
  `collectibleStepPlan()` take the quests `quest_evidence.yaml` proves; a
  final pass over Prerequisites drops each of them, every quest before it, and
  the junctions those quests needed. With the full demo profile, Dante goes
  from eleven quests to one, The Deadlock Protocol, which no evidence rule
  covers. Absence of evidence still shows the row: it is never read as "not
  done".

### BR-29 · A vaulted Prime in Resurgence says how to get it

- Frame [`382:1864` Prime Resurgence](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=382-1864)
  · pin (240, 823) · layer: the gap between Prerequisites and How to get ·
  comment `1951688924`
- Type: behaviour, plus a question.
- Rule: when the Warframe is in Prime Resurgence right now, the plan says so and
  shows how to get it (Acquire Aya, then Visit Varzia, then the relics).
- The question, "how and how often is this updated, and do the calls cost?",
  is answered in [`api.md`](api.md): Varzia's stock is read live from
  `api.warframestat.us/pc/vaultTrader`, a free public endpoint, only when a
  vaulted Prime is on screen, cached ten minutes. A failed read drops to the
  lines that need no live data.

### BR-30 · A thing we curate links to our page, not the wiki

- Frame `382:1864` · pin (134, 1010) · layer: Section container › Frame 210 ›
  Frame 209 (the "Acquire Aya" and "Visit Varzia" rows) · comment `1951691939`
- Type: behaviour.
- Rule: when the app already has a curated page for a thing, its link opens
  that page and not the wiki. Aya is the example. This applies to every item,
  resource and currency with an `/item` page.
- [`ui.md`](ui.md#links-our-answer-first-then-the-wiki) (2026-10-04) says the
  same.

### BR-31 · "Market" is the ship's console

- Frame [`385:498` Kubrow](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=385-498)
  · pin (287, 974) · layer: the "Acquire a Kubrow Egg" description · comment `1951813249`
- Type: content.
- Rule: "Market" always means the Market console on the player's ship, in the
  game, never a trading site. The copy makes that unambiguous ("from the
  in-game Market").

### BR-32 · Components gather everything the plan names

- Frame `385:498` · pin (146, 1876) · layer: the "COMPONENTS" heading ·
  comment `1951831488`
- Type: content.
- Rule: Components lists every ingredient of everything named above it: the
  Incubator Power Core's recipe, a Genetic Code Template, and the rest, not
  only the item's own recipe.
- [`scenario-guidelines.md`](scenario-guidelines.md#components-gather-every-recipe-the-plan-names)
  says the same since 2026-10-04.

## Goal: settled when its spec was written

### BR-53 · The search suggests as the player types

- Frame [`208:90` Goal](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-90),
  the "Choose a target" card. Settled by the owner on 2026-10-06.
- Type: behaviour.
- Rule: from the second character, a list opens under the field with the
  matches, best first, each with its icon, its name and its catalogue
  ("Warframe", "Primary", "Place"). Choosing one opens it; Continue opens
  the first. A place opens the map on it; anything else opens its item page.
- The list is the `Suggestion list` component (Results, No match) on the
  Design System page, approved by the owner on 2026-10-06, and drawn in place
  on the Goal frames under Documented states.

### BR-54 · "Build a Necramech" names the one the player lacks

- Frame `208:90`, the "Build a Necramech" card. Settled by the owner on
  2026-10-06.
- Type: behaviour.
- Rule: the goal opens the Step by step of the first Necramech the profile
  does not show in `XPInfo`, Voidrig first, then Bonewidow, then the rest by
  release. A player who has them all is not offered the goal. With no
  `XPInfo`, the goal opens Voidrig.

## The item: settled when its spec was written

### BR-55 · The item's Summary is Blueprints and Components

- Frame [`208:287` Item Summary](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-287).
  Settled by the owner on 2026-10-06.
- Type: content.
- Rule: the Summary view shows the two sections the frame draws, and nothing
  else: Blueprints, one row per blueprint with its best route, and
  Components, one row per ingredient. Every row is drawn as the frame
  draws it: the art (a part on its blueprint, BR-19), the name, the reading in
  gold and the place. Prerequisites and How to get stay in Step by step.
- An item with neither (a Kuva weapon, a Tenet weapon, a bred companion) shows
  its "How to get", or its Acquisition, in the same rows instead, so the
  Summary is never empty.
- The table in [`scenario-guidelines.md`](scenario-guidelines.md#one-answer-two-densities)
  that listed Prerequisites and How to get in the Summary is replaced by this
  rule. Summary is still `briefOf()` over the same plan: a subset, never a
  second engine.

### BR-56 · The gold line reads in runs

- Frames `206:774`, `212:159`, `208:287` and the tiles `257:1124`, `269:364`:
  "~24 Runs · Rotation A". Settled by the owner on 2026-10-06.
- Type: content.
- Rule: wherever a tile or a Summary row names a drop, its gold line reads
  "~~{n} Runs · Rotation {x}", or "~~{n} Runs" with no rotation. {n} is the runs
  for an even chance at that drop's odds, the same number Step by step's detail
  gives ("so about 13 runs for an even chance"), so the two views agree. A
  route that is not a drop (a vendor, the Market, research) reads its own
  short line, as `briefOf()` writes it.
- [`items.md`](items.md#the-number-that-was-asked-for-and-is-not-there)
  argued against a runs column because a roll's cost differs by mission type.
  The number shown is runs of that roll, beside the rotation and the place that
  give it, so the reader still prices one attempt; the owner chose it.

### BR-57 · The Dojo is a place in the Origin System

- Frame `372:355` Nesha, "You're on Origin > Dojo". Settled by the owner on
  2026-10-06.
- Type: content.
- Rule: the Origin System holds a place, Dojo, that holds everything built
  from research in a clan dojo's labs, whichever lab researches it.
  It is listed with the other places, carries a mastered count and lenses like
  any place, has no Nodes lines and never carries Start here.

## Step by step: settled when its spec was written

The owner asked on 2026-10-06 that Step by step be built exactly as drawn, and
settled where the frames disagreed with each other or with the docs.

### BR-48 · The wiki's prose runs as the frames draw it, in paragraphs

- Frames `382:452` Kuva, `396:1179` Predasite, `368:865` Ember and every
  scenario frame, the text under a row's title.
- Type: content.
- Rule: a row's prose is the whole passage its source gives, in its
  paragraphs, as the frames draw it. The source is the passage most useful to
  play the row, the owner settled the same day: for a mission, the mission
  type's Mechanics section, how it plays (Dante's "Play Armatus"); for an item
  whose route only prose names, its Acquisition section; for anything else
  (a boss, a lab, a vendor), the lead of its page. The data detail ("It drops at
  rotation C, 7.5% a run, so about 13 runs for an even chance.") stays its own
  first line, and "Wiki ↗" closes the passage.
- This replaces the rule "one sentence per row and never more" in
  [`scenario-guidelines.md`](scenario-guidelines.md) and
  [`step-by-step.md`](step-by-step.md), which treated the drawn paragraphs as
  intent. The owner chose the drawing. It also reverses the choice of the
  lead over Mechanics for missions that `step-by-step.md` records; lore
  sections stay out.

### BR-49 · Relic rows: Open the best, Or the rest

- Frames `382:1864` Prime Resurgence (drawn this way), `372:1070` Prime and
  `382:1528` Prime Vaulted (drawn the other way).
- Type: content.
- Rule: a part's relics are alternatives, as every part section is. The first
  is "Open {relic} Relic", marked "(Highest chance)" when it beats another, with
  the diamond; each other reads "Or {relic} Relic", without a diamond. A
  vaulted relic adds "(Vaulted)".

### BR-50 · "(Highest chance)" carries no number

- Frames `337:806` Ash (drawn "(Highest Chance 13.33%)") and `382:1864`
  (drawn "(Highest chance)").
- Type: content.
- Rule: the mark reads "(Highest chance)". The percentage lives in the row's
  detail line, never in the title.

### BR-51 · "You're on" names the item's place

- Frames `323:689`, `337:806`, `368:865`, `371:1183`, `372:355` and `208:287`,
  the card above the hero. `372:1070` Gyre Prime draws one too, which the owner
  called a mistake on 2026-10-06.
- Type: content and behaviour.
- Rule: when an item comes from a place, the card above the hero reads "You're
  on {system} > {place}" with the place's art, wherever the item was opened
  from. The place is the one of the item's best route, the same place its
  Summary's first line names. An item that comes from a game system (a Lich, a
  Sister, Baro, Varzia, breeding) or from relics has no place and shows no
  card. An item researched in a dojo lab has the Dojo as its place (BR-57).
  The card opens the map on that place.

### BR-52 · The hero's state lives on its image

- Frames `208:287` (Rank), `339:1335`, `320:758`, `372:1394`, and `306:1456`
  Cards, which draws the badge under the name.
- Type: state.
- Rule: the state badge and the image's border carry the state, on the image,
  as BR-17's table draws them. The Cards frame shows every catalogue's hero
  for its kicker, name and art; its badge position is not followed.

## The mark: settled on 2026-10-07

### BR-58 · The quill is the app's own mark

- Settled by the owner on 2026-10-07, after asking whether the game's art and
  the logo may be used.
- Type: content.
- Rule: the mark beside "Onkko's Archive" is the app's own quill, one vector
  path on a 96 × 144 box in `--brand`. It is not the emblem of The Quills, the
  game's art the frames first drew there.
- Why: Digital Extremes' [content policy](https://www.warframe.com/contentpolicy)
  (last updated 2020-07-16) lets fans use the game's assets in non-commercial
  work, and forbids the Warframe and Digital Extremes logos without written
  consent. The Quills' emblem is neither logo, so the policy allows it, but as
  the app's own mark it would read as official, and it could never be the
  owner's. The quill drawn for the first build is original, and the owner chose
  it.
- The game's art is still used where it names a thing (BR-42): non-commercial,
  served from DE's and the wiki's hosts, never rehosted. The wiki's licence
  covers its text only; its images are DE's, under the same policy.
- Figma: the vector replaced the emblem on 2026-10-07 in `Wordmark` (three
  sizes), `Imagotipo`, `Loading card` and `Header`, and so in every screen.

## Progressive disclosure: settled on 2026-10-08

The owner set it on 2026-10-08 as one of the app's central rules, and accepted
three adjustments the same day: exploring hides and counts, a plan dims and
never hides, a search shows everything. It applies the comment `1905320490`
("Content depends on the player's level"), whose screen was deleted. The
constitution states it in
[The anchor holds](../specs/00-constitution.md#the-anchor-holds). The pieces
it adds are on the Design System page, under New designs, and the screens
that use them under Documented states (2026-10-08). The owner approved both
on 2026-10-08.

### BR-59 · What the player can reach

- Comment `1905320490` on `10:16` Home, applied on 2026-10-08.
- Type: behaviour.
- Rule: the app shows what the player can reach and counts what lies beyond
  it, so a player is never handed the whole game before they know what any of
  it is. Reach has two measures, each read from the profile:
  - **A place** is in reach when its planet is behind the player on
    `star_chart_order` or is the frontier (`reachedPlaces`). A place off the
    chart is in reach when the planet it sits `after` in `grafo.yaml` is. A
    player with no frontier has every place on the chart and off it in reach.
  - **Three places** have a gate of their own, settled by the owner on
    2026-10-08 from the wiki:

    | Place           | What opens it                                                                   | Reach                                |
    | --------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
    | Sanctuary       | The New Strange, which needs Stolen Dreams and the Europa Junction              | `after: Europa`                      |
    | Dark Refractory | The Old Peace, which needs The Lotus Eaters, the quest that opens Höllvania     | `after: Sedna`, as Höllvania         |
    | Dojo            | Joining a clan, which gives the Clan Key's blueprint; the key is built to enter | The profile names a clan (`GuildId`) |

    The quests themselves cannot be read, so the planet before them is the
    measure, and a player who has reached it sees the place.

  - **An item** is in reach when the player's Mastery Rank (`PlayerLevel`)
    meets the item's (`masteryReq`) and its place is in reach. On the map its
    place is the place on view, in reach by being shown, so there only the
    rank counts; everywhere else it is the place BR-51 names. An item with no
    place is measured by its rank alone.
  - A quest has no reach of its own: its prerequisites say what stands before
    it (BR-28), and it is never hidden.
- What cannot be read is in reach. Without `Missions[]` every place is, and
  without `PlayerLevel` every rank is, as BR-03 shows the option to a profile
  it cannot read. Reach is never inferred.
- Three treatments, one per context: exploring hides and counts (BR-60,
  BR-61), a search shows everything (BR-62), a plan dims and never hides
  (BR-63).
- The gap is said in full words, the same everywhere, and names what is
  counted. The owner asked on 2026-10-08 that no line leave the player asking
  "4 more what?":

  | Gap      | Words                                              |
  | -------- | -------------------------------------------------- |
  | A rank   | "Needs Mastery Rank 8. You are Mastery Rank 5."    |
  | A place  | "Clear the Venus Junction, on Earth, to reach it." |
  | The Dojo | "Join a clan to enter its Dojo."                   |

  The junction is the one the frontier needs: every place beyond reach lies
  past it.

- BR-03 and BR-22 were the first instances of this rule.

### BR-60 · The map lists the places in reach

- Frames `215:610` (the place list) and `270:786` (the system list);
  `Place row` Beyond reach (`526:112`) and `More line` (`526:117`) on the Design
  System page.
- Type: behaviour.
- Rule: the place list shows the system's places in reach, in their order,
  then a More line: "3 more places open as you clear the junctions. Next: the
  Venus Junction, on Earth." The system list shows the systems with a place
  in reach, then "2 more systems open as you go further." Tau keeps "Soon™":
  it is in no one's reach yet.
- The place list's search filters every place of the system. A place beyond
  reach shows in its hits as the Beyond reach row, the gap in place of the
  mastered count.
- A place beyond reach opened on purpose (from a search, from You're on, or
  reopened by `wf_place`) shows whole, its catalog with nothing hidden, and
  stays in the place list, on view, while it is on view.

### BR-61 · A group shows what is in reach, and counts the rest

- Frames `212:159` (a group on the map) and `206:774` (a group in the
  Summary); `More line` (`526:117`).
- Type: behaviour.
- Rule: in a group, on the map and in the Summary, the tiles are what is in
  reach. What lies beyond is not drawn: the open group ends in a More line
  that says how many, of what, and what stands in the way. {kind} is the
  group's own noun ("primary weapons", "warframes", "mods"), singular for one;
  {r} is the lowest rank among them:

  | Beyond by | Words                                                                                    |
  | --------- | ---------------------------------------------------------------------------------------- |
  | Rank      | "4 more primary weapons need Mastery Rank 8 or higher. You are Mastery Rank 5."          |
  | Place     | "3 more mods come from places past Venus. Clear the Venus Junction, on Earth, to go on." |
  | Both      | "6 more warframes need Mastery Rank 8 or a place past Venus."                            |

  The line informs. It opens nothing; a search is the way to one of them
  (BR-62).

- The group's count ("{n} NEW" in the Summary, "{n} New" on the map) counts
  everything new, in reach or not, so it adds up to the tiles and the line.
- A group with nothing in reach and something beyond renders, its rail
  holding only the More line.
- On the map this holds under the default lens and New. Mastered shows what
  the player has mastered, in reach by proof.

### BR-62 · A search shows everything, and says the gap

- Frames `474:920` (Goal, results) and `215:610` (the place list's search);
  `Suggestion row` Beyond reach (`526:107`).
- Type: behaviour.
- Rule: a search is how the player lifts BR-59 for one thing. The Goal search
  and the place list's search reach everything they reached before (BR-53,
  spec 07), what is in reach first. A result beyond reach is the Beyond reach
  row: its catalogue, then the gap, short enough for one line: "Sniper ·
  Needs Mastery Rank 8, you are 5", "Place · Clear the Venus Junction, on
  Earth", "Place · Join a clan".
- An item beyond reach opens with Step by step chosen, so the first thing the
  player reads is the prerequisite in the way (BR-63).
- A curated goal that names an item beyond reach is not offered (spec 08);
  the search still reaches it.

### BR-63 · A plan dims what waits on an unmet prerequisite

- `Step row` Locked (`526:96`, `528:97` with art) and `Component row` Locked (`526:102`), over the
  scenario frames of spec 10.
- Type: state.
- Rule: when a prerequisite the profile proves unmet stands in Prerequisites,
  a Mastery Rank above the player's or a junction whose tag `Missions[]` lacks,
  that row keeps full contrast with the gap as its detail ("Needs Mastery
  Rank 8. You are Mastery Rank 5."), and
  every row after it, in every section, is drawn Locked: at half opacity,
  open, readable, never hidden. A locked component can still be ticked.
- A quest with no evidence locks nothing, and neither does any prerequisite
  the profile cannot read: absence of evidence is never "not done" (BR-28).

## Not applied

Two comments were set aside by the owner on 2026-10-04 and carry no rule:
`1939170476` ("tell them which planet to go to next", on `323:689`) and
`1923621464` ("add an open search input?", on the deleted node `163:103`).

### Frames from deleted screens

These frames are the desktop Home and star chart. The screens were removed,
so the comments are kept here and not applied. The first of them,
`1905320490` on `10:16` ("Content depends on the player's level"), was
applied on 2026-10-08 as BR-59.

| Frame                 | Pin         | Comment      | Text                                                                            |
| --------------------- | ----------- | ------------ | ------------------------------------------------------------------------------- |
| `94:156` Home - 0.0.0 | (1400, 275) | `1918281689` | Use more symbols on labels                                                      |
| `94:156` Home - 0.0.0 | (633, 227)  | `1918287698` | Nodes?                                                                          |
| `94:156` Home - 0.0.0 | (1221, 478) | `1918287884` | A "platinum" completion system for free items, to find, track and guide to them |
| reply to the above    | n/a         | `1918290338` | Track and guide what the game does not say; never be redundant                  |
| `129:12` Home - 0.0.0 | (142, 116)  | `1918300458` | The places list becomes a planet menu, with a card on hover                     |
| `129:118` Frame 83    | (167, 371)  | `1918304538` | Planet stats?                                                                   |
| `128:2223` Frame 96   | (284, 53)   | `1918286062` | Shine effect (on the Mastered badge)                                            |

`1918290338` still reads as a product principle, and the anchor in the
[constitution](../specs/00-constitution.md#the-anchor-holds) already holds it ("Filter and curate; never mirror").

## Resolved threads

Thirteen threads are resolved. Three on `206:774` were reopened as BR-12,
BR-13 and BR-14. The rest are recorded here and need nothing:

| Frame                | Comment      | Text                                                                 |
| -------------------- | ------------ | -------------------------------------------------------------------- |
| `206:774` Summary    | `1924100394` | Only the first descriptive line of a quest                           |
| `206:774` Summary    | `1924100483` | Only the first descriptive line of an item                           |
| `212:159` Navigation | `1929710840` | No navbar during onboarding until it ends                            |
| `212:159` Navigation | `1933693172` | Choose the System from here, not from the navbar                     |
| `212:159` Navigation | `1933718008` | Show every catalogue: primaries, secondaries, melee                  |
| `306:1456` Card      | `1937241802` | Show Playstyle and Progenitor Element                                |
| `306:1456` Card      | `1937251280` | For weapons: projectile type and primary damage                      |
| `306:1456` Card      | `1937263619` | For Archwing: themes                                                 |
| `270:1270` (deleted) | `1933353580` | A guided route through planet and mission, after Marvel Future Fight |
| `270:1270` (deleted) | `1939082421` | Which mission, and how                                               |
