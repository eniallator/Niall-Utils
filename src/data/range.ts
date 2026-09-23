import type { RecursionLimit } from "../math/maths.ts";

export type Range<
  N extends number,
  A extends unknown[] = [],
> = A["length"] extends RecursionLimit
  ? number
  : A["length"] extends N
    ? A
    : Range<N, [...A, A["length"]]>;

export function typedRange<N extends number>(limit: N): Range<N> {
  return Array.from({ length: limit }, (_, index) => index) as Range<N>;
}
