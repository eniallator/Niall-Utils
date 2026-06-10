declare const TagSymbol: unique symbol;

export type Tagged<Type, Name extends string> = Type & {
  [TagSymbol]: { readonly type: Type; readonly name: Name };
};
export type Untag<T extends Tagged<unknown, string>> =
  T[typeof TagSymbol]["type"];

export const unsafeTag =
  <T extends Tagged<unknown, string>>() =>
  (value: Untag<T>): T =>
    value as T;
