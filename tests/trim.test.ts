import { gzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import { toDisplayProfile } from "@/domain/profile/display";
import { PROFILE_FIELDS } from "@/domain/profile/fields";
import { regionsPlayed, nodeCountsByPlace } from "@/domain/profile/nodes";
import { accountCreatedAt } from "@/domain/profile/payload";
import { trimProfile } from "@/domain/profile/trim";
import type { RawProfile } from "@/domain/types/profile";

import { CY, fixture, NEW_PLAYER } from "./helpers";

const SYNTHETIC: RawProfile = {
  AccountId: { $oid: "000000000000000000000009" },
  DisplayName: "Synthetic",
  ActiveAvatarImageType: "/Lotus/Types/StoreItems/AvatarImages/ImageCephalonCy",
  PlatformNames: ["Synthetic"],
  PlayerLevel: 12,
  GuildId: { $oid: "000000000000000000000010" },
  GuildName: "Synthetic Clan",
  Created: { $date: { $numberLong: "1600000000000" } },
  Missions: [{ Tag: "SolNode27", Completes: 2, Tier: 1 }],
  Affiliations: [{ Tag: "CetusSyndicate", Standing: 100, Title: 2 }],
  LoadOutInventory: {
    XPInfo: [{ ItemType: "/Lotus/Powersuits/Excalibur/Excalibur", XP: 900000 }],
    Suits: [{ ItemType: "/Lotus/Powersuits/Excalibur/Excalibur" }],
    WeaponSkins: [{ ItemType: "/Lotus/Upgrades/Skins/Example" }],
  },
  PlayerSkills: { LPS_PILOTING: 3 },
  ChallengeProgress: [{ Name: "Example", Progress: 1 }],
  UnlockedOperator: true,
  Stats: { MissionsCompleted: 4 },
};

const PROFILES: [string, RawProfile][] = [
  ["Cy", fixture(CY)],
  ["the new player", fixture(NEW_PLAYER)],
  ["a synthetic profile with every field", SYNTHETIC],
];

describe("trimProfile", () => {
  it("keeps the nine fields and nothing else", () => {
    const trimmed = trimProfile(SYNTHETIC);
    expect(Object.keys(trimmed).sort()).toEqual([...PROFILE_FIELDS].sort());
  });

  it("keeps that the player has a clan, never which", () => {
    expect(trimProfile(SYNTHETIC).GuildId).toBe(true);
    expect(trimProfile(fixture(NEW_PLAYER)).GuildId).toBeUndefined();
  });

  it("keeps XPInfo alone inside LoadOutInventory", () => {
    expect(trimProfile(SYNTHETIC).LoadOutInventory).toEqual({
      XPInfo: SYNTHETIC.LoadOutInventory?.XPInfo,
    });
  });

  it("stores Cy, gzipped and base64-encoded, in at most 16,000 characters", () => {
    const stored = gzipSync(JSON.stringify(trimProfile(fixture(CY)))).toString("base64");
    expect(stored.length).toBeLessThanOrEqual(16_000);
  });
});

describe.each(PROFILES)("every reading of %s is the same once trimmed", (_, whole) => {
  const trimmed = trimProfile(whole);

  it("the name and the Mastery Rank", () => {
    expect(toDisplayProfile(trimmed)).toEqual(toDisplayProfile(whole));
  });

  it("the account's creation", () => {
    expect(accountCreatedAt(trimmed)).toEqual(accountCreatedAt(whole));
  });

  it("the nodes run, per place", () => {
    expect(nodeCountsByPlace(trimmed)).toEqual(nodeCountsByPlace(whole));
  });

  it("the regions played", () => {
    expect(regionsPlayed(trimmed)).toEqual(regionsPlayed(whole));
  });
});
