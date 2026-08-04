import { describe, expect, it } from "vitest";

import { zip } from "./zip.ts";

describe("zip", () => {
  it("zips arrays of equal length", () => {
    const a = [1, 2];
    const b = ["x", "y"];
    const c = [true, false];
    expect(zip(a, b, c)).toEqual([
      [1, "x", true],
      [2, "y", false],
    ]);
  });

  it("zips empty arrays", () => {
    expect(zip([], [])).toEqual([]);
    expect(zip([], [], [])).toEqual([]);
  });

  it("preserves each array's element type when given readonly array arguments", () => {
    // Regression test: ZippedItem used to fail to unwrap readonly array inputs to their element type,
    // silently leaving the whole array type in place instead — this wouldn't compile if that regressed.
    const a: readonly [string, number][] = [
      ["x", 1],
      ["y", 2],
    ];
    const b: readonly number[] = [10, 20];

    const result = zip(a, b).map(([[key, weight], n]): [string, number] => [
      key,
      weight + n,
    ]);

    expect(result).toEqual([
      ["x", 11],
      ["y", 22],
    ]);
  });

  it("throws if arrays are of different lengths", () => {
    expect(() => zip([1, 2], ["a"])).toThrow("Zip index out of bounds");
    expect(() => zip([1], ["a", "b"], [true])).toThrow(
      "Zip index out of bounds"
    );
  });
});
