import { describe, expect, it } from "vitest";

import {
  cartesianToPolar,
  clamp,
  positiveMod,
  polarToCartesian,
} from "./maths.ts";

describe("cartesianToPolar", () => {
  it("converts (3, 4) to polar coordinates", () => {
    const [r, theta] = cartesianToPolar(3, 4);
    expect(r).toBeCloseTo(5);
    expect(theta).toBeCloseTo(Math.atan2(4, 3));
  });

  it("handles (0, 0)", () => {
    const [r, theta] = cartesianToPolar(0, 0);
    expect(r).toBe(0);
    expect(theta).toBe(0);
  });

  it("handles negative coordinates", () => {
    const [r, theta] = cartesianToPolar(-1, -1);
    expect(r).toBeCloseTo(Math.sqrt(2));
    expect(theta).toBeCloseTo(-3 * Math.PI / 4);
  });
});

describe("polarToCartesian", () => {
  it("converts (5, 0) to cartesian coordinates", () => {
    const [x, y] = polarToCartesian(5, 0);
    expect(x).toBeCloseTo(5);
    expect(y).toBeCloseTo(0);
  });

  it("converts (1, Math.PI/2) to cartesian coordinates", () => {
    const [x, y] = polarToCartesian(1, Math.PI / 2);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(1);
  });

  it("handles magnitude 0", () => {
    const [x, y] = polarToCartesian(0, 100);
    expect(Math.abs(x)).toBe(0);
    expect(Math.abs(y)).toBe(0);
  });
});

describe("positiveMod", () => {
  it("returns positive modulo for positive numbers", () => {
    expect(positiveMod(7, 3)).toBe(1);
  });

  it("returns positive modulo for negative dividend", () => {
    expect(positiveMod(-7, 3)).toBe(2);
  });

  it("handles exact division", () => {
    expect(positiveMod(9, 3)).toBe(0);
  });

  it("handles negative divisor", () => {
    expect(positiveMod(7, -3)).toBe(-2);
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it("handles negative ranges", () => {
    expect(clamp(-5, -10, -2)).toBe(-5);
  });
});
