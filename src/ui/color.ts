import { tuple, type FillTuple } from "../core/tuple.ts";
import { raise } from "../core/utils.ts";
import { zip } from "../data/zip.ts";
import { mapAccumulate, mapFind } from "../functional/map.ts";
import { clamp } from "../math/maths.ts";
import { slidingWindow } from "../math/slidingWindow.ts";

/**
 * Parses a hex color string into its `[r, g, b]` channel values.
 * @param {string} hex The color, as a hex string (e.g. `"ff0000"` or `"#ff0000"`).
 * @returns {FillTuple<number, 3>} The parsed `[r, g, b]` channel values.
 * @throws {Error} If `hex` isn't a recognizable hex color string.
 */
export const parseHexChannels = (hex: string): FillTuple<number, 3> =>
  // The regex always produces exactly 3 groups for a valid hex color; TS can't infer that statically.
  (hex.match(/[\da-f]{2}/gi)?.map(n => Number.parseInt(n, 16)) ??
    raise(new Error(`Invalid colour ${hex}`))) as FillTuple<number, 3>;

/**
 * Linearly interpolates between two colors' `[r, g, b]` channels (see {@link parseHexChannels}). Channel
 * values are clamped to `[0, 255]`, so a `percent` outside `[0, 1]` still produces a valid hex color rather
 * than malformed output.
 * @param {FillTuple<number, 3>} aChannels The starting color's channels.
 * @param {FillTuple<number, 3>} bChannels The ending color's channels.
 * @param {number} percent How far to interpolate from `aChannels` to `bChannels`, typically in `[0, 1]`.
 * @returns {string} The interpolated color, as a lowercase hex string without a leading `#`.
 */
export const lerpColors = (
  aChannels: FillTuple<number, 3>,
  bChannels: FillTuple<number, 3>,
  percent: number
): string =>
  zip(aChannels, bChannels)
    .map(([aChannel, bChannel]) =>
      Math.round(clamp(aChannel - (aChannel - bChannel) * percent, 0, 255))
        .toString(16)
        .padStart(2, "0")
    )
    .join("");

/** A `[color, weight]` pair describing one stop in a {@link createWeightedGradient}. */
type ColorWeight = [string, number];

/**
 * Builds a gradient lookup function from a list of colors and their relative weights, so that
 * `colorPercent` maps onto colors proportionally to each color's weight rather than assuming equal spacing.
 * Each stop's color is parsed to channels once, up front, rather than being re-parsed on every call to the
 * returned function.
 * @param {readonly ColorWeight[]} gradient The `[color, weight]` stops making up the gradient, in order.
 * @returns {(colorPercent: number) => string} A function that returns the interpolated color at a given position (in `[0, 1]`) along the gradient.
 * @throws {Error} If `gradient` is empty.
 */
export const createWeightedGradient = (
  gradient: readonly ColorWeight[]
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

  const relevantWeights = slidingWindow(percentWeights, 3, 1, -1);

  return (colorPercent: number): string =>
    mapFind(relevantWeights, ([prev, [channels, weightPercent], next], i) => {
      if (colorPercent > weightPercent) return null;

      const blendPercent =
        i > 0
          ? (colorPercent - prev[1]) / (weightPercent - prev[1])
          : colorPercent / weightPercent;

      return blendPercent <= 0.5
        ? lerpColors(prev[0], channels, blendPercent + 0.5)
        : lerpColors(channels, next[0], blendPercent - 0.5);
    }) ??
    gradient.at(-1)?.[0] ??
    raise(new Error("No items found in gradient!"));
};
