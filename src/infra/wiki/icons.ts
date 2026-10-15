import "server-only";

import { fetchWikiFileUrls } from "@/infra/wiki/client";

type IconMap = Readonly<Record<string, string>>;

const WHITE = (name: string) => `Icon${name}(xWhite).png`;

const GROUP_ICONS = {
  quests: WHITE("Quest"),
  warframes: WHITE("CategoryWarframe"),
  weapons: WHITE("CategoryRifle"),
  companions: WHITE("Sentinel"),
  vehicles: WHITE("Archwing"),
  arcanes: WHITE("Arcane"),
  relics: WHITE("ProjectionT3"),
  mods: WHITE("Upgrade"),
  resources: WHITE("Treasures"),
  gear: WHITE("Grenade"),
  parts: WHITE("CategoryModular"),
} as const;

const MARK_ICONS = {
  mastered: WHITE("Mastered"),
  owned: WHITE("Owned"),
  locked: WHITE("Locked"),
  mastery: WHITE("MasteryRankLocked"),
  operator: WHITE("Operator"),
  warning: WHITE("Warning"),
} as const;

async function iconsFor(files: readonly (readonly [string, string])[]): Promise<IconMap> {
  const urls = await fetchWikiFileUrls(files.map(([, file]) => file));
  const map: Record<string, string> = {};
  for (const [key, file] of files) {
    const url = urls.get(file);
    if (url) map[key] = url;
  }
  return map;
}

export function gameIcons(): Promise<IconMap> {
  return iconsFor([...Object.entries(GROUP_ICONS), ...Object.entries(MARK_ICONS)]);
}

export function placeIcons(names: readonly string[]): Promise<IconMap> {
  return iconsFor(names.map((name) => [name, `${name}.png`] as const));
}
