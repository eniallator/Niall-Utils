# Niall-Utils

Small collection of my utilities: DOM helpers, functional utilities, small math helpers, safe guards, and tiny data structures.

## Overview

- **Purpose:** Provide a tiny, well-typed toolkit of primitives to be used by other packages: DOM creation/selection, tuple utilities, safe guards, functional helpers, encoding utilities and small math helpers.
- **Design:** Small, single-purpose functions with strong TypeScript ergonomics and unit tests.

## Local Dev Container Configuration

This repository uses a **split devcontainer config** so that the public repository stays minimal while each developer keeps their own extensions and settings private:

| File | Purpose |
|------|---------|
| `.devcontainer/devcontainer.base.json` | Minimal shared config (base image, features, core setup) — committed to the repo |
| `.devcontainer/devcontainer.local.json` | Your personal VS Code extensions, settings, and git user config — **gitignored** |
| `.devcontainer/devcontainer.json` | Generated output — produced by merging the two files above |

### How the merge works

The `merge-devcontainer.sh` (bash) and `merge-devcontainer.ps1` (PowerShell) scripts recursively merge `devcontainer.base.json` and `devcontainer.local.json` into `devcontainer.json` using `jq -s '.[0] * .[1]'`. This means:

- **Objects** are deep-merged (local values override base values for the same key).
- **Arrays** (e.g. `extensions`) are concatenated — both base and local arrays are included.

### Getting started

1. Configure your personal settings in `.devcontainer/devcontainer.local.json`.
2. Run the merge script to generate the final config:

   ```bash
   # Bash / Git Bash
   scripts/merge-devcontainer.sh

   # PowerShell
   scripts\merge-devcontainer.ps1
   ```

3. Rebuild or reopen the container with `Dev Containers: Rebuild Container` in VS Code.

> **Note:** If you change `.devcontainer/devcontainer.local.json` at any point, you must re-run the merge script and rebuild the container for the changes to take effect.

This keeps the public repository config minimal while letting you keep your own development extras private.

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
