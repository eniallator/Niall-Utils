import type { AnyArgFn, AsyncReturnType } from "./helpers.ts";

export const throttled = <Fn extends AnyArgFn>(
  fn: Fn,
  throttleMs: number,
  initial: ReturnType<Fn>
): Fn => {
  let lastRun = Date.now() - throttleMs;
  let result = initial;

  return ((...args) => {
    const currTime = Date.now();
    if (currTime >= lastRun + throttleMs) {
      result = fn(...(args as Parameters<Fn>)) as ReturnType<Fn>;
      lastRun = currTime;
    }
    return result;
  }) as Fn;
};

export const asyncThrottled = <Fn extends AnyArgFn<Promise<unknown>>>(
  fn: Fn,
  throttleMs: number,
  initial: AsyncReturnType<Fn>
): Fn => {
  let lastRun = Date.now() - throttleMs;
  let result = initial;

  return (async (...args) => {
    const currTime = Date.now();
    if (currTime >= lastRun + throttleMs) {
      result = (await fn(...(args as Parameters<Fn>))) as AsyncReturnType<Fn>;
      lastRun = currTime;
    }
    return result;
  }) as Fn;
};
