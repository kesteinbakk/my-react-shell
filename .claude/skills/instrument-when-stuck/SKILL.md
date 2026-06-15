---
name: instrument-when-stuck
description: "Meta-debugging discipline for stubborn UI bugs: stop guessing, lift up the layer, bisect in a controlled harness, instrument before fixing.\nTRIGGER when: a UI bug persists after 2+ 'obvious' fix attempts; fixes ship clean and typecheck but the user reports the bug unchanged; the workaround you're about to ship is one you (or another agent) already shipped elsewhere for the same bug class; a skill or guide describes 'the pattern to apply' and the bug keeps recurring at new sites; the user says 'this keeps happening'; investigating focus loss / unexpected re-renders / mysterious DOM behavior in a component UI; reaching for a fourth theory in a row; OR you are about to form a fix hypothesis on a bug whose file already contains multiple 'Suspected cause' or 'Issue #N — attempted fix #M' sections, OR the bug file's git log shows 2+ prior commits referencing the same bug ID.\nDO NOT TRIGGER when: a single targeted fix is already known to address a confirmed root cause; the bug is reproduced reliably and the failure mode is understood; the bug is small and clearly local to one component."
---

# Instrument When Stuck

The deeper-end companion to `debugging`. When normal fix-and-test cycles aren't converging, the cause is almost always one of two things: **you're patching at the wrong layer**, or **you're guessing instead of measuring**. This skill captures the moves that actually close stubborn bugs.

For the standard cycle (scope → observe → hypothesize → prove → fix), see `debugging`. Read this skill when that cycle has already failed twice.

---

## Prior-art reflex on inherited stuck bugs

When you land cold on a bug that already shows N prior fix attempts — multiple `Issue #N — attempted fix #M` sections, multiple `Suspected cause` lists, or a git log with 2+ commits referencing the bug ID — **your first action is not to read the code and form a hypothesis.** Your first action is to read each prior attempt in full and explicitly write, in the bug file or your task notes:

1. What was each prior agent's hypothesis?
2. What does the user's "still broken" response rule out about each hypothesis?
3. What does your new hypothesis assume that prior hypotheses did not? If the answer is "nothing meaningfully different," you are about to ship the (N+1)th wrong fix — stop and instrument instead.

The failure mode this guards against: fresh-agent overconfidence on stuck bugs (agent walks in cold, treats the bug as a fresh problem, applies first-pass reasoning, ignores prior failure as evidence its mental model is incomplete). Three earlier agents failing is strong Bayesian evidence that the obvious mental model is wrong — weight it accordingly.

Only after the prior-art write-up is on paper, propose a fix.

---

## Lift up — see the system, not just the bug

**The single biggest move.** Read this before anything else.

### The pattern to recognize

