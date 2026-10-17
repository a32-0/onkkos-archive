import { ENGINE } from "./engine";

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

export const MAP = {
  show: "Show",
  toGet: "To get",
  mastered: "Mastered",
  new: "New",
  newItems: "New items",
  changeLocation: "Change location",
  changeSystem: "Change system",
  items: "Items",
  fraction: (done: number, total: number) => `${done}/${total}`,
  progress: (place: string) => `Items mastered on ${place}`,
  rank: (rank: number, max: number) => `Rank ${rank}/${max}`,
  count: (count: number) => `${count} New`,
  arsenal: "Arsenal",
  collection: "Collection",
  groups: {
    warframes: { name: "Warframes", one: "warframe", many: "warframes" },
    primary: { name: "Primary", one: "primary weapon", many: "primary weapons" },
    secondary: { name: "Secondary", one: "secondary weapon", many: "secondary weapons" },
    melee: { name: "Melee", one: "melee weapon", many: "melee weapons" },
    archgun: { name: "Archgun", one: "archgun", many: "archguns" },
    archmelee: { name: "Archmelee", one: "archmelee", many: "archmelees" },
    amp: { name: "Amp", one: "amp", many: "amps" },
    companion: { name: "Companion", one: "companion", many: "companions" },
    necramech: { name: "Necramech", one: "Necramech", many: "Necramechs" },
    archwing: { name: "Archwing", one: "Archwing", many: "Archwings" },
    railjack: { name: "Railjack", one: "Railjack item", many: "Railjack items" },
    resources: { name: "Resources", one: "resource", many: "resources" },
    relics: { name: "Relics", one: "relic", many: "relics" },
    mods: { name: "Mods", one: "mod", many: "mods" },
    arcanes: { name: "Arcanes", one: "arcane", many: "arcanes" },
    incarnons: { name: "Incarnons", one: "Incarnon", many: "Incarnons" },
    ephemera: { name: "Ephemera", one: "Ephemera", many: "Ephemera" },
    honoria: { name: "Honoria", one: "Honoria", many: "Honorias" },
  },
  nothingLeft: (place: string) => `Nothing left on ${place}`,
  nothingLeftLine: "Every item it gives is mastered. Choose another place from the card above.",
  emptyLens: {
    left: (place: string) => ({
      title: `Nothing left to get on ${place}`,
      line: "You have everything it gives so far. What it adds later shows up here.",
    }),
    mastered: (place: string) => ({
      title: `Nothing mastered on ${place} yet`,
      line: "What you master from this place shows up here.",
    }),
    new: (place: string) => ({
      title: `Nothing new on ${place}`,
      line: "No item from this place came out after the update you chose.",
    }),
  },
  places: "Places",
  search: "Search a planet, location or celestial body...",
  searchLabel: "Search the places",
  noPlace: "No place by that name",
  noPlaceLine: (system: string, query: string) =>
    `None of ${system}’s places is called “${query}”. Try another system.`,
  startHere: "Start here",
  junctionGap: (from: string, to: string) => `Clear ${ENGINE.junctionAt(from, to)}, to reach it.`,
  clanGap: "Join a clan to enter its Dojo.",
  morePlaces: (count: number, next: { from: string; to: string } | null, clan: boolean) =>
    next === null
      ? `${count} more ${plural(count, "place opens", "places open")} when you join a clan.`
      : `${count} more ${plural(count, "place opens", "places open")} as you clear the junctions${clan ? " and join a clan" : ""}. Next: ${ENGINE.junctionAt(next.from, next.to)}.`,
  systems: "Systems",
  chooseSystem: "Choose a system",
  switchAnyTime: "You can switch at any time.",
  soon: "Soon™",
  moreSystems: (count: number) =>
    `${count} more ${plural(count, "system opens", "systems open")} as you go further.`,
} as const;
