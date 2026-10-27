# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code philosophy

The author is strict about quality. Actively look for a more elegant way to express something rather than
settling for the first working version:

- **Elegance and conciseness** over verbosity. Prefer expressions over statements, point-free style where it
  stays readable, small composable functions over large procedural ones.
- **Specificity in types.** Avoid `any`/`unknown` unless truly unavoidable, and justify it with an
  `oxlint-disable` comment. Prefer literal types, generics, and branded types over widened primitives. Infer
  return types where inference is exact; annotate explicitly only where inference would be looser than
  intended.
- **Functional paradigm.** Favor immutability, pure functions, and composition over mutation, stateful
  classes, and imperative loops — except where a loop is genuinely clearer or faster, e.g. a hot path or a
  short-circuiting search.
- **Don't over-abstract correct duplication.** A few near-identical lines that are each independently correct
  are not automatically a defect. Consolidate only when there's a real shared invariant at risk of drifting,
  not just to shrink a line count.
- If existing code could be written more elegantly, flag it — don't just match a style that itself has room
  to improve.

## Commands

```bash
pnpm install         # install dependencies (pnpm via Corepack, Node >= 22.13)
pnpm build           # tsc compile src/ -> dist/
pnpm typecheck       # tsc --noEmit for src (tsconfig.json) and test files (tsconfig.test.json)
pnpm lint            # oxlint src (type-aware, via oxlint-tsgolint; see .oxlintrc.json)
pnpm format          # prettier --write . (also organizes/type-annotates imports)
pnpm format:check    # prettier --check .
pnpm findissues      # typecheck + lint + format:check
pnpm test            # vitest run (100% coverage enforced, per file)
pnpm prepublish      # typecheck + lint + format:check + build + test + publint + check-output
```

```bash
pnpm vitest run src/core/attempt.test.ts   # single test file
pnpm vitest run -t "name of the test"      # single test case
```

