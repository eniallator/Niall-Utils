import { describe, expect, it } from "vitest";

import { lerpColors, createWeightedGradient } from "./color";

describe("lerpColors", () => {
  it("returns the first color at 0 and the second color at 1", () => {
    expect(lerpColors("ff0000", "00ff00", 0)).toBe("ff0000");
    expect(lerpColors("ff0000", "00ff00", 1)).toBe("00ff00");
  });

  it("interpolates channels correctly at 0.5", () => {
    expect(lerpColors("ff0000", "00ff00", 0.5)).toBe("808000");
  });

  it("handles uppercase hex strings", () => {
    expect(lerpColors("0000FF", "FFFFFF", 0.25)).toBe("4040ff");
  });

  it("throws when the first color is invalid", () => {
    expect(() => lerpColors("zzzzzz", "00ff00", 0.5)).toThrow(
      "Invalid colour a zzzzzz"
    );
  });

  it("throws when the second color is invalid", () => {
    expect(() => lerpColors("ff0000", "xxxxxx", 0.5)).toThrow(
      "Invalid colour b xxxxxx"
    );
  });
});

describe("createWeightedGradient", () => {
  it("creates a cyclic gradient and returns the expected midpoint colors", () => {
    const gradient = createWeightedGradient([
      ["ff0000", 1],
      ["00ff00", 1],
      ["0000ff", 1],
    ]);

    expect(gradient(0)).toBe("800080");
    expect(gradient(1 / 3)).toBe("808000");
    expect(gradient(0.5)).toBe("00ff00");
    expect(gradient(0.55)).toBe("00d926");
  });

  it("returns a gradient entry for a two-color stop list", () => {
    const gradient = createWeightedGradient([
      ["ff0000", 1],
      ["00ff00", 1],
    ]);

    expect(gradient(0.25)).toBe("ff0000");
    expect(gradient(0.5)).toBe("808000");
    expect(gradient(0.75)).toBe("00ff00");
  });

  it("throws when the gradient contains no entries", () => {
    const gradient = createWeightedGradient([]);
    expect(() => gradient(0.5)).toThrow("No items found in gradient!");
  });
});
