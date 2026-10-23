import { describe, expect, it } from "vitest";

import { DESKTOP } from "@/content/desktop";
import { SHELL } from "@/content/nav";

describe("the player's rank title (spec 04)", () => {
  it("names each rank as the wiki's Mastery Rank page does", () => {
    expect(SHELL.rankTitle(0)).toBe("Unranked");
    expect(SHELL.rankTitle(1)).toBe("Initiate");
    expect(SHELL.rankTitle(27)).toBe("Gold Sage");
    expect(SHELL.rankTitle(29)).toBe("Middle Master");
    expect(SHELL.rankTitle(30)).toBe("True Master");
  });

  it("counts the legendary ranks past True Master", () => {
    expect(SHELL.rankTitle(31)).toBe("Legendary 1");
    expect(SHELL.rankTitle(35)).toBe("Legendary 5");
  });
});

describe("the app's two starting frames (spec 13)", () => {
  it("say what Desktop — Starting and Desktop — Can't start draw", () => {
    expect(DESKTOP.opening).toBe("Onkko is opening the archive...");
    expect(DESKTOP.cantStart).toBe("Onkko's Archive couldn't start. Close it and open it again.");
    expect(DESKTOP.close).toBe("Close");
  });
});
