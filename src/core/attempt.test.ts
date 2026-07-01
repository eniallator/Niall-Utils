import { describe, expect, it } from "vitest";

import { attempt, attemptAsync } from "./attempt.ts";

describe("attempt", () => {
  it("returns the result when the callback succeeds", () => {
    const result = attempt(() => 42);
    expect(result).toBe(42);
  });

  it("returns null when the callback throws and no onError is provided", () => {
    const result = attempt(() => {
      throw new Error("fail");
    });
    expect(result).toBeNull();
  });

  it("returns the error handler result when the callback throws", () => {
    const result = attempt(
      () => {
        throw new Error("fail");
      },
      () => 0
    );
    expect(result).toBe(0);
  });

  it("handles callbacks that return undefined", () => {
    const result = attempt(() => undefined);
    expect(result).toBeUndefined();
  });

  it("handles callbacks that return null", () => {
    const result = attempt(() => null);
    expect(result).toBeNull();
  });

  it("handles callbacks that return objects", () => {
    const obj = { a: 1 };
    const result = attempt(() => obj);
    expect(result).toBe(obj);
  });
});

describe("attemptAsync", () => {
  it("returns the result when the callback resolves", async () => {
    const result = await attemptAsync(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it("returns null when the callback rejects and no onError is provided", async () => {
    const result = await attemptAsync(() =>
      Promise.reject(new Error("fail"))
    );
    expect(result).toBeNull();
  });

  it("returns the error handler result when the callback rejects", async () => {
    const result = await attemptAsync(
      () => Promise.reject(new Error("fail")),
      () => 0
    );
    expect(result).toBe(0);
  });

  it("handles callbacks that resolve to undefined", async () => {
    const result = await attemptAsync(() => Promise.resolve(undefined));
    expect(result).toBeUndefined();
  });

  it("handles callbacks that resolve to null", async () => {
    const result = await attemptAsync(() => Promise.resolve(null));
    expect(result).toBeNull();
  });
});
