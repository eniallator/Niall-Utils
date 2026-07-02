# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
