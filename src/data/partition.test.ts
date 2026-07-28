import { describe, expect, it } from "vitest";

import { partition } from "./partition.ts";

describe("partition", () => {
  it("splits array into two groups based on predicate", () => {
    const nums = [1, 2, 3, 4, 5, 6];
    const [evens, odds] = partition(nums, n => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  it("returns empty false array when all items pass", () => {
    const nums = [2, 4, 6];
    const [passed, failed] = partition(nums, n => n % 2 === 0);
    expect(passed).toEqual([2, 4, 6]);
    expect(failed).toEqual([]);
  });

  it("returns empty true array when no items pass", () => {
    const nums = [1, 3, 5];
    const [passed, failed] = partition(nums, n => n % 2 === 0);
    expect(passed).toEqual([]);
    expect(failed).toEqual([1, 3, 5]);
  });

  it("handles empty array", () => {
    const result = partition([], x => x);
    expect(result).toEqual([[], []]);
  });

  it("passes index and array to predicate", () => {
    const items = ["a", "b", "c"];
    const indices: number[] = [];
    const arrays: (typeof items)[] = [];
    partition(items, (item, index, arr) => {
      indices.push(index);
      arrays.push(arr);
      return item === "b";
    });
    expect(indices).toEqual([0, 1, 2]);
    expect(arrays).toEqual([items, items, items]);
  });

  it("works with pipeable data-last style", () => {
    const nums = [1, 2, 3, 4, 5, 6];
    const partitionEvens = partition((n: number) => n % 2 === 0);
    const [evens, odds] = partitionEvens(nums);
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  it("works with objects", () => {
    const people = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 17 },
      { name: "Charlie", age: 25 },
      { name: "Diana", age: 16 },
    ];
    const [adults, minors] = partition(people, p => p.age >= 18);
    expect(adults).toEqual([
      { name: "Alice", age: 30 },
      { name: "Charlie", age: 25 },
    ]);
    expect(minors).toEqual([
      { name: "Bob", age: 17 },
      { name: "Diana", age: 16 },
    ]);
  });

  it("preserves original order within each group", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const [evens, odds] = partition(items, n => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6, 8]);
    expect(odds).toEqual([1, 3, 5, 7]);
  });
});
