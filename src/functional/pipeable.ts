import type { AnyArgFn } from "../core/types.ts";

/**
 * The dual call shape a pipeable function must support: called "data-first" with the data as the first
 * argument, or called "data-last" with just the extra args, returning a function that takes the data.
 * @template Data The type of the piped-through data.
 * @template Args The type of the remaining arguments.
 * @template Output The type produced once `Data` is supplied.
 */
export interface DataFunc<
  // oxlint-disable-next-line typescript/no-explicit-any
  Data = any,
  // oxlint-disable-next-line typescript/no-explicit-any
  Args extends any[] = any[],
  Output = unknown,
> {
  (data: Data, ...args: Args): Output;
  (...args: Args): (data: Data) => Output;
}

type DataFuncData<Fn extends DataFunc> =
  Fn extends DataFunc<infer Data> ? Data : never;
type DataFuncArgs<Fn extends DataFunc> =
  // oxlint-disable-next-line typescript/no-explicit-any
  Fn extends DataFunc<any, infer Args> ? Args : never;
type DataFuncOutput<Fn extends DataFunc> =
  // oxlint-disable-next-line typescript/no-explicit-any
  Fn extends AnyArgFn<infer R extends AnyArgFn> ? ReturnType<R> : never;

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
): Fn =>
  ((...args: DataFuncArgs<Fn> | [DataFuncData<Fn>, ...DataFuncArgs<Fn>]) =>
    isDataFirst(args)
      ? dataFirst(...(args as [DataFuncData<Fn>, ...DataFuncArgs<Fn>]))
      : (data: DataFuncData<Fn>) =>
          dataFirst(data, ...(args as DataFuncArgs<Fn>))) as Fn;

/** The parameters of a tuple type `T`, minus the first one. */
type DropFirst<T extends unknown[]> = T extends [unknown, ...infer Rest]
  ? Rest
  : never;

/**
 * The leading parameters of a tuple type `T` that precede its known `Rest` suffix, kept as a tuple (rather
 * than indexed out one by one) so that, once spread back into a parameter list, their original labels
 * survive.
 */
type TakeFirst<T extends unknown[], Rest extends unknown[]> = T extends [
  ...infer First,
  ...Rest,
]
  ? First
  : never;

/**
 * The {@link DataFunc} shape for a plain function `Fn`, derived structurally instead of by hand — so it
 * keeps `Fn`'s own parameter names (e.g. `value`) rather than renaming the first one to `data`.
 */
export interface SimpleDataFunc<
  Fn extends (data: never, ...args: never[]) => unknown,
> {
  (...args: Parameters<Fn>): ReturnType<Fn>;
  (
    ...args: DropFirst<Parameters<Fn>>
  ): (
    ...args: TakeFirst<Parameters<Fn>, DropFirst<Parameters<Fn>>>
  ) => ReturnType<Fn>;
}

/**
 * The {@link DataFunc} counterpart of a plain function `Fn`, in {@link pipeable}'s own head+rest shape —
 * used only to drive {@link DataFuncData}/{@link DataFuncArgs}/{@link DataFuncOutput} and satisfy
 * {@link pipeable}'s constraint; {@link SimpleDataFunc} is what actually keeps `Fn`'s labels.
 */
type SimpleTwin<Fn extends (data: never, ...args: never[]) => unknown> =
  DataFunc<Parameters<Fn>[0], DropFirst<Parameters<Fn>>, ReturnType<Fn>>;

/**
 * Convenience wrapper around {@link pipeable} for non-generic functions, so you don't need to spell out the
 * full {@link DataFunc} interface just to get a pipeable function. Unlike {@link pipeable}, the returned
 * type keeps `fn`'s own parameter names instead of renaming them to `data`/`args`.
 * @template Fn The type of the data-first implementation.
 * @param {Fn} fn The data-first implementation.
 * @param {(args: DataFuncArgs<SimpleTwin<Fn>> | [...TakeFirst<Parameters<Fn>, DropFirst<Parameters<Fn>>>, ...DataFuncArgs<SimpleTwin<Fn>>]) => boolean} [isDataFirst] Decides, from the raw call arguments, whether the call was made data-first. Defaults to comparing argument counts against `fn.length`.
 * @returns {SimpleDataFunc<Fn>} A function supporting both the data-first and data-last call styles.
 */
export const simplePipeable = <
  // oxlint-disable-next-line typescript/no-explicit-any
  Fn extends (data: any, ...args: any[]) => unknown,
>(
  fn: Fn,
  isDataFirst?: (
    args:
      | DataFuncArgs<SimpleTwin<Fn>>
      | [
          ...TakeFirst<Parameters<Fn>, DropFirst<Parameters<Fn>>>,
          ...DataFuncArgs<SimpleTwin<Fn>>,
        ]
  ) => boolean
): SimpleDataFunc<Fn> =>
  pipeable<SimpleTwin<Fn>>(
    fn as (
      data: DataFuncData<SimpleTwin<Fn>>,
      ...args: DataFuncArgs<SimpleTwin<Fn>>
    ) => DataFuncOutput<SimpleTwin<Fn>>,
    isDataFirst as (
      args:
        | DataFuncArgs<SimpleTwin<Fn>>
        | [DataFuncData<SimpleTwin<Fn>>, ...DataFuncArgs<SimpleTwin<Fn>>]
    ) => boolean
  ) as unknown as SimpleDataFunc<Fn>;
