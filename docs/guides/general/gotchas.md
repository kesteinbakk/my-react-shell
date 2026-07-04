# General gotchas — all roles

Cross-project, cross-tool reminders that apply everywhere. Synced to every
project's `docs/guides/general/`.

## Environment
- macOS. `timeout`/`gtimeout` are NOT installed — bound a command's runtime with the Bash tool's own `timeout` parameter, never the shell command.
- Prefer the dedicated file/search tools over shell `cat`/`sed`/`awk` when one fits.

(Seed file — add cross-cutting, all-agent gotchas here. Code-craft universal rules
also belong in this `general/` bucket so spawned subagents receive them.)
