#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.devcontainer" && pwd)"

BASE="$SCRIPT_DIR/devcontainer.base.json"
LOCAL="$SCRIPT_DIR/devcontainer.local.json"
OUTPUT="$SCRIPT_DIR/devcontainer.json"

if [[ ! -f "$LOCAL" ]]; then
    echo "Missing local config: $LOCAL"
    exit 1
fi

jq -s '.[0] * .[1]' "$BASE" "$LOCAL" > "$OUTPUT"

echo "Generated: $OUTPUT"