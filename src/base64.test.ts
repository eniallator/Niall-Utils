import { describe, expect, it } from "vitest";

import {
  base64FromUint,
  base64ToUint,
  isValidBase64,
  unsafeBase64,
} from "./base64.ts";

describe("isValidBase64", () => {
  it("passes for every base 64 character", () => {
    expect(
      isValidBase64(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
      )
    ).toBeTruthy();
  });

  it("fails for non base 64 characters", () => {
    expect(isValidBase64("?")).toBeFalsy();
    expect(isValidBase64("&")).toBeFalsy();
    expect(isValidBase64(":")).toBeFalsy();
    expect(isValidBase64(";")).toBeFalsy();
    expect(isValidBase64("(")).toBeFalsy();
    expect(isValidBase64(")")).toBeFalsy();
    expect(isValidBase64("[")).toBeFalsy();
    expect(isValidBase64("]")).toBeFalsy();
    expect(isValidBase64("{")).toBeFalsy();
    expect(isValidBase64("}")).toBeFalsy();
    // ...
  });
});

describe("base64FromUint", () => {
  it("encodes 0 correctly", () => {
    expect(base64FromUint(0)).toBe("");
  });

  it("encodes positive integers correctly", () => {
    expect(base64FromUint(1)).toBe("B");
    expect(base64FromUint(63)).toBe("/");
    expect(base64FromUint(64)).toBe("BA");
    expect(base64FromUint(12345)).toBe("DA5");
  });

  it("pads to length if specified", () => {
    expect(base64FromUint(1, 4)).toBe("AAAB");
    expect(base64FromUint(0, 3)).toBe("AAA");
    expect(base64FromUint(63, 2)).toBe("A/");
  });

  it("returns empty string for negative numbers", () => {
    expect(() => base64FromUint(-1)).toThrowError("Expected uint but got -1");
  });

  it("returns empty string for NaN", () => {
    expect(() => base64FromUint(Number.NaN)).toThrowError(
      "Expected uint but got NaN"
    );
  });
});

describe("base64ToUint", () => {
  it("decodes base64 strings correctly", () => {
    expect(base64ToUint(unsafeBase64(""))).toBe(0);
    expect(base64ToUint(unsafeBase64("B"))).toBe(1);
    expect(base64ToUint(unsafeBase64("/"))).toBe(63);
    expect(base64ToUint(unsafeBase64("BA"))).toBe(64);
    expect(base64ToUint(unsafeBase64("DA5"))).toBe(12345);
  });

  it("decodes padded strings correctly", () => {
    expect(base64ToUint(unsafeBase64("AAAB"))).toBe(1);
    expect(base64ToUint(unsafeBase64("AAA"))).toBe(0);
    expect(base64ToUint(unsafeBase64("A/"))).toBe(63);
  });

  it("returns -1 for invalid characters", () => {
    expect(base64ToUint(unsafeBase64("!"))).toBe(-1);
    expect(base64ToUint(unsafeBase64("A!"))).toBe(-1);
  });

  it("returns 0 for empty string", () => {
    expect(base64ToUint(unsafeBase64(""))).toBe(0);
  });
});
