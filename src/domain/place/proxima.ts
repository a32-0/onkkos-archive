import type { PlaceRewards } from "@/domain/place/schema";

const RAILJACK_MISSION = "Skirmish";
const SUFFIX = / \((Caches|Extra)\)$/;
const PROXIMA = " Proxima";

const cache = new WeakMap<PlaceRewards, Map<string, Set<string>>>();

function railjackNodes(rewards: PlaceRewards): Map<string, Set<string>> {
  const cached = cache.get(rewards);
  if (cached) return cached;
  const out = new Map<string, Set<string>>();
  for (const [place, nodes] of Object.entries(rewards)) {
    for (const node of nodes) {
      if (node.mission !== RAILJACK_MISSION) continue;
      const set = out.get(place) ?? new Set<string>();
      set.add(node.node.replace(SUFFIX, ""));
      out.set(place, set);
    }
  }
  cache.set(rewards, out);
  return out;
}

export function proximaPlace(
  rewards: PlaceRewards,
  place: string,
  nodes: readonly string[],
  mission: string | null,
): string {
  if (place.endsWith(PROXIMA)) return place;
  const known = railjackNodes(rewards).get(place);
  const railjack =
    mission === RAILJACK_MISSION ||
    nodes.some((node) => known?.has(node.replace(SUFFIX, "")) === true);
  return railjack ? `${place}${PROXIMA}` : place;
}
