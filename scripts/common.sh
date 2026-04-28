#!/bin/bash

set -euo pipefail

SCRIPT_DIR="${SCRIPT_DIR:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)}"
REPO_ROOT=$(cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd)
PACKAGE_JSON="$REPO_ROOT/package.json"
PLUGIN_BUNDLE="$REPO_ROOT/bundles/@yarnpkg/plugin-pnp-doctor.js"

check_command() {
  if ! command -v "$1" > /dev/null 2>&1; then
    echo "Error: Required command '$1' is not installed or not in PATH." >&2
    exit 1
  fi
}
