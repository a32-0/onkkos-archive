import { useMemo, useSyncExternalStore } from "react";

const CHANGED = "wf:manual-answers-changed";
const PREFIX = "wf:manual:";
const YES = "yes";
const SEPARATOR = "\n";
const NOTHING = "";

function keyOf(scope: string, id: string): string {
  return `${PREFIX}${scope}:${id}`;
}

function read(scope: string, ids: readonly string[]): string {
  try {
    return ids
      .filter((id) => window.localStorage.getItem(keyOf(scope, id)) === YES)
      .join(SEPARATOR);
  } catch {
    return NOTHING;
  }
}

function subscribe(listener: () => void): () => void {
  window.addEventListener(CHANGED, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGED, listener);
    window.removeEventListener("storage", listener);
  };
}

export function writeTick(scope: string, id: string, on: boolean): void {
  try {
    if (on) window.localStorage.setItem(keyOf(scope, id), YES);
    else window.localStorage.removeItem(keyOf(scope, id));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function useTicks(scope: string, ids: readonly string[]): ReadonlySet<string> {
  const joined = ids.join(SEPARATOR);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => read(scope, joined.split(SEPARATOR)),
    () => NOTHING,
  );
  return useMemo(() => new Set(snapshot === NOTHING ? [] : snapshot.split(SEPARATOR)), [snapshot]);
}
