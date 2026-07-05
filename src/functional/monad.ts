import { Option } from "./option.ts";

type UnpackTupledMonads<M extends readonly Monad<unknown>[]> = {
  [K in keyof M]: M[K] extends Monad<infer T> ? T : M[K];
};

/**
 * A minimal wrapper that lets you chain transformations (`map`, `flatMap`, `tap`) over a value without
 * mutating it in place.
 * @template A The type of the wrapped value.
 */
export class Monad<A> {
  private readonly value: A;

  /**
   * Monad class
   * @param {A} value Initial value for the Monad to have
   */
  private constructor(value: A) {
    this.value = value;
  }

  /**
   * Wraps a value in a `Monad`, widening literal types (e.g. a string literal becomes `string`).
   * @template A The type of the value to wrap.
   * @param {A} value The value to wrap.
   * @returns {Monad<A>} A new `Monad` containing `value`.
   */
  static from<A>(value: A): Monad<A> {
    return new Monad(value);
  }

  /**
   * Wraps a value in a `Monad`, preserving its exact literal type instead of widening it.
   * @template A The exact type of the value to wrap.
   * @param {A} value The value to wrap.
   * @returns {Monad<A>} A new `Monad` containing `value`.
   */
  static fromExact<const A>(value: A): Monad<A> {
    return new Monad(value);
  }

  /**
   * Combines a tuple of `Monad`s into a single `Monad` wrapping a tuple of their unwrapped values.
   * @template M A tuple of `Monad`s to combine.
   * @param {M} monads The `Monad`s to combine, in order.
   * @returns {Monad<UnpackTupledMonads<M>>} A `Monad` wrapping a tuple of each input `Monad`'s value.
   */
  static tupled<const M extends readonly Monad<unknown>[]>(
    monads: M
  ): Monad<UnpackTupledMonads<M>> {
    return new Monad(monads.map(({ value }) => value) as UnpackTupledMonads<M>);
  }

  /**
   *  Maps the Monad's value to a new value
   * @param {function(A): B} fn Mapping function
   * @returns {Monad} Monad with the changed value
   */
  map<B>(fn: (value: A) => B): Monad<B> {
    return new Monad(fn(this.value));
  }

  /**
   *  Flat maps the Monad's value to a new value
   * @param {function(A): Monad<B>} fn Mapping function
   * @returns {Monad} Monad with the changed value
   */
  flatMap<B>(fn: (value: A) => Monad<B>): Monad<B> {
    return fn(this.value);
  }

  /**
   *  Call a given function with the current value
   * @param {function(A): void} fn Function to call
   * @returns {this} this
   */
  tap(fn: (value: A) => void): this {
    fn(this.value);
    return this;
  }

  /**
   * Get the current value of this monad
   * @returns {A} The current value
   */
  get(): A {
    return this.value;
  }

  /**
   * Converts this `Monad` into an {@link Option}, treating a nullish value as `Option.none()`.
   * @returns {Option<NonNullable<A>>} An `Option` wrapping the value if it's non-nullish, otherwise `none`.
   */
  toOption(): Option<NonNullable<A>> {
    return Option.from<NonNullable<A>>(this.value as NonNullable<A>);
  }

  /**
   * Wraps the current value in a single-element array.
   * @returns {A[]} An array containing just the current value.
   */
  toArray(): A[] {
    return [this.value];
  }
}
