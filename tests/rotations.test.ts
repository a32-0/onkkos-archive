import { afterEach, describe, expect, it, vi } from "vitest";

import { catalogName, fetchVarzia, readVarzia } from "@/infra/worldstate/client";

const TRADER = {
  location: "Maroo's Bazaar (Mars)",
  expiry: "2026-10-29T18:00:00.000Z",
  inventory: [
    { uniqueName: "/Lotus/StoreItems/Powersuits/Ranger/IvaraPrime", ducats: 3, credits: null },
    { uniqueName: "/Lotus/StoreItems/Types/Game/Projections/T1", ducats: null, credits: 1 },
  ],
};

afterEach(() => vi.unstubAllGlobals());

describe("Varzia's live stock", () => {
  it("maps a store path onto the catalog's own uniqueName", () => {
    expect(catalogName("/Lotus/StoreItems/Powersuits/Ranger/IvaraPrime")).toBe(
      "/Lotus/Powersuits/Ranger/IvaraPrime",
    );
  });

  it("reads Regal Aya from ducats and Aya from credits", () => {
    expect(readVarzia(TRADER)?.offers).toEqual([
      { uniqueName: "/Lotus/Powersuits/Ranger/IvaraPrime", regalAya: 3, aya: null },
      { uniqueName: "/Lotus/Types/Game/Projections/T1", regalAya: null, aya: 1 },
    ]);
  });

  it("answers null rather than an empty stock when the payload is unreadable", () => {
    expect(readVarzia(null)).toBeNull();
    expect(readVarzia({ inventory: "nope" })).toBeNull();
  });

  it("reads the vault trader once, kept in Next's data cache for ten minutes", async () => {
    const fetch = vi.fn(async () => Response.json(TRADER));
    vi.stubGlobal("fetch", fetch);
    expect((await fetchVarzia())?.location).toBe("Maroo's Bazaar (Mars)");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.warframestat.us/pc/vaultTrader",
      expect.objectContaining({ cache: "force-cache", next: { revalidate: 600 } }),
    );
  });

  it("drops to no stock when the read fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 503 })),
    );
    expect(await fetchVarzia()).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect(await fetchVarzia()).toBeNull();
  });
});
