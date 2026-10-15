# Story progress from a profile that never lists quests

`src/domain/narrative/` reads what a player has done of Warframe's story using
only what the public profile exposes. Two readings are kept apart on purpose:
what the profile proves, and what the player could start.

## Evidence only confirms

`quest_evidence.yaml` holds rules of the form "if the profile shows X, quest
Y is done": a syndicate in `Affiliations[]`, a hub in `Missions[]`, a root
flag such as `UnlockedOperator`, a quest-exclusive item in
`LoadOutInventory.XPInfo`, or any star chart node of a mission type the
quest itself unlocks (matched against `warframe-worldstate-data`). Each rule
cites the wiki page that states the requirement.

`confirmedQuests()` evaluates them into a map of quest → proofs. A proof
carries the rule's `via` (which kind of clue matched) and its wiki `source`,
both for the model rather than for a screen: the screens only ever ask
whether a proof exists. A quest missing from the map is "not readable", never
"not done".

Two evidence sources are deliberately rejected:

- **Junction → quest rules.** Junction requirements have changed over the
  years (The Teacher on Venus in 2025, Rising Tide on Sedna in 2019), so a
  junction cleared in 2016 does not prove a quest added later.
- **Prerequisite chains.** The chain has been reordered several times and the
  profile cannot say when a quest was done, so implying earlier quests from
  later ones would invent facts for older accounts. The only implications
  kept have been true since the day the later quest shipped (Veilbreaker →
  The New War, Chimera Prologue → The Sacrifice).

Items audited and rejected as proof: Excalibur Umbra and Skiajati (handed
over in the penultimate mission of The Sacrifice), Sun & Moon (a Duviri
reward the Market also sells), and every quest-reward Warframe the Market
sells (Harrow, Octavia, Gara, Jade, Caliban, Cyte-09…). `XPInfo` only lists
items that have gained affinity, so an unused reward stays invisible.

Still unreadable and therefore asked: Awakening, Vor's Prize, The Teacher,
Saya's Vigil, Once Awake, Natah, Rising Tide, Chains of Harrow, Apostasy
Prologue, The Duviri Paradox, The Lotus Eaters, The Old Peace and the Jade
Shadows pair. DE's quest guide (`warframe.com/en/guides/quests`) tracks
completed quests for a logged-in player; the app links there and never
reads it.

## Access

`questAccess()` answers whether a quest can be **started**, from the planets
DE's quest guides name as its gate (`available_at` on the spine). A planet
counts as reached when its junction tag or any of its star chart nodes is
in `Missions[]`; accounts older than junctions (2016) carry the nodes
without the tag. Access never feeds the proofs map: a reachable gate says
the quest can be started, not that it was.

A profile whose `Missions[]` cannot be read has no readable access, as a
quest without a gate has none: `questAccess()` returns `null`, so what cannot
be read never reads as out of reach (BR-59). The frontier is not a reached
planet here: a quest on Venus starts once the Venus Junction is cleared, while
BR-59 already shows Venus to a player working towards it.

Quests gated by another quest, an Orbiter segment or a meeting carry no
`available_at`, because the profile cannot read those gates.
