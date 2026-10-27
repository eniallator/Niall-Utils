import type { FillTuple } from "../core/tuple.ts";
import { raise } from "../core/utils.ts";
import { pipeable } from "../functional/pipeable.ts";
import { positiveMod } from "./maths.ts";

/**
 * Slides a fixed-size window over an array, returning a tuple for each window position. By default the
 * windows wrap around the end of the array (`circular`), so one starts at every `step`th index; with
 * `circular` off, only windows that fit entirely within the array are produced. Throws if `windowSize` is negative or
 * `step` isn't greater than `0`. Pipeable: call as `slidingWindow(arr, windowSize, start?, step?, circular?)`
 * or `slidingWindow(windowSize, start?, step?, circular?)(arr)`.
 */
export const slidingWindow = pipeable<{
  /**
   * Returns a fixed-length tuple for each window position.
   * @template T The type of the array's elements.
   * @template S The window size.
   * @param {readonly T[]} arr The array to slide over.
   * @param {S} windowSize The number of elements in each window. Must be non-negative.
   * @param {number} [start] The index to start the first window at (can be negative when `circular` is `true`). Defaults to `0`.
   * @param {number} [step] How many elements to advance between windows. Must be greater than `0`. Defaults to `1`.
   * @param {boolean} [circular] Whether windows wrap around past the end of the array back to the start. When `false`, the last window stops once it would run past the array's end. Defaults to `true`.
   * @returns {FillTuple<T, S>[]} An array of fixed-length `windowSize` tuples, one per window position.
   * @throws {Error} If `windowSize` is negative or `step` isn't greater than `0`.
   */
  <T, S extends number>(
    arr: readonly T[],
    windowSize: S,
    start?: number,
    step?: number,
    circular?: boolean
  ): FillTuple<T, S>[];
  /**
   * Data-last form of {@link slidingWindow}, for use in `pipe`/`Array.prototype.map`/etc.
   * @template S The window size.
   * @param {S} windowSize The number of elements in each window. Must be non-negative.
   * @param {number} [start] The index to start the first window at (can be negative when `circular` is `true`). Defaults to `0`.
   * @param {number} [step] How many elements to advance between windows. Must be greater than `0`. Defaults to `1`.
   * @param {boolean} [circular] Whether windows wrap around past the end of the array back to the start. When `false`, the last window stops once it would run past the array's end. Defaults to `true`.
   * @returns {<T>(arr: readonly T[]) => FillTuple<T, S>[]} A function sliding the window over the array it's given.
   * @throws {Error} If `windowSize` is negative or `step` isn't greater than `0`.
   */
  <S extends number>(
    windowSize: S,
    start?: number,
    step?: number,
    circular?: boolean
  ): <T>(arr: readonly T[]) => FillTuple<T, S>[];
}>(
  <T, S extends number>(
    arr: readonly T[],
    windowSize: S,
    start: number = 0,
    step: number = 1,
    circular: boolean = true
  ): FillTuple<T, S>[] => {
    if (windowSize < 0)
      raise(new Error(`windowSize must be non-negative, got ${windowSize}`));
    if (step <= 0) raise(new Error(`step must be greater than 0, got ${step}`));

    const end = circular ? arr.length : arr.length - windowSize + 1;
    const output: FillTuple<T, S>[] = [];
    for (let i = 0; i < end; i += step) {
      output.push(
        Array.from({ length: windowSize }, (_, j) =>
          circular
            ? arr[positiveMod(start + i + j, arr.length)]
            : arr[start + i + j]
        ) as FillTuple<T, S>
      );
    }
    return output;
  },
  ([first]) => Array.isArray(first)
);
