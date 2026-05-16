// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyArgFn<Return = unknown> = (...args: any[]) => Return;

export type AsyncReturnType<Fn extends AnyArgFn<Promise<unknown>>> =
  Fn extends AnyArgFn<Promise<infer T>> ? T : never;
