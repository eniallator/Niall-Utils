import { pipeable } from "../functional/pipeable.ts";

/**
 * Splits an array into two groups based on a predicate function. When the predicate is a type guard, the
 * two output arrays are typed accordingly: the narrowed type, and the rest. Both groups preserve the
 * original order. Pipeable: call as `partition(arr, predicate)` or `partition(predicate)(arr)`.
 */
export const partition = pipeable<{
  /**
   * Splits by a type guard, narrowing the first group.
   * @template T The type of elements in the array.
   * @template S The narrowed type asserted by `predicate`.
   * @param {T[]} arr The array to partition.
   * @param {(item: T, index: number, arr: T[]) => item is S} predicate Type guard returning `true` for items that belong in the first group.
   * @returns {[S[], Exclude<T, S>[]]} A tuple of the items that passed the guard and the rest, both preserving the original order.
   */
  <T, S extends T = T>(
    arr: T[],
    predicate: (item: T, index: number, arr: T[]) => item is S
  ): [S[], Exclude<T, S>[]];
  /**
   * Splits by a plain predicate.
   * @template T The type of elements in the array.
   * @param {T[]} arr The array to partition.
   * @param {(item: T, index: number, arr: T[]) => boolean} predicate Returns truthy for items that belong in the first group, and falsy for the second.
   * @returns {[T[], T[]]} A tuple of the items where the predicate returned truthy and the rest, both preserving the original order.
   */
  <T>(
    arr: T[],
    predicate: (item: T, index: number, arr: T[]) => boolean
  ): [T[], T[]];
  /**
   * Data-last form of the type guard overload.
   * @template T The type of elements in the array.
   * @template S The narrowed type asserted by `predicate`.
   * @param {(item: T, index: number, arr: T[]) => item is S} predicate Type guard returning `true` for items that belong in the first group.
   * @returns {(arr: T[]) => [S[], Exclude<T, S>[]]} A function partitioning the array it's given into the narrowed items and the rest.
   */
  <T, S extends T = T>(
    predicate: (item: T, index: number, arr: T[]) => item is S
  ): (arr: T[]) => [S[], Exclude<T, S>[]];
  /**
   * Data-last form of the plain predicate overload.
   * @template T The type of elements in the array.
   * @param {(item: T, index: number, arr: T[]) => boolean} predicate Returns truthy for items that belong in the first group, and falsy for the second.
   * @returns {(arr: T[]) => [T[], T[]]} A function partitioning the array it's given into the truthy and falsy items.
   */
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
