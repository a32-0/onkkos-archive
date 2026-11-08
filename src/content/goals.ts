import { ENGINE } from "./engine";

export const GOALS = {
  title: "Plan",
  lead: "Search for anything you want, or take a suggestion. Onkko lays out the steps in order.",
  search: {
    title: "Search for anything",
    line: "Warframes, weapons, companions, mods, arcanes, relics, resources, quests and places.",
    placeholder: "A warframe, a weapon, or planet...",
    label: "Search for anything",
    list: "Results",
    noMatch: "Nothing by that name.",
    continue: "Continue",
  },
  cards: {
    unlock_next_planet: {
      title: "Unlock the next planet",
      line: (from: string, to: string) =>
        `Clear ${ENGINE.junctionAt(from, to)}, to open the next planet.`,
    },
    build_necramech: {
      title: "Build a Necramech",
      line: "A war machine of your own to pilot in the open landscapes, Empyrean missions and Albrecht's Laboratories.",
    },
    unlock_1999: {
      title: "Play the Hex Quest",
      line: "Cyte-09's blueprint, the Atomicycle, and Höllvania's missions and bounties.",
    },
    play_new_war: {
      title: "Play The New War",
      line: "The Nataruk bow, and the way to Jade Shadows, Veilbreaker and the Zariman.",
    },
    play_jade_shadows: {
      title: "Play Jade Shadows",
      line: "Jade's blueprint, and Ascension on Uranus, where her parts and Evensong drop.",
    },
    play_constellations: {
      title: "Play Jade Shadows: Constellations",
      line: "Sirius & Orion's blueprint, and Uranus Proxima, where their parts drop.",
    },
    hunt_archon: {
      title: "Hunt an Archon",
      line: "Archon Shards, which raise a Warframe's stats for good.",
    },
    unlock_steel_path: {
      title: "Unlock The Steel Path",
      line: "Enemies 100 levels higher, twice the mods and resources, and Steel Essence for Teshin's shop.",
    },
    build_helminth: {
      title: "Build the Helminth",
      line: "Lets a Warframe swap one of its abilities for another Warframe's.",
    },
    hunt_kuva_lich: {
      title: "Hunt a Kuva Lich",
      line: "A Kuva weapon, a stronger version of a Grineer one, with an element of its own.",
    },
  },
  suggestions: "Milestones",
  empty: {
    title: "Nothing left to suggest",
    line: "You've done every suggestion. Search above for anything else.",
  },
  skip: "Skip",
} as const;

export const CATALOGUES = {
  warframes: "Warframe",
  primary: "Primary",
  secondary: "Secondary",
  melee: "Melee",
  archgun: "Archgun",
  archmelee: "Archmelee",
  amp: "Amp",
  companion: "Companion",
  necramech: "Necramech",
  archwing: "Archwing",
  railjack: "Railjack",
  resources: "Resource",
  relics: "Relic",
  mods: "Mod",
  arcanes: "Arcane",
  incarnons: "Incarnon",
  ephemera: "Ephemera",
  honoria: "Honoria",
  incarnon: "Incarnon",
  other: "Item",
  place: "Place",
  quest: "Quest",
} as const;

export const GAPS = {
  rank: (need: number, have: number) => `Needs Mastery Rank ${need}, you are ${have}`,
  junction: (from: string, to: string) => `Clear ${ENGINE.junctionAt(from, to)}`,
  clan: "Join a clan",
  join: (catalogue: string, gap: string) => `${catalogue} · ${gap}`,
} as const;
