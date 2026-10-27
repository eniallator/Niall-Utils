import { tuple } from "../core/tuple.ts";
import { pipeable } from "../functional/pipeable.ts";

/**
 * Returns an object's own enumerable keys, typed as `(keyof O)[]` instead of the widened `string[]`
 * that `Object.keys` returns. Symbol keys are included only when `includeSymbols` is `true`. Pipeable: call
 * as `typedKeys(obj, includeSymbols?)` or `typedKeys(includeSymbols?)(obj)`.
 */
export const typedKeys = pipeable<{
  /**
   * Returns the object's own keys, typed as `keyof O`.
   * @template O The type of the object being inspected.
   * @param {O} obj The object to read keys from.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {(keyof O)[]} The object's own keys.
   */
  <O extends object>(obj: O, includeSymbols?: boolean): (keyof O)[];
  /**
   * Data-last form of {@link typedKeys}, for use in `pipe`/`Array.prototype.map`/etc.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {<O extends object>(obj: O) => (keyof O)[]} A function returning the keys of the object it's given.
   */
  (includeSymbols?: boolean): <O extends object>(obj: O) => (keyof O)[];
}>(
  <O extends object>(obj: O, includeSymbols?: boolean): (keyof O)[] =>
    includeSymbols
      ? (Object.keys(obj) as (keyof O)[]).concat(
          Object.getOwnPropertySymbols(obj).filter(sym =>
            Object.prototype.propertyIsEnumerable.call(obj, sym)
          ) as (keyof O)[]
        )
      : (Object.keys(obj) as (keyof O)[]),
  ([first]) => typeof first === "object"
);

/** A single `[key, value]` pair of an object `O`, typed against `O`'s actual keys and value types. */
export type Entry<O extends object> = [keyof O, O[keyof O]];

/**
 * Returns an object's own enumerable entries, typed as `Entry<O>[]` instead of the widened
 * `[string, unknown][]` that `Object.entries` returns. Symbol keys are included only when `includeSymbols`
 * is `true`. Pipeable: call as `typedToEntries(obj, includeSymbols?)` or
 * `typedToEntries(includeSymbols?)(obj)`.
 */
