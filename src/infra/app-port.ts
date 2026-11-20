import "server-only";

export interface ParentPort {
  postMessage(message: unknown): void;
  on(event: "message", listener: (event: { data: unknown }) => void): void;
  off(event: "message", listener: (event: { data: unknown }) => void): void;
}

export function parentPort(): ParentPort | null {
  return (process as { parentPort?: ParentPort }).parentPort ?? null;
}
