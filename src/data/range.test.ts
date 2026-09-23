import { describe, expect, it } from "vitest";

import { typedRange } from "./range.ts";

describe("typedRange", () => {
  it("returns a sequence of indices up to the limit", () => {
    expect(typedRange(5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("returns an empty array for a limit of 0", () => {
    expect(typedRange(0)).toEqual([]);
  });

  it("returns a single-element array for a limit of 1", () => {
    expect(typedRange(1)).toEqual([0]);
  });
});