export const typedToEntries = pipeable<{
  /**
   * Returns the object's own `[key, value]` entries, typed as `Entry<O>`.
   * @template O The type of the object being inspected.
   * @param {O} obj The object to read entries from.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {Entry<O>[]} The object's own `[key, value]` entries.
   */
  <O extends object>(obj: O, includeSymbols?: boolean): Entry<O>[];
  /**
   * Data-last form of {@link typedToEntries}, for use in `pipe`/`Array.prototype.map`/etc.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {<O extends object>(obj: O) => Entry<O>[]} A function returning the entries of the object it's given.
   */
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
 * `Array.prototype.map` but for objects. The mapper receives the entry, its index and the full entry list.
 * Symbol keys are included only when `includeSymbols` is `true`. Pipeable: call as
 * `mapObject(obj, mapper, includeSymbols?)` or `mapObject(mapper, includeSymbols?)(obj)`.
 */
export const mapObject = pipeable<{
  /**
   * Maps each entry of the object to a new entry.
   * @template I The type of the input object.
   * @template O The type of the resulting object.
   * @param {I} obj The object to map over.
   * @param {(entry: Entry<I>, index: number, array: readonly Entry<I>[]) => Entry<O>} mapper Maps each entry to a new entry.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {O} A new object built from the mapped entries.
   */
  <I extends object, O extends object>(
    obj: I,
    mapper: (
      entry: Entry<I>,
      index: number,
      array: readonly Entry<I>[]
    ) => Entry<O>,
    includeSymbols?: boolean
  ): O;
  /**
   * Data-last form of {@link mapObject}, for use in `pipe`/`Array.prototype.map`/etc.
   * @template I The type of the input object.
   * @template O The type of the resulting object.
   * @param {(entry: Entry<I>, index: number, array: readonly Entry<I>[]) => Entry<O>} mapper Maps each entry to a new entry.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {(obj: I) => O} A function mapping the object it's given into a new object.
   */
  <I extends object, O extends object>(
    mapper: (
      entry: Entry<I>,
      index: number,
      array: readonly Entry<I>[]
    ) => Entry<O>,
    includeSymbols?: boolean
  ): (obj: I) => O;
}>(
  <I extends object, O extends object>(
    obj: I,
    mapper: (
      entry: Entry<I>,
      index: number,
      array: readonly Entry<I>[]
    ) => Entry<O>,
    includeSymbols: boolean = false
  ): O => typedFromEntries(typedToEntries(obj, includeSymbols).map(mapper)),
  (args: readonly unknown[]) => typeof args[0] === "object"
);

/**
 * Filters an object's entries by a predicate, producing a new object, similarly to `Array.prototype.filter`
 * but for objects. The predicate receives the entry, its index and the full entry list. Symbol keys are
 * included only when `includeSymbols` is `true`. Pipeable: call as
 * `filterObject(obj, predicate, includeSymbols?)` or `filterObject(predicate, includeSymbols?)(obj)`.
 */
export const filterObject = pipeable<{
  /**
   * Keeps only the entries that satisfy `predicate`.
   * @template O The type of the object being filtered.
   * @param {O} obj The object to filter.
   * @param {(value: Entry<O>, index: number, array: readonly Entry<O>[]) => boolean} predicate Returns `true` to keep an entry.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {O} A new object containing only the entries that satisfied `predicate`.
   */
  <O extends object>(
    obj: O,
    predicate: (
      value: Entry<O>,
      index: number,
      array: readonly Entry<O>[]
    ) => boolean,
    includeSymbols?: boolean
  ): O;
  /**
   * Data-last form of {@link filterObject}, for use in `pipe`/`Array.prototype.map`/etc.
   * @template O The type of the object being filtered.
   * @param {(value: Entry<O>, index: number, array: readonly Entry<O>[]) => boolean} predicate Returns `true` to keep an entry.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {(obj: O) => O} A function filtering the object it's given into a new object.
   */
  <O extends object>(
    predicate: (
      value: Entry<O>,
      index: number,
      array: readonly Entry<O>[]
    ) => boolean,
    includeSymbols?: boolean
  ): (obj: O) => O;
}>(
  <O extends object>(
    obj: O,
    predicate: (
      value: Entry<O>,
      index: number,
      array: readonly Entry<O>[]
    ) => boolean,
    includeSymbols: boolean = false
  ): O =>
    typedFromEntries(typedToEntries(obj, includeSymbols).filter(predicate)),
  (args: readonly unknown[]) => typeof args[0] === "object"
);

/**
 * Maps every entry of a record to a new `[key, value]` pair, producing a new record. Unlike
 * {@link mapObject}, the mapper may change the key and value types. Symbol keys are included only when
 * `includeSymbols` is `true`. Pipeable: call as `mapRecord(rec, mapper, includeSymbols?)` or
 * `mapRecord(mapper, includeSymbols?)(rec)`.
 */
export const mapRecord = pipeable<{
  /**
   * Maps each entry of the record to a new `[key, value]` pair.
   * @template R The type of the input record.
   * @template K The key type of the resulting record.
   * @template V The value type of the resulting record.
   * @param {R} rec The record to map over.
   * @param {(entry: Entry<R>, index: number, array: readonly Entry<R>[]) => [K, V]} mapper Maps each entry to a new `[key, value]` pair.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {Record<K, V>} A new record built from the mapped entries.
   */
  <R extends Record<PropertyKey, unknown>, K extends PropertyKey, V>(
    rec: R,
    mapper: (
      entry: Entry<R>,
      index: number,
      array: readonly Entry<R>[]
    ) => [K, V],
    includeSymbols?: boolean
  ): Record<K, V>;
  /**
   * Data-last form of {@link mapRecord}, for use in `pipe`/`Array.prototype.map`/etc.
   * @template R The type of the input record.
   * @template K The key type of the resulting record.
   * @template V The value type of the resulting record.
   * @param {(entry: Entry<R>, index: number, array: readonly Entry<R>[]) => [K, V]} mapper Maps each entry to a new `[key, value]` pair.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {(rec: R) => Record<K, V>} A function mapping the record it's given into a new record.
   */
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
 * `pick`. Symbol keys are only considered when `includeSymbols` is `true`. Pipeable: call as
 * `pick(obj, keys, includeSymbols?)` or `pick(keys, includeSymbols?)(obj)`. The inverse of {@link omit}.
 */
export const pick = pipeable<{
  /**
   * Keeps only the given keys of the object.
   * @template O The type of the object being picked from.
   * @template K The subset of `O`'s keys to keep.
   * @param {O} obj The object to pick keys from.
   * @param {readonly K[]} keys The keys to keep.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {Pick<O, K>} A new object containing only the picked keys.
   */
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols?: boolean
  ): Pick<O, K>;
  /**
   * Data-last form of {@link pick}, for use in `pipe`/`Array.prototype.map`/etc.
   * @template K The subset of keys to keep.
   * @param {readonly K[]} keys The keys to keep.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {<O extends Record<K, unknown>>(obj: O) => Pick<O, K>} A function picking the keys from the object it's given.
   */
  <K extends PropertyKey>(
    keys: readonly K[],
    includeSymbols?: boolean
  ): <O extends Record<K, unknown>>(obj: O) => Pick<O, K>;
}>(
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols: boolean = false
  ): Pick<O, K> => {
    const keySet = new Set(keys);
    return filterObject(obj, ([key]) => keySet.has(key as K), includeSymbols);
  },
  ([a, b]) => typeof a === "object" && typeof b === "object"
);

/**
 * Removes a subset of an object's keys, producing a new object without those keys, similarly to lodash's
 * `omit`. Symbol keys are only considered when `includeSymbols` is `true`. Pipeable: call as
 * `omit(obj, keys, includeSymbols?)` or `omit(keys, includeSymbols?)(obj)`. The inverse of {@link pick}.
 */
export const omit = pipeable<{
  /**
   * Removes the given keys from the object.
   * @template O The type of the object being omitted from.
   * @template K The subset of `O`'s keys to remove.
   * @param {O} obj The object to remove keys from.
   * @param {readonly K[]} keys The keys to remove.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {Omit<O, K>} A new object without the removed keys.
   */
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols?: boolean
  ): Omit<O, K>;
  /**
   * Data-last form of {@link omit}, for use in `pipe`/`Array.prototype.map`/etc.
   * @template K The subset of keys to remove.
   * @param {readonly K[]} keys The keys to remove.
   * @param {boolean} [includeSymbols] Whether to also include own enumerable symbol keys. Defaults to `false`.
   * @returns {<O extends Record<K, unknown>>(obj: O) => Omit<O, K>} A function omitting the keys from the object it's given.
   */
  <K extends PropertyKey>(
    keys: readonly K[],
    includeSymbols?: boolean
  ): <O extends Record<K, unknown>>(obj: O) => Omit<O, K>;
}>(
  <O extends object, K extends keyof O>(
    obj: O,
    keys: readonly K[],
    includeSymbols: boolean = false
  ): Omit<O, K> => {
    const keySet = new Set(keys);
    return filterObject(obj, ([key]) => !keySet.has(key as K), includeSymbols);
  },
  ([a, b]) => typeof a === "object" && typeof b === "object"
);
