import type { AnyArgFn } from "../timing/helpers.ts";

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
