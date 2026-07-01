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

export type NonEmptyArray<T> = [T, ...T[]];

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
