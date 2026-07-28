import { pipeable } from "../functional/pipeable.ts";

/**
 * Splits an array into two groups based on a predicate function.
 * @template T The type of elements in the array.
 * @param {T[]} arr The array to partition.
 * @param {(item: T, index: number, arr: T[]) => boolean} predicate A function that returns truthy for items
 *   that should go in the first group, and falsy for the second.
 * @returns {[T[], T[]]} A tuple of two arrays: the first contains items where the predicate returned truthy,
 *   the second contains the rest. Both preserve the original order.
 */
export const partition = pipeable<{
  <T>(
    arr: T[],
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): [T[], T[]];
  <T>(
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): (arr: T[]) => [T[], T[]];
}>(
  <T>(
    arr: T[],
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): [T[], T[]] => {
    const out: [T[], T[]] = [[], []];
    for (const [i, item] of arr.entries()) {
      out[predicate(item, i, arr) ? 0 : 1].push(item);
    }
    return out;
  },
  ([arg]) => Array.isArray(arg)
);
