import { describe, expect, it } from "vitest";

import { normalizeAccountId } from "@/domain/profile/account-id";

describe("normalizeAccountId", () => {
  it("accepts 24 hexadecimal characters, trimmed and lowercased", () => {
    expect(normalizeAccountId("  0123456789ABCDEF01234567 ")).toBe("0123456789abcdef01234567");
  });

  it("refuses anything else, so no request is built from it", () => {
    for (const value of [
      "",
      "0123456789abcdef0123456",
      "0123456789abcdef012345678",
      "g123456789abcdef01234567",
      "0123456789abcdef/1234567",
    ]) {
      expect(normalizeAccountId(value)).toBeNull();
    }
  });
});
