# Tasks — <project> · <YYYY-MM>

Source of truth for task IDs in this project for this month. Lives in this project's repo under `docs/2-tasks/_index/`. Edited only in the primary working tree and committed immediately, so worktrees and branches can't diverge the numbering — see `~/Developer/CLAUDE.md` → Task & Bug Index.

## Rules

- **New rows go on top. Never reorder existing rows.** The top row is therefore always the highest `TXXX` — read it alone to get the next ID (`top + 1`), no need to scan the file.
- **At month rollover** (you are creating this file fresh for a new month): open the *previous* month's file, copy every still-open task row into this file, and report the carry-forward to the user. Number the first new task of the month from the previous month's top row `+ 1` (a closed top item stays behind but still counts).
- **Description = 1–8 sentences** — a brief overview of what the task is about. The full writeup lives in `docs/2-tasks/TXXX-.../task.md`, not here.
- **Status:** `planning → in-progress → finished → archived`. Also `blocked` (waiting on external resolution), `on-hold` (intentionally parked), `cancelled` (append `(cancelled)` to the description; row stays — never renumber). Bump to `in-progress` and fill the `Worktree` column immediately before spawning the first subagent or starting impl — see the `tm` agent for the trigger rule.

| T-ID | Name | Status | Worktree | Description | Affects |
|------|------|--------|----------|-------------|---------|
