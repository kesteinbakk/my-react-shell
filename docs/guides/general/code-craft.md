# Code-craft universals — all coding roles

Framework-neutral rules for any agent that writes or changes code. Synced to every
project's `docs/guides/general/`, so spawned code subagents (which skip
`work-contract.md`) still receive them.

## No silent defaults for absent values

A possibly-absent value is **checked, not defaulted** — server- and client-side.
Never paper over a null-ish value with `||` / `??` / a ternary and a literal.

- Split the states: `if (v === null)` handle the known-empty case; `if (v === undefined)` **throw**, unless absence is genuinely valid here.
- `||` is doubly wrong — it also swallows `0`, `""`, `false`.
- **Dev-shaped fallbacks are the sharpest trap:** a literal shaped like the dev value (`localhost`, a port, an `http(s)://` origin, a test key) passes every local check and fails only in production.
- A real default is a deliberate, environment-identical choice (a UI prop default, a documented constant) — never a patch over "the value didn't arrive."

## Investigation is not a code-change task

An investigation, review, or opinion request ("how does X work", "is this a good
pattern", "should we…", "what would it take to…") asks you to **read and answer** —
not to change code. Answer first; propose changes as a plan and wait for a go-ahead.
Only an explicit change instruction ("implement", "add", "fix", "refactor")
authorizes edits.

## Don't add unrequested confirmation or destructive-action UI

Build exactly the behavior asked for. Don't invent confirmation dialogs, "are you
sure?" guards, undo affordances, or extra safety prompts around a destructive action
unless the request calls for them.

## "Works in dev" is no signal for a prod-only failure

Bugs that live in the dev↔prod gap (CSP, env resolution, build-time inlining,
minification, SSR) never reproduce locally. When diagnosing one, **verify by
inspection** of the prod-path config/build — not by confirming it works in dev,
which proves nothing about the failing case.

## Don't silently reduce scope on a port or refactor

Moving or reimplementing code carries **all** of its behavior across. If a port
would drop a case, a prop, an edge-handler, or any capability the original had —
**STOP and ask.** Silently shipping a smaller thing than existed is a scope
regression, not a simplification.

## Reuse before you build (Rule of Two)

Before writing a new component/util/pattern, check whether one already exists.
When a third case appears for something duplicated twice, extract the shared
piece rather than copy it a third time.

## Zero effect means wrong diagnosis, not a wrong value

If a change (a CSS property, size, spacing, a className, a config value) has no
visible effect at all, do NOT simply increase the value and try again. Zero effect
means your mental model is wrong — the change isn't reaching the target, a parent
constraint overrides it, the class isn't applied, or you're editing the wrong file.
Stop, diagnose why it had no effect, fix the root cause, then apply the correct
value once.

## Don't explain features to end users in UI unless asked

Describing how a feature should behave is an **implementation instruction, not a
request to surface that explanation in the UI.** "Show the icon when X", "the button
appears when Y", "search matches Z" tell you what to *build* — they never authorize
user-facing copy (labels, helper text, notes, captions) that explains the mechanics
to end users. Build the behavior; say nothing about it in the UI. The only exception
is an explicit content request ("add a note explaining how X works").
