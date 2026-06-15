---
name: independent-work
description: "How to execute when the user has authorized autonomous work and is unavailable.\nTRIGGER when: user says they will be away, 'work alone', 'work independently', 'autonomously', 'I'm leaving', 'won't be checking', 'don't wait for me', or otherwise grants execution authority without live oversight.\nDO NOT TRIGGER when: user is present and reviewing each step."
---

# Independent Work Mode

Upfront alignment (plan, design questions, approval) is when the user grants authority. Once granted and the user is away, the authorization stands until they return. Your job is to finish as much of the approved plan as possible within that window.

**Default: execute. Don't manufacture new checkpoints.**

Mid-execution discoveries are engineering judgment calls you've been authorized to make — not new gating decisions.

**Optional pairing — `notify-me`.** If the away window is non-trivial and the user hasn't already activated it, suggest the `notify-me` skill in your first response. It fires a macOS + Telegram notification on every turn-end — usually what the user actually wants when they're not at the terminal.

---

## Granted authorities (autonomous mode only)

The user is not present to start things for you. Under this mode you are authorized to do what the normal "user-instruction only" rules forbid:

- **Browsers.** Open `mcp__Claude_Preview__*` and `mcp__chrome-devtools__*` whenever verification needs them. See the `browser-tools` skill for usage; the "wait to be asked" gate is lifted here.
- **`preview_start` dev servers.** Spin up the agent-port dev server (`port + 1000`) for verification. Always `preview_stop` before the turn ends — no orphaned processes.
- **Real dev servers.** If the work genuinely needs a full `dev start` — or a single project's dev server — start it yourself. Still avoid the user's 30xx ports if `dev start` is already running; if you start one, stop it before the away window ends.
- **`npx convex dev`.** Start it when the task requires schema pushes or function deploys. First-run interactive auth still blocks — if it prompts, log it as a blocker and move on. Stop the process before the window ends.
- **Convex env vars on the dev deployment.** `mcp__convex__envSet` / `envRemove` against the dev deployment is allowed when the task requires it. Verify deployment first (`mcp__convex__status`); never touch **prod** env vars — that needs a fresh grant. **Every dev env change must appear in the in-chat summary on return** (key + action; not the value). `.env*` files on disk may also be read and edited when the task requires it — surface each change in that same return summary (key + action, never the value). A prod-credential file like `.env.deploy` still needs a fresh grant.
- **Push to non-production branches.** Push is allowed to any branch the project's CLAUDE.md does **not** declare a Vercel production branch (e.g. zingularis/zing-sdk `main`, and non-Vercel repos like dev-docs). `pre-push-checks` still gates every push. Pushing to a production branch (`prod`, or `main` where it is the deploy branch) still needs a fresh grant — never autonomous.

These authorities expire the moment the user returns (see "Exiting independent mode"). All other restrictions in `~/Developer/zingularis/CLAUDE.md` still apply — especially "Mandatory User Approval" for dependency changes, approach switches, and workarounds.

---

## Do

- **Absorb, log, continue.** Scope growth, review findings, unexpected file counts → update the task doc, note the concern, keep going.
- **Prefer "continue + flag"** over "pause + ask". The user redirects on return.
- **Use the full window.** Completing 3 of 12 phases in a reserved window is a failure, not caution.
- **Make judgment calls that follow from the approved plan.** Document reasoning in the task doc.
- **Pick up adjacent authorized work** when one piece is genuinely blocked.
- **Self-pace background agents.** Poll actively; respawn stuck ones. See the `tm` agent for polling rules when spawning subagents.
- **Commit after each task or phase.** No approval needed. Push only to non-production branches (see Granted authorities). See `~/Developer/zingularis/CLAUDE.md` "Commit Rules".
- **Break cleanly.** No legacy shims, no backwards-compat wrappers, no "if old field exists" fallbacks. Rewrite callers, delete the old thing. A loud typecheck break is better than a silent workaround. See `~/Developer/zingularis/CLAUDE.md` "Break Cleanly".
- **Stay inside the task's deletion scope.** See "Scope wall" below.

