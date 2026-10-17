import { describe, expect, it } from "vitest";

import { describeMonth, isYearMonth, shortMonth, sinceFrom, toYearMonth } from "@/domain/since";

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

describe("Resume's months (BR-08, BR-43)", () => {
  const NOW = new Date("2026-10-15T12:00:00Z");

  it("writes an update's month short, with the year", () => {
    expect(shortMonth("2026-03")).toBe("Mar, 2026");
  });

  it("takes a month", () => {
    expect(sinceFrom("2026-03", NOW)).toBe("2026-03");
    expect(sinceFrom(" 2025-12 ", NOW)).toBe("2025-12");
  });

  it("refuses a day, a future month and anything else", () => {
    expect(sinceFrom("2025-12-24", NOW)).toBeNull();
    expect(sinceFrom("2026-11", NOW)).toBeNull();
    expect(sinceFrom("2026-13", NOW)).toBeNull();
    expect(sinceFrom("March", NOW)).toBeNull();
    expect(sinceFrom(null, NOW)).toBeNull();
  });
});
