import { tuple } from "../core/tuple.ts";
import { pipeable } from "../functional/pipeable.ts";

export const typedKeys = pipeable<{
  <O extends object>(obj: O, includeSymbols?: boolean): (keyof O)[];
  (includeSymbols?: boolean): <O extends object>(obj: O) => (keyof O)[];
}>(
  <O extends object>(obj: O, includeSymbols?: boolean): (keyof O)[] =>
    includeSymbols
      ? (Object.getOwnPropertyNames(obj) as (keyof O)[]).concat(
          Object.getOwnPropertySymbols(obj) as (keyof O)[]
        )
      : (Object.getOwnPropertyNames(obj) as (keyof O)[]),
  ([first]) => typeof first === "object"
);

export type Entry<O extends object> = [keyof O, O[keyof O]];

export const typedToEntries = pipeable<{
  <O extends object>(obj: O, includeSymbols?: boolean): Entry<O>[];
  (includeSymbols?: boolean): <O extends object>(obj: O) => Entry<O>[];
}>(
  <O extends object>(obj: O, includeSymbols?: boolean): Entry<O>[] =>
    typedKeys(obj, includeSymbols).map(key => tuple(key, obj[key])),
  ([first]) => typeof first === "object"
);

export const typedFromEntries = <O extends object>(
  entries: readonly Entry<O>[]
): O => Object.fromEntries(entries) as O;

export const mapObject = <I extends object, O extends object>(
  obj: I,
  mapper: (
    entry: Entry<I>,
    index: number,
    array: readonly Entry<I>[]
  ) => Entry<O>,
  includeSymbols: boolean = false
): O => typedFromEntries(typedToEntries(obj, includeSymbols).map(mapper));

export const mapRecord = <
  R extends Record<PropertyKey, unknown>,
  K extends PropertyKey,
  V,
>(
  rec: R,
  mapper: (
    entry: Entry<R>,
    index: number,
    array: readonly Entry<R>[]
  ) => [K, V],
  includeSymbols: boolean = false
): Record<K, V> =>
  typedFromEntries(typedToEntries(rec, includeSymbols).map(mapper));

export const filterObject = <O extends object>(
  obj: O,
  predicate: (
    value: Entry<O>,
    index: number,
    array: readonly Entry<O>[]
  ) => boolean,
  includeSymbols: boolean = false
) => typedFromEntries(typedToEntries(obj, includeSymbols).filter(predicate));

export const pick = pipeable<{
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols?: boolean
  ): Pick<O, K>;
  <K extends string>(
    keys: readonly K[],
    includeSymbols?: boolean
  ): <O extends Record<string, unknown>>(obj: O) => Pick<O, K>;
}>(
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols: boolean = false
  ): Pick<O, K> =>
    filterObject(obj, ([key]) => keys.includes(key as K), includeSymbols),
  ([first]) => !Array.isArray(first)
);

export const omit = pipeable<{
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols?: boolean
  ): Omit<O, K>;
  <K extends string>(
    keys: readonly K[],
    includeSymbols?: boolean
  ): <O extends Record<string, unknown>>(obj: O) => Omit<O, K>;
}>(
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols: boolean = false
  ): Omit<O, K> =>
    filterObject(obj, ([key]) => !keys.includes(key as K), includeSymbols),
  ([first]) => !Array.isArray(first)
);
