import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { debounce } from "./debounce.ts";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should delay execution until debounce period passes", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("should reset the timer on each call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(50);
    debounced("second");
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledExactlyOnceWith("second");
  });

  it("should cancel pending execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("pending");
    debounced.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it("should allow new calls after cancellation", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    debounced.cancel();
    debounced("second");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith("second");
  });

  it("should handle multiple arguments", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1, "two", { three: true });
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith(1, "two", { three: true });
  });

  it("should be safe to cancel when timer is already null", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();

    // After the timer fires, timer is null — cancel should be safe
    debounced.cancel();
  });
});
