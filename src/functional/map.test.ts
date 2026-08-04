import { describe, expect, it } from "vitest";

import { mapAccumulate, mapFilter, mapFind } from "./map.ts";
import { Option } from "./option.ts";

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

  it("supports the data-last (curried) call form", () => {
    const result = mapFilter((n: number) => (n % 2 === 0 ? n * 2 : null))([
      1, 2, 3, 4,
    ]);
    expect(result).toEqual([4, 8]);
  });

  it("throws immediately instead of silently dropping the callback when arr is undefined", () => {
    // @ts-expect-error intentionally passing undefined as arr
    expect(() => mapFilter(undefined, n => n)).toThrow();
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

  it("supports the data-last (curried) call form", () => {
    const result = mapFind((n: number) => (n > 2 ? n * 2 : null))([1, 2, 3, 4]);
    expect(result).toBe(6);
  });

  it("throws immediately instead of silently dropping the callback when arr is undefined", () => {
    // @ts-expect-error intentionally passing undefined as arr
    expect(() => mapFind(undefined, n => n)).toThrow();
  });
});

describe("mapAccumulate", () => {
  it("accumulates state while mapping values", () => {
    const arr = [1, 2, 3, 4];
    const result = mapAccumulate(
      arr,
      (acc, value) => [acc + value, acc + value],
      0
    );
    expect(result).toEqual([1, 3, 6, 10]);
  });

  it("passes index and array into the callback", () => {
    const arr = [10, 20, 30];
    const result = mapAccumulate(
      arr,
      (acc, value, index, values) => [acc + value, `${index}:${values.length}`],
      0
    );
    expect(result).toEqual(["0:3", "1:3", "2:3"]);
  });

  it("returns an empty array for empty input", () => {
    expect(mapAccumulate([], () => [0, "ignored"], 5)).toEqual([]);
  });

  it("supports the data-last (curried) call form", () => {
    const result = mapAccumulate(
      (acc: number, value: number) => [acc + value, acc + value],
      0
    )([1, 2, 3, 4]);
    expect(result).toEqual([1, 3, 6, 10]);
  });

  it("throws immediately instead of silently dropping the callback when arr is undefined", () => {
    const callback = (acc: number, value: number): [number, number] => [
      acc + value,
      value,
    ];
    expect(() =>
      // @ts-expect-error intentionally passing undefined as arr
      mapAccumulate(undefined, callback, 0)
    ).toThrow();
  });
});
