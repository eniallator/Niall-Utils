import { describe, expect, it } from "vitest";

import type { ReadonlyNonEmptyArray } from "../core/types.ts";
import {
  createWeightedGradient,
  lerpColors,
  parseHexChannels,
} from "./color.ts";

describe("parseHexChannels", () => {
  it("parses a hex string into r, g, b channel values with an opaque alpha", () => {
    expect(parseHexChannels("ff0000")).toEqual([255, 0, 0, 255]);
    expect(parseHexChannels("00ff00")).toEqual([0, 255, 0, 255]);
    expect(parseHexChannels("0000ff")).toEqual([0, 0, 255, 255]);
  });

  it("handles uppercase hex strings", () => {
    expect(parseHexChannels("0000FF")).toEqual([0, 0, 255, 255]);
  });

  it("accepts a leading #", () => {
    expect(parseHexChannels("#ff0000")).toEqual([255, 0, 0, 255]);
  });

  it("parses an alpha channel when 8 digits are given", () => {
    expect(parseHexChannels("ff000080")).toEqual([255, 0, 0, 128]);
    expect(parseHexChannels("#00ff0000")).toEqual([0, 255, 0, 0]);
    expect(parseHexChannels("0000FFAB")).toEqual([0, 0, 255, 171]);
  });

  it("throws for an invalid hex string", () => {
    expect(() => parseHexChannels("zzzzzz")).toThrow("Invalid colour zzzzzz");
  });

  it.each(["f00", "ff00000", "ff0000000", "xff0000", "ff0000 "])(
    "throws for a hex string that isn't 6 digits: %j",
    color => {
      expect(() => parseHexChannels(color)).toThrow(`Invalid colour ${color}`);
    }
  );
});

describe("lerpColors", () => {
  it("returns the first color at 0 and the second color at 1", () => {
    const red = parseHexChannels("ff0000");
    const green = parseHexChannels("00ff00");
    expect(lerpColors(red, green, 0)).toBe("ff0000ff");
    expect(lerpColors(red, green, 1)).toBe("00ff00ff");
  });

  it("interpolates channels correctly at 0.5", () => {
    expect(
      lerpColors(parseHexChannels("ff0000"), parseHexChannels("00ff00"), 0.5)
    ).toBe("808000ff");
  });

  it("handles uppercase hex strings", () => {
    expect(
      lerpColors(parseHexChannels("0000FF"), parseHexChannels("FFFFFF"), 0.25)
    ).toBe("4040ffff");
  });

  it("interpolates the alpha channel", () => {
    const opaque = parseHexChannels("ff0000ff");
    const transparent = parseHexChannels("ff000000");
    expect(lerpColors(opaque, transparent, 0)).toBe("ff0000ff");
    expect(lerpColors(opaque, transparent, 0.5)).toBe("ff000080");
    expect(lerpColors(opaque, transparent, 1)).toBe("ff000000");
  });

  it("interpolates alpha independently of the rgb channels", () => {
    expect(
      lerpColors(
        parseHexChannels("ff000000"),
        parseHexChannels("00ff00ff"),
        0.5
      )
    ).toBe("80800080");
  });

  it("clamps channels for percent below 0", () => {
    const red = parseHexChannels("ff0000");
    const blue = parseHexChannels("0000ff");
    expect(lerpColors(red, blue, -1)).toBe("ff0000ff");
  });

  it("clamps channels for percent above 1", () => {
    const red = parseHexChannels("ff0000");
    const blue = parseHexChannels("0000ff");
    expect(lerpColors(red, blue, 2)).toBe("0000ffff");
  });
});

describe("createWeightedGradient", () => {
  it("creates a cyclic gradient and returns the expected midpoint colors", () => {
    const gradient = createWeightedGradient([
      ["ff0000", 1],
      ["00ff00", 1],
      ["0000ff", 1],
    ]);

    expect(gradient(0)).toBe("800080ff");
    expect(gradient(1 / 3)).toBe("808000ff");
    expect(gradient(0.5)).toBe("00ff00ff");
    expect(gradient(0.55)).toBe("00d926ff");
  });

  it("returns a gradient entry for a two-color stop list", () => {
    const gradient = createWeightedGradient([
      ["ff0000", 1],
      ["00ff00", 1],
    ]);

    expect(gradient(0.25)).toBe("ff0000ff");
    expect(gradient(0.5)).toBe("808000ff");
    expect(gradient(0.75)).toBe("00ff00ff");
  });

  it("falls back to the normalised last color beyond the end of the gradient", () => {
    expect(
      createWeightedGradient([
        ["ff0000", 1],
        ["00FF00", 1],
      ])(1.5)
    ).toBe("00ff00ff");
    expect(
      createWeightedGradient([
        ["ff0000", 1],
        ["#00ff0080", 1],
      ])(1.5)
    ).toBe("00ff0080");
  });

  it("interpolates alpha across gradient stops", () => {
    const gradient = createWeightedGradient([
      ["ff000000", 1],
      ["ff0000ff", 1],
    ]);

    expect(gradient(0.25)).toBe("ff000000");
    expect(gradient(0.5)).toBe("ff000080");
    expect(gradient(0.75)).toBe("ff0000ff");
  });

  it("throws when the gradient contains no entries", () => {
    expect(() =>
      createWeightedGradient(
        [] as unknown as ReadonlyNonEmptyArray<[color: string, weight: number]>
      )
    ).toThrow("No items found in gradient!");
  });

  it("throws when a gradient stop color is invalid", () => {
    expect(() => createWeightedGradient([["zzzzzz", 1]])).toThrow(
      "Invalid colour zzzzzz"
    );
  });
});
