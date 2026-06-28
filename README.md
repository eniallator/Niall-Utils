# Niall-Utils

Small collection of my utilities: DOM helpers, functional utilities, small math helpers, safe guards, and tiny data structures.

## Overview

- **Purpose:** Provide a tiny, well-typed toolkit of primitives to be used by other packages: DOM creation/selection, tuple utilities, safe guards, functional helpers, encoding utilities and small math helpers.
- **Design:** Small, single-purpose functions with strong TypeScript ergonomics and unit tests.

## Local Dev Container Configuration

This repository includes an example devcontainer configuration to help new contributors get started quickly.

- **Example file:** `.devcontainer/devcontainer.example.json` — a sane default for this project (committed).
- **Your personal config:** Copy the example to `.devcontainer/devcontainer.json` and customize it for your environment. The local `devcontainer.json` is intended to be kept private and should not be committed.

### Getting started

1. Copy the example into your local devcontainer file:

  ```bash
  cp .devcontainer/devcontainer.example.json .devcontainer/devcontainer.json
  ```

1. Edit `.devcontainer/devcontainer.json` to add any personal extensions or settings you need.
2. In VS Code run `Dev Containers: Rebuild Container` (or `Reopen in Container`) to apply the configuration.

> **Note:** If you update your local `.devcontainer/devcontainer.json`, rebuild the container for changes to take effect.

## Quick example

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

## Contributing

- Add small, well-tested functions only. Follow the README Markdown style and ensure tests accompany new helpers.

## License

- See repository `LICENSE`.
