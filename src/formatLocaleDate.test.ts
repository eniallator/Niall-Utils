import { describe, expect, it } from "vitest";

import { formatLocaleDate } from "./formatLocaleDate";

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
});
