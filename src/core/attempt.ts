/**
 * Runs a callback and swallows any error it throws, returning `null` instead.
 * @template T
 * @param {() => T} unsafeCb Callback that may throw.
 * @returns {T | null} The callback's return value, or `null` if it threw.
 */
export function attempt<T>(unsafeCb: () => T): T | null;
/**
 * Runs a callback and falls back to calling `onError` if it throws.
 * @template T
 * @param {() => T} unsafeCb Callback that may throw.
 * @param {() => T} onError Callback invoked to produce a fallback value if `unsafeCb` throws.
 * @returns {T} The callback's return value, or the fallback value if it threw.
 */
export function attempt<T>(unsafeCb: () => T, onError: () => T): T;
export function attempt<T>(unsafeCb: () => T, onError?: () => T): T | null {
  try {
    return unsafeCb();
  } catch {
    return onError?.() ?? null;
  }
}

/**
 * Async version of {@link attempt}. Runs an async callback and swallows any error it throws or rejects with, returning `null` instead.
 * @template T
 * @param {() => Promise<T>} unsafeCb Async callback that may throw or reject.
 * @returns {Promise<T | null>} The callback's resolved value, or `null` if it threw/rejected.
 */
export async function attemptAsync<T>(
  unsafeCb: () => Promise<T>
): Promise<T | null>;
/**
 * Async version of {@link attempt}. Runs an async callback and falls back to calling `onError` if it throws or rejects.
 * @template T
 * @param {() => Promise<T>} unsafeCb Async callback that may throw or reject.
 * @param {() => T} onError Callback invoked to produce a fallback value if `unsafeCb` throws/rejects.
 * @returns {Promise<T>} The callback's resolved value, or the fallback value if it threw/rejected.
 */
export async function attemptAsync<T>(
  unsafeCb: () => Promise<T>,
  onError: () => T
): Promise<T>;
export async function attemptAsync<T>(
  unsafeCb: () => Promise<T>,
  onError?: () => T
): Promise<T | null> {
  try {
    return await unsafeCb();
  } catch {
    return onError?.() ?? null;
  }
}
