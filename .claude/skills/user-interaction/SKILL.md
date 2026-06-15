---
name: user-interaction
description: "Patterns for talking to the user — asking clarifying questions, using the AskUserQuestion picker safely, and other interaction etiquette. Behaviour depends on whether you can have multi-turn dialogue.\nTRIGGER when: asking clarifying questions, gathering requirements, making design decisions that need user approval, considering the AskUserQuestion picker, OR spawning a subagent that may itself need clarification.\nDO NOT TRIGGER when: user request is already clear and unambiguous."
---

# User-Interaction

The right pattern depends on whether you can have a multi-turn conversation with the user.

## Are you in a multi-turn conversation?

| Position | Can you ask follow-ups? | Pattern |
|---|---|---|
| **Top-level agent** (the user is in your chat — `tm`, `assist`, `code-investigator`, etc., when started directly) | Yes | Ask **one at a time** in chat |
| **Subagent** (spawned via the Agent tool by another agent) | **No** — you get one input, return one output | **Batch ALL questions** in your single response |

You usually know which you are from your spawn context: a subagent's prompt comes from another agent and ends with no follow-up channel. A top-level agent is in a live chat with the user.

When in doubt, assume top-level (one-at-a-time is safe).

---

## The `AskUserQuestion` picker

The `AskUserQuestion` picker is allowed **only** for genuinely simple, binary/short-answer questions where back-and-forth would add no value (e.g. "deploy now or defer", "worktree or main", "yes/no"). You can batch all simple questions in `AskUserQuestion`.

**The wrong threshold** is "can I phrase this as N options?" — almost any question can be forced into options. **The right threshold** is "would this benefit from back-and-forth?" If the user might want to probe your framing, surface a missing option you didn't think of, or ask "wait, before we go there, look at X" — that's a chat question, not a picker.


*The picker hides prior chat — never strand context behind it*

The `AskUserQuestion` UI **hides everything you wrote earlier in the same turn** (and there is no way for the user to temporarily dismiss the picker to scroll back). So:

- **Never pair chat text with `AskUserQuestion` in the same turn.** The accompanying narration disappears.
- **If you have already written more than a few sentences earlier in this turn, do NOT use `AskUserQuestion`** — ask in chat instead. The only exception is if you can fully restate every piece of context and reasoning from the hidden chat inside the picker's question + option descriptions. If you cannot fit it, ask in chat.
- Being prompted with a picker while the relevant context is hidden above is enormously frustrating. When in doubt, ask in chat.

## General rules

### Investigate before you interrogate

The cheapest answer to a design question is usually the code itself. Before piling up clarifying questions, ask only the ones that change *what you investigate* — scope-gating questions (which area, in or out). Read the real code first; then ask the substantive questions, grounded in what actually exists. Questions asked ahead of investigation are hypothetical, and when the investigation lands the answers get walked back — wasted round-trips that erode trust. (For `tm`, this is the 1a→1b→1c ordering: scope only in 1a, design dialog in 1c after the baseline.)

### Every question needs enough context to answer cold

You have read the code and docs. **The user has not.** A bare question like "Storage shape: null fields, ignore them, or refuse writes?" forces the user to either go read everything themselves or guess — both are failures of the question.

For each question, include:

- **What's the situation** — the relevant piece of the system, what currently exists, what's changing.
- **Why this is a decision** — what forces the choice, what's at stake.
- **The concrete options** with their trade-offs (not just labels).
- **Your recommendation** and the reasoning, when you have one.

Bare lists of options that read like agent-internal shorthand are the tell that you've skipped this step. 

Example:
```
I have 3 questions before I start.

1. The new auth endpoint — should it live under /v2 or replace /v1 in place?

   Background: /v1 is currently called by the mobile app (v3.2+) and the
   admin panel. Both pin to /v1 explicitly in their config.

   - /v2 (new path): existing clients keep working; we maintain two
     endpoints until the mobile app drops v3.2 support (~3 months).
   - Replace /v1: simpler, no parallel maintenance, but breaks any client
     that hasn't redeployed.

   I'd default to /v2 — the parallel-maintenance cost is small and the
   break risk on /v1 is real.
```

Wait for the answer. Document it. Then ask question 2 (with the same depth of context).


Exception: trivial clarifications can go in the picker

If the question (or a group of questions) really is "yes/no" or "A or B" with no implications the user needs to think through — e.g. "Worktree or main branch?", "Run tests now?", "Commit now or after the next change?" — the `AskUserQuestion` picker is fine. The picker is for questions that don't benefit from explanation. The moment you find yourself writing a paragraph of context into an option description, switch back to chat.

---

## Subagent: batch everything, return once

If you have any clarifying questions, list **all** of them in your single response output. 

```
I need clarification before I can proceed:

1. The task says "add caching" — should this be in-memory (foundation/cache)
   or Convex-backed (per-user, persistent)?
2. Cache key — user ID alone, or include the workspace ID?
3. TTL — your existing cache layer uses 5min; should this match?

I'll wait for the parent agent to round-trip these.
```

Number them. State your default if you have one. Stop work; do not partially proceed.

---

## When you're spawning a subagent

If your subagent might need clarification, **tell it in the spawn prompt** to batch all questions. Otherwise it may stop after one question and you'll waste a round-trip.

In the spawn prompt:

> If you have clarifying questions, list ALL of them in your single response. Number them and state your default for each.

Then when the subagent returns with questions, you (the parent) decide if you should relay them to the user one at a time per the top-level rule above, or these have their answers in task or are obvious. Then respawn the subagent with the answers folded into the new prompt.

---

## Documenting answers

- If a task file exists: write the answer into the relevant section (decisions, requirements, plan).
- If no task file yet (e.g. early planning): use your todo list, or hold them in chat context.
- Don't keep asking the same question across sessions — if it's a recurring decision, save it as a project memory.