You're on attempt 3+ at the same bug. Each fix:
- Looks reasonable for what it touches.
- Typechecks. Diff is small.
- Solves "a" problem (you can describe what it fixes).
- Does NOT solve "the" problem (the user's symptom returns).

The workaround is **spreading**: you've added it to one component, then another, then another, because "this place also has the issue." Maybe you've made a mental list of "places to audit for the pattern."

**Stop.** When a workaround spreads, it's almost never because developers were careless about the pattern — it's because **the abstraction is wrong** and the symptom appears anywhere the abstraction is used. You are patching downstream of the actual cause.

### The move

Go up one or two layers. Ask:

> "What if the thing I'm working around is something I shouldn't have to work around at all?"

Concretely:
- Patching a per-component pattern? Look at the **wrapper hook** the components share.
- Patching a wrapper hook? Look at the **library** it wraps.
- Patching framework integration code? Look at the **framework's documented options** for the behavior you're suppressing.
- Patching downstream effects of a state change? Ask whether the **state change itself is necessary**.

Read **source**, not docs. Look for options, defaults, and design hints the layer was already meant to provide for your case. Frameworks and libraries are often more thoughtful than the workarounds we build on top of them; the right configuration usually exists, just unused.

### When to lift up (low-bar triggers)

- 2+ "obvious" fixes haven't solved it, and you're about to write a third.
- The workaround is itself a "pattern" applied in multiple places. (One: maybe local. Two: smell. Three: definitely lift up.)
- A skill or guide already documents the workaround — and the bug still happens at new sites.
- The user has said "this keeps happening." (Strongest signal in this list.)
- You catch yourself reasoning "developers need to remember to X." Frameworks should make the right thing easy, not the disciplined thing necessary.
- Your fix is structurally complex — extra wrappers, extra components, extra signals just to make data flow correctly. Complex defensive code = wrong default one layer up.

### How to lift up

1. **Read the next layer up.** Source, not docs.
2. **Look for options and defaults.** Skim option types and the comments around them. The knob you need usually already exists.
3. **Build a one-line hypothesis.** "If I set X = Y in [layer], does the bug go away?" If yes, that's your fix candidate.
4. **Verify in a synthetic reproducer first** (see bisection below). Lifting up doesn't excuse you from verification — it just changes where verification happens.
5. **Apply at the right layer, then strip every workaround** that existed only to compensate for the absent option.

### What this is NOT

Not "always rewrite the framework." It is **read up the stack until you find the cheapest layer where the fix is one knob, not a pattern.** Sometimes the cheapest layer is your own component (small bug, local fix — done). Sometimes it is two layers up. The decision is made by reading source, not by guessing.

Rule of thumb:
> **Small, easy bug → quick local rewrite.**
> **Complex bug, OR an "easy fix" not solved within 2-3 tries → think differently. Lift your head up. Complex solutions create bugs. Simple, structured patterns just work.**

A lift-up fix tends to look suspiciously small and delete-heavy: one line of meaningful behavior change at the right layer, plus follow-up commits that delete redundant wrappers, subcomponents, and defensive comments. If your "fix" is hundreds of lines added across many files, you might still be working at the wrong layer. Look up once more.

---

## Bisection in a controlled harness

When the bug resists fix-and-test (multiple attempted fixes haven't worked, theories keep failing), the reliable path is **incremental bisection of a controlled harness, with verification in the real failing scenario after every claimed result.**

### Shape

1. **Find a working baseline.** Strip the failing scenario down to the smallest setup where the symptom does NOT occur. This is `LEVEL 0`.
2. **Find the FULL failing scenario.** The ceiling. Confirmed-broken in the real app.
3. **Build a single bisection harness.** ONE test route, ONE file, ONE constant or toggle that picks which level is active. All variants live in the same file.
4. **Add ONE element at a time** between baseline and full. Each level adds the minimum independent unit (a wrapper, a context provider, a query subscription, a layout).
5. **Verify in the harness after every level change.** User-tested, logs captured, status recorded.
6. **Stop the moment a level reproduces the failure.** That level contains the cause. Bisect within if needed.
7. **Apply the fix to the real system, then verify in the real system.** Isolation success is not the same as confirmed root cause (see "Isolation ≠ root cause" below).

This feels slow when each level passes. It is by far the fastest known path to a confirmed cause for stubborn UI bugs. Theories examined without this discipline are wasted time at best, harmful at worst (shipping non-fixes, polluting skills with false patterns).

### Harness recipe — do all of this

```ts
// /dev/test/<bug>-bisect.tsx — single file, edit in place between iterations.
const CHROME_LEVEL: 0 | 1 | 2 | 3 | 4 | 5 = 0;

// Status table — keep this current as you bisect:
//   0 = baseline (no chrome)                 [confirmed: WORKS]
//   1 = + AppShell + ShellPageHeader         [confirmed: WORKS]
//   2 = + outer <Show when={!isLoading()}>   [not yet tested]
//   3 = + ...                                [not yet tested]
//   FULL = real /sites/[id]/card             [confirmed: DIES]
```

1. **One stable URL** the user tests every iteration. No confusion about which version they're testing.
2. **Register the route in the project's test index** (e.g. `dev/test/index.tsx`) so the user can re-find it. Update the description as the bisection progresses.
3. **One constant at the top of the file.** All levels live in `if (CHROME_LEVEL === N)` branches in one render function. Switching levels = changing one digit.
4. **Explicit `not implemented yet` guard** for unbuilt levels — protects against (a) flipping past what you've coded and seeing a confusing blank page; (b) testing stale code while believing you're testing a new level.
5. **In-file status table** comment with `[confirmed: WORKS]` / `[FAILS]` / `[not yet tested]` tags — the audit trail. A future agent opens the file and immediately knows the bisection state.
6. **Per-level entries in the task list.** The in-file table and the task list serve the same purpose at different scopes; both are needed because session context can be lost or compacted.
7. **One change per level.** If you can't reason about exactly which addition caused the next level to fail, the level was too big — split into 5a, 5b, 5c.
8. **Each test turn**: change the constant, optionally add the new branch, typecheck, ask user to test, capture result, update the table + task list, commit.

Skipping the registered test path, the not-implemented guard, the in-file status table, OR the task list will eventually reintroduce the confusion this discipline exists to prevent.

---

## Bisection-up vs bisection-down

The harness above is **bisection-up**: start from a known-working baseline, add chrome layers until something breaks.

**Bisection-down** is the complement: start from the real failing scenario, remove pieces until something works. The first removal that makes the bug go away contains the cause.

| Bisection-UP (synthetic harness) | Bisection-DOWN (real page) |
|----------------------------------|---------------------------|
| Bug needs only a few well-defined layers to reproduce | Bug needs the full real environment to reproduce |
| Real chrome is hard to replicate (route lifecycle, focus management, framework lifecycle) | Real chrome can be temporarily disabled in place |
| You want a clean, repeatable harness for future regressions | You want the fastest path to a single one-off cause |
| Each layer is small and orthogonal | Removing pieces is straightforward (toggle props, replace components with `<div>{children}</div>`) |

Often the right move is **both** — bisection-up to find the smallest synthetic reproducer, bisection-down to confirm in the real environment. They converge on the same truth from opposite ends.

**Critical limitation of synthetic harnesses:** they cannot perfectly replicate real route lifecycle. Real route-param changes trigger route-layout remount with natural cleanup→push of registration hooks (`useDynamicPages`, `useSearch`, etc.). Synthetic tests using search-param navigation keep components mounted; the hook re-runs but the key differs → registrations stack rather than replace. This drift may or may not matter for the specific bug, but you cannot tell from the synthetic test alone.

The honest version of step 7 ("apply fix in real system, verify in real system") is therefore: **always finish in the real environment.** Synthetic narrows the search; real verification crowns it.

When in doubt about whether a synthetic harness is reproducing the right thing, switch to bisection-down. It's faithful by definition.

---

## Isolation ≠ root cause confirmed

A common trap:

1. You bisect by stripping context. At some level you find the failure reproduces.
2. You strip MORE context (e.g. add a workaround inside). The test passes.
3. You declare: "the last thing I changed is the cause."
4. You apply that change to the REAL system.
5. The bug persists.

What you actually confirmed: "the workaround is sufficient *in isolation*." You did NOT confirm "the workaround is sufficient *in the real context*." Real context has additional reactive paths the isolation lacked — different parents, sibling components, more active subscriptions, layout chrome. Any of those can re-introduce the failure even after the isolated test passes.

**Rule:** before declaring a root cause confirmed, verify the proposed fix in the **real system**. Isolation tests narrow the search space — they do not crown a winner. The crowning happens when applying the fix to the real codebase makes the real bug go away.

Workflow:

1. Run isolation tests to NARROW.
2. Apply the candidate fix to the real system.
3. Verify on the real failing scenario.
4. ONLY THEN claim confirmed root cause.
5. ONLY THEN update skills/guides with the finding.

Do not skip step 3 because the isolation test was satisfying.

---

## The premature-elimination trap

You have context about the system. You know area X is connected to the bug surface. You reason: "the visible change in X (e.g. title text) doesn't fire on this scenario, so X can't be the cause." You eliminate X and look elsewhere.

**This is the trap.** "X" is rarely a single thing — it's an area with multiple reactive paths. The path you reasoned about (the visible one) might not fire; but other paths in the same area (sibling lists, registration callbacks, derived counters, focus-trap setup, portal mounts) might fire on EVERY save because they read other reactive deps that always update.

**Rule:** when you've ruled out an area, write down WHICH reactive dependencies in that area you've actually traced. Anything you haven't traced is still a candidate. "I ruled out the breadcrumb" is sloppy; "I ruled out the breadcrumb's title binding (it doesn't depend on the field being saved)" is precise — and leaves the dropdown's siblings binding still on the table.

### Plausible new insight ≠ confirmed cause

A second variant: when you (or the user) get a fresh insight mid-debug — "oh, the breadcrumb has a dropdown!" — there is enormous temptation to skip the verification step. The new insight feels like it explains things; the previous theories are fading; running the test feels like ceremony.

**Run the test anyway.** Verifying a new theory takes minutes; carrying it forward unverified pollutes everything that comes after. Old theories earn elimination by failing a targeted test. New theories earn promotion the same way.

---

## End-to-end picture before isolation

Before you can isolate parts of a system, you need a complete map of "what is connected to what" — not just the visible UI structure, but the **reactive/render graph**. Map it in your framework's terms (SolidJS shown; React analogues in brackets):

- Every Convex subscription (`useConvexQuery` / `useQuery`) is a node. After any Convex mutation, Convex re-validates ALL active subscriptions — every node potentially fires.
- Every derivation/effect that reads a query result is a downstream node — Solid `createEffect` / `createMemo` / `<Show>` / `<For>` [React `useEffect` / `useMemo` / conditional render].
- Every registration hook (`useDynamicPages`, `useSearch`, or any project-defined registration into shared context) reads from somewhere and writes a global/context state other components read.
- Every headless-UI primitive (Solid: Kobalte; React: Radix / Headless UI) — DropdownMenu, Dialog, Popover, FocusScope — has its own lifecycle and may move focus, set `inert`, mount portals.

Walk this graph from "user action" to "every rendered UI element on the page" before you start fixing. List every reactive dep that *could* fire on the user's action, not just the ones whose visible effect you've already noticed.

When you can't enumerate the graph, instrument broadly *first* (recipe below), then narrow — instead of narrowing too early based on what you assume is connected.

---

## Instrumentation recipe (start light, add layers)

For browser-side capture use `devLog()` + `dev log <short>` (see `debugging`). For ad-hoc DOM/event probing, drop in a temporary diagnostic wrapper.

**Round 1 — Lifecycle + the obvious target.** Wrap the suspected element with mount/cleanup logs (Solid `onMount`/`onCleanup`; React `useEffect` + its cleanup) and `focusin` / `focusout` listeners (or whatever event is being lost). If MOUNT/UNMOUNT fires, you have a remount — fix the unmount cause. If not, go to round 2.

**Round 2 — DOM mutations.** `MutationObserver` with `childList: true, subtree: true`. Log every removed/added node with parent + node description. Find which element is being mutated.

**Round 3 — Attribute changes.** Extend with `attributes: true, attributeOldValue: true`. Filter to suspected attributes (`disabled`, `readonly`, `tabindex`, `inert`, `hidden`, `class`); if nothing fires, **remove the filter** and log all attribute changes.

**Round 4 — Method interception.** Monkey-patch `HTMLElement.prototype.blur` (and/or `.focus`) globally to log every call with `new Error().stack`. The stack tells you exactly which code triggered it.

**Round 5 — Look up the tree.** Move the diagnostic wrapper UP — parent, then grandparent. Observe attribute changes on `document.body` and `document.documentElement` (an `inert` on `<body>` blurs every descendant). Add document-level capture-phase listeners (`addEventListener("focusin", h, true)`) — these catch events that wouldn't bubble through your local wrapper.

**Round 6 — Frame-by-frame state.** Poll `document.activeElement` every 16ms and log when it changes. Catches focus transitions that bypass conventional events.

**Round 7 — Window/tab events.** `window.addEventListener("blur", …)` to detect tab/window focus loss masquerading as element blur (devtools opening, browser notifications).

After each round: read the log, decide what's next based on what showed up, do NOT skip rounds. The temptation to skip to "obviously round 6" because your theory says so is the trap.

### Drop-in diagnostic wrapper

*(SolidJS shown — for React, do the same wiring inside a `useEffect` with a ref. The `MutationObserver` and the global `blur` interceptor are framework-agnostic DOM.)*

```tsx
function FocusDiag(props: { children: any }) {
  let ref: HTMLDivElement | undefined;
  const t0 = performance.now();
  const log = (m: string) => console.log(`[focusdiag +${Math.round(performance.now() - t0)}ms] ${m}`);

  onMount(() => {
    log("MOUNT");
    ref?.addEventListener("focusin", (e) => log(`focusin: ${(e.target as HTMLElement).tagName}`));
    ref?.addEventListener("focusout", (e) =>
      log(`focusout → next=${(document.activeElement as HTMLElement)?.tagName}, relatedTarget=${(e as FocusEvent).relatedTarget ? "non-null" : "null"}`));

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        const tag = m.target.nodeName;
        if (m.type === "attributes") {
          log(`ATTR <${tag}> ${m.attributeName}: "${m.oldValue}" → "${(m.target as HTMLElement).getAttribute(m.attributeName!)}"`);
          continue;
        }
        m.removedNodes.forEach(n => log(`- ${tag}: ${n.nodeName}`));
        m.addedNodes.forEach(n => log(`+ ${tag}: ${n.nodeName}`));
      }
    });
    if (ref) mo.observe(ref, { childList: true, subtree: true, attributes: true, attributeOldValue: true });
    onCleanup(() => mo.disconnect());
  });
  onCleanup(() => log("UNMOUNT"));
  return <div ref={ref}>{props.children}</div>;
}

// Global blur interceptor — catches `.blur()` calls anywhere
const protoBlur = HTMLElement.prototype.blur;
HTMLElement.prototype.blur = function () {
  console.log(`BLUR on <${this.tagName}>`, new Error().stack);
  return protoBlur.apply(this);
};
```

---

## Process tells — stop and switch to instrumentation

- "I bet this is the cause" — and you've said this twice already.
- You're about to refactor a third place to "see if it helps."
- You've been editing for 30+ minutes without running the failing scenario.
- The fixes you're shipping involve speculative architectural changes (extracting hooks, adding bridges, lifting state) rather than targeted patches against a known mechanism.
- The user has said "still broken" or equivalent more than once on the same bug.

Two of these true: stop. Instrument.

---

## Hard rules

1. **Do not document a theory as a confirmed cause in any skill or guide until the bug is fixed and the cause is verified.** Skills are cited by future agents who treat them as authoritative.
2. **Do not ship a fix you cannot verify before claiming it's done.** "It typechecks" is not verification. "The user has to test it again" is not verification. Verification means a reproducer that fails before and passes after.
3. **When 2+ theory-based fixes have not solved it, switch to instrumentation.** Stop writing fixes. Start collecting data.
4. **If the reproducer doesn't reproduce the bug, your model of the bug is wrong.** Don't ship more fixes based on the wrong model. Either improve the reproducer until it matches, or instrument the real app directly.
5. **Instrument incrementally — and start broader than your hypothesis.** Each round of logs that returns "nothing of note where you looked" should widen the observation surface, not narrow it.

---

## Cross-references

- `debugging` — the standard cycle. Read it first; this skill is the escalation path.
- `suspense-focus-loss` *(SolidJS)* — the structural trap class this skill exists to defuse. For *patterns* around `createResource` + Suspense use that skill; for *process* when those patterns aren't enough, use this one.
- `hydration-errors` *(SolidJS/SSR)* — same shape of "test, don't theorize" applied specifically to hydration.
