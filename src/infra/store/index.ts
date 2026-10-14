import "server-only";

import { memoryStore } from "./memory";
import type { Store } from "./store";
import { upstashStore } from "./upstash";

export function store(): Store {
  const shared = upstashStore();
  if (shared) return shared;
  if (process.env.NODE_ENV === "production" && process.env.WF_PROFILE_SOURCE === "live") {
    throw new Error("The shared store is not configured");
  }
  return memoryStore;
}
