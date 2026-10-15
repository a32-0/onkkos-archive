import { describe, expect, it } from "vitest";

import { accountCreatedAt, profileFromResponse } from "@/domain/profile/payload";

import { CY, fixture } from "./helpers";

describe("profileFromResponse", () => {
  it("returns Results[0] with the sibling Stats block attached", () => {
    const profile = profileFromResponse({
      Results: [{ DisplayName: "x" }],
      Stats: { MissionsCompleted: 3 },
    });
    expect(profile?.DisplayName).toBe("x");
    expect(profile?.Stats?.MissionsCompleted).toBe(3);
  });

  it("has no profile without Results", () => {
    expect(profileFromResponse({})).toBeNull();
    expect(profileFromResponse({ Results: [] })).toBeNull();
  });
});

describe("accountCreatedAt", () => {
  it("reads Mongo's extended-JSON date", () => {
    expect(accountCreatedAt(fixture(CY))?.toISOString()).toBe("2014-09-09T02:05:38.770Z");
  });

  it("returns null without Created", () => {
    expect(accountCreatedAt({})).toBeNull();
    expect(accountCreatedAt({ Created: "yesterday" })).toBeNull();
  });
});
