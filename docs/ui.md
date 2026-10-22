# The screens, their routes and their links

The screens build what the frames draw
([BR-33](business-rules.md#br-33--the-build-looks-exactly-like-the-frames)),
at 390 px in the "App flows" section of the design file, and follow the width
classes of
[BR-39](business-rules.md#br-39--wider-than-the-frames-the-layout-follows-width-classes)
above it. [`cetus.md`](cetus.md) says why the system looks as it does. This
page is the structure under the screens: where each part lives, every route
with its spec and its frames, the rules that decide where a link goes, and
how much a screen shows.

## Where things live

- `src/app/`: the routes. A page reads the screen, asks `domain/` for the
  answer and hands it to a screen. A page holds no words.
- `src/screens/`: one folder per spec, the composition of `ui/` parts for it,
  and the view functions that turn the domain's values into rows.
- `src/ui/`: the Cetus design system, each component with its styles and its
  stories (plan part 3).
- `src/content/`: every word the player reads, as typed modules. A string with
  a value in it is a function.
- `src/routes.ts`: every address inside the app, built in one place.

## The routes

| Route                                     | Screen                                                                                    | Spec   | Frames                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `/`                                       | The splash, outside the shell                                                             | 01     | `661:4307` Start                                                                |
| `/connect`                                | The id form; it reads the profile before keeping the id, then goes where BR-03 says       | 02     | `661:4354` Onboarding, `675:5392` Loading, `662:6943` Error                     |
| `/features`                               | Two ways in: pick up where you left off, or set a goal                                    | 03     | `661:4591` Two Ways In                                                          |
| `/catch-up`                               | Resume, the update picker, with no month kept; the Summary once `wf_since` holds one      | 05, 06 | `662:4709` Resume, `662:4885` Summary and their states                          |
| `/catch-up/{category}`                    | What a category brought since the month, under the top bar                                | 06     | `662:5040` Summary>Warframes                                                    |
| `/catch-up/updates`                       | Every update, with Resume's search; opened from the Summary or from the map               | 06     | `662:6072` Summary>Updates                                                      |
| `/system?system=&place=`                  | The map: a place, what it holds for this player, its mastery and the update card          | 07     | `662:5177` Map, `662:6188` Map — Viewport                                       |
| `/system/{category}?system=&place=&view=` | What a category holds at the place, by lens (To get, Mastered, New)                       | 07     | `662:6837` Map>Warframes and its states                                         |
| `/system/places`, `/system/systems`       | The place list and the system list                                                        | 07     | `662:6528` Locations, `662:6556` Systems                                        |
| `/goals`                                  | Goal: the search and the goals offered                                                    | 08     | `662:4811` Goal and its states                                                  |
| `/search?q=&type=&state=&reach=&vaulted=` | The advanced search: a term and filters over the whole catalog                            | 12     | `753:4593` Search, `753:5217` Filtered, `753:5317` No match, `753:5351` Desktop |
| `/item?name=&from=&view=`                 | The one item page, Summary or Step by step (`view=steps`), for anything the catalog holds | 09, 10 | `662:5503` Item>Summary, `662:7143` Item>Step by step and their states          |
| `/profile?from=`                          | Who is connected, the settings, Disconnect                                                | 04     | `662:4642` Profile                                                              |
| `/api/profile/[accountId]`                | The proxy: the profile's display and the raw payload, as JSON                             | 11     |                                                                                 |
| `/api/search?q=`                          | Goal's eight suggestions                                                                  | 08     |                                                                                 |

`/`, `/connect` and `/features` render outside the shell. Every other screen
sits inside it: the header with the player chip on a tab's root, the top bar
on every page under a tab, and the three tabs (spec 04). A profile that cannot
be read sends the player to `/connect` with the band for its reason
([BR-38](business-rules.md#br-38--loading-and-errors-happen-on-the-id-form)).

## Which tab, and where Back goes

A page under a tab learns where it was opened from through its address
(`from=`), so the tab the player came from stays lit while they read it. Back
is the browser's back and returns to the screen the player came from, where
they were on it. When nothing in the app came before the page, Back goes to
the screen above it: a category to its menu, Updates to where it was opened,
the lists to the map, Profile and an item to the root of their tab, the
advanced search to Goal (spec 04).

## Where a link goes

- **A goal opens the steps of what it names**
  ([BR-37](business-rules.md#br-37--a-goal-opens-the-steps-of-what-it-names)):
  an item or a quest opens `/item` on Step by step, a place opens the map on
  it.
- **An item beyond reach opens on Step by step**
  ([BR-62](business-rules.md#br-62--a-search-shows-everything-and-says-the-gap)),
  so the first thing the player reads is the prerequisite in the way.
- **Our page before the wiki**
  ([BR-30](business-rules.md#br-30--a-thing-we-curate-links-to-our-page-not-the-wiki)).
  Anything the catalog holds links to its own `/item` page, and every
  component of a recipe opens its own page
  ([BR-67](business-rules.md#br-67--every-component-opens-its-own-page)).
  `isCatalogued()` decides, once per plan, and never for the item the page
  already shows.
- **The wiki for the rest**: quests, places, bosses, vendors and anything the
  app does not answer link to `wiki.warframe.com`. An item's or a resource's
  wiki link ends in `#Acquisition`, since the app's question is always where
  to get it; a quest's link comes from the narrative spine and has no anchor.
- **Two links to `warframe.com`**, both on `/connect`: the site to log in at,
  and `warframe.com/api/user-data`, the one place a player can read their own
  account id (spec 02).

## What the player answers, and where it is kept

The app asks only what it cannot read.

| Answer                           | Kept in                                         | Read by     |
| -------------------------------- | ----------------------------------------------- | ----------- |
| The account id                   | the `wf_account` cookie, a year, out of scripts | the server  |
| The month the player last played | the `wf_since` cookie, as `YYYY-MM`             | the server  |
| The last place opened            | the `wf_place` cookie, as `{system}/{place}`    | the server  |
| Whether Onkko speaks             | the `wf_onkko` cookie, a year (BR-64)           | the server  |
| A ticked component               | the browser, `wf:manual:item:{name}:{rowId}`    | the browser |

A tick is the player's own word, never read from the profile, which lists no
resources. `since` is a cookie because the server needs it while it renders
Resume, the Summary and the map's update card.

## How much a screen shows

Two things set it, and neither blocks the player.

**When they stopped playing.** `wf_since` sets how much the Summary holds: the
last update brings a handful of items, six years back brings hundreds. With
no month, Resume asks for one, and the map shows no New lens and no New tag.
A player who has not reached Venus is never asked (BR-03): they have no month
to measure from.

**What they can reach**
([BR-59](business-rules.md#br-59--what-the-player-can-reach)). Read from the
profile, never inferred, with one treatment per context:

- Exploring hides and counts. The map lists the places in reach
  ([BR-60](business-rules.md#br-60--the-map-lists-the-places-in-reach)), and a
  group shows what is in reach and counts the rest on one More line
  ([BR-61](business-rules.md#br-61--a-group-shows-what-is-in-reach-and-counts-the-rest)).
- A search shows everything and says the gap
  ([BR-62](business-rules.md#br-62--a-search-shows-everything-and-says-the-gap)),
  closest name first. On the advanced search, a filter narrows and never hides
  why ([BR-68](business-rules.md#br-68--a-filter-narrows-and-never-hides-why)).
- A plan dims and never hides
  ([BR-63](business-rules.md#br-63--a-plan-dims-what-waits-on-an-unmet-prerequisite)).

## The states of a step

Every row of Step by step is in one of four states, the same on every item
(spec 10):

| State     | Means                                                       | Treatment                                                           |
| --------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Open      | A step to read or to do                                     | Full contrast, its detail and the wiki's passage under it           |
| Collapsed | The player folded it for this visit                         | The title and a chevron pointing down; the fold is not kept         |
| Ticked    | A component the player marked as had                        | The box filled, the title struck through and dimmed, the row folded |
| Locked    | It waits on a prerequisite the profile proves unmet (BR-63) | Half opacity, open and readable, never hidden; it can be ticked     |

What the profile already proves is not a state: a quest the profile confirms
is left out of Prerequisites
([BR-28](business-rules.md#br-28--prerequisites-are-followed-to-the-root)).
An item has its own vocabulary, the hero's states of
[BR-17](business-rules.md#br-17--the-hero-card-shows-the-items-state-for-this-player):
Rank, Mastered, Not obtained and Not obtained Prime, or none when the profile
carries no `XPInfo`. [`system.md`](system.md) has the states of a place and a
quest.

## One item page

`/item` renders every item and collectible, wherever it is reached from, so
an item's answer is the same from the map, the Summary, Goal or the advanced
search. The Summary is Step by step in short form (`briefOf()`), so the two
never disagree. [`step-by-step.md`](step-by-step.md) and
[`scenario-guidelines.md`](scenario-guidelines.md) have the detail.

## Images

Item art comes from `cdn.warframestat.us`, place orbs and the game's icons
from the wiki, and the update art from DE. Plain `<img>` is used for each on
purpose, so nothing is proxied or rehosted through the app. A thing with no
art shows its name and an empty square on the drawn ground, never a broken
image ([BR-18](business-rules.md#br-18--every-image-sits-on-the-drawn-ground)).
