#!/usr/bin/env bash
set -euo pipefail

pnpm login
pnpm version minor
pnpm release
