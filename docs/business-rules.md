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
resolved, all on the page Wireframes.

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

- It governs every screen and every rule in
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
  corrected one. The build does not pick a reading on its own.
- It overrides what came before it: BR-17's hero colours, Disconnect's
  secondary button (BR-06) and every "builds as" that departed from a frame.
  `pnpm palette` is a measurement, not a gate: it reports and never blocks a
  build.
- Verified by putting each screen beside its frame at the frame's width
  (390 px), and then sweeping 360 and 600 against BR-39. `pnpm check`
  cannot see either.

### BR-39 · Wider than the frames: the layout follows width classes

- The frames are drawn at 390 px only, and
  the owner may never draw a desktop. They asked for the standard, most
  logical desktop behaviour, defined here rather than invented screen by
  screen.
- Type: behaviour (of the work).
- Rule: width changes arrangement, never content. At every width the
  screen holds what its frame holds, in the same order, with the same copy,
  components, states, type and colours. A wider window may change only the
  number of columns, where navigation sits, and how wide things grow.
- The app is never wider than 600 px. The desktop
  window cannot pass 600 (spec 13), and the demo and development keep the
  same width, so every place the screens run looks like the app. Between 360
  and 600 every screen is fluid, with the 16 px gutter at the window's edges,
  the screens outside the shell and Profile included. In a window wider than
  600 the page is a centred column 600 px wide on the canvas.
- Until 2026-10-24 the rule followed Material 3's width classes, with a
  floating tab bar from 840 and two panes from 1200 for the map and the item.
  The owner retired them with the 600 px column: nobody drew them, and the
  app never reached them.
- Background art covers the whole column at every width.
- An illustration keeps the proportions its frame draws as it grows: an update
  card's art grows taller with its width, 358 by 202 in the frame, and is never
  cropped to a fixed height.
- Pointer and keyboard: the frames draw no hover. Anything pressable takes
  one hover treatment, the same token everywhere. Keyboard focus is always
  visible.
- Verified by sweeping 360, 390 and 600, and once wider than 600.

## The flow between screens

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
  arrows. Its What's new still lists quests, for instance, and the high-fi one
  does not (BR-35).
- The flow it draws: the account id; then, for a player past the first
  planet, Where to start, and for a new one, the goals (BR-03). "When did you
  last play?" leads to What's new; "What are you after?" leads to a goal's
  steps; the items on What's new lead to their steps; and both end on the map,
  at a place.
- Nothing reaches the code before its frame: a visual state, a marker, a row
  shape or a screen behaviour that no frame draws waits for one. The order is
  frame, spec, code.
- A proposal is drawn in a Section of its own, apart from the approved rows,
  from plain frames and the components that exist. Once approved, it becomes
  components on the Design System page and its frames join their screen's
  row.

### BR-35 · Catch up is what What's new draws

