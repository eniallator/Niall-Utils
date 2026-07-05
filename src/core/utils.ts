/**
 * Throws the given error. Useful for throwing as an expression, e.g. inside `??` or a ternary.
 * @param {Error} error The error to throw.
 * @returns {never} Never returns; always throws.
 */
export const raise = (error: Error): never => {
  throw error;
};

/**
 * Asserts at compile time that `value` has been narrowed to `never` (e.g. every case of a switch has been
 * handled), and throws at runtime if this is somehow reached with an unexpected value.
 * @param {never} value The value expected to be exhausted.
 * @returns {never} Never returns; always throws.
 */
export const checkExhausted = (value: never) =>
  raise(new Error(`Value not exhausted: ${JSON.stringify(value)}`));
