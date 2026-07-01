import { describe, expect, it } from "vitest";

import { checkExhausted, raise } from "./utils.ts";

describe("raise", () => {
  it("throws the provided error", () => {
    const error = new Error("test error");
    expect(() => raise(error)).toThrow(error);
  });

  it("returns never type", () => {
    expect(() => raise(new Error("test"))).toThrow();
  });
});

describe("checkExhausted", () => {
  it("throws an error with the non-exhaustive value in the message", () => {
    let thrown = false;
    try {
      checkExhausted({} as never);
    } catch (e) {
      thrown = true;
      expect((e as Error).message).toContain("Value not exhausted");
    }
    expect(thrown).toBe(true);
  });

  it("includes JSON stringified value in message", () => {
    let thrown = false;
    try {
      checkExhausted({} as never);
    } catch (e) {
      thrown = true;
      expect((e as Error).message).toContain(JSON.stringify({}));
    }
    expect(thrown).toBe(true);
  });
});
