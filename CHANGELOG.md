# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2026-10-27

### Added

- `Option#orElse(other)` falls back to another `Option` when this one is empty; the result type narrows using
  both `Option`s' statically known emptiness (`"some"`/`"none"`)

### Changed

- `attempt` and `attemptAsync` now pass the caught error to `onError` (typed `(error: unknown) => T`), so the
  fallback can depend on what was thrown
- `cartesianToPolar` and `polarToCartesian` return labelled tuples (`[magnitude, angle]` and `[x, y]`), and
  `typedRange`'s parameter is named `length`; these are type-level naming changes only
- `attempt`, `attemptAsync` and `generator` are now `const` arrow functions instead of `function` declarations
- JSDoc: each overload of the pipeable functions (`typedKeys`, `typedToEntries`, `mapObject`, `filterObject`,
  `mapRecord`, `pick`, `omit`, `mapFilter`, `mapFind`, `mapAccumulate`, `partition`, `slidingWindow`) and of
  `attempt`/`attemptAsync` is documented individually, with the full description on the exported function
- `debounce`'s timer is typed `ReturnType<typeof setTimeout>` instead of `number`, so it typechecks against
  both the DOM and Node typings
- `parseHexChannels` reads all four channels from a single 32-bit value (no change in behaviour)
- Release and check scripts (`scripts/*.mjs`) rewritten in TypeScript and run through Node's type stripping;
  `pnpm typecheck` now typechecks them, with `@types/node` added as a dev dependency
- Bumped dependencies (`vitest`, `@vitest/coverage-v8`, `happy-dom`, `oxlint`, `oxlint-tsgolint`, `prettier`)

## [4.0.0] - 2026-10-10

### Added

- `toElement` now also parses SVG and MathML markup, inferring `SVG*Element`/`MathMLElement` types and wrapping
  namespace-specific tags (anything but the `<svg>`/`<math>` roots) so they land in the correct namespace
- `parseHexChannels` accepts an optional trailing alpha byte (`RRGGBBAA`) and an optional leading `#`
- `NonEmptyArray` and `ReadonlyNonEmptyArray` types, plus `AnyArgFn` and `AsyncReturnType`, are exported from
  `core` (`core/types.ts`)
- `mapObject` and `filterObject` are now pipeable (`mapObject(mapper, includeSymbols?)(obj)`); the data-last
  form needs explicit type arguments as the object type can't be inferred from the callback alone
- `simplePipeable` now preserves the wrapped function's own parameter names in its returned type

### Changed

- **Breaking:** the `dom` object has been removed in favour of named exports: `dom.get` → `getElement`,
  `dom.toHtml` → `toElement`, `dom.toAttrs` → `toAttrs`, `dom.addListener` → `addListener`
- **Breaking:** `parseHexChannels` now returns `[r, g, b, a]` (alpha defaults to `255`) and only accepts a 6 or
  8 digit hex string; `lerpColors` takes and interpolates 4 channels, so its output (and that of
  `createWeightedGradient`) is now an `rrggbbaa` string
- **Breaking:** `createWeightedGradient` takes a `ReadonlyNonEmptyArray`, so an empty gradient is a type error
- **Breaking:** `formatLocaleDate` returns `null` instead of `"Invalid Date"` for an invalid date
- **Breaking:** `NonEmptyArray` is now exported from `core` instead of `functional`
- **Breaking:** the 21-argument overload of `pipe` was removed (20 functions is the maximum)
- `Tagged`/`Untag` reworked around a single tag meta type
- Clarified JSDoc across `entries`, `collectPaginated`, `base64FromUint`, `throttledAsync`, `positiveMod`,
  `multiSequence`, and others
- `pnpm typecheck` now also typechecks the test files
- `release` now runs `prepublish` before committing and tagging
- Bumped pnpm to 12.10.1
- Bumped dependencies (`vitest`, `@vitest/coverage-v8`, `happy-dom`, `oxlint`, `oxlint-tsgolint`, `prettier`,
  `publint`)

### Fixed

- Typo in the `stringTypes` parser error message ("Exact match count could not be satisfied")
- `UnionToPartial` JSDoc example now shows the correct optional-`undefined` shape

## [3.0.0] - 2026-09-23

### Added

- `typedRange` and the `Range<N>` type for building a `[0, 1, ..., N - 1]` tuple (`data/range.ts`)
- An optional `hasMoreData(data, page)` parameter for `collectPaginated`, to customise when to stop fetching
  (defaults to the previous "last page was full" check)
- `partition` overloads for type-guard predicates, narrowing the result to `[S[], Exclude<T, S>[]]`

### Changed

- **Breaking:** `slidingWindow`'s `start` and `step` parameters have swapped places; the signature is now
  `slidingWindow(arr, windowSize, start?, step?, circular?)`
- **Breaking:** `base64FromUint(0)` now returns `"A"` (the first base64 character) instead of `""`
- `generator`'s type parameter no longer accepts nullable types, matching its runtime behaviour of stopping at
  the first `null`/`undefined`
- `parseHexChannels` now parses the hex digits as a single 24-bit value instead of matching two-digit pairs
- Release scripts rewritten from Bash to Node (`scripts/*.mjs`) so they run on Windows; `check-output` now
  reads the packed tarball with the `tar` package instead of the `tar`/`jq` CLIs
- Bumped pnpm to 12.5.1
- Bumped dependencies (`vitest`, `@vitest/coverage-v8`, `happy-dom`, `oxlint`, `oxlint-tsgolint`, `prettier`,
  `publint`)

### Fixed

