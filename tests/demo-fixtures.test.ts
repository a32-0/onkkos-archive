import { describe, expect, it } from "vitest";

import { findNextPlanet } from "@/domain/graph/star-chart";
import { confirmedQuests } from "@/domain/narrative/evidence";
import { PROFILE_FIELDS } from "@/domain/profile/fields";
import { accountCreatedAt } from "@/domain/profile/payload";
import { trimProfile } from "@/domain/profile/trim";
import {
  DEMO_ACCOUNT_IDS,
  isDemoAccountId,
  loadFixtureProfile,
} from "@/infra/profile/fixture-source";
import { loadEvidenceRules } from "@/infra/narrative/evidence-load";

import { CY, fixture, testGraph } from "./helpers";

const ORDIS = "profile-ordis";
const allowed = new Set<string>(PROFILE_FIELDS);

describe("the two demos", () => {
  it("are the only ids that read a fixture whatever the source", () => {
    expect(Object.keys(DEMO_ACCOUNT_IDS)).toEqual(["cy", "ordis"]);
    expect(isDemoAccountId(DEMO_ACCOUNT_IDS.cy)).toBe(true);
    expect(isDemoAccountId(DEMO_ACCOUNT_IDS.ordis)).toBe(true);
    expect(isDemoAccountId("000000000000000000000003")).toBe(false);
  });

  it("each id reads its own fixture", () => {
    expect(loadFixtureProfile(DEMO_ACCOUNT_IDS.cy)?.DisplayName).toBe("Cy");
    expect(loadFixtureProfile(DEMO_ACCOUNT_IDS.ordis)?.DisplayName).toBe("Ordis");
  });

  it("carry only the fields the app reads, and no identity", () => {
    for (const profile of [fixture(CY), fixture(ORDIS)]) {
      for (const key of Object.keys(profile)) expect(allowed.has(key)).toBe(true);
      expect(Object.keys(profile.LoadOutInventory ?? {})).toEqual(["XPInfo"]);
      expect(profile.AccountId).toBeUndefined();
      expect(profile.PlatformNames).toBeUndefined();
      expect([true, undefined]).toContain(profile.GuildId);
      expect(trimProfile(profile)).toEqual(profile);
    }
  });

  it("Ordis stops at Mercury, is recent, and proves no quest past the cut", () => {
    const ordis = fixture(ORDIS);
    expect(ordis.PlayerLevel).toBe(2);
    expect(findNextPlanet(testGraph(), ordis).entry?.planet).toBe("Mars");
    expect(confirmedQuests(loadEvidenceRules(), ordis).size).toBe(0);
    expect(ordis.UnlockedOperator).toBeUndefined();
    expect(accountCreatedAt(ordis)?.getUTCFullYear()).toBe(2026);
  });
});
