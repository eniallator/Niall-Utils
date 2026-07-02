#!/usr/bin/env bash
set -euo pipefail

yarn npm login
yarn version minor
yarn release