## Don't

- Stop to re-confirm a decision "proceed autonomously" already covered.
- Invent intermediate safety checkpoints the user did not request.
- Wait passively for a response the user cannot give.
- Write a long status report instead of doing the work. Short status + more completed phases wins.
- Hold back from committing because "the user might want to review first" — they'll review the diff on return.
- Add compatibility shims, deprecated wrappers, or "just in case" fallbacks to avoid breaking callers. Break them; fix them.
- **Delete unrelated code to make the typecheck green.** See "Scope wall" below.

---

## Scope wall

The most common autonomous-mode failure: agent hits a TS error or notices dead code outside the task scope, deletes it to "clean up" or to get the build green, and ships a diff far larger than authorized.

**Inside scope** (code the task replaces, refactors, or is directly modifying):
- Delete dead code. Resolve TS errors. Standard cleanup. This is correct.

**Outside scope** (anything the task isn't touching):
- Do **not** delete. Do **not** "fix" by deletion. Do **not** chase a green typecheck across the scope wall.
- It is acceptable to leave a TS error, a lint warning, or visibly dead code untouched if addressing it would mean editing files outside scope. A loud broken state on return is better than a silent over-deletion.
- Log it under "Suggested cleanup" in the away report. Flag the worst items in chat on return.
- Out-of-scope deletion or refactor needs a fresh grant from the user — never assume "they'd obviously want this."

If a task-required change creates an unavoidable out-of-scope TS error and you can't proceed without touching the other file, **stop** and treat it as a genuine blocker. Don't widen the diff to escape the wall.

---

## Genuine blockers (short list)

Only these justify pausing and stopping:

- Missing credentials or external access you cannot self-serve.
- Destructive operation **outside approved scope** (force-push, dropping data, deleting branches).
- Contradictory instructions discovered where both paths are irreversible.
- User's stated pre-condition failed (e.g., "if phase 2 tests fail, stop").
- Task cannot proceed without an out-of-scope deletion or refactor (see "Scope wall").

Everything else → note it, keep going.

---

## The pause test

Before pausing, answer:

1. Did the user answer this (or an equivalent) during upfront alignment?
2. Is the concern reversible within the approved scope?
3. Would "flag in task doc + continue" produce a better return state than stopping?

**Yes to any → continue.** No to all three → pause and document why. If the pause is a decision only the user can make, don't go idle — use `notify-me`'s **reply-polling loop** (its "Reply polling (away mode)" section) to ask on Telegram and pick the answer up mid-run, instead of stopping until return.

---

## On return

One compact report at `docs/4-reports/status/YYYY-MM-DD-away-report.md` (copy `_template.md`):

- Completed
- Remaining
- Flagged concerns discovered mid-work
- Suggested cleanup (out-of-scope code that looks dead — never deleted autonomously)
- Recommended next step

The diff and task doc are the record — don't pad with narrative.

---

## Exiting independent mode

The moment the user comes back with any normal interaction — a question, a bug report, feedback, a redirect, a new task — independent-work mode is **over**. The away authorization expired the second they returned.

From that point on:

- Operate under normal oversight: ask before deviating, surface choices, follow `~/Developer/zingularis/CLAUDE.md` "Mandatory User Approval".
- Do **not** re-enter independent mode just because the previous session had it, or because the new task feels similar in scope.
- Re-entry requires a fresh, explicit grant — "I'll be away again", "work alone on this", "won't be checking", or equivalent. Until that comes, treat the user as present.

## Notifications

At the start of every independent-work session, invoke the `notify-me` skill so a macOS notification and Telegram message fire when each turn finishes. Do this before any other work. `notify-me` is also your **inbound** channel: when you genuinely need a user decision mid-run, its reply-polling loop lets you ask on Telegram and pick up the answer without ending the session (see "The pause test"). If `notify-me` is unavailable, log a warning and continue — notifications are nice-to-have, not blocking.
