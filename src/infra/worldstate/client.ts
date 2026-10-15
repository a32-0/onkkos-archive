import "server-only";

import type { VarziaStock } from "@/domain/catalog/checks";

const VAULT_TRADER = "https://api.warframestat.us/pc/vaultTrader";
const TIMEOUT_MS = 8_000;
const REVALIDATE_SECONDS = 600;
const STORE_SEGMENT = "/StoreItems/";

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function catalogName(storeName: string): string {
  return storeName.replace(STORE_SEGMENT, "/");
}

export function readVarzia(raw: unknown): VarziaStock | null {
  if (!raw || typeof raw !== "object") return null;
  const trader = raw as Record<string, unknown>;
  if (!Array.isArray(trader.inventory)) return null;
  const offers: VarziaStock["offers"] = [];
  for (const entry of trader.inventory as unknown[]) {
    if (!entry || typeof entry !== "object") continue;
    const offer = entry as Record<string, unknown>;
    if (typeof offer.uniqueName !== "string") continue;
    offers.push({
      uniqueName: catalogName(offer.uniqueName),
      regalAya: numberOrNull(offer.ducats),
      aya: numberOrNull(offer.credits),
    });
  }
  return {
    location: typeof trader.location === "string" ? trader.location : null,
    expiry: typeof trader.expiry === "string" ? trader.expiry : null,
    offers,
  };
}

export async function fetchVarzia(): Promise<VarziaStock | null> {
  try {
    const response = await fetch(VAULT_TRADER, {
      cache: "force-cache",
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return readVarzia(await response.json());
  } catch {
    return null;
  }
}
