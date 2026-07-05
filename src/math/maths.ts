import { tuple } from "../core/tuple.ts";
import { simplePipeable } from "../functional/pipeable.ts";

import type { FillTuple } from "../core/tuple.ts";

/**
 * Converts cartesian coordinates to polar coordinates.
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @returns {[number, number]} A `[magnitude, angle]` tuple, where `angle` is in radians.
 */
export const cartesianToPolar = (x: number, y: number): [number, number] =>
  tuple(Math.hypot(x, y), Math.atan2(y, x));

/**
 * Converts polar coordinates to cartesian coordinates.
 * @param {number} magnitude The distance from the origin.
 * @param {number} angle The angle in radians.
 * @returns {[number, number]} An `[x, y]` tuple.
 */
export const polarToCartesian = (
  magnitude: number,
  angle: number
): [number, number] =>
  tuple(magnitude * Math.cos(angle), magnitude * Math.sin(angle));

/**
 * Computes `a mod b`, always returning a non-negative result (unlike JavaScript's `%` operator, which can
 * return a negative value for a negative `a`). Pipeable: call as `positiveMod(a, b)` or `positiveMod(b)(a)`.
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @returns {number} `a mod b`, in the range `[0, b)`.
 */
export const positiveMod = simplePipeable(
  (a: number, b: number) => ((a % b) + b) % b
);

/**
 * Restricts a value to lie within an inclusive range. Pipeable: call as `clamp(value, min, max)` or
 * `clamp(min, max)(value)`.
 * @param {number} value The value to clamp.
 * @param {number} min The inclusive lower bound.
 * @param {number} max The inclusive upper bound.
 * @returns {number} `value`, clamped to `[min, max]`.
 */
export const clamp = simplePipeable((value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
);

/** The maximum recursion depth the recursive numeric type helpers in this module can evaluate. */
export type RecursionLimit = 1001;

/** Decrements a number type by one, at the type level. Saturates at `0`. */
export type Decrement<N extends number> =
  FillTuple<unknown, N> extends [unknown, ...infer R] ? R["length"] : 0;

/** Increments a number type by one, at the type level. */
export type Increment<N extends number> = Extract<
  [...FillTuple<unknown, N>, unknown]["length"],
  number
>;

/** Adds two number types together, at the type level. */
export type Add<A extends number, B extends number> = Extract<
  [...FillTuple<unknown, A>, ...FillTuple<unknown, B>]["length"],
  number
>;

/**
 * Multiplies two number types together, at the type level. Resolves to `number` if the computation exceeds
 * {@link RecursionLimit}.
 */
export type Multiply<
  A extends number,
  B extends number,
  I extends number = 1,
> = I extends RecursionLimit
  ? number
  : I extends B
    ? A
    : Add<A, Multiply<A, B, Increment<I>>>;

interface DigitLookup {
  "0": 0;
  "1": 1;
  "2": 2;
  "3": 3;
  "4": 4;
  "5": 5;
  "6": 6;
  "7": 7;
  "8": 8;
  "9": 9;
}

/** Parses a string of decimal digits into a number type, at the type level. */
export type StringToNumber<
  Str extends string,
  Acc extends number = 0,
> = Str extends `${infer Digit}${infer Rest}`
  ? StringToNumber<
      Rest,
      Add<DigitLookup[Extract<Digit, keyof DigitLookup>], Multiply<Acc, 10>>
    >
  : Acc;

/**
 * Subtracts one number type from another, at the type level. Resolves to `number` if the computation
 * exceeds {@link RecursionLimit} or would go negative.
 */
export type Subtract<
  A extends number,
  B extends number,
  I extends number = 0,
> = I extends RecursionLimit
  ? number
  : I extends B
    ? A
    : A extends 0
      ? number
      : Subtract<Decrement<A>, B, Increment<I>>;
