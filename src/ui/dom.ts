import type {
  AlphaNumeric,
  Capture,
  MatchString,
  Skip,
  Whitespace,
} from "../core/stringTypes.ts";
import { raise } from "../core/utils.ts";
import { typedToEntries } from "../data/entries.ts";

/**
 * Adds a typed event listener to an element, inferring the event type from the event name.
 * @template E The type of element to listen on.
 * @template K The event name, constrained to `HTMLElementEventMap`'s keys.
 * @param {E} element The element to attach the listener to.
 * @param {K} event The event name to listen for.
 * @param {(this: E, evt: HTMLElementEventMap[K]) => void} listener Called when the event fires, with `this` bound to `element`.
 */
export const addListener = <
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
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const getElement = <E extends HTMLElement>(
  selector: string,
  baseEl: ParentNode = document
): E =>
  baseEl.querySelector<E>(selector) ??
  raise(new Error(`Could not find element with selector "${selector}"`));

/** Escapes the characters that are special inside a double-quoted HTML attribute value: `&` and `"`. */
const escapeAttrValue = (val: string): string =>
  val.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

/**
 * Serializes an attributes record into an HTML attribute string, e.g. `{ id: "foo", disabled: null }`
 * becomes `id="foo" disabled`.
 * @param {Readonly<Record<string, string | number | null>>} attrs The attributes to serialize; a `null` value renders as a bare (valueless) attribute.
 * @returns {string} The serialized attribute string.
 */
export const toAttrs = (
  attrs: Readonly<Record<string, string | number | null>>
): string =>
  typedToEntries(attrs)
    .map(([key, val]) =>
      val != null ? `${key}="${escapeAttrValue(String(val))}"` : key
    )
    .join(" ");

/** Remaps a tag name map's keys to lowercase, so a lowercased tag name can look up entries regardless of the map's own casing (e.g. SVG's `linearGradient`). */
type LowercaseKeys<M> = { [K in keyof M as Lowercase<K & string>]: M[K] };

type InferElement<S extends string> =
  MatchString<
    Lowercase<S>,
    [Skip<Whitespace>, Skip<"<", 1>, Skip<Whitespace>, Capture<AlphaNumeric>]
  > extends infer Result extends string
    ? Result extends keyof LowercaseKeys<HTMLElementTagNameMap>
      ? LowercaseKeys<HTMLElementTagNameMap>[Result]
      : Result extends keyof LowercaseKeys<SVGElementTagNameMap>
        ? LowercaseKeys<SVGElementTagNameMap>[Result]
        : Result extends keyof LowercaseKeys<MathMLElementTagNameMap>
          ? LowercaseKeys<MathMLElementTagNameMap>[Result]
          : HTMLElement
    : HTMLElement;

/**
 * SVG tag names that only resolve to the SVG namespace when parsed inside an `<svg>` wrapper; the `svg` root
 * tag itself switches namespace on its own and needs no wrapping. Excludes "a", "script", "style", and
 * "title", which are also valid HTML tags — parsing those at the top level already produces the HTML variant
 * by default, matching a real HTML parser's behavior, so callers wanting the SVG version must nest them
 * inside `<svg>...</svg>` themselves.
 */
const svgTagNames = new Set([
  "animate",
  "animatemotion",
  "animatetransform",
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "feblend",
  "fecolormatrix",
  "fecomponenttransfer",
  "fecomposite",
  "feconvolvematrix",
  "fediffuselighting",
  "fedisplacementmap",
  "fedistantlight",
  "fedropshadow",
  "feflood",
  "fefunca",
  "fefuncb",
  "fefuncg",
  "fefuncr",
  "fegaussianblur",
  "feimage",
  "femerge",
  "femergenode",
  "femorphology",
  "feoffset",
  "fepointlight",
  "fespecularlighting",
  "fespotlight",
  "fetile",
  "feturbulence",
  "filter",
  "foreignobject",
  "g",
  "image",
  "line",
  "lineargradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "set",
  "stop",
  "switch",
  "symbol",
  "text",
  "textpath",
  "tspan",
  "use",
  "view",
]);

/** MathML tag names that only resolve to the MathML namespace when parsed inside a `<math>` wrapper; the `math` root tag itself switches namespace on its own and needs no wrapping. */
const mathMlTagNames = new Set([
  "annotation",
  "annotation-xml",
  "maction",
  "merror",
  "mfrac",
  "mi",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mprescripts",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msubsup",
  "msup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
]);

const ROOT_TAG_REGEX = /^\s*<\s*([a-zA-Z0-9]*)/;

const foreignWrapperTag = (tagName: string): "math" | "svg" | undefined =>
  svgTagNames.has(tagName)
    ? "svg"
    : mathMlTagNames.has(tagName)
      ? "math"
      : undefined;

/**
 * Parses a markup string into a single element, inferring the concrete element type (e.g. `HTMLInputElement`,
 * `SVGCircleElement`, `MathMLElement`) from the tag name found at the start of the string literal. Elements
 * that only exist in the SVG or MathML namespace (anything but the `<svg>`/`<math>` root tags themselves) are
 * transparently wrapped so they're parsed into their correct namespace.
 * @template S The markup string literal being parsed.
 * @param {S} str The markup for a single HTML, SVG, or MathML element.
 * @returns {InferElement<S>} The parsed element, typed according to its tag name.
 * @throws {Error} If `str` doesn't contain an element.
 */
export const toElement = <const S extends string>(str: S): InferElement<S> => {
  const tagName = ROOT_TAG_REGEX.exec(str)?.[1]?.toLowerCase();
  const wrapperTag = tagName == null ? undefined : foreignWrapperTag(tagName);

  const el = document.createElement("template");
  el.innerHTML =
    wrapperTag == null ? str : `<${wrapperTag}>${str}</${wrapperTag}>`;

  const parsedRoot = el.content.children.item(0);
  const result = wrapperTag == null ? parsedRoot : parsedRoot?.children.item(0);

  return (result ?? raise(new Error("No nodes found"))) as InferElement<S>;
};
