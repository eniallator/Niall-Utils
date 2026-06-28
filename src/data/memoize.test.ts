import { describe, expect, it, vi } from "vitest";

import { memoize } from "./memoize.ts";

describe("memoize", () => {
  it("caches the result of a function", () => {
    const add = (a: number, b: number): number => a + b;
    const memoizedAdd = memoize(add);
    expect(memoizedAdd(1, 2)).toBe(3);
    expect(memoizedAdd(1, 2)).toBe(3);
  });

  it("does not call the original function when cache hits", () => {
    const fn = vi.fn((x: number): number => x * 2);
    const memoizedFn = memoize(fn);
    memoizedFn(5);
    memoizedFn(5);
    memoizedFn(5);
    expect(fn).toHaveBeenCalledExactlyOnceWith(5);
  });

  it("calls the original function for different arguments", () => {
    const fn = vi.fn((x: number): number => x * 2);
    const memoizedFn = memoize(fn);
    memoizedFn(1);
    memoizedFn(2);
    memoizedFn(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("returns correct cached values for different arguments", () => {
    const fn = vi.fn((x: number): number => x * 2);
    const memoizedFn = memoize(fn);
    expect(memoizedFn(1)).toBe(2);
    expect(memoizedFn(2)).toBe(4);
    expect(memoizedFn(1)).toBe(2); // cache hit
    expect(memoizedFn(3)).toBe(6);
  });

  it("works with no arguments", () => {
    const fn = vi.fn((): string => "hello");
    const memoizedFn = memoize(fn);
    expect(memoizedFn()).toBe("hello");
    expect(memoizedFn()).toBe("hello");
    expect(fn).toHaveBeenCalledOnce();
  });

  it("works with multiple arguments", () => {
    const fn = vi.fn((a: string, b: number): string => `${a}${b}`);
    const memoizedFn = memoize(fn);
    expect(memoizedFn("x", 1)).toBe("x1");
    expect(memoizedFn("x", 1)).toBe("x1"); // cache hit
    expect(memoizedFn("y", 2)).toBe("y2");
    expect(memoizedFn("x", 1)).toBe("x1"); // cache hit
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("works with object arguments using default JSON.stringify key", () => {
    const fn = vi.fn((obj: { name: string }): string => obj.name.toUpperCase());
    const memoizedFn = memoize(fn);
    expect(memoizedFn({ name: "alice" })).toBe("ALICE");
    expect(memoizedFn({ name: "alice" })).toBe("ALICE"); // cache hit
    expect(memoizedFn({ name: "bob" })).toBe("BOB");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("uses custom key function when provided", () => {
    const fn = vi.fn((obj: { id: number; name: string }): string => obj.name);
    const memoizedFn = memoize(fn, obj => `id:${obj.id}`);
    expect(memoizedFn({ id: 1, name: "alice" })).toBe("alice");
    expect(memoizedFn({ id: 1, name: "bob" })).toBe("alice"); // cache hit by id
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("handles function arguments with custom key", () => {
    const fn = vi.fn((a: number, b: number): number => a + b);
    const memoizedFn = memoize(fn, (a, b) => `${a}-${b}`);
    expect(memoizedFn(1, 2)).toBe(3);
    expect(memoizedFn(1, 2)).toBe(3); // cache hit
    expect(memoizedFn(2, 1)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("handles array arguments", () => {
    const fn = vi.fn((arr: number[]): number =>
      arr.reduce((sum, n) => sum + n, 0)
    );
    const memoizedFn = memoize(fn);
    expect(memoizedFn([1, 2, 3])).toBe(6);
    expect(memoizedFn([1, 2, 3])).toBe(6); // cache hit
    expect(memoizedFn([3, 2, 1])).toBe(6); // different array, different key
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("preserves function type signature", () => {
    const greet = (name: string, age: number): string => `${name} is ${age}`;
    const memoizedGreet = memoize(greet);
    const result: string = memoizedGreet("Alice", 30);
    expect(result).toBe("Alice is 30");
  });

  it("does not share cache between different memoized functions", () => {
    const fn1 = vi.fn((x: number): number => x + 1);
    const fn2 = vi.fn((x: number): number => x + 2);
    const memoizedFn1 = memoize(fn1);
    const memoizedFn2 = memoize(fn2);
    memoizedFn1(5);
    memoizedFn2(5);
    expect(memoizedFn1(5)).toBe(6);
    expect(memoizedFn2(5)).toBe(7);
    expect(fn1).toHaveBeenCalledExactlyOnceWith(5);
    expect(fn2).toHaveBeenCalledExactlyOnceWith(5);
  });
});
