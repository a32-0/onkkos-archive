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
      line: "They are found in the Cambion Drift or owned by the player.",
    },
    unlock_1999: {
      title: "Play the Hex Quest",
      line: "The desperate hunt for Albrecht Entrati has led the Drifter to the city of Höllvania on December 31st, 1999.",
    },
  },
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
