import { Monad } from "./monad.ts";
import { raise } from "../core/utils.ts";

/**
 * Tracks, at the type level, whether an {@link Option} is statically known to hold a value (`"some"`),
 * known to be empty (`"none"`), or unknown either way (`undefined`) — this drives which `getOr*` overloads
 * are available.
 */
export type OptionType = "some" | "none" | undefined;
type FoldOptionType<T extends OptionType, S, N, D = S | N> = T extends "some"
  ? S
  : T extends "none"
    ? N
    : D;

type UnpackTupledOptions<O extends readonly Option<NonNullable<unknown>>[]> = {
  [K in keyof O]: O[K] extends Option<infer T> ? T : O[K];
};

/**
 * A container representing an optional, non-nullable value, similar to Rust's `Option` or Scala's
 * `Option`. Chain transformations with `map`/`flatMap`/`filter`, then unwrap with one of the `getOr*`
 * methods or `fold`.
 * @template A The non-nullable type of the wrapped value.
 * @template T Tracks whether this `Option` is statically known to be `"some"` or `"none"`. Defaults to
 * `undefined` (unknown), which is what most construction methods other than {@link Option.some} and
 * {@link Option.none} produce.
 */
export class Option<
  A extends NonNullable<unknown>,
  T extends OptionType = undefined,
