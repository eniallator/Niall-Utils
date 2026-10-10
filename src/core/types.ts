/** A function accepting any arguments and returning `Return`. Used as a generic function-shaped constraint. */
// oxlint-disable-next-line typescript/no-explicit-any
export type AnyArgFn<Return = unknown> = (...args: any[]) => Return;

/** Extracts the resolved type `T` from a function type that returns `Promise<T>`. */
export type AsyncReturnType<Fn extends AnyArgFn<Promise<unknown>>> =
  Fn extends AnyArgFn<Promise<infer T>> ? T : never;

/** A tuple-typed array guaranteed to contain at least one `T`. */
export type NonEmptyArray<T> = [T, ...T[]];

/** A tuple-typed array guaranteed to contain at least one `T`. */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...(readonly T[])];
