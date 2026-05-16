import { describe, expect, it } from "vitest";

import { slidingWindow } from "./slidingWindow";

describe("slidingWindow", () => {
  it("produces circular sliding windows with default options", () => {
    const result = slidingWindow([1, 2, 3, 4], 3);
    expect(result).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 1],
      [4, 1, 2],
    ]);
  });

  it("respects the step value when stepping through the array", () => {
    const result = slidingWindow([1, 2, 3, 4, 5], 2, 2);
    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 1],
    ]);
  });

  it("supports a custom start offset", () => {
    const result = slidingWindow(["a", "b", "c", "d"], 2, 1, 2);
    expect(result).toEqual([
      ["c", "d"],
      ["d", "a"],
      ["a", "b"],
      ["b", "c"],
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(slidingWindow([], 3)).toEqual([]);
  });

  it("does not wrap past the end when non-circular", () => {
    const result = slidingWindow([1, 2, 3], 2, 1, 0, false);
    expect(result).toEqual([[1, 2]]);
  });

  it("returns no windows when non-circular and the array is too short", () => {
    expect(slidingWindow([1], 2, 1, 0, false)).toEqual([]);
  });

  it("supports negative start offsets by wrapping backwards", () => {
    expect(slidingWindow([1, 2, 3], 2, 1, -1)).toEqual([
      [3, 1],
      [1, 2],
      [2, 3],
    ]);
  });
});
