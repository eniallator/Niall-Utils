# wutils

Short for web utils.\
Small collection of utilities: DOM helpers, functional utilities, small math helpers, safe guards, and tiny data structures.

## Overview

- **Purpose:** Provide a tiny, well-typed toolkit of primitives to be used by other packages: DOM creation/selection, tuple utilities, safe guards, functional helpers, encoding utilities and small math helpers.
- **Design:** Small, single-purpose functions with strong TypeScript ergonomics and unit tests.

## Quick example

```typescript
import { dom, raise, cartesianToPolar, tuple } from "wutils";

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
  - `get(selector, base?)` — select an element or throw.
  - `toHtml(htmlString)` — create an HTMLElement from a string template.
  - `toAttrs(attrs)` — serialize attribute map to HTML attrs.
  - `addListener(el, event, fn)` — strongly typed `addEventListener` wrapper.

- **Utilities (`utils`)**
  - `raise(error)` — throw helper to help with typed `never` flows.
  - `attempt(fn, onError?)` — run an unsafe function with optional recovery.
  - `checkExhausted(value: never)` — helper for exhaustive switches.

- **Maths & geometry (`maths`)**
  - `cartesianToPolar`, `polarToCartesian`, `positiveMod` and supporting numeric type helpers.

- **Data helpers**
  - `tuple`, `zip`, `map`, `entries`, `generate`, `formatDate`, `b64` — small focused utilities (see `src/` for full list).

- **Functional & option/monad helpers**
  - `monad`, `option`, `tagged` — helpers for safer functional code.

## Files of interest

- `src/dom.ts` — DOM helpers and small HTML helpers.
- `src/utils.ts` — `raise`, `attempt`, and `checkExhausted`.
- `src/maths.ts` — geometry helpers and numeric type utilities.
- `src/tuple.ts`, `src/zip.ts`, `src/map.ts`, `src/entries.ts` — collection helpers.
- `src/monad.ts`, `src/option.ts` — small functional primitives.

## Tests

- Unit tests live next to implementation files (`*.test.ts`) and cover edge cases and typing behavior. Run workspace tests via the root `package.json` scripts.

## Contributing

- Add small, well-tested functions only. Follow the README Markdown style and ensure tests accompany new helpers.

## License

- See repository `LICENSE`.
