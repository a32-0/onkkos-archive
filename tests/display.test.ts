import { describe, expect, it } from "vitest";

import { toDisplayProfile } from "@/domain/profile/display";

describe("toDisplayProfile", () => {
  it("drops the platform glyph the game draws after a name", () => {
    expect(toDisplayProfile({ DisplayName: "Tenno" }).displayName).toBe("Tenno");
  });

  it("keeps no name when the glyph is all there is", () => {
    expect(toDisplayProfile({ DisplayName: " " })).not.toHaveProperty("displayName");
  });

  it("leaves a name without the glyph as it is", () => {
    expect(toDisplayProfile({ DisplayName: "Tenno" }).displayName).toBe("Tenno");
  });
});
