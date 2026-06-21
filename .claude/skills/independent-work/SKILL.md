---
name: independent-work
description: "How to execute when the user has authorized autonomous work and is unavailable.\nTRIGGER when: user says they will be away, 'work alone', 'work independently', 'autonomously', 'I'm leaving', 'won't be checking', 'don't wait for me', or otherwise grants execution authority without live oversight.\nDO NOT TRIGGER when: user is present and reviewing each step."
---

# Independent Work Mode

The user is leaving. You hold authority to execute the agreed plan to completion; it stands until they return. Two jobs, in order:

1. **Before they go — resolve every decision the plan already reveals**, so the window has nothing left to stop for.
2. **While they're gone — finish.** Reorder around blockers, carve out what you can't do, keep moving.

**Independent mode has no "should I?" — only "can I?"** If a step is authorized and unblocked, do it. Never stop at a phase boundary to ask permission to continue with work you were already cleared for. Stopping is the failure, not the safe choice — sibling agents and automation may be gating on your completion, and a half-stopped run cascades into their failures too.

---

## Before the user leaves — pre-flight

Don't let them go until this is done. Everything here is foreseeable **now**; asking later is impossible.

1. **Bypass-permissions.** Independent work assumes it — a tool prompt with the user gone stalls everything. Say so in your pre-flight reply ("running in bypass mode — if I wasn't launched that way, switch me before you go") so they can confirm or fix it.
2. **Mine the plan for every decision it defers.** Each "design review will decide", "TBD", "depends on your call", each anonymisation / naming / format / count choice the plan punts — collect them and ask them **all now**, batched, with full context (see `user-interaction` for how). A decision the plan already names is not a mid-run discovery. Ask it up front or lose the chance.
3. **Dev data.** Ask once: is any of it precious, or can I clear / reseed / migrate freely? Absent an answer the default is **disposable** — a large migration usually wants a clean reseed, not a delicate in-place migration.
4. **Fold the answers into the plan.** The window is now decision-free.

A phase whose decisions you couldn't get settled up front is one you **skip and carve out** (below) — never one you start and abandon halfway.

---

## Granted authorities (autonomous mode only)

The user can't start things for you, so you may do what the "user-instruction only" rules normally forbid:

- **Browsers** (`mcp__Claude_Preview__*`, `mcp__chrome-devtools__*`) for verification — the "wait to be asked" gate is lifted. See `browser-tools`.
- **Dev servers.** `preview_start` the agent-port server (`port + 1000`), or a real `dev start` if the work needs it. Avoid the user's 30xx ports; stop anything you start before the window ends.
- **`npx convex dev`** for schema pushes / deploys. First-run interactive auth still blocks — log it and move on. Stop it before the window ends.
- **Dev data + dev deployment.** Clear, reseed, and migrate dev data freely (per pre-flight). `mcp__convex__envSet` / `envRemove` and `.env*` edits on the **dev** deployment are allowed when the task needs them — verify with `mcp__convex__status` first. Every dev env / file change goes in the return summary (key + action, never the value). **Prod** env, prod-credential files (`.env.deploy`), and prod data need a fresh grant — never autonomous.
- **Push to non-production branches** (`pre-push-checks` still gates). A production branch — `prod`, or `main` where the project's CLAUDE.md makes it the deploy branch — needs a fresh grant.

All other rules still apply — especially `~/Developer/CLAUDE.md` "Mandatory User Approval" for dependency changes, approach switches, and workarounds. These authorities expire the moment the user returns.

---

## While the user is away

**Do**
- **Execute to the end of the window.** 3 of 12 phases done in a reserved window is a failure, not caution.
- **Reorder freely.** A blocked phase doesn't halt the run — do every unblocked phase first, return to the blocked one last.
- **Absorb, log, continue.** Scope growth, review findings, surprising file counts → note it in the task doc and keep going.
- **Commit after each phase** (no approval needed); push only to non-production branches.
- **Break cleanly** — rewrite callers, delete the old thing. A loud typecheck break beats a silent shim or a "just in case" fallback.
- **Self-pace background agents** — poll, respawn stuck ones (see the `tm` agent).

**Don't**
- Re-confirm a decision the plan or pre-flight already settled.
- Stop at a phase boundary to ask permission to start the next authorized phase.
- Invent safety checkpoints the user didn't request, or wait passively for a reply they can't give.
- Write a long status report instead of doing the work — short status, more phases done.
- Chase a green typecheck across the scope wall (below).

---

## When you hit a wall — route around, don't stop

A wall is not a stop signal until you've tried to get past it. In order:

1. **Reorder** — any other unblocked work? Do it now; return to this last.
2. **Carve it out** — split the blocked piece into a follow-up (a task row where the project tracks tasks, else a note in the report) and continue with everything else. A blocked phase becomes one deferred item, not the end of the run.
3. **Only the residue that blocks *everything* remaining is a real blocker**, of two kinds:
   - **A decision only the user can make** — *genuinely new*, not one the plan named (that was pre-flight's job). Don't go idle: use `notify-me`'s reply-polling loop to ask on Telegram and pick the answer up mid-run.
   - **An external event you're waiting on** (sibling commit, CI). Self-pace with `ScheduleWakeup` under `/loop`, or finish all unblocked work and hand back with an explicit "re-invoke me when X lands". A `run_in_background` process is reaped when the session goes idle — don't depend on a wake you can't guarantee. A watcher reporting in is a mandatory re-check of the dependency, never "no response requested".

Hard stops you genuinely cannot route around: missing credentials you can't self-serve; a permission prompt you can't approve (proof you're not in bypass mode); a destructive op outside approved scope; a stated pre-condition that failed ("if phase 2 tests fail, stop"). Everything else has a route around it.

---

## Scope wall

The classic autonomous failure: hit a TS error or spot dead code **outside** the task, delete it to get green, ship a diff far larger than authorized.

- **Inside scope** (what the task replaces / refactors / modifies): delete dead code, resolve TS errors — correct.
- **Outside scope** (anything the task isn't touching): do **not** delete or "fix" by deletion. Leaving a loud TS error or visibly dead code untouched is acceptable; over-deleting across the wall is not. Log it under "Suggested cleanup". Out-of-scope deletion needs a fresh grant.

A task-required change that forces an out-of-scope TS error you can't resolve without editing other files is a genuine blocker — carve it out, don't widen the diff.

---

## On return

One compact away-report (zingularis layout: `docs/4-reports/status/YYYY-MM-DD-away-report.md`, copy `_template.md`): Completed · Remaining + carved-out follow-ups · Concerns found mid-work · Suggested cleanup · Dev env / file changes (key + action) · Recommended next step. The diff and task doc are the record — don't pad with narrative.

## Exiting independent mode

The moment the user returns — any question, bug report, feedback, redirect, new task — independent mode is **over**. Resume normal oversight: ask before deviating, surface choices. Don't re-enter because the last session had it or the new task feels similar; re-entry needs a fresh explicit grant.

## Notifications

At the start of an independent session, invoke `notify-me` before other work — it fires macOS + Telegram on each turn-end and is your inbound channel for the reply-poll above. If unavailable, log a warning and continue.
