import { mapAccumulate, mapFind } from "../functional/map.ts";
import { slidingWindow } from "../math/slidingWindow.ts";
import { tuple } from "../core/tuple.ts";
import { raise } from "../core/utils.ts";
import { zip } from "../data/zip.ts";

/**
 * Linearly interpolates between two hex color strings, channel by channel.
 * @param {string} a The starting color, as a hex string (e.g. `"ff0000"` or `"#ff0000"`).
 * @param {string} b The ending color, as a hex string.
 * @param {number} percent How far to interpolate from `a` to `b`, typically in `[0, 1]`.
 * @returns {string} The interpolated color, as a lowercase hex string without a leading `#`.
 * @throws {Error} If `a` or `b` isn't a recognizable hex color string.
 */
export const lerpColors = (a: string, b: string, percent: number): string => {
  const aChannels =
    a.match(/[\da-f]{2}/gi)?.map(n => Number.parseInt(n, 16)) ??
    raise(new Error(`Invalid colour a ${a}`));
  const bChannels =
    b.match(/[\da-f]{2}/gi)?.map(n => Number.parseInt(n, 16)) ??
    raise(new Error(`Invalid colour b ${b}`));

  return zip(aChannels, bChannels)
    .map(([aChannel, bChannel]) =>
      Math.round(aChannel - (aChannel - bChannel) * percent)
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
};

/** A `[color, weight]` pair describing one stop in a {@link createWeightedGradient}. */
type ColorWeight = [string, number];

/**
 * Builds a gradient lookup function from a list of colors and their relative weights, so that
 * `colorPercent` maps onto colors proportionally to each color's weight rather than assuming equal spacing.
 * @param {readonly ColorWeight[]} gradient The `[color, weight]` stops making up the gradient, in order.
 * @returns {(colorPercent: number) => string} A function that returns the interpolated color at a given position (in `[0, 1]`) along the gradient.
 * @throws {Error} If `gradient` is empty.
 */
export const createWeightedGradient = (
  gradient: readonly ColorWeight[]
): ((colorPercent: number) => string) => {
  const totalWeight = gradient.reduce((acc, row) => acc + row[1], 0);

  const percentWeights = mapAccumulate(
    gradient,
    (acc, [color, weight]) => {
      const currWeight = acc + weight / totalWeight;
      return [currWeight, tuple(color, currWeight)];
    },
    0
  );

  const relevantWeights = slidingWindow(percentWeights, 3, 1, -1);

  return (colorPercent: number): string =>
    mapFind(relevantWeights, ([prev, [color, weightPercent], next], i) => {
      if (colorPercent > weightPercent) return null;

      const blendPercent =
        i > 0
          ? (colorPercent - prev[1]) / (weightPercent - prev[1])
          : colorPercent / weightPercent;

      return blendPercent <= 0.5
        ? lerpColors(prev[0], color, blendPercent + 0.5)
        : lerpColors(color, next[0], blendPercent - 0.5);
    }) ??
    gradient.at(-1)?.[0] ??
    raise(new Error("No items found in gradient!"));
};
