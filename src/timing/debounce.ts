import type { AnyArgFn } from "../core/types.ts";

/**
 * Wraps a function so that repeated calls within `debounceMs` of each other only run the wrapped function
 * once, after `debounceMs` has elapsed since the most recent call.
 * @template Fn The type of the function being debounced (must return `void`).
 * @param {Fn} fn The function to debounce.
 * @param {number} debounceMs How long to wait, in milliseconds, after the last call before invoking `fn`.
 * @returns {Fn & { cancel: () => void }} A debounced version of `fn`, with a `cancel` method to abort any pending call.
 */
export const debounce = <Fn extends AnyArgFn<void>>(
  fn: Fn,
  debounceMs: number
): Fn & { cancel: () => void } => {
  let timer: number | null = null;

  const debounced = ((...args: Parameters<Fn>) => {
    if (timer != null) clearTimeout(timer);

    const id = setTimeout(() => {
      fn(...args);
      // Only clear if `id` is still the active timer: a reentrant call from within `fn` may have already
      // scheduled a new one, which this callback firing shouldn't clobber.
      if (timer === id) timer = null;
    }, debounceMs);
    timer = id;
  }) as Fn & { cancel: () => void };

  debounced.cancel = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
};
