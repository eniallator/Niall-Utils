import { tuple, type FillTuple } from "../core/tuple.ts";
import type { ReadonlyNonEmptyArray } from "../core/types.ts";
import { raise } from "../core/utils.ts";
import { zip } from "../data/zip.ts";
import { mapAccumulate, mapFind } from "../functional/map.ts";
import { clamp } from "../math/maths.ts";
import { slidingWindow } from "../math/slidingWindow.ts";

/** Matches a `RRGGBB(AA)?` hex color with an optional leading `#`, capturing the rgb and (optional) alpha digits. */
const HEX_COLOR_REGEX = /^#?([\da-f]{6})([\da-f]{2})?$/i;

/**
 * Parses a hex color string into its `[r, g, b, a=255]` channel values.
 * @param {string} color The color, as a 6 digit hex string with an optional leading `#` (e.g. `"ff0000ff"` or
 * `"#ff0000ff"`).
 * @returns {FillTuple<number, 4>} The parsed `[r, g, b, a=255]` channel values.
 * @throws {Error} If `color` isn't a 6 digit hex color string.
 */
export const parseHexChannels = (color: string): FillTuple<number, 4> => {
  const match =
    HEX_COLOR_REGEX.exec(color) ?? raise(new Error(`Invalid colour ${color}`));
  const [_, rgb, a = "ff"] = match;
  const n = Number.parseInt(rgb as string, 16);
  return tuple(
    (n >> 16) & 255,
    (n >> 8) & 255,
    n & 255,
    Number.parseInt(a, 16)
  );
};

/**
 * Linearly interpolates between two colors' `[r, g, b, a=255]` channels (see {@link parseHexChannels}). Channel
 * values are clamped to `[0, 255]`, so a `percent` outside `[0, 1]` still produces a valid hex color rather
 * than malformed output.
 * @param {FillTuple<number, 4>} aChannels The starting color's channels.
 * @param {FillTuple<number, 4>} bChannels The ending color's channels.
 * @param {number} percent How far to interpolate from `aChannels` to `bChannels`, typically in `[0, 1]`.
 * @returns {string} The interpolated color, as a lowercase `rrggbbaa` hex string without a leading `#`.
 */
export const lerpColors = (
  aChannels: FillTuple<number, 4>,
  bChannels: FillTuple<number, 4>,
  percent: number
): string =>
  zip(aChannels, bChannels)
    .map(([aChannel, bChannel]) =>
      Math.round(clamp(aChannel - (aChannel - bChannel) * percent, 0, 255))
        .toString(16)
        .padStart(2, "0")
    )
    .join("");

/**
 * Builds a gradient lookup function from a list of colors and their relative weights, so that
 * `colorPercent` maps onto colors proportionally to each color's weight rather than assuming equal spacing.
 * Each stop's color is parsed to channels once, up front, rather than being re-parsed on every call to the
 * returned function.
 * @param {ReadonlyNonEmptyArray<[color: string, weight: number]>} gradient The `[color, weight]` stops making up the gradient, in order.
 * @returns {(colorPercent: number) => string} A function that returns the interpolated color at a given position (in `[0, 1]`) along the gradient.
 * @throws {Error} If `gradient` is empty.
 */
export const createWeightedGradient = (
  gradient: ReadonlyNonEmptyArray<[color: string, weight: number]>
): ((colorPercent: number) => string) => {
  const gradientChannels = gradient.map(([color]) => parseHexChannels(color));
  const totalWeight = gradient.reduce((acc, row) => acc + row[1], 0);

  const percentWeights = mapAccumulate(
    zip(gradient, gradientChannels),
    (acc, [[, weight], channels]) => {
      const currWeight = acc + weight / totalWeight;
      return [currWeight, tuple(channels, currWeight)];
    },
    0
  );

  const lastColor =
    gradientChannels
      .slice(-1)
      .map(channels => lerpColors(channels, channels, 0))
      .at(0) ?? raise(new Error("No items found in gradient!"));

  const relevantWeights = slidingWindow(percentWeights, 3, -1, 1);

  return (color: number): string =>
    mapFind(relevantWeights, ([prev, [channels, weight], next], i) => {
      if (color > weight) return null;

      const blend =
        i > 0 ? (color - prev[1]) / (weight - prev[1]) : color / weight;

      return blend <= 0.5
        ? lerpColors(prev[0], channels, blend + 0.5)
        : lerpColors(channels, next[0], blend - 0.5);
    }) ?? lastColor;
};
