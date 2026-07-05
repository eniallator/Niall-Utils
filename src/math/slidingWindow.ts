import { pipeable } from "../functional/pipeable.ts";
import { positiveMod } from "./maths.ts";

import type { FillTuple } from "../core/tuple.ts";

/**
 * Slides a fixed-size window over an array, returning a tuple for each window position. Pipeable: call as
 * `slidingWindow(arr, windowSize, step?, start?, circular?)` or
 * `slidingWindow(windowSize, step?, start?, circular?)(arr)`.
 * @template T The type of the array's elements.
 * @template S The window size.
 * @param {readonly T[]} arr The array to slide over.
 * @param {S} windowSize The number of elements in each window.
 * @param {number} [step] How many elements to advance between windows. Defaults to `1`.
 * @param {number} [start] The index to start the first window at (can be negative when `circular` is `true`). Defaults to `0`.
 * @param {boolean} [circular] Whether windows wrap around past the end of the array back to the start. When `false`, the last window stops once it would run past the array's end. Defaults to `true`.
 * @returns {FillTuple<T, S>[]} An array of fixed-length `windowSize` tuples, one per window position.
 */
export const slidingWindow = pipeable<{
  <T, S extends number>(
    arr: readonly T[],
    windowSize: S,
    step?: number,
    start?: number,
    circular?: boolean
  ): FillTuple<T, S>[];
  <S extends number>(
    windowSize: S,
    step?: number,
    start?: number,
    circular?: boolean
  ): <T>(arr: readonly T[]) => FillTuple<T, S>[];
}>(
  <T, S extends number>(
    arr: readonly T[],
    windowSize: S,
    step: number = 1,
    start: number = 0,
    circular: boolean = true
  ): FillTuple<T, S>[] => {
    const end = circular ? arr.length : arr.length - windowSize;
    const output: FillTuple<T, S>[] = [];
    for (let i = 0; i < end; i += step) {
      output.push(
        new Array(windowSize)
          .fill(undefined)
          .map(
            (_, j) => arr[positiveMod(start + i + j, arr.length)]
          ) as FillTuple<T, S>
      );
    }
    return output;
  },
  ([first]) => Array.isArray(first)
);
