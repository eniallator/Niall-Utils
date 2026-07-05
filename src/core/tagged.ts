declare const TagSymbol: unique symbol;

/**
 * Brands `Type` with a unique `Name` tag so it becomes structurally distinct from other types with the same shape,
 * preventing accidental mixing of semantically different values (e.g. two different `string` newtypes).
 * @template Type The underlying type being tagged.
 * @template Name A unique string literal identifying this tag.
 */
export type Tagged<Type, Name extends string> = Type & {
  [TagSymbol]: { readonly type: Type; readonly name: Name };
};
/**
 * Recovers the underlying, untagged type from a {@link Tagged} type.
 * @template T The {@link Tagged} type to unwrap.
 */
export type Untag<T extends Tagged<unknown, string>> =
  T[typeof TagSymbol]["type"];

/**
 * Creates a function that casts a plain value to a {@link Tagged} type without any runtime validation.
 * Intended for use inside a module that has already validated the value's shape, exposing a validated
 * constructor (e.g. `isValidBase64`) alongside it.
 * @template T The {@link Tagged} type to cast to.
 * @returns {(value: Untag<T>) => T} A function that casts an untagged value to the tagged type `T`.
 */
export const unsafeTag =
  <T extends Tagged<unknown, string>>() =>
  (value: Untag<T>): T =>
    value as T;
