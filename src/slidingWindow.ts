import { positiveMod } from "./maths.ts";
import type { FillTuple } from "./tuple.ts";

export const slidingWindow = <T, S extends number>(
  arr: T[],
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
};
