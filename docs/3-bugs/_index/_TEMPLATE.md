# Bugs — <project> · <YYYY-MM>

Source of truth for bug IDs in this project for this month. Lives in this project's repo under `docs/3-bugs/_index/`. Edited only in the primary working tree and committed immediately, so worktrees and branches can't diverge the numbering — see `~/Developer/CLAUDE.md` → Task & Bug Index.

## Rules

- **New rows go on top. Never reorder existing rows.** The top row is therefore always the highest `BXXX` — read it alone to get the next ID (`top + 1`), no need to scan the file.
- **At month rollover** (you are creating this file fresh for a new month): open the *previous* month's file, copy every still-open bug row into this file, and report the carry-forward to the user. Number the first new bug of the month from the previous month's top row `+ 1`.
- **Description = 1–8 sentences** — a brief overview of the bug. The full writeup lives in `docs/3-bugs/BXXX-.../bug.md`, not here.
- **Status:** `open → in-progress → awaiting-user-confirmation → resolved → archived`. Also `blocked`, `on-hold`, `cancelled`. **Closure to `resolved` requires explicit user confirmation in the bug doc** — an agent's terminal state is `awaiting-user-confirmation`; see `~/Developer/CLAUDE.md`.

| B-ID | Name | Status | Worktree | Description | Affects |
|------|------|--------|----------|-------------|---------|
