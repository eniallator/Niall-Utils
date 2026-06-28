import { raise } from "../core/utils.ts";

import type {
  Alphabet,
  Capture,
  MatchString,
  Skip,
  Whitespace,
} from "../core/stringTypes.ts";

const addListener = <
  E extends HTMLElement,
  const K extends keyof HTMLElementEventMap,
>(
  element: E,
  event: K,
  listener: (this: E, evt: HTMLElementEventMap[K]) => void
): void => {
  element.addEventListener<K>(
    event,
    listener as (this: HTMLElement, evt: HTMLElementEventMap[K]) => void
  );
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const get = <E extends HTMLElement>(
  selector: string,
  baseEl: ParentNode = document
): E =>
  baseEl.querySelector<E>(selector) ??
  raise(new Error(`Could not find element with selector "${selector}"`));

const toAttrs = (
  attrs: Readonly<Record<string, string | number | null>>
): string =>
  Object.entries(attrs)
    .map(([key, val]) => (val != null ? `${key}="${val}"` : key))
    .join(" ");

type InferElement<S extends string> =
  MatchString<
    Lowercase<S>,
    [Skip<Whitespace>, Skip<"<", 1>, Skip<Whitespace>, Capture<Alphabet>]
  > extends infer Result
    ? Result extends keyof HTMLElementTagNameMap
      ? HTMLElementTagNameMap[Result]
      : HTMLElement
    : never;

const toHtml = <const S extends string>(str: S): InferElement<S> => {
  const el = document.createElement("template");
  el.innerHTML = str;
  return (el.content.children.item(0) ??
    raise(new Error("No nodes found"))) as InferElement<S>;
};

export const dom = { addListener, get, toHtml, toAttrs };