- Frames [`206:774` What's new](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-774),
  `257:653`, `264:67`.
- Type: content.
- Rule: Catch up shows what shipped since the chosen update, under
  Arsenal and Collection, and nothing else. Story quests, the live
  Nightwave ("Running now") and the suggested goal ("Pick up") are not part
  of it.

### BR-36 · From What's new: an item, or Skip to a place

- Frame `206:774`, the tiles and the Skip button.
- Type: behaviour.
- Rule: from What's new the player either opens an item, which opens that
  item's page, or presses Skip, which opens the map on one place: the
  frontier when the player has one, otherwise the focus
  ([`system.md`](system.md#two-lenses-that-cut-every-level-at-once)). The two
  are separate decisions: Skip does not lead to quests.

### BR-37 · A goal opens the steps of what it names

- Frame [`208:90` Plan](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-90),
  the goal cards ("Build a Necramech", "Play the Hex Quest").
- Type: behaviour.
- Rule: choosing a goal opens the Step by step of the item, the quest or the
  game mode it refers to. A goal has no plan screen of its own.
- A quest's Step by step has no frame of its own. It is placed in the grammar
  every Step by step shares
  ([`scenario-guidelines.md`](scenario-guidelines.md)): Prerequisites holds
  the quests and junctions before it (BR-28), its Mastery Rank and what it
  needs owned ("Have a Railjack"), each saying where it comes from and
  linking to its page; How to get names where it starts.
- A game mode (The Steel Path, the Archon Hunt) takes the same page under the
  kicker "Game mode". It is reached from Plan's milestones alone: the search
  does not find it. The Steel Path asks for every node of the Star Chart and
  names the planet with nodes left, which "You're on" opens on the map.
- A quest's or a mode's page says what the player cannot read in the game:
  what stands in the way and where to start. It lists no stages, no rewards
  and no schedule. A prerequisite is never trimmed as obvious: the Archon
  Hunt asks for The New War, Veilbreaker and a Warframe at rank 30, and says
  all three.
- A quest's or a mode's page always has art: the lead image of its wiki page,
  or the one the spine names (`art`) when that image does not show it.
- A place chosen as a target opens the map on that place, as Next does
  (BR-36).
- The next Mastery Rank is a goal of its own since 2026-11-02 (BR-76): it
  opens its own steps, not an item's. Syndicate rank is
  not a target; [`deferred.md`](deferred.md) keeps what it was and how it
  worked.

### BR-38 · Loading and errors happen on the id form

- Frames [`428:743` Loading](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=428-743)
  and [`428:616` Error](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=428-616), both drawn on the Login frame (`202:38`).
- Type: state.
- Rule: while the profile is read, the form dims and a card with the quill
  reads "Onkko is reading your archive...". When the read fails, the message sits
  in an Error alert under the account id field, and the form stays usable.
  The alert is the light Error state of [`947:159` Alert](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=947-159)
  (until then a red band on `--danger`).
- The band's words are not fixed by the frame. The owner drew one as an
  example and on 2026-10-04 left the messages to be written from the failures
  the system can return. The proxy knows seven reasons
  (`FailureReason` in `src/domain/types/profile.ts`); the player can act on
  four, so the band says four things:

| Reason                                  | The band                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `invalid-id`                            | An account ID is 24 characters: digits 0–9 and letters a–f.               |
| `not-found`                             | No account answers to this ID. Copy it again from the gid cookie.         |
| `upstream`, `throttled`, `circuit-open` | Warframe isn't answering right now. Your ID is fine; try again at 15:30.  |
| `malformed`                             | Warframe's answer came back in a form we can't read yet. Your ID is fine. |
| `limited`                               | You've had your two readings for now. The next opens at 15:30.            |

- The time is when a retry can succeed: the circuit's reopening or the end of
  the visitor's window (`retryAfterSeconds`). With no time known, the third row
  ends "try again in a few minutes." Once the page loads, the browser writes the
  time in the player's own time, as the read cycle does: "try again at **3:30
  PM**.". Every time the app shows is the player's own : the server cannot know
  the time zone, so a band that holds a time waits for the browser to write it.
  The machine stays out of the band: no status code, no refusal count, no
  "circuit". `malformed` is apart from the others because waiting does not fix
  it; the app has to be updated.
- The profile is read on this form first, so the first read always happens
  here. A later read that fails keeps the player where they are, on the profile
  last read, and Profile says so in the same band (BR-69). The player never has
  to paste their id again because DE failed (until then a failed later read sent
  the player back to this form).

### BR-40 · Before the map, Skip goes to the map

- Frame [`203:140` Features](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-140),
  the Skip button under the two cards.
- Type: behaviour.
- Rule: every screen between Connect and the map, Where to start, Catch up and the
  What's new, ends in Skip, in the secondary style. It opens the map on one place
  (BR-36): the frontier when the player has one, otherwise the focus.
- Where to start also keeps **Back**, in the text style, under Skip: it returns
  to `/connect` with the player's id in the field. The screen has no player menu,
  so Back is how a player changes account or demo there (the button read "Go
  back" before).
- The screen is still onboarding, so it draws no tab bar and no player chip
  (thread `1929710840`, "no navbar during onboarding until it ends").

### BR-41 · Catch up has two entrances

- Frame [`203:231` Catch up](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-231).
- Type: behaviour.
- Rule: reached from "Catch up" (BR-40's screen), Catch up is
  onboarding and looks as drawn: no tab bar. Reached from the Catch up tab, it
  is a section of the shell: the tab bar shows. Both end in Skip (BR-40, since
  2026-10-16). Everything else is the same screen.
- Catch up has no Go back since 2026-10-16 : the way back is the
  browser's, and Skip is the one way forward without choosing.
- What's new that follows keeps the entrance: no tab bar after the onboarding
  entrance, the tab bar after the tab's. Its frames draw the first.

### BR-43 · One date format: "Mar 2026"

- Frames `203:231`, `206:774`, `257:653`, `264:67`, `257:1090`. Settled by the
- Type: content.
- Rule: an update's date reads "Update {version} · {Mon} {year}" everywhere,
  with the month in three letters: "Update 42 · Mar 2026". English puts no comma
  between a month and a year, only after a day, so the comma went on 2026-11-01.

### BR-42 · The placeholder circles are the game's icons

- Frames `212:159` and its collapsed state: the light circles in the tab bar
  (Star Chart, Catch up, Plan) and before each category row (Warframes,
  Primary…).
- Type: content.
- Rule: a category row carries the game's own icon for that category, from the
  wiki, under the terms in [`cetus.md`](cetus.md#icons-are-the-games-own). The
  interface's own icons are Material Symbols Rounded, drawn in the frames on
  2026-10-06: the tab bar's explore, hourglass and flag; hourglass and flag on
  Where to start; precision manufacturing and auto stories on the Plan cards.
- Rule: a category the wiki has no white icon for takes a Material Symbol
  : Archgun rocket launch, Archmelee swords, Necramech
  smart toy, Incarnons cyclone, Ephemera flare, Honoria military tech.

### BR-44 · Start here marks the frontier, or the focus

- Frames [`215:610`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=215-610)
  and [`270:786`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-786),
  the gold-outlined "Start here" badge.
- Type: content.
- Rule: Start here marks the one place Skip opens: the frontier, or the
  focus when the player has no frontier (BR-36). Exactly one place carries it,
  and so does that place's system in the system list. A player with neither
  sees no badge.

### BR-45 · The map shows what is left; Mastered and New are the two lenses

- Frame [`312:199`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=312-199),
  the "Show" control.
- Type: behaviour.
- Rule: by default a place shows only what is left: everything here the player
  has not mastered. That includes a ranked item short of its maximum and every
  collectible, since the profile cannot prove one is owned. The control has
  three options, To get, Mastered and New, and one is always chosen, To get
  first (2026-10-16: with no name, the default was hard to read).
  Mastered shows only what is mastered here; New shows only what shipped
  since the player's month, mastered or not.
- New needs a month. Without `wf_since` the New option is not shown; the
  player is taken as up to date (spec 07).
- A group with nothing to show under the current lens does not render, and a
  divider with no group under it does not render either. A place where every
  arsenal item is mastered and that holds no collectible shows the empty state
  under its card (spec 07).
- When the chosen lens leaves no group at all, Show stays and an empty state
  under it says so, naming the place: "Nothing left to get on {place}", "Nothing
  mastered on {place} yet" or "Nothing new on {place}".
- The frame draws three options (All / Mastered / New); the owner corrects it
  to the two. The `All` view leaves: the default is what is
  left.
- Under the default and New, what is left is also what is in reach; the rest
  is counted at the group's end (BR-61).
- Since the Material pass (T-27b) the control is the
  **View** row on a category's page, and a lens filters that category's
  items; the empty state takes the list's place (spec 07).

### BR-46 · The map reopens where the player left it

- Frame [`212:159` Star Chart](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=212-159),
  the Star Chart tab.
- Type: behaviour.
- Rule: the Star Chart tab opens the map on the last place the player viewed
  on this device. The first time, it opens on Start here (BR-44), and with no
  Start here, on the first place of the Origin System. Skip always opens
  Start here, whatever was viewed last.
- The place is kept in a cookie, `wf_place`, as `{system}/{place}`, because the
  server renders the map. It is a convenience: losing it only reopens on Start
  here.

### BR-47 · The systems in the frame's order

- Frame `270:786`, the system list.
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
  2026-10-05, and the line then drafted still promised quests, which
  BR-35 took out of Catch up. The owner chose to correct the frame with
  these two lines, which the build then follows:
- "Catch up": "Pick the last update you played and see what came out
  since."
- "Plan": "Pick one thing you want and get the steps to it, in order, read
  from your profile."
  and collection".

### BR-05 · "Plan" runs on frontier and focus

- Frame `203:140` · pin (185, 533) · layer: Profile Description Container
  ("Select or create a goal curated against your profile…") · comment `1933735165`
- Type: behaviour.
- Rule: the goal offered behind "Plan" follows the frontier / focus
  logic.

### BR-06 · The player menu

- Frame [`270:1145` Features](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-1145)
  · pin (341, 34) · layer: Header · comment `1933407291`
- Type: content.
- Rule: this frame is the player menu, opened from the player chip at the top
  right of every screen (avatar, display name, Mastery Rank and title,
  Disconnect).
- Since the Material pass (T-27b) the menu is a page,
  **Profile**, under the top bar, with the same content (spec 04).

### BR-07 · One profile read per twelve hours

- Frame `270:1145` · pin (180, 661) · layer: User Details · comment `1933412798`
- Type: behaviour (asked as a question).
- Rule: one profile read every twelve hours. The owner first gave 8 to 12
  hours as an example and settled on twelve on 2026-10-04: nothing the app
  reads about an item changes faster than its build, and twelve hours is the
  arsenal's floor ([`public-release.md`](history/public-release.md#how-long-a-read-lasts)).
- The footer reads as the frame draws it: "Data is read every **12 hours**.
  The last read was **12 minutes ago,** and the next one will be at **9:30
  AM.**", the next time being the last read plus `PROFILE_TTL_MS` (`nextReadAt()`
  in `src/infra/screen.ts`). The age is said in whole words: "just now" after a
  fresh read, "less than a minute ago", "1 minute ago", "{n} minutes ago", "1
  hour ago", "{n} hours ago".
- The time is always the player's own (2026-10-21 and 2026-11-01).
  The browser writes it from the system's time zone; the server cannot know
  that zone, so the line shows once the page has loaded and never in UTC.
- A read that fails waits twelve hours too, counted from the try, and the
  profile last read stays on screen meanwhile (BR-69).

## Catch up: picking the last update played

### BR-08 · Type a date in the search

- Frame [`203:231` Catch up](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=203-231)
  · pin (344, 321) · layer: Shipment Section › Date Filter Container (the
  "Date" button) · comment `1931751624`
- Type: behaviour.
- Rule: a date is typed in the search : a year, a month
  or a day, as "2024", "2024-03", "Mar 2024" or "March 2024", filters the
  cards to the updates of that time, and the player picks one. The "Date"
  button and its month list were removed the same day, so the search is the
  one field (`477:3022`).

### BR-09 · Main updates and minor updates both count

- Frame `203:231` · pin (315, 393) · layer: Card Container › Preview Image
  (the "Newest" card) · comment `1933352446`
- Type: content.
- Rule: the list shows main updates and the numbered updates in between
  (43, 43.5…), because minor updates also ship content. Reference: DE's patch
  notes index.
- Since 2026-10-15 that index is the list's source : `pnpm
data:patch-notes` keeps every update it names, 41.1 Vauban Heirloom and 39.1
  Caliban Prime included, with DE's name, date and art. Hotfixes are not
  updates and stay out. The catalog's `introduced` fills what the index lacks:
  the updates before 19, and a date the index leaves out.
- One card per name. Before Update 24 DE named the
  numbered updates after the major they followed, so 22 to 22.11 all read
  "Plains of Eidolon". Updates that share a name keep only the principal, the
  oldest, with its date: measuring from it shows more, never less. Its later
  versions and their months still find it in the search ("22.4", "Feb 2024"
  finds Whispers in the Walls through 35.1).

### BR-10 · Update card title band

- Frame [`264:388` Card Container](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=264-388)
  · pin (291, 181) · layer: Card Info · comment `1933353858`
- Type: state (visual spec).
- Rule: the band behind the card title is 80% opaque, with no blur.
- Drawn values: fill `#39342e` at 80%. The badge
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
- The card can say "up to date" while Catch up
  still lists what shipped since an older chosen month, because the month the
  player picked is not rewritten. And `XPInfo` holds what was ever ranked, so
  an item bought and never levelled does not count as owned yet.

## Catch up: What's new

Frame [`206:774` What's new](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=206-774)
is the expanded state. Frame
[`257:653` What's new](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=257-653)
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
- Since the Material pass (T-27b) the list is a page,
  **Updates**, under the top bar (spec 06).

### BR-14 · Groups start closed

- Frame `206:774` · pin (363, 404) · comment `1933213840`
- Type: state.
- Rule: every group is closed by default. `257:653` draws that default.
- A closed group's chevron points down and an open one's points up, on every
  screen, the same as the rows in BR-20.
- Retired by the Material pass (T-27b): What's new and
  the map no longer fold their groups. Each category is a row that opens its
  own page (specs 06 and 07).

### BR-15 · No Mastered or Rank here, only NEW

- Frame `206:774` · pin (169, 467) · layer: Cards container › Card › Card image
  · comment `1933399323`
- Type: state.
- Rule: tiles in Catch up carry no Mastered or Rank marker. The only marker
  is NEW, counted in the group header ("3 NEW"), and that count holds what is
  mastered too.
- A category of the Arsenal has a **View** on its page, To get and Mastered, as
  the Star Chart's has ([`1072:7647`](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1072-7647)). To get opens first. It appears only when the profile can tell the state
  (BR-68): a Collection category shows everything, as before.

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
- dims the icon (its ground was retired on 2026-10-19, when Step by step
  dropped the ground behind a component's art);
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
- A quest's chain also follows what it needs owned: The New War needs a
  Railjack, which Rising Tide gives, so Rising Tide comes before it and a
  confirmed New War proves it. A part of a quest (`parts` in the spine: Erra
  is part of Prelude to War) reads as the quest. A name that is neither a
  quest nor a Junction is never a quest row.
- What the profile confirms stays in Prerequisites, marked met (BR-88).
  `stepPlan()`, `collectibleStepPlan()` and `questStepPlan()` take the quests
  `quest_evidence.yaml` proves; a final pass over Prerequisites marks each of
  them, every quest before it, and the junctions those quests needed. With
  the full demo profile, Dante's eleven quests read as ten met and one left,
  The Deadlock Protocol, which no evidence rule covers. Absence of evidence
  leaves the row pending: it is never read as "not done".

### BR-89 · Every Step by step but a collectible's opens on Prerequisites

- Type: content.
- Rule: the Step by step of an item of the Arsenal, a quest or a game mode
  always opens on Prerequisites: the steps to reach the point where the thing
  unlocks. Every item of the Arsenal has at least its Slot row (BR-23), and
  every quest the quests and places before it (BR-28).
- Awakening is the one exception: it is the game's first quest, and nothing
  comes before it.
- a collectible (a mod, an arcane, a relic, a resource) shows Prerequisites only when a
  source names one, such as the place a drop needs reached (BR-72).

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
- Each ingredient appears once : what the gear asks for
  is summed into the rows the plan already has, credits into one row, and
  what only an optional step's gear asks for is summed into one last group,
  each row "(Optional)". The Chesa Kubrow had listed its credits and Argon
  Crystal three times, one group per recipe, with no title to tell them apart.
- [`scenario-guidelines.md`](scenario-guidelines.md#components-gather-every-recipe-the-plan-names)
  says the same since 2026-10-04.

## Plan: settled when its spec was written

### BR-53 · The search suggests as the player types

- Frame [`208:90` Plan](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-90),
  the "Choose a target" card.
- Type: behaviour.
- Rule: from the second character, a list opens under the field with the
  matches, best first, each with its icon, its name and its catalogue
  ("Warframe", "Primary", "Place"). Choosing one opens it; Continue opens
  the first. A place opens the map on it; anything else opens its item page.
- The list is the `Suggestion list` component (Results, No match) on the

### BR-54 · "Build a Necramech" names the one the player lacks

- Frame `208:90`, the "Build a Necramech" card. Settled by the owner on
  2026-10-06.
- Type: behaviour.
- Rule: the goal opens the Step by step of the first Necramech the profile
  does not show in `XPInfo`, Voidrig first, then Bonewidow, then the rest by
  release. A player who has them all is not offered the goal. With no
  `XPInfo`, the goal opens Voidrig.

## The item: settled when its spec was written

### BR-55 · The item's Overview is Blueprints and Components

- Frame [`208:287` Item Overview](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=208-287).
- Type: content.
- Rule: the Overview view shows the two sections the frame draws, and nothing
  else: Blueprints, one row per blueprint with its best route, and
  Components, one row per ingredient. Every row is drawn as the frame
  draws it: the art (a part on its blueprint, BR-19), the name, the reading in
  gold and the place. Prerequisites and How to get stay in Step by step.
- An item with neither (a Kuva weapon, a Tenet weapon, a bred companion) shows
  its "How to get", or its Acquisition, in the same rows instead, so the
  Overview is never empty.
- The table in [`scenario-guidelines.md`](scenario-guidelines.md#one-answer-two-densities)
  that listed Prerequisites and How to get in the Overview is replaced by this
  rule. Overview is still `briefOf()` over the same plan: a subset, never a
  second engine.

### BR-56 · The gold line reads in runs

- Frames `206:774`, `212:159`, `208:287` and the tiles `257:1124`, `269:364`:
  "~24 Runs · Rotation A".
- Type: content.
- Rule: wherever a tile or a Summary row names a drop, its gold line reads
  "~~{n} Runs · Rotation {x}", or "~~{n} Runs" with no rotation, and "~~{n}
  Kills" for an enemy. {n} is how many runs or kills give one drop on average,
  the same number Step by step's detail gives ("so about 1 in 13 runs"), so the
  two views agree. A route that is not a drop (a vendor, the Market, research)
  reads its own short line, as `briefOf()` writes it.
- [`items.md`](items.md#the-number-that-was-asked-for-and-is-not-there)
  argued against a runs column because a roll's cost differs by mission type. The
  number shown is runs of that roll, beside the rotation and the place that
  give it, so the reader still prices one attempt.

### BR-57 · The Dojo is a place in the Origin System

- Frame `372:355` Nesha, "You're on Origin > Dojo". Settled by the owner on
  2026-10-06.
- Type: content.
- Rule: the Origin System holds a place, Dojo, that holds everything built
  from research in a clan dojo's labs, whichever lab researches it.
  It is listed with the other places, carries a mastered count and lenses like
  any place, and never carries Start here.

## Step by step: settled when its spec was written

### BR-48 · The wiki's prose runs as the frames draw it, in paragraphs

- Frames `382:452` Kuva, `396:1179` Predasite, `368:865` Ember and every
  scenario frame, the text under a row's title.
- Type: content.
- Rule: a row's prose is the whole passage its source gives, in its
  paragraphs, as the frames draw it. The source is the passage most useful to
  play the row, the owner settled the same day: for a mission, the mission
  type's Mechanics section, how it plays (Dante's "Play Armatus"); for an item
  whose route only prose names, its Acquisition section; for anything else
  (a boss, a lab, a vendor), the lead of its page. A mission type's page with
  no Mechanics section gives its lead. The data detail ("It drops at
  rotation C, 7.5% a run, so about 1 in 13 runs.") stays its own
  first line, and "Read on the wiki ↗" closes the passage.
- This replaces the rule "one sentence per row and never more" in
  [`scenario-guidelines.md`](scenario-guidelines.md) and
  [`step-by-step.md`](step-by-step.md), which treated the drawn paragraphs as
  intent. The owner chose the drawing. It also reverses the choice of the
  lead over Mechanics for missions that `step-by-step.md` records; lore
  sections stay out.
- Trimmed with no hand-written text : a mission type's
  Mechanics gives what comes before its first subsection, where the
  variants begin (Mirror Defense's Tyana Pass and Munio); a line that is not a
  sentence is dropped, so an audio caption or a list's lead never shows; a
  footnote's number is taken off; and a passage stops at three sentences.

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
  the card above the hero.
- Type: content and behaviour.
- Rule: when an item comes from a place, the card above the hero reads "You're
  on {system} > {place}" with the place's art, wherever the item was opened
  from. The place is the one of the item's best route, the same place its
  Overview's first line names. An item that comes from a game system (a Lich, a
  Sister, Baro, Varzia, breeding) or from relics has no place and shows no
  card. An item researched in a dojo lab has the Dojo as its place (BR-57).
  The card opens the map on that place.

### BR-52 · The hero's state lives on its image

- Frames `208:287` (Rank), `339:1335`, `320:758`, `372:1394`, and `306:1456`
  Cards, which draws the badge under the name.
- Type: state.
- Rule: the state badge and the image's border carry the state, on the image,
  as BR-17's table draws them. Every item's image frame is 2 px
  (`--border-2`), drawn inside the 200 px art so the art keeps its full
  size. The Cards frame shows every catalogue's hero
  for its kicker, name and art; its badge position is not followed.

## The mark

### BR-58 · The quill is the app's own mark

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
  owner's. The quill the app draws is
  original.
- The game's art is still used where it names a thing (BR-42): non-commercial,
  served from DE's and the wiki's hosts, never rehosted. The wiki's licence
  covers its text only; its images are DE's, under the same policy.
- Figma: the vector replaced the emblem on 2026-10-07 in `Wordmark` (three
  sizes), `Imagotipo`, `Loading card` and `Header`, and so in every screen.

## Progressive disclosure

It applies the comment `1905320490` ("Content depends on the player's level"),
whose screen was deleted. The constitution states it in [The anchor
holds](specs/00-constitution.md#the-anchor-holds). The pieces it adds are on the
Design System page, under New designs, and the screens that use them under
Documented states (2026-10-08).

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
  counted.

No line leaves the player asking "4 more what?":

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
  `Place row` Beyond reach (`526:112`) on the Design System page.
- Type: behaviour.
- Rule: the place list shows the system's places in reach, in their order,
  then the empty state of BR-61: "3 more out of reach", "Clear the Venus
  Junction, on Earth, to open the next." The system list shows the systems with
  a place in reach, then "2 more out of reach", "They open as you go further."
  Tau keeps "Soon™":
  it is in no one's reach yet.
- The place list's search filters every place of the system. A place beyond
  reach shows in its hits as the Beyond reach row, the gap in place of the
  mastered count.
- A place beyond reach opened on purpose (from a search, from You're on, or
  reopened by `wf_place`) shows whole, its catalog with nothing hidden, and
  stays in the place list, on view, while it is on view.

### BR-61 · A group shows what is in reach, and counts the rest

- Frames `212:159` (a group on the map) and `206:774` (a group in the
  What's new).
- Type: behaviour.
- Rule: in a group, on the map and in What's new, the tiles are what is in
  reach. What lies beyond is not drawn: the open group ends in an empty state,
  outside the card (BR-80), that says how many and what stands in the way. Its
  title is "{n} more out of reach"; with nothing else on the page, "{n} {kind}
  out of reach", "{n} new {kind} out of reach" in What's new. {kind} is the
  group's own noun, singular for one; {r} is the lowest rank among them:

| Beyond by | Line                                                          |
| --------- | ------------------------------------------------------------- |
| Rank      | "They need Mastery Rank 8 or higher. You are Mastery Rank 5." |
| Place     | "Clear the Venus Junction, on Earth, to reach them."          |
| Both      | "They need Mastery Rank 8 or a place past Venus."             |

It informs and opens nothing; a search is the way to one of them (BR-62). It
is never an Alert, which is for the app's own states.

- What only the Dojo holds is counted in the words of BR-59's Dojo row: "They
  come from the Dojo. Join a clan to enter it." A group held back by a rank and
  by a clan reads "They need Mastery Rank {r} or a clan's Dojo".
  `content/reach.ts` holds the words.

- The group's count ("{n} NEW" in What's new, "{n} New" on the map) counts
  everything new, in reach or not, so it adds up to the tiles and the line.
- A group with nothing in reach and something beyond renders, holding only
  the empty state.
- On the map this holds under the default lens and New. Mastered shows what
  the player has mastered, in reach by proof.

### BR-62 · A search shows everything, and says the gap

- Frames `474:920` (Plan, results) and `215:610` (the place list's search);
  `Suggestion row` Beyond reach (`526:107`).
- Type: behaviour.
- Rule: a search is how the player lifts BR-59 for one thing. The Plan search
  and the place list's search reach everything they reached before (BR-53,
  spec 07), what is in reach first among matches as close to the name. A result beyond reach is the Beyond reach
  row: its catalogue, then the gap, short enough for one line: "Sniper ·
  Needs Mastery Rank 8, you are 5", "Place · Clear the Venus Junction, on
  Earth", "Place · Join a clan".
- An item beyond reach opens with Step by step chosen, so the first thing the
  player reads is the prerequisite in the way (BR-63).
- A curated goal that names an item beyond reach is not offered (spec 08);
  the search still reaches it.

### BR-63 · A plan dims what waits on an unmet prerequisite

- `Step row` Locked (`526:96`, `1087:7336` with art) and `Component row` Locked (`526:102`), over the
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

## Onkko's voice

### BR-64 · Onkko speaks once the player has reached Cetus

- Frame [`270:1145` Menú del jugador](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=270-1145),
  Settings › Onkko's Phrases. Después podrá activarlas o desactivarlas."
- Type: behaviour.
- Rule: Onkko's lines (`OnkkoLine`) show only to a player who has reached
  Cetus, where Onkko lives. The profile shows it in `Missions[]`: the Cetus
  hub (`CetusHub4`) or the Plains of Eidolon (`SolNode228`). A profile with
  no `Missions[]` counts as reached (BR-59).
- From then on the player menu shows Settings › Onkko's Phrases, On and Off,
  On by default. The choice is kept in a cookie, `wf_onkko`, for a year, and
  Disconnect forgets it with the account.
- Before Cetus the lines do not show and the setting is not offered.
- The splash and Connect come before any profile is read, so their lines
  always show.
- The menu also shows Language (English, Español) and Tutorial (Reset),
  disabled: they wait for later versions.

### BR-65 · The place card shows what is still to master, by kind

- Frame [`463:335` Place card, In progress](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=463-335).
- Type: content.
- Rule: while anything is left, the place card shows **Still to master here**
  and, for each Arsenal group that holds something left in reach, the
  group's game icon (BR-42) and how many of its items are still to master. No
  percentage and no other word: the icons say what is counted, and the app
  does the sums.
- What lies beyond reach is not counted here; the groups' ends count it
  (BR-61). A mastered place shows no row.
- The card counts items alone. It carried the place's nodes until
- Since the Material pass (T-27b) the place sits on the
  page (`Place overview`, `656:211`): the count is one chip per category,
  under the ring of its mastered share (spec 07).
- A label over a row of chips is read first, then the chips it names:
  "Still to master here", "Rank these to get there" and "Keep it to build"
  all sit above their chips. A figure keeps its caption
  under it ("13/19", "Items mastered"): the figure is what the eye lands on.
- Each chip opens its category's list for the place, on what is left, and
  its count reads in `--link`.

### BR-66 · Similar prerequisites share one row

- Frame [`677:12872` Item>Step by step — Quest](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=677-12872).
- Type: content.
- Rule: when Prerequisites holds more than one quest, they share one row,
  "Complete {n} quests", whose detail names them root first ("In this order:
  Natah and The Second Dream."); more than one Junction share one row too,
  "Clear {n} Junctions", whose detail names each with the planet it is on. A
  single quest or Junction keeps its own row. A "Reach" row whose Junction the
  Junctions row already names is dropped, and more than one place left to
  reach share one row, "Reach {n} places", naming each with the Junction that
  opens it when there is one (Ash's three Proxima). The Hex
  goes from seventeen rows to two.
- The row sits where the first of its kind stood. What the profile confirms is
  gathered apart from what is left (BR-88), so a plan can read "Complete 10
  quests", met, above "Complete The Deadlock Protocol". The lock (BR-63)
  reads the first Junction in the row the profile proves unmet.

### BR-67 · Every component opens its own page

opened the wiki while Nano Spores opened its own page.

- Type: content and behaviour.
- Rule: a row in Components opens the thing's own page in the app, and its
  description says where it comes from. The catalog keeps a resource when any
  source places it: a drop, a region, a vendor (its blueprint included), the
  wiki's "Location" or "Source", a sentence of the wiki that says how it is
  earned, or a recipe the catalog has. Its How to get says that source in the
  same order. A drop listed only as a bundle ("5X Fass Residue") counts when
  the resource has no drop or region of its own.
- A part of the thing itself is not a resource: it says it is a part, or the
  relics it opens from, and opens no page.
- What no source places keeps the wiki's prose and opens the wiki; the item
  sweep test names each one.

### BR-68 · A filter narrows and never hides why

- Frames [`752:4545` Plan — Advanced search](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=752-4545)
  and [`753:5217` Search — Filtered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=753-5217) (spec 12).
- Type: behaviour.
- Rule: a filter on the advanced search takes results out of the list; it
  never takes out the reason one is there. A result beyond the player's reach
  stays in the list with its gap (BR-62) unless **In my reach** is chosen. A
  state chosen (Not obtained, Ranking, Mastered) keeps only what the profile
  can tell that state of, so it leaves out places, quests and what has no
  rank.

## Feedback on a wait and a read

### BR-88 · An Alert is only for the app's own states

- Component [`947:159` Alert](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=947-159),
  its words in [`956:6488` Alert — Examples](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=956-6488).
- Type: content.
- Rule: an Alert (Error, Warning, Success, Informative) says what happened to
  the app or to a read: a read that failed, an id refused, a read that worked.
  It never carries a game fact or advice, such as "keep this weapon"; that
  goes in the screen's own parts, a hero, a chip or a heading (BR-61, BR-79).
- Its text is regular, `Body/Default`, never bold.

### BR-69 · A later read that fails keeps the player in place

- Frame [`943:5889` Profile — Stale read](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=943-5889)
  and the Warning state of `947:159` Alert, its words in [`956:6488` Alert —
  Examples](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=956-6488).
- Type: behaviour and content.
- Rule: when the twelve hours have passed and the next read fails, for any
  reason, the app keeps showing the profile it read last and tries again
  twelve hours after the failed try. Nothing sends the player back to
  `/connect`. Profile shows a Warning alert in place of the read cycle, under
  the player's name and rank: "Warframe didn't answer. You're seeing your
  data from 14 hours ago. We'll try again at 9:30 PM.".
  The age and the time follow BR-07: the time is the player's own, and the
  alert shows once the page has loaded.
- The failure is DE's, so the band blames no one and asks nothing of the
  player. It names no reason: whatever failed, the answer is the same wait.

### BR-70 · A read that worked says so, once

- The Success state of [`947:159` Alert](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=947-159),
  its words in [`956:6488` Alert — Examples](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=956-6488),
  drawn on [`943:6079` Toast — Updated](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=943-6079)
  and [`943:6161` Toast — Connected](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=943-6161),
  and on [`953:6536` Where to start — Connected for the first time](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=953-6536).
- Type: behaviour and content.
- Rule: a toast floats 12 px under the header or the top bar, across the
  column, on any screen of the shell. It leaves on its own after six seconds,
  held while the pointer or the focus is on it, or when tapped, and it shows once
  for each read, never again on a refresh or on going back.
- **Connected**, after Connect worked: "Welcome, {name}. Your profile is
  loaded." Not "Welcome back": the player has just given their id, and the
  app had nothing of theirs before.
- **Updated**, after the twelve-hour read worked: "Your profile is up to
  date. Onkko read it from Warframe just now." It shows on opening the app as
  well: any screen within a minute of that read shows it, since the screen that
  read DE may only have redirected.
- A failed read has no toast: BR-69's band in Profile says it. The demo never
  shows a toast, since it reads no account.

### BR-71 · Every wait longer than a moment shows the quill

- Frame [`675:5392` Onboarding — Loading](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=675-5392),
  the loading screen every wait shares.
- Type: behaviour.
- Rule: a link or a button that opens another screen, and every form that
  sends the player on (a demo, a month, Reset, Disconnect), covers the page
  with the loading screen once the wait passes 400 ms. A shorter wait shows
  nothing, so a quick screen never flickers. Connect keeps its own: the
  loading screen at once, since its wait is always DE's.

### BR-72 · Collection reads like an item

- Frames [`979:6517` Item>Step by step — Resource from any mission](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=979-6517),
  [`979:6676` Item>Step by step — Built
  resource](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=979-6676),
  [`979:6915` Item>Step by step —
  Relic](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=979-6915)
  and [`979:7074` Item>Step by step — Vaulted
  relic](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=979-7074).
- Type: content and ordering.
- Rule: a mod, an arcane, a relic, a resource or any other collection item
  builds its Step by step from the same routes and rows as an item:
- One node a row, with its rotations joined ("rotation B–C") and the
  best odds first, whether a mission, a bounty or an enemy drops it. Four
  ways at most, the first with a diamond and the rest reading "Or".
- A resource that any mission on a planet drops reads "Play any mission on
  {planet}" first, three planets at most, then its best drop.
- Prerequisites come from the first way only: the place to reach, its
  Junction or quest, and the standing a vendor asks.
- Something built in the foundry says where its blueprint comes from (the
  Market, the dojo's research, a drop, a vendor) before "Build it in your
  foundry". A recipe whose blueprint no source sells or drops is shown only
  when building it is the one way to get the thing: Control Module drops on
  three planets, so its catalog recipe is left out.
- A weekly mission the wiki names as the source reads "Play the Archon
  Hunt", "Play a Netracell" or "Play Deep Archimedea", with how often it resets
  (`weekly` in `sources.yaml`); an Archon's shard comes from its Archon Hunt,
  like a Sortie, not from "Defeat Archon Amar".
- A vaulted relic reads "Trade for it with another player", then Baro
  Ki'Teer when he has sold it.
- A title always says what to do; a thing's bare name is never a step.

### BR-73 · Every Wiki link opens a page the wiki has

led nowhere.

- Type: behaviour.
- Rule: `pnpm data:wiki-pages` asks the wiki whether every page a step links
  to or quotes exists, and keeps the answer in `wiki-pages.json`. When the wiki
  files a title a little differently, the command tries it again with small
  fixes ("of" in lower case, a roman numeral in capitals, " Relic" or a
  trailing "(Caches)" left out). A row whose page doesn't exist links to the
  page of what it is for, and the app never asks for a missing page's
  passage. The
  test `wiki-links.test.ts` fails on any link the file hasn't checked;
  `pnpm content:update` refreshes it with every Warframe update.

### BR-74 · A drop table's label is never a place to go

- Frame [`979:7226` Item>Step by step — Circuit reward](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=979-7226).
- Type: content.
- Rule: DE's drop tables name some rewards by their table, not by a place.
  The app says what the player does instead:
- Duviri's "Endless: Tier 6" reads "Play the Circuit" ("Play the Steel
  Path Circuit" for its Hard tables), with the tier in the detail: "A
  reward for reaching tier 6 of an Endless run, 1.03% each time, so about
  1 in 97 runs." It links to The Circuit.
- A node's "(Caches)" table reads "Open the caches on {node}", and its
  "(Extra)" table joins the node's own row.
- A Profit-Taker phase reads "Play the Profit-Taker bounty, phase 1".
- A drop that always comes reads "It drops every run.", never "100% a run".
  One that comes at least two times in three reads "so nearly every run".
- A table's "Rewards" is left out of the title, and its mode stays:
  "Play Nokko: Critter Liberation (Steel Path)".
  The test `step-words.test.ts` checks each of these on every plan.

### BR-75 · The update already chosen stays in the list, marked

- Frame [`982:6725` What's new>Updates — Selected](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=982-6725),
- Type: state.
- Rule: on Catch up and on Updates, the update What's new counts from stays
  in its place in the list and wears **Selected**: its art tinted slate at
  50% (`--state-selected-tint`) under a centred badge, slate-200 on slate-600
  with a slate-900 border (`Badge` Selected). **Newest** takes the same
  place, centred over the accent at 20% (`--accent-tint`). When the newest
  update is the one chosen, it reads Selected. Choosing it again keeps the
  same month. The card tells assistive technology it is the current choice
  (`aria-current`).
- The owner drew the badge's text in slate-400, which reads 3.1:1 on its
  ground; slate-200 reads 5.4:1, the AA minimum for text this small being
  4.5:1.

## Mastery Rank and Keep it

The other proposals went to the Archive page.

### BR-76 · The way to the next Mastery Rank is a goal

- Frames [`1001:7231` Goal>Step by step — Mastery Rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1001-7231),
  [`1009:7703` — Many to rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7703), [`1009:7862` — Nothing to rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7862) and
  [`1009:8025` — Test ready](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-8025).
- Type: behaviour.
- Rule: the goal reads the player's mastery from the profile and shows how far
  they are to the next rank, then the steps to get there. Its page sits under
  Plan's tab, at `/goals/rank`.
- Mastery comes from three readable parts, added up with the wiki's
  [Mastery Rank](https://wiki.warframe.com/w/Mastery_Rank) rules:
- each item in `XPInfo`: 100 points a rank for a weapon, 200 for a
  Warframe, a companion, an Archwing or a Necramech, up to the item's own
  max rank;
- each Star Chart node completed (`Missions`), worth the node's
  `MasteryExp` on the wiki's `Module:Missions/data`, and the same again
  when the Steel Path completed it (`Tier`);
- each rank of an Intrinsics tree (`PlayerSkills`), 1,500 points.
- A rank needs 2,500 × rank² points up to 30, and each Legendary rank 147,500
  more. Legendary 6 is the highest there is (read on 2026-11-02).
- The sum never falls below what the player's rank already proves. The
  catalog marks a few masterable items (amps, Venari) as not masterable, so
  the sum may run short; it is lifted to the rank's own threshold.
- The shortest way lists every source of mastery, the most mastery a piece
  first, in the accent with "(Most mastery)", the rest as "Or" alternatives
  : a new Necramech (8,000 at rank 40, only the ones never
  ranked), a new Warframe, companion or Archwing (6,000), a new
  weapon that ranks to 40 (4,000), a new weapon (3,000), the items the
  player already took part of the way (their mastery left, shared among
  them), Intrinsic ranks (1,500 each, while any are left) and Star Chart
  nodes not yet completed, Steel Path included. Each names how many close
  the gap, or says it only takes the player part of the way.
- The items named are the ones the player already took part of the way,
  most mastery left first, and only as many as close the gap.
- WFCD gives Necramechs no max rank; the catalog sets 40, the game's, from
  their `MechSuits` category (until then they counted to 30).
- The test is a step the game runs: the app never says the player passed.
  "What Rank {n} unlocks" counts the catalog's items that need exactly that
  rank and that the player never ranked.
- `XPInfo` lists every item the player ever ranked, sold ones too, so the copy
  says "You took them to ranks 12 and 18", never "in your arsenal".

### BR-77 · The rank is drawn as the Star Chart draws a place, in a square

- Component [`1007:390` Rank overview](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1007-390); frames
  [`1004:7696` Profile — Mastery Rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1004-7696), [`1009:7351` — Many to rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7351),
  [`1009:7440` — Nothing to rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7440), [`1009:7526` — Test ready](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7526) and
  [`1009:7612` — Highest rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7612).
- Type: state.
- Rule: the place card's ring (BR-65), made square because the wiki's art and
  the player's glyph are square. The frame is 152 px, its edge 5 px, the art
  120 px in the middle in a 2 px `--state-absent` line drawn inside it. The
  edge fills from the top centre, counter-clockwise as the Star Chart's
  does, with the share of the way to the next rank in `--state-rank`.
- Under it, the share in whole percent, never rounded up to 100, and
  "Progress to Rank {n}" on the goal. On Profile that line is the call to open
  the goal, and the figure says what it measures, "92% to Rank {n}" : "See the
  way", or "See the test" with a full bar.
- Many to rank: three `Item chip`s, the most mastery left first, then a
  More chip that counts the rest below max rank ("+4"), with "Rank these to
  get there" over the chips, so the label is read before what it names
  (it sat under them from 2026-11-02). Each item chip opens
  the item's page, so its name reads in `--link`, as
  every `Item chip` that opens something does; More opens nothing and keeps
  its grey.
- Nothing to rank, and a full bar, are empty states (BR-80): "Everything you
  own is at max rank", or "Ready for the Rank {n} test".
- The highest rank: the edge closes in `--state-mastered`, as a mastered
  place does, and reads "The highest rank there is", with nothing under it:
  reaching it is not an absence, so it has no empty state. Only Profile shows it,
  since the goal is gone at that rank.
- Profile wears the player's glyph in the square; the goal wears the wiki's
  icon of the rank it chases.
- Profile shows no chips and no empty state: the square and its share open
  the goal, and the share's line reads in `--link`. What to rank, and that the
  test is ready, are told on the goal and on Plan's card; "See the Rank {n} test"
  already says it on Profile.

### BR-78 · The Mastery Rank card leads Plan's suggestions

- Component [`1007:407` Rank card](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1007-407); frames [`1001:7542` Plan — Mastery Rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1001-7542),
  [`1009:7199` — Test ready](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7199) and [`1009:7275` — Highest rank](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7275).
- Type: ordering.
- Rule: the card comes before every other suggestion, since it is the one
  that always applies. It is the goal card's grammar with the rank's seal in
  place of the icon and its title in the accent.
- "Reach Mastery Rank {n}", with the items that take the player there
  ("Ranking Lex and Boltor takes you there.") or, when those are not enough,
  what a new weapon covers.
- With the bar full: "Take the Rank {n} test".
- At the highest rank there is no card, and the other suggestions move up.
- A profile with no `XPInfo` has no card: the app cannot tell the way.

### BR-79 · An item other recipes take says to keep it

- Component [`1007:238` Built into](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1007-238); frames
  [`1004:7902` Item>Overview — Keep it](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1004-7902), [`1009:7045` — One recipe mastered](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7045)
  and [`1009:7167` — Three recipes](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1009-7167).
- Type: content.
- Rule: under the hero, "Keep it to build", then one chip per recipe that
  takes the item, with how many it takes ("Akbolto ×2"). The game never says
  this, and selling the item loses it.
- A recipe the player has already mastered stays, dimmed (`Item chip` Done).
  When every recipe is mastered, the block is gone. Each chip opens the
  recipe's page.
- The profile cannot read copies, so the chip says what the recipe takes,
  never "you need 1 more".
- No item in the catalog feeds more than three recipes (Dual Skana, Bolto,
  Vasto and Viper feed three), so the block has no More chip.
- It is never an Alert: an Alert is for the app's own states.

### BR-80 · An empty state sits outside the card surface

- Component [`485:122` Empty state](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=485-122),
- Type: state.
- Rule: an empty state is not a card. It has no fill and a dashed `--line`
  border, with its icon, title and line centred, so an absence never reads as
  one more item. It applies to every empty state in the app.

### BR-81 · Space comes from the gap, never from a component's padding

- Components [`656:188` Place overview](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=656-188)
  and [`1007:390` Rank overview](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1007-390),
- Type: layout.
- Rule: a component without a surface has no vertical padding; the space
  around it is its container's gap. A component with a surface (a card, a
  row, an alert) keeps the padding inside it.
- Two gaps separate things on a screen: `--space-6` (16 px) between
  components, and `--space-7` (24 px) between large blocks, such as the
  search and the suggestions on Plan, the sections of an item page, or
  Profile's account and settings.
- The rows of Step by step keep `--space-7` between them, since each row
  carries a title and a passage of its own.

### BR-82 · A released app never runs on data it cannot read

- No frame: nothing is shown.
- Type: behaviour.
- Rule: the desktop app uses a new data set only after a server of its own
  version has read every file of it (`/api/data-check`). A set it cannot read
  is dropped, the app opens with the set it has, and it does not download
  that set again until its version changes.
- `main` publishes data only when every released version on the manifest's
  schema reads it. `pnpm data:compat` checks it, and the `data` workflow runs
  it on every pull request to `main`. When a release refuses the data, the
  schema is raised, and released apps keep their own set until they update.
- The route answers only in the app (`WF_EDITION=app`), never reads a
  profile, and on the demo site answers 404.

## Enemy drops and what Plan finds

### BR-83 · A drop from an enemy is never left out by missions

- Frame [`1066:7245` Item>Step by step — Enemy drop after missions](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1066-7245).
- Type: ordering and content.
- Rule: a collection item shows four ways at most, best odds first (BR-72).
  When those four hold no enemy and an enemy drops it at 0.5% a kill or more, the
  fourth way is that enemy's. It reads "Or defeat {enemy}", and its odds read
  per kill: "9.48% a kill, so about 1 in 11 kills."
- The floor is one number because no source says how often an enemy appears.
  DE's tables give each enemy's drop chance, not its spawn rate, and common
  enemies carry low chances, so the floor sits under 1% to keep them.
- A table with rotations is a mission, whatever its name: it reads "Play
  {it}", per run. Sunkiller is one.

### BR-84 · Plan finds what has a known source

- No frame of its own: it changes what the search finds, not how a result
  looks.
- Type: content.
- Rule: an entry of the catalog is searchable when any source says how to get
  it: a drop, a vendor, Baro, a recipe or `sources.yaml`. That brings in Primed
  mods, Archon Shards, Legendary Core, companion weapons, companion and Zaw
  parts, and Railjack weapons, whose drops name their house ("Zetki Apoc Mk I").
- The Drift mods come from the Halls of Ascension on Lua ("Pass the Cunning
  Test", Lua), and each Focus node from its school's tree ("Unlock it in the
  Naramon tree", Focus), the school read from the node's own path.
- Captura scenes, Conservation Tags and Ship Segments stay out.

### BR-85 · In Step by step, only Blueprints and Components carry art

- Frame [`662:7143` Item>Step by step](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=662-7143)
  and the `Step row` variants with art (`1087:7320`, `1087:7328`, `1087:7336`).
- Type: content.
- Rule: below the item's hero, art belongs to Blueprints (a flat list's rows, a
  part card's header) and Components. Every other row is words alone:
  Prerequisites, How to get and the steps inside a part's card, an enemy's
  included. Overview keeps its art.

## Progression walls

### BR-86 · Plan suggests the progression walls, one step at a time

- Frames [`1142:7324` Plan — Milestones](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1142-7324),
  [`1142:7408` — After The New War](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1142-7408),
  [`1142:7500` — After Jade Shadows](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1142-7500)
  and [`1165:8337` Plan>Milestones reached](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1165-8337).
- Type: content and ordering.
- Rule: the walls the wiki documents are suggestions on Plan. Each waits for
  what comes before it in the game, so a player sees the next steps and not
  the whole game at once, and each is gone once the profile proves it done.
  Several may open together; that is a player further along.
- Each card says what the player gets, the wiki's fact and not advice, and
  carries an icon no other card uses.

| Card                              | Waits for                                           | Opens                                                                  | Gone when                                                                 | Icon                      |
| --------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------- |
| Unlock the next planet            | Nothing                                             | The frontier                                                           | No junction is left                                                       | `flag`                    |
| Build a Necramech                 | Deimos reached                                      | The first Necramech the player lacks                                   | The player owns a Necramech                                               | `precision_manufacturing` |
| Build the Helminth                | Rank 3 with the Entrati (Associate), Mastery Rank 8 | The Helminth Segment's Step by step                                    | The player has used one of the Helminth's own abilities                   | `biotech`                 |
| Hunt a Kuva Lich                  | The War Within, Mastery Rank 5                      | The first Kuva weapon the player lacks                                 | The player owns a Kuva weapon or holds the Honoria for vanquishing a Lich | `target`                  |
| Play The New War                  | The War Within                                      | The quest's Step by step                                               | Nataruk, Kahl, the Zariman, the Sanctum Anatomica, Brutus or Pontis Tower | `swords`                  |
| Unlock The Steel Path             | Every junction                                      | The Steel Path's Step by step, naming the first place with a node left | A node shows a Steel Path clear                                           | `skull`                   |
| Hunt an Archon                    | The New War                                         | The Archon Hunt's Step by step, Veilbreaker among its prerequisites    | Kahl's Garrison                                                           | `diamond`                 |
| Play Jade Shadows                 | The New War                                         | The quest's Step by step                                               | Its Honoria, Brutus or Pontis Tower                                       | `dark_mode`               |
| Play Jade Shadows: Constellations | Jade Shadows                                        | The quest's Step by step                                               | Its Honoria, Pontis Tower, Pride, Wrath or War Prime                      | `auto_awesome`            |
| Play the Hex Quest                | Whispers in the Walls                               | The quest's Step by step                                               | The Hex's syndicate or Höllvania                                          | `auto_stories`            |

- The Steel Path asks for every node before The New War, Lua's and the Kuva
  Fortress's included, except the Mutalist Alad V and Jordas Golem
  assassinations and Brutus (the wiki's Steel Path page). The Void and Deimos
  count only if the wiki says so; it does not yet.
- A quest that awards an Honoria is proven by it: the profile lists the title
  challenge behind it in `ChallengeProgress` (`quest_evidence.yaml`,
  `title_rules`).
- The Helminth is proven by its own abilities (Empower, Rebuild Shields and
  the rest, under `/Lotus/Powersuits/PowersuitAbilities/Helminth` in
  `Stats.Abilities`), used once. A player who built it and never used one
  still sees the card: the segment itself, an infused ability (counted as the
  Warframe's own), the cyst, the Helminth Charger and an infested Warframe
  prove nothing, and the public profile carries no Archon Shards. The card
  stays until the player uses one, which a Helminth owner soon does.
- Which Warframe to subsume is left out: the wiki recommends none, and the
  rankings elsewhere are opinion that every update changes.
- A card the profile could never clear is not offered.
- Of `ChallengeProgress`, the stored profile keeps only the title challenges
  earned, and of `Stats` only the Helminth's abilities used (spec 11).
- The divider over the cards reads "Milestones".
- Under the cards, once one is done, a `List item` "Milestones reached",
  "{n} done", opens Plan>Milestones reached: every milestone the profile proves
  done, in the ladder's order (the order of `grafo.yaml`), each a
  `Milestone row` with its icon, its title and what it gave. The next planet
  reads "Every junction cleared." A quest's or a game mode's row opens its
  Step by step, a Necramech's or a Kuva Lich's the one the player owns, the
  next planet's the Star Chart. Rows sit `--space-4` apart.

## Mods

### BR-87 · A mod says what it does

- Frames [`1156:9487` Item>Overview — Mod — Point Strike](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1156-9487),
  [`1156:9543` — Serration](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1156-9543), [`1156:9599` — Intensify](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1156-9599),
  [`1156:9655` — Infected Clip](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1156-9655), [`1156:9711` — Berserker Fury](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1156-9711),
  [`1239:7362` — Hunter Adrenaline](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1239-7362), [`1239:7457` — Acid Shells](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1239-7457),
  [`1239:7552` — Aerial Ace](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1239-7552), [`1242:7907` — Aura — Growing Power](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1242-7907),
  [`1242:8001` — Lua challenge — Cunning Drift](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1242-8001) and [`1242:8107` — Focus tree — Affinity Spike](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1242-8107).
- Type: content.
- Rule: a mod's Overview carries its card and what each of its stats does.
- The kicker names the mod's category, from the game's type: "Mod
  Primary", "Mod Warframe", "Mod Melee". A type that is no category ("Mod
  Set Mod", "Focus Way") leaves the kicker at "Mod".
- Under the name, `Mod overview`: the mod's art, 200 px, in a 2 px frame
  the colour of its rarity, with what it costs at max rank and its
  polarity's symbol over the corner; under it one dot per rank and "Max rank
  5", both in `--state-rank`. An aura adds capacity instead, so its corner
  reads "+7". A Focus node has no capacity and no polarity, so its corner is
  empty.
- The rarity colours are the wiki's (Mod, Rarity): Common bronze `#dca156`,
  Uncommon silver `#cccccc`, Rare gold `#ffd01c`, Legendary platinum
  `#e6e6e6`, as `--rarity-common` to `--rarity-legendary`. The rarity comes
  from `@wfcd/items`, which files Primed, Galvanized, Amalgam and the other
  special mods under these four. A mod with no rarity takes the
  `--state-absent` frame.
- Before How to get, "What it does", one `Mod effect` per stat: the stat's
  family icon and what it does in plain words; the amount, tinted, and the
  stat in the accent; an Example, two `Compare bars` (Without, With it in the accent) and
  the sentence they draw; a note, with the info icon, on what is good to
  know. A triggered stat says its condition at the end of the note ("Only
  after a melee kill, lasts 10 s, twice at most."), and the example counts
  its stacks. An element names what it pairs into (`Element combo`).
- Every stat falls in one of nine families, each with its own icon: Damage
  `swords`, Critical `crisis_alert`, Status `flare`, Elements `science`,
  Abilities `bolt`, Survival `shield`, Speed `speed`, Handling `tune`, and
  Utility `extension` for the rest.
- The numbers are the mod's own at max rank, never its Flawed or Expert twin
  that shares its name. The example works from a typical value of the stat and
  follows how the stat stacks: critical chance grows the weapon's own, an
  element adds to the damage, a faction mod multiplies all of it.
- A curated stat always fills the whole `Mod effect`: what it does, the
  amount, the example and the note. A stat with no curated copy shows its
  family icon and the game's own words, with no amount, example or note.
  Curated copy is facts, never advice.
- A line the game writes in prose (an augment, an aura, a Focus node) fills
  the same `Mod effect` from the mod's own curated entry: what it does, the
  amount and what it counts, an example with its two bars, and the note.

### BR-88 · A met prerequisite stays, marked

- Frame [`1218:7495` Item>Step by step — Prerequisites met](https://www.figma.com/design/unteOMr3YYUIyBE6XF0AD6/Warframe?node-id=1218-7495).
- Type: behaviour.
- Rule: a Step by step is the steps that unlock the thing on screen, so it
  opens on Prerequisites whatever the thing is: an item, a quest, a game
  mode. Awakening, the game's first mission, is the one page without them.
- A prerequisite the profile proves met is not removed. It stays in the list
  and reads met: `Step row` State=Done (closed, its title in `--ink-dim`), a
  round `--fill-dim` marker in place of the diamond, and no line under it.
  It opens like any row. A screen reader hears "Done".
- Every prerequisite the profile can prove is read, on every Step by step:
  - the quests `quest_evidence.yaml` confirms, every quest before them and the
    Junctions they needed;
  - Mastery Rank, once the player's rank reaches it;
  - "Reach …" and "Clear the … Junction", once the profile has reached the
    place (the planet past the Junction);
  - "Join or create a clan", once the profile has a clan;
  - Railjack Intrinsics, once every Railjack discipline (Piloting, Gunnery,
    Tactical, Engineering, Command) reaches the rank;
  - a syndicate rank, once the profile's title with that syndicate reaches it
    (`syndicates` in `sources.yaml`).
- What the profile cannot prove stays open: a free slot, buying the
  blueprint, reaching a Relay, a syndicate the table does not name
  (Operational Supply), a quest no rule in `quest_evidence.yaml` proves.
- The met rows come first, then the ones left. `provenPlan()` marks them on
  the item page, after the plan is drafted.
- `tests/steps.test.ts` holds the rule for every quest and mode of the spine,
  with nothing confirmed and with every quest confirmed.
