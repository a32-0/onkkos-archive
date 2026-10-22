import type { CATALOGUES } from "@/content/goals";
import { ADVANCED } from "@/content/search";
import { advancedRoute } from "@/routes";

import type { SearchInput, Standing } from "../goals/state";
import { orderedInputs, searchRows } from "../goals/view";
import type { SearchFilters, SearchPageView, TypeGroup } from "./state";

export const PAGE = 20;

const STANDINGS: readonly Standing[] = ["absent", "ranked", "done"];

export const TYPE_GROUPS: Readonly<Record<TypeGroup, readonly (keyof typeof CATALOGUES)[]>> = {
  warframes: ["warframes"],
  weapons: [
    "primary",
    "secondary",
    "melee",
    "archgun",
    "archmelee",
    "amp",
    "incarnon",
    "incarnons",
  ],
  companions: ["companion"],
  vehicles: ["archwing", "necramech", "railjack"],
  mods: ["mods"],
  arcanes: ["arcanes"],
  relics: ["relics"],
  resources: ["resources"],
  other: ["ephemera", "honoria", "other"],
  places: ["place"],
  quests: ["quest"],
};

const GROUPS = Object.keys(TYPE_GROUPS) as TypeGroup[];

const isGroup = (value: string): value is TypeGroup => (GROUPS as string[]).includes(value);
const isStanding = (value: string | null): value is Standing =>
  value !== null && (STANDINGS as string[]).includes(value);

export function parseFilters(read: (name: string) => string | null): SearchFilters {
  const types = (read("type") ?? "").split(",").filter(isGroup);
  const state = read("state");
  const shown = Number.parseInt(read("shown") ?? "", 10);
  return {
    term: read("q") ?? "",
    types: GROUPS.filter((group) => types.includes(group)),
    state: isStanding(state) ? state : null,
    reach: read("reach") === "1",
    vaulted: read("vaulted") === "hide",
    shown: Number.isFinite(shown) && shown > PAGE ? shown - (shown % PAGE) : PAGE,
  };
}

export function searchHref(filters: SearchFilters): string {
  return advancedRoute({
    q: filters.term.trim() || null,
    type: filters.types.length > 0 ? filters.types.join(",") : null,
    state: filters.state,
    reach: filters.reach ? "1" : null,
    vaulted: filters.vaulted ? "hide" : null,
    shown: filters.shown > PAGE ? String(filters.shown) : null,
  });
}

export function chosen(filters: SearchFilters): string[] {
  return [
    ...filters.types.map((group) => ADVANCED.types[group]),
    ...(filters.state ? [ADVANCED.states[filters.state]] : []),
    ...(filters.reach ? [ADVANCED.reach] : []),
    ...(filters.vaulted ? [ADVANCED.vaulted] : []),
  ];
}

export function cleared(filters: SearchFilters): SearchFilters {
  return { term: filters.term, types: [], state: null, reach: false, vaulted: false, shown: PAGE };
}

export function toggledType(filters: SearchFilters, group: TypeGroup): SearchFilters {
  const types = filters.types.includes(group)
    ? filters.types.filter((one) => one !== group)
    : GROUPS.filter((one) => one === group || filters.types.includes(one));
  return { ...filters, types, shown: PAGE };
}

export function matches(input: SearchInput, filters: SearchFilters): boolean {
  if (
    filters.types.length > 0 &&
    !filters.types.some((group) => TYPE_GROUPS[group].includes(input.catalogue))
  ) {
    return false;
  }
  if (filters.state !== null && input.standing !== filters.state) return false;
  if (filters.reach && input.gap !== null) return false;
  if (filters.vaulted && input.vaulted) return false;
  return true;
}

export function searchPage(inputs: readonly SearchInput[], filters: SearchFilters): SearchPageView {
  const found = orderedInputs(inputs.filter((input) => matches(input, filters)));
  return {
    rows: searchRows(found.slice(0, filters.shown)),
    total: found.length,
    more: found.length > filters.shown,
  };
}
