# AI Tooling Matrix

Last reviewed: 2026-04-22

This repo keeps one shared agent spine and thin tool-specific entrypoints.

## Codex

Entry point: `AGENTS.md`

Use Codex for scoped implementation, code review, fixture creation, and long-running validation. Codex should prefer local repo context first, then official docs when behavior may have changed.

## Claude Code

Entry point: `CLAUDE.md`

Claude Code project memory imports the shared repo instructions plus the key project docs. Keep Claude-specific behavior in `CLAUDE.md` and shared behavior in `AGENTS.md`.

## GitHub Copilot

Entry points:

- `.github/copilot-instructions.md`
- `.github/instructions/yarn-plugin.instructions.md`
- `AGENTS.md` for agent-style work

Use the repository-wide instructions for general project behavior and path-specific instructions for TypeScript/Yarn plugin work.
