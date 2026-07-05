import type { AnyArgFn, AsyncReturnType } from "./helpers.ts";

/**
 * Wraps a function so it runs at most once per `throttleMs` window; calls made within the window return the
 * result of the most recent actual invocation instead of running `fn` again.
 * @template Fn The type of the function being throttled.
 * @param {Fn} fn The function to throttle.
 * @param {number} throttleMs The minimum time, in milliseconds, between invocations of `fn`.
 * @returns {Fn} A throttled version of `fn` with the same signature.
 */
export const throttled = <Fn extends AnyArgFn>(
  fn: Fn,
  throttleMs: number
): Fn => {
  let lastRun = Date.now() - throttleMs;
  let result: ReturnType<Fn>;

  return ((...args) => {
    const currTime = Date.now();
    if (currTime >= lastRun + throttleMs) {
      result = fn(...(args as Parameters<Fn>)) as ReturnType<Fn>;
      lastRun = currTime;
    }
    return result;
  }) as Fn;
};

/**
 * Async version of {@link throttled}: wraps an async function so it runs at most once per `throttleMs`
 * window, returning the most recently resolved value for calls made within the window.
 * @template Fn The type of the async function being throttled.
 * @param {Fn} fn The async function to throttle.
 * @param {number} throttleMs The minimum time, in milliseconds, between invocations of `fn`.
 * @returns {Fn} A throttled version of `fn` with the same signature.
 */
export const throttledAsync = <Fn extends AnyArgFn<Promise<unknown>>>(
  fn: Fn,
  throttleMs: number
): Fn => {
  let lastRun = Date.now() - throttleMs;
  let result: AsyncReturnType<Fn>;

  return (async (...args) => {
    const currTime = Date.now();
    if (currTime >= lastRun + throttleMs) {
      result = (await fn(...(args as Parameters<Fn>))) as AsyncReturnType<Fn>;
      lastRun = currTime;
    }
    return result;
  }) as Fn;
};
