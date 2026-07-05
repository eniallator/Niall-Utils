import type { AnyArgFn } from "../timing/helpers.ts";

/**
 * The dual call shape a pipeable function must support: called "data-first" with the data as the first
 * argument, or called "data-last" with just the extra args, returning a function that takes the data.
 * @template Data The type of the piped-through data.
 * @template Args The type of the remaining arguments.
 * @template Output The type produced once `Data` is supplied.
 */
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

/**
 * Builds a "pipeable" function from a single data-first implementation: the result can be called either as
 * `fn(data, ...args)` or as `fn(...args)` to get back a function `(data) => output`, which is handy for use
 * inside `pipe`/`Array.prototype.map`/etc.
 * @template Fn The {@link DataFunc} shape describing the data-first and data-last call signatures.
 * @param {(data: DataFuncData<Fn>, ...args: DataFuncArgs<Fn>) => DataFuncOutput<Fn>} dataFirst The data-first implementation.
 * @param {(args: DataFuncArgs<Fn> | [DataFuncData<Fn>, ...DataFuncArgs<Fn>]) => boolean} [isDataFirst] Decides, from the raw call arguments, whether the call was made data-first. Defaults to comparing argument counts against `dataFirst.length`.
 * @returns {Fn} A function supporting both the data-first and data-last call styles.
 */
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
 * Convenience wrapper around {@link pipeable} for non-generic functions, so you don't need to spell out the
 * full {@link DataFunc} interface just to get a pipeable function.
 * @template Data The type of the piped-through data.
 * @template Args The type of the remaining arguments.
 * @template Output The type produced once `Data` is supplied.
 * @param {(data: Data, ...args: Args) => Output} fn The data-first implementation.
 * @param {(args: Args | [Data, ...Args]) => boolean} [isDataFirst] Decides, from the raw call arguments, whether the call was made data-first.
 * @returns {DataFunc<Data, Args, Output>} A function supporting both the data-first and data-last call styles.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const simplePipeable = <Data, Args extends any[], Output>(
  fn: (data: Data, ...args: Args) => Output,
  isDataFirst?: (args: Args | [Data, ...Args]) => boolean
) => pipeable<DataFunc<Data, Args, Output>>(fn, isDataFirst);
