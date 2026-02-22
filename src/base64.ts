import { unsafeTag } from "./tagged.ts";
import { raise } from "./utils.ts";

import type { Tagged } from "./tagged.ts";

export type Base64 = Tagged<string, "Base64">;
export const unsafeBase64 = unsafeTag<Base64>();

const BASE_64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE_64_CHARSET = new Set(BASE_64_CHARS);

export const isValidBase64 = (str: string): str is Base64 =>
  str[Symbol.iterator]().every(char => BASE_64_CHARSET.has(char));

export const base64FromUint = (n: number, length?: number): Base64 => {
  if (Number.isNaN(n) || n < 0) raise(new Error(`Expected uint but got ${n}`));
  let base64 = "";
  while (n && (length == null || base64.length < length)) {
    base64 = (BASE_64_CHARS[n % 64] ?? "") + base64;
    n = Math.floor(n / 64);
  }
  return unsafeBase64(
    length != null ? base64.padStart(length, BASE_64_CHARS[0]) : base64
  );
};

export const base64ToUint = (str: Base64): number => {
  let n = 0;
  for (const char of str) {
    n = n * 64 + BASE_64_CHARS.indexOf(char);
  }
  return n;
};
