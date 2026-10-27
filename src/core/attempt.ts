/**
 * Runs a callback and catches anything it throws, so it never propagates. Without `onError` the error is
 * swallowed and `null` is returned. With `onError`, it is called with the thrown value and its result is
 * returned instead; a nullish result from `onError` also becomes `null`. Use {@link attemptAsync} for
 * callbacks that return a promise.
 */
export const attempt: {
  /**
   * Returns `null` if `unsafeCb` throws.
   * @template T
   * @param {() => T} unsafeCb Callback that may throw.
   * @returns {T | null} The callback's return value, or `null` if it threw.
   */
  <T>(unsafeCb: () => T): T | null;
  /**
   * Returns `onError`'s result if `unsafeCb` throws.
   * @template T
   * @param {() => T} unsafeCb Callback that may throw.
   * @param {(error: unknown) => T} onError Produces the fallback from the thrown value.
   * @returns {T} The callback's return value, or the fallback value if it threw.
   */
  <T>(unsafeCb: () => T, onError: (error: unknown) => T): T;
} = <T>(unsafeCb: () => T, onError?: (error: unknown) => T): T | null => {
  try {
    return unsafeCb();
  } catch (err) {
    return onError?.(err) ?? null;
  }
};

/**
 * Async version of {@link attempt}. Runs an async callback and catches anything it throws or rejects with,
 * so it never propagates. Without `onError` the error is swallowed and `null` is resolved. With `onError`,
 * it is called with the thrown/rejected value and its result is resolved instead; a nullish result from
 * `onError` also becomes `null`.
 */
export const attemptAsync: {
  /**
   * Resolves `null` if `unsafeCb` throws or rejects.
   * @template T
   * @param {() => Promise<T>} unsafeCb Async callback that may throw or reject.
   * @returns {Promise<T | null>} The callback's resolved value, or `null` if it threw/rejected.
   */
  <T>(unsafeCb: () => Promise<T>): Promise<T | null>;
  /**
   * Resolves `onError`'s result if `unsafeCb` throws or rejects.
   * @template T
   * @param {() => Promise<T>} unsafeCb Async callback that may throw or reject.
   * @param {(error: unknown) => T} onError Produces the fallback from the thrown/rejected value.
   * @returns {Promise<T>} The callback's resolved value, or the fallback value if it threw/rejected.
   */
  <T>(unsafeCb: () => Promise<T>, onError: (error: unknown) => T): Promise<T>;
} = async <T>(
  unsafeCb: () => Promise<T>,
  onError?: (error: unknown) => T
): Promise<T | null> => {
  try {
    return await unsafeCb();
  } catch (err) {
    return onError?.(err) ?? null;
  }
};
