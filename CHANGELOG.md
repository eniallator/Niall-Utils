# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
