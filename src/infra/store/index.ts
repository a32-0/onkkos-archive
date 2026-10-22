import "server-only";

import { fileStore } from "./file";
import { memoryStore } from "./memory";
import type { Store } from "./store";

const opened = new Map<string, Store>();

export function store(): Store {
  const file = process.env.WF_STORE_FILE;
  if (file) {
    let kept = opened.get(file);
    if (!kept) {
      kept = fileStore(file);
      opened.set(file, kept);
    }
    return kept;
  }
  if (process.env.NODE_ENV === "production" && process.env.WF_PROFILE_SOURCE === "live") {
    throw new Error("The store file is not configured");
  }
  return memoryStore;
}
