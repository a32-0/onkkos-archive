import { readFileSync } from "node:fs";
import path from "node:path";

import type { Graph } from "@/domain/graph/schema";
import { profileFromResponse } from "@/domain/profile/payload";
import type { RawProfile, RawProfileResponse } from "@/domain/types/profile";
import { loadGraph } from "@/infra/graph/load";

const root = process.cwd();

export const VETERAN = "profile-veteran";
export const NEW_PLAYER = "profile-new-player";
export const CY = "profile-cy";

export function testGraph(): Graph {
  return loadGraph();
}

export function fixture(name: string): RawProfile {
  const raw = JSON.parse(
    readFileSync(path.join(root, "fixtures", `${name}.json`), "utf8"),
  ) as RawProfileResponse;
  const profile = profileFromResponse(raw);
  if (!profile) throw new Error(`Fixture ${name} has no Results[0]`);
  return profile;
}
