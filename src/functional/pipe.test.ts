import { describe, expect, it } from "vitest";

import { pipe } from "./pipe.ts";

describe("pipe", () => {
  it("returns the data unchanged when no mappers are provided", () => {
    expect(pipe(42)).toBe(42);
  });

  it("applies a single mapper", () => {
    const result = pipe(1, x => x * 2);
    expect(result).toBe(2);
  });

  it("applies two mappers in sequence", () => {
    const result = pipe(
      1,
      x => x + 1,
      x => x * 3
    );
    expect(result).toBe(6);
  });

  it("applies three mappers in sequence", () => {
    const result = pipe(
      1,
      x => x + 1,
      x => x * 2,
      x => x - 1
    );
    expect(result).toBe(3);
  });

  it("applies four mappers in sequence", () => {
    const result = pipe(
      1,
      x => x + 1,
      x => x * 2,
      x => x - 1,
      x => x / 2
    );
    expect(result).toBeCloseTo(1.5);
  });

  it("applies five mappers in sequence", () => {
    const result = pipe(
      1,
      x => x + 1,
      x => x * 2,
      x => x - 1,
      x => x / 2,
      x => Math.floor(x)
    );
    expect(result).toBe(1);
  });

  it("works with strings", () => {
    const result = pipe(
      "hello",
      s => s.toUpperCase(),
      s => s + " WORLD"
    );
    expect(result).toBe("HELLO WORLD");
  });

  it("works with arrays", () => {
    const result = pipe(
      [1, 2, 3],
      arr => arr.map(x => x * 2),
      arr => [...arr, 4]
    );
    expect(result).toEqual([2, 4, 6, 4]);
  });

  it("works with objects", () => {
    const result = pipe(
      { a: 1 },
      obj => ({ ...obj, b: 2 }),
      obj => ({ ...obj, c: obj.a + obj.b })
    );
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("handles empty array input", () => {
    const result = pipe(
      [],
      arr => [...arr, 1],
      arr => arr.map(String)
    );
    expect(result).toEqual(["1"]);
  });

  it("handles zero as input", () => {
    const result = pipe(
      0,
      x => x + 1,
      x => String(x)
    );
    expect(result).toBe("1");
  });

  it("handles false as input", () => {
    const result = pipe(
      false,
      x => !x,
      x => String(x)
    );
    expect(result).toBe("true");
  });

  it("handles many mappers (up to the interface limit)", () => {
    const result = pipe(
      0,
      x => x + 1,
      x => x + 2,
      x => x + 3,
      x => x + 4,
      x => x + 5,
      x => x + 6,
      x => x + 7,
      x => x + 8,
      x => x + 9,
      x => x + 10,
      x => x + 11,
      x => x + 12,
      x => x + 13,
      x => x + 14,
      x => x + 15
    );
    expect(result).toBe(120);
  });
});
