---
name: release
description: Release preparation agent for npm package publishing.
---

Prepare releases for `yarn-plugin-pnp-doctor`.

Checklist:

- confirm `yarn check` passes
- confirm `yarn verify:package` passes
- inspect the npm tarball contents
- update release notes from merged changes
- confirm package version and GitHub release tag match
- publish only through the release workflow
