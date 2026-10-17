import { describe, expect, it } from "vitest";

import { metOnkko, onkkoSpeaks } from "@/domain/profile/onkko";
import { trimProfile } from "@/domain/profile/trim";

import { fixture } from "./helpers";

describe("Onkko speaks once the player has reached Cetus (BR-64)", () => {
  it("knows Cetus from the hub or the Plains in the profile's missions", () => {
    expect(metOnkko(fixture("profile-cy"))).toBe(true);
    expect(metOnkko(fixture("profile-ordis"))).toBe(true);
    expect(metOnkko(fixture("profile-veteran"))).toBe(true);
    expect(metOnkko(fixture("profile-new-player"))).toBe(false);
  });

  it("keeps the hub and the Plains through the profile's trim", () => {
    expect(metOnkko(trimProfile(fixture("profile-veteran")))).toBe(true);
    expect(metOnkko(trimProfile({ Missions: [{ Tag: "CetusHub4", Completes: 1 }] }))).toBe(true);
    expect(metOnkko(trimProfile({ Missions: [{ Tag: "SolNode228", Completes: 1 }] }))).toBe(true);
    expect(metOnkko(trimProfile({ Missions: [{ Tag: "SolNode27", Completes: 1 }] }))).toBe(false);
  });

  it("counts a profile it cannot read as reached (BR-59)", () => {
    expect(metOnkko({})).toBe(true);
  });

  it("speaks by default, and not when turned off or before Cetus", () => {
    const cy = fixture("profile-cy");
    expect(onkkoSpeaks(cy, null)).toBe(true);
    expect(onkkoSpeaks(cy, "on")).toBe(true);
    expect(onkkoSpeaks(cy, "off")).toBe(false);
    expect(onkkoSpeaks(fixture("profile-new-player"), "on")).toBe(false);
  });
});
