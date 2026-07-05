import { raise } from "../core/utils.ts";

import type {
  Alphabet,
  Capture,
  MatchString,
  Skip,
  Whitespace,
} from "../core/stringTypes.ts";

/**
 * Adds a typed event listener to an element, inferring the event type from the event name.
 * @template E The type of element to listen on.
 * @template K The event name, constrained to `HTMLElementEventMap`'s keys.
 * @param {E} element The element to attach the listener to.
 * @param {K} event The event name to listen for.
 * @param {(this: E, evt: HTMLElementEventMap[K]) => void} listener Called when the event fires, with `this` bound to `element`.
 */
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

/**
 * Queries for a single element, throwing instead of returning `null` if it isn't found.
 * @template E The expected element type.
 * @param {string} selector The CSS selector to query for.
 * @param {ParentNode} [baseEl] The node to query within. Defaults to `document`.
 * @returns {E} The matched element.
 * @throws {Error} If no element matches `selector`.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const get = <E extends HTMLElement>(
  selector: string,
  baseEl: ParentNode = document
): E =>
  baseEl.querySelector<E>(selector) ??
  raise(new Error(`Could not find element with selector "${selector}"`));

/**
 * Serializes an attributes record into an HTML attribute string, e.g. `{ id: "foo", disabled: null }`
 * becomes `id="foo" disabled`.
 * @param {Readonly<Record<string, string | number | null>>} attrs The attributes to serialize; a `null` value renders as a bare (valueless) attribute.
 * @returns {string} The serialized attribute string.
 */
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

/**
 * Parses an HTML string into a single element, inferring the concrete element type (e.g. `HTMLInputElement`)
 * from the tag name found at the start of the string literal.
 * @template S The HTML string literal being parsed.
 * @param {S} str The HTML markup for a single element.
 * @returns {InferElement<S>} The parsed element, typed according to its tag name.
 * @throws {Error} If `str` doesn't contain an element.
 */
const toHtml = <const S extends string>(str: S): InferElement<S> => {
  const el = document.createElement("template");
  el.innerHTML = str;
  return (el.content.children.item(0) ??
    raise(new Error("No nodes found"))) as InferElement<S>;
};

/**
 * A small collection of typed DOM helpers:
 * - `addListener` — attach a typed event listener.
 * - `get` — query for an element, throwing if not found.
 * - `toHtml` — parse an HTML string into a typed element.
 * - `toAttrs` — serialize an attributes record into an HTML attribute string.
 */
export const dom = { addListener, get, toHtml, toAttrs };
