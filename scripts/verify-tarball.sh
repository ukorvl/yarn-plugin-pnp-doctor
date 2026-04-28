#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
# shellcheck disable=SC1091
source "$SCRIPT_DIR/common.sh"

check_command npm
check_command node
check_command tar
check_command yarn

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

(
  cd "$REPO_ROOT"
  yarn build > /dev/null
)

packed_name="$(
  cd "$REPO_ROOT"
  NPM_CONFIG_CACHE="$tmp_dir/npm-cache" npm pack --ignore-scripts --pack-destination "$tmp_dir" --json \
    | node --input-type=module -e "let data=''; for await (const chunk of process.stdin) data += chunk; const parsed = JSON.parse(data); const first = Array.isArray(parsed) ? parsed[0] : parsed; console.log(first.filename);"
)"

tarball_path="$packed_name"

if [[ ! -f "$tarball_path" && -f "$tmp_dir/$packed_name" ]]; then
  tarball_path="$tmp_dir/$packed_name"
fi

if [[ -z "$tarball_path" || "$tarball_path" == "null" ]]; then
  echo "Error: No tarball filename in npm pack --json output." >&2
  exit 1
fi

if [[ ! -f "$tarball_path" ]]; then
  echo "Error: Packed tarball not found at '$tarball_path'." >&2
  exit 1
fi

LC_ALL=C tar -tf "$tarball_path" | grep -q '^package/package.json$'
LC_ALL=C tar -tf "$tarball_path" | grep -q '^package/readme.md$'
LC_ALL=C tar -tf "$tarball_path" | grep -q '^package/LICENSE$'
LC_ALL=C tar -tf "$tarball_path" | grep -q '^package/bundles/@yarnpkg/plugin-pnp-doctor.js$'

extract_dir="$tmp_dir/extract"
mkdir -p "$extract_dir"
LC_ALL=C tar -xzf "$tarball_path" -C "$extract_dir"

node -e "const plugin = require(process.argv[1]); if (!plugin || typeof plugin.factory !== 'function') throw new Error('Packed plugin bundle does not export a Yarn plugin factory.');" "$extract_dir/package/bundles/@yarnpkg/plugin-pnp-doctor.js"

echo "Tarball smoke test passed: $tarball_path"
