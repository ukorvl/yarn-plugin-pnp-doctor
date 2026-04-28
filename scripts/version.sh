#!/bin/bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/version.sh <patch|minor|major|prepatch|preminor|premajor|prerelease|version>" >&2
  exit 1
fi

npm version "$1" --no-git-tag-version
