import { tuple } from "../core/tuple.ts";
import { pipeable } from "../functional/pipeable.ts";

/**
 * Returns an object's own enumerable keys, typed as `(keyof O)[]` instead of the widened `string[]`
 * that `Object.keys` returns. Pipeable: call as `typedKeys(obj, includeSymbols?)` or
 * `typedKeys(includeSymbols?)(obj)`.
 * @template O The type of the object being inspected.
 * @param {O} obj The object to read keys from.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {(keyof O)[]} The object's own keys.
 */
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

/** A single `[key, value]` pair of an object `O`, typed against `O`'s actual keys and value types. */
export type Entry<O extends object> = [keyof O, O[keyof O]];

/**
 * Returns an object's own enumerable entries, typed as `Entry<O>[]` instead of the widened
 * `[string, unknown][]` that `Object.entries` returns. Pipeable: call as
 * `typedToEntries(obj, includeSymbols?)` or `typedToEntries(includeSymbols?)(obj)`.
 * @template O The type of the object being inspected.
 * @param {O} obj The object to read entries from.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {Entry<O>[]} The object's own `[key, value]` entries.
 */
export const typedToEntries = pipeable<{
  <O extends object>(obj: O, includeSymbols?: boolean): Entry<O>[];
  (includeSymbols?: boolean): <O extends object>(obj: O) => Entry<O>[];
}>(
  <O extends object>(obj: O, includeSymbols?: boolean): Entry<O>[] =>
    typedKeys(obj, includeSymbols).map(key => tuple(key, obj[key])),
  ([first]) => typeof first === "object"
);

/**
 * The inverse of {@link typedToEntries}: builds an object from an array of `Entry<O>` pairs, typed as `O`
 * instead of the widened `{ [k: string]: unknown }` that `Object.fromEntries` returns.
 * @template O The type of object to reconstruct.
 * @param {readonly Entry<O>[]} entries The `[key, value]` entries to build the object from.
 * @returns {O} The resulting object.
 */
export const typedFromEntries = <O extends object>(
  entries: readonly Entry<O>[]
): O => Object.fromEntries(entries) as O;

/**
 * Maps every entry of an object to a new `[key, value]` pair, producing a new object, similarly to
 * `Array.prototype.map` but for objects.
 * @template I The type of the input object.
 * @template O The type of the resulting object.
 * @param {I} obj The object to map over.
 * @param {(entry: Entry<I>, index: number, array: readonly Entry<I>[]) => Entry<O>} mapper Maps each entry to a new entry.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {O} A new object built from the mapped entries.
 */
export const mapObject = <I extends object, O extends object>(
  obj: I,
  mapper: (
    entry: Entry<I>,
    index: number,
    array: readonly Entry<I>[]
  ) => Entry<O>,
  includeSymbols: boolean = false
): O => typedFromEntries(typedToEntries(obj, includeSymbols).map(mapper));

/**
 * Filters an object's entries by a predicate, producing a new object, similarly to `Array.prototype.filter`
 * but for objects.
 * @template O The type of the object being filtered.
 * @param {O} obj The object to filter.
 * @param {(value: Entry<O>, index: number, array: readonly Entry<O>[]) => boolean} predicate Returns `true` to keep an entry.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {O} A new object containing only the entries that satisfied `predicate`.
 */
export const filterObject = <O extends object>(
  obj: O,
  predicate: (
    value: Entry<O>,
    index: number,
    array: readonly Entry<O>[]
  ) => boolean,
  includeSymbols: boolean = false
): O => typedFromEntries(typedToEntries(obj, includeSymbols).filter(predicate));

/**
 * Maps every entry of a record to a new `[key, value]` pair, potentially changing the key and value types,
 * producing a new record. Pipeable: call as `mapRecord(rec, mapper, includeSymbols?)` or
 * `mapRecord(mapper, includeSymbols?)(rec)`.
 * @template R The type of the input record.
 * @template K The key type of the resulting record.
 * @template V The value type of the resulting record.
 * @param {R} rec The record to map over.
 * @param {(entry: Entry<R>, index: number, array: readonly Entry<R>[]) => [K, V]} mapper Maps each entry to a new `[key, value]` pair.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {Record<K, V>} A new record built from the mapped entries.
 */
export const mapRecord = pipeable<{
  <R extends Record<PropertyKey, unknown>, K extends PropertyKey, V>(
    rec: R,
    mapper: (
      entry: Entry<R>,
      index: number,
      array: readonly Entry<R>[]
    ) => [K, V],
    includeSymbols?: boolean
  ): Record<K, V>;
  <R extends Record<PropertyKey, unknown>, K extends PropertyKey, V>(
    mapper: (
      entry: Entry<R>,
      index: number,
      array: readonly Entry<R>[]
    ) => [K, V],
    includeSymbols?: boolean
  ): (rec: R) => Record<K, V>;
}>(
  <R extends Record<PropertyKey, unknown>, K extends PropertyKey, V>(
    rec: R,
    mapper: (
      entry: Entry<R>,
      index: number,
      array: readonly Entry<R>[]
    ) => [K, V],
    includeSymbols: boolean = false
  ): Record<K, V> =>
    typedFromEntries(typedToEntries(rec, includeSymbols).map(mapper)),
  ([first]) => typeof first === "object"
);

/**
 * Picks a subset of an object's keys, producing a new object with only those keys, similarly to lodash's
 * `pick`. Pipeable: call as `pick(obj, keys, includeSymbols?)` or `pick(keys, includeSymbols?)(obj)`.
 * @template O The type of the object being picked from.
 * @template K The subset of `O`'s keys to keep.
 * @param {O} obj The object to pick keys from.
 * @param {readonly K[]} keys The keys to keep.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {Pick<O, K>} A new object containing only the picked keys.
 */
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

/**
 * Removes a subset of an object's keys, producing a new object without those keys, similarly to lodash's
 * `omit`. Pipeable: call as `omit(obj, keys, includeSymbols?)` or `omit(keys, includeSymbols?)(obj)`.
 * @template O The type of the object being omitted from.
 * @template K The subset of `O`'s keys to remove.
 * @param {O} obj The object to remove keys from.
 * @param {readonly K[]} keys The keys to remove.
 * @param {boolean} [includeSymbols] Whether to also include own symbol keys. Defaults to `false`.
 * @returns {Omit<O, K>} A new object without the removed keys.
 */
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
