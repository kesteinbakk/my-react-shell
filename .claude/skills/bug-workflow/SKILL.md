---
name: bug-workflow
description: "Bug report format, intake mindset, and orchestration for `BXXX` work. Keeps the failed filer's theories out of the report and routes the fix through code-investigator → hypothesis → debugging cycle.
TRIGGER when: filing a bug report; picking up a `BXXX` task; opening a `docs/3-bugs/.../bug.md`; the user says 'there's a bug' or 'this is broken' and you're about to orchestrate the fix (not jump straight to a fix yourself).
DO NOT TRIGGER when: already past intake with a confirmed hypothesis and evidence — use `debugging` directly."
---

# Bug Workflow

Bug work has the same shape as feature work with two differences:

1. The artifact landing on your desk is **biased** — typically written by an agent (or earlier-you) who already tried to fix the bug and failed.
2. Closure requires **the user**, not just typecheck and your own verification.

This skill covers (1) report format, (2) intake mindset, (3) orchestration sequence. The fix loop itself is owned by `debugging`; meta-escalation by `instrument-when-stuck`. Don't re-derive them here.

---

## Filing a bug report — facts only

A bug report is a record of **what was observed vs what was expected**. It is not an explanation of why, and not a place for the filer's theories.

The reason this rule exists: a report is normally filed *after* the reporting agent has tried (and failed) to fix the issue inline. Their theories have already been disproven once by their own failure. Embedding them in the report biases the next agent toward repeating the same dead ends — same as letting an agent who said "I bet this is the cause" twice keep guessing.

### The report contains

- **Summary** — one sentence, the symptom.
- **Expected** — what should happen. Quote the spec / acceptance criterion if one exists.
- **Actual** — what does happen. Verbatim error messages, screenshots, log excerpts. No interpretation.
- **Reproduction** — exact steps. URL/route, click sequence, input values, setup state.
- **Environment** — browser/OS/branch/project if not obvious.
- **What's NOT broken** (optional) — adjacent things that work fine. Helps rule things out structurally. Facts only, no speculation about why they work.
- **Prior attempts** (only if any) — list each attempt as a fact: "Tried X — symptom unchanged." Do NOT add "I think it didn't work because…" or "the real cause might be…". Dead-end facts protect the next agent from repeating them; dead-end theories mislead.

### The report does NOT contain

- "Suspected cause"
- "I think it's because…"
- "The bug is in file X"
- "This is similar to bug #Y"
- A narrative of the filer's reasoning

If you (the filer) have hard proof of root cause and a confirmed fix in mind, you're past the report stage. File it as a normal change, not a bug.

---

## Intake — picking up a BXXX

When the orchestrator (normally `tm`) picks up a bug:

1. **Read the report. Strip the theories.** If "Suspected cause", "I think…", or fix-attempt narratives are in the file, treat them as evidence the previous attempts failed — not as guidance. Note the dead ends so you don't repeat them; do not adopt their conclusions.
2. **Reproduce, or get the user to reproduce.** If you can't see the failure yourself, the rest is guesswork. `dev log <short>` is the standard channel for browser-side reproductions — see `debugging`.
3. **Spawn `code-investigator` for an inventory pass.** Mapping only — no fixes yet. Ask for the actual code in the surface the report describes: file:line for entry points, what triggers what, data shape at each step. **Do not ask for a fix theory.** You want the map, not their guess at where the treasure is.
4. **Form your own hypothesis.** With facts + code map + reproduction, the `debugging` cycle takes over: SCOPE → OBSERVE → HYPOTHESIZE → PROVE → FIX.
5. **If the bug already has 2+ prior fix attempts on record** (in `bug.md`, in git log, or in the chat that led to filing), jump to `instrument-when-stuck` immediately. Prior failures are evidence the obvious mental model is wrong — weight them.

The mindset throughout intake: **observations from the reporter are signal; theories from the reporter are noise.** Treat their bug.md the same way `debugging`'s "Common Failures" treats `"Error says X, so X is problem"` — error text and reporter theories both mislead.

---

## Fix and closure

The fix loop is the standard `debugging` cycle (or `instrument-when-stuck` if you escalated). Bug-specific points:

- **Verification must be behavior-level.** Render-level signals don't close bugs — see `debugging` "Verification tiers." Typecheck and "the diff looks right" are not closure signals.
- **The user confirms, not you.** Even after your own behavior-level verification, the bug is not closed until the user reproduces against their real environment and says it's gone. A `PreToolUse` hook blocks any edit that flips `Status` to `Resolved` without a `User confirmed:` line. Don't route around it: write `Status: Awaiting user confirmation` and ask.
- **Revert failed fixes by default.** When the user reports the bug is unchanged, the next move is to revert your fix before trying the next theory — not to stack a second fix on top. Keep the change only if it independently improves the code, and say so explicitly. (Stacked unverified fixes leave a codebase of wrappers and indirection whose original justification was wrong.)
- **If a new symptom emerges during the fix**, mark the prior issue resolved and add `Issue #N` for the new one. Never overwrite history in `bug.md`.

For tm-specific bits (BXXX numbering, index status flow, archive, worktree ordering for the confirmation gate), see the Bug Workflow section in `~/.claude/agents/tm.md`.

---

## Cross-references

- `debugging` — the standard fix cycle. Default tool once intake is done.
- `instrument-when-stuck` — meta-escalation when 2+ attempts have failed, or you inherited a bug with 2+ prior attempts.
- `tm.md` Bug Workflow — index / archive / status flow specific to the orchestrator role.
