import { raise } from "../core/utils.ts";

type Zippable = [
  readonly unknown[],
  readonly unknown[],
  ...(readonly unknown[])[],
];

type ZippedItem<Z extends Zippable> = {
  [K in keyof Z]: Z[K] extends readonly (infer T)[] ? T : Z[K];
};

/**
 * Combines two or more arrays of equal length into an array of tuples, pairing up elements at the same index.
 * @template A A tuple of at least two arrays being zipped together.
 * @param {...A} args The arrays to zip together. Must all have the same length.
 * @returns {ZippedItem<A>[]} An array of tuples, one per index, each containing the corresponding element from every input array.
 * @throws {Error} If the arrays don't all have the same length.
 */
export const zip = <const A extends Zippable>(...args: A): ZippedItem<A>[] =>
  args.every(arr => arr.length === args[0].length)
    ? args[0].map((_, i) => args.map(arr => arr[i]) as ZippedItem<A>)
    : raise(new Error("Zip index out of bounds"));
