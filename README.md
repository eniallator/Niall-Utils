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
  - `attempt(fn, onError?)` - run an unsafe function with optional recovery.
  - `checkExhausted(value: never)` - helper for exhaustive switches.

- **Maths & geometry (`maths`)**
  - `cartesianToPolar`, `polarToCartesian`, `positiveMod` and supporting numeric type helpers.

- **Color utilities (`color`)**
  - `lerpColors`, `createWeightedGradient` - color interpolation and weighted gradient builder.

- **Animation helpers (`animate`)**
  - `sequence`, `timeSequence`, `multiSequence` - lightweight frame sequence utilities.

- **Data helpers**
  - `tuple`, `zip`, `map`, `mapAccumulate`, `slidingWindow`, `entries`, `generate`, `formatLocaleDate`, `base64` - small focused utilities (see `src/` for full list).

- **Type helpers**
  - `DiscriminatedOptions`, `stringInfer`, `unionToTuple` - type-level utilities for safer inference and discriminated unions.

- **Functional & option/monad helpers**
  - `monad`, `option`, `tagged` - helpers for safer functional code.

## Files of interest

- **`src/ui/dom.ts`** - DOM helpers and small HTML helpers.
- **`src/core/utils.ts`** - `raise`, `attempt`, and `checkExhausted`.
- **`src/math/maths.ts`** - geometry helpers and numeric type utilities.
- **`src/data/`** - `tuple`, `zip`, `map`, `mapAccumulate`, `slidingWindow`, `entries`, `generate`.
- **`src/ui/color.ts`** - color interpolation and gradient utilities.
- **`src/ui/animate.ts`** - lightweight animation and timing helpers.
- **`src/types/discriminatedOptions.ts`** - discriminated union option helpers.
- **`src/core/stringInfer.ts`, `src/core/unionToTuple.ts`** - type inference utilities.
- **`src/functional/monad.ts`, `src/functional/option.ts`** - small functional primitives.
- **`src/encoding/base64.ts`** - base64 encoding utilities.
- **`src/format/formatLocaleDate.ts`** - locale date formatting.

## Tests

- Unit tests live next to implementation files (`*.test.ts`) and cover edge cases and typing behavior. Run workspace tests via the root `package.json` scripts.

## Contributing

- Add small, well-tested functions only. Follow the README Markdown style and ensure tests accompany new helpers.

## License

- See repository `LICENSE`.
