import { raise } from "../core/utils.ts";

type Zippable = [
  readonly unknown[],
  readonly unknown[],
  ...(readonly unknown[])[],
];

type ZippedItem<Z extends Zippable> = {
  [K in keyof Z]: Z[K] extends (infer T)[] ? T : Z[K];
};

/**
 * Combines two or more arrays of equal length into an array of tuples, pairing up elements at the same index.
 * @template Z A tuple of at least two arrays being zipped together.
 * @param {...Z} toZip The arrays to zip together. Must all have the same length.
 * @returns {ZippedItem<Z>[]} An array of tuples, one per index, each containing the corresponding element from every input array.
 * @throws {Error} If the arrays don't all have the same length.
 */
export const zip = <const Z extends Zippable>(...toZip: Z): ZippedItem<Z>[] =>
  toZip.every(arr => arr.length === toZip[0].length)
    ? toZip[0].map((_, i) => toZip.map(arr => arr[i]) as ZippedItem<Z>)
    : raise(new Error("Zip index out of bounds"));
