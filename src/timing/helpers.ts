/** A function accepting any arguments and returning `Return`. Used as a generic function-shaped constraint. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArgFn<Return = unknown> = (...args: any[]) => Return;

/** Extracts the resolved type `T` from a function type that returns `Promise<T>`. */
export type AsyncReturnType<Fn extends AnyArgFn<Promise<unknown>>> =
  Fn extends AnyArgFn<Promise<infer T>> ? T : never;
