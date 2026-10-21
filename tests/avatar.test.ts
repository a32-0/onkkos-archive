import { describe, expect, it } from "vitest";

import { avatarOf, glyphArt } from "@/domain/profile/avatar";
import { trimProfile } from "@/domain/profile/trim";
import { glyphImages } from "@/infra/catalog/items";

const CY = "/Lotus/Types/StoreItems/AvatarImages/ImageCephalonCy";
const ORDIS = "/Lotus/Types/StoreItems/AvatarImages/AvatarImageConqueraOrdis";

describe("the player's glyph (spec 04)", () => {
  it("draws the active glyph from the catalog's art", () => {
    const art = glyphImages();
    expect(avatarOf({ ActiveAvatarImageType: CY }, art)).toBe(
      "https://cdn.warframestat.us/img/CyGlyph.png",
    );
    expect(avatarOf({ ActiveAvatarImageType: ORDIS }, art)).toBe(
      "https://cdn.warframestat.us/img/ConqueraOrdisGlyph.png",
    );
  });

  it("keeps the square when the profile names no glyph, or one the catalog lacks", () => {
    const art = glyphArt([{ uniqueName: CY, imageName: "CyGlyph.png" }, { uniqueName: "x" }]);
    expect(avatarOf({}, art)).toBeNull();
    expect(avatarOf({ ActiveAvatarImageType: "/Lotus/Unknown" }, art)).toBeNull();
    expect(art.has("x")).toBe(false);
  });

  it("keeps the glyph through the profile's trim", () => {
    expect(trimProfile({ ActiveAvatarImageType: CY }).ActiveAvatarImageType).toBe(CY);
  });
});
