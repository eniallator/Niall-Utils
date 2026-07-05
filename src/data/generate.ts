/**
 * Builds a generator by repeatedly invoking `callback` until it returns `null` or `undefined`.
 * @template T The type of value produced.
 * @param {() => T | null | undefined} callback Produces the next value, or `null`/`undefined` to stop.
 * @returns {Generator<T>} A generator yielding each non-nullish value produced by `callback`.
 */
export function* generator<T>(
  callback: () => T | null | undefined
): Generator<T> {
  let result: T | null | undefined;
  while ((result = callback()) != null) yield result;
}
