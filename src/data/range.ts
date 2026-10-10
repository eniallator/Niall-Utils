import type { RecursionLimit } from "../math/maths.ts";

/**
 * The tuple `[0, 1, ..., N - 1]`, at the type level. Resolves to `number[]` if `N` exceeds
 * {@link RecursionLimit}.
 */
export type Range<
  N extends number,
  A extends unknown[] = [],
> = A["length"] extends RecursionLimit
  ? number[]
  : A["length"] extends N
    ? A
    : Range<N, [...A, A["length"]]>;

/**
 * Builds the array `[0, 1, ..., limit - 1]`, typed as the exact tuple {@link Range} for a literal `limit`.
 * @template N The number of elements.
 * @param {N} limit The number of elements.
 * @returns {Range<N>} The indices from `0` up to (but excluding) `limit`.
 */
export const typedRange = <N extends number>(limit: N): Range<N> =>
  Array.from({ length: limit }, (_, index) => index) as Range<N>;
