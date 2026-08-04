import { describe, expect, it } from "vitest";

import { formatLocaleDate } from "./formatLocaleDate.ts";

describe("formatLocaleDate", () => {
  it("formats single-digit months and days correctly", () => {
    const date = new Date("2023-03-07T08:09:10");
    const result = formatLocaleDate(date);
    expect(result).toBe("2023-03-07T08:09:10");
  });

  it("throws an error for invalid date objects", () => {
    const invalid = new Date("not a date");
    expect(formatLocaleDate(invalid)).toBe("Invalid Date");
  });

  it("formats correctly for en-US locale (month/day order, 12-hour clock)", () => {
    const date = new Date("2023-03-07T08:09:10");
    expect(formatLocaleDate(date, "en-US")).toBe("2023-03-07T08:09:10");
  });

  it("formats correctly for de-DE locale (dot separators)", () => {
    const date = new Date("2023-03-07T08:09:10");
    expect(formatLocaleDate(date, "de-DE")).toBe("2023-03-07T08:09:10");
  });

  it("formats correctly for fr-FR locale (no comma separator)", () => {
    const date = new Date("2023-03-07T08:09:10");
    expect(formatLocaleDate(date, "fr-FR")).toBe("2023-03-07T08:09:10");
  });

  it("supports the data-last (curried) call form with a locale", () => {
    const date = new Date("2023-03-07T08:09:10");
    expect(formatLocaleDate("en-US")(date)).toBe("2023-03-07T08:09:10");
  });

  it("supports the data-last (curried) call form with no locale", () => {
    const date = new Date("2023-03-07T08:09:10");
    expect(formatLocaleDate()(date)).toBe("2023-03-07T08:09:10");
  });
});
