const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isYearMonth(value: unknown): value is string {
  return typeof value === "string" && YEAR_MONTH.test(value);
}

export function toYearMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function describeMonth(yearMonth: string, locale = "en-US"): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1)).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
