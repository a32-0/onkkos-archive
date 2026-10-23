import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import { askUpdates } from "@/infra/app-updates";

type Port = EventEmitter & { postMessage: (message: unknown) => void };
const host = process as { parentPort?: Port };

function portAnswering(answer: (id: string) => unknown): Port {
  const port = new EventEmitter() as Port;
  port.postMessage = (message) => {
    const { id } = message as { id: string };
    queueMicrotask(() => port.emit("message", { data: answer(id) }));
  };
  return port;
}

afterEach(() => {
  delete host.parentPort;
  vi.useRealTimers();
});

describe("Check asks the main process (spec 13, Updates)", () => {
  it("returns the main process's answer to its own question", async () => {
    host.parentPort = portAnswering((id) => ({
      kind: "updates",
      id,
      answer: { state: "downloading", version: "0.2.0" },
    }));
    await expect(askUpdates()).resolves.toEqual({ state: "downloading", version: "0.2.0" });
    expect(host.parentPort.listenerCount("message")).toBe(0);
  });

  it("ignores an answer to another question, then gives up after a minute", async () => {
    vi.useFakeTimers();
    host.parentPort = portAnswering(() => ({
      kind: "updates",
      id: "another",
      answer: { state: "current" },
    }));
    const asked = askUpdates();
    await vi.advanceTimersByTimeAsync(60_000);
    await expect(asked).resolves.toEqual({ state: "unreachable" });
  });

  it("reads an answer it does not know as unreachable", async () => {
    host.parentPort = portAnswering((id) => ({ kind: "updates", id, answer: { state: "later" } }));
    await expect(askUpdates()).resolves.toEqual({ state: "unreachable" });
  });

  it("answers unreachable outside the app, where no main process listens", async () => {
    await expect(askUpdates()).resolves.toEqual({ state: "unreachable" });
  });
});
