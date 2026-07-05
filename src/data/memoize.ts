import type { AnyArgFn } from "../timing/helpers.ts";

/**
 * Wraps a function so its results are cached and reused for previously-seen arguments.
 * @template F The type of the function being memoized.
 * @param {F} fn The function to memoize.
 * @param {(...args: Parameters<F>) => string} [toCacheKey] Derives a cache key from the call arguments. Defaults to `JSON.stringify(args)`.
 * @returns {F} A memoized version of `fn` with the same signature.
 */
export const memoize = <F extends AnyArgFn>(
  fn: F,
  toCacheKey: (...args: Parameters<F>) => string = (...args) =>
    JSON.stringify(args)
): F => {
  const cache: Record<string, ReturnType<F>> = {};
  return ((...args) => {
    const cacheKey = toCacheKey(...(args as Parameters<F>));
    if (!(cacheKey in cache)) {
      cache[cacheKey] = fn(...(args as Parameters<F>)) as ReturnType<F>;
    }
    return cache[cacheKey];
  }) as F;
};
