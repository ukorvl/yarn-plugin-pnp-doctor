# Claude Code Project Memory

Read @AGENTS.md first.
Read @README.md for user-facing product shape.
Read @docs/preset-authoring.md before changing presets.
Read @docs/ai/agent-operating-model.md for workflow and safety policy.

## Claude-Specific Notes

- Keep shared project rules in `AGENTS.md`; use this file only for Claude Code entrypoint behavior.
- Do not create or rely on `CLAUDE.local.md`; prefer user-level imports for private preferences.
- Treat packageExtension preset changes as evidence work, not autocomplete work.
- When changing code, run the relevant Yarn commands from `AGENTS.md`.
