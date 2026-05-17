# Dev Container

This project includes a VS Code Dev Container configuration for Ubuntu-based development.

## Getting Started

1. Install the **Dev Containers** extension in VS Code.
2. Press `Ctrl+Shift+P` → **Dev Containers: Reopen in Container**.
3. The container will build, install Node.js 22 and Git, then run `yarn install`.

## Available Scripts

```bash
yarn test          # Run vitest tests
yarn build         # Compile TypeScript
yarn lint          # Run ESLint
yarn typecheck     # Type-check without emitting
yarn publish       # Publish to npm
yarn bump-and-release   # Bump minor version and release
yarn release       # Run prepublish, publish, tag, and push
yarn publint       # Validate package exports
yarn attw          # Check types with are-the-types-wrong
yarn check-output  # Verify package tarball contents
```