> {
  private readonly value: A | null | undefined;

  private constructor(value: A | null | undefined) {
    this.value = value;
  }

  /**
   * Creates an `Option` statically known to be empty.
   * @template A The non-nullable type the `Option` would otherwise hold.
   * @returns {Option<A, "none">} An empty `Option`.
   */
  static none<A extends NonNullable<unknown>>(): Option<A, "none"> {
    return new Option<A, "none">(null);
  }

  /**
   * Creates an `Option` statically known to hold a value, widening literal types.
   * @template A The type of the value to wrap.
   * @param {A} value The value to wrap.
   * @returns {Option<A, "some">} An `Option` holding `value`.
   */
  static some<A extends NonNullable<unknown>>(value: A): Option<A, "some"> {
    return new Option(value);
  }

  /**
   * Creates an `Option` statically known to hold a value, preserving its exact literal type.
   * @template A The exact type of the value to wrap.
   * @param {A} value The value to wrap.
   * @returns {Option<A, "some">} An `Option` holding `value`.
   */
  static someExact<const A extends NonNullable<unknown>>(
    value: A
  ): Option<A, "some"> {
    return new Option(value);
  }

  /**
   * Creates an `Option` from a possibly-nullish value, widening literal types. The resulting `Option`'s
   * emptiness is not statically known.
   * @template A The non-nullable type the `Option` would hold.
   * @param {A | null | undefined} value The value to wrap; `null`/`undefined` become an empty `Option`.
   * @returns {Option<A>} An `Option` holding `value` if it's non-nullish, otherwise empty.
   */
  static from<A extends NonNullable<unknown>>(
    value: A | null | undefined
  ): Option<A> {
    return new Option(value);
  }

  /**
   * Creates an `Option` from a possibly-nullish value, preserving its exact literal type. The resulting
   * `Option`'s emptiness is not statically known.
   * @template A The exact, non-nullable type the `Option` would hold.
   * @param {A | null | undefined} value The value to wrap; `null`/`undefined` become an empty `Option`.
   * @returns {Option<A>} An `Option` holding `value` if it's non-nullish, otherwise empty.
   */
  static fromExact<const A extends NonNullable<unknown>>(
    value: A | null | undefined
  ): Option<A> {
    return new Option(value);
  }

  /**
   * Combines a tuple of `Option`s into a single `Option` wrapping a tuple of their unwrapped values,
   * short-circuiting to an empty `Option` if any input is empty.
   * @template A A tuple of `Option`s to combine.
   * @param {A} tup The `Option`s to combine, in order.
   * @returns {Option<UnpackTupledOptions<A>>} An `Option` wrapping a tuple of every value if all inputs held one, otherwise empty.
   */
  static tupled<
    const A extends readonly Option<NonNullable<unknown>, OptionType>[],
  >(tup: A): Option<UnpackTupledOptions<A>> {
    const values: unknown[] = [];
    for (const opt of tup) {
      const value = opt.getOrNull();
      if (value != null) values.push(value);
      else return new Option<UnpackTupledOptions<A>>(null);
    }
    return new Option(values) as Option<UnpackTupledOptions<A>>;
  }

  /**
   * Maps the held value to a new value, if present. A nullish result becomes an empty `Option`.
   * @template B The non-nullable type of the mapped value.
   * @param {(value: A) => B | null | undefined} fn Maps the held value.
   * @returns {Option<B>} An `Option` holding the mapped value, or empty if this `Option` was empty or `fn` returned nullish.
   */
  map<B extends NonNullable<unknown>>(
    fn: (value: A) => B | null | undefined
  ): Option<B> {
    return new Option(this.value != null ? fn(this.value) : null);
  }

  /**
   * Maps the held value to a new `Option`, if present, flattening the result.
   * @template B The non-nullable type of the resulting `Option`'s value.
   * @param {(value: A) => Option<B, OptionType>} fn Maps the held value to a new `Option`.
   * @returns {Option<B>} The `Option` returned by `fn`, or empty if this `Option` was already empty.
   */
  flatMap<B extends NonNullable<unknown>>(
    fn: (value: A) => Option<B, OptionType>
  ): Option<B> {
    return this.value != null ? fn(this.value) : new Option<B>(null);
  }

  /**
   * Keeps the held value only if it satisfies a predicate, otherwise becomes empty.
   * @param {(value: A) => boolean} fn The predicate the value must satisfy.
   * @returns {Option<A>} This `Option` unchanged if the predicate passed, otherwise empty.
   */
  filter(fn: (value: A) => boolean): Option<A> {
    return this.value != null && fn(this.value)
      ? (this as Option<A>)
      : new Option<A>(null);
  }

  /**
   * Keeps the held value only if it satisfies a type guard, narrowing the `Option`'s type.
   * @template B The narrowed type asserted by `guard`.
   * @param {(value: A) => value is B} guard The type guard the value must satisfy.
   * @returns {Option<B>} This `Option` narrowed to `B` if the guard passed, otherwise empty.
   */
  guard<B extends A>(guard: (value: A) => value is B): Option<B> {
    return new Option<B>(
      this.value != null && guard(this.value) ? this.value : null
    );
  }

  /**
   * Calls a function with the held value for a side effect, without changing the `Option`.
   * @param {(value: A) => void} fn Called with the held value, if present.
   * @returns {this} This `Option`, unchanged.
   */
  tap(fn: (value: A) => void): this {
    if (this.value != null) fn(this.value);
    return this;
  }

  /**
   * Unwraps the `Option` by handling both the empty and present cases.
   * @template R The type produced by either branch.
   * @param {() => R} ifNone Called if this `Option` is empty.
   * @param {(a: A) => R} ifSome Called with the held value if present.
   * @returns {R} The result of whichever branch was called.
   */
  fold<R>(ifNone: () => R, ifSome: (a: A) => R): R {
    return this.value == null ? ifNone() : ifSome(this.value);
  }

  /**
   * Unwraps the held value, or `null` if empty. If `T` is statically known to be `"some"`/`"none"`, the
   * return type reflects that instead of `A | null`.
   * @returns {A | null} The held value, or `null` if empty.
   */
  getOrNull(): FoldOptionType<T, A, null> {
    return (this.value ?? null) as FoldOptionType<T, A, null>;
  }

  /**
   * Unwraps the held value, or `undefined` if empty. If `T` is statically known to be `"some"`/`"none"`,
   * the return type reflects that instead of `A | undefined`.
   * @returns {A | undefined} The held value, or `undefined` if empty.
   */
  getOrUndefined(): FoldOptionType<T, A, undefined> {
    return (this.value ?? undefined) as FoldOptionType<T, A, undefined>;
  }

  /**
   * Unwraps the held value, or throws if empty.
   * @param {Error} [err] The error to throw if empty. Defaults to a generic "Option value is nullable" error.
   * @returns {A} The held value.
   * @throws {Error} If this `Option` is empty.
   */
  getOrThrow(
    err: Error = new Error("Option value is nullable")
  ): FoldOptionType<T, A, never, A> {
    return (this.value ?? raise(err)) as FoldOptionType<T, A, never, never>;
  }

  /**
   * Unwraps the held value, or computes a fallback if empty.
   * @template R The type of the fallback value.
   * @param {() => R} orElse Called to produce a fallback value if empty.
   * @returns {A | R} The held value, or the computed fallback.
   */
  getOrElse<R>(orElse: () => R): FoldOptionType<T, A, R> {
    return (this.value ?? orElse()) as FoldOptionType<T, A, R>;
  }

  /**
   * Converts this `Option` into a {@link Monad} wrapping the value (or `null` if empty).
   * @returns {Monad<A | null>} A `Monad` wrapping the held value, or `null` if empty.
   */
  toMonad(): FoldOptionType<T, Monad<A>, Monad<null>, Monad<A | null>> {
    return Monad.from(this.value ?? null) as FoldOptionType<
      T,
      Monad<A>,
      Monad<null>,
      Monad<A | null>
    >;
  }

  /**
   * Wraps the held value in a single-element array, or returns an empty array if empty.
   * @returns {A[]} A single-element array with the held value, or `[]` if empty.
   */
  toArray(): A[] {
    return this.value != null ? [this.value] : [];
  }
}
