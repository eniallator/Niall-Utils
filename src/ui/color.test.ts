import { describe, expect, it } from "vitest";

import {
  createWeightedGradient,
  lerpColors,
  parseHexChannels,
} from "./color.ts";

describe("parseHexChannels", () => {
  it("parses a hex string into r, g, b channel values", () => {
    expect(parseHexChannels("ff0000")).toEqual([255, 0, 0]);
    expect(parseHexChannels("00ff00")).toEqual([0, 255, 0]);
    expect(parseHexChannels("0000ff")).toEqual([0, 0, 255]);
  });

  it("handles uppercase hex strings", () => {
    expect(parseHexChannels("0000FF")).toEqual([0, 0, 255]);
  });

  it("throws for an invalid hex string", () => {
    expect(() => parseHexChannels("zzzzzz")).toThrow("Invalid colour zzzzzz");
  });
});

describe("lerpColors", () => {
  it("returns the first color at 0 and the second color at 1", () => {
    const red = parseHexChannels("ff0000");
    const green = parseHexChannels("00ff00");
    expect(lerpColors(red, green, 0)).toBe("ff0000");
    expect(lerpColors(red, green, 1)).toBe("00ff00");
  });

  it("interpolates channels correctly at 0.5", () => {
    expect(
      lerpColors(parseHexChannels("ff0000"), parseHexChannels("00ff00"), 0.5)
    ).toBe("808000");
  });

  it("handles uppercase hex strings", () => {
    expect(
      lerpColors(parseHexChannels("0000FF"), parseHexChannels("FFFFFF"), 0.25)
    ).toBe("4040ff");
  });

  it("clamps channels for percent below 0", () => {
    const red = parseHexChannels("ff0000");
    const blue = parseHexChannels("0000ff");
    expect(lerpColors(red, blue, -1)).toBe("ff0000");
  });

  it("clamps channels for percent above 1", () => {
    const red = parseHexChannels("ff0000");
    const blue = parseHexChannels("0000ff");
    expect(lerpColors(red, blue, 2)).toBe("0000ff");
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

  it("throws when a gradient stop color is invalid", () => {
    expect(() => createWeightedGradient([["zzzzzz", 1]])).toThrow(
      "Invalid colour zzzzzz"
    );
  });
});
