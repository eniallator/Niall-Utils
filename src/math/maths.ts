import { tuple } from "../core/tuple.ts";
import { simplePipeable } from "../functional/pipeable.ts";

import type { FillTuple } from "../core/tuple.ts";

export const cartesianToPolar = (x: number, y: number) =>
  tuple(Math.hypot(x, y), Math.atan2(y, x));

export const polarToCartesian = (magnitude: number, angle: number) =>
  tuple(magnitude * Math.cos(angle), magnitude * Math.sin(angle));

export const positiveMod = simplePipeable(
  (a: number, b: number) => ((a % b) + b) % b
);

export const clamp = simplePipeable((value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
);

export type RecursionLimit = 1001;

export type Decrement<N extends number> =
  FillTuple<unknown, N> extends [unknown, ...infer R] ? R["length"] : 0;

export type Increment<N extends number> = Extract<
  [...FillTuple<unknown, N>, unknown]["length"],
  number
>;

export type Add<A extends number, B extends number> = Extract<
  [...FillTuple<unknown, A>, ...FillTuple<unknown, B>]["length"],
  number
>;

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

export type StringToNumber<
  Str extends string,
  Acc extends number = 0,
> = Str extends `${infer Digit}${infer Rest}`
  ? StringToNumber<
      Rest,
      Add<DigitLookup[Extract<Digit, keyof DigitLookup>], Multiply<Acc, 10>>
    >
  : Acc;

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
