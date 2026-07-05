import { Option } from "./option.ts";
import { pipeable } from "./pipeable.ts";

import type { OptionType } from "./option.ts";

type MapFn<I, O extends NonNullable<unknown>> = (
  val: I,
  index: number,
  arr: readonly I[]
) => Option<O, OptionType> | O | null | undefined;

const isOption: (
  value: unknown
) => value is Option<NonNullable<unknown>> = value => value instanceof Option;

/**
 * Maps every element of an array with a callback and drops any result that is `null`, `undefined`, or an
 * {@link Option} that resolves to one of those — combining `Array.prototype.map` and
 * `Array.prototype.filter` into a single pass. Pipeable: call as `mapFilter(arr, callback)` or
 * `mapFilter(callback)(arr)`.
 * @template I The type of the input array's elements.
 * @template O The non-nullable type of the mapped output.
 * @param {readonly I[]} arr The array to map over.
 * @param {MapFn<I, O>} callback Maps each element to an output value, an {@link Option}, or a nullish value to drop it.
 * @returns {O[]} The mapped, non-nullish results.
 */
export const mapFilter = pipeable<{
  <I, O extends NonNullable<unknown>>(
    arr: readonly I[],
    callback: MapFn<I, O>
  ): O[];
  <I, O extends NonNullable<unknown>>(
    callback: MapFn<I, O>
  ): (arr: readonly I[]) => O[];
}>(
  <I, O extends NonNullable<unknown>>(
    arr: readonly I[],
    callback: MapFn<I, O>
  ): O[] => {
    const output: O[] = [];
    for (let i = 0; i < arr.length; i++) {
      const itemOrOpt = callback(arr[i] as I, i, arr);
      const item = isOption(itemOrOpt) ? itemOrOpt.getOrNull() : itemOrOpt;
      if (item != null) output.push(item);
    }
    return output;
  },
  ([first]) => Array.isArray(first)
);

/**
 * Maps each element of an array with a callback, returning the first non-nullish mapped result (unwrapping
 * an {@link Option} if one is returned), similarly to combining `Array.prototype.map` with
 * `Array.prototype.find`. Pipeable: call as `mapFind(arr, callback)` or `mapFind(callback)(arr)`.
 * @template I The type of the input array's elements.
 * @template O The non-nullable type of the mapped output.
 * @param {readonly I[]} arr The array to search.
 * @param {MapFn<I, O>} callback Maps each element to an output value, an {@link Option}, or a nullish value to skip it.
 * @returns {O | null} The first non-nullish mapped result, or `null` if none was found.
 */
export const mapFind = pipeable<{
  <I, O extends NonNullable<unknown>>(
    arr: readonly I[],
    callback: MapFn<I, O>
  ): O | null;
  <I, O extends NonNullable<unknown>>(
    callback: MapFn<I, O>
  ): (arr: readonly I[]) => O | null;
}>(
  <I, O extends NonNullable<unknown>>(
    arr: readonly I[],
    callback: MapFn<I, O>
  ): O | null => {
    for (let i = 0; i < arr.length; i++) {
      const outOrOpt = callback(arr[i] as I, i, arr);
      const out = isOption(outOrOpt) ? outOrOpt.getOrNull() : outOrOpt;
      if (out != null) return out;
    }
    return null;
  },
  ([first]) => Array.isArray(first)
);

/** A tuple-typed array guaranteed to contain at least one `T`. */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Maps an array while threading an accumulator through each step, similarly to combining
 * `Array.prototype.reduce` with `Array.prototype.map`. Pipeable: call as
 * `mapAccumulate(arr, callback, initial)` or `mapAccumulate(callback, initial)(arr)`.
 * @template I The type of the input array's elements.
 * @template Acc The type of the accumulator threaded between steps.
 * @template O The type of the mapped output.
 * @param {readonly I[]} arr The array to map over.
 * @param {(acc: Acc, val: I, index: number, arr: readonly I[]) => [Acc, O]} callback Given the current accumulator and element, returns the next accumulator and the mapped output.
 * @param {Acc} initial The initial accumulator value.
 * @returns {O[]} The mapped outputs, in order.
 */
export const mapAccumulate = pipeable<{
  <I, Acc, O>(
    arr: readonly I[],
    callback: (acc: Acc, val: I, index: number, arr: readonly I[]) => [Acc, O],
    initial: Acc
  ): O[];
  <I, Acc, O>(
    callback: (acc: Acc, val: I, index: number, arr: readonly I[]) => [Acc, O],
    initial: Acc
  ): (arr: readonly I[]) => O[];
}>(
  <I, Acc, O>(
    arr: readonly I[],
    callback: (acc: Acc, val: I, index: number, arr: readonly I[]) => [Acc, O],
    initial: Acc
  ): O[] => {
    let acc = initial;
    const output: O[] = [];
    for (let i = 0; i < arr.length; i++) {
      const [nextAcc, out] = callback(acc, arr[i] as I, i, arr);
      output.push(out);
      acc = nextAcc;
    }
    return output;
  },
  ([first]) => Array.isArray(first)
);
