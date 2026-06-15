---
name: debugging
description: "Systematic debugging methodology, including the `dev log` + `devLog()` browser-capture loop.\nTRIGGER when: fixing bugs, debugging issues, something is 'broken' or 'not working', investigating unexpected behavior, or needing to see what happened in the browser during a specific user action.\nDO NOT TRIGGER when: writing new features without debugging context."
---

# Debugging

## Golden Rule

**NEVER implement a fix until you have CONFIRMED the root cause with proof.**

A theory is NOT proof. Code that "looks wrong" is NOT proof. Your confidence is NOT proof.

**Proof is:** captured `devLog()` output, console output showing actual values, test page isolating issue, database query results, network tab data.

---

## The Cycle

```
SCOPE → OBSERVE → HYPOTHESIZE → PROVE → FIX
```

### 1. Scope (CRITICAL - Do First)

Before ANY investigation:

```
SCOPE ASSESSMENT:
- Failing: [specific thing]
- Working: [similar things that work]
- Scope: [app / route / component / function]
- Implication: [what this rules OUT]
```

**If similar code works, that shared infrastructure is NOT the problem.**

### 2. Observe

Gather without conclusions:
- Read error messages, stack traces
- Check console (browser + server)
- Check network requests/responses
- Note what similar code IS working

### 3. Hypothesize

Form ONE specific, testable hypothesis:
- "I suspect X is null at line Y"
- Use tentative language: "I suspect...", "This might be..."

### 4. Prove

**First: Design falsification test** — "What would DISPROVE this?"

| Hypothesis | Falsification Test |
|------------|-------------------|
| Data is stale in memory | Refresh page — data should be correct |
| Race condition | Add 10s delay — bug should disappear |
| API not called | Network tab should show no request |
| Record missing | SELECT query should return no rows |

**Run falsification test FIRST.** If it proves you wrong → new hypothesis.

**Then: Gather confirming evidence.** For browser-side proof, the standard flow is: add `devLog()` calls at suspected points, ask the user to run `dev log <short>` and reproduce, then read the captured file (see "Browser Debug Capture" below). For server-side or DB-side proof, use `serverLog`, SQL queries, or test pages.

### 5. Fix (Only After Confirmation)

1. Implement minimal fix
2. Remove temporary `devLog()` / `useDebugLog` calls added for this investigation
3. Trigger the failing scenario again — for browser-side, ask the user to repeat the `dev log` reproduction; for server-side, exercise the code path
4. Confirm the captured evidence shows the fixed behavior
5. Report findings with evidence

---

## Verification tiers

Not all positive signals confirm a fix. Three tiers, increasing in epistemic weight:

| Tier | Examples | What it proves |
|------|----------|----------------|
| **Code-level** | typecheck passes, build passes, unit test passes, lint passes | The code compiles and adheres to declared types. Says nothing about runtime correctness. |
| **Render-level** | element exists in DOM, has expected class, `getBoundingClientRect` plausible, `scrollWidth > clientWidth`, `element.scrollLeft = N` assignment succeeds, computed style matches expectation | The rendered structure matches the intended structure. Says nothing about user-driven behavior. |
| **Behavior-level** | the symptom the user reported as broken now works *the way the user reported it as broken* — wheel-scroll moves content, form submission completes the cross-origin POST, focus actually transfers, click handler fires the side effect, etc. | The bug is gone. |

