import "server-only";

import { randomUUID } from "node:crypto";

import type { UpdateState } from "@/domain/types/update-state";

interface ParentPort {
  postMessage(message: unknown): void;
  on(event: "message", listener: (event: { data: unknown }) => void): void;
  off(event: "message", listener: (event: { data: unknown }) => void): void;
}

const ASK_MS = 60_000;
const UNREACHABLE: UpdateState = { state: "unreachable" };

function parentPort(): ParentPort | null {
  return (process as { parentPort?: ParentPort }).parentPort ?? null;
}

function isState(value: unknown): value is UpdateState {
  const given = value as { state?: unknown; version?: unknown } | null;
  if (given?.state === "current" || given?.state === "unreachable") return true;
  return (
    (given?.state === "downloading" || given?.state === "ready") &&
    typeof given.version === "string"
  );
}

export function restartToUpdate(): void {
  parentPort()?.postMessage({ kind: "restart" });
}

export function askUpdates(): Promise<UpdateState> {
  const port = parentPort();
  if (!port) return Promise.resolve(UNREACHABLE);
  const id = randomUUID();
  return new Promise((resolve) => {
    const listen = ({ data }: { data: unknown }) => {
      const answer = data as { kind?: unknown; id?: unknown; answer?: unknown } | null;
      if (answer?.kind === "updates" && answer.id === id)
        done(isState(answer.answer) ? answer.answer : UNREACHABLE);
    };
    const timer = setTimeout(() => done(UNREACHABLE), ASK_MS);
    const done = (state: UpdateState) => {
      clearTimeout(timer);
      port.off("message", listen);
      resolve(state);
    };
    port.on("message", listen);
    port.postMessage({ kind: "updates", id });
  });
}
