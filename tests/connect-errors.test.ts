import { describe, expect, it } from "vitest";

import { connectError } from "@/content/onboarding";
import type { FailureReason } from "@/domain/types/profile";

const AT = Date.UTC(2026, 9, 14, 15, 30) / 1000;

const REASONS: Record<FailureReason, true> = {
  "invalid-id": true,
  "not-found": true,
  limited: true,
  throttled: true,
  "circuit-open": true,
  upstream: true,
  malformed: true,
};

describe("the band says one of five things (BR-38)", () => {
  it("gives every reason the proxy knows a message", () => {
    for (const reason of Object.keys(REASONS)) expect(connectError(reason, AT)).toBeTruthy();
  });

  it("says what is wrong with the id", () => {
    expect(connectError("invalid-id", null)).toBe(
      "An account ID is 24 characters: digits 0–9 and letters a–f.",
    );
    expect(connectError("not-found", null)).toBe(
      "No account answers to this ID. Copy it again from the gid cookie.",
    );
  });

  it("shares one message among the three ways Warframe is not answering", () => {
    const said = ["upstream", "throttled", "circuit-open"].map((reason) =>
      connectError(reason, AT),
    );
    expect(new Set(said).size).toBe(1);
    expect(said[0]).toBe(
      "Warframe isn't answering right now. Your ID is fine; try again at 15:30 UTC.",
    );
    expect(connectError("upstream", null)).toBe(
      "Warframe isn't answering right now. Your ID is fine; try again in a few minutes.",
    );
  });

  it("keeps an unreadable answer apart, since waiting does not fix it", () => {
    expect(connectError("malformed", AT)).toBe(
      "Warframe's answer came back in a form we can't read yet. Your ID is fine.",
    );
  });

  it("says when the next reading opens", () => {
    expect(connectError("limited", AT)).toBe(
      "You've had your two readings for now. The next opens at 15:30 UTC.",
    );
  });

  it("shows no band for a reason it does not know", () => {
    expect(connectError("teapot", AT)).toBeNull();
  });

  it("keeps the machine out of the band", () => {
    for (const reason of Object.keys(REASONS)) {
      expect(connectError(reason, AT)).not.toMatch(/\b\d{3}\b|circuit|refus/i);
    }
  });
});
