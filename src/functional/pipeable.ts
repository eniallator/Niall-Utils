import type { AnyArgFn } from "../timing/helpers.ts";

export interface DataFunc<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Data = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Args extends any[] = any[],
  Output = unknown,
> {
  (data: Data, ...args: Args): Output;
  (...args: Args): (data: Data) => Output;
}

type DataFuncData<Fn extends DataFunc> =
  Fn extends DataFunc<infer Data> ? Data : never;
type DataFuncArgs<Fn extends DataFunc> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends DataFunc<any, infer Args> ? Args : never;
type DataFuncOutput<Fn extends DataFunc> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends { (...args: any[]): infer R }
    ? ReturnType<Extract<R, AnyArgFn>>
    : never;

export const pipeable = <Fn extends DataFunc>(
  dataFirst: (
    data: DataFuncData<Fn>,
    ...args: DataFuncArgs<Fn>
  ) => DataFuncOutput<Fn>,
  isDataFirst: (
    args: DataFuncArgs<Fn> | [DataFuncData<Fn>, ...DataFuncArgs<Fn>]
  ) => boolean = args => dataFirst.length === args.length
) =>
  ((...args: DataFuncArgs<Fn> | [DataFuncData<Fn>, ...DataFuncArgs<Fn>]) =>
    isDataFirst(args)
      ? dataFirst(...(args as [DataFuncData<Fn>, ...DataFuncArgs<Fn>]))
      : (data: DataFuncData<Fn>) =>
          dataFirst(data, ...(args as DataFuncArgs<Fn>))) as Fn;

/**
 * Non-generic functions so you don't have to give the whole DataFunc interface when you want to define them
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const simplePipeable = <Data, Args extends any[], Output>(
  fn: (data: Data, ...args: Args) => Output,
  isDataFirst?: (args: Args | [Data, ...Args]) => boolean
) => pipeable<DataFunc<Data, Args, Output>>(fn, isDataFirst);
