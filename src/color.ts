import { mapAccumulate, mapFind } from "./map.ts";
import { slidingWindow } from "./slidingWindow.ts";
import { tuple } from "./tuple.ts";
import { raise } from "./utils.ts";
import { zip } from "./zip.ts";

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

type ColorWeight = [string, number];

export const createWeightedGradient = (
  gradient: ColorWeight[]
): ((colorPercent: number) => string) => {
  const totalWeight = gradient.reduce((acc, row) => acc + row[1], 0);

  const percentWeights = mapAccumulate(gradient, 0, (acc, [color, weight]) => {
    const currWeight = acc + weight / totalWeight;
    return [currWeight, tuple(color, currWeight)];
  });

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
