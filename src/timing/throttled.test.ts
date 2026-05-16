import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncThrottled, throttled } from "./throttled";

afterEach(() => {
  vi.useRealTimers();
});

describe("throttled", () => {
  it("calls fn on first invocation and returns the computed result", () => {
    const fn = vi.fn((value: number) => value * 2);
    const wrapped = throttled(fn, 100, 0);

    expect(wrapped(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(5);
  });

  it("returns the cached result while inside the throttle window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn((value: number) => value * 2);
    const wrapped = throttled(fn, 100, 0);

    vi.setSystemTime(1);
    expect(wrapped(3)).toBe(6);
    fn.mockClear();

    vi.setSystemTime(50);
    expect(wrapped(7)).toBe(6);
    expect(fn).not.toHaveBeenCalled();
  });

  it("recomputes after the throttle period elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn((value: number) => value + 1);
    const wrapped = throttled(fn, 100, 0);

    vi.setSystemTime(1);
    expect(wrapped(2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.setSystemTime(102);
    expect(wrapped(5)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("always recalculates when throttleMs is zero", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn((a: string, b: string) => `${a}:${b}`);
    const wrapped = throttled(fn, 0, "initial");

    vi.setSystemTime(1);
    expect(wrapped("first", "call")).toBe("first:call");
    vi.setSystemTime(2);
    expect(wrapped("second", "call")).toBe("second:call");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("asyncThrottled", () => {
  it("awaits the async function and caches the resolved value inside the throttle window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn((value: number) => Promise.resolve(value * 3));
    const wrapped = asyncThrottled(fn, 100, 0);

    vi.setSystemTime(1);
    expect(await wrapped(2)).toBe(6);
    fn.mockClear();

    vi.setSystemTime(50);
    expect(await wrapped(5)).toBe(6);
    expect(fn).not.toHaveBeenCalled();
  });

  it("re-executes the async function after the throttle interval has passed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const fn = vi.fn((value: string) => Promise.resolve(`${value}!`));
    const wrapped = asyncThrottled(fn, 100, "initial");

    vi.setSystemTime(1);
    expect(await wrapped("go")).toBe("go!");
    expect(fn).toHaveBeenCalledTimes(1);

    vi.setSystemTime(200);
    expect(await wrapped("again")).toBe("again!");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("propagates a rejection from the underlying async function", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const error = new Error("boom");
    const fn = vi.fn(() => Promise.reject<string>(error));
    const wrapped = asyncThrottled(fn, 100, "initial");

    vi.setSystemTime(1);
    await expect(wrapped()).rejects.toThrow(error);
  });
});
