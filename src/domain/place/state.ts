import type { Dossier } from "@/domain/catalog/dossier";
import { rankFromXp } from "@/domain/catalog/mastery";
import type { PlaceItem } from "@/domain/place/build";
import type { CatalogEntry } from "@/domain/place/catalog";
import type { RawProfile } from "@/domain/types/profile";

export type ItemState =
  | { kind: "done" }
  | { kind: "ranked"; rank: number; max: number }
  | { kind: "absent" }
  | { kind: "unknown" };

interface Completion {
  done: number;
  readable: number;
  unreadable: number;
}

type Ranks = ReadonlyMap<string, number> | null;

type Entries = ReadonlyMap<string, CatalogEntry>;

type Masterable = Pick<PlaceItem, "uniqueName" | "masterable" | "maxRank">;

export function itemRanks(profile: RawProfile, entries: Entries): Ranks {
  const xpInfo = profile.LoadOutInventory?.XPInfo;
  if (!Array.isArray(xpInfo) || xpInfo.length === 0) return null;

  const byUniqueName = new Map<string, { maxRank: number; affinityFactor: number }>();
  for (const entry of entries.values()) {
    if (entry.masterable && entry.uniqueName.length > 0) byUniqueName.set(entry.uniqueName, entry);
  }

  const ranks = new Map<string, number>();
  for (const entry of xpInfo) {
    const known = byUniqueName.get(entry.ItemType);
    if (!known) continue;
    ranks.set(entry.ItemType, rankFromXp(entry.XP ?? 0, known.affinityFactor, known.maxRank));
  }
  return ranks;
}

export function stateOf(item: Masterable, ranks: Ranks): ItemState {
  if (!item.masterable) return { kind: "unknown" };
  if (ranks === null) return { kind: "unknown" };

  const rank = ranks.get(item.uniqueName);
  if (rank === undefined) return { kind: "absent" };
  if (rank >= item.maxRank) return { kind: "done" };
  return { kind: "ranked", rank, max: item.maxRank };
}

export function stateByName(name: string, ranks: Ranks, entries: Entries): ItemState {
  const entry = entries.get(name);
  return entry ? stateOf(entry, ranks) : { kind: "unknown" };
}

export function completionOf(items: readonly Masterable[], ranks: Ranks): Completion {
  let done = 0;
  let readable = 0;
  let unreadable = 0;

  for (const item of items) {
    const state = stateOf(item, ranks);
    if (state.kind === "unknown") {
      unreadable += 1;
      continue;
    }
    readable += 1;
    if (state.kind === "done") done += 1;
  }

  return { done, readable, unreadable };
}

export function isComplete(completion: Completion): boolean {
  return completion.readable > 0 && completion.done === completion.readable;
}

export function relatedStates(
  view: Dossier,
  ranks: Ranks,
  entries: Entries,
): Record<string, ItemState> {
  return Object.fromEntries(
    [...view.builtFrom, ...view.usedIn].map((entry) => [
      entry.name,
      stateByName(entry.name, ranks, entries),
    ]),
  );
}
