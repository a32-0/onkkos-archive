import type { WikiNode } from "@/domain/catalog/wiki";
import type { GraphGoal } from "@/domain/graph/schema";
import type { RawProfile } from "@/domain/types/profile";

export function placeWithNodesLeft(
  goal: Pick<GraphGoal, "places" | "skipNodes">,
  nodes: readonly WikiNode[],
  profile: RawProfile,
): string | null {
  const skip = new Set(goal.skipNodes);
  const cleared = new Set(
    (profile.Missions ?? []).flatMap((mission) =>
      mission?.Tag && (mission.Completes ?? 0) > 0 ? [mission.Tag] : [],
    ),
  );
  return (
    goal.places.find((place) =>
      nodes.some(
        (node) =>
          node.planet === place &&
          node.tag !== null &&
          node.mastery > 0 &&
          !skip.has(node.tag) &&
          !cleared.has(node.tag),
      ),
    ) ?? null
  );
}
