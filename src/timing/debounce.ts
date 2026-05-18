import type { AnyArgFn } from "./helpers.ts";

export const debounce = <Fn extends AnyArgFn<void>>(
  fn: Fn,
  debounceMs: number
): Fn & { cancel: () => void } => {
  let timer: number | null = null;

  const debounced = ((...args: Parameters<Fn>) => {
    if (timer != null) clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, debounceMs);
  }) as Fn & { cancel: () => void };

  debounced.cancel = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
};