**Rule for behavior bugs:** a fix may be marked Resolved only after a behavior-level signal. Render-level signals are necessary preconditions for the agent to *believe* the fix is plausible; they are not sufficient for closure. If you cannot collect a behavior-level signal yourself (e.g. because the bug requires the user's real browser environment), the closure act is the user's, not yours — write `Status: Awaiting user confirmation` and ask. This is the universal bug-closure rule (`~/Developer/CLAUDE.md` "Other Rules"); the Zingularis ecosystem additionally enforces it with a `PreToolUse` hook on `docs/3-bugs/` files.

**Why this matters:** `element.scrollLeft = 1500` always succeeds at the DOM API level regardless of whether wheel/touch/drag works. `scrollWidth > clientWidth` only proves content is wider than the element — not that overflow-scroll is engaged for the user. The MCP preview is a different rendering environment than the user's actual browsers; positive render-level signals in the preview do not transfer.

To produce a behavior-level signal in the MCP preview (when feasible), simulate the user input itself — `dispatchEvent(new WheelEvent("wheel", { deltaX: 100, bubbles: true }))` and then read the resulting `scrollLeft`. Assigning `scrollLeft` is not equivalent to dispatching the event that should drive it.

---

## Browser Debug Capture (`dev log` + `devLog`) — primary

When you need to see what happened in the browser during a specific user action — a click, a form save, a navigation — a windowed browser-capture log is the first tool to reach for. It replaces "the user copies devtools console output and pastes it into chat" with "the user runs one command, you read one file." The command, helper, and paths below are the **Zingularis ecosystem instance** (`dev log` + foundation `devLog` → `~/Developer/zingularis/logs/`); a project outside that ecosystem uses its own equivalent (check its CLAUDE.md — e.g. a local `devLog()` writing to the project's `logs/`). The *pattern* is what transfers.

### The loop

1. You ask the user to reproduce the bug.
2. The user runs `dev log <short>` in a terminal. The script wipes `~/Developer/zingularis/logs/debug-<short>.log` and starts tailing it.
3. The user does the exact action that triggers the bug.
4. The user presses Ctrl-C. The file is left on disk.
5. **You** read `~/Developer/zingularis/logs/debug-<short>.log`. It contains ONLY events from that reproduction window.
6. You form a hypothesis. If you need more visibility, add more `devLog()` calls and ask the user to repeat steps 2–4.

Use this whenever the question is *"what was the state / what fired / in what order, during this action?"*

### Hard rules

- **Never run `dev log` yourself.** Starting it wipes the file. Only the user starts it; the wipe is the whole point — it bounds the captured log to the user's reproduction window.
- **The file persists after Ctrl-C.** Reading it does not wipe it. You can re-read freely. The next `dev log` invocation wipes it for the next round.
- **`devLog()` is DEV-only and browser-only.** It no-ops in SSR and production builds. Don't use it for production observability.

### Adding `devLog()` to code

```ts
import { devLog } from "~/foundation/lib/devLog"; // Zingularis path; use your project's devLog elsewhere

devLog("submit clicked", { formId, dirty });
devLog.debug("loaded prefs", prefs);
devLog.info("auth state changed", { userId, role });
devLog.warn("retrying request", { attempt });
devLog.error("save failed", { code });
```

- `devLog(msg, data?)` is the default. Level shortcuts: `.debug / .info / .warn / .error`.
- `data` is JSON-stringified onto the same line. Pass plain objects, not stack traces. (Uncaught errors don't need manual logging — `installDevErrorReporter` already routes those via the `[CLIENT-ERR]` channel.)
- No dedup — debug logs are intentional and may repeat. (Contrast with `reportDevWarning` in `devBridge`, which dedups missing-icon / missing-i18n events.)

### Temporary vs permanent

| Situation | Do this |
|-----------|---------|
| Investigating a bug, need to see intermediate state | Add `devLog()` calls at the suspected points. **Remove them after the bug is fixed** (see Cycle step 5). |
| A code path is genuinely hard to reason about and would benefit from permanent capture-eligibility | Use `useDebugLog(category)` instead — that's the right tool for ongoing instrumentation. See "Categorized Tracing" below. |

### File line format

```
<ISO-timestamp> info clicked submit {"formId":"site-name","dirty":true}
```

ISO timestamp, level, message, optional JSON data. One event per line.

### Reading the file

Just `Read` it. For a long capture, look at the tail-most lines first (`tail -n 200` via Bash) — most recent events are usually most relevant.

### What does NOT belong here

- Server-side logs (Convex, Vinxi, API routes) — those go through `serverLog` and surface via `dev watch` / `dev analyze`. The bridge is browser-to-file only.
- Network requests — use Chrome DevTools MCP / network panel.
- Production tracing — `devLog` is dev-only.

---

## Categorized Tracing (`useDebugLog` / `serverLog`)

*(Zingularis/Foundation infrastructure — a project without foundation uses its own categorized logger, or plain `devLog`. The "never raw `console.log`" rule still holds.)*

**Never use raw `console.log` for debug instrumentation.** Pick the right tool:

- `devLog()` — windowed browser capture for a specific action (see above). Default for "let me see what happened."
- `useDebugLog(category)` — ongoing categorized browser-side tracing. Lands in browser console; toggled via `setDebugConfig`. Use when an instrumentation is permanent and category-gated.
- `serverLog(category)` — server-side equivalent. Lands in stdout / service logs / `dev watch`.

```typescript
// Frontend (categorized)
import { useDebugLog } from '~/foundation/hooks/useDebugLog';
const log = useDebugLog('frontend');
log.info('Checkpoint', { userId, state });

// Backend
import { serverLog } from '~/foundation/lib/debug/serverLog';
const log = serverLog('backend');
log.info('Request', { params });
```

Categories are configured in `src/lib/debug/config.ts`. Foundation ships:

- `backend` — default on. Server-side API route logs.
- `frontend` — default off. Generic client-side bucket; flip on in your project's `debugConfig` when debugging.
- `foundation-state` / `foundation-storage` / `foundation-theme` / `foundation-translations` — default off. Foundation component chatter (spinners, StoreManager, theme sync, locale changes).

For project-specific debugging, extend `LogCategory` with your own categories (e.g. `auth`, `provider-app-state`) rather than reusing the generic buckets — makes it easy to silence unrelated noise.

### Flipping a category for a debug session

To surface a quiet category, set its `consoleLog: true` in `src/lib/debug/config.ts` (the per-category toggle inside `debugConfig.categories`; `setDebugConfig(debugConfig)` at the bottom applies it). **Restore the original value when the bug closes** — a left-on toggle is noise for the next agent and the next session. The toggle gates only `DEBUG`/`INFO`; `WARN`/`ERROR` always emit regardless, so flipping a category off can never hide a warning or error.

`useDebugLog` lands in the browser console. Read via Chrome DevTools MCP `list_console_messages` if you need it; otherwise prefer `devLog()` + `dev log` for ad-hoc captures.

---

## Breakpoint Debugging (For Timing/Race Conditions)

**When `dev log` analysis fails after 2–3 attempts, switch to breakpoints.** The threshold is lower than the old `console.log + copy-paste` workflow because `dev log` makes log analysis far more reliable — but breakpoints are still the right escalation for:

- Race conditions between async systems (WebSocket + reactive framework + auth)
- HMR / component lifecycle timing issues
- Framework internal interactions (framework reactivity / render cycle, Convex WebSocket)

### Adding breakpoints

Insert `debugger;` statements at key state transition points (SolidJS lifecycle shown; in React use `useEffect` bodies / cleanup functions):

```typescript
// In cleanup handlers — WHO is triggering this?
onCleanup(() => {
  console.error('[Component] onCleanup — check call stack');
  debugger;
  cleanup();
});

// In effects — WHY did this value change?
createEffect(() => {
  const value = someSignal();
  if (unexpectedCondition) {
    debugger; // Inspect call stack and surrounding state
  }
});
```

### Strategy

1. **Identify 3–4 key state transitions** in the flow (init, auth set, cleanup, error catch)
2. **Add `debugger;` at each point** — the browser pauses when DevTools is open
3. **Guard breakpoints** to skip expected occurrences:
   ```typescript
   // Only break when token was valid then cleared (not initial null)
   if (wasAuthenticated()) {
     debugger;
   }
   ```
4. **Read the call stack** — it shows exactly what triggered the transition
5. **Remove all `debugger;` statements** after the investigation

### With user assistance

Ask the user to refresh with DevTools open and report the call stack at each breakpoint. This reveals the actual execution path — far more reliable than hypothesizing from logs.

### With browser access (Chrome DevTools MCP)

For browser-side breakpoint inspection, prefer Claude Desktop preview (`preview_eval` to add `debugger;` calls dynamically, `preview_logs` for output). Chrome DevTools MCP is the escalation path — only when the user explicitly asks. See the `browser-tools` skill for both.

### Logs vs. breakpoints

**Don't iterate on hypotheses from logs when you can observe the actual state.** If two log-driven attempts haven't cracked it, switch tools — a breakpoint or `debugger;` reveals real values without another redeploy cycle.

---

## When This Cycle Isn't Converging

If you've shipped 2+ fix attempts and the user reports the bug is unchanged — or you find the same workaround spreading to multiple components — switch to `instrument-when-stuck`. **Also switch to it when the bug file already shows 2+ prior fix attempts in its `Issue #N — attempted fix #M` sections, even if this is your first edit:** prior failures are evidence your one-shot hypothesis is probably wrong, and the "Prior-art reflex on inherited stuck bugs" section there is the right entry point. That skill covers the meta-moves: lift up to the right layer, build a single-file bisection harness, separate isolation success from confirmed root cause.

---

## Quick Checks (Before Deep Investigation)

### Route File + Folder Collision (SolidStart)

#1 cause of "blank page, no errors":

```
src/routes/
├── foo.tsx      ← Becomes LAYOUT if foo/ exists!
└── foo/
    └── [id].tsx
```

Fix: Move `foo.tsx` → `foo/index.tsx`

### Hydration Mismatch

Content flashes then disappears → see `hydration-errors` skill for full debugging protocol.

---

## Common Failures

| Failure | What Goes Wrong | Correct Approach |
|---------|-----------------|------------------|
| "Looks wrong, I'll fix it" | No proof code actually executes with wrong values | Add `devLog()` to verify |
| "Error says X, so X is problem" | Error messages can mislead | Query DB, check actual state |
| "Fix multiple things at once" | Can't tell what worked | One hypothesis at a time |
| Ignoring what works | Blame shared infrastructure that other code uses fine | Compare working vs broken |
| "Please verify" without checking — OR render-level proof read as behavior-level | User tests, you don't know result — OR you collected `scrollWidth`, `scrollLeft = N` succeeded, computed style looks right, and concluded the bug is fixed | Read `debug-<short>.log` / server logs yourself; for behavior bugs, require a behavior-level signal (see "Verification tiers" above) |
| "Please paste the console logs" | Lossy, manual, interrupts the user | Ask user to run `dev log <short>` and reproduce; read `logs/debug-<short>.log` yourself |

---

## Approval

**No approval needed:** Adding `devLog()` / `useDebugLog`, reading files / logs / DB, creating test pages, running typecheck / build

**Approval required:** Implementing any fix (present hypothesis + evidence first)
