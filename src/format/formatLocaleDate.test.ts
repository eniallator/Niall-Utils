import { describe, expect, it } from "vitest";

import { formatLocaleDate } from "./formatLocaleDate.ts";

describe("formatLocaleDate", () => {
  it("throws an error for invalid date objects", () => {
    const invalid = new Date("not a date");
    expect(formatLocaleDate(invalid)).toBeNull();
  });

  it.each<[string, Intl.LocalesArgument]>([
    ["single-digit months and days with the default locale", undefined],
    ["en-US locale (month/day order, 12-hour clock)", "en-US"],
    ["de-DE locale (dot separators)", "de-DE"],
    ["fr-FR locale (no comma separator)", "fr-FR"],
  ])("formats correctly for %s", (_description, locale) => {
    const date = new Date("2023-03-07T08:09:10");
    expect(formatLocaleDate(date, locale)).toBe("2023-03-07T08:09:10");
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
