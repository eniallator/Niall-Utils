import type { RecursionLimit } from "../math/maths.ts";

/**
 * Builds a tuple from its arguments, preserving each argument's literal type instead of widening to an array type.
 * @template T The tuple type of the arguments passed in.
 * @param {...T} tuple The values to collect into a tuple.
 * @returns {T} The arguments as a tuple.
 */
export const tuple = <const T extends unknown[]>(...tuple: T) => tuple;

/**
 * Builds a fixed-length tuple type of `N` elements, each of type `T`.
 * Falls back to `[T, ...T[]]` if `N` exceeds the recursion depth TypeScript can evaluate.
 * @template T The element type to repeat.
 * @template N The desired tuple length.
 */
export type FillTuple<
  T,
  N extends number,
  A extends T[] = [],
> = A["length"] extends RecursionLimit
  ? [T, ...T[]]
  : A["length"] extends N
    ? A
    : FillTuple<T, N, [...A, T]>;
