import { Option } from "./option.ts";

import type { OptionType } from "./option.ts";

type MapFn<I, O extends NonNullable<unknown>> = (
  val: I,
  index: number,
  arr: readonly I[]
) => Option<O, OptionType> | O | null | undefined;

const isOption: (
  value: unknown
) => value is Option<NonNullable<unknown>> = value => value instanceof Option;

export const mapFilter = <I, O extends NonNullable<unknown>>(
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
};

export const mapFind = <I, O extends NonNullable<unknown>>(
  arr: readonly I[],
  callback: MapFn<I, O>
): O | null => {
  for (let i = 0; i < arr.length; i++) {
    const outOrOpt = callback(arr[i] as I, i, arr);
    const out = isOption(outOrOpt) ? outOrOpt.getOrNull() : outOrOpt;
    if (out != null) return out;
  }
  return null;
};

export type NonEmptyArray<T> = [T, ...T[]];

export const mapAccumulate = <I, Acc, O>(
  arr: I[],
  initial: Acc,
  callback: (acc: Acc, val: I, index: number, arr: I[]) => [Acc, O]
): O[] => {
  let acc = initial;
  const output: O[] = [];
  for (let i = 0; i < arr.length; i++) {
    const [nextAcc, out] = callback(acc, arr[i] as I, i, arr);
    output.push(out);
    acc = nextAcc;
  }
  return output;
};
