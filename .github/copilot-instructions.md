# GitHub Copilot Instructions

This repository builds `yarn-plugin-pnp-doctor`, a Yarn plugin for diagnosing Plug'n'Play compatibility problems.

Follow `AGENTS.md` as the shared agent guide. The most important project rules are:

- Keep the command layer thin and put diagnosis behavior in pure core modules.
- Use Yarn Project APIs instead of parsing lockfiles by hand when possible.
- Do not add packageExtension rules unless a real failure or fixture verifies them.
- Keep presets conservative and actionable.
- Run `yarn typecheck`, `yarn test`, and `yarn build` for source changes.
- Run `git diff --check` for documentation-only changes.

For TypeScript, preserve strict typing and avoid broad `any` casts. For docs, keep instructions short, durable, and tied to project behavior.
