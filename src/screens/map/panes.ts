"use client";

import { useSyncExternalStore } from "react";

const PANES = "(min-width: 1200px)";

function watchPanes(change: () => void): () => void {
  const query = window.matchMedia(PANES);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

export function usePanes(): boolean {
  return useSyncExternalStore(
    watchPanes,
    () => window.matchMedia(PANES).matches,
    () => false,
  );
}
