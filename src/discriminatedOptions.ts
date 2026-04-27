import type { UnionToTuple } from "./unionToTuple.ts";

type DeepKeys<T extends readonly unknown[]> = {
  [K in keyof T]: keyof T[K];
}[Extract<keyof T, number>];

type UnionToPartialRecurse<
  T extends readonly unknown[],
  K extends string | number | symbol = DeepKeys<T>,
> = T extends [infer A, ...infer B]
  ?
      | (Partial<Record<Exclude<K, keyof A>, undefined>> & A)
      | UnionToPartialRecurse<B, K>
  : never;

/**
 * Lets you destructure types where keys only appear in _some_ of the cases.
 *
 * Consider the following:
 * type Test = { a: string } | { b: number };
 * const obj = {a: "foo"} as Test;
 *
 * Normally the following will type error saying that the properties aren't defined:
 * const {a, b} = obj;
 *
 * However this will not, as it will make Test equivalent to ({ a: string; b: undefined } | { a: undefined; b: number }):
 * const {a, b} = obj as UnionToPartial<Test>;
 */
type UnionToPartial<T> = UnionToPartialRecurse<UnionToTuple<T>>;

export type DiscriminatedOptions<D, U> = {
  external: D & U;
  internal: D & UnionToPartial<U>;
};