- `slidingWindow` no longer drops the final window when non-circular (e.g. `[1, 2, 3, 4, 5, 6]` with a window
  size and step of `2` now includes `[5, 6]`)

## [2.0.1] - 2026-08-07

### Fixed

- `partition` is now exported from `data/index.ts` (it was added in 2.0.0 but never exported)

### Changed

- Bumped dependencies (`oxlint`, `publint`)

## [2.0.0] - 2026-08-04

### Added

- `partition` for splitting an array into two groups by a predicate (`data/partition.ts`)
- `parseHexChannels` for parsing a hex color string into `[r, g, b]` channels
- `timeMultiSequence`, a wall-clock-time-driven counterpart to `multiSequence`
- `AlphaNumeric` string type
- An optional `maxSize` parameter for `memoize`, evicting the least-recently-used entry once exceeded
- JSDoc comments across all public functions, classes, and methods

### Changed

- **Breaking:** `throttled`/`throttledAsync` no longer take an `initial` value parameter; the returned
  function now returns `undefined` until the first invocation instead of a caller-supplied placeholder
- **Breaking:** `multiSequence` dropped its `temporal`/`start` overload and is now always driven by a
  manually tracked running total; use the new `timeMultiSequence` for wall-clock-time-driven sequences
- **Breaking:** `lerpColors` now takes parsed `[r, g, b]` channel tuples (via `parseHexChannels`) instead of
  raw hex strings, and clamps channels to `[0, 255]` so an out-of-range `percent` still produces a valid color
- **Breaking:** `typedKeys`, `pick`, and `omit` now only consider enumerable own properties/symbols, matching
  `Object.keys` semantics instead of including non-enumerable ones
- `pick`/`omit`'s data-last (curried) form now accepts any `PropertyKey`, not just `string`
- `positiveMod` now returns a non-negative result for a negative divisor too, not just a negative dividend
- Switched package manager from Yarn to pnpm
- Switched linting from ESLint to oxlint (with `oxlint-tsgolint` for type-aware rules); formatting is now
  handled separately by Prettier via `pnpm format`/`pnpm format:check`
- `findissues` and `prepublish` scripts now include a format check
- Bumped dependencies (`@vitest/coverage-v8`, `happy-dom`, `prettier`, `publint`, `typescript`,
  `@arethetypeswrong/cli`)

### Fixed

- `collectPaginated` now throws instead of hanging when `perPage` is `0` or negative
- `slidingWindow` now throws instead of hanging or silently misbehaving when `step` is `0`/negative or
  `windowSize` is negative, and no longer wraps a negative `start` index for non-circular windows
- `debounce` no longer cancels a new call that was scheduled from inside its own callback.
- `formatLocaleDate` now derives fields via `Intl.DateTimeFormat` parts instead of regex-parsing
  `toLocaleString` output, and returns `"Invalid Date"` for an invalid date
- `memoize`'s default cache key no longer collides `NaN`/`Infinity`/`-Infinity`/`undefined` with each other or
  with a real `null` argument
- `dom.toAttrs` now escapes `&` and `"` in attribute values
- `dom`'s tag-name-to-element-type inference now handles digit-bearing tag names (e.g. `h1`)
- `sequence` now handles negative `currTotal` correctly (wraps when looping, holds on the first frame
  otherwise)
- `zip`'s type now correctly unwraps `readonly` array arguments to their element type

## [1.5.1] - 2026-07-02

### Added

- GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Coverage reporting with `@vitest/coverage-v8` and 100% threshold
- Subpath exports for all modules (`core`, `data`, `encoding`, `format`, `functional`, `math`, `timing`, `ui`)
- `CHANGELOG.md` following Keep a Changelog format
- `.versionrc.json` configuration for standard-version
- `standard-version` as a dev dependency for automated releases

### Changed

- Replaced `jsdom` with `happy-dom` as the test environment for improved compatibility and performance
- Bumped Yarn to 4.17.0
- Improved README with badges, installation instructions, table of contents, and compatibility section
- Updated contributing section to reference `CONTRIBUTING.md`
- Simplified release flow using standard-version

### Fixed

- CI pipeline for Node.js 20+ with Yarn PnP issues resolved
- Release script flow

## [1.5.0] - 2026-07-02

### Added

- `pipe` and `pipeable` functions inspired by effect.ts for function composition
- `StringToNumber` and `Multiply` types
- `NonEmptyArray` type
- `attemptAsync` for async unsafe function handling
- `StringSplit` type utility
- Dev container configuration (`.devcontainer/`)

### Changed

- Organised project structure with improved module exports
- Standardised `package.json` configuration
- Upgraded ESLint and other dependencies
- Bumped Yarn to 4.15

### Fixed

- `StringSplit` implementation
- Release flow

## [1.4.0] - 2026-01-01

### Added

- `debounce` timing helper
- `clamp` math utility
- `tagged.ts` improvements with `TagSymbol`
- `getAllPages` for paginated API fetching
- `sequenceResult.index` in animation helpers

### Changed

- Renamed `Tag` to `TagSymbol`
- Removed `DiscriminatedOptions` in favour of `UnionToPartial`
- Readonlyified various types
- Tidied up codebase

## [1.2.1] - 2026-01-01

### Fixed

- Added remaining exports to `index.ts`

## [1.2.0] - 2026-01-01

### Added

- `maths.clamp` utility

## [1.1.0] - 2026-01-01

### Added

- Core utility improvements and organisation

## [1.0.0] - 2026-01-01

### Added

- Initial release with DOM helpers, functional utilities, math helpers, and type utilities
