import { describe, expect, it } from "vitest";

import { composing } from "@/ui/SuggestionList/keys";

describe("composing", () => {
  it("reads a key as part of a composition while the IME is open", () => {
    expect(composing({ nativeEvent: { isComposing: true }, keyCode: 13 })).toBe(true);
  });

  it("reads keyCode 229 as a composition when isComposing is already reset", () => {
    expect(composing({ nativeEvent: { isComposing: false }, keyCode: 229 })).toBe(true);
  });

  it("reads a plain Enter as the player's own", () => {
    expect(composing({ nativeEvent: { isComposing: false }, keyCode: 13 })).toBe(false);
  });
});
