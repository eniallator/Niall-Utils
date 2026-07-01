import type { UnionToTuple } from "./unionToTuple.ts";

type DeepKeys<T extends readonly unknown[]> = {
  [K in keyof T]: keyof T[K];
}[Extract<keyof T, number>];

type UnionToPartialRecurse<
  T extends readonly unknown[],
  K extends PropertyKey = DeepKeys<T>,
> = T extends [infer A, ...infer B]
  ?
      | (Partial<Record<Exclude<K, keyof A>, undefined>> & A)
      | UnionToPartialRecurse<B, K>
  : never;

/**
 * Lets you destructure types where keys only appear in _some_ of the cases.
 *
 * Consider the following:
 * ```ts
 * type Test = { a: string } | { b: number };
 * const obj: Test = {a: "foo"};
 * ```
 *
 * Normally the following will type error saying that the properties aren't defined:
 * ```ts
 * const {a, b} = obj;
 * ```
 *
 * However this will not, as it will make Test equivalent to `({ a: string; b: undefined } | { a: undefined; b: number })`:
 * ```ts
 * const {a, b} = obj as UnionToPartial<Test>;
 * ```
 */
export type UnionToPartial<T> = UnionToPartialRecurse<UnionToTuple<T>>;
