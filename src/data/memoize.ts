import type { AnyArgFn } from "../core/types.ts";

/**
 * Replaces the values `JSON.stringify` can't represent faithfully (`NaN`/`Infinity`/`-Infinity` all serialize
 * to `null`, and `undefined` is dropped/nulled) with distinct string markers, so they don't collide with each
 * other or with a real `null` argument.
 */
const replaceNonFiniteValues = (_key: string, value: unknown): unknown => {
  if (value === undefined) return "undefined";
  if (typeof value !== "number" || Number.isFinite(value)) return value;
  if (Number.isNaN(value)) return "NaN";
  return value > 0 ? "Infinity" : "-Infinity";
};

/**
 * Wraps a function so its results are cached and reused for previously-seen arguments.
 * @template F The type of the function being memoized.
 * @param {F} fn The function to memoize.
 * @param {(...args: Parameters<F>) => string} [toCacheKey] Derives a cache key from the call arguments.
 * Defaults to `JSON.stringify(args)` with `NaN`/`Infinity`/`-Infinity`/`undefined` replaced by distinct
 * markers so they don't collide with each other. A caller-supplied argument whose string form happens to
 * exactly match one of these markers could still collide with it.
 * @param {number} [maxSize] The maximum number of entries to keep cached. Once exceeded, the least-recently-used
 * entry is evicted. Defaults to unbounded.
 * @returns {F} A memoized version of `fn` with the same signature.
 */
export const memoize = <F extends AnyArgFn>(
  fn: F,
  toCacheKey: (...args: Parameters<F>) => string = (...args) =>
    JSON.stringify(args, replaceNonFiniteValues),
  maxSize?: number
): F => {
  const cache = new Map<string, ReturnType<F>>();
  return ((...args) => {
    const cacheKey = toCacheKey(...(args as Parameters<F>));
    if (cache.has(cacheKey)) {
      const value = cache.get(cacheKey) as ReturnType<F>;
      cache.delete(cacheKey);
      cache.set(cacheKey, value);
      return value;
    }

    const value = fn(...(args as Parameters<F>)) as ReturnType<F>;
    cache.set(cacheKey, value);
    if (maxSize != null && cache.size > maxSize) {
      const lruKey = cache.keys().next().value as string;
      cache.delete(lruKey);
    }
    return value;
  }) as F;
};
