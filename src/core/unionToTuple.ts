// https://www.hacklewayne.com/typescript-convert-union-to-tuple-array-yes-but-how
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Contra<T> = T extends any ? (arg: T) => void : never;

type InferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;

type PickOne<T> = InferContra<InferContra<Contra<Contra<T>>>>;

/**
 * Converts a union type into a tuple type containing each member of the union exactly once.
 * The resulting element order is not guaranteed, as it depends on TypeScript's internal union ordering.
 * @template T The union type to convert.
 */
export type UnionToTuple<T> =
  PickOne<T> extends infer U
    ? Exclude<T, U> extends never
      ? [T]
      : [...UnionToTuple<Exclude<T, U>>, U]
    : never;
