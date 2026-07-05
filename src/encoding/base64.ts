import { unsafeTag } from "../core/tagged.ts";
import { raise } from "../core/utils.ts";

import type { Tagged } from "../core/tagged.ts";

/** A string known to contain only valid base64 characters. */
export type Base64 = Tagged<string, "Base64">;
/**
 * Casts a plain string to {@link Base64} without validating it. Prefer {@link isValidBase64} to validate
 * untrusted input first.
 * @param {string} value The string to cast.
 * @returns {Base64} The value, typed as {@link Base64}.
 */
export const unsafeBase64 = unsafeTag<Base64>();

const BASE_64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE_64_CHARSET = new Set(BASE_64_CHARS);

/**
 * Checks whether every character in a string is a valid base64 character, narrowing it to {@link Base64}.
 * Note this does not check padding or length validity, only the character set.
 * @param {string} str The string to validate.
 * @returns {boolean} `true` if `str` only contains valid base64 characters.
 */
export const isValidBase64 = (str: string): str is Base64 => {
  for (const char of str) {
    if (!BASE_64_CHARSET.has(char)) return false;
  }
  return true;
};

/**
 * Encodes a non-negative integer as a base64 string.
 * @param {number} n The non-negative integer to encode.
 * @param {number} [length] If given, left-pads the result with the base64 zero character to this length.
 * @returns {Base64} The base64-encoded representation of `n`.
 * @throws {Error} If `n` is `NaN` or negative.
 */
export const base64FromUint = (n: number, length?: number): Base64 => {
  if (Number.isNaN(n) || n < 0) raise(new Error(`Expected uint but got ${n}`));
  let base64 = "";
  while (n && (length == null || base64.length < length)) {
    base64 = (BASE_64_CHARS[n % 64] as string) + base64;
    n = Math.floor(n / 64);
  }
  return unsafeBase64(
    length != null ? base64.padStart(length, BASE_64_CHARS[0]) : base64
  );
};

/**
 * Decodes a {@link Base64} string produced by {@link base64FromUint} back into its integer value.
 * @param {Base64} str The base64 string to decode.
 * @returns {number} The decoded non-negative integer.
 */
export const base64ToUint = (str: Base64): number => {
  let n = 0;
  for (const char of str) {
    n = n * 64 + BASE_64_CHARS.indexOf(char);
  }
  return n;
};