`tsconfig.json` excludes `*.test.ts` and `scripts/`, so `pnpm typecheck` runs a second pass over them via
`tsconfig.test.json` (which `pnpm lint`'s type-aware pass also uses). That pass loads `@types/node` for the
release scripts, so `src` must stay typed independently of the DOM/Node globals (e.g.
`ReturnType<typeof setTimeout>`, not `number`).

The release/check scripts in `scripts/` are TypeScript run directly by Node's type stripping
(`node scripts/x.ts`), so keep them to erasable syntax (no enums, namespaces or parameter properties).

Coverage thresholds are 100% for statements/branches/functions/lines, evaluated **per file** — a new file
needs full coverage on its own, not just in aggregate.

## Releasing

Releases are cut from `main`. Claude prepares the release (steps 1-4); the user runs the publish step
themselves, since it pushes, tags and publishes to npm (and needs an interactive `pnpm login`).

1. **Find what changed.** `git describe --tags --abbrev=0` gives the last release tag (tags have no `v`
   prefix; don't use `git tag --sort`, the old `v2.0.1` tag sorts first). Then review
   `git log --oneline <tag>..HEAD` and `git diff <tag> HEAD -- src package.json` (the working tree should
   already be clean, so nothing is missed).
2. **Pick the semver bump** from the public API impact:
   - **major**: anything breaking for consumers — removed/renamed exports, changed return or parameter types,
     changed runtime behaviour, a dropped overload.
   - **minor**: backwards-compatible additions — new exports, overloads, optional parameters, methods.
   - **patch**: fixes only.
   - Docs, internal refactors, tooling and dependency bumps don't change the bump on their own; they ride along
     with whichever level the API changes call for (or patch if there are none).
3. **Update [CHANGELOG.md](CHANGELOG.md).** Add `## [X.Y.Z] - YYYY-MM-DD` (today's date) above the previous
   release, using the Keep a Changelog sections `Added` / `Changed` / `Fixed`. Prefix breaking items with
   `**Breaking:**`, write one bullet per user-visible change, and collapse dependency bumps into a single
   "Bumped dependencies (...)" bullet.
4. **Bump `version` in `package.json`** to match. Edit it directly (or `pnpm version <level> --no-git-tag-version`);
   plain `pnpm version` may also commit and tag, which `pnpm release` then duplicates.
5. **The user runs `pnpm release`.** It runs `pnpm prepublish` (typecheck, lint, format check, build, tests,
   publint, check-output), then `git add .`, commits `Release X.Y.Z`, creates the annotated `X.Y.Z` tag,
   pushes the commit and tag with `--no-verify`, and runs `pnpm publish --access public`. Because of
   `git add .`, nothing but the release changes should be in the working tree. `pnpm bump-and-release` is the
   shortcut for a plain **minor** release: it logs in and runs `pnpm version minor` before releasing, so
   it is only for when the changelog and version haven't been bumped yet.

Never run `pnpm release`, `pnpm bump-and-release`, `pnpm publish` or any `git push` as part of preparing a
release; stop after step 4 and hand over. `pnpm prepublish` is safe to run beforehand to confirm it will pass.

## Architecture

### Module layout and exports

Source is split into independent domains under `src/` (`core`, `data`, `encoding`, `format`, `functional`,
`math`, `timing`, `ui`), each with a barrel `index.ts`; the root `src/index.ts` re-exports every barrel, and
`package.json#exports` mirrors this for subpath imports. `sideEffects: false` is load-bearing — new code must
stay side-effect-free at module scope. Domains freely import across each other, so check whether an existing
helper elsewhere already does part of the job before writing new logic.

Imports use explicit `.ts` extensions and `import type` for type-only imports (both enforced by
config/lint); `pnpm format` sorts and dedupes them automatically.

### The `pipeable` convention

`functional/pipeable.ts` wraps a data-first implementation so the result supports both `fn(data, ...args)`
and `fn(...args)(data)` (the latter for use in `pipe`/`Array.prototype.map`/etc). New subject+config
utilities should follow this shape via the `DataFunc` interface.

Dispatch between the two call forms defaults to comparing argument counts, which breaks once both forms can
land on the same count (e.g. a shared optional trailing flag). In that case, pass a custom `isDataFirst` that
checks argument _shape_ instead of count.

Not every function can be wrapped this way: the type extraction can fail when the subject's generic is
constrained only to a bare `object` and also appears nested inside another parameterized type in a callback
parameter. Narrowing the constraint to fix it can cost real precision (e.g. losing array-input support) —
weigh that against the consistency gain rather than forcing it through.

`functional/pipe.ts`'s `pipe(data, ...fns)` chains these left-to-right instead of nesting calls.

### `Option` / `Monad`

Small homegrown functional primitives, not a library dependency. `Option<A, T>` carries a phantom
`OptionType` that narrows `getOrNull`/`getOrUndefined`/`getOrThrow`/`toMonad`'s return type when emptiness is
statically known — preserve this phantom-typing pattern rather than collapsing it if you extend the class.

### Tagged/branded types

`core/tagged.ts`'s `Tagged<Type, Name>` brands a type so it's structurally distinct from other values with
the same shape. Pattern for a new one: define the tagged type, expose an unchecked constructor, and pair it
with a validating type guard that consumers call on untrusted input before trusting the brand.

### `raise` as an expression

`core/utils.ts`'s `raise(error)` returns `never`, letting a throw be used as an expression (e.g. the
right-hand side of `??`) instead of a statement, so a failure can short-circuit without breaking out of an
expression chain. Default to this over an `if (...) throw` block; fall back to `if` when the condition or
error is multi-line enough that it reads more clearly that way. This exists because `noUncheckedIndexedAccess`
is on, so indexed access is `T | undefined` everywhere and needs an explicit narrowing step.

### Type-level arithmetic and parsing

`math/maths.ts` and `core/stringTypes.ts` implement arithmetic and regex-like string matching at the type
level via recursive conditional types, bounded by a `RecursionLimit` constant to avoid exceeding TypeScript's
own instantiation-depth ceiling. Two things to keep in mind when touching this code:

- Keep the limit with a safety margin below TS's real ceiling rather than maximizing it — a call that can
  never reach its terminal case still runs the full depth before falling back, and that alone can exceed the
  real ceiling before the fallback kicks in.
- If a terminal case is unreachable for some input, add an explicit short-circuit for that input rather than
  relying on the fallback to paper over it.

### Union-to-tuple/partial helpers

`core/unionToTuple.ts` and `core/unionToPartial.ts` are type-only utilities for manipulating union types
(converting a union to a tuple of its members, or destructuring keys that only exist on some members). Used
as building blocks by other type helpers in `core/` rather than being domain-specific.
