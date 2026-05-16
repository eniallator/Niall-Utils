import { describe, expect, it } from "vitest";

import { mapAccumulate, mapFilter, mapFind } from "./map";
import { Option } from "./option";

describe("mapFilter", () => {
  it("maps and filters out null/undefined", () => {
    const arr = [1, 2, 3, 4];
    const result = mapFilter(arr, n => (n % 2 === 0 ? n * 2 : null));
    expect(result).toEqual([4, 8]);
  });

  it("accepts Option.some and Option.none", () => {
    const arr = [1, 2, 3];
    const result = mapFilter(arr, n =>
      n > 1 ? Option.some(n * 10) : Option.none()
    );
    expect(result).toEqual([20, 30]);
  });

  it("returns empty array if all results are nullish", () => {
    const arr = [1, 2, 3];
    const result = mapFilter(arr, () => null);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty input array", () => {
    expect(mapFilter([], n => n)).toEqual([]);
  });
});

describe("mapFind", () => {
  it("returns first mapped value that is not null/undefined", () => {
    const arr = [1, 2, 3, 4];
    const result = mapFind(arr, n => (n > 2 ? n * 2 : null));
    expect(result).toBe(6);
  });

  it("returns first Option.some value", () => {
    const arr = [1, 2, 3];
    const result = mapFind(arr, n =>
      n === 2 ? Option.some(42) : Option.none()
    );
    expect(result).toBe(42);
  });

  it("returns null if no value is found", () => {
    const arr = [1, 2, 3];
    const result = mapFind(arr, () => null);
    expect(result).toBeNull();
  });

  it("returns null for empty input array", () => {
    expect(mapFind([], n => n)).toBeNull();
  });
});

describe("mapAccumulate", () => {
  it("accumulates state while mapping values", () => {
    const arr = [1, 2, 3, 4];
    const result = mapAccumulate(arr, 0, (acc, value) => [
      acc + value,
      acc + value,
    ]);
    expect(result).toEqual([1, 3, 6, 10]);
  });

  it("passes index and array into the callback", () => {
    const arr = [10, 20, 30];
    const result = mapAccumulate(arr, 0, (acc, value, index, values) => [
      acc + value,
      `${index}:${values.length}`,
    ]);
    expect(result).toEqual(["0:3", "1:3", "2:3"]);
  });

  it("returns an empty array for empty input", () => {
    expect(mapAccumulate([], 5, () => [0, "ignored"])).toEqual([]);
  });
});
