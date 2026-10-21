"use client";

import { useSyncExternalStore } from "react";

export const FIRST = 5;
const MORE = 5;
const MORE_WIDE = 10;
const WIDE = "(min-width: 840px)";

function watchWide(change: () => void): () => void {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

export function useMore(): number {
  const wide = useSyncExternalStore(
    watchWide,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
  return wide ? MORE_WIDE : MORE;
}
