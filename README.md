# Niall-Utils

Small collection of my utilities: DOM helpers, functional utilities, small math helpers, safe guards, and tiny data structures.

[![npm version](https://img.shields.io/npm/v/niall-utils.svg)](https://www.npmjs.com/package/niall-utils)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/eniallator/Niall-Utils/actions/workflows/ci.yml/badge.svg)](https://github.com/eniallator/Niall-Utils/actions/workflows/ci.yml)
[![Node.js >= 20](https://img.shields.io/badge/Node.js-%3E=20-brightgreen.svg)](https://nodejs.org/)

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
import { dom, raise, cartesianToPolar, tuple } from "niall-utils";

const el = dom.toHtml(`<div><span>Hello</span></div>`);
console.log(cartesianToPolar(1, 1));
try {
  raise(new Error("boom"));
} catch (e) {
  /* handled by design */
}
```

## API Summary

- **DOM (`dom`)**
  - `get(selector, base?)` - select an element or throw.
  - `toHtml(htmlString)` - create an HTMLElement from a string template.
  - `toAttrs(attrs)` - serialize attribute map to HTML attrs.
  - `addListener(el, event, fn)` - strongly typed `addEventListener` wrapper.

- **Utilities (`utils`)**
  - `raise(error)` - throw helper to help with typed `never` flows.
  - `checkExhausted(value: never)` - helper for exhaustive switches.

- **Attempt helpers (`attempt`)**
  - `attempt(fn, onError?)` - run a synchronous unsafe function with optional recovery.
  - `attemptAsync(fn, onError?)` - run an async unsafe function with optional recovery.

- **Maths & geometry (`maths`)**
  - `cartesianToPolar`, `polarToCartesian`, `positiveMod`, `clamp` and supporting numeric type helpers.

- **Color utilities (`color`)**
  - `lerpColors`, `createWeightedGradient` - color interpolation and weighted gradient builder.

- **Animation helpers (`animate`)**
  - `sequence`, `timeSequence`, `multiSequence` - lightweight frame sequence utilities.

- **Data helpers (`data`)**
  - `zip` - merge arrays index-wise with bounds checking.
  - `typedToEntries`, `typedFromEntries`, `typedKeys` - typed object-to-entry conversions.
  - `mapObject`, `mapRecord` - map over object entries/records.
  - `filterObject` - filter object entries by predicate.
  - `generator` - create a Generator from a callback.
  - `getAllPages(getPage, perPage)` - fetch all pages from a paginated API.

- **Tuple helpers (`core/tuple`)**
  - `tuple(...values)` - create a typed tuple.
  - `FillTuple`, `NonEmptyArray` - type-level tuple utilities.

- **Sliding window (`math/slidingWindow`)**
  - `slidingWindow(arr, size, step?, start?, circular?)` - extract sliding windows from arrays.

- **Type helpers**
  - `UnionToPartial` - destructure types where keys only appear in _some_ cases.
  - `unionToTuple`, `unionToPartial` - type-level utilities for safer inference and discriminated unions.
  - `stringTypes` - string literal types (`Whitespace`, `Digit`, `AlphabetLower`, etc.).

- **Tagged types (`core/tagged`)**
  - `Tagged<Type, Name>` - branded type for compile-time safety.
  - `Untag<T>` - extract the underlying type from a tagged type.
  - `unsafeTag()` - create an unsafe tag function.

- **Functional & option/monad helpers**
  - `Monad<A>` class - monadic wrapper with `from`, `map`, `flatMap`, `tupled`.
  - `Option<A>` class - nullable value wrapper with `some`, `none`, `from`, `getOrNull`.
  - `mapFilter(arr, callback)` - filter and map in one pass, supporting Option returns.
  - `mapFind(arr, callback)` - find first matching element with mapping, supporting Option returns.
  - `mapAccumulate(arr, initial, callback)` - accumulate over an array with state.

- **Timing helpers**
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
- **`src/data/entries.ts`** - typed object-to-entry conversions (`typedToEntries`, `typedFromEntries`, `mapObject`, etc.).
- **`src/data/generate.ts`** - generator helper.
- **`src/data/getAllPages.ts`** - fetch all pages from a paginated API.
- **`src/data/zip.ts`** - index-wise array merging with bounds checking.
- **`src/encoding/base64.ts`** - `Base64` branded type, `isValidBase64`, `base64FromUint`, `base64ToUint`.
- **`src/format/formatLocaleDate.ts`** - locale date formatting.
- **`src/functional/monad.ts`, `src/functional/option.ts`** - small functional primitives.
- **`src/math/maths.ts`** - geometry helpers (`cartesianToPolar`, `polarToCartesian`), `clamp`, `positiveMod` and numeric type utilities.
- **`src/ui/animate.ts`** - lightweight animation and timing helpers.
- **`src/ui/color.ts`** - color interpolation and gradient utilities.
- **`src/ui/dom.ts`** - DOM helpers and small HTML helpers.

## Tests

- Unit tests live next to implementation files (`*.test.ts`) and cover edge cases and typing behavior. Run workspace tests via the root `package.json` scripts.

## Subpath Imports

This package supports tree-shakeable subpath imports. You can import from individual modules without pulling in the entire library:

```typescript
// Individual modules
import { debounce } from "niall-utils/timing";
import { collectPaginated } from "niall-utils/data";
import { base64FromUint } from "niall-utils/encoding";
import { Monad, Option } from "niall-utils/functional";
import { cartesianToPolar, clamp } from "niall-utils/math";
import { dom, animate, color } from "niall-utils/ui";
import { raise, Tagged, unsafeTag } from "niall-utils/core";
import { formatLocaleDate } from "niall-utils/format";
```

## Compatibility

| Environment | Supported Versions            |
| ----------- | ----------------------------- |
| Node.js     | >= 20                         |
| Browsers    | All modern browsers (ES2020+) |

**Note:** The `ui/dom` module depends on browser DOM APIs and will not work in Node.js environments without a DOM polyfill (e.g., `jsdom`).

## Contributing

Please see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

- See repository `LICENSE`.
