import { pipeable } from "../functional/pipeable.ts";

/**
 * Splits an array into two groups based on a predicate function. When the predicate is a type guard, the
 * two output arrays are typed accordingly: the narrowed type, and the rest.
 * @template T The type of elements in the array.
 * @template S The narrowed type when `predicate` is a type guard. Defaults to `T` for a plain predicate.
 * @param {T[]} arr The array to partition.
 * @param {(item: T, index: number, arr: T[]) => item is S | (item: T, index: number, arr: T[]) => boolean} predicate
 *   A function that returns truthy for items that should go in the first group, and falsy for the second.
 *   May be a type guard to narrow the first group's element type.
 * @returns {[S[], Exclude<T, S>[]]} A tuple of two arrays: the first contains items where the predicate
 *   returned truthy, the second contains the rest. Both preserve the original order.
 */
export const partition = pipeable<{
  <T, S extends T = T>(
    arr: T[],
    predicate: (item: T, index: number, arr: T[]) => item is S
  ): [S[], Exclude<T, S>[]];
  <T>(
    arr: T[],
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): [T[], T[]];
  <T, S extends T = T>(
    predicate: (item: T, index: number, arr: T[]) => item is S
  ): (arr: T[]) => [S[], Exclude<T, S>[]];
  <T>(
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): (arr: T[]) => [T[], T[]];
}>(
  <T, S extends T>(
    arr: T[],
    predicate:
      | ((item: T, index: number, arr: T[]) => item is S)
      | ((item: T, index: number, arr: T[]) => boolean)
  ): [S[], Exclude<T, S>[]] => {
    const out: [T[], T[]] = [[], []];
    for (const [i, item] of arr.entries()) {
      out[predicate(item, i, arr) ? 0 : 1].push(item);
    }
    return out as [S[], Exclude<T, S>[]];
  },
  ([arg]) => Array.isArray(arg)
);
