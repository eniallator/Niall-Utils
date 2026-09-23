# Niall-Utils

Small collection of my utilities: DOM helpers, functional utilities, small math helpers, safe guards, and tiny data structures.

[![npm version](https://img.shields.io/npm/v/niall-utils.svg)](https://www.npmjs.com/package/niall-utils)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/eniallator/Niall-Utils/actions/workflows/ci.yml/badge.svg)](https://github.com/eniallator/Niall-Utils/actions/workflows/ci.yml)
[![Node.js >= 22.13](https://img.shields.io/badge/Node.js-%3E=22.13-brightgreen.svg)](https://nodejs.org/)

## Installation

```bash
npm install niall-utils
# or
yarn add niall-utils
# or
pnpm add niall-utils
```

## Table of Contents

- [Installation](#installation)
- [Quick Example](#quick-example)
- [API Summary](#api-summary)
- [Subpath Imports](#subpath-imports)
- [Compatibility](#compatibility)
- [Tests](#tests)
- [Contributing](#contributing)
- [License](#license)

## Quick Example

```typescript
import { cartesianToPolar, dom, raise, tuple } from "niall-utils";

const el = dom.toHtml(`<div><span>Hello</span></div>`);
console.log(cartesianToPolar(1, 1));
try {
  raise(new Error("boom"));
} catch (e) {
  /* handled by design */
}
```

## API Summary

- **DOM (`ui/dom`)** - exposed as the `dom` object:
  - `dom.get(selector, base?)` - select an element or throw.
  - `dom.toHtml(htmlString)` - create an HTMLElement from a string template, inferring its element type.
  - `dom.toAttrs(attrs)` - serialize an attribute map to an HTML attribute string.
  - `dom.addListener(el, event, fn)` - strongly typed `addEventListener` wrapper.

- **Utilities (`core/utils`)**
  - `raise(error)` - throw as an expression, typed `never`.
  - `checkExhausted(value: never)` - helper for exhaustive switches.

- **Attempt helpers (`core/attempt`)**
  - `attempt(fn, onError?)` - run a synchronous unsafe function with optional recovery.
  - `attemptAsync(fn, onError?)` - run an async unsafe function with optional recovery.

- **Maths & geometry (`math/maths`)**
  - `cartesianToPolar`, `polarToCartesian`, `positiveMod`, `clamp`.
  - `Add`, `Subtract`, `Multiply`, `Increment`, `Decrement`, `StringToNumber` - type-level arithmetic.

- **Sliding window (`math/slidingWindow`)**
  - `slidingWindow(arr, windowSize, start?, step?, circular?)` - extract fixed-size window tuples (pipeable).

- **Color utilities (`ui/color`)**
  - `parseHexChannels(color)` - parse a hex color into `[r, g, b]` channels.
  - `lerpColors`, `createWeightedGradient` - color interpolation and weighted gradient builder.

- **Animation helpers (`ui/animate`)**
  - `sequence`, `timeSequence`, `multiSequence`, `timeMultiSequence` - lightweight frame sequence utilities.

- **Data helpers (`data`)**
  - `zip` - merge arrays index-wise with bounds checking.
  - `typedToEntries`, `typedFromEntries`, `typedKeys` - typed object-to-entry conversions.
  - `mapObject`, `mapRecord`, `filterObject` - map/filter over object entries.
  - `pick`, `omit` - select or drop object keys (pipeable).
  - `partition(arr, predicate)` - split an array in two, narrowing with type-guard predicates (pipeable).
  - `memoize(fn, toCacheKey?, maxSize?)` - cache results, with optional LRU eviction.
  - `generator(callback)` - create a Generator from a callback, stopping at the first `null`/`undefined`.
  - `collectPaginated(perPage, getPage, hasMoreData?)` - fetch every page from a paginated API.
  - `typedRange(limit)`, `Range<N>` - build `[0, 1, ..., N - 1]` as an exact tuple type.

- **Tuple helpers (`core/tuple`)**
  - `tuple(...values)` - create a typed tuple.
  - `FillTuple` - fixed-length tuple type.

- **Type helpers (`core`)**
  - `UnionToPartial` - destructure types where keys only appear in _some_ union members.
  - `UnionToTuple` - convert a union type to a tuple of its members.
  - String types (`Whitespace`, `Digit`, `AlphabetLower`, `AlphaNumeric`, etc.) plus `MatchString` and
    `StringSplit` for type-level string parsing.

- **Tagged types (`core/tagged`)**
  - `Tagged<Type, Name>` - branded type for compile-time safety.
  - `Untag<T>` - extract the underlying type from a tagged type.
  - `unsafeTag()` - create an unchecked tagging function.

- **Functional helpers (`functional`)**
  - `Monad<A>` class - monadic wrapper with `from`, `map`, `flatMap`, `tap`, `tupled`, `get`, `toOption`.
  - `Option<A>` class - nullable value wrapper with `some`, `none`, `from`, `map`, `flatMap`, `filter`,
    `fold`, `getOrElse`, `getOrNull`, `getOrThrow`, `toMonad`, and more.
  - `mapFilter(arr, callback)` - filter and map in one pass, supporting Option returns.
  - `mapFind(arr, callback)` - find first matching element with mapping, supporting Option returns.
  - `mapAccumulate(arr, initial, callback)` - accumulate over an array with state.
  - `NonEmptyArray` - array type with at least one element.
  - `pipe(data, ...fns)` - chain functions left to right.
  - `pipeable`, `simplePipeable` - make a data-first function callable as `fn(data, ...args)` or
    `fn(...args)(data)`.

- **Timing helpers (`timing`)**
  - `debounce` - delay function execution until after a wait period.
  - `throttled`, `throttledAsync` - limit function execution to once per interval.

- **Encoding (`encoding/base64`)**
  - `Base64` - branded string type for base64 values.
  - `isValidBase64(str)` - type guard for valid base64 strings.
  - `base64FromUint(n, length?)`, `base64ToUint(str)` - uint/base64 conversions.

- **Date formatting (`format/formatLocaleDate`)**
  - `formatLocaleDate(date, locale?)` - format a Date to ISO-like string with locale support.

## Files of interest

- **`src/core/attempt.ts`** - `attempt` and `attemptAsync`.
- **`src/core/stringTypes.ts`** - string literal types (`Whitespace`, `Digit`, `AlphabetLower`, etc.).
- **`src/core/tagged.ts`** - branded type utilities (`Tagged`, `Untag`, `unsafeTag`).
- **`src/core/unionToPartial.ts`** - destructure types with partial keys.
- **`src/core/unionToTuple.ts`** - convert union types to tuple types.
- **`src/core/utils.ts`** - `raise` and `checkExhausted`.
- **`src/data/collectPaginated.ts`** - fetch all pages from a paginated API.
- **`src/data/entries.ts`** - typed object-to-entry conversions (`typedToEntries`, `typedFromEntries`, `mapObject`, `pick`, `omit`, etc.).
- **`src/data/generate.ts`** - generator helper.
- **`src/data/memoize.ts`** - memoization with optional LRU eviction.
- **`src/data/partition.ts`** - split an array in two by a predicate.
- **`src/data/range.ts`** - `typedRange` and the `Range<N>` tuple type.
- **`src/data/zip.ts`** - index-wise array merging with bounds checking.
- **`src/encoding/base64.ts`** - `Base64` branded type, `isValidBase64`, `base64FromUint`, `base64ToUint`.
- **`src/format/formatLocaleDate.ts`** - locale date formatting.
- **`src/functional/map.ts`** - `mapFilter`, `mapFind`, `mapAccumulate`.
- **`src/functional/monad.ts`, `src/functional/option.ts`** - small functional primitives.
- **`src/functional/pipe.ts`, `src/functional/pipeable.ts`** - `pipe` and the data-first/data-last `pipeable` wrapper.
- **`src/math/maths.ts`** - geometry helpers (`cartesianToPolar`, `polarToCartesian`), `clamp`, `positiveMod` and numeric type utilities.
- **`src/math/slidingWindow.ts`** - sliding window tuples over an array.
- **`src/timing/debounce.ts`, `src/timing/throttled.ts`** - rate-limiting helpers.
- **`src/ui/animate.ts`** - lightweight animation and timing helpers.
- **`src/ui/color.ts`** - color interpolation and gradient utilities.
- **`src/ui/dom.ts`** - DOM helpers and small HTML helpers.

## Tests

- Unit tests live next to implementation files (`*.test.ts`) and cover edge cases and typing behavior. Run workspace tests via the root `package.json` scripts.

## Subpath Imports

This package supports tree-shakeable subpath imports. You can import from individual modules without pulling in the entire library:

```typescript
// Individual modules
import { raise, Tagged, unsafeTag } from "niall-utils/core";
import { collectPaginated } from "niall-utils/data";
import { base64FromUint } from "niall-utils/encoding";
import { formatLocaleDate } from "niall-utils/format";
import { Monad, Option } from "niall-utils/functional";
import { cartesianToPolar, clamp } from "niall-utils/math";
import { debounce } from "niall-utils/timing";
import { animate, color, dom } from "niall-utils/ui";
```

## Compatibility

| Environment | Supported Versions            |
| ----------- | ----------------------------- |
| Node.js     | >= 22.13                      |
| Browsers    | All modern browsers (ES2020+) |

**Note:** The `ui/dom` module depends on browser DOM APIs and will not work in Node.js environments without a DOM polyfill (e.g., `happy-dom`).

## Contributing

Please see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

- See repository `LICENSE`.
