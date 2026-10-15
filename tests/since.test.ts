import { describe, expect, it } from "vitest";

import { describeMonth, isYearMonth, toYearMonth } from "@/domain/since";

describe("year-month helpers", () => {
  it("isYearMonth accepts YYYY-MM and nothing else", () => {
    expect(isYearMonth("2019-11")).toBe(true);
    expect(isYearMonth("2019-13")).toBe(false);
    expect(isYearMonth("2019-11-22")).toBe(false);
    expect(isYearMonth(undefined)).toBe(false);
  });

  it("toYearMonth and describeMonth round-trip a date", () => {
    expect(toYearMonth(new Date(Date.UTC(2019, 10, 22)))).toBe("2019-11");
    expect(describeMonth("2019-11")).toBe("November 2019");
  });
});
