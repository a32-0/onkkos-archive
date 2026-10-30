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

describe("Profile's update states (spec 13)", () => {
  it("say what Profile — App — Check states draws", () => {
    expect(SHELL.downloading("0.2.0")).toBe("Downloading 0.2.0…");
    expect(SHELL.installsOnRestart("0.2.0")).toBe("0.2.0 installs on restart");
    expect(SHELL.restartNow).toBe("Restart now");
  });
});

describe("the app's two starting frames (spec 13)", () => {
  it("say what Desktop — Starting and Desktop — Can't start draw", () => {
    expect(DESKTOP.opening).toBe("Onkko is opening the archive...");
    expect(DESKTOP.cantStart).toEqual([
      "Onkko's Archive couldn't start.",
      "Please restart the app.",
    ]);
    expect(DESKTOP.restart).toBe("Restart");
  });
});
